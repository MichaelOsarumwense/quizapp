import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QuizModal = () => {
  const [quizData, setQuizData] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [results, setResults] = useState([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [passStatus, setPassStatus] = useState(null); // To store pass or fail status
  const [percentageScore, setPercentageScore] = useState(0); // To store the percentage score

  const PASS_RATE = 0.7; // 70% pass rate

  useEffect(() => {
    // Fetch quiz data from the API
    axios.get('http://localhost:3001/api/quizzes').then((response) => {
      setQuizData(response.data);
    });
  }, []);

  const handleAnswerChange = (e, index) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [index]: e.target.value,
    });
    setErrorMessage(''); // Clear error message when an answer is selected
  };

  const handleSubmitQuiz = () => {
    // Validation: Check if all questions are answered
    if (Object.keys(selectedAnswers).length !== quizData.length) {
      setErrorMessage('Please answer all questions before submitting.');
      return;
    }

    const evaluatedResults = quizData.map((question, index) => ({
      question: question.question,
      correct: question.correct_answer === selectedAnswers[index],
      userAnswer: selectedAnswers[index],
      correctAnswer: question.correct_answer,
    }));

    const correctAnswersCount = evaluatedResults.filter((result) => result.correct).length;
    const totalQuestions = quizData.length;
    const passThreshold = totalQuestions * PASS_RATE;
    
    const percentage = (correctAnswersCount / totalQuestions) * 100;
    const hasPassed = correctAnswersCount >= passThreshold;

    setPercentageScore(percentage.toFixed(2)); // Store the percentage score (rounded to 2 decimal places)
    setPassStatus(hasPassed ? 'Pass' : 'Fail'); // Set pass/fail status
    setResults(evaluatedResults);
    setQuizSubmitted(true);
    setErrorMessage(''); // Clear the error message on successful submit
  };

  const handleCloseModal = () => {
    setShowModal(false); // Close the modal
    resetQuiz(); // Reset quiz when closing
  };

  const handleRetakeQuiz = () => {
    resetQuiz(); // Reset quiz and keep modal open for retake
  };

  const resetQuiz = () => {
    setSelectedAnswers({}); // Clear selected answers
    setResults([]); // Clear results
    setQuizSubmitted(false); // Reset quiz submission state
    setErrorMessage(''); // Clear error message on reset
    setPassStatus(null); // Reset pass/fail status
    setPercentageScore(0); // Reset percentage score
  };

  return (
    <div>
      <button onClick={() => setShowModal(true)} style={{ padding: '10px', background: 'blue', color: 'white' }}>
        Take Quiz
      </button>
      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="modal-content" style={{ backgroundColor: 'white', padding: '20px', width: '50%', borderRadius: '10px' }}>
            <h2>Quiz</h2>
            {!quizSubmitted ? (
              <div>
                {errorMessage && (
                  <p style={{ color: 'red' }}>{errorMessage}</p> // Display error message
                )}
                {quizData.map((q, index) => (
                  <div key={index} style={{ marginBottom: '20px' }}>
                    <p><strong>{index + 1}. {q.question}</strong></p>
                    {q.options.map((option, i) => (
                      <label key={i} style={{ display: 'block', marginBottom: '5px' }}>
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option}
                          onChange={(e) => handleAnswerChange(e, index)}
                          style={{ marginRight: '10px' }}
                          checked={selectedAnswers[index] === option} // Ensure selected answer is shown
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                ))}
                <button
                  onClick={handleSubmitQuiz}
                  style={{ padding: '10px', background: 'green', color: 'white', marginRight: '10px' }}
                >
                  Submit Quiz
                </button>
                <button onClick={handleCloseModal} style={{ padding: '10px', background: 'gray', color: 'white' }}>
                  Close
                </button>
              </div>
            ) : (
              <div>
                <h3>Results</h3>
                {results.map((result, index) => (
                  <div key={index} style={{ marginBottom: '20px' }}>
                    <p><strong>{index + 1}. {result.question}</strong></p>
                    <p>
                      Your Answer: <span style={{ color: result.correct ? 'green' : 'red' }}>{result.userAnswer}</span>
                      {result.correct ? ' (Correct)' : ` (Incorrect, correct answer: ${result.correctAnswer})`}
                    </p>
                  </div>
                ))}
                <h4>Score: {percentageScore}%</h4>
                {passStatus === 'Pass' ? (
                  <h4 style={{ color: 'green' }}>You Passed! 🎉</h4>
                ) : (
                  <div>
                    <h4 style={{ color: 'red' }}>You Failed. 😞</h4>
                    <p>You need at least 70% to pass, but your score is {percentageScore}%. Better luck next time!</p>
                  </div>
                )}
                <button onClick={handleCloseModal} style={{ padding: '10px', background: 'gray', color: 'white', marginRight: '10px' }}>
                  Close
                </button>
                <button onClick={handleRetakeQuiz} style={{ padding: '10px', background: 'orange', color: 'white' }}>
                  Retake Quiz
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizModal;
