__author__ = 'oscarmarinmiro'

from django.db import models
from django.utils import timezone
from models import tweetGeo,tweetInfo,userInfo,checkIn

from datetime import datetime

MAX_RECORDS = 500


def dataSearchGeo(latMin,lngMin,latMax,lngMax):
    tweets = tweetGeo.objects.filter(lat__lte=latMax,lat__gte=latMin,lng__gte=lngMin,lng__lte=lngMax).order_by('-stamp')[:500]

    tweetStruct = []
    tagFacets = {}
    userFacets = {}

    for tweet in tweets:
        tweetStruct.append({'tweetId':str(tweet.tweetId),'lat':tweet.lat,'lng':tweet.lng,'stamp':tweet.stamp.strftime("%Y%m%d%H%M%S"),'hashTag':tweet.hashTag,'votes':tweet.votes,'relevance':tweet.relevanceFirst})

        if tweet.hashTag not in tagFacets:
            tagFacets[tweet.hashTag] = 0
        tagFacets[tweet.hashTag]+=1

        if tweet.tweetInfo.userId.screenName not in userFacets:
            userFacets[tweet.tweetInfo.userId.screenName] = 0
        userFacets[tweet.tweetInfo.userId.screenName] += 1


    return {'points':tweetStruct,'tagFacets':tagFacets,'userFacets':userFacets}

def dataSearchGeoHash(latMin,lngMin,latMax,lngMax,hash):
    tweets = tweetGeo.objects.filter(lat__lte=latMax,lat__gte=latMin,lng__gte=lngMin,lng__lte=lngMax,hashTag = hash.lower()).order_by('-stamp')[:500]

    tweetStruct = []
    tagFacets = {}
    userFacets = {}

    for tweet in tweets:
        tweetStruct.append({'tweetId':str(tweet.tweetId),'lat':tweet.lat,'lng':tweet.lng,'stamp':tweet.stamp.strftime("%Y%m%d%H%M%S"),'hashTag':tweet.hashTag,'votes':tweet.votes,'relevance':tweet.relevanceFirst})

        if tweet.hashTag not in tagFacets:
            tagFacets[tweet.hashTag] = 0
            tagFacets[tweet.hashTag]+=1

        if tweet.tweetInfo.userId.screenName not in userFacets:
            userFacets[tweet.tweetInfo.userId.screenName] = 0
            userFacets[tweet.tweetInfo.userId.screenName] += 1

    return {'points':tweetStruct,'tagFacets':tagFacets,'userFacets':userFacets}

def dataSearchPointDetail(tweetId):

    tweet = tweetInfo.objects.get(tweetId = int(tweetId))

    myTweet = {'tweetId':str(tweet.tweetId),'lat':tweet.tweetgeo.lat,'lng':tweet.tweetgeo.lng,'stamp':tweet.tweetgeo.stamp.strftime("%Y%m%d%H%M%S"),'hashTag':tweet.tweetgeo.hashTag,'votes':tweet.tweetgeo.votes,'relevance':tweet.tweetgeo.relevanceFirst,'text':tweet.text,'media':tweet.mediaUrl,'userName':tweet.userId.name,'userKarma':tweet.userId.karma,'userNick':tweet.userId.screenName,'userId':tweet.userId.userId,'userImg':tweet.userId.profileImgUrl}

    return myTweet

#alex
def dataInsertCheckIn(tweetId,fingerprint):
    tweetId = str(tweetId)
    dt_stamp = timezone.now()
    #stamp = dt_stamp.strftime('%Y-%m-%d %H:%M:%S')
    try:
        print "%s--%s--%s" % (fingerprint,dt_stamp.strftime("%Y%m%d%H%M%S"),tweetId)
        checkin = checkIn(fingerprint=fingerprint, stamp=dt_stamp, tweetId=tweetId)
        checkin.save()
        print "pido con el id: %s" % tweetId
        call = tweetGeo.objects.get(tweetId=tweetId)
        call.relevanceFirst += 1
        print "AAAAA"
        print call.relevanceFirst
        call.save()
        print "OK"
        return {"code":"OK"}
    except Exception as e:
        print e
        return {"code":"KO"}


def dataAlreadyChecked(fingerprint):
    checkins = checkIn.objects.filter(fingerprint=fingerprint)
    if len(checkins) > 0:
        return {"code":"OK"}
    else:
        return {"code":"KO"}
