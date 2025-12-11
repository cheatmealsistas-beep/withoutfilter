/**
 * Fragmentation to Unity Illustration
 * Represents the journey from chaos/fragmentation to unified solution
 * Minimalist design with terracotta color (#D87D4A)
 */

export function FragmentationUnityIllustration() {
  return (
    <svg
      viewBox="0 0 800 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      aria-label="Illustration showing fragmentation transforming into unity"
    >
      {/* Left side: Dispersed blocks (chaos/fragmentation) */}
      <g id="fragmented-blocks" opacity="0.9">
        {/* Small scattered blocks */}
        <rect
          x="50"
          y="80"
          width="60"
          height="60"
          rx="8"
          fill="#D87D4A"
          opacity="0.7"
        />
        <rect
          x="30"
          y="180"
          width="50"
          height="50"
          rx="8"
          fill="#D87D4A"
          opacity="0.6"
        />
        <rect
          x="140"
          y="120"
          width="55"
          height="55"
          rx="8"
          fill="#D87D4A"
          opacity="0.75"
        />
        <rect
          x="110"
          y="240"
          width="45"
          height="45"
          rx="8"
          fill="#D87D4A"
          opacity="0.65"
        />
        <rect
          x="60"
          y="300"
          width="50"
          height="50"
          rx="8"
          fill="#D87D4A"
          opacity="0.7"
        />
        <rect
          x="170"
          y="200"
          width="40"
          height="40"
          rx="8"
          fill="#D87D4A"
          opacity="0.6"
        />
        <rect
          x="150"
          y="310"
          width="48"
          height="48"
          rx="8"
          fill="#D87D4A"
          opacity="0.68"
        />
      </g>

      {/* Center: Flow lines (subtle arrows/movement) */}
      <g id="flow-arrows" opacity="0.4">
        {/* Dotted lines showing flow */}
        <path
          d="M 220 120 Q 350 120, 450 150"
          stroke="#D87D4A"
          strokeWidth="2"
          strokeDasharray="8 8"
          fill="none"
        />
        <path
          d="M 230 180 Q 350 190, 450 200"
          stroke="#D87D4A"
          strokeWidth="2"
          strokeDasharray="8 8"
          fill="none"
        />
        <path
          d="M 220 240 Q 350 250, 450 250"
          stroke="#D87D4A"
          strokeWidth="2"
          strokeDasharray="8 8"
          fill="none"
        />

        {/* Arrow heads */}
        <polygon
          points="450,145 465,150 450,155"
          fill="#D87D4A"
          opacity="0.6"
        />
        <polygon
          points="450,195 465,200 450,205"
          fill="#D87D4A"
          opacity="0.6"
        />
        <polygon
          points="450,245 465,250 450,255"
          fill="#D87D4A"
          opacity="0.6"
        />
      </g>

      {/* Right side: Unified large block (solution) */}
      <g id="unified-block">
        <rect
          x="520"
          y="100"
          width="230"
          height="200"
          rx="16"
          fill="#D87D4A"
          opacity="0.95"
        />

        {/* Inner details to show structure */}
        <g opacity="0.3">
          <rect
            x="540"
            y="120"
            width="80"
            height="40"
            rx="6"
            fill="white"
          />
          <rect
            x="540"
            y="175"
            width="80"
            height="40"
            rx="6"
            fill="white"
          />
          <rect
            x="540"
            y="230"
            width="80"
            height="40"
            rx="6"
            fill="white"
          />

          <rect
            x="655"
            y="120"
            width="80"
            height="40"
            rx="6"
            fill="white"
          />
          <rect
            x="655"
            y="175"
            width="80"
            height="40"
            rx="6"
            fill="white"
          />
          <rect
            x="655"
            y="230"
            width="80"
            height="40"
            rx="6"
            fill="white"
          />
        </g>

        {/* Subtle shadow */}
        <rect
          x="525"
          y="305"
          width="230"
          height="8"
          rx="4"
          fill="#000000"
          opacity="0.08"
        />
      </g>

      {/* Background decorative elements */}
      <g id="background-dots" opacity="0.15">
        <circle cx="300" cy="60" r="3" fill="#D87D4A" />
        <circle cx="380" cy="90" r="2" fill="#D87D4A" />
        <circle cx="320" cy="340" r="3" fill="#D87D4A" />
        <circle cx="420" cy="320" r="2" fill="#D87D4A" />
      </g>
    </svg>
  );
}

/**
 * Responsive wrapper for the illustration
 */
interface FragmentationUnityProps {
  className?: string;
}

export function FragmentationUnity({ className = '' }: FragmentationUnityProps) {
  return (
    <div className={`w-full max-w-3xl mx-auto ${className}`}>
      <FragmentationUnityIllustration />
    </div>
  );
}
