from django.urls import path
from .views import PasswordGeneratorHTMLView, PasswordGeneratorAPIView

urlpatterns = [
    path('', PasswordGeneratorHTMLView.as_view(), name='password_generator'),
    path('api/', PasswordGeneratorAPIView.as_view(), name='password_generator_api'),
]
