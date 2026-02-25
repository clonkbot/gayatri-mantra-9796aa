import { useState, useRef, useEffect, useCallback } from 'react';

const GAYATRI_MANTRA = 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्';

// Web Audio API based mantra chant synthesizer
function createMantraSound(audioContext: AudioContext): OscillatorNode[] {
  const oscillators: OscillatorNode[] = [];
  const masterGain = audioContext.createGain();
  masterGain.gain.value = 0.15;
  masterGain.connect(audioContext.destination);

  // Sacred frequencies based on ancient Vedic tuning
  const frequencies = [136.1, 272.2, 408.3]; // Based on OM frequency

  frequencies.forEach((freq, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = i === 0 ? 'sine' : 'triangle';
    osc.frequency.value = freq;
    gain.gain.value = i === 0 ? 0.4 : 0.2;

    // Gentle vibrato
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    lfo.frequency.value = 0.5 + i * 0.2;
    lfoGain.gain.value = 2;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();

    osc.connect(gain);
    gain.connect(masterGain);
    oscillators.push(osc);
  });

  return oscillators;
}

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const particleIdRef = useRef(0);

  // Generate floating particles
  useEffect(() => {
    const initialParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    }));
    setParticles(initialParticles);
  }, []);

  const toggleMantra = useCallback(() => {
    if (!isPlaying) {
      // Start playing
      audioContextRef.current = new AudioContext();
      oscillatorsRef.current = createMantraSound(audioContextRef.current);
      oscillatorsRef.current.forEach(osc => osc.start());
      setIsPlaying(true);

      // Add burst particles on activation
      const burstParticles = Array.from({ length: 12 }, () => ({
        id: particleIdRef.current++,
        x: 50 + (Math.random() - 0.5) * 20,
        y: 50 + (Math.random() - 0.5) * 20,
        delay: 0,
      }));
      setParticles(prev => [...prev, ...burstParticles]);
    } else {
      // Stop playing with fade out
      if (audioContextRef.current && oscillatorsRef.current.length > 0) {
        oscillatorsRef.current.forEach(osc => {
          osc.stop();
        });
        audioContextRef.current.close();
        audioContextRef.current = null;
        oscillatorsRef.current = [];
      }
      setIsPlaying(false);
    }
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        oscillatorsRef.current.forEach(osc => {
          try { osc.stop(); } catch (e) { /* ignore */ }
        });
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="relative min-h-[100dvh] bg-[#0A0506] overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Cosmic gradient background */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: `
            radial-gradient(ellipse at 50% 30%, rgba(224, 124, 36, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 20% 80%, rgba(74, 14, 14, 0.3) 0%, transparent 40%),
            radial-gradient(ellipse at 80% 70%, rgba(201, 162, 39, 0.1) 0%, transparent 40%)
          `
        }}
      />

      {/* Floating sacred particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 rounded-full bg-[#C9A227] opacity-40"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animation: `float ${8 + particle.delay}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* Header text */}
      <div
        className="relative z-10 text-center mb-8 md:mb-16"
        style={{ animation: 'fadeIn 1.5s ease-out' }}
      >
        <h1
          className="font-display text-[#C9A227] text-lg md:text-2xl tracking-[0.3em] uppercase mb-2"
          style={{ textShadow: '0 0 30px rgba(201, 162, 39, 0.5)' }}
        >
          Gayatri Mantra
        </h1>
        <p className="font-body text-[#E07C24]/50 text-xs md:text-sm tracking-widest">
          Touch the Sacred Circle
        </p>
      </div>

      {/* Sacred Circle - Main Interactive Element */}
      <div className="relative z-10 flex items-center justify-center">
        {/* Outer glow rings */}
        <div
          className={`absolute w-64 h-64 md:w-80 md:h-80 rounded-full transition-all duration-1000 ${
            isPlaying ? 'scale-150 opacity-20' : 'scale-100 opacity-0'
          }`}
          style={{
            background: 'radial-gradient(circle, rgba(224, 124, 36, 0.3) 0%, transparent 70%)',
          }}
        />

        {/* Rotating sacred geometry ring */}
        <div
          className={`absolute w-56 h-56 md:w-72 md:h-72 rounded-full border border-[#C9A227]/20 ${
            isPlaying ? 'animate-spin-slow' : ''
          }`}
          style={{
            borderStyle: 'dashed',
            animation: isPlaying ? 'spin 30s linear infinite' : 'none',
          }}
        />

        {/* Second rotating ring - opposite direction */}
        <div
          className={`absolute w-48 h-48 md:w-64 md:h-64 rounded-full border border-[#E07C24]/15 ${
            isPlaying ? 'animate-spin-slow-reverse' : ''
          }`}
          style={{
            borderStyle: 'dotted',
            animation: isPlaying ? 'spin 20s linear infinite reverse' : 'none',
          }}
        />

        {/* Main interactive circle */}
        <button
          onClick={toggleMantra}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`
            relative w-40 h-40 md:w-52 md:h-52 rounded-full
            transition-all duration-500 ease-out
            focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:ring-offset-4 focus:ring-offset-[#0A0506]
            ${isHovered && !isPlaying ? 'scale-105' : ''}
            ${isPlaying ? 'scale-110' : ''}
          `}
          style={{
            background: isPlaying
              ? 'radial-gradient(circle at 30% 30%, #E07C24 0%, #4A0E0E 60%, #0A0506 100%)'
              : 'radial-gradient(circle at 30% 30%, #4A0E0E 0%, #1A0808 60%, #0A0506 100%)',
            boxShadow: isPlaying
              ? '0 0 60px rgba(224, 124, 36, 0.6), 0 0 120px rgba(201, 162, 39, 0.3), inset 0 0 60px rgba(224, 124, 36, 0.3)'
              : '0 0 30px rgba(74, 14, 14, 0.5), inset 0 0 30px rgba(74, 14, 14, 0.3)',
            animation: isPlaying ? 'pulse 3s ease-in-out infinite' : 'none',
          }}
          aria-label={isPlaying ? 'Stop Gayatri Mantra' : 'Play Gayatri Mantra'}
        >
          {/* OM Symbol */}
          <span
            className={`
              absolute inset-0 flex items-center justify-center
              font-display text-5xl md:text-7xl
              transition-all duration-700
              ${isPlaying ? 'text-[#FFF8E7] scale-110' : 'text-[#C9A227]/70'}
            `}
            style={{
              textShadow: isPlaying
                ? '0 0 40px rgba(255, 248, 231, 0.8), 0 0 80px rgba(224, 124, 36, 0.6)'
                : '0 0 20px rgba(201, 162, 39, 0.3)',
            }}
          >
            ॐ
          </span>

          {/* Inner decorative ring */}
          <div
            className={`
              absolute inset-4 md:inset-6 rounded-full border
              transition-all duration-500
              ${isPlaying ? 'border-[#FFF8E7]/40' : 'border-[#C9A227]/20'}
            `}
          />
        </button>
      </div>

      {/* Mantra text display */}
      <div
        className={`
          relative z-10 mt-8 md:mt-16 max-w-xs md:max-w-xl px-4
          transition-all duration-1000
          ${isPlaying ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-2'}
        `}
      >
        <p
          className="font-body text-center text-base md:text-xl leading-relaxed"
          style={{
            color: isPlaying ? '#FFF8E7' : '#C9A227',
            textShadow: isPlaying ? '0 0 30px rgba(255, 248, 231, 0.5)' : 'none',
            transition: 'all 1s ease-out',
          }}
        >
          {GAYATRI_MANTRA}
        </p>

        {/* Status indicator */}
        <div className="flex items-center justify-center gap-2 mt-4 md:mt-6">
          <div
            className={`
              w-2 h-2 rounded-full transition-all duration-500
              ${isPlaying ? 'bg-[#E07C24] animate-pulse' : 'bg-[#4A0E0E]'}
            `}
          />
          <span className="font-body text-[#C9A227]/60 text-xs tracking-widest uppercase">
            {isPlaying ? 'Chanting...' : 'Tap to Begin'}
          </span>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 md:bottom-6 left-0 right-0 text-center">
        <p className="font-body text-[10px] md:text-xs text-[#C9A227]/30 tracking-wider">
          Requested by @Nishant293 · Built by @clonkbot
        </p>
      </footer>

      {/* Inline styles for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
          50% { transform: translateY(-10px) translateX(-5px); opacity: 0.3; }
          75% { transform: translateY(-30px) translateX(5px); opacity: 0.5; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1.1); }
          50% { transform: scale(1.15); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;
