Application URL: https://secure-password-manager-475618.uc.r.appspot.com/ 

# Setup Instructions

## Required Programs:
1. Git
2. Python 3.11+
3. nvm
4. Node.js 22.12
    - Install using nvm
        ```bash
        nvm install 22.12
        nvm use 22.12
        ```
5. pnpm
    ```bash
    npm install -g pnpm
    ```

## Installation Instructions
1. Clone repository locally
2. Create a virtual environment to isolate project's dependencies from your global Python installation. This will also ensure all team members work with the same version of packages.
```bash
python3 -m venv venv
```
3. Activate virtual environment and install dependencies (as they might have changed)
```bash
source venv/bin/activate
pip install -r requirements.txt
```

## How to start Application in Development Mode

1. Run Django server locally
```bash
source venv/bin/activate
pip install -r requirements.txt
export DJANGO_SETTINGS_MODULE=password_manager.settings.local
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
3. Set your environment with:
```bash
export DJANGO_SETTINGS_MODULE=password_manager.settings.local_deployment
```
4. Collect React Frontend and Django static files
```bash
python manage.py collectstatic --noinput
```
5. Run migrations and run the Django server with local SQLite instance
```bash
python manage.py migrate
python manage.py runserver
```
6. Create an account via the registration link in the /login page and complete MFA setup.  
You'll need to save these details and use them to access the Vault application.



## Settings Configuration Details

The project uses a multi-file settings structure:
- `password_manager/settings/base.py` - Common settings shared across all environments
- `password_manager/settings/local.py` - Local development settings (SQLite, DEBUG=True)
- `password_manager/settings/deployment.py` - Production settings (Cloud SQL, security enforced)
- `password_manager/settings/test.py` - CI test settings (PostgreSQL test container, extends deployment)

**By default, the project uses `deployment.py` settings.**

### Using Local Development Settings

Update your config file by running
```
export DJANGO_SETTINGS_MODULE=password_manager.settings.local
```

This will:
- Use SQLite database instead of Cloud SQL
- Enable DEBUG mode
- Allow all CORS origins
- Use relaxed security settings

### Using Deployment Settings

The deployment settings are used automatically when `DJANGO_SETTINGS_MODULE` is not set or when explicitly set to `password_manager.settings.deployment`.

For deployment, set the required environment variables in `app.yaml` or your CI/CD pipeline.

## How to Check Types
```bash
pnpm typecheck
```

## How to Check Code Coverage
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

