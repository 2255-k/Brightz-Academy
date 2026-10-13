"""
Automated tests for Accounts and Authentication.
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

class AccountsAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/auth/register/'
        self.login_url = '/api/auth/login/'
        self.me_url = '/api/auth/me/'

    def test_student_registration_success(self):
        data = {
            'first_name': 'Meera',
            'last_name': 'Nambiar',
            'email': 'meera@example.com',
            'phone_number': '9846012345',
            'preferred_language': 'malayalam',
            'password': 'StrongPassword@123',
            'password_confirm': 'StrongPassword@123',
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertEqual(response.data['user']['email'], 'meera@example.com')
        self.assertEqual(response.data['user']['role'], 'student')

    def test_registration_password_mismatch(self):
        data = {
            'first_name': 'Test',
            'email': 'test@example.com',
            'password': 'Password123!',
            'password_confirm': 'DifferentPassword123!',
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_student_login_and_me_profile(self):
        user = User.objects.create_user(
            username='arun_user',
            email='arun@example.com',
            password='SecretPassword123!',
            first_name='Arun',
            preferred_language='malayalam'
        )

        login_res = self.client.post(self.login_url, {
            'email': 'arun@example.com',
            'password': 'SecretPassword123!'
        }, format='json')
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        access_token = login_res.data['tokens']['access']

        # Access /api/auth/me/ with Bearer token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        me_res = self.client.get(self.me_url)
        self.assertEqual(me_res.status_code, status.HTTP_200_OK)
        self.assertEqual(me_res.data['email'], 'arun@example.com')
        self.assertEqual(me_res.data['first_name'], 'Arun')
