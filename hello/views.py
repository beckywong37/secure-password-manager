from django.http import HttpResponse


def home(request):
    return HttpResponse(
        """Hello, World! This is Becky, Bobby, and April's Secure Password Manager Project for CS 467.
        This Django Application is deployed on Google Cloud App Engine."""
    )
