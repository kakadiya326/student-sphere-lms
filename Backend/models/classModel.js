const mongoose = require('mongoose')

const classSchema = new mongoose.Schema({
    name: {
        type: String,
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
    students: [
        {
            type: String,
            ref: 'user'
        }
    ],
    subjects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'subject'
        }
    ],
    classTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher'
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('class', classSchema)