from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import PasswordResetToken

class AccountsAuthTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testfarmer',
            email='farmer@example.com',
            password='TestPassword123!',
            first_name='John',
            last_name='Farmer'
        )

    def test_user_registration(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'newgardener',
            'email': 'gardener@example.com',
            'password': 'StrongPassword123!',
            'confirm_password': 'StrongPassword123!',
            'first_name': 'Jane',
            'last_name': 'Green'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertTrue(User.objects.filter(username='newgardener').exists())

    def test_user_login_success(self):
        # Test login using email
        response = self.client.post('/api/auth/login/', {
            'email': 'farmer@example.com',
            'password': 'TestPassword123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])

    def test_user_login_failure(self):
        response = self.client.post('/api/auth/login/', {
            'email': 'farmer@example.com',
            'password': 'WrongPassword999!'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_forgot_password_and_reset(self):
        # 1. Request reset link
        forgot_resp = self.client.post('/api/auth/forgot-password/', {
            'email': 'farmer@example.com'
        })
        self.assertEqual(forgot_resp.status_code, status.HTTP_200_OK)
        token_obj = PasswordResetToken.objects.filter(user=self.user, is_used=False).first()
        self.assertIsNotNone(token_obj)

        # 2. Reset password using token
        reset_resp = self.client.post('/api/auth/reset-password/', {
            'token': token_obj.token,
            'new_password': 'BrandNewPassword123!',
            'confirm_new_password': 'BrandNewPassword123!'
        })
        self.assertEqual(reset_resp.status_code, status.HTTP_200_OK)

        # 3. Verify new password logs in
        login_resp = self.client.post('/api/auth/login/', {
            'email': 'farmer@example.com',
            'password': 'BrandNewPassword123!'
        })
        self.assertEqual(login_resp.status_code, status.HTTP_200_OK)

    def test_profile_get_and_update(self):
        # Login to obtain JWT
        login_resp = self.client.post('/api/auth/login/', {
            'username': 'testfarmer',
            'password': 'TestPassword123!'
        })
        access_token = login_resp.data['tokens']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        # Get profile
        get_resp = self.client.get('/api/user/profile/')
        self.assertEqual(get_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(get_resp.data['email'], 'farmer@example.com')

        # Update profile
        update_resp = self.client.put('/api/user/profile/', {
            'phone_number': '+15551234567',
            'bio': 'Organic tomato and potato farmer.'
        })
        self.assertEqual(update_resp.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.profile.phone_number, '+15551234567')
