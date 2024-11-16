const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Adjust the destination folder as needed


// OAuth Strategies
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

// JWT Helper Functions (expires in 3 hours)
const generateToken = (user) => {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '3h' });
};

// Helper Function to Hash Passwords
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Helper Function to Create a New User
const createUser = async (userDetails) => {
  const hashedPassword = await hashPassword(userDetails.password);
  const newUser = new User({ ...userDetails, password: hashedPassword });
  await newUser.save();
  return newUser;
};

// Helper Function to Find or Create User from OAuth
const findOrCreateUser = async (profile, providerId) => {
  const userData = {
    name: profile.displayName,
    email: profile.emails[0]?.value || '',
  };
  userData[`${providerId}Id`] = profile.id;

  let user = await User.findOne({ [`${providerId}Id`]: profile.id });

  if (!user) {
    user = await createUser(userData);
  }

  return user;
};

// =======================
// Google OAuth Strategy
// =======================
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await findOrCreateUser(profile, 'google');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

// =======================
// Facebook OAuth Strategy
// =======================
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: "/auth/facebook/callback",
  profileFields: ['id', 'displayName', 'emails'] // Specify the fields you want to retrieve
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await findOrCreateUser(profile, 'facebook');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

// =======================
// LinkedIn OAuth Strategy
// =======================
passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: "/auth/linkedin/callback",
  scope: ['openid', 'profile', 'email', 'w_member_social']
}, async (accessToken, tokenSecret, profile, done) => {
  try {
    const user = await findOrCreateUser(profile, 'linkedin');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

// OAuth Login Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/facebook', passport.authenticate('facebook'));
router.get('/linkedin', passport.authenticate('linkedin'));

// OAuth Callback Routes
const handleOAuthCallback = (req, res) => {
  const token = generateToken(req.user); // Generate JWT with 3-hour expiration
  res.redirect(`/home?token=${token}`); // Pass token to frontend
};

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), handleOAuthCallback);
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), handleOAuthCallback);
router.get('/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/' }), handleOAuthCallback);

// ==========================
// JWT Login and Signup Routes
// ==========================

// Login Route (JWT Authentication)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(user); // Generate JWT with 3-hour expiration
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Signup Route (JWT Authentication)
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const newUser = await createUser({ name, email, password });
    const token = generateToken(newUser); // Generate token after signup with 3-hour expiration
    res.status(201).json({ token, message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expecting 'Bearer <token>'
  if (!token) {
    return res.status(403).json({ message: 'A token is required for authentication' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  next();
};

// Protected route example
router.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'This is a protected route accessible only with a valid token.' });
});

// Profile route (for authenticated users)
router.get('/profile', verifyToken, async (req, res) => {
  try {
      const userId = req.user.userId;

      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      const { password, ...userProfile } = user.toObject();
      res.json({ user });
  } catch (err) {
      console.error('Error fetching user profile:', err); // Corrected line
      res.status(500).json({ message: 'Server error' });
  }
});


router.put('/profile', upload.fields([{ name: 'profilePicture' }, { name: 'resume' }]), verifyToken, async (req, res) => {
  try {
      const userId = req.user.userId;

      // Extract the update data from the request body
      const updateData = req.body;

      // Process file uploads if any
      if (req.files) {
          if (req.files.profilePicture) {
              updateData.profilePicture = req.files.profilePicture[0].path; // Store the path to the uploaded file
          }
          if (req.files.resume) {
              updateData.resume = req.files.resume[0].path; // Store the path to the uploaded file
          }
      }

      // Update user data in the database
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
      if (!updatedUser) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Return the updated user profile without the password
      const { password, ...userProfile } = updatedUser.toObject();
      res.json({ user: userProfile, message: 'Profile updated successfully' });
  } catch (err) {
      console.error('Error updating user profile:', err);
      res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
