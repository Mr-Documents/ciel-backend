// The google OAuth and sessions, with cookies as well.

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new LocalStrategy({ usernameField: "username" }, async (username, password, done) => {
    try {
      const user = await User.findOne({ email: username });
      if (!user) return done(null, false, { message: "Incorrect email" });

      const valid = await bcrypt.compare(password, user.password);
      return valid ? done(null, user) : done(null, false, { message: "Incorrect password" });
    } catch (err) {
      return done(err);
    }
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/secrets",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.email });
        if (!user) {
          user = new User({ email: profile.email, password: "google", googleId: profile.id });
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
