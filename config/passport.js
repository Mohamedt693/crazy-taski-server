import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js'


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    scope: ['profile', 'email'] 
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const userEmail = profile.emails[0].value;

            let user = await User.findOne({ email: userEmail });

            if (user) {
                if (!user.googleId) {
                    user.googleId = profile.id;
                    user.avatar = profile.photos[0].value;
                    await user.save();
                }
                return done(null, user);
            }

            user = await User.create({
                googleId: profile.id,
                displayName: profile.displayName,
                email: userEmail,
                avatar: profile.photos[0].value,
            });

            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }
));

// passport.serializeUser((user, done) => done(null, user.id));

// passport.deserializeUser(async (id, done) => {
//     const user = await User.findById(id);
//     done(null, user);
// });