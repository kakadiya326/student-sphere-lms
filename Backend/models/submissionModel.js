const mongoose = require('mongoose')

const submissionSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true
    },
    lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'lesson',
        required: true
    },
    assignmentIndex: {
        type: Number, // Index of the assignment in the lesson.assignments array
        required: true
    },
    answers: [{
        questionIndex: Number,
        answer: String, // For text answers or selected option
        isCorrect: Boolean // For auto-graded questions
    }],
    submittedFiles: [{
        filename: String,
        originalName: String,
        mimeType: String,
        size: Number,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    textSubmission: String, // For essay-type assignments
    status: {
        type: String,
        enum: ['draft', 'submitted', 'graded', 'returned'],
        default: 'draft'
    },
    submittedAt: Date,
    gradedAt: Date,
    grade: Number, // Points earned
    maxPoints: Number,
    feedback: String,
    gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher'
    }
}, {
    timestamps: true
})

// Compound index to ensure one submission per student per assignment
submissionSchema.index({ studentId: 1, lessonId: 1, assignmentIndex: 1 }, { unique: true })

module.exports = mongoose.model('submission', submissionSchema)