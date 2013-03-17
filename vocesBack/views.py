from django.shortcuts import render_to_response, redirect
from django.template import RequestContext
#from dataHelper import getAllCategoriesCount,getAllTagsCount,getAllPosts,getAllPostsFilteredByCategory,getAllPostsFilteredByTag,getPostBySlug
from django.conf import settings

import pprint
import urllib
import urllib2
import json
import sys
import traceback

from django.http import HttpResponse
from dataHelper import dataSearchGeo,dataSearchGeoHash,dataSearchPointDetail,dataInsertCheckIn,dataAlreadyChecked,\
                       dataGetCalls, dataGetCallCheckins, dataGetCallsInRadius

from django.views.decorators.cache import cache_page


# Create your views here.


# AJAX Views

def searchGeo(request,latMin,lngMin,latMax,lngMax):
    latMin = float(latMin)
    lngMin = float(lngMin)
    latMax = float(latMax)
    lngMax = float(lngMax)

    tweets = dataSearchGeo(latMin,lngMin,latMax,lngMax)

    # html = "Hola mundo %f %f %f %f" % (latMin,lngMin,latMax,lngMax)
    return HttpResponse(json.dumps(tweets), content_type="application/json")
    # return HttpResponse(html)

def searchGeoHash(request,latMin,lngMin,latMax,lngMax,hashtag):
    latMin = float(latMin)
    lngMin = float(lngMin)
    latMax = float(latMax)
    lngMax = float(lngMax)

    tweets = dataSearchGeoHash(latMin,lngMin,latMax,lngMax,hashtag)

    return HttpResponse(json.dumps(tweets), content_type="application/json")



@cache_page(60)
def searchPointDetail(request,tweetId):
    tweetId = int(tweetId)

    tweet = dataSearchPointDetail(tweetId)

    return HttpResponse(json.dumps(tweet), content_type="application/json")

#alex
def insertCheckIn(request,tweetId,fingerprint):
    tweetId = int(tweetId)

    ok = dataInsertCheckIn(tweetId,fingerprint)

    return HttpResponse(json.dumps(ok), content_type="application/json")

def alreadyChecked(request,fingerprint):
    response = dataAlreadyChecked(fingerprint)
    print "RESPONSE %s" % response

    return HttpResponse(json.dumps(response), content_type="application/json")

def home(request):
    return render_to_response("index.html", locals(),context_instance=RequestContext(request))

#BEGIN Calls management.

@cache_page(60 * 10)
def getCalls(request):
    response = dataGetCalls()
    return HttpResponse(json.dumps(response), content_type='application/json')

def getCallsInRadius(request, lat, lng, radius):
    #print "getCallInRadius lat %s--lng %s--radius %s--" % (lat, lng, radius)
    lat = float(lat)
    lng = float(lng)
    radius = float(radius)
    response = dataGetCallsInRadius(lat, lng, radius)
    return HttpResponse(json.dumps(response), content_type='application/json')

@cache_page(60)
def getCallCheckins(request, callId):
    callId = int(callId)
    response = dataGetCallCheckins(callId)
    return HttpResponse(json.dumps(response), content_type='application/json')
#END Calls management.

