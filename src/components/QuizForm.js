import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './QuizForm.css';

const QuizForm = () => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/quizzes');
      setQuizQuestions(response.data);
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
    }
  };

  const handleOptionChange = (e, index) => {
    const newOptions = [...options];
    newOptions[index] = e.target.value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question || options.some((opt) => opt === '') || !correctAnswer) {
      setMessage({ text: 'Please fill all fields', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      if (editMode) {
        await axios.put(`http://localhost:3001/api/quizzes/${editQuestionId}`, {
          question,
          options,
          correct_answer: correctAnswer,
        });
        setMessage({ text: 'Question updated successfully!', type: 'success' });
      } else {
        await axios.post('http://localhost:3001/api/quizzes', {
          question,
          options,
          correct_answer: correctAnswer,
        });
        setMessage({ text: 'Question added successfully!', type: 'success' });
      }

      // Reset form
      setQuestion('');
      setOptions(['', '', '', '']);
      setCorrectAnswer('');
      setEditMode(false);
      setEditQuestionId(null);
      fetchQuestions();
    } catch (error) {
      setMessage({ text: 'Error adding/updating question', type: 'error' });
      console.error('Error adding/updating question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:3001/api/quizzes/${deletingId}`);
      setMessage({ text: 'Question deleted successfully!', type: 'success' });
      fetchQuestions();
    } catch (error) {
      setMessage({ text: 'Error deleting question', type: 'error' });
      console.error('Error deleting question:', error);
    } finally {
      setLoading(false);
      setShowModal(false);
      setDeletingId(null);
    }
  };

  const handleEdit = (id) => {
    const questionToEdit = quizQuestions.find((q) => q.id === id);
    if (questionToEdit) {
      setQuestion(questionToEdit.question);
      setOptions(questionToEdit.options);
      setCorrectAnswer(questionToEdit.correct_answer);
      setEditMode(true);
      setEditQuestionId(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h2>{editMode ? 'Edit Quiz Question' : 'Create Quiz Question'}</h2>
      {message && (
        <p style={{ color: message.type === 'success' ? 'green' : 'red' }}>
          {message.text}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Question:
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
          </label>
        </div>
        <div>
          <label>Options:</label>
          {options.map((option, index) => (
            <div key={index}>
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(e, index)}
                required
                placeholder={`Option ${index + 1}`}
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              />
            </div>
          ))}
        </div>
        <div>
          <label>
            Correct Answer:
            <select
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            >
              <option value="">Select correct answer</option>
              {options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px',
            backgroundColor: 'green',
            color: 'white',
            width: '100%',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {loading ? (
            <span className="loader"></span>
          ) : editMode ? (
            'Update Question'
          ) : (
            'Add Question'
          )}
        </button>
      </form>

      <div style={{ marginTop: '20px' }}>
        <h3>All Questions</h3>
        {quizQuestions.map((q) => (
          <div
            key={q.id}
            style={{
              border: '1px solid #ddd',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '5px',
            }}
          >
            <p>
              <strong>{q.question}</strong>
            </p>
            <ul>
              {q.options.map((option, i) => (
                <li key={i}>{option}</li>
              ))}
            </ul>
            <p>
              <strong>Correct Answer:</strong> {q.correct_answer}
            </p>
            <button
              onClick={() => handleEdit(q.id)}
              style={{ marginRight: '10px', backgroundColor: 'orange', color: 'white', padding: '5px' }}
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteClick(q.id)}
              style={{ backgroundColor: 'red', color: 'white', padding: '5px' }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this question?</p>
            <button onClick={handleDelete} style={{ backgroundColor: 'red', color: 'white' }}>
              Confirm
            </button>
            <button onClick={() => setShowModal(false)} style={{ marginLeft: '10px' }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizForm;
