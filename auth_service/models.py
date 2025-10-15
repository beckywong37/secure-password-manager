from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """Custom User model to extend Django's AbstractUser to include an auth_key field"""
    auth_key = models.CharField(max_length=64, null=True, blank=True)   # AES 256-bit/32 byte key is 64 chars when converted to hex

    def __str__(self):
        return self.username
