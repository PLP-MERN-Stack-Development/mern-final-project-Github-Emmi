// backend/config/passport.js
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback',
      scope: ['user:email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract email from profile
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        
        if (!email) {
          return done(new Error('No email found in GitHub profile'), null);
        }

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
          // Update user's GitHub info if they exist
          if (!user.githubId) {
            user.githubId = profile.id;
            user.avatarUrl = user.avatarUrl || profile.photos[0]?.value;
            await user.save();
          }
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          name: profile.displayName || profile.username,
          email,
          githubId: profile.id,
          avatarUrl: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
          role: 'student', // Default role
          emailVerified: true, // GitHub emails are verified
          isActive: true,
          bio: profile.bio || 'Learning to code',
          passwordHash: Math.random().toString(36).slice(-12) // Random password for OAuth users
        });

        done(null, user);
      } catch (error) {
        console.error('GitHub OAuth error:', error);
        done(error, null);
      }
    }
  )
);

module.exports = passport;
