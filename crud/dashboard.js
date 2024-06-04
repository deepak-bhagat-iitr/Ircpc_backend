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

// Approve patent route
router.put("/patents/:id/approve", async (req, res) => {
  try {
    const patent = await Patents.findById(req.params.id);
    if (!patent) {
      return res.status(404).json({ message: "Patent not found" });
    }

    patent.status.HOD = true;
    await patent.save();

    const receiverEmail = patent.email;
    const senderEmail = "iprcelliitr84@gmail.com";
    const emailSubject = "Patent is approved by HOD";
    const emailMessage = `A new patent is approved by HOD`;

    const AdiEmail = "deepak1@me.iitr.ac.in"; // ADI
    const senderGmail = "iprcelliitr84@gmail.com";
    const websiteURL = `https://ircpc-frontend.vercel.app/ViewPatentDetail?id=${req.params.id}`;
    const Subject = "Patent is approved by HOD";
    const Message = `HOD approve the details, please visit the website to verify: ${websiteURL}`;




    await sendMail(receiverEmail, senderEmail, emailSubject, emailMessage);
    await sendMail(AdiEmail, senderGmail, Subject, Message);
    res.json(patent);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// Reject patent route
router.put("/patents/:id/reject", async (req, res) => {
  try {
    const patent = await Patents.findById(req.params.id);
    if (!patent) {
      return res.status(404).json({ message: "Patent not found" });
    }

    patent.status.HOD = false;
    await patent.save();

    const receiverEmail = patent.email;
    const senderEmail = "iprcelliitr84@gmail.com";
    const websiteURL = `https://ircpc-frontend.vercel.app/ViewPatentDetail?id=${req.params.id}`;
    const emailSubject = "Patent is rejected by HOD";
    const emailMessage = `A patent has been rejected by HOD`;

    await sendMail(receiverEmail, senderEmail, emailSubject, emailMessage);
    res.json(patent);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});




// Approve patent route
router.put("/DSRI/patents/:id/approve", async (req, res) => {
  try {
    const patent = await Patents.findById(req.params.id);
    if (!patent) {
      return res.status(404).json({ message: "Patent not found" });
    }

    patent.status.DSRIC = true;
    await patent.save();

    const receiverEmail = patent.email;
    const senderEmail = "iprcelliitr84@gmail.com";

    const AdiEmail = "deepak1@me.iitr.ac.in"; // ADI
    const senderGmail = "iprcelliitr84@gmail.com";
    const Subject = "Patent is approved by DSRIC";
    const Message = `DSRI add some comment and approve`;


    // Sending the initial email to ADI
    await sendMail(AdiEmail, senderGmail, Subject, Message);

    // Sending the detailed message to the patent owner
    const detailedSubject = "DSRIC Approved Your Patent Assessment";
    const detailedMessage = `
    Prof. X,
    Department of PQR,

    In order to assess the disclosures entitled “XXXXXXXXXXXXX” submitted by you, the following Intellectual Property Assessment Committee (IPAC) is approved by the competent authority.

    (i) Prof. Vivek Kumar Malik, ADII (Chairman)
    (ii) Prof. PP, (XXX)
    (iii) Prof. QQ, (YYY)
    (iv) Prof. RR, (ZZZ)

    You are requested to coordinate with IPAC members so that meeting of IPAC can be held at the earliest. This is for your information and necessary action.
    
    DSRIC Comment: ${patent.DSRICOMM}

    (Prof. Vivek Kumar Malik)
    Coordinator, IPR Cell
  `;

    await sendMail(receiverEmail, senderEmail, detailedSubject, detailedMessage.trim());

    res.json(patent);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// Reject patent route
router.put("DSRI/patents/:id/reject", async (req, res) => {
  try {
    const patent = await Patents.findById(req.params.id);
    if (!patent) {
      return res.status(404).json({ message: "Patent not found" });
    }

    patent.status.DSRIC = false;
    await patent.save();

    const receiverEmail = patent.email;
    const senderEmail = "iprcelliitr84@gmail.com";
    // const websiteURL = `https://ircpc-frontend.vercel.app/ViewPatentDetail?id=${req.params.id}`;
    const emailSubject = "Patent is rejected by DSRIC";
    const emailMessage = `DSRI add some comment and rejected`;


    const AdiEmail = "deepak1@me.iitr.ac.in"; // ADI
    const senderGmail = "iprcelliitr84@gmail.com";
    // const websiteURL = `https://ircpc-frontend.vercel.app/ViewPatentDetail?id=${req.params.id}`;
    const Subject = "Patent is approved by DSRIC";
    const Message = `DSRI add some comment and rejected`;


    await sendMail(receiverEmail, senderEmail, emailSubject, emailMessage);
    await sendMail(AdiEmail, senderGmail, Subject, Message);
    res.json(patent);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});


router.post("/patents/:id/comment", async (req, res) => {
  try {
    let patent = await Patents.findById(req.params.id);
    if (!patent) {
      return res.status(404).send("Patent not found");
    }
    const { comment } = req.body;
    console.log(comment)
    // patent.DSRICOMM = patent.comments || [];
    patent.DSRICOMM = comment;
    await patent.save();
    res.json({ message: "Comment posted" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});


// Delete committee member
router.delete('/delete-committee/:patentId/:committeeMemberId', async (req, res) => {
  const { patentId, committeeMemberId } = req.params;
  console.log(patentId);
  console.log(committeeMemberId);
  try {
    const patent = await Patents.findById(patentId);
    console.log(patent);
    if (!patent) return res.status(404).json({ msg: 'Patent not found' });

    // Find the committee member index
    const memberIndex = patent.committeeMembers.findIndex(member => member._id.toString() === committeeMemberId);
    if (memberIndex === -1) return res.status(404).json({ msg: 'Committee member not found' });

    // Remove the committee member
    patent.committeeMembers.splice(memberIndex, 1);
    await patent.save();
    res.json({ msg: 'Committee member removed' });
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error });
  }
});

// Add committee member
router.post('/add-committee/:patentId', async (req, res) => {
  const { patentId } = req.params;
  const newMembers = req.body; // Expecting an array of committee member objects
  try {
    const patent = await Patents.findById(patentId);
    if (!patent) return res.status(404).json({ msg: 'Patent not found' });

    newMembers.forEach(member => {
      patent.committeeMembers.push(member);
    });

    await patent.save();
    res.json(patent.committeeMembers); // Return the updated committee members
  } catch (error) {
    res.status(500).json({ msg: 'Server error', error });
  }
});

router.post("/ADI/approve/comemb/:id", async (req, res) => {
  try {
    let patent = await Patents.findById(req.params.id);
    if (!patent) {
      return res.status(404).send("Patent not found");
    }
    patent.status.ADI = true; // Assuming status is an object with ADI property
    await patent.save();

    // Debugging: Log the updated patent object
    console.log(patent);

    const receiverEmail = patent.email;
    const senderEmail = "iprcelliitr84@gmail.com";
    const emailSubject = "Patent Committee Members Updated";
    const emailMessage =
      "Congratulations! The committee members for your patent have been approved.";

    await sendMail(receiverEmail, senderEmail, emailSubject, emailMessage);

    // Send email to committee members
    if (Array.isArray(patent.committeeMembers)) {
      const committeeEmailSubject = "You Have Been Approved as a Committee Member";
      const committeeEmailMessage =
        "Dear Committee Member, you have been approved as a committee member for a patent.";

      for (const member of patent.committeeMembers) {
        if (member.email) {
          await sendMail(member.email, senderEmail, committeeEmailSubject, committeeEmailMessage);
        }
      }
    }

    res.json("done");
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

router.post("/DSRI/recommendation/:id", async (req, res) => {
  try {

    let patent = await Patents.findById(req.params.id);
    if (!patent) {
      return res.status(404).send("Patent not found");
    }

    const receiverEmail = "deepak988088@gmail.com";
    const senderEmail = "iprcelliitr84@gmail.com";
    const websiteURL = `https://ircpc-frontend.vercel.app/DSRI?id=${req.params.id}`;

    const emailSubject = "Report of IPAC";
    const emailMessage =
      `Recommendation comment. please visit the website ${websiteURL}`;



    // const AdiEmail = "deepak1@me.iitr.ac.in"; // ADI
    // const senderGmail = "iprcelliitr84@gmail.com";
    // const websiteURL = `https://ircpc-frontend.vercel.app/ViewPatentDetail?id=${req.params.id}`;
    // const Subject = "Patent is approved by HOD";
    // const Message = `HOD approve the details, please visit the website to verify: ${websiteURL}`;
    await sendMail(receiverEmail, senderEmail, emailSubject, emailMessage);
    // await sendMail(AdiEmail, senderGmail, Subject, Message);

    res.json();
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
        const emailMessage = `You have been approved to join the committee. Click the following link to accept: https://ircpc-backend.onrender.com/api/profiles/accept-invite/${token} or reject: https://ircpc-backend.onrender.com/api/profiles/reject-invite/${token} the invitation `;
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
