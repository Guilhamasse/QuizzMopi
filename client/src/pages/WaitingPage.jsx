import React from "react";

export default function WaitingPage({ username, players }) {
  return (
    <div className="waiting-wrapper">
      <div className="waiting-icon">⏳</div>
      <h2>En attente des joueurs…</h2>
      <p className="text-muted">
        Le quiz démarrera automatiquement dès qu'un joueur aura rejoint.
        <br />
        Partage le lien pour inviter tes amis !
      </p>

      <div className="waiting-players">
        {players.map((p) => (
          <span
            key={p.username}
            className={`player-chip ${p.username === username ? "me" : ""}`}
          >
            {p.username}
          </span>
        ))}
      </div>

      <p className="text-small">
        {players.length} joueur{players.length !== 1 ? "s" : ""} connecté{players.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
