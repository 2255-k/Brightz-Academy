"""
Automated tests for Video Streaming Authorization and Playback Token Generation.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.courses.models import TeachingLanguage, Course, Module, Lesson
from apps.enrollments.models import Enrollment

User = get_user_model()

class VideoAuthorizationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = User.objects.create_user(
            username='learner1',
            email='learner1@test.com',
            password='Password123!'
        )

        self.language = TeachingLanguage.objects.create(name='Malayalam', code='ml')
        self.course = Course.objects.create(
            title='Spoken English Video Test',
            slug='spoken-english-video-test',
            price=1999.00,
            teaching_language=self.language,
            publication_status=Course.STATUS_PUBLISHED
        )
        self.module = Module.objects.create(course=self.course, title='Module 1', position=1)

        self.preview_lesson = Lesson.objects.create(
            module=self.module,
            title='Sample Preview Lesson',
            position=1,
            is_preview=True,
            publication_status=Lesson.STATUS_PUBLISHED
        )

        self.paid_lesson = Lesson.objects.create(
            module=self.module,
            title='Protected Core Lesson',
            position=2,
            is_preview=False,
            publication_status=Lesson.STATUS_PUBLISHED
        )

    def test_preview_lesson_accessible_without_auth(self):
        # Anonymous user requests free preview lesson
        res = self.client.post(f'/api/lessons/{self.preview_lesson.id}/playback/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['is_authorized'])
        self.assertTrue(res.data['is_preview'])
        self.assertIn('playback', res.data)
        self.assertIn('signed_token', res.data['playback'])

    def test_paid_lesson_denied_for_anonymous_visitor(self):
        res = self.client.post(f'/api/lessons/{self.paid_lesson.id}/playback/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(res.data['is_authorized'])

    def test_paid_lesson_denied_for_unenrolled_student(self):
        self.client.force_authenticate(user=self.student)
        res = self.client.post(f'/api/lessons/{self.paid_lesson.id}/playback/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(res.data['is_authorized'])
        self.assertIn('Active enrollment required', res.data['error'])

    def test_paid_lesson_granted_for_enrolled_student(self):
        # Enroll student in course
        Enrollment.objects.create(student=self.student, course=self.course, status=Enrollment.STATUS_ACTIVE)

        self.client.force_authenticate(user=self.student)
        res = self.client.post(f'/api/lessons/{self.paid_lesson.id}/playback/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['is_authorized'])
        self.assertFalse(res.data['is_preview'])
        self.assertIn('playback', res.data)
        self.assertIn('signed_token', res.data['playback'])
