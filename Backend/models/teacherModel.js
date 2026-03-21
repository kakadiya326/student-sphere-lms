const mongoose = require('mongoose')

const teacherSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    department: {
        type: String,
        enum: [
            "CSE",
            "IT",
            "ECE",
            "EEE",
            "MECH",
            "CIVIL",
            "AI",
            "DS",
            "CSBS",
            "MBA",
            "BBA",
            "BCA",
            "MCA"
        ],
        required: true
    },
    subjects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'subject'
        }
    ]
}, {
    timestamps: true
})

module.exports = mongoose.model('teacher', teacherSchema)