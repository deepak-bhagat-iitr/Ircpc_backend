const connectToMongo = require('./db');
const express = require('express');
const { sendMail } = require('./utils/sendmail');
var cors = require('cors');
require("dotenv").config();
const multer = require("multer");
const path = require('path');
import('node-fetch').then(fetchModule => {
  const fetch = fetchModule.default;

  // Your existing code that uses fetch goes here
  // Ensure that you wrap your existing code inside this callback function
});// Ensure you have node-fetch installed
const bodyParser = require('body-parser');

connectToMongo();
const app = express();
const port = process.env.PORT || 5000;

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

app.use(cors({
  origin: ['https://ircpc-frontend.vercel.app', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true })); // to handle URL-encoded data
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files

// Define routes
app.use('/api/auth', require('./crud/auth'));
app.use('/api/query', require('./crud/query'));
app.use('/api/profiles', require('./crud/dashboard'));

// Channeli Authentication Route
app.post("/api/auth/channeli", async (req, res) => {
  const client_id = "ghTOIagj0bWyje4tT33ooKMbGiSmbwL7oD0LdlpM";
  const client_secret = "E7WLEzBRzmLwq2hxcl10dQPfX4iw8z8VLERkGnuFvfHf5ZdnqDV9JoteO7npISadedzM3KmedrwnHCcQWV8H8K1UucMkytnXByQ5eu8jiesboROqGYuyPmFYvqtzo29X";
  const grant_type = "authorization_code";
  const authorization_code = req.body.authcode;
  const redirect_uri = "http://localhost:8080/";
  const retrieve_token_uri = "https://channeli.in/open_auth/token/";
  const data = new URLSearchParams();
  data.append('client_id', client_id);
  data.append('client_secret', client_secret);
  data.append('grant_type', grant_type);
  data.append('code', authorization_code);
  data.append('redirect_uri', redirect_uri);

  try {
    const response = await fetch(retrieve_token_uri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: data
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve access token');
    }

    const tokenData = await response.json();
    const access_token = tokenData.access_token;
    const retrieve_data_uri = "https://channeli.in/open_auth/get_user_data/";
    const userDataResponse = await fetch(retrieve_data_uri, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    if (!userDataResponse.ok) {
      throw new Error('Failed to retrieve user data');
    }

    const userData = await userDataResponse.json();
    // Store user data in the session or handle it as needed
    req.session.user = userData;
    res.redirect(redirect_uri);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/profiles/addpatents", upload.single('pdf'), async (req, res) => {
  console.log(req.file);
  try {
    const {
      email,
      title,
      fieldOfInvention,
      detailedDescription,
      inventor,
      committeeMembers,
      status,
      depEmail
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    const details = {
      name: req.file.originalname,
      path: req.file.path
    };

    const newPatent = new Patents({
      email,
      title,
      fieldOfInvention,
      detailedDescription,
      inventor,
      committeeMembers,
      pdf: details,
      status
    });

    console.log(newPatent);
    const savedPatent = await newPatent.save();

    const receiverEmail = depEmail;
    const senderEmail = "iprcelliitr84@gmail.com";
    const emailSubject = "Patent is added";
    const emailMessage = "Congratulations! You have successfully added your patent claim";

    // Send email notifications
    try {
      await sendMail(receiverEmail, senderEmail, emailSubject, emailMessage);
      const websiteURL = `https://ircpc-frontend.vercel.app/ViewPatent?id=${savedPatent._id}`;
      const emailMessage1 = `Someone has added a patent claim, please visit the website to verify: ${websiteURL}`;
      await sendMail(receiverEmail, senderEmail, emailSubject, emailMessage1);
    } catch (emailError) {
      console.error("Error sending email:", emailError.message);
    }

    res.json(savedPatent); // Send the saved patent as response
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

app.get('/api/profiles/addpatents/pdfs', async (req, res) => {
  try {
    const pdfs = await Patents.find({});
    res.json(pdfs);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
