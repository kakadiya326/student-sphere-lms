const express = require("express")
const { createSubject, getSubjects, updateSubject, deleteSubject } = require("../control/subjectCon")

const router = express.Router()

router.post("/", createSubject)
router.get("/", getSubjects)
router.put("/:id", updateSubject)
router.delete("/:id", deleteSubject)

module.exports = router