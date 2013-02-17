__author__ = 'oscarmarinmiro'

from django.db import models
from models import tweetGeo,tweetInfo,userInfo

MAX_RECORDS = 500


def dataSearchGeo(latMin,lngMin,latMax,lngMax):
    tweets = tweetGeo.objects.filter(lat__lte=latMax,lat__gte=latMin,lng__gte=lngMin,lng__lte=lngMax).order_by('-stamp')[:500]

    tweetStruct = []

    for tweet in tweets:
        tweetStruct.append({'tweetId':tweet.tweetId,'lat':tweet.lat,'lng':tweet.lng,'stamp':tweet.stamp.strftime("%Y%m%d%H%M%S"),'hashTag':tweet.hashTag,'votes':tweet.votes,'relevance':tweet.relevanceFirst})

    return tweetStruct

def dataSearchGeoHash(latMin,lngMin,latMax,lngMax,hash):
    tweets = tweetGeo.objects.filter(lat__lte=latMax,lat__gte=latMin,lng__gte=lngMin,lng__lte=lngMax,hashTag = hash.lower()).order_by('-stamp')[:500]

    tweetStruct = []

    for tweet in tweets:
        tweetStruct.append({'tweetId':tweet.tweetId,'lat':tweet.lat,'lng':tweet.lng,'stamp':tweet.stamp.strftime("%Y%m%d%H%M%S"),'hashTag':tweet.hashTag,'votes':tweet.votes,'relevance':tweet.relevanceFirst})

    return tweetStruct

def dataSearchPointDetail(tweetId):

    tweet = tweetInfo.objects.get(tweetId = int(tweetId))

    myTweet = {'tweetId':tweet.tweetId,'lat':tweet.tweetgeo.lat,'lng':tweet.tweetgeo.lng,'stamp':tweet.tweetgeo.stamp.strftime("%Y%m%d%H%M%S"),'hashTag':tweet.tweetgeo.hashTag,'votes':tweet.tweetgeo.votes,'relevance':tweet.tweetgeo.relevanceFirst,'text':tweet.text,'media':tweet.mediaUrl,'userName':tweet.userId.name,'userKarma':tweet.userId.karma,'userNick':tweet.userId.screenName,'userId':tweet.userId.userId,'userImg':tweet.userId.profileImgUrl}

    return myTweet
