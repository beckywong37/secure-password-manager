from django.db import models
from django.contrib.auth import get_user_model


class Record(models.Model):
    """
    Model to store a record of a password vault entry
    """

    title = models.CharField(max_length=255)
    user = models.ForeignKey(
        get_user_model(), on_delete=models.CASCADE, related_name="records"
    )
    username = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    email = models.EmailField(max_length=255, blank=True)
    url = models.URLField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
