require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const route = require('./routes/index')

const app = express()

// Middleware
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }))

// Serve uploads directory statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('/profilePics', express.static(path.join(__dirname, 'profilePics')))

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../Frontend/dist')))

// ✅ API Routes FIRST
app.use('/', route)

// ✅ React fallback route (FIXED)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/dist/index.html'))
})

// Connect DB and then start server
mongoose.connect(process.env.DB_URL)
    .then(() => {
        console.log('✅ DB connected successfully')

        app.listen(process.env.PORT, () => {
            console.log(`🚀 Server running on port ${process.env.PORT}`)
        })
    })
    .catch((e) => {
        console.log('❌ DB connection failed')
    })