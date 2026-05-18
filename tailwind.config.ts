import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#A855F7',   // violet-500
          light: '#C084FC',     // violet-400
          muted: 'rgba(168,85,247,0.14)',
          dim: 'rgba(168,85,247,0.35)',
        },
        pink: {
          accent: '#EC4899',    // pink-500 — for mp3 / secondary
          muted: 'rgba(236,72,153,0.12)',
        },
        synth: {
          bg: '#0C0118',
          'bg-2': '#120825',
          'bg-3': '#1C0E3A',
          card: 'rgba(18,8,37,0.93)',
          border: '#3D1872',
          'border-bright': 'rgba(168,85,247,0.35)',
          text: '#EDE9FE',
          'text-dim': '#7C5FA0',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        orbitron: ['Orbitron', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(90deg, #A855F7 0%, #EC4899 100%)',
        'accent-gradient-v': 'linear-gradient(180deg, #A855F7 0%, #EC4899 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(168,85,247,0.05) 0%, rgba(236,72,153,0.03) 100%)',
      },
      boxShadow: {
        'accent': '0 0 14px rgba(168,85,247,0.45), 0 0 32px rgba(168,85,247,0.15)',
        'accent-sm': '0 0 8px rgba(168,85,247,0.35)',
        'card': '0 0 0 1px #3D1872, 0 4px 24px rgba(0,0,0,0.65)',
        'card-hover': '0 0 0 1px rgba(168,85,247,0.3), 0 4px 32px rgba(0,0,0,0.7)',
      },
      animation: {
        'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'progress-glow': 'progressGlow 1.5s ease-in-out infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        progressGlow: {
          '0%, 100%': { boxShadow: '0 0 6px rgba(168,85,247,0.6)' },
          '50%': { boxShadow: '0 0 18px rgba(236,72,153,0.7)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
