const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const questions = require("./questions");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ─── État global du quiz ───────────────────────────────────────────────────────
let players = {};      // { socketId: { username, score, answered } }
let currentQuestionIndex = -1;
let quizStarted = false;
let timerInterval = null;
let timeLeft = 0;
const QUESTION_DURATION = 15;
const MIN_PLAYERS = 1;

// ─── REST API ──────────────────────────────────────────────────────────────────
app.get("/questions", (req, res) => {
  res.json(questions.map(({ question, options }) => ({ question, options })));
});

app.get("/status", (req, res) => {
  res.json({
    players: Object.keys(players).length,
    quizStarted,
    currentQuestionIndex,
  });
});

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getLeaderboard() {
  return Object.values(players)
    .map(({ username, score }) => ({ username, score }))
    .sort((a, b) => b.score - a.score);
}

function broadcastPlayers() {
  io.emit("playersUpdate", {
    players: Object.values(players).map(({ username, score }) => ({ username, score })),
  });
}

function sendQuestion() {
  if (currentQuestionIndex >= questions.length) {
    endQuiz();
    return;
  }

  const q = questions[currentQuestionIndex];

  // Réinitialiser le flag "answered" pour chaque joueur
  Object.keys(players).forEach((id) => {
    players[id].answered = false;
    players[id].lastAnswerCorrect = null;
  });

  io.emit("newQuestion", {
    question: q.question,
    options: q.options,
    questionIndex: currentQuestionIndex,
    totalQuestions: questions.length,
    timeLeft: QUESTION_DURATION,
  });

  startTimer();
}

function startTimer() {
  clearInterval(timerInterval);
  timeLeft = QUESTION_DURATION;

  timerInterval = setInterval(() => {
    timeLeft -= 1;
    io.emit("timerUpdate", { timeLeft });

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      revealAnswerAndNext();
    }
  }, 1000);
}

function revealAnswerAndNext() {
  const q = questions[currentQuestionIndex];
  io.emit("revealAnswer", {
    correctIndex: q.answer,
    leaderboard: getLeaderboard(),
  });

  setTimeout(() => {
    currentQuestionIndex += 1;
    if (currentQuestionIndex >= questions.length) {
      endQuiz();
    } else {
      sendQuestion();
    }
  }, 3000);
}

function endQuiz() {
  quizStarted = false;
  clearInterval(timerInterval);
  io.emit("quizEnd", { leaderboard: getLeaderboard() });

  // Reset pour une nouvelle partie dans 10 secondes
  setTimeout(() => {
    resetQuiz();
  }, 10000);
}

function resetQuiz() {
  currentQuestionIndex = -1;
  quizStarted = false;
  Object.keys(players).forEach((id) => {
    players[id].score = 0;
    players[id].answered = false;
    players[id].lastAnswerCorrect = null;
  });
  broadcastPlayers();
  io.emit("gameReset", { message: "Nouvelle partie dans quelques instants..." });
}

function tryStartQuiz() {
  const playerCount = Object.keys(players).length;
  if (!quizStarted && playerCount >= MIN_PLAYERS) {
    quizStarted = true;
    currentQuestionIndex = 0;
    io.emit("quizStart", { message: "Le quiz commence !" });
    setTimeout(() => sendQuestion(), 2000);
  }
}

// ─── Socket.io Events ──────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`🔌 Connexion: ${socket.id}`);

  // Envoyer l'état courant au nouveau connecté
  if (quizStarted && currentQuestionIndex >= 0 && currentQuestionIndex < questions.length) {
    const q = questions[currentQuestionIndex];
    socket.emit("newQuestion", {
      question: q.question,
      options: q.options,
      questionIndex: currentQuestionIndex,
      totalQuestions: questions.length,
      timeLeft,
    });
  }

  // ── joinGame ────────────────────────────────────────────────────────────────
  socket.on("joinGame", ({ username }) => {
    const trimmed = username.trim().slice(0, 20);
    if (!trimmed) return;

    players[socket.id] = {
      username: trimmed,
      score: 0,
      answered: false,
      lastAnswerCorrect: null,
    };

    console.log(`✅ ${trimmed} a rejoint la partie`);

    socket.emit("joinedGame", {
      username: trimmed,
      leaderboard: getLeaderboard(),
      quizStarted,
    });

    broadcastPlayers();
    io.emit("playerJoined", { username: trimmed });

    tryStartQuiz();
  });

  // ── submitAnswer ────────────────────────────────────────────────────────────
  socket.on("submitAnswer", ({ answerIndex }) => {
    const player = players[socket.id];
    if (!player || player.answered || !quizStarted) return;
    if (currentQuestionIndex < 0 || currentQuestionIndex >= questions.length) return;

    player.answered = true;
    const correct = questions[currentQuestionIndex].answer === answerIndex;

    if (correct) {
      // Bonus de rapidité : plus on répond vite, plus on gagne
      const bonus = Math.ceil((timeLeft / QUESTION_DURATION) * 50);
      player.score += 100 + bonus;
      player.lastAnswerCorrect = true;
    } else {
      player.lastAnswerCorrect = false;
    }

    const leaderboard = getLeaderboard();

    // Confirmer au joueur qui a répondu
    socket.emit("answerResult", {
      correct,
      correctIndex: questions[currentQuestionIndex].answer,
      score: player.score,
    });

    // Diffuser le nouveau classement à tous
    io.emit("scoreUpdate", {
      leaderboard,
      message: correct
        ? `🎯 ${player.username} a répondu correctement !`
        : `❌ ${player.username} a répondu`,
    });

    // Vérifier si tous les joueurs ont répondu
    const allAnswered = Object.values(players).every((p) => p.answered);
    if (allAnswered) {
      clearInterval(timerInterval);
      revealAnswerAndNext();
    }
  });

  // ── disconnect ──────────────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    const player = players[socket.id];
    if (player) {
      console.log(`🔴 ${player.username} a quitté la partie`);
      io.emit("playerLeft", { username: player.username });
      delete players[socket.id];
      broadcastPlayers();
    }
  });
});

// ─── Démarrage ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🚀 Serveur Quiz démarré sur http://localhost:${PORT}`);
  console.log(`📋 ${questions.length} questions chargées`);
  console.log(`👥 Joueurs minimum pour démarrer : ${MIN_PLAYERS}\n`);
});