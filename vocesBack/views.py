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

# Create your views here.

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
