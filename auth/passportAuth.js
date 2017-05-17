module.exports = function(passport,FacebookStrategy,config,mongoose){

	//the schema which will be saved in our Mongo DB
	var chatUser = new mongoose.Schema({
		profileID:String,
		fullname:String,
		profilePic:String
	})

	//model for our schema
	var userModel = mongoose.model('chatUser',chatUser);
	//storing user.id given by mongoose for each record in session so that it is available across pages
	passport.serializeUser(function(user,done){
		done(null,user.id);
	});
	//whenver data pertaining to some user comes search for it in database and returns it
	passport.deserializeUser(function(id,done){
		userModel.findById(id,function(err,user){
			done(err,user);
		})
	})

	passport.use(new FacebookStrategy({
		clientID:config.fb.appID,
		clientSecret:config.fb.appSecret,
		callbackURL:config.fb.callbackURL,
		profileFields:['id','displayName','photos']
	},function(accessToken,refreshToken,profile,done){
		//check if the user exists in our MOngo DB
		//if not , create one and return the profile
		//if user exists, simply return the profile
		userModel.findOne({'profileID':profile.id},function(err,result){
			if(result){
				done(null,result);
			}
			else{
				console.log("here");
				//create new user in our mongo account
				var newChatUser = new userModel({
					profileID:profile.id,
					fullname:profile.displayName,
					profilePic:profile.photos[0].value || ''
				});
				newChatUser.save(function(err){
					done(null,newChatUser);
				})
			}
		})
	}))
}