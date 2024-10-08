import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './QuizModal.css';

const QuizModal = () => {
  const [quizData, setQuizData] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [results, setResults] = useState([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [passStatus, setPassStatus] = useState(null);
  const [percentageScore, setPercentageScore] = useState(0);

  const PASS_RATE = 0.7;

  useEffect(() => {
    axios.get('http://localhost:3001/api/quizzes').then((response) => {
      setQuizData(response.data);
    });
  }, []);

  const handleAnswerChange = (e, index) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [index]: e.target.value,
    });
    setErrorMessage('');
  };

  const handleSubmitQuiz = () => {
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

    setPercentageScore(percentage.toFixed(2));
    setPassStatus(hasPassed ? 'Pass' : 'Fail');
    setResults(evaluatedResults);
    setQuizSubmitted(true);
    setErrorMessage('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetQuiz();
  };

  const handleRetakeQuiz = () => {
    resetQuiz();
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setResults([]);
    setQuizSubmitted(false);
    setErrorMessage('');
    setPassStatus(null);
    setPercentageScore(0);
  };

  return (
    <div>
      <button onClick={() => setShowModal(true)} className="quiz-button">
        Take Quiz
      </button>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Quiz</h2>
            {!quizSubmitted ? (
              <div>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <div className="questions-container">
                  {quizData.map((q, index) => (
                    <div key={index} className="question-item">
                      <p><strong>{index + 1}. {q.question}</strong></p>
                      <div className="options-container">
                        {q.options.map((option, i) => (
                          <label key={i} className="option-label">
                            <input
                              type="radio"
                              name={`question-${index}`}
                              value={option}
                              onChange={(e) => handleAnswerChange(e, index)}
                              className="radio-input"
                              checked={selectedAnswers[index] === option}
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={handleSubmitQuiz} className="submit-button">Submit Quiz</button>
                <button onClick={handleCloseModal} className="close-button">Close</button>
              </div>
            ) : (
              <div>
                <h3>Results</h3>
                {results.map((result, index) => (
                  <div key={index} className="result-item">
                    <p><strong>{index + 1}. {result.question}</strong></p>
                    <p>
                      Your Answer: <span style={{ color: result.correct ? 'green' : 'red' }}>{result.userAnswer}</span>
                      {result.correct ? ' (Correct)' : ` (Incorrect, correct answer: ${result.correctAnswer})`}
                    </p>
                  </div>
                ))}
                <h4>Percentage Score: {percentageScore}%</h4>
                {passStatus === 'Pass' ? (
                  <h4 className="pass-message">You Passed! 🎉</h4>
                ) : (
                  <div>
                    <h4 className="fail-message">You Failed. 😞</h4>
                    <p>You need at least 70% to pass, but your score is {percentageScore}%. Better luck next time!</p>
                  </div>
                )}
                <button onClick={handleCloseModal} className="close-button">Close</button>
                <button onClick={handleRetakeQuiz} className="retake-button">Retake Quiz</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizModal;
