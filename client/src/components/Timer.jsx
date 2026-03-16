import React from "react";

export default function Timer({ timeLeft, total = 15 }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / total;
  const offset = circumference * (1 - progress);

  const urgency = timeLeft <= 5 ? "urgent" : timeLeft <= 9 ? "warning" : "ok";
  const strokeColor =
    urgency === "urgent" ? "#ef4444" : urgency === "warning" ? "#f59e0b" : "#22c55e";

  return (
    <div className={`timer-ring ${urgency}`}>
      <svg viewBox="0 0 56 56">
        <circle className="track" cx="28" cy="28" r={radius} />
        <circle
          className="fill"
          cx="28"
          cy="28"
          r={radius}
          stroke={strokeColor}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="number">{timeLeft}</div>
    </div>
  );
}
