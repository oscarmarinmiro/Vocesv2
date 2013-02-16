__author__ = 'oscarmarinmiro'

# from django.db import models
# from models import Category,Tag,Post
#
# import pprint
#
#
# # Get Dictionary with all category slugs and counts
#
# def getAllCategoriesCount():
#
# 	# Take all categories...
#
# 	categories = Category.objects.all()
#
# 	categoryHash = {}
#
# 	# And for each one, query matching posts, and build a dict
#
# 	for category in categories:
# 		name = category.name
# 		totalCount = Post.objects.filter(category=category).count()
# 		categoryHash[name] = {'slug':category.slugName,'count':totalCount}
#
# 	return categoryHash
#
# # Get Dictionary with all tag slugs and counts
#
# def getAllTagsCount():
#
# 	# Take all tags..
#
# 	tags = Tag.objects.all()
#
# 	tagHash = {}
#
# 	# And for each one, query matching posts, and build a dict
#
# 	for tag in tags:
# 		name = tag.name
# 		totalCount = Post.objects.filter(tags=tag).count()
# 		tagHash[name] = {'slug':tag.slugName,'count':totalCount}
#
# 	return tagHash
#
# # Get *all* posts
#
# def getAllPosts():
#
# 	posts = Post.objects.all()
#
# 	return posts
#
# # Get all posts filtered by a tag slug
#
# def getAllPostsFilteredByTag(tagSlug):
#
# 	posts = Post.objects.filter(tags__slugName=tagSlug)
#
# 	return posts
#
# # Get all posts filtered by a category slug
#
# def getAllPostsFilteredByCategory(catSlug):
#
# 	posts = Post.objects.filter(category__slugName=catSlug)
#
# 	return posts
#
# # Get a post given its slug
#
# def getPostBySlug(postSlug):
#
# 	post = Post.objects.filter(slugName = postSlug)
#
# 	return post[0]
#
