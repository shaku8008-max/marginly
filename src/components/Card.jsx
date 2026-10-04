/**
 * Card wrapper component for content sections.
 * Uses GlowCard from 21st.dev for spotlight effect.
 * Provides consistent styling with shadow and padding.
 *
 * Props:
 * - children: content to display inside the card
 * - className: string - additional CSS classes
 * - glowColor: 'blue' | 'purple' | 'green' | 'red' | 'orange' - glow color
 * - tone: string - industry themeKey (from industryThemes.js) or "neutral"
 *   Applies matching bg, border, and left-accent classes from the theme.
 */
import GlowCard from "./ui/spotlight-card";
import industryThemes from "../data/industryThemes";

export default function Card({ children, className = "", glowColor = "blue", tone = "neutral", onClick }) {
  const theme = industryThemes[tone] || industryThemes.neutral;

  // Compose theme classes: background, border colour, and a subtle left accent
  const toneClasses = `${theme.bg} ${theme.border} border-l-4 ${theme.accent}`;

  return (
    <GlowCard
      glowColor={glowColor}
      customSize={true}
      className={`${toneClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </GlowCard>
  );
}