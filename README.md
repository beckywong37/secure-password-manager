Application URL: https://secure-password-manager-475618.uc.r.appspot.com/ 

# Setup Instructions:
1. Clone repository locally
2. Create a virtual environment to isolate project's dependencies from your global Python installation. This will also ensure all team members work with the same version of packages.
3. Copy and save the `.env.template` file as a `.env` and set the environment variable values.

## Creating the virtual environment and install dependencies:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

This will install the same version of Django and other packages locally.

Make sure to add virtual environment folder to .gitignore so it's not uploaded to GitHub.

## How to start Application locally mimicking prod but using SQLite
Note: You do not need to run the front-end server separately using this method, and this method is a way to test that the application will work once it's deployed to the cloud.
1. Activate virtual environment and install dependencies (as they might have changed)
```bash
source venv/bin/activate
pip install -r requirements.txt
```
2. Build the React Frontend, similar to prod
```bash
cd frontend/web
nvm use
pnpm install
pnpm run build
cd ../..
```
3. Collect React Frontend and Django static files
```bash
DEBUG=False USE_CLOUD_SQL=False SECRET_KEY=test-key-for-local-testing python manage.py collectstatic --noinput
```
4. Run migrations and run the Django server with local SQLite instance
```bash
python manage.py migrate
DEBUG=False USE_CLOUD_SQL=False SECRET_KEY=test-key-for-local-testing python manage.py runserver
```
5. Create an account via the registration link in the /login page and complete MFA setup.  
You'll need to save these details and use them to access the Vault application.

## How to start Application in Development Mode

1. Run Django server locally
```bash
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
2. Run Front-end server locally in another terminal
```bash
cd frontend/web
nvm use
pnpm install
pnpm dev
```



### How to Check Code Coverage
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

