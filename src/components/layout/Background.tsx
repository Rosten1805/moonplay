'use client'

export function Background() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute inset-0 bg-synth-bg" />

      {/* Top violet glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 75% 55% at 50% -5%, rgba(168,85,247,0.18) 0%, transparent 65%)',
        }}
      />

      {/* Bottom pink warmth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 45% at 50% 110%, rgba(236,72,153,0.10) 0%, transparent 60%)',
        }}
      />

      {/* Mid purple haze — left */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 60% at -10% 50%, rgba(168,85,247,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: [
            'linear-gradient(rgba(168,85,247,1) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(168,85,247,1) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '80px 80px',
        }}
      />
    </div>
  )
}
