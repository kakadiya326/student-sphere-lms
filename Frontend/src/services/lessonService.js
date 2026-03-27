import api from "./api"

export const createLesson = (data) => {
    return api.post("/lessons", data);
}

export const getLessonsBySubject = (subjectId) => {
    return api.get(`/lessons/subject/${subjectId}`);
}

export const getLesson = (lessonId) => {
    return api.get(`/lessons/${lessonId}`);
}

export const updateLesson = (lessonId, data) => {
    return api.put(`/lessons/${lessonId}`, data);
}

export const deleteLesson = (lessonId) => {
    return api.delete(`/lessons/${lessonId}`);
}

export const reorderLessons = (data) => {
    return api.put("/lessons/reorder", data);
}

// Assignment management
export const addAssignmentToLesson = (lessonId, assignmentData) => {
    return api.post(`/lessons/${lessonId}/assignments`, assignmentData);
}

export const updateAssignment = (lessonId, assignmentIndex, data) => {
    return api.put(`/lessons/${lessonId}/assignments/${assignmentIndex}`, data);
}

// Student submissions
export const submitAssignment = (data) => {
    return api.post("/lessons/submit", data);
}

export const getStudentSubmissions = (lessonId) => {
    return api.get(`/lessons/${lessonId}/submissions/student`);
}

export const getSubmissionsForLesson = (lessonId) => {
    return api.get(`/lessons/${lessonId}/submissions`);
}

export const gradeSubmission = (submissionId, data) => {
    return api.put(`/lessons/submissions/${submissionId}/grade`, data);
}

export const markLessonComplete = (data) => {
    return api.post("/lessons/complete", data);
}