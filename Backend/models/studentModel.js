const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema({
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
    enrollment: {
        type: String, // reference to generated automatic
        required: true
    },
    courseIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "subject"
        }
    ],
    progress: [
        {
            courseId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "subject"
            },
            completedLessons: {
                type: Number,
                default: 0
            },
            lessonProgress: [{
                lessonId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "lesson"
                },
                completedAt: Date,
                assignmentsCompleted: [Number], // Array of assignment indices that are completed
                score: Number // Overall lesson score
            }]
        }
    ]
}, {
    timestamps: true
})

module.exports = mongoose.model('student', studentSchema)