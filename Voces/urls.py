from django.conf import settings
from django.conf.urls import patterns, include, url
from vocesBack import views

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
                       # Examples:
                       # url(r'^$', views.home, name='home'),
                       # url(r'^contact/$', views.contact, name='contact'),
                       # url(r'^information/$', views.information, name='information'),
                       # url(r'^work/$', views.work, name='work'),
                       # url(r'^work/tags/(?P<tagSlug>[\w-]+)/$', views.filterTag, name='filterTag'),
                       # url(r'^work/categories/(?P<catSlug>[\w-]+)/$', views.filterCategory, name='filterCategory'),
                       # url(r'^work/detail/(?P<postSlug>[\w-]+)/$', views.workDetail, name='workDetail'),

                       # Uncomment the next line to enable the admin:
                       url(r'^admin/', include(admin.site.urls)),
                       (r'^media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.MEDIA_ROOT, 'show_indexes': True}),
                       )