const connectToMongo = require('./db');
const express = require('express');
const { sendMail } = require('./utils/sendmail');
var cors = require('cors');
require("dotenv").config();
const multer = require("multer");
const path = require('path');
const Patents = require('./schema/Patents'); // Ensure you import the Patents model

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
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files

// Define routes
app.use('/api/auth', require('./crud/auth'));
app.use('/api/query', require('./crud/query'));
app.use('/api/profiles', require('./crud/dashboard'));



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
