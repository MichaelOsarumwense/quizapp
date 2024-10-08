import React, { useState } from 'react';
import axios from 'axios';

const QuizForm = () => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [message, setMessage] = useState('');

  const handleOptionChange = (e, index) => {
    const newOptions = [...options];
    newOptions[index] = e.target.value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation before submitting
    if (!question || options.some(opt => opt === '') || !correctAnswer) {
      setMessage('Please fill all fields');
      return;
    }

    try {
      await axios.post('http://localhost:3001/api/quizzes', {
        question,
        options,
        correct_answer: correctAnswer, // Adjusted to match expected backend format
      });
      setMessage('Question added successfully!');
      // Reset form fields
      setQuestion('');
      setOptions(['', '', '', '']);
      setCorrectAnswer('');
    } catch (err) {
      setMessage('Error adding question');
      console.error('Error adding question:', err); // Log error for debugging
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Create Quiz Question</h2>
      {message && <p>{message}</p>}
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
        <button type="submit" style={{ padding: '10px', background: 'green', color: 'white' }}>
          Add Question
        </button>
      </form>
    </div>
  );
};

export default QuizForm;
