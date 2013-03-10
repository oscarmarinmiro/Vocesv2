__author__ = 'oscarmarinmiro'

from flask import redirect, url_for, session, request, flash, Flask,render_template
import tweepy

app = Flask(__name__)

app.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'

#config

CONSUMER_TOKEN='e3IZVUnTQJzvYRUUK00DA'
CONSUMER_SECRET='ZetmYzr0fqF9dsnhtev9NnHCoEgXHMXqpWXrZXkSKQ'
CALLBACK_URL = 'http://localhost:5000/verify'

db = dict() #you can save these values to a database

@app.route("/")
def send_token():
	auth = tweepy.OAuthHandler(CONSUMER_TOKEN,
		CONSUMER_SECRET,
		CALLBACK_URL)

	try:
	#get the request tokens
		redirect_url= auth.get_authorization_url()
		session['request_token']= (auth.request_token.key,
								   auth.request_token.secret)
	except tweepy.TweepError:
		print 'Error! Failed to get request token'

	#this is twitter's url for authentication
	return redirect(redirect_url)

@app.route("/verify")
def get_verification():

	#get the verifier key from the request url
	verifier= request.args['oauth_verifier']

	auth = tweepy.OAuthHandler(CONSUMER_TOKEN, CONSUMER_SECRET)
	token = session['request_token']
	del session['request_token']

	auth.set_request_token(token[0], token[1])

	try:
		auth.get_access_token(verifier)
	except tweepy.TweepError:
		print 'Error! Failed to get access token.'

	#now you have access!
	api = tweepy.API(auth)

	#store in a db
	db['api']=api
	db['access_token_key']=auth.access_token.key
	db['access_token_secret']=auth.access_token.secret
	return redirect(url_for('start'))

@app.route("/start")
def start():
	#auth done, app logic can begin
	api = db['api']

	#example, print your latest status posts
	return render_template('tweets.html', tweets=api.user_timeline())

if __name__ == "__main__":
	app.run(debug=True)
