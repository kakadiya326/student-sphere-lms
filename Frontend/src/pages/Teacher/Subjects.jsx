import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSubject, getSubjects, updateSubject, deleteSubject } from '../../services/subjectService';
import Toast from '../../components/Toast';
import Loader from '../../components/Loader';

const Subjects = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', code: '' })
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [type, setType] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', code: '' })

  const fetchSubjects = async () => {
    setLoading(true)
    try {
      const res = await getSubjects()
      setSubjects(res.data.subjects || [])
    } catch (error) {
      if (error.response?.data?.error) {
        setMessage(error.response.data.error)
        setType('error')
      } else if (error.response?.data?.warning) {
        setMessage(error.response.data.warning)
        setType('warning')
      } else {
        setMessage('Failed to load subjects')
        setType('error')
      }
      setSubjects([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubjects() // eslint-disable-line react-hooks/set-state-in-effect
  }, [])

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.code.trim()) {
      setMessage('Please fill both name and code.')
      setType('error')
      return
    }

    try {
      let res = await createSubject(form)
      if (res.data.success) {
        setMessage(res.data.success)
        setType('success')
      } else if (res.data.error) {
        setMessage(res.data.error)
        setType('error')
      } else if (res.data.warning) {
        setMessage(res.data.warning)
        setType('warning')
      }
      setForm({ name: '', code: '' })
      fetchSubjects()
    } catch (error) {
      if (error.response?.data?.error) {
        setMessage(error.response.data.error)
        setType('error')
      } else if (error.response?.data?.warning) {
        setMessage(error.response.data.warning)
        setType('warning')
      } else {
        setMessage('Failed to add subject')
        setType('error')
      }
    }
  }

  const startEdit = (subject) => {
    setEditingId(subject._id)
    setEditForm({ name: subject.name, code: subject.code })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: '', code: '' })
  }

  const handleEditChange = (event) => {
    setEditForm({ ...editForm, [event.target.name]: event.target.value })
  }

  const handleUpdate = async (subjectId) => {
    if (!editForm.name.trim() || !editForm.code.trim()) {
      setMessage('Please fill both name and code.')
      setType('error')
      return
    }

    try {
      const res = await updateSubject(editForm, subjectId)
      if (res.data.success) {
        setMessage(res.data.success)
        setType('success')
      } else if (res.data.error) {
        setMessage(res.data.error)
        setType('error')
      } else if (res.data.warning) {
        setMessage(res.data.warning)
        setType('warning')
      }
      setEditingId(null)
      fetchSubjects()
    } catch (error) {
      if (error.response?.data?.error) {
        setMessage(error.response.data.error)
        setType('error')
      } else if (error.response?.data?.warning) {
        setMessage(error.response.data.warning)
        setType('warning')
      } else {
        setMessage('Failed to update subject')
        setType('error')
      }
    }
  }

  const handleDelete = async (subjectId) => {
    const confirmed = window.confirm('Delete this subject? This action cannot be undone.')
    if (!confirmed) return

    try {
      const res = await deleteSubject(subjectId)
      if (res.data.success) {
        setMessage(res.data.success)
        setType('success')
      } else if (res.data.error) {
        setMessage(res.data.error)
        setType('error')
      } else if (res.data.warning) {
        setMessage(res.data.warning)
        setType('warning')
      }
      fetchSubjects()
    } catch (error) {
      if (error.response?.data?.error) {
        setMessage(error.response.data.error)
        setType('error')
      } else if (error.response?.data?.warning) {
        setMessage(error.response.data.warning)
        setType('warning')
      } else {
        setMessage('Failed to delete subject')
        setType('error')
      }
    }
  }

  return (
    <div className='subjects-page'>
      <div className='subject-header'>
        <h2>Subject Management</h2>
        <p>Create, edit, and delete your course subjects in one place.</p>
      </div>

      <Toast message={message} type={type} onClose={() => setMessage('')} />

      <div className='subject-controls'>
        <form className='subject-form' onSubmit={handleSubmit}>
          <input
            type='text'
            name='name'
            placeholder='Subject Name'
            value={form.name}
            onChange={handleChange}
          />
          <input
            type='text'
            name='code'
            placeholder='Subject Code'
            value={form.code}
            onChange={handleChange}
          />
          <button type='submit'>Add Subject</button>
        </form>
      </div>

      <div className='subject-list'>
        {loading ? (
          <Loader text="Loading subjects..." />
        ) : subjects && subjects.length > 0 ? (
          subjects.map((subject) => (
            <div key={subject._id} className='subject-card'>
              {editingId === subject._id ? (
                <div className='subject-edit'>
                  <input
                    type='text'
                    name='name'
                    value={editForm.name}
                    onChange={handleEditChange}
                  />
                  <input
                    type='text'
                    name='code'
                    value={editForm.code}
                    onChange={handleEditChange}
                  />
                  <div className='subject-actions'>
                    <button className='btn-save' onClick={() => handleUpdate(subject._id)}>
                      Save
                    </button>
                    <button className='btn-cancel' onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                      <h4>{subject.name}</h4>
                      <p>Code: {subject.code}</p>
                      <p className='grey-text'>Teacher: {subject.teacherId?.userId?.name || 'N/A'}</p>
                    </div>
                    <div className='subject-actions'>
                      <button className='btn-secondary' onClick={() => startEdit(subject)}>
                        Edit
                      </button>
                      <button className='btn-danger' onClick={() => handleDelete(subject._id)}>
                        Delete
                      </button>
                      <button
                        className='btn-primary'
                        onClick={() => navigate(`/teacher/subjects/${subject._id}/lessons`)}
                      >
                        Manage Lessons
                      </button>
                    </div>
                </>
              )}
            </div>
          ))
        ) : (
            <div className='empty-state'>
              <p>No subjects yet. Use the form above to create your first subject.</p>
            </div>
        )}
      </div>
    </div>
  )
}

export default Subjects