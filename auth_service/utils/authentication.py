from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.exceptions import AuthenticationFailed


class CookieJWTAuthentication(JWTAuthentication):
    """
    Authenticate via HttpOnly cookie named 'accesstoken'.
    """
    def authenticate(self, request):
        access_token = request.COOKIES.get('accesstoken')
        if access_token is None:
            return None

        try:
            validated_token = self.get_validated_token(access_token)
            user = self.get_user(validated_token)
            return (user, validated_token)
        except TokenError:
            raise AuthenticationFailed('Invalid or expired token')
