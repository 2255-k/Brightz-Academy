"""
Payment views and webhook processing for Bright Mindz Academy.
"""

import json
import logging
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from rest_framework import views, status, permissions
from rest_framework.response import Response

from apps.courses.models import Course
from apps.payments.models import Order, PaymentTransaction
from apps.payments.gateway import RazorpayGateway
from apps.enrollments.models import Enrollment
from apps.audit.models import AuditEvent

logger = logging.getLogger(__name__)

class CreatePaymentOrderView(views.APIView):
    """
    Creates an internal Order and initiates upstream Razorpay checkout.
    Price is securely calculated exclusively from trusted database records.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        course_id = request.data.get('course_id')
        course_slug = request.data.get('course_slug')

        if not course_id and not course_slug:
            return Response(
                {'error': 'course_id or course_slug is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if course_id:
            course = get_object_or_404(Course, id=course_id, publication_status=Course.STATUS_PUBLISHED)
        else:
            course = get_object_or_404(Course, slug=course_slug, publication_status=Course.STATUS_PUBLISHED)

        student = request.user

        # Prevent duplicate active enrollment
        existing_enrollment = Enrollment.objects.filter(
            student=student,
            course=course,
            status=Enrollment.STATUS_ACTIVE
        ).first()

        if existing_enrollment and existing_enrollment.is_valid:
            return Response(
                {'error': 'You already have active enrollment access to this course.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Server-enforced pricing
        amount = course.effective_price

        # Create fresh pending Order
        order = Order.objects.create(
            student=student,
            course=course,
            amount=amount,
            currency='INR',
            gateway=Order.GATEWAY_RAZORPAY,
            status=Order.STATUS_PENDING
        )

        gateway = RazorpayGateway()
        gateway_res = gateway.create_gateway_order(order)

        if not gateway_res.get('success'):
            order.status = Order.STATUS_FAILED
            order.save(update_fields=['status'])
            return Response(
                {'error': 'Could not initialize payment gateway order. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        order.gateway_order_id = gateway_res['gateway_order_id']
        order.save(update_fields=['gateway_order_id'])

        AuditEvent.log_event(
            user=student,
            action='ORDER_CREATED',
            details={
                'order_reference': str(order.order_reference),
                'course_id': course.id,
                'amount': str(amount),
                'gateway_order_id': order.gateway_order_id,
            },
            request=request
        )

        return Response({
            'order_reference': str(order.order_reference),
            'gateway_order_id': order.gateway_order_id,
            'amount': float(amount),
            'amount_paise': order.amount_in_subunits,
            'currency': order.currency,
            'key_id': gateway_res['key_id'],
            'course': {
                'id': course.id,
                'title': course.title,
                'teaching_language': course.teaching_language.name,
            },
            'student': {
                'name': student.get_full_name() or student.username,
                'email': student.email,
                'phone': student.phone_number,
            },
            'is_mock_sandbox': gateway_res.get('is_mock_sandbox', False),
        }, status=status.HTTP_201_CREATED)


class VerifyPaymentView(views.APIView):
    """
    Verifies payment signature and provisions course enrollment inside an atomic transaction.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_reference = request.data.get('order_reference')
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')

        if not order_reference or not razorpay_payment_id:
            return Response(
                {'error': 'order_reference and razorpay_payment_id are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order = get_object_or_404(Order, order_reference=order_reference, student=request.user)

        # Idempotent response if already completed
        if order.status == Order.STATUS_COMPLETED:
            enrollment = Enrollment.objects.filter(student=request.user, course=order.course).first()
            return Response({
                'message': 'Payment already verified and course is active.',
                'order_status': order.status,
                'course_slug': order.course.slug,
                'enrollment_id': enrollment.id if enrollment else None,
            }, status=status.HTTP_200_OK)

        # Verify signature with Razorpay gateway adapter
        gateway = RazorpayGateway()
        is_valid = gateway.verify_payment_signature(
            razorpay_order_id=razorpay_order_id or order.gateway_order_id,
            razorpay_payment_id=razorpay_payment_id,
            razorpay_signature=razorpay_signature
        )

        if not is_valid:
            # Record failed attempt
            PaymentTransaction.objects.create(
                order=order,
                gateway_payment_id=razorpay_payment_id,
                gateway_signature=razorpay_signature or '',
                amount=order.amount,
                status=PaymentTransaction.STATUS_FAILED,
                error_code='INVALID_SIGNATURE',
                error_description='Cryptographic signature verification failed.'
            )
            order.status = Order.STATUS_FAILED
            order.save(update_fields=['status'])

            AuditEvent.log_event(
                user=request.user,
                action='PAYMENT_SIGNATURE_FAILED',
                details={'order_reference': str(order.order_reference), 'payment_id': razorpay_payment_id},
                request=request
            )

            return Response(
                {'error': 'Payment verification failed. Invalid gateway signature.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Atomic provision of payment transaction and course enrollment
        with transaction.atomic():
            order.status = Order.STATUS_COMPLETED
            order.save(update_fields=['status', 'updated_at'])

            PaymentTransaction.objects.create(
                order=order,
                gateway_payment_id=razorpay_payment_id,
                gateway_signature=razorpay_signature or '',
                amount=order.amount,
                status=PaymentTransaction.STATUS_SUCCESS,
                raw_payload=request.data
            )

            # Determine expiry date
            expires_at = None
            if order.course.access_duration_days > 0:
                expires_at = timezone.now() + timedelta(days=order.course.access_duration_days)

            enrollment, _ = Enrollment.objects.update_or_create(
                student=request.user,
                course=order.course,
                defaults={
                    'order': order,
                    'status': Enrollment.STATUS_ACTIVE,
                    'enrolled_at': timezone.now(),
                    'expires_at': expires_at,
                }
            )

            AuditEvent.log_event(
                user=request.user,
                action='ENROLLMENT_ACTIVATED',
                details={
                    'order_reference': str(order.order_reference),
                    'course_id': order.course.id,
                    'course_title': order.course.title,
                    'payment_id': razorpay_payment_id,
                },
                request=request
            )

        return Response({
            'message': 'Payment verified successfully! You now have full access to this course.',
            'order_reference': str(order.order_reference),
            'order_status': order.status,
            'course_slug': order.course.slug,
            'course_title': order.course.title,
            'enrollment_id': enrollment.id,
        }, status=status.HTTP_200_OK)


class RazorpayWebhookView(views.APIView):
    """
    Asynchronous Webhook handler for Razorpay server-to-server notifications.
    Verifies raw request body signature against RAZORPAY_WEBHOOK_SECRET.
    Guarantees idempotent processing.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        signature = request.headers.get('X-Razorpay-Signature', '')
        raw_body = request.body

        gateway = RazorpayGateway()
        if not gateway.verify_webhook_signature(raw_body, signature):
            logger.warning("Rejected invalid Razorpay webhook signature.")
            return Response({'error': 'Invalid webhook signature.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payload = json.loads(raw_body.decode('utf-8'))
        except Exception:
            return Response({'error': 'Malformed JSON payload.'}, status=status.HTTP_400_BAD_REQUEST)

        event = payload.get('event')
        payment_entity = payload.get('payload', {}).get('payment', {}).get('entity', {})
        gateway_order_id = payment_entity.get('order_id')
        payment_id = payment_entity.get('id')

        if event in ('payment.captured', 'order.paid') and gateway_order_id:
            try:
                order = Order.objects.get(gateway_order_id=gateway_order_id)
                if order.status != Order.STATUS_COMPLETED:
                    with transaction.atomic():
                        order.status = Order.STATUS_COMPLETED
                        order.save(update_fields=['status'])

                        PaymentTransaction.objects.get_or_create(
                            order=order,
                            gateway_payment_id=payment_id,
                            defaults={
                                'amount': order.amount,
                                'status': PaymentTransaction.STATUS_SUCCESS,
                                'raw_payload': payload,
                            }
                        )

                        expires_at = None
                        if order.course.access_duration_days > 0:
                            expires_at = timezone.now() + timedelta(days=order.course.access_duration_days)

                        Enrollment.objects.update_or_create(
                            student=order.student,
                            course=order.course,
                            defaults={
                                'order': order,
                                'status': Enrollment.STATUS_ACTIVE,
                                'enrolled_at': timezone.now(),
                                'expires_at': expires_at,
                            }
                        )
            except Order.DoesNotExist:
                logger.error("Webhook received for unknown gateway_order_id: %s", gateway_order_id)

        return Response({'status': 'acknowledged'}, status=status.HTTP_200_OK)


class StudentOrderHistoryView(views.APIView):
    """List student's purchase and order history."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(student=request.user).select_related('course').order_by('-created_at')
        data = [
            {
                'order_reference': str(o.order_reference),
                'course_title': o.course.title,
                'course_slug': o.course.slug,
                'amount': float(o.amount),
                'currency': o.currency,
                'status': o.status,
                'created_at': o.created_at.isoformat(),
            }
            for o in orders
        ]
        return Response(data)
