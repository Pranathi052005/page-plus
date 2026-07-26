import React, { useState, useEffect } from 'react';

export default function ScoreRing({ score }) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    // Reset and animate the score count up
    let start = 0;
    const end = parseInt(score, 10) || 0;
    if (end === 0) {
      setDisplayScore(0);
      return;
    }

    const duration = 1000; // 1 second animation
    const startTime = performance.now();

    function animate(currentTime) {
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      
      // Easing function (easeOutQuad)
      const easeProgress = progress * (2 - progress);
      const currentScore = Math.floor(easeProgress * end);

      setDisplayScore(currentScore);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayScore(end);
      }
    }

    requestAnimationFrame(animate);
  }, [score]);

  // Circumference of our SVG circle: r = 58, 2 * pi * r = 364.4
  const radius = 58;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  // Determine active colors based on score value
  let accentColorClass = 'text-cyber-accent-red';
  let glowClass = 'glow-red';
  let ratingLabel = 'CRITICAL';
  
  if (score >= 80) {
    accentColorClass = 'text-cyber-accent-green';
    glowClass = 'glow-green';
    ratingLabel = 'EXCELLENT';
  } else if (score >= 50) {
    accentColorClass = 'text-cyber-accent-amber';
    glowClass = 'glow-amber';
    ratingLabel = 'NEEDS WORK';
  } else if (score > 0) {
    ratingLabel = 'POOR SEO';
  } else {
    ratingLabel = 'UNREACHABLE';
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-cyber-surface border border-cyber-border rounded-xl shadow-lg relative overflow-hidden scanline-container">
      {/* Visual background elements */}
      <div className="absolute inset-0 grid-background opacity-20 pointer-events-none"></div>
      
      <div className="relative flex items-center justify-center w-40 h-40">
        {/* Track circle (deep gray) */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-[#131722] fill-transparent"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className={`stroke-current ${accentColorClass} transition-all duration-300 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 4px currentColor)`,
            }}
          />
        </svg>
        
        {/* Text score in center */}
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl font-extrabold tracking-tight text-white font-mono leading-none">
            {displayScore}
          </span>
          <span className="text-[10px] text-gray-500 font-mono tracking-widest mt-1">/ 100</span>
        </div>
      </div>

      <div className="mt-4 text-center z-10">
        <h4 className="text-xs text-gray-400 font-mono uppercase tracking-widest">Health Score</h4>
        <p className={`text-sm font-bold mt-1 font-mono tracking-wider ${accentColorClass}`}>
          {ratingLabel}
        </p>
      </div>
    </div>
  );
}
