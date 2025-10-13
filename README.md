1. Clone repository locally
2. Create a virtual environment to isolate project's dependecies from your global Python installation. This will also ensure all team members work with the same version of packages.

**Creating the virtual environment and install dependencies:**

```python
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

This will install the same version of Django and other packages locally.

Make sure to add virtual environment folder to .gitignore so it's not uploaded to GitHub.

**Setting up Django Project (Hello World)**
- Start new Django project (creates default Django project structure)
```python
django-admin startproject password_manager .
```
- Run locally (if you see a rocket page, installation was successful)
```python
python manage.py runserver
```
- Create an app 
python manage.py startapp hello
- Update hello/views.py
- Update password_manager/urls.py
- Add 'hello' to installed_apps in password_manager_project/settings.py
- Run server again
```python
python manage.py runserver
```

