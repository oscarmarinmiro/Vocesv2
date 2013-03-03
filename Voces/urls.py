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
                       url(r'^$',views.home, name = 'home'),
                       # Las llamadas ajax con vuelta en json
                       url(r'^getPointsGeo/(?P<latMin>[\d.-]+)/(?P<lngMin>[\d.-]+)/(?P<latMax>[\d.-]+)/(?P<lngMax>[\d.-]+)/$',views.searchGeo, name = 'getPointsGeo'),
                       url(r'^getPointsGeoHash/(?P<latMin>[\d.-]+)/(?P<lngMin>[\d.-]+)/(?P<latMax>[\d.-]+)/(?P<lngMax>[\d.-]+)/(?P<hashtag>[\w]+)/$',views.searchGeoHash, name = 'getPointsGeoHash'),
                       url(r'^getPointDetail/(?P<tweetId>[\d.]+)/$',views.searchPointDetail, name = 'getPointDetail'),
                       url(r'^check/(?P<tweetId>[\d.]+)/(?P<fingerprint>[\w]+)/$',views.insertCheckIn, name = 'insertCheckIn'),
                       url(r'^alreadyChecked/(?P<fingerprint>[\w]+)/$',views.alreadyChecked, name = 'alreadyChecked'),
                       # Uncomment the next line to enable the admin:
                       url(r'^admin/', include(admin.site.urls)),
                       url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.MEDIA_ROOT, 'show_indexes': True}),
                       url(r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.STATIC_ROOT, 'show_indexes': True}),
                       #BEGIN Call management urls.
                       url(r'^getCalls$', views.getCalls, name='getCalls'),
                       url(r'^getCallsInRadius/(?P<lat>[\d.-]+)/(?P<lng>[\d.-]+)/(?P<radius>[\d.-]+)$', views.dataGetCallsInRadius, name='getCallsInRadius'),
                       url(r'^getCallCheckins/(?P<callId>[\d]+)$', views.getCallCheckins, name='getCallCheckins'),
                       #END Call management urls.
                       )
