from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView
from auth.views import RegisterView, LoginView


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/', TokenRefreshView.as_view(), name='token'),
    path('logout/', TokenBlacklistView.as_view(), name='logout')
]
