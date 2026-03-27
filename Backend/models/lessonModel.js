const mongoose = require('mongoose')

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['text', 'file_upload', 'quiz', 'essay'],
        required: true
    },
    questions: [{
        question: String,
        options: [String], // For multiple choice
        correctAnswer: String, // For auto-grading
        points: {
            type: Number,
            default: 1
        }
    }],
    attachments: [{
        filename: String,
        originalName: String,
        mimeType: String,
        size: Number,
        url: String
    }],
    dueDate: Date,
    maxPoints: {
        type: Number,
        default: 10
    },
    isRequired: {
        type: Boolean,
        default: true
    },
    instructions: String
}, {
    timestamps: true
})

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    content: {
        type: String, // Can store text content, video URLs, etc.
        required: true
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subject',
        required: true
    },
    order: {
        type: Number,
        required: true,
        default: 0
    },
    duration: {
        type: Number, // Duration in minutes
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    assignments: [assignmentSchema],
    resources: [{
        title: String,
        type: {
            type: String,
            enum: ['pdf', 'video', 'link', 'document']
        },
        url: String,
        filename: String,
        description: String
    }]
}, {
    timestamps: true
})

module.exports = mongoose.model('lesson', lessonSchema)