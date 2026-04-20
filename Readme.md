# 🎓 StudentSphere – Learning Management System (LMS)

A full-stack Learning Management System (LMS) built with modern web technologies to manage students, teachers, subjects, and lessons efficiently.
StudentSphere provides role-based access, secure authentication, and a clean user experience for both students and teachers.

---

## 🚀 Features

### 🔐 Authentication & Authorization

* User Registration & Login
* Email Verification & OTP system
* Role-based access (Student / Teacher / Admin)
* Protected routes using middleware

### 👨‍🎓 Student Features

* View enrolled subjects
* Access lessons and materials
* Track grades and submissions
* Manage profile

### 👨‍🏫 Teacher Features

* Create and manage subjects
* Upload lessons and assignments
* Grade student submissions
* Manage personal profile

### 📚 Lesson & Subject Management

* CRUD operations for subjects and lessons
* File upload support for learning materials
* Structured content delivery

### 📦 Backend Capabilities

* RESTful API architecture
* Middleware for authentication & role checking
* OTP & Email service integration
* File upload handling

### 🎨 Frontend Features

* Responsive UI with modern design
* Role-based dashboards
* Toast notifications
* Protected routing

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* CSS (Custom Styling)
* Axios (API Calls)

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)

### Other Tools

* JWT Authentication
* Multer (File Upload)
* Nodemailer (Email Service)

---

## 📁 Project Structure

```
StudentSphere/
│
├── Backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   └── routes/
│   └── vite.config.js
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/StudentSphere.git
cd StudentSphere
```

### 2️⃣ Backend Setup

```bash
cd Backend
npm install
```

Create `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
EMAIL_USER=your_email
EMAIL_PASS=your_password
```

Run backend:

```bash
npm start
```

---

### 3️⃣ Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

---

## 🔑 API Overview

* `/api/auth` → Authentication routes
* `/api/student` → Student operations
* `/api/teacher` → Teacher operations
* `/api/subject` → Subject management
* `/api/lesson` → Lesson management

---

## 📸 Screens (Optional)

* Login / Register
* Student Dashboard
* Teacher Dashboard
* Lesson View
* Profile Pages

---

## 🔒 Security Features

* JWT-based authentication
* Role-based route protection
* Email verification with OTP
* Secure file upload handling

---

## 💡 Future Enhancements

* Live classes integration
* Chat system
* Notifications system
* Admin analytics dashboard
* Mobile app (React Native)

---

## 🤝 Contributing

Contributions are welcome!

```bash
1. Fork the repo
2. Create a new branch
3. Commit your changes
4. Push to branch
5. Open a Pull Request
```

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Kakadiya Chiranj**

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
