const express = require("express");
const Profile = require("../schema/Profile");
const router = express.Router();
const Patents = require("../schema/Patents");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../utils/sendmail");
const moment = require("moment");
const Query = require('../schema/Query');


router.get("/getpatents", async (req, res) => {
  try {
    const allPatents = await Patents.find();
    // filter according to users bad me laga denge
    // console.log(allPatents)
    res.json(allPatents);
  }
  catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});




router.get("/patents/:email", async (req, res) => {
  try {
    if (req.params.email == 'admin@ipr.iitr.ac.in') {
      const allPatents = await Patents.find();
      return res.json(allPatents);
    }
    const patent = await Patents.find({ email: req.params.email });
    if (!patent) {
      return res.status(404).json({ message: "Patent not found" });
    }
    res.json(patent);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

router.get("/patent/:id", async (req, res) => {
  try {
    const patent = await Patents.findById(req.params.id);
    if (!patent) {
      return res.status(404).json({ message: "Patent not found" });
    }
    res.json(patent);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});
router.put("/patents/:id/approve", async (req, res) => {
  try {
    const patent = await Patents.findById(req.params.id);
    if (!patent) {
      return res.status(404).json({ message: "Patent not found" });
    }

    patent.status.HOD = true;
    await patent.save();
    const receiverEmail = "athgupta2005@gmail.com";
    const senderEmail = "riyajindal769@gmail.com";
    const websiteURL = `http://localhost:8080/ViewPatentDetail?id=${req.params.id}`;
    const emailSubject = "Patent is approved ";
    const emailMessage =
      `A new patent is approved by HOD. Please visit the website to see the patent details and approve the commitee : ${websiteURL}`;

    await sendMail(receiverEmail, senderEmail, emailSubject, emailMessage);
    res.json(patent);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});
router.put("/patents/:id/reject", async (req, res) => {
  try {
    const patent = await Patents.findById(req.params.id);
    if (!patent) {
      return res.status(404).json({ message: "Patent not found" });
    }

    patent.status.HOD = false;
    await patent.save();

    res.json(patent);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});
router.put("/updatepatent/:id", async (req, res) => {
  try {
    const {
      email,
      title,
      fieldOfInvention,
      background,
      summary,
      drawings,
      detailedDescription,
      claims,
      inventor,
      references,
      acknowledgments,
      committeeMembers,
    } = req.body;

    // Create a newPatent object
    const newPatent = {};
    if (email) {
      newPatent.email = email;
    }
    if (title) {
      newPatent.title = title;
    }
    if (fieldOfInvention) {
      newPatent.fieldOfInvention = fieldOfInvention;
    }
    if (background) {
      newPatent.background = background;
    }
    if (summary) {
      newPatent.summary = summary;
    }
    if (drawings) {
      newPatent.drawings = drawings;
    }
    if (detailedDescription) {
      newPatent.detailedDescription = detailedDescription;
    }
    if (claims) {
      newPatent.claims = claims;
    }
    if (inventor) {
      newPatent.inventor = inventor;
    }
    if (references) {
      newPatent.references = references;
    }
    if (acknowledgments) {
      newPatent.acknowledgments = acknowledgments;
    }
    if (committeeMembers) {
      newPatent.committeeMembers = committeeMembers;
    }

    // Find the patent to be updated and update it
    let patent = await Patents.findById(req.params.id);
    if (!patent) {
      return res.status(404).send("Not Found");
    }

    // Add any additional conditions for authorization if needed
    // For example, you might want to check if the user making the request has the right permissions

    updatedPatent = await Patents.findByIdAndUpdate(
      req.params.id,
      { $set: newPatent },
      { new: true }
    );
    const receiverEmail = "athgupta2005@gmail.com";
    const senderEmail = "riyajindal769@gmail.com";
    const emailSubject = "Patent is updated";
    const emailMessage =
      "Congratulations! You have successfully updated your patent claim";

    await sendMail(receiverEmail, senderEmail, emailSubject, emailMessage);
    res.json({ updatedPatent });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

router.post("/addprofile", async (req, res) => {
  try {
    const { age, gender, mobile } = req.body;
    const savedProfile = await Profile.create({
      age: age,
      gender: gender,
      mobile: mobile,
      user: req.header("id"),
    });

    res.json(savedProfile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

router.put("/updateprofile/:id", async (req, res) => {
  const { age, gender, mobile } = req.body;

  // Create a newProfile object
  const newProfile = {};
  if (age) {
    newProfile.age = age;
  }
  if (gender) {
    newProfile.gender = gender;
  }
  if (mobile) {
    newProfile.mobile = mobile;
  }

  // Find the note to be updated and update it
  let profile = await Profile.findById(req.params.id);
  if (!profile) {
    return res.status(404).send("Not Found");
  }

  if (profile.user.toString() !== req.header("id")) {
    return res.status(401).send("Not Allowed");
  }
  updatedprofile = await Profile.findByIdAndUpdate(
    req.params.id,
    { $set: newProfile },
    { new: true }
  );
  res.json({ updatedprofile });
});
// router.get("/patents/:id/committee", async (req, res) => {
//   try {
//     const patent = await Patents.findById(req.params.id);
//     if (!patent) {
//       return res.status(404).json({ message: "Patent not found" });
//     }

//     res.json(patent.committeeMembers);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send("Server Error");
//   }
// });
router.put(
  "/accept-committee/:patentId/:committeeMemberId",
  async (req, res) => {
    try {
      const { patentId, committeeMemberId } = req.params;

      // Find the patent by ID
      const patent = await Patents.findById(patentId);
      if (!patent) {
        return res.status(404).json({ message: "Patent not found" });
      }

      // Find the committee member by ID
      const committeeMember = patent.committeeMembers.id(committeeMemberId);
      if (!committeeMember) {
        return res.status(404).json({ message: "Committee member not found" });
      }

      // Update the status of the committee member to accept
      committeeMember.approved = true;
      await patent.save();

      res.json({ message: "Committee member accepted successfully" });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// Route to reject a committee member
router.put(
  "/reject-committee/:patentId/:committeeMemberId",
  async (req, res) => {
    try {
      const { patentId, committeeMemberId } = req.params;

      // Find the patent by ID
      const patent = await Patents.findById(patentId);
      if (!patent) {
        return res.status(404).json({ message: "Patent not found" });
      }

      // Find the committee member by ID
      const committeeMember = patent.committeeMembers.id(committeeMemberId);
      if (!committeeMember) {
        return res.status(404).json({ message: "Committee member not found" });
      }

      // Update the status of the committee member to reject
      committeeMember.approved = false;
      await patent.save();

      res.json({ message: "Committee member rejected successfully" });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);
router.get(
  "/send-emailto-committee/:patentId",
  async (req, res) => {
    try {
      const { patentId } = req.params;
      const patent = await Patents.findById(patentId);
      if (!patent) {
        return res.status(404).json({ message: "Patent not found" });
      }
      patent.status.ADI = true;
      const committeeMembers = patent.committeeMembers.filter(
        (member) => member.approved == true
      );
      console.log(committeeMembers);
      committeeMembers.forEach(async (member) => {
        const payload = {
          patentId: patentId,
          committeeMemberId: member._id,
          receiverEmail: member.email
        };
        const secretKey = 'secretKey';
        const options = {
          expiresIn: '0.5h' // Token expiration time
        };
        const token = jwt.sign(payload, secretKey, options);
        const receiverEmail = member.email;
        const senderEmail = "riyajindal769@gmail.com";
        const emailSubject = "Invitation to Join Committee";
        const emailMessage = `You have been approved to join the committee. Click the following link to accept: http://localhost:5000/api/profiles/accept-invite/${token} or reject: http://localhost:5000/api/profiles/reject-invite/${token} the invitation `;
        await sendMail(receiverEmail, senderEmail, emailSubject, emailMessage);
      });
      res.status(200).json({ message: "Emails sent successfully" });
    } catch (error) {
      console.error("Error sending emails to committee members:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get('/accept-invite/:token', async (req, res) => {
  try {
    const { token } = req.params;
    let decoded = null;
    try {
      decoded = jwt.verify(token, "secretKey");
      console.log(decoded); // Log the decoded token
    } catch (error) {
      console.error("JWT verification failed:", error.message);
    }

    const patentId = decoded.patentId;
    const committeeMemberId = decoded.committeeMemberId;
    const patent = await Patents.findById(patentId);
    if (!patent) {
      return res.status(404).send("Patent not found");
    }
    const committeeMember = patent.committeeMembers.id(committeeMemberId);
    if (!committeeMember) {
      return res.status(404).send("Committee member not found");
    }
    committeeMember.joined = true;
    await committeeMember.save();
    res.send("Invitation accepted successfully!");
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});


router.get("/reject-invite/:token", async (req, res) => {
  try {
    const { token } = req.params;
    let decoded = null;
    try {
      decoded = jwt.verify(token, "secretKey");
      console.log(decoded); // Log the decoded token
    } catch (error) {
      console.error("JWT verification failed:", error.message);
    }

    const patentId = decoded.patentId;
    const committeeMemberId = decoded.committeeMemberId;
    const patent = await Patents.findById(patentId);
    if (!patent) {
      return res.status(404).send("Patent not found");
    }
    const committeeMember = patent.committeeMembers.id(committeeMemberId);
    if (!committeeMember) {
      return res.status(404).send("Committee member not found");
    }
    committeeMember.joined = false;
    await committeeMember.save();
    res.send("Invitation rejected!");
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

router.post("/dateofmeeting/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { dateOfMeeting } = req.body;
    const patent = await Patents.findById(id);
    if (!patent) {
      return res.status(404).json({ message: "Patent not found" });
    }
    const parsedDateOfMeeting = moment(dateOfMeeting, true);
    if (!parsedDateOfMeeting.isValid()) {
      return res.status(400).json({
        message: "Invalid date format.",
      });
    }
    patent.dateOfMeeting = parsedDateOfMeeting.toDate(); // Convert moment object to JavaScript Date object
    await patent.save();
    const committeeMembers = patent.committeeMembers;
    committeeMembers.forEach(async (member) => {
      const receiverEmail = member.email;
      const senderEmail = "iprcelliitr84@gmail.com";
      const emailSubject = "Date for IPAC Meeting";
      const emailMessage = `The date for the IPAC meeting has been set to ${parsedDateOfMeeting.format('DD-MM-YYYY HH:mm')}. Please visit the IR Cell on the date.`;
      await sendMail(receiverEmail, senderEmail, emailSubject, emailMessage);
    });
    console.log("EMAIL sent successfully!");
    res.status(200).json({ message: "Emails sent successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});


module.exports = router;
