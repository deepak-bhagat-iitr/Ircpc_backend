const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the committee member schema
const committeeMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  department: { type: String, required: true }
});

// Define the patent schema
const patentSchema = new Schema({
  title: { type: String, required: true },
  fieldOfInvention: { type: String, required: true },
  detailedDescription: { type: String, required: true },
  inventor: {
    name: String,
    background: String,
  },
  status: {
    HOD: { type: Boolean, default: false },
    ADI: { type: Boolean, default: false },
    DSRIC: { type: Boolean, default: false }
  },
  committeeMembers: [committeeMemberSchema], // Array of committee members
  pdf: { type: String, required: true }, // Field for storing PDF data
  dateOfApplication: { type: Date, default: Date.now } // Corrected the typo here
});

// Create a model based on the schema
const Patent = mongoose.model('Patent', patentSchema);

// Export the model
module.exports = Patent;
