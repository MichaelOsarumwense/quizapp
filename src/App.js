// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import QuizForm from "./components/QuizForm";
import QuizModal from "./components/QuizModal";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<QuizModal />} />
          <Route path="/quiz-form" element={<QuizForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
