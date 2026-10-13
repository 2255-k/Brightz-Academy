"""
Automated tests for Payment Order Creation, Signature Verification, and Enrollment Provisioning.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.courses.models import TeachingLanguage, Course
from apps.payments.models import Order
from apps.enrollments.models import Enrollment

User = get_user_model()

class PaymentWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = User.objects.create_user(
            username='student1',
            email='student1@test.com',
            password='Password123!'
        )
        self.client.force_authenticate(user=self.student)

        self.language = TeachingLanguage.objects.create(name='Malayalam', code='ml')
        self.course = Course.objects.create(
            title='Kerala Spoken English',
            slug='kerala-spoken-english',
            price=2999.00,
            discount_price=1499.00,
            teaching_language=self.language,
            publication_status=Course.STATUS_PUBLISHED
        )

    def test_order_creation_enforces_server_price(self):
        # Frontend cannot inject or lower the price
        res = self.client.post('/api/payments/create-order/', {
            'course_id': self.course.id,
            'amount': 1.00  # Attempted price forgery
        }, format='json')

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        # Server must enforce effective_price of ₹1499.00
        self.assertEqual(res.data['amount'], 1499.00)
        self.assertEqual(res.data['currency'], 'INR')

        order = Order.objects.get(order_reference=res.data['order_reference'])
        self.assertEqual(order.amount, 1499.00)
        self.assertEqual(order.status, Order.STATUS_PENDING)

    def test_payment_verification_activates_enrollment(self):
        # 1. Create order
        order_res = self.client.post('/api/payments/create-order/', {
            'course_id': self.course.id
        }, format='json')
        order_ref = order_res.data['order_reference']
        gateway_order_id = order_res.data['gateway_order_id']

        # Ensure no enrollment before payment
        self.assertFalse(Enrollment.objects.filter(student=self.student, course=self.course).exists())

        # 2. Submit payment verification
        verify_res = self.client.post('/api/payments/verify/', {
            'order_reference': order_ref,
            'razorpay_order_id': gateway_order_id,
            'razorpay_payment_id': 'pay_mock_test_12345',
            'razorpay_signature': 'valid_mock_signature',
        }, format='json')

        self.assertEqual(verify_res.status_code, status.HTTP_200_OK)

        # 3. Verify order status and active enrollment
        order = Order.objects.get(order_reference=order_ref)
        self.assertEqual(order.status, Order.STATUS_COMPLETED)

        enrollment = Enrollment.objects.get(student=self.student, course=self.course)
        self.assertEqual(enrollment.status, Enrollment.STATUS_ACTIVE)
        self.assertTrue(enrollment.is_valid)

    def test_prevent_duplicate_enrollment_order(self):
        # Manually grant active enrollment
        Enrollment.objects.create(student=self.student, course=self.course, status=Enrollment.STATUS_ACTIVE)

        # Attempt to create checkout for already enrolled course
        res = self.client.post('/api/payments/create-order/', {
            'course_id': self.course.id
        }, format='json')

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already have active enrollment', res.data['error'])
