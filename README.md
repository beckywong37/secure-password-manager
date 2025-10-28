**Setup Instructions:**

1. Clone repository locally
2. Create a virtual environment to isolate project's dependencies from your global Python installation. This will also ensure all team members work with the same version of packages.
3. Copy and save the `.env.template` file as a `.env` and set the environment variable values.

**Creating the virtual environment and install dependencies:**

```python
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

This will install the same version of Django and other packages locally.

Make sure to add virtual environment folder to .gitignore so it's not uploaded to GitHub.

**Start Development Server**

- Run locally
```python
python manage.py runserver
```

**How to Check Code Coverage**
Helpful Resource: https://docs.djangoproject.com/en/5.2/topics/testing/advanced/#integration-with-coverage-py 
1. While in the virtual environment, install Coverage.py with `pip install coverage`
    - This was not included in `requirements.txt` as this is a development tool and not a run time requirement.
2. You can run test coverage for just one application (in this example, `generator`) with:
```bash
python -m coverage run --source=generator manage.py test generator
coverage report
coverage html
```
3. In your terminal, you can click on the `index.html` created to see a nice code coverage dashboard and click on file names to see which lines are and aren't covered.

