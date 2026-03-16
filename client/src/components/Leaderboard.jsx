import React from "react";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard({ players, username }) {
  return (
    <div className="leaderboard-list">
      {players.length === 0 && (
        <p className="text-small" style={{ textAlign: "center", padding: "16px 0" }}>
          Aucun joueur pour l'instant…
        </p>
      )}
      {players.map((p, i) => (
        <div
          key={p.username}
          className={`lb-item rank-${i + 1} ${p.username === username ? "is-me" : ""}`}
        >
          <span className="lb-rank">
            {i < 3 ? MEDALS[i] : `#${i + 1}`}
          </span>
          <span className="lb-name">{p.username}</span>
          <span className="lb-score">{p.score} pts</span>
        </div>
      ))}
    </div>
  );
}
