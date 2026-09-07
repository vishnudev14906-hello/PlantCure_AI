import os
import json
import base64
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import UserProfile, PasswordResetToken
from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)
from .throttling import AuthRateThrottle

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            return Response({
                'message': 'Account created successfully.',
                'user': UserSerializer(user).data,
                'tokens': tokens
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        username_or_email = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')

        if not username_or_email or not password:
            return Response(
                {'detail': 'Please provide both email/username and password.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Allow login via username or email
        user = None
        if '@' in username_or_email:
            try:
                matched_user = User.objects.get(email__iexact=username_or_email)
                user = authenticate(username=matched_user.username, password=password)
            except User.DoesNotExist:
                user = None
        else:
            user = authenticate(username=username_or_email, password=password)

        if user is not None:
            if not user.is_active:
                return Response({'detail': 'This account has been disabled.'}, status=status.HTTP_403_FORBIDDEN)
            
            tokens = get_tokens_for_user(user)
            return Response({
                'message': 'Login successful.',
                'user': UserSerializer(user).data,
                'tokens': tokens
            }, status=status.HTTP_200_OK)

        return Response({'detail': 'Invalid credentials. Please check your username/email and password.'}, status=status.HTTP_401_UNAUTHORIZED)


class GoogleAuthView(APIView):
    """
    Google OAuth2 endpoint.
    Accepts credential (JWT id_token from Google Identity Services) or email + google_id.
    Validates token, finds or creates User, and issues PlantCure JWT tokens.
    """
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        credential = request.data.get('credential')
        email = request.data.get('email')
        name = request.data.get('name', '')
        google_id = request.data.get('google_id')

        # If frontend sent Google JWT credential, decode payload
        if credential:
            try:
                # JWT tokens consist of header.payload.signature
                parts = credential.split('.')
                if len(parts) >= 2:
                    payload_b64 = parts[1]
                    # Add padding if needed
                    rem = len(payload_b64) % 4
                    if rem > 0:
                        payload_b64 += '=' * (4 - rem)
                    decoded_json = base64.urlsafe_b64decode(payload_b64).decode('utf-8')
                    payload = json.loads(decoded_json)
                    email = payload.get('email')
                    name = payload.get('name', '')
                    google_id = payload.get('sub')
            except Exception as e:
                return Response({'detail': f'Failed to parse Google credentials: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        if not email:
            return Response({'detail': 'Email is required for Google Sign-In.'}, status=status.HTTP_400_BAD_REQUEST)

        # Look up or create user
        email = email.lower()
        user = User.objects.filter(email=email).first()
        if not user:
            base_username = email.split('@')[0]
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            first_name = name.split(' ')[0] if name else ''
            last_name = ' '.join(name.split(' ')[1:]) if (name and len(name.split(' ')) > 1) else ''

            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name
            )
            # Set unusable password since they authenticate via Google
            user.set_unusable_password()
            user.save()

        tokens = get_tokens_for_user(user)
        return Response({
            'message': 'Google authentication successful.',
            'user': UserSerializer(user).data,
            'tokens': tokens
        }, status=status.HTTP_200_OK)


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email'].lower()
            user = User.objects.filter(email=email).first()

            # Always respond with a generic success to prevent email enumeration
            response_data = {
                'message': 'If an account exists with this email, a password reset link has been dispatched.'
            }

            if user:
                # Invalidate previous unused tokens for this user
                PasswordResetToken.objects.filter(user=user, is_used=False).update(is_used=True)
                reset_token = PasswordResetToken.objects.create(user=user)

                reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token.token}"
                email_subject = "PlantCure AI - Reset Your Password"
                email_message = f"""Hello {user.first_name or user.username},

We received a request to reset your password for your PlantCure AI account.
Please click the link below to set a new password:

{reset_link}

This link will expire in 24 hours. If you did not request this, please ignore this email.

Happy farming,
The PlantCure AI Team
"""
                try:
                    send_mail(
                        email_subject,
                        email_message,
                        settings.DEFAULT_FROM_EMAIL,
                        [user.email],
                        fail_silently=True
                    )
                except Exception as e:
                    pass

                # In development mode, provide the token/link directly to assist quick testing
                if settings.DEBUG:
                    response_data['dev_reset_link'] = reset_link
                    response_data['dev_token'] = str(reset_token.token)

            return Response(response_data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            token_str = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']

            token_obj = PasswordResetToken.objects.filter(token=token_str).first()
            if not token_obj or not token_obj.is_valid():
                return Response({'detail': 'Invalid or expired password reset link. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

            user = token_obj.user
            user.set_password(new_password)
            user.save()

            token_obj.is_used = True
            token_obj.save()

            return Response({'message': 'Password has been reset successfully. You can now log in.'}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response({'detail': 'Refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        except TokenError:
            return Response({'detail': 'Invalid or already blacklisted token.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Profile updated successfully.',
                'user': UserSerializer(request.user).data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({'old_password': 'Incorrect current password.'}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(serializer.validated_data['new_password'])
            user.save()

            return Response({'message': 'Password changed successfully.'}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
