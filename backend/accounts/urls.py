from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    GoogleAuthView,
    ForgotPasswordView,
    ResetPasswordView,
    LogoutView,
    UserProfileView,
    ChangePasswordView
)

urlpatterns = [
    # Auth Endpoints
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', LoginView.as_view(), name='auth_login'),
    path('auth/google/', GoogleAuthView.as_view(), name='auth_google'),
    path('auth/forgot-password/', ForgotPasswordView.as_view(), name='auth_forgot_password'),
    path('auth/reset-password/', ResetPasswordView.as_view(), name='auth_reset_password'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),

    # User Profile Endpoints
    path('user/profile/', UserProfileView.as_view(), name='user_profile'),
    path('user/change-password/', ChangePasswordView.as_view(), name='change_password'),
]
