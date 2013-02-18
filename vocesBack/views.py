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
from dataHelper import dataSearchGeo,dataSearchGeoHash,dataSearchPointDetail

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


def searchPointDetail(request,tweetId):
    tweetId = int(tweetId)

    tweet = dataSearchPointDetail(tweetId)

    return HttpResponse(json.dumps(tweet), content_type="application/json")

def home(request):
    return render_to_response("index.html", locals(),context_instance=RequestContext(request))

# def home(request):
#
#     name="Home"
#
#     return render_to_response("home.html", locals(),context_instance=RequestContext(request))
#
# def contact(request):
#
#     name="contact"
#
#     return render_to_response("home.html", locals(),context_instance=RequestContext(request))
#
# def information(request):
#
#     name="information"
#
#     return render_to_response("home.html", locals(),context_instance=RequestContext(request))
#
# def work(request):
#
#     name="Work..."
#
#     categoryDict = getAllCategoriesCount()
#     tagDict = getAllTagsCount()
#
#     pprint.pprint(categoryDict)
#     pprint.pprint(tagDict)
#
#     posts = getAllPosts()
#
#     return render_to_response("work.html", locals(),context_instance=RequestContext(request))
#
# def filterTag(request,tagSlug):
#
#     name="filterTag" + tagSlug
#
#     categoryDict = getAllCategoriesCount()
#     tagDict = getAllTagsCount()
#
#     posts = getAllPostsFilteredByTag(tagSlug)
#
#     return render_to_response("work.html", locals(),context_instance=RequestContext(request))
#
#
# def filterCategory(request,catSlug):
#
#     name="filterCat" + catSlug
#
#     categoryDict = getAllCategoriesCount()
#     tagDict = getAllTagsCount()
#
#     posts = getAllPostsFilteredByCategory(catSlug)
#
#     return render_to_response("work.html", locals(),context_instance=RequestContext(request))
#
#
# def workDetail(request,postSlug):
#
#     categoryDict = getAllCategoriesCount()
#     tagDict = getAllTagsCount()
#
#     post = getPostBySlug(postSlug)
#
#     return render_to_response("workDetail.html", locals(),context_instance=RequestContext(request))
# # Create your views here.
