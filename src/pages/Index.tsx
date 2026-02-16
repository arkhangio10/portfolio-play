import EventHorizonGame from '@/components/game/EventHorizonGame';

const Index = () => {
  return (
    <div className="min-h-screen bg-[hsl(160,30%,3%)] text-foreground">
      {/* Nav */}
      <nav className="border-b border-[hsl(120,100%,15%)] px-6 py-4 flex items-center justify-between font-mono">
        <span className="text-[hsl(140,100%,50%)] font-bold tracking-widest text-lg">
          EVENT HORIZON
        </span>
        <div className="flex gap-6 text-xs text-[hsl(120,40%,50%)] tracking-wider">
          <a href="#game" className="hover:text-[hsl(140,100%,50%)] transition-colors">GAME</a>
          <a href="#about" className="hover:text-[hsl(140,100%,50%)] transition-colors">ABOUT</a>
        </div>
      </nav>

      {/* Hero / Game Section */}
      <section id="game" className="flex flex-col items-center justify-center py-12 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-mono font-bold text-[hsl(140,100%,50%)] tracking-widest mb-2">
            EVENT HORIZON
          </h1>
          <p className="text-sm font-mono text-[hsl(280,80%,60%)] tracking-[0.3em]">
            THE DECOHERENCE
          </p>
          <p className="mt-3 text-xs font-mono text-[hsl(120,20%,40%)]">
            A 64-bit retro quantum physics space shooter
          </p>
        </div>

        <EventHorizonGame />
      </section>

      {/* About Section */}
      <section id="about" className="max-w-2xl mx-auto px-6 py-16 font-mono">
        <h2 className="text-xl text-[hsl(140,100%,50%)] mb-6 tracking-widest">// ABOUT</h2>
        <p className="text-sm text-[hsl(120,30%,50%)] leading-relaxed mb-4">
          Event Horizon: The Decoherence is a fast-paced space shooter that teaches quantum physics through gameplay.
          Each of the 6 levels introduces a real quantum mechanic — from measurement collapse to Heisenberg's uncertainty principle.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
          {[
            { lvl: 1, name: 'Measurement', desc: 'Scan to reveal' },
            { lvl: 2, name: 'Entanglement', desc: 'Linked enemies' },
            { lvl: 3, name: 'Tunneling', desc: 'Phase through' },
            { lvl: 4, name: 'Interference', desc: 'Safe zones' },
            { lvl: 5, name: 'Superposition', desc: '4 positions' },
            { lvl: 6, name: 'Uncertainty', desc: 'Speed vs clarity' },
          ].map(l => (
            <div key={l.lvl} className="border border-[hsl(120,100%,15%)] p-3 rounded">
              <span className="text-[hsl(280,80%,60%)] text-xs">LVL {l.lvl}</span>
              <p className="text-[hsl(140,100%,50%)] text-sm mt-1">{l.name}</p>
              <p className="text-[hsl(120,20%,40%)] text-xs mt-1">{l.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(120,100%,15%)] px-6 py-6 text-center font-mono text-xs text-[hsl(120,20%,30%)]">
        EVENT HORIZON: THE DECOHERENCE — QUANTUM PHYSICS SPACE SHOOTER
      </footer>
    </div>
  );
};

export default Index;
