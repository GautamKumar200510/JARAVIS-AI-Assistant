import React from 'react';

interface JarvisLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const JarvisLogo: React.FC<JarvisLogoProps> = ({ 
  className = '', 
  size = 28,
  glow = true
}) => {
  const uniqueId = React.useId().replace(/:/g, '_');
  const gradientId = `jarvis_cyan_grad_${uniqueId}`;
  const coreGradId = `jarvis_core_grad_${uniqueId}`;
  const filterId = `jarvis_glow_${uniqueId}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none shrink-0 ${className}`}
    >
      <defs>
        {/* Core Vibrant Cyan/Blue Gradient */}
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="45%" stopColor="#00f0ff" />
          <stop offset="85%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>

        {/* Inner Core Bright White-Cyan Gradient */}
        <radialGradient id={coreGradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#a5f3fc" />
          <stop offset="75%" stopColor="#00f0ff" />
          <stop offset="100%" stopColor="#0284c7" />
        </radialGradient>

        {/* Holographic Glow Filter */}
        {glow && (
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        )}
      </defs>

      {/* Group with glow filter */}
      <g filter={glow ? `url(#${filterId})` : undefined}>
        {/* 1. Outer Thin Circuit Ring */}
        <circle
          cx="50"
          cy="50"
          r="46"
          stroke={`url(#${gradientId})`}
          strokeWidth="1.5"
          strokeOpacity="0.4"
          strokeDasharray="4 3"
        />

        {/* 2. Outer Segmented Reactor Ring with notches */}
        <circle
          cx="50"
          cy="50"
          r="41"
          stroke={`url(#${gradientId})`}
          strokeWidth="2.5"
          strokeOpacity="0.85"
        />

        {/* 3. 10 Arc Reactor Coils (10 radial trapezoids/segments around perimeter) */}
        {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg) => (
          <g key={deg} transform={`rotate(${deg} 50 50)`}>
            {/* Reactor Coil Block */}
            <path
              d="M46.5 12 L53.5 12 L52.5 21 L47.5 21 Z"
              fill={`url(#${gradientId})`}
              fillOpacity="0.9"
            />
            {/* Tiny outer tick */}
            <line
              x1="50"
              y1="4"
              x2="50"
              y2="8"
              stroke="#67e8f9"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        ))}

        {/* 4. Middle Concentric HUD Rings */}
        <circle
          cx="50"
          cy="50"
          r="30"
          stroke={`url(#${gradientId})`}
          strokeWidth="1.8"
          strokeOpacity="0.75"
        />

        {/* 5. Inner Arc Segmented Compass Ring */}
        <circle
          cx="50"
          cy="50"
          r="23"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeDasharray="14 6"
          strokeOpacity="0.9"
        />

        {/* 6. Inverted Triangle / Reactor Core Geometry (Iconic Arc Reactor shape) */}
        <polygon
          points="50,28 67,58 33,58"
          stroke={`url(#${gradientId})`}
          strokeWidth="2"
          fill="none"
          strokeOpacity="0.85"
          strokeLinejoin="round"
        />

        {/* 7. Center Power Node / Core Pulsing Crystal */}
        <circle
          cx="50"
          cy="50"
          r="10"
          fill={`url(#${coreGradId})`}
          className="animate-pulse"
        />

        {/* 8. Center Point */}
        <circle
          cx="50"
          cy="50"
          r="4"
          fill="#ffffff"
        />

        {/* 9. Crosshair Coordinates */}
        <line x1="50" y1="21" x2="50" y2="25" stroke="#ffffff" strokeWidth="1.5" />
        <line x1="50" y1="75" x2="50" y2="79" stroke="#ffffff" strokeWidth="1.5" />
        <line x1="21" y1="50" x2="25" y2="50" stroke="#ffffff" strokeWidth="1.5" />
        <line x1="75" y1="50" x2="79" y2="50" stroke="#ffffff" strokeWidth="1.5" />
      </g>
    </svg>
  );
};
