import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from '../pages/Auth/Login'
import ProtectedRoute from './ProtectedRoute'
import StudentDashboard from '../pages/Student/Dashboard'
import TeacherDashboard from '../pages/Teacher/Dashboard'
import TeacherSubjects from '../pages/Teacher/Subjects'
import StudentSubjects from '../pages/Student/Subjects'
import StudentProfile from '../pages/Student/Profile'
import CompleteProfile from '../components/CompleteProfile'
import CompleteTeacherProfile from '../components/CompleteTeacherProfile'
import MySubjects from '../pages/Student/MySubjects'
import MyProfile from '../pages/Teacher/MyProfile'
import TeacherLessons from '../pages/Teacher/Lessons'
import LessonDetails from '../pages/Teacher/LessonDetails'
import AssignmentGrading from '../pages/Teacher/AssignmentGrading'
import StudentLessons from '../pages/Student/Lessons'
import LessonView from '../pages/Student/LessonView'
import NaNvbar from '../components/Navbar'

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <NaNvbar />
            <Routes>
                {/* Public */}
                <Route path='/' element={<Login />} />

                {/* Student */}
                <Route
                    path='/student'
                    element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <StudentDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path='/complete-profile'
                    element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <CompleteProfile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path='/complete-teacher-profile'
                    element={
                        <ProtectedRoute allowedRoles={['teacher']}>
                            <CompleteTeacherProfile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path='/student/profile'
                    element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <StudentProfile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path='/student/subjects'
                    element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <StudentSubjects />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path='/student/subjects/:subjectId/lessons'
                    element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <StudentLessons />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path='/student/lessons/:lessonId'
                    element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <LessonView />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path='/student/mySubjects'
                    element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <MySubjects />
                        </ProtectedRoute>
                    }
                />




                {/* Teacher */}
                <Route
                    path='/teacher'
                    element={
                        <ProtectedRoute allowedRoles={['teacher']}>
                            <TeacherDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/teacher/subjects"
                    element={
                        <ProtectedRoute allowedRoles={["teacher"]}>
                            <TeacherSubjects />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/teacher/subjects/:subjectId/lessons"
                    element={
                        <ProtectedRoute allowedRoles={["teacher"]}>
                            <TeacherLessons />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/teacher/lessons/:lessonId"
                    element={
                        <ProtectedRoute allowedRoles={["teacher"]}>
                            <LessonDetails />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/teacher/lessons/:lessonId/assignment/:assignmentIndex/submissions"
                    element={
                        <ProtectedRoute allowedRoles={["teacher"]}>
                            <AssignmentGrading />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/teacher/myprofile"
                    element={
                        <ProtectedRoute allowedRoles={["teacher"]}>
                            <MyProfile />
                        </ProtectedRoute>
                    }
                />

                {/* Unauthorized */}
                <Route path='/Unauthorized' element={<h1>Access Denied</h1>} />

            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes