/**
 * Tools to Unified App - Modulary Hero Illustration
 *
 * Concepto: Múltiples logos de herramientas dispersas (izquierda)
 * → Flechas convergentes (centro)
 * → Logo único de Modulary unificado (derecha)
 */

export function ToolsToUnifiedIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 500"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Tools converging into Modulary unified app"
    >
      <defs>
        {/* Gradientes para depth */}
        <linearGradient id="skyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* Izquierda: Tools dispersos (caos) */}
      <g id="scattered-tools">
        {/* Drive icon */}
        <g transform="translate(50, 60)">
          <rect width="70" height="70" rx="12" fill="#4285F4" opacity="0.7" />
          <path d="M30 35 L40 35 L40 50 L30 50 Z" fill="white" />
        </g>

        {/* Zoom icon */}
        <g transform="translate(30, 160)">
          <circle cx="35" cy="35" r="35" fill="#2D8CFF" opacity="0.7" />
          <circle cx="35" cy="35" r="18" fill="white" />
        </g>

        {/* Notion icon */}
        <g transform="translate(60, 280)">
          <rect width="65" height="65" rx="10" fill="#000000" opacity="0.7" />
          <rect x="15" y="15" width="35" height="35" rx="3" fill="white" />
        </g>

        {/* Email icon */}
        <g transform="translate(80, 390)">
          <rect width="80" height="60" rx="8" fill="#EA4335" opacity="0.7" />
          <path d="M15 20 L40 35 L65 20" stroke="white" strokeWidth="3" fill="none" />
        </g>

        {/* Calendar icon */}
        <g transform="translate(10, 370)">
          <rect width="60" height="70" rx="8" fill="#1A73E8" opacity="0.7" />
          <rect x="10" y="20" width="40" height="40" fill="white" opacity="0.9" />
        </g>

        {/* Payment icon */}
        <g transform="translate(140, 120)">
          <rect width="75" height="50" rx="8" fill="#6772E5" opacity="0.7" />
          <rect x="15" y="15" width="45" height="20" rx="3" fill="white" />
        </g>
      </g>

      {/* Centro: Flechas convergentes */}
      <g id="convergence-arrows" opacity="0.6">
        {/* Arrow paths - todas apuntando al centro-derecha */}
        <path
          d="M 140 100 Q 300 100, 420 240"
          stroke="url(#skyGradient)"
          strokeWidth="3"
          fill="none"
          strokeDasharray="10 5"
        />
        <path
          d="M 110 200 Q 280 200, 420 250"
          stroke="url(#skyGradient)"
          strokeWidth="3"
          fill="none"
          strokeDasharray="10 5"
        />
        <path
          d="M 130 320 Q 300 300, 420 260"
          stroke="url(#skyGradient)"
          strokeWidth="3"
          fill="none"
          strokeDasharray="10 5"
        />
        <path
          d="M 160 410 Q 310 380, 420 270"
          stroke="url(#skyGradient)"
          strokeWidth="3"
          fill="none"
          strokeDasharray="10 5"
        />

        {/* Arrow heads */}
        <polygon points="420,235 430,240 420,245" fill="#0EA5E9" opacity="0.8" />
        <polygon points="420,245 430,250 420,255" fill="#0EA5E9" opacity="0.8" />
        <polygon points="420,255 430,260 420,265" fill="#8B5CF6" opacity="0.8" />
        <polygon points="420,265 430,270 420,275" fill="#8B5CF6" opacity="0.8" />
      </g>

      {/* Derecha: Modulary Unified App */}
      <g id="unified-modulary" transform="translate(480, 150)">
        {/* Contenedor principal - más grande, más prominente */}
        <rect
          width="280"
          height="200"
          rx="20"
          fill="url(#skyGradient)"
          filter="drop-shadow(0 10px 30px rgba(14, 165, 233, 0.3))"
        />

        {/* Logo Modulary (3 módulos) - en el centro */}
        <g transform="translate(90, 60)">
          {/* Módulo izquierdo */}
          <rect x="0" y="20" width="22" height="40" rx="6" fill="white" opacity="0.95" />

          {/* Módulo central (más alto) */}
          <rect x="30" y="0" width="22" height="60" rx="6" fill="white" opacity="0.95" />

          {/* Módulo derecho */}
          <rect x="60" y="20" width="22" height="40" rx="6" fill="white" opacity="0.95" />

          {/* Líneas de conexión sutiles */}
          <line x1="22" y1="40" x2="30" y2="30" stroke="white" strokeWidth="2" opacity="0.5" />
          <line x1="52" y1="30" x2="60" y2="40" stroke="white" strokeWidth="2" opacity="0.5" />
        </g>

        {/* Texto "Modulary" */}
        <text x="140" y="140" fontFamily="Poppins, sans-serif" fontSize="24" fontWeight="700" fill="white" textAnchor="middle">
          Modulary
        </text>

        {/* Subtext "All in One" */}
        <text x="140" y="165" fontFamily="Inter, sans-serif" fontSize="14" fill="white" opacity="0.9" textAnchor="middle">
          All in One
        </text>

        {/* Indicadores de features unificados (iconos pequeños) */}
        <g transform="translate(40, 25)">
          <circle cx="5" cy="5" r="3" fill="white" opacity="0.6" />
          <circle cx="205" cy="5" r="3" fill="white" opacity="0.6" />
          <circle cx="5" cy="150" r="3" fill="white" opacity="0.6" />
          <circle cx="205" cy="150" r="3" fill="white" opacity="0.6" />
        </g>
      </g>

      {/* Decoración: partículas flotantes */}
      <g id="particles" opacity="0.4">
        <circle cx="250" cy="80" r="3" fill="#8B5CF6" />
        <circle cx="320" cy="140" r="2" fill="#0EA5E9" />
        <circle cx="380" cy="200" r="2.5" fill="#8B5CF6" />
        <circle cx="290" cy="350" r="3" fill="#0EA5E9" />
        <circle cx="360" cy="420" r="2" fill="#8B5CF6" />
      </g>
    </svg>
  );
}
