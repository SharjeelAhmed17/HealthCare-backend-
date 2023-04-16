const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const {User} = require('../model/userSchema')
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3002/auth/google/callback',
  // passReqToCallback : true,
}, async (access_token, refreshToken, profile, done) => {
  try {
    // console.log(profile, "profile")
    console.log(profile.id, "profile")
    console.log(profile.displayName, "name")
    // console.log(access_token)
    const googleId = profile.id
    const fullName = profile.displayName
    const user = await User.findOne({ googleId: googleId });
    if(user){
      return done(null,{
        access_token,
          id : user.id,
          fullName : user.fullName,
          role : user.role,
          googleId : googleId
      })
    }else{
      const newUser = new User ({
        googleId : googleId,
        fullName : fullName
      });
      const savedUser = await newUser.save();
      return done(null,{
        access_token,
          id : savedUser.id,
          fullName : savedUser.fullName,
          role : savedUser.role,
          googleId : googleId
      })
    }


  } catch (err) {
    console.log(err)
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  // console.log(user,"serilaize")
  // console.log(user.id,"serilaizeid")
  done(null, user); 
});

passport.deserializeUser((user, done)=>{
  // console.log(user, "deserialize")
done(null, user)
})
