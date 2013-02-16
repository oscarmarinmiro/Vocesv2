__author__ = 'oscarmarinmiro'


from django.contrib import admin
from vocesBack.models import Config,tweetGeo,tweetInfo,userInfo
from django.contrib.auth.models import Group
from django.contrib.sites.models import Site

# class CategoryAdmin(admin.ModelAdmin):
# 	prepopulated_fields = {"slugName":("name",)}
#
# class TagAdmin(admin.ModelAdmin):
# 	prepopulated_fields = {"slugName":("name",)}
#
# class PostAdmin(admin.ModelAdmin):
# 	prepopulated_fields = {"slugName":("title",)}


admin.site.register(Config)
admin.site.register(tweetGeo)
admin.site.register(tweetInfo)
admin.site.register(userInfo)
admin.site.unregister(Group)
admin.site.unregister(Site)