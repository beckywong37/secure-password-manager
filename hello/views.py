from django.http import HttpResponse


def home(request):
    return HttpResponse(
        "Hello, World!<br><br>"
        "This is Becky, Bobby, and April's Secure Password Manager Project for CS 467.<br><br>"
        "This Django Application was automatically deployed on Google Cloud App Engine by Github Actions."
    )
