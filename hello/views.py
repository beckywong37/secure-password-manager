from django.http import HttpResponse

def home(request):
    return HttpResponse("Hello, World! Welcome to the Secure Password Manager.")
