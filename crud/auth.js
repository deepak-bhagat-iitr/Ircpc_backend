const express = require('express');
const router = express.Router();
const Credentials = require('../schema/Credentials')
const bcrypt = require('bcryptjs');
const { response } = require('express');
const Profile = require('../schema/Profile');
// var jwt = require('jsonwebtoken');

// const secret ="IndiaIsGreat";
router.post('/createuser', async (req, res) => {

  let check = await Credentials.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({ error: "Email already exists" })
  }
  const salt = await bcrypt.genSalt(10);
  const hashedpassword = await bcrypt.hash(req.body.password, salt);

  const newuser = await Credentials.create({
    name: req.body.name,
    password: hashedpassword,
    email: req.body.email,
  });

  // const token_creater = {
  //   user: {
  //       id: newuser.id
  //     }
  // }
  // const token = jwt.sign(token_creater, secret);
  const id_new = newuser.id;
  const success = true;
  res.json({ success, id_new });
});

router.post('/login', async (req, res) => {

  const { email, password } = req.body;
  let existing_user = await Credentials.findOne({ email: email });
  if (!existing_user) {
    return res.status(400).json({ error: "Email not registered" })
  }

  const Compare_password = await bcrypt.compare(password, existing_user.password);
  if (!Compare_password) {
    const success = false;
    return res.status(400).json({ success, error: " Invalid Credentials" });
  }
  // const token_creater = {
  //   user: {
  //       id: newuser.id
  //     }
  // }
  // const token = jwt.sign(token_creater, secret);
  impdata = {
    success: true,
    username: '21118014',
    person: {
      fullName: existing_user.name,
      displayPicture: 'static/student_profile/assets/logo.svg'
    },
    student: {
      'branch department name': 'Physics Department',
      enrolmentNumber: '21118014',
    },
    contactInformation: {
      instituteWebmailAddress: existing_user.email,
    }
  }
  const success = true;
  res.json(impdata);
})

router.post('/channeli', async (req, res) => {
  try {
    const { authcode } = req.body;
    const client_id = "ghTOIagj0bWyje4tT33ooKMbGiSmbwL7oD0LdlpM";
    const client_secret = "E7WLEzBRzmLwq2hxcl10dQPfX4iw8z8VLERkGnuFvfHf5ZdnqDV9JoteO7npISadedzM3KmedrwnHCcQWV8H8K1UucMkytnXByQ5eu8jiesboROqGYuyPmFYvqtzo29X";
    const redirect_uri = "http://localhost:8080/";
    const retrieve_token_uri = "https://channeli.in/open_auth/token/";
    const retrieve_data_uri = "https://channeli.in/open_auth/get_user_data/";

    // Start timer for measuring performance
    console.time("tokenAndUserDataFetch");

    // Retrieve access token
    const tokenResponse = await fetch(retrieve_token_uri, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id,
        client_secret,
        grant_type: "authorization_code",
        code: authcode,
        redirect_uri
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to retrieve access token');
    }

    const tokenData = await tokenResponse.json();
    const access_token = tokenData.access_token;

    // Retrieve user data
    const userDataResponse = await fetch(retrieve_data_uri, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${access_token}` }
    });

    if (!userDataResponse.ok) {
      throw new Error('Failed to retrieve user data');
    }

    const userData = await userDataResponse.json();
    console.log(userData);
    // End timer and log the performance time
    console.timeEnd("tokenAndUserDataFetch");

    res.json(userData);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

router.post('/getuser', async (req, res) => {

  try {
    const userId = req.header('id');
    console.log(userId)
    let existing_user = await Profile.findOne({ user: userId });
    const user = await Credentials.findById(userId).select("-password")
    const user_info = [user, existing_user]
    res.send(JSON.stringify(user_info))
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})

module.exports = router