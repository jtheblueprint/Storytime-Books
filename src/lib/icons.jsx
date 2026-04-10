"use client";

// Sticker doodle icons with watercolor blob backgrounds
// Each icon has a soft ellipse blob behind clean doodle strokes

export function IconBook({ size = 28, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <ellipse cx="16" cy="16" rx="14" ry="13" fill="var(--blob1)" transform="rotate(-4 16 16)" />
      <path d="M9 6c-.5.5-1 1.5-1 3v12c0 2 1 3 3 3h10c2 0 3-1 3-3V9c0-1.5-.5-2.5-1-3" stroke="var(--crayonStroke)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M8 27c0-1 0-3 2-3h12c2 0 2 2 2 3" stroke="var(--crayonStroke)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M13 11h6M13 15h4" stroke="var(--crayonStroke)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconShelf({ size = 28, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <ellipse cx="16" cy="16" rx="15" ry="13" fill="var(--blob2)" transform="rotate(3 16 16)" />
      <rect x="4" y="24" width="24" height="2.5" rx="1" stroke="var(--crayonStroke)" strokeWidth="2" strokeLinecap="round" />
      <rect x="7" y="8" width="5" height="16" rx="1.5" stroke="var(--crayonStroke)" strokeWidth="2" strokeLinecap="round" />
      <rect x="13.5" y="10" width="5" height="14" rx="1.5" stroke="var(--crayonStroke)" strokeWidth="2" strokeLinecap="round" />
      <rect x="20" y="6" width="5" height="18" rx="1.5" stroke="var(--crayonStroke)" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 12h1M15.5 14h1M22 10h1" stroke="var(--crayonStroke)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconDice({ size = 28, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <ellipse cx="16" cy="17" rx="14" ry="12" fill="var(--blob3)" transform="rotate(-6 16 17)" />
      <rect x="6" y="6" width="20" height="20" rx="4" stroke="var(--crayonStroke)" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="11" cy="11" r="1.8" fill="var(--crayonStroke)" />
      <circle cx="16" cy="16" r="1.8" fill="var(--crayonStroke)" />
      <circle cx="21" cy="21" r="1.8" fill="var(--crayonStroke)" />
      <circle cx="21" cy="11" r="1.8" fill="var(--crayonStroke)" />
      <circle cx="11" cy="21" r="1.8" fill="var(--crayonStroke)" />
    </svg>
  );
}

export function IconPlus({ size = 28, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <ellipse cx="16" cy="16" rx="13" ry="14" fill="var(--blob1)" transform="rotate(8 16 16)" />
      <circle cx="16" cy="16" r="11" stroke="var(--crayonStroke)" strokeWidth="2.2" />
      <path d="M11 16h10M16 11v10" stroke="var(--crayonStroke)" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function IconGear({ size = 28, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <ellipse cx="16" cy="16" rx="14" ry="13" fill="var(--blob2)" transform="rotate(5 16 16)" />
      <circle cx="16" cy="16" r="4" stroke="var(--crayonStroke)" strokeWidth="2" />
      <path d="M16 4v4M16 24v4M4 16h4M24 16h4M7.5 7.5l3 3M21.5 21.5l3 3M7.5 24.5l3-3M21.5 10.5l3-3" stroke="var(--crayonStroke)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconHome({ size = 28, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <ellipse cx="16" cy="17" rx="14" ry="13" fill="var(--blob3)" transform="rotate(-3 16 17)" />
      <path d="M6 15l10-9 10 9" stroke="var(--crayonStroke)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 14v10c0 1 .5 2 2 2h12c1.5 0 2-1 2-2V14" stroke="var(--crayonStroke)" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="13" y="20" width="6" height="6" rx="1" stroke="var(--crayonStroke)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconCheck({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <ellipse cx="12" cy="12" rx="11" ry="10" fill="var(--blob1)" transform="rotate(4 12 12)" />
      <path d="M6 12.5l4 4 8-8" stroke="var(--crayonStroke)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSearch({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="10" cy="10" r="6" stroke="var(--crayonStroke)" strokeWidth="2.2" />
      <path d="M14.5 14.5l5 5" stroke="var(--crayonStroke)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconStar({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <ellipse cx="12" cy="12" rx="11" ry="10.5" fill="var(--blob2)" transform="rotate(-5 12 12)" />
      <path d="M12 4l2.5 5 5.5.8-4 3.8 1 5.4-5-2.6-5 2.6 1-5.4-4-3.8 5.5-.8z" stroke="var(--crayonStroke)" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export function IconDownload({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 4v12M8 12l4 4 4-4M6 18h12" stroke="var(--crayonStroke)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconUpload({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 16V4M8 8l4-4 4 4M6 18h12" stroke="var(--crayonStroke)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconTrash({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13" stroke="var(--crayonStroke)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconMoon({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M20 14c-1.5 1-3.5 1.5-5.5 1.5C9.5 15.5 5.5 11.5 5.5 6.5c0-2 .5-4 1.5-5.5C3.5 2.5 1 6 1 10c0 5.5 4.5 10 10 10 4 0 7.5-2.5 9-6z" stroke="var(--crayonStroke)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSun({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="4" stroke="var(--crayonStroke)" strokeWidth="2" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" stroke="var(--crayonStroke)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconPalette({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <ellipse cx="12" cy="12" rx="11" ry="10" fill="var(--blob3)" transform="rotate(3 12 12)" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1 0 2-.8 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1 .8-1.8 1.8-1.8H17c3.3 0 5-2.2 5-5C22 6.2 17.5 2 12 2z" stroke="var(--crayonStroke)" strokeWidth="1.8" />
      <circle cx="8" cy="10" r="1.5" fill="var(--crayonStroke)" />
      <circle cx="12" cy="7" r="1.5" fill="var(--crayonStroke)" />
      <circle cx="16.5" cy="10" r="1.5" fill="var(--crayonStroke)" />
    </svg>
  );
}
