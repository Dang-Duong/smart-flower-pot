/* overflow="visible" lets vine paths extend beyond the SVG element box.
   The parent overflow:hidden clips them right at the page edge, giving the
   "line reverses into the border" effect.                               */

export function DaisyFlower({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 140"
      overflow="visible"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* stem */}
      <line x1="60" y1="90" x2="60" y2="135" stroke="#3A6B35" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="45" cy="115" rx="14" ry="8" fill="#3A6B35" transform="rotate(-30 45 115)" />
      {/* vine: down → 90° turn LEFT into left edge */}
      <path
        d="M 60 135 L 60 175 Q 60 192 42 192 L -350 192"
        stroke="#3A6B35" strokeWidth="2" fill="none" strokeLinecap="round"
      />
      {/* petals */}
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i * 360) / 14;
        const rad = (angle * Math.PI) / 180;
        const px = 60 + 28 * Math.sin(rad);
        const py = 60 - 28 * Math.cos(rad);
        return (
          <ellipse
            key={i}
            cx={px} cy={py} rx="7" ry="16"
            fill="white"
            transform={`rotate(${angle} ${px} ${py})`}
          />
        );
      })}
      <circle cx="60" cy="60" r="12" fill="#F5C518" />
    </svg>
  );
}

export function MarigoldFlower({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 140"
      overflow="visible"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* vine: straight UP into top edge */}
      <line x1="60" y1="0" x2="60" y2="-200" stroke="#3A6B35" strokeWidth="2" strokeLinecap="round" />
      {/* stem + leaf */}
      <line x1="60" y1="90" x2="60" y2="135" stroke="#3A6B35" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="75" cy="115" rx="14" ry="8" fill="#3A6B35" transform="rotate(30 75 115)" />
      {/* outer petals */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = i * 45;
        const rad = (angle * Math.PI) / 180;
        const px = 60 + 26 * Math.sin(rad);
        const py = 60 - 26 * Math.cos(rad);
        return (
          <ellipse
            key={i}
            cx={px} cy={py} rx="10" ry="20"
            fill="#E8603C"
            transform={`rotate(${angle} ${px} ${py})`}
          />
        );
      })}
      {/* inner petals */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = i * 45 + 22.5;
        const rad = (angle * Math.PI) / 180;
        const px = 60 + 18 * Math.sin(rad);
        const py = 60 - 18 * Math.cos(rad);
        return (
          <ellipse
            key={i}
            cx={px} cy={py} rx="8" ry="15"
            fill="#E8603C"
            transform={`rotate(${angle} ${px} ${py})`}
          />
        );
      })}
      <circle cx="60" cy="60" r="14" fill="#F5C518" />
      <circle cx="60" cy="60" r="7" fill="#C89B00" />
    </svg>
  );
}

export function VioletFlower({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 140"
      overflow="visible"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* stem + leaf */}
      <line x1="60" y1="90" x2="60" y2="135" stroke="#3A6B35" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="47" cy="118" rx="14" ry="8" fill="#3A6B35" transform="rotate(-25 47 118)" />
      {/* vine: down → 90° turn RIGHT into right edge */}
      <path
        d="M 60 135 L 60 175 Q 60 192 78 192 L 450 192"
        stroke="#3A6B35" strokeWidth="2" fill="none" strokeLinecap="round"
      />
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = i * 72 - 90;
        const rad = (angle * Math.PI) / 180;
        const px = 60 + 24 * Math.cos(rad);
        const py = 60 + 24 * Math.sin(rad);
        return (
          <ellipse
            key={i}
            cx={px} cy={py} rx="14" ry="20"
            fill="#5B2D8E"
            transform={`rotate(${angle + 90} ${px} ${py})`}
          />
        );
      })}
      <circle cx="60" cy="60" r="12" fill="#D4B8F0" />
      <circle cx="60" cy="60" r="6" fill="white" />
    </svg>
  );
}

export function DahliaFlower({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 140"
      overflow="visible"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* stem + leaf */}
      <line x1="60" y1="92" x2="60" y2="135" stroke="#3A6B35" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="44" cy="115" rx="15" ry="8" fill="#3A6B35" transform="rotate(-35 44 115)" />
      {/* vine: straight down (after -90° rotation this goes LEFT into the left wall) */}
      <line x1="60" y1="135" x2="60" y2="320" stroke="#3A6B35" strokeWidth="2" strokeLinecap="round" />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = i * 30;
        const rad = (angle * Math.PI) / 180;
        const px = 60 + 24 * Math.sin(rad);
        const py = 60 - 24 * Math.cos(rad);
        return (
          <ellipse
            key={i}
            cx={px} cy={py} rx="9" ry="18"
            fill="#C17FD0"
            transform={`rotate(${angle} ${px} ${py})`}
          />
        );
      })}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = i * 60 + 15;
        const rad = (angle * Math.PI) / 180;
        const px = 60 + 12 * Math.sin(rad);
        const py = 60 - 12 * Math.cos(rad);
        return (
          <ellipse
            key={i}
            cx={px} cy={py} rx="6" ry="11"
            fill="#C17FD0"
            transform={`rotate(${angle} ${px} ${py})`}
          />
        );
      })}
      <circle cx="60" cy="60" r="10" fill="#F5C518" />
    </svg>
  );
}

export function SakuraFlower({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 140"
      overflow="visible"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* stem + leaf */}
      <line x1="60" y1="90" x2="60" y2="135" stroke="#3A6B35" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="74" cy="113" rx="14" ry="8" fill="#3A6B35" transform="rotate(30 74 113)" />
      {/* vine: straight down (after 90° rotation this goes RIGHT into the right wall) */}
      <line x1="60" y1="135" x2="60" y2="320" stroke="#3A6B35" strokeWidth="2" strokeLinecap="round" />
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = i * 72 - 90;
        const rad = (angle * Math.PI) / 180;
        const px = 60 + 22 * Math.cos(rad);
        const py = 60 + 22 * Math.sin(rad);
        return (
          <ellipse
            key={i}
            cx={px} cy={py} rx="16" ry="22"
            fill="#F0E0C8"
            transform={`rotate(${angle + 90} ${px} ${py})`}
          />
        );
      })}
      <circle cx="60" cy="60" r="11" fill="#F5C518" />
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i * 60) * (Math.PI / 180);
        return (
          <line
            key={i}
            x1="60" y1="60"
            x2={60 + 10 * Math.cos(angle)}
            y2={60 + 10 * Math.sin(angle)}
            stroke="#C89B00" strokeWidth="1.5" strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}
