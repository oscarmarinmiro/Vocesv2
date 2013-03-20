from os.path import join, dirname, normpath

DATABASES = {
    # DEV
    #  'default': {
    #      'ENGINE': 'django.db.backends.mysql', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
    #      'NAME': 'voices',                      # Or path to database file if using sqlite3.
    #      'USER': 'voices',                      # Not used with sqlite3.
    #      'PASSWORD': 'voices2013pp',                  # Not used with sqlite3.
    #      'HOST': '127.0.0.1',                      # Set to empty string for localhost. Not used with sqlite3.
    #      'PORT': '3306',                      # Set to empty string for default. Not used with sqlite3.
    #  }

    # OSCARDEV
    'default': {
      'ENGINE': 'django.db.backends.mysql', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
      'NAME': 'voces',                      # Or path to database file if using sqlite3.
      'USER': 'root',                      # Not used with sqlite3.
      'PASSWORD': 'root',                  # Not used with sqlite3.
      'HOST': '127.0.0.1',                      # Set to empty string for localhost. Not used with sqlite3.
      'PORT': '8889',                      # Set to empty string for default. Not used with sqlite3.
    }
    # PRO
    # 'default': {
    #     'ENGINE': 'django.db.backends.mysql', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
    #     'NAME': 'voces',                      # Or path to database file if using sqlite3.
    #     'USER': 'voces',                      # Not used with sqlite3.
    #     'PASSWORD': 'voces',                  # Not used with sqlite3.
    #     'HOST': '178.63.87.73',                      # Set to empty string for localhost. Not used with sqlite3.
    #     'PORT': '3306',                      # Set to empty string for default. Not used with sqlite3.
    # }

}

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
        'LOCATION': '127.0.0.1:11211',
    }
}

SECRET_KEY = 'qv(b00q^wwzar%!2std%&amp;gj29uq_=ipq_noz9vwml)2+x#vgxc'

# Used to provide absolute paths.  Normally the default is fine.
LOCAL_PATH = normpath(join(dirname(__file__), '..'))

# These are the hostnames as returned by platform.node().
# If you aren't sure what to put, leave them blank and the error message should tell you which hostname Python sees.
#DEVELOPMENT_HOST = ['minovitch']
DEVELOPMENT_HOST = ['eeupm', 'minovitch','Oscar-Marin-Miros-MacBook-Pro.local','tesla']
PRODUCTION_HOST = []
