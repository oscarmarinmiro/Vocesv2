__author__ = 'oscarmarinmiro'

from django.utils import timezone
from models import Tweet, User, CheckIn
from math import sqrt, pow, pi, acos, sin, cos

from datetime import datetime

MAX_RECORDS = 500

def dataSearchGeo(latMin,lngMin,latMax,lngMax):
    tweets = Tweet.objects.filter(lat__lte=latMax,lat__gte=latMin,lng__gte=lngMin,lng__lte=lngMax).order_by('-stamp')[:500]

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
    tweets = Tweet.objects.filter(lat__lte=latMax,lat__gte=latMin,lng__gte=lngMin,lng__lte=lngMax,hashTag = hash.lower()).order_by('-stamp')[:500]

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

    tweet = Tweet.objects.get(tweetId = int(tweetId))

    myTweet = {'tweetId':str(tweet.tweetId),'lat':tweet.lat,'lng':tweet.lng,'stamp':tweet.stamp.strftime("%Y%m%d%H%M%S"),'hashTag':tweet.hashTag,'votes':tweet.votes,'relevance':tweet.relevanceFirst,'text':tweet.text,'media':tweet.mediaUrl,'userName':tweet.userId.name,'userKarma':tweet.userId.karma,'userNick':tweet.userId.screenName,'userId':tweet.userId.userId,'userImg':tweet.userId.profileImgUrl,'relevanceFirst':tweet.relevanceFirst}

    return myTweet

#alex
def dataInsertCheckIn(tweetId,fingerprint):
    tweetId = str(tweetId)
    dt_stamp = timezone.now()
    #stamp = dt_stamp.strftime('%Y-%m-%d %H:%M:%S')
    try:
        print "%s--%s--%s" % (fingerprint,dt_stamp.strftime("%Y%m%d%H%M%S"),tweetId)
        checkin = CheckIn(fingerprint=fingerprint, stamp=dt_stamp, tweetId=tweetId)
        checkin.save()
        print "pido con el id: %s" % tweetId
        call = tweetGeo.objects.get(tweetId=tweetId)
        call.relevanceFirst += 1
        call.save()
        print "OK"
        return {"code":"OK","count":call.relevanceFirst}
    except Exception as e:
        print e
        return {"code":"KO"}


def dataAlreadyChecked(fingerprint):
    checkins = CheckIn.objects.filter(fingerprint=fingerprint)
    if len(checkins) > 0:
        return {"code":"OK"}
    else:
        return {"code":"KO"}

#BEGIN Calls management.
def __buildTweetsResult(calls):
    result = list()
    for call in calls:
        result.append({'id':str(call.tweetId),'lat':call.lat,'lng':call.lng,
                       'stamp':call.stamp.strftime("%Y%m%d%H%M%S"),'hashTag':call.hashTag,'votes':call.votes,
                       'relevance':call.relevanceFirst})
    return result

def __buildHTResult(calls):

    htDict = {}

    for call in calls:
        myHT = call.hashTag.lower()

        if myHT not in htDict:
            htDict[myHT] = 0

        htDict[myHT]+= call.votes

    return [{'ht':key,'count':htDict[key]} for key in sorted(htDict.keys(), key=lambda key: htDict[key], reverse=True)[:5]]


def dataGetCalls():
    calls = Tweet.objects.filter(inReplyToId=-1).order_by('-stamp')[:500]
    return {'calls': __buildTweetsResult(calls),'hts': __buildHTResult(calls)}

def __pdistance(x1, y1, x2, y2):
    EARTH_RADIUS = 6378.137
    rad_x1 = x1 / 180 * pi
    rad_y1 = y1 / 180 * pi
    rad_x2 = x2 / 180 * pi
    rad_y2 = y2 / 180 * pi
    e = acos( sin(rad_x1) * sin(rad_x2) + cos(rad_x1)*cos(rad_x2)*cos(rad_y2-rad_y1))
    return e * EARTH_RADIUS
    #return sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2))

def __withind(queryset, lat, lng, radius):
    result = list()
    for item in queryset:
        distance = __pdistance(item.lat, item.lng, lat, lng)
        if distance <= radius:
            result.append(item)
    return result

def dataGetCallsInRadius(lat, lng, radius):
    calls = __withind(Tweet.objects.filter(inReplyToId=-1).order_by('-stamp'), lat, lng, radius)[:500]
    return {'calls': __buildTweetsResult(calls)}

def dataGetCallCheckins(callId):
    tweets = Tweet.objects.filter(inReplyToId=callId).order_by('-stamp')
    checkins = CheckIn.objects.filter(tweetId=callId).order_by('-stamp')
    return {'checkins': [{'stamp': checkin.stamp.strftime("%Y%m%d%H%M%S")} for checkin in checkins],
            'tweets': __buildTweetsResult(tweets)}

#END Calls management.
