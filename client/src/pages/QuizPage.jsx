import React from "react";
import Timer from "../components/Timer.jsx";

const LETTERS = ["A", "B", "C", "D"];

export default function QuizPage({
  currentQuestion,
  timeLeft,
  selectedAnswer,
  correctAnswer,
  onAnswer,
  answerResult,
}) {
  if (!currentQuestion) return null;

  const hasAnswered = selectedAnswer !== null;
  const isRevealed = correctAnswer !== null;

  function getOptionClass(index) {
    let cls = "option-btn";
    if (isRevealed) {
      if (index === correctAnswer) cls += " reveal-correct";
      else if (index === selectedAnswer && index !== correctAnswer) cls += " wrong";
    } else if (selectedAnswer === index) {
      cls += " selected";
    }
    return cls;
  }

  return (
    <div className="quiz-container">
      {/* Header : progress + timer */}
      <div className="quiz-header">
        <div className="progress-bar-wrap">
          <div
            className="progress-bar-fill"
            style={{
              width: `${((currentQuestion.questionIndex + 1) / currentQuestion.totalQuestions) * 100}%`,
            }}
          />
        </div>
        <span className="question-counter">
          {currentQuestion.questionIndex + 1} / {currentQuestion.totalQuestions}
        </span>
        <Timer timeLeft={timeLeft} total={15} />
      </div>

      {/* Question */}
      <div className="card question-card">
        <p className="question-text">{currentQuestion.question}</p>
      </div>

      {/* Options */}
      <div className="options-grid">
        {currentQuestion.options.map((option, i) => (
          <button
            key={i}
            className={getOptionClass(i)}
            onClick={() => onAnswer(i)}
            disabled={hasAnswered || isRevealed}
          >
            <span className="option-letter">{LETTERS[i]}</span>
            <span className="option-text">{option}</span>
          </button>
        ))}
      </div>

      {/* Feedback */}
      {answerResult && (
        <div className={`answer-feedback ${answerResult.correct ? "correct" : "wrong"}`}>
          {answerResult.correct
            ? `✅ Bonne réponse ! +${answerResult.score - (answerResult.score - (answerResult.correct ? 100 : 0))} pts`
            : "❌ Mauvaise réponse…"}
        </div>
      )}

      {isRevealed && !answerResult && (
        <div className="answer-feedback wrong" style={{ background: "rgba(100,100,150,0.1)", borderColor: "var(--border)", color: "var(--text2)" }}>
          ⏱ Temps écoulé — La bonne réponse était {LETTERS[correctAnswer]}
        </div>
      )}
    </div>
  );
}