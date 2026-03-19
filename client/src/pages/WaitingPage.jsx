import React from "react";

export default function WaitingPage({ username, players, waitingInfo, countdown }) {
  const missing = waitingInfo ? waitingInfo.needed - waitingInfo.current : null;

  return (
    <div className="waiting-wrapper">

      {countdown !== null ? (
        <>
          <div className="waiting-icon" style={{ fontSize: 42, animation: "none", background: "rgba(34,197,94,0.15)", borderColor: "var(--green)" }}>
            {countdown}
          </div>
          <h2 style={{ color: "var(--green)" }}>Le quiz démarre !</h2>
          <p className="text-muted">Prépare-toi…</p>
        </>
      ) : (
        <>
          <div className="waiting-icon">⏳</div>
          <h2>En attente des joueurs…</h2>

          {missing !== null && missing > 0 ? (
            <p className="text-muted">
              Encore <strong style={{ color: "var(--neon)" }}>{missing} joueur{missing > 1 ? "s" : ""}</strong> pour démarrer.
              <br />
              Partage le lien pour inviter tes amis !
            </p>
          ) : (
            <p className="text-muted">Le quiz va démarrer très bientôt…</p>
          )}
        </>
      )}

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
        {waitingInfo ? ` · minimum ${waitingInfo.needed} requis` : ""}
      </p>
    </div>
  );
}
