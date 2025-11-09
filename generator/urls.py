from django.urls import path
from .views import PasswordGeneratorHTMLView, PasswordGeneratorAPIView, PasswordStrengthAPIView

urlpatterns = [
    path('', PasswordGeneratorHTMLView.as_view(), name='password_generator'),
    path('api/generate-password/', PasswordGeneratorAPIView.as_view(), name='password_generator_api'),
    path('api/check-strength/', PasswordStrengthAPIView.as_view(), name='password_strength_api'),
]
