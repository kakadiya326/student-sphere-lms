const Counter = require('../models/counterModel')

const generateEnrollment = async (department) => {
    let year = new Date().getFullYear().toString().slice(-2)

    let counter = await Counter.findOneAndUpdate(
        { department },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    )

    let sequence = counter.seq.toString().padStart(5, '0')

    return `${year}LMS${department}${sequence}`
}

module.exports = { generateEnrollment }