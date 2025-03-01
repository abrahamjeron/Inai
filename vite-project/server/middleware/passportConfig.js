import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const GOOGLE_CLIENT_ID = "94490572892-vnb75eeprlnokfied1t3pjaneotj32lg.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";
const CALLBACK_URL = "https://inai-0og5.onrender.com/auth/google/callback";

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Update this section in passportConfig.js
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Add logging to debug the profile data
      console.log("Google profile:", profile);
      
      // Make sure profile.emails exists before accessing it
      const email = profile.emails && profile.emails.length > 0 
        ? profile.emails[0].value 
        : null;
        
      if (!email) {
        return done(new Error('No email found in Google profile'), null);
      }
      
      let user = await User.findOne({ email });
      if (!user) {
        const newUser = new User({
          username: profile.displayName.replace(/\s/g, "") + Math.floor(Math.random() * 1000),
          email,
          googleId: profile.id,
          avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
          password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10)
        });
        await newUser.save();
        return done(null, newUser);
      }
      return done(null, user);
    } catch (error) {
      console.error("Google auth error:", error);
      return done(error, null);
    }
  }
));

export default passport;