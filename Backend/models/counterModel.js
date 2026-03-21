const mongoose = require('mongoose')

const counterSchema = new mongoose.Schema({
    department: String,
    seq: {
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model('counter', counterSchema)