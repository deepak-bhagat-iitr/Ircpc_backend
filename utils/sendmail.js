const nodemailer = require("nodemailer");

// Create a transporter with your email service credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "iprcelliitr84@gmail.com",
    pass: "fazsmupbljnegroh",
  },
});

function sendMail(receiver, sender, subject, message) {
  const mailOptions = {
    from: sender,
    to: receiver,
    subject: subject,
    text: message,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        reject(error);
      } else {
        console.log("Email sent: " + info.response);
        resolve(info);
      }
    });
  });
}

module.exports = { sendMail };