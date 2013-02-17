__author__ = 'oscarmarinmiro'
# -*- coding: utf8 -*-

import os
import sys
import datetime
import pprint
import traceback
import time
import twitter
import re
import random
import pprint
from django.utils import timezone

sys.path.append('../')

os.environ["DJANGO_SETTINGS_MODULE"] = "settings"

from vocesBack.models import Config, userInfo, tweetGeo, tweetInfo

# Estas son las credenciales de la app
# La cuenta es vote_outliers en twitter, pass:vote2012pp
# La cuenta gmail asociada es vote@outliers.es, pass:vote2012pp

# OAUTH_TOKEN="616082494-ZpnieAKy8OxvVOcKxZrIAl90Kl7ha6pyC7mvpKYK"
# OAUTH_SECRET="eFP9DashBJHIN8insuJ2prjmLwTnKhMwxDCOTGth1s"
# CONSUMER_KEY="TT0jgqhKZm6JYqV80OMrw"
# CONSUMER_SECRET="lqS1oyPFduvxIDVmmlccxPHF4AVIB3tXFbgIETQZE"

ConfigObject = Config.objects.all()[0]

SLEEP_TIME = ConfigObject.sleepTime

OAUTH_TOKEN=ConfigObject.oauthToken
OAUTH_SECRET=ConfigObject.oauthSecret
CONSUMER_KEY=ConfigObject.consumerKey
CONSUMER_SECRET=ConfigObject.consumerSecret


def getSinceFromConfig():
    try:
        return ConfigObject.lastId
    except:
        print "Exception reading since info:", sys.exc_info()[0]
        return -1


def putSinceInConfig(since):

    ConfigObject.lastId = since

    ConfigObject.save()

    return

api = twitter.Api(consumer_key=CONSUMER_KEY,consumer_secret=CONSUMER_SECRET, access_token_key=OAUTH_TOKEN, access_token_secret=OAUTH_SECRET)


while(True):

    sinceId = getSinceFromConfig()

    print "Taking tweet from sinceId: %d" % (sinceId)

    recentposts = api.GetReplies(since_id=sinceId)


    for status in recentposts:
        print "New tweet, here's the dump:"

        pprint.pprint(status.data)

        dStatus = status.AsDict()

        pprint.pprint(dStatus)

        # Only take care of tweet if it has coordinates

        if status.coordinates is not None:

            # Go w/ userInfo

            if userInfo.objects.filter(userId = dStatus['user']['id']).count() != 0 :
                print "User %s already exists... updating" % dStatus['user']['screen_name']
                user = userInfo.objects.filter(userId = dStatus['user']['id'])[0]
                # TBD how to update karma
                user.name = dStatus['user']['name']
                user.profileImgUrl = dStatus['user']['profile_image_url']
            else:
                user = userInfo(userId = dStatus['user']['id'])
                user.profileImgUrl = dStatus['user']['profile_image_url']
                user.name = dStatus['user']['name']
                user.karma = 0
                user.screenName = dStatus['user']['screen_name']

            user.save()

            # Go w/ tweetInfo

            if tweetInfo.objects.filter(tweetId=dStatus['id']).count() == 0:
                tweetI = tweetInfo(tweetId=dStatus['id'])
                tweetI.text = dStatus['text']
                tweetI.userId = user

                # TBD
                if 'entities' in status.data and 'media' in status.data['entities'] and status.data['entities']['media'][0]['type']=='photo':
                    tweetI.mediaUrl = status.data['entities']['media'][0]['media_url']+":thumb"
                else:
                    tweetI.mediaUrl = ""

                tweetI.save()

                # Go w/ tweetGeo

                tweetG = tweetGeo(tweetId=dStatus['id'])
                tweetG.lat = dStatus['coordinates']['coordinates'][1]
                tweetG.lng = dStatus['coordinates']['coordinates'][0]
                tweetG.relevanceFirst = 0
                tweetG.relevanceSecond = 0
                tweetG.rt = 0
                tweetG.votes = 0
                tweetG.tweetInfo = tweetI
                pprint.pprint(status.hashtags)
                if dStatus['hashtags'] is not None:
                    tweetG.hashTag = dStatus['hashtags'][0].lower()
                else:
                    tweetG.hashTag = ""
                tweetG.stamp = time.strftime('%Y-%m-%d %H:%M:%S',time.strptime(dStatus['created_at'],'%a %b %d %H:%M:%S +0000 %Y'))

                tweetG.save()
            else:
                print "Tweet %d already exists" % dStatus['id']
        else:
            print "Tweet %d do not carry geo info" % status.id

        statusId = status.id

        if statusId > sinceId:
            sinceId= statusId

    # Persisto el sinceid

    putSinceInConfig(sinceId)

    # Me duermo un rato

    # Antes de dormir, pongo el datetime de ping del robot

    ConfigObject.lastBotTime = timezone.now()

    ConfigObject.save()

    time.sleep(SLEEP_TIME)