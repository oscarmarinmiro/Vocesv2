# -*- coding: utf8 -*-

from django.db.models import Model, CharField, BigIntegerField, IntegerField, DateTimeField, URLField, FloatField,\
                             OneToOneField, ForeignKey, OneToOneField
from django.contrib.sites.models import Site

class Config(Model):
    """
    Config object to store global info
    """
    # This is a 'trick' to allow only one instance for site of the settings, accesible through django admin
    # Otherwise [a 'settings' instance NOT accesible through admin], this https://github.com/sciyoshi/django-dbsettings
    # could be used...
    site = OneToOneField(Site)
    #BEGIN Call detection constants.
    calls_twitter_account = 'vote_outliers'
    call_symbol = '¡'
    call_detection_regexp = "^@%s %s .*$" % (calls_twitter_account, call_symbol)
    #END Call detection constants.
    #BEGIN Checkin detection constants.
    checkin_symbol = '\*'
    checkin_detection_regexp = "^@%s %s .*$" % (calls_twitter_account, checkin_symbol)
    #END Checkin detection constants.
    oauthToken = CharField('Robot OauthToken',max_length=100,unique=True)
    oauthSecret = CharField('Robot OauthSecret',max_length=100,unique=True)
    consumerKey = CharField('Consumer key',max_length=100,unique=True)
    consumerSecret = CharField('Consumer secret',max_length=100,unique=True)
    sleepTime = IntegerField('Robot sleep time (seconds',unique=True)
    maxPoints = IntegerField('Max number of points in a user geo Window')
    lastId = BigIntegerField('Last tweet Id for internal robot management (do not touch!)')
    lastBotTime = DateTimeField('Last robot wake up for internal robot management (do not touch!)')

    class Meta:
        verbose_name_plural = 'Config'

    def __unicode__(self):
        return self.site.name


class User(Model):
    """
    Twitter user specific-info
    """
    userId = BigIntegerField(primary_key=True,unique=True,db_index=True)
    profileImgUrl = URLField()
    name = CharField(max_length=100)
    screenName = CharField(max_length=100)
    karma = IntegerField()

    class Meta:
        verbose_name_plural = 'Users'

    def __unicode__(self):
        return self.screenName


class Call(Model):
    tweetId = OneToOneField(Tweet)

    def __unicode__(self):
        return str(self.tweetId)


class Tweet(Model):
    """
    Tweet specific-info
    """
    tweetId = BigIntegerField(unique=True,db_index=True,primary_key=True)
    userId = ForeignKey(User)
    text = CharField(max_length=160)
    mediaUrl = URLField(null=True)
    inReplyToId = BigIntegerField(db_index=True)
    lat = FloatField()
    lng = FloatField()
    stamp = DateTimeField()
    hashTag = CharField(max_length=100,db_index=True)
    votes = IntegerField()
    rt = IntegerField()
    relevanceFirst = IntegerField()
    relevanceSecond = IntegerField()

    class Meta:
        verbose_name_plural = 'Tweets'

    def __unicode__(self):
        return str(self.tweetId)


class CheckIn(Model):
    """
    Checkins register
    """
    userId = ForeignKey(User)
    stamp = DateTimeField()
    callId = ForeignKey(Tweet)

    class Meta:
        verbose_name_plural = 'CheckIns'
        unique_together = (('userId', 'callId'),)

    def __unicode__(self):
        return str('%s-%s' % (self.userId, self.callId))
                                          
