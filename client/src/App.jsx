import React, { useState, useEffect, useCallback } from "react";
import socket from "./socket.js";
import JoinGamePage from "./pages/JoinGamePage.jsx";
import WaitingPage from "./pages/WaitingPage.jsx";
import QuizPage from "./pages/QuizPage.jsx";
import ScoreboardPage from "./pages/ScoreboardPage.jsx";
import Leaderboard from "./components/Leaderboard.jsx";
import ToastContainer, { useToasts } from "./components/Toast.jsx";

// Écrans possibles
const SCREEN = {
  JOIN:       "join",
  WAITING:    "waiting",
  QUIZ:       "quiz",
  SCOREBOARD: "scoreboard",
};

export default function App() {
  const [screen, setScreen] = useState(SCREEN.JOIN);
  const [username, setUsername] = useState("");
  const [players, setPlayers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [events, setEvents] = useState([]);
  const [myScore, setMyScore] = useState(0);

  const { toasts, addToast } = useToasts();

  // ── Ajouter un event dans le feed ─────────────────────────────────────────
  const addEvent = useCallback((msg) => {
    setEvents((prev) => [msg, ...prev].slice(0, 20));
  }, []);

  // ── Connexion Socket & listeners ──────────────────────────────────────────
  useEffect(() => {
    socket.connect();

    socket.on("connect", () => console.log("🔌 Socket connecté"));
    socket.on("disconnect", () => console.log("🔴 Socket déconnecté"));

    socket.on("playersUpdate", ({ players: p }) => {
      setPlayers(p);
    });

    socket.on("joinedGame", ({ username: u, leaderboard: lb, quizStarted }) => {
      setLeaderboard(lb);
      if (quizStarted) {
        setScreen(SCREEN.QUIZ);
      } else {
        setScreen(SCREEN.WAITING);
      }
    });

    socket.on("playerJoined", ({ username: u }) => {
      addEvent(`👋 ${u} a rejoint la partie`);
      addToast(`👋 ${u} a rejoint !`);
    });

    socket.on("playerLeft", ({ username: u }) => {
      addEvent(`👋 ${u} a quitté la partie`);
    });

    socket.on("quizStart", ({ message }) => {
      addToast("🚀 " + message);
      addEvent("🚀 " + message);
      setScreen(SCREEN.QUIZ);
      setSelectedAnswer(null);
      setCorrectAnswer(null);
      setAnswerResult(null);
    });

    socket.on("newQuestion", (question) => {
      setCurrentQuestion(question);
      setTimeLeft(question.timeLeft);
      setSelectedAnswer(null);
      setCorrectAnswer(null);
      setAnswerResult(null);
      setScreen(SCREEN.QUIZ);
    });

    socket.on("timerUpdate", ({ timeLeft: t }) => {
      setTimeLeft(t);
    });

    socket.on("scoreUpdate", ({ leaderboard: lb, message }) => {
      setLeaderboard(lb);
      if (message) addEvent(message);
    });

    socket.on("answerResult", ({ correct, correctIndex, score }) => {
      setAnswerResult({ correct, score });
      setMyScore(score);
      if (correct) {
        addToast(`✅ +${score} pts`);
      }
    });

    socket.on("revealAnswer", ({ correctIndex, leaderboard: lb }) => {
      setCorrectAnswer(correctIndex);
      setLeaderboard(lb);
    });

    socket.on("quizEnd", ({ leaderboard: lb }) => {
      setLeaderboard(lb);
      setCurrentQuestion(null);
      setScreen(SCREEN.SCOREBOARD);
      addToast("🏁 Quiz terminé !");
    });

    socket.on("gameReset", ({ message }) => {
      setScreen(SCREEN.WAITING);
      setSelectedAnswer(null);
      setCorrectAnswer(null);
      setAnswerResult(null);
      setCurrentQuestion(null);
      setMyScore(0);
      addToast("🔄 " + message);
      addEvent("🔄 " + message);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("playersUpdate");
      socket.off("joinedGame");
      socket.off("playerJoined");
      socket.off("playerLeft");
      socket.off("quizStart");
      socket.off("newQuestion");
      socket.off("timerUpdate");
      socket.off("scoreUpdate");
      socket.off("answerResult");
      socket.off("revealAnswer");
      socket.off("quizEnd");
      socket.off("gameReset");
      socket.disconnect();
    };
  }, [addEvent, addToast]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleJoin = useCallback((name) => {
    setUsername(name);
    socket.emit("joinGame", { username: name });
  }, []);

  const handleAnswer = useCallback((answerIndex) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
    socket.emit("submitAnswer", { answerIndex });
  }, [selectedAnswer]);

  // ── Render ─────────────────────────────────────────────────────────────────
  const showSidePanel = screen === SCREEN.QUIZ || screen === SCREEN.WAITING || screen === SCREEN.SCOREBOARD;

  // Page Join : plein écran
  if (screen === SCREEN.JOIN) {
    return (
      <>
        <div className="main-panel">
          <JoinGamePage onJoin={handleJoin} playerCount={players.length} />
        </div>
        <ToastContainer toasts={toasts} />
      </>
    );
  }

  return (
    <>
      <div className="app-layout">
        {/* ── Panel principal ───────────────────────────────────── */}
        <div className="main-panel">
          {screen === SCREEN.WAITING && (
            <WaitingPage username={username} players={players} />
          )}

          {screen === SCREEN.QUIZ && (
            <QuizPage
              currentQuestion={currentQuestion}
              timeLeft={timeLeft}
              selectedAnswer={selectedAnswer}
              correctAnswer={correctAnswer}
              onAnswer={handleAnswer}
              answerResult={answerResult}
            />
          )}

          {screen === SCREEN.SCOREBOARD && (
            <ScoreboardPage leaderboard={leaderboard} username={username} />
          )}
        </div>

        {/* ── Panel latéral ─────────────────────────────────────── */}
        {showSidePanel && (
          <div className="side-panel">
            {/* Score perso */}
            <div className="my-score-badge">
              <div>
                <div className="label">Joueur</div>
                <div style={{ fontFamily: "Syne", fontWeight: 700, fontSize: 15, color: "var(--text)" }}>
                  {username}
                </div>
              </div>
              <div style={{ flex: 1 }} />
              <div>
                <div className="label">Score</div>
                <div className="value">{myScore}</div>
              </div>
            </div>

            <div className="divider" />

            {/* Leaderboard */}
            <div>
              <p className="leaderboard-title">🏆 Classement</p>
              <Leaderboard players={leaderboard} username={username} />
            </div>

            {events.length > 0 && (
              <>
                <div className="divider" />
                <div>
                  <p className="leaderboard-title" style={{ marginBottom: 8 }}>📡 Activité</p>
                  <div className="events-feed">
                    {events.map((ev, i) => (
                      <div key={i} className="event-item">{ev}</div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} />
    </>
  );
}
