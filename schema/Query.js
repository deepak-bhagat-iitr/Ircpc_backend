const mongoose = require('mongoose');
const { Schema } = mongoose;

const QuerySchema = new Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    query:{
        type: String,
        required: true
    },    
    comment:{
        type: String,
        required: false
    },
    date:{
        type: Date,
        default: Date.now
    },
  });
  const User = mongoose.model('query', QuerySchema);
  module.exports = User;