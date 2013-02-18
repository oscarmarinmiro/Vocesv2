# Django settings for tuitrank project.

# Make this unique, and don't share it with anybody.
SECRET_KEY = 'b2#t8snj9vl9m1j9u@(ax1d-=_#j27k+7=k4*0bwy-tt0&amp;&amp;=ms'

TIME_ZONE = 'Europe/Madrid'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html

LANGUAGE_CODE = 'es-ES'


DATABASES = {
    # 'default': {
    #     'ENGINE': 'django.db.backends.mysql', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
    #     'NAME': 'voces',                      # Or path to database file if using sqlite3.
    #     'USER': 'root',                      # Not used with sqlite3.
    #     'PASSWORD': 'root',                  # Not used with sqlite3.
    #     'HOST': '127.0.0.1',                      # Set to empty string for localhost. Not used with sqlite3.
    #     'PORT': '8889',                      # Set to empty string for default. Not used with sqlite3.
    # }
    'default': {
        'ENGINE': 'django.db.backends.mysql', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': 'voces',                      # Or path to database file if using sqlite3.
        'USER': 'voces',                      # Not used with sqlite3.
        'PASSWORD': 'voces',                  # Not used with sqlite3.
        'HOST': '178.63.87.73',                      # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '3306',                      # Set to empty string for default. Not used with sqlite3.
    }
}

