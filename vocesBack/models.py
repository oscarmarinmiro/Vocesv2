# -*- coding: utf8 -*-

from django.db import models
from django.contrib.sites.models import Site



class Config(models.Model):
    """
    Config object to store global info
    """
    # This is a 'trick' to allow only one instance for site of the settings, accesible through django admin
    # Otherwise [a 'settings' instance NOT accesible through admin], this https://github.com/sciyoshi/django-dbsettings
    # could be used...
    site = models.OneToOneField(Site)
    oauthToken = models.CharField('Robot OauthToken',max_length=100,unique=True)
    oauthSecret = models.CharField('Robot OauthSecret',max_length=100,unique=True)
    consumerKey = models.CharField('Consumer key',max_length=100,unique=True)
    consumerSecret = models.CharField('Consumer secret',max_length=100,unique=True)
    sleepTime = models.IntegerField('Robot sleep time (seconds',unique=True)
    maxPoints = models.IntegerField('Max number of points in a user geo Window')
    lastId = models.BigIntegerField('Last tweet Id for internal robot management (do not touch!)')
    lastBotTime = models.DateTimeField('Last robot wake up for internal robot management (do not touch!)')

    class Meta:
        verbose_name_plural = "Config"

    def __unicode__(self):
        return self.site.name


class userInfo(models.Model):
    """
    Twitter user specific-info
    """
    userId = models.BigIntegerField(primary_key=True,unique=True,db_index=True)
    profileImgUrl = models.URLField()
    name = models.CharField(max_length=100)
    screenName = models.CharField(max_length=100)
    karma = models.IntegerField()

    class Meta:
        verbose_name_plural = "Users"

    def __unicode__(self):
        return self.screenName

class tweetInfo(models.Model):
    """
    Tweet specific info
    """
    tweetId = models.BigIntegerField(unique=True,db_index=True,primary_key=True)
    userId = models.ForeignKey(userInfo)
    text = models.CharField(max_length=160)
    mediaUrl = models.URLField(null=True)

    class Meta:
        verbose_name_plural = "TweetInfos"

    def __unicode__(self):
        return str(self.tweetId)


class tweetGeo(models.Model):
    """
    Tweet specific info, constrained to geo display and operations
    """
    tweetId = models.BigIntegerField(unique=True,db_index=True,primary_key=True)
    lat = models.FloatField()
    lng = models.FloatField()
    stamp = models.DateTimeField()
    hashTag = models.CharField(max_length=100,db_index=True)
    votes = models.IntegerField()
    rt = models.IntegerField()
    relevanceFirst = models.IntegerField()
    relevanceSecond = models.IntegerField()
    tweetInfo = models.OneToOneField(tweetInfo)

    class Meta:
        verbose_name_plural = "Tweet Geos"

    def __unicode__(self):
        return str(self.tweetId)
