# -*- coding: utf-8 -*-

import sys
import json
import random
from datetime import datetime,timedelta


# FILES

FILE_OUT = "bulkInsert.json"

#GEO STUFF

MIN_LAT=37.07
MIN_LNG=-8.55
MAX_LAT=43.26
MAX_LNG=4.35

LAT_THRESHOLD = 0.001
LNG_THRESHOLD = 0.001

#EVERYTHING ELSE

USERS_LIMIT = 200
CALLS_LIMIT = 100
MAPPING_LIMIT = 100
DATE_FORMAT = '%Y%m%d%H%M%S'
TWITTER_DATE_FORMAT = '%Y-%m-%dT%H:%M:%DZ'
MYSQL_DATE_FORMAT = '%Y-%m-%d %H:%M:%SZ'
DATE_LIMIT = 604800
CHECKIN_DATE_LIMIT = 86400
MAPPING_DATE_LIMIT = 259200
BASE_DATE = datetime.strptime('20130201000000',DATE_FORMAT)
ID_LEN = 18
USER_ID_LEN = 8
HTS = [u'cañas',u'sentada',u'desahucio',u'puede',u'quesi',u'queno']

def insert_call(checkins,mappings,call_date):
    call_id = get_tweet_id()

    call_text = "@vote_outliers ¡ texto guarro"

    call_user = users[random.randint(0,len(users)-1)]

    call_geo = get_geo()


    call = {
        "pk": call_id,
        "model": "vocesBack.tweet", 
        "fields": {
            "rt": 0, 
            "votes": checkins+mappings, 
            "relevanceSecond": 0, 
            "mediaUrl": "", 
            "stamp": call_date.strftime(MYSQL_DATE_FORMAT), 
            #"stamp": call_date,
            "text": call_text, 
            "userId": call_user['pk'], 
            "relevanceFirst": 0, 
            "hashTag": HTS[random.randint(0,len(HTS)-1)],
            "lat": call_geo[0],
            "lng": call_geo[1],
            "inReplyToId": -1
        }
    }
    
    return call

def insert_new_call(new_call_id,tweetId):
    
    new_call = {
        "pk": new_call_id,
        "model": "vocesBack.call",
        "fields": {
            "tweetId":tweetId
        }
    }

    return new_call


def insert_checkin(user_id,checkin_date,call_id,call_geo):

    checkin_id = get_tweet_id()

    #checkin_date = call_date+timedelta(seconds=random.randint(0,CHECKIN_DATE_LIMIT))

    checkin_geo = get_checkin_geo(call_geo)

    checkin_text = "@vote_outliers textoguarro de checkin"

    checkin = {
        "pk": 302802325280522240, 
        "model": "vocesBack.tweet", 
        "fields": {
            "rt": 0, 
            "votes": 0, 
            "relevanceSecond": 0, 
            "mediaUrl": "", 
            "stamp": checkin_date.strftime(MYSQL_DATE_FORMAT), 
            #"stamp": checkin_date,
            "text": checkin_text, 
            "userId": user_id, 
            "relevanceFirst": 0, 
            "hashTag": "test", 
            "lat": checkin_geo[0], 
            "lng": checkin_geo[1],
            "inReplyToId": call_id
        }
    }

    return checkin

def insert_mapping(call_date,call_id):
    
    mapping_id = get_tweet_id()

    mapping_date = call_date+timedelta(seconds=random.randint(0,MAPPING_DATE_LIMIT))

    mapping_geo = get_geo()

    mapping_text = "@vote_outliers textoguarro de mapping"

    mapping_user = users[random.randint(0,len(users)-1)]

    mapping = {
        "pk": mapping_id,
        "model": "vocesBack.tweet",
        "fields": {
            "rt": 0,
            "votes": 0,
            "relevanceSecond": 0,
            "mediaUrl": "",
            "stamp": mapping_date.strftime(MYSQL_DATE_FORMAT),
            #"stamp": mapping_date,
            "text": mapping_text,
            "userId": mapping_user['pk'],
            "relevanceFirst": 0,
            "hashTag": "test",
            "lat": mapping_geo[0],
            "lng": mapping_geo[1],
            "inReplyToId": call_id
        }
    }

    return mapping

def get_user():
    
    user_id=get_user_id()
    user_img = "http://a0.twimg.com/profile_images/3050237358/5be019cab4225f50bc2e4fb2ff1a0e3c_normal.jpeg"
    user_name = "dummy"

    user = {
        "pk": user_id, 
        "model": "vocesBack.user", 
        "fields": {
            "profileImgUrl": user_img, 
            "screenName": user_name+user_id, 
            "karma": 0, 
            "name": user_name
        }
    }

    return user

def get_checkin(checkin_id,call_id,user_id,checkin_date):

    checkin = {
        "pk":checkin_id,
        "model": "vocesBack.checkin",
        "fields":{
            "userId":user_id,
            "stamp":checkin_date.strftime(MYSQL_DATE_FORMAT),
            #"stamp":checkin_date,
            "callId":call_id,
        }
    }

    return checkin


def get_geo():
    lat = MIN_LAT + ((MAX_LAT-MIN_LAT)*random.random())
    lng = MIN_LNG + ((MAX_LNG-MIN_LNG)*random.random())
    return [lat,lng]
    
def get_checkin_geo(call_geo):
    lat = call_geo[0] + (((call_geo[0] + LAT_THRESHOLD) - (call_geo[0] - LAT_THRESHOLD))*random.random())
    lng = call_geo[1] + (((call_geo[1] + LNG_THRESHOLD) - (call_geo[1] - LNG_THRESHOLD))*random.random())
    return [lat,lng]

def get_tweet_id():
    gen_id = ''
    for i in range(ID_LEN):
        gen_id += str(random.randint(0,9))

    print "ID: -%s-" % gen_id
    return gen_id

def get_user_id():
    gen_id = ''
    for i in range(USER_ID_LEN):
        gen_id += str(random.randint(0,9))

    print "ID: -%s-" % gen_id
    return gen_id



users = list()

todo = list()

for i in range(USERS_LIMIT):
    user = get_user()
    users.append(user)
    todo.append(user)

print users


nuevo = list()

checkin_id=0

for i in range(CALLS_LIMIT):
    checkins = random.randint(0,len(users))
    mappings = random.randint(0,MAPPING_LIMIT)

    call_date = BASE_DATE + timedelta(seconds=(random.randint(0,DATE_LIMIT)))

    call = insert_call(checkins,mappings,call_date)
    print call
    #nuevo.append(call)
    todo.append(call)
    print nuevo

    todo.append(insert_new_call(i,call['pk']))

    call_geo = [call['fields']['lat'],call['fields']['lng']]
    print "geo %s " % call_geo
    for j in range(checkins):
        checkin_date = call_date+timedelta(seconds=random.randint(0,CHECKIN_DATE_LIMIT))
        todo.append(insert_checkin(users[j]['pk'],checkin_date,call['pk'],[call['fields']['lat'],call['fields']['lng']]))
        checkin_id+=1
        todo.append(get_checkin(checkin_id,call['pk'],users[j]['pk'],checkin_date))
    for k in range(mappings):
        #nuevo.append(insert_mapping(call_date,call['pk']))
        todo.append(insert_mapping(call_date,call['pk']))




exit_file = open(FILE_OUT,'w')

exit_file.write(json.dumps(todo,indent=4))

exit_file.close()
