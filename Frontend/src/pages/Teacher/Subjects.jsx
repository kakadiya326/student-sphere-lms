import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSubject, getSubjects } from '../../services/subjectService';
import Toast from '../../components/Toast';

const Subjects = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: "",
    code: ""
  })

  const [subjects, setSubjects] = useState([]);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("");

  const fetchSubjects = async () => {
    try {
      const res = await getSubjects()
      setSubjects(res.data.subjects)
    } catch {
      setMessage("Failed to load subjects");
      setType("error");
    }
  }

  useEffect(() => {
    fetchSubjects() // eslint-disable-line react-hooks/set-state-in-effect
  }, [])

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      let res = await createSubject(form);

      setMessage(res.data.success||res.data.error);
      setType(res.data.success?"success":"error");
      setForm({ name: "", code: "" })
      fetchSubjects();
    } catch {
      setMessage("Failed to add subject")
      setType("error")
    }
  }
  return (
    <div>
      <h2>Subjects</h2>
      <Toast
        msgText={message}
        msgType={type}
        clearMessage={() => setMessage("")}
      />

      <form method='post' onSubmit={handleSubmit}>
        <input type="text" name='name' placeholder='Subject Name' value={form.name} onChange={handleChange} />
        <input type="text" name='code' placeholder='Subject Code' value={form.code} onChange={handleChange} />
        <button type='submit'>Add Subject</button>
      </form>

      {/* Subject List */}
      <div style={{ marginTop: '30px' }}>
        <h3>Your Subjects</h3>
        {subjects && subjects.length > 0 ? (
          <div style={{ display: 'grid', gap: '15px' }}>
            {subjects.map((subject) => (
              <div key={subject._id} style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0' }}>{subject.name}</h4>
                  <p style={{ margin: '0', color: '#666' }}>Code: {subject.code}</p>
                </div>
                <button
                  onClick={() => navigate(`/teacher/subjects/${subject._id}/lessons`)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  📚 Manage Lessons
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
            No subjects created yet. Add your first subject above.
          </p>
        )}
      </div>
    </div>
  )
}

export default Subjects