import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import config from "./index.js";

passport.use(new GoogleStrategy({
  clientID: config.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: config.CALLBACK_URL_GOOGLE
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails && profile.emails.length > 0 
      ? profile.emails[0].value 
      : `${profile.id}@google-oauth.fake`; // fallback if no email

    const image = profile.photos && profile.photos.length > 0 
      ? profile.photos[0].value 
      : null;

    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({
        fullName: profile.displayName || "Google User",
        email,
        image,
      });
    }

    const token = jwt.sign({ id: user.id }, config.JWT_SECRET, { expiresIn: "1h" });
    done(null, { user, token });
  } catch (err) {
    done(err, null);
  }
}));


passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_ID,
  clientSecret: process.env.GITHUB_SECRET,
  callbackURL: config.CALLBACK_URL_GITHUB
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails && profile.emails.length > 0
      ? profile.emails[0].value
      : `${profile.username}@github-oauth.fake`; // fallback if no public email

    const image = profile.photos && profile.photos.length > 0
      ? profile.photos[0].value
      : null;

    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({
        fullName: profile.displayName || profile.username,
        email,
        image,
      });
    }

    const token = jwt.sign({ id: user.id }, config.JWT_SECRET, { expiresIn: "1h" });
    done(null, { user, token });
  } catch (err) {
    done(err, null);
  }
}));

