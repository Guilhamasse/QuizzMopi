import React from "react";

export default function ScoreboardPage({ leaderboard, username, resetCountdown }) {
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const myRank = leaderboard.findIndex((p) => p.username === username) + 1;
  const myScore = leaderboard.find((p) => p.username === username)?.score || 0;

  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <div className="scoreboard-wrapper">
      <div>
        <p style={{ color: "var(--neon)", fontFamily: "Syne", fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          Quiz terminé !
        </p>
        <h2 style={{ fontSize: "clamp(28px, 5vw, 42px)" }}>🏆 Classement Final</h2>
      </div>

      {/* Ta position */}
      <div className="my-score-badge" style={{ alignSelf: "center" }}>
        <div>
          <div className="label">Ta position</div>
          <div className="value">#{myRank}</div>
        </div>
        <div style={{ width: 1, height: 32, background: "var(--border)" }} />
        <div>
          <div className="label">Ton score</div>
          <div className="value">{myScore} pts</div>
        </div>
      </div>

      {/* Podium */}
      {top3.length >= 1 && (
        <div className="podium">
          {podiumOrder.map((p) => {
            const realRank = leaderboard.findIndex((x) => x.username === p.username) + 1;
            return (
              <div className="podium-item" key={p.username}>
                <div className="podium-avatar">
                  {realRank === 1 && <span className="podium-crown">👑</span>}
                  {p.username.charAt(0).toUpperCase()}
                </div>
                <div className="podium-bar">
                  <span style={{ fontSize: 11, color: "var(--text3)", fontFamily: "Syne", fontWeight: 700 }}>
                    #{realRank}
                  </span>
                </div>
                <div className="podium-name">{p.username}</div>
                <div className="podium-pts">{p.score} pts</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reste du classement */}
      {rest.length > 0 && (
        <div className="final-results" style={{ width: "100%" }}>
          {rest.map((p, i) => (
            <div
              key={p.username}
              className="final-item"
              style={p.username === username ? { borderColor: "rgba(124,58,237,0.4)" } : {}}
            >
              <span className="final-rank">#{i + 4}</span>
              <span className="final-name">{p.username}{p.username === username ? " (moi)" : ""}</span>
              <span className="final-score">{p.score} pts</span>
            </div>
          ))}
        </div>
      )}

      {/* Countdown reset */}
      {resetCountdown !== null && resetCountdown > 0 && (
        <p className="text-small" style={{ marginTop: 8 }}>
          Nouvelle partie dans{" "}
          <strong style={{ color: "var(--neon)" }}>{resetCountdown}s</strong>…
        </p>
      )}
    </div>
  );
}
