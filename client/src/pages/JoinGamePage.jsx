import React, { useState } from "react";

export default function JoinGamePage({ onJoin, playerCount }) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;
    setLoading(true);
    onJoin(trimmed);
  };

  return (
    <div className="join-wrapper">
      <div className="join-logo">
        <div className="logo-tag">⚡ Live Quiz</div>
        <h1>QuizLive</h1>
        <p>Le quiz multijoueur en temps réel</p>
      </div>

      <div className="card join-card">
        <div className="input-group">
          <label className="input-label">Ton pseudo</label>
          <input
            className="input"
            type="text"
            placeholder="Ex: AlexLeMaster42"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            maxLength={20}
            autoFocus
          />
        </div>

        <button
          className="btn btn-primary btn-full"
          onClick={handleSubmit}
          disabled={!username.trim() || loading}
        >
          {loading ? "Connexion…" : "Rejoindre la partie →"}
        </button>

        <div className="online-count">
          <span className="online-dot" />
          {playerCount} joueur{playerCount !== 1 ? "s" : ""} en ligne
        </div>
      </div>
    </div>
  );
}
