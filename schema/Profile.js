const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProfileSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    age:{
        type: "number",
        required: true
    },
    gender:{
        type: String,
        required: true, 
    },
    mobile:{
        type: "number",
        default: "General"
    },
    date:{
        type: Date,
        default: Date.now
    },
  });

  module.exports = mongoose.model('profile', ProfileSchema);