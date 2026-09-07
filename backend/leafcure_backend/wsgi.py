"""
WSGI config for leafcure_backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.1/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'leafcure_backend.settings')

application = get_wsgi_application()
app = application

# Auto-migrate fallback for serverless deployments if tables are missing
if os.environ.get('VERCEL'):
    try:
        from django.db import connection
        from django.core.management import call_command
        tables = connection.introspection.table_names()
        if 'auth_user' not in tables:
            call_command('migrate', interactive=False)
    except Exception as _e:
        print(f"WSGI serverless DB init warning: {_e}")
