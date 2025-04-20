const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  from: {
    type: String,
    enum: ['client', 'server'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('Message', messageSchema)
