const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const axios = require('axios'); // Import axios
require('dotenv').config();  // Load environment variables

const authRoutes = require('./routes/auth'); // Import your auth routes
const interview = require('./routes/interview'); // Import interview routes

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse incoming requests and enable CORS
app.use(cors({
  origin: 'http://localhost:3000', // Make sure the frontend is allowed
  methods: ['GET', 'POST'],
  credentials: true,
}));  // Enable CORS for frontend-backend communication
app.use(express.json({ limit: '700mb' })); // Parse incoming JSON data
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session middleware (used for OAuth sessions)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',  // Use a secret stored in environment variables
  resave: false,
  saveUninitialized: true,
}));

// Initialize passport and manage sessions
app.use(passport.initialize());
app.use(passport.session());  // Persistent login sessions

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 20000
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err.message));

// Passport Serialize/Deserialize
passport.serializeUser((user, done) => {
  done(null, user.id);  // Save only the user ID in the session
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);  // Attach the user object to req.user
  });
});

// Use your authentication routes
app.use('/auth', authRoutes);

// Use the interview routes
app.use('/generate-question', interview);  // Add this line to include the interview routes

// Basic route to test if the server is running
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Emotion detection route
app.post('/detect-emotion', async (req, res) => {
  try {
    const image = req.body.image;  // Base64 image data from frontend
    
    // Send the image to the Python service
    const response = await axios.post('http://localhost:5001/detect-face', { image });
    
    // Send back the emotion result from Python service
    res.json(response.data);
  } catch (error) {
    console.error('Error in emotion detection:', error);
    res.status(500).json({ error: 'Error in facial expression analysis' });
  }
});

// Route to analyze speech
app.post('/analyze-speech', async (req, res) => {
  try {
    const text = req.body.text;  // Speech-to-text transcript from frontend

    // Send the text to the Python service
    const response = await axios.post('http://localhost:5001/analyze-speech', { text });

    // Send back the feedback result from Python service
    res.json(response.data);
  } catch (error) {
    console.error('Error in speech analysis:', error.message);
    res.status(500).json({ error: 'Error in speech analysis' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
