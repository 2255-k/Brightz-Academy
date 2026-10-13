"""
Automated tests for Courses and Curriculum.
"""

from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.courses.models import TeachingLanguage, Course, Module, Lesson

class CourseApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.lang_ml = TeachingLanguage.objects.create(name='Malayalam', code='ml', is_active=True)
        self.lang_ta = TeachingLanguage.objects.create(name='Tamil', code='ta', is_active=True)

        self.course_ml = Course.objects.create(
            title='Malayalam Spoken English',
            slug='malayalam-spoken-english',
            description='Course taught in Malayalam',
            teaching_language=self.lang_ml,
            proficiency_level='foundation',
            price=1999.00,
            publication_status=Course.STATUS_PUBLISHED
        )

        self.course_draft = Course.objects.create(
            title='Draft Course',
            slug='draft-course',
            description='Draft only',
            teaching_language=self.lang_ta,
            price=999.00,
            publication_status=Course.STATUS_DRAFT
        )

        self.module = Module.objects.create(course=self.course_ml, title='Introduction', position=1)
        self.preview_lesson = Lesson.objects.create(
            module=self.module,
            title='Free Trial Lesson',
            position=1,
            is_preview=True,
            publication_status=Lesson.STATUS_PUBLISHED
        )
        self.paid_lesson = Lesson.objects.create(
            module=self.module,
            title='Paid Lesson 2',
            position=2,
            is_preview=False,
            publication_status=Lesson.STATUS_PUBLISHED
        )

    def test_list_published_courses_only(self):
        res = self.client.get('/api/courses/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        titles = [c['title'] for c in res.data['results']]
        self.assertIn('Malayalam Spoken English', titles)
        self.assertNotIn('Draft Course', titles)

    def test_filter_courses_by_language(self):
        res = self.client.get('/api/courses/?language=ml')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        for c in res.data['results']:
            self.assertEqual(c['teaching_language']['code'], 'ml')

    def test_course_detail_and_curriculum(self):
        res = self.client.get(f'/api/courses/{self.course_ml.slug}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['title'], 'Malayalam Spoken English')
        self.assertEqual(len(res.data['modules']), 1)
        self.assertEqual(len(res.data['modules'][0]['lessons']), 2)
