let mongoose = require('mongoose')

let userSchema = mongoose.Schema({
    "_id": String,
    "name": String,
    "email": String,
    "password": String,
    "role": {
        type: String,
        enum: ["Admin", "Teacher", "Student"],
        required: true
    },

    "referencemodel": {
        type: String,
        enum: ["students", "teachers"],
        required: function () {
            return this.Role !== "admin";
        }
    },

    "referenceid": {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "referencemodel"
    }

})

module.exports = mongoose.model('users', userSchema)
