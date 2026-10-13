"""
Automated tests for Student Dashboard Isolation and Progress Tracking.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.courses.models import TeachingLanguage, Course, Module, Lesson
from apps.enrollments.models import Enrollment, LessonProgress

User = get_user_model()

class StudentEnrollmentTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student_a = User.objects.create_user(username='student_a', email='a@test.com', password='Pass123!')
        self.student_b = User.objects.create_user(username='student_b', email='b@test.com', password='Pass123!')

        self.language = TeachingLanguage.objects.create(name='Malayalam', code='ml')
        self.course = Course.objects.create(
            title='Course A',
            slug='course-a',
            price=1999.00,
            teaching_language=self.language,
            publication_status=Course.STATUS_PUBLISHED
        )
        self.module = Module.objects.create(course=self.course, title='Module 1', position=1)
        self.lesson_1 = Lesson.objects.create(module=self.module, title='Lesson 1', position=1, publication_status=Lesson.STATUS_PUBLISHED)
        self.lesson_2 = Lesson.objects.create(module=self.module, title='Lesson 2', position=2, publication_status=Lesson.STATUS_PUBLISHED)

        # Enroll only Student A
        Enrollment.objects.create(student=self.student_a, course=self.course, status=Enrollment.STATUS_ACTIVE)

    def test_student_dashboard_isolation(self):
        # Student A sees Course A
        self.client.force_authenticate(user=self.student_a)
        res_a = self.client.get('/api/student/dashboard/')
        self.assertEqual(res_a.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_a.data['enrolled_courses']), 1)
        self.assertEqual(res_a.data['enrolled_courses'][0]['title'], 'Course A')

        # Student B is unenrolled and must see 0 enrolled courses
        self.client.force_authenticate(user=self.student_b)
        res_b = self.client.get('/api/student/dashboard/')
        self.assertEqual(res_b.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_b.data['enrolled_courses']), 0)

    def test_lesson_progress_recording_and_percentage(self):
        self.client.force_authenticate(user=self.student_a)

        # Mark lesson 1 as completed
        res = self.client.post(f'/api/student/lessons/{self.lesson_1.id}/progress/', {
            'last_position_seconds': 350,
            'completed': True
        }, format='json')

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['completed'])
        self.assertEqual(res.data['last_position_seconds'], 350)
        # 1 out of 2 lessons completed = 50%
        self.assertEqual(res.data['course_progress_percentage'], 50)

        # Verify DB record
        prog = LessonProgress.objects.get(student=self.student_a, lesson=self.lesson_1)
        self.assertTrue(prog.completed)
        self.assertEqual(prog.last_position_seconds, 350)
