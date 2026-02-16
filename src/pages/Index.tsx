import EventHorizonGame from '@/components/game/EventHorizonGame';
import { Github, Linkedin, Mail, Code2, Atom, Gamepad2 } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-[hsl(160,30%,3%)] text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[hsl(160,30%,3%,0.85)] border-b border-[hsl(120,100%,12%)] px-6 py-4 flex items-center justify-between font-mono">
        <span className="text-[hsl(140,100%,50%)] font-bold tracking-widest text-lg">
          {'<'}PORTFOLIO{' />'}
        </span>
        <div className="flex gap-6 text-xs text-[hsl(120,40%,50%)] tracking-wider">
          <a href="#hero" className="hover:text-[hsl(140,100%,50%)] transition-colors">HOME</a>
          <a href="#game" className="hover:text-[hsl(140,100%,50%)] transition-colors">GAME</a>
          <a href="#skills" className="hover:text-[hsl(140,100%,50%)] transition-colors">SKILLS</a>
          <a href="#contact" className="hover:text-[hsl(140,100%,50%)] transition-colors">CONTACT</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <p className="text-xs font-mono text-[hsl(280,80%,60%)] tracking-[0.4em] mb-4 uppercase">
          Welcome to my universe
        </p>
        <h1 className="text-5xl md:text-7xl font-mono font-bold text-[hsl(140,100%,50%)] tracking-widest mb-4">
          DEVELOPER
        </h1>
        <h2 className="text-xl md:text-2xl font-mono text-[hsl(120,40%,50%)] mb-6">
          Game Dev · Quantum Enthusiast · Full Stack
        </h2>
        <p className="max-w-lg text-sm font-mono text-[hsl(120,20%,40%)] leading-relaxed mb-8">
          I build interactive experiences at the intersection of physics and code.
          Scroll down to play my latest project — a quantum physics space shooter.
        </p>
        <a
          href="#game"
          className="px-6 py-3 border-2 border-[hsl(140,100%,40%)] text-[hsl(140,100%,50%)] font-mono text-sm tracking-wider hover:bg-[hsl(140,100%,50%,0.1)] transition-colors"
        >
          ▶ PLAY THE GAME
        </a>
      </section>

      {/* Game Section */}
      <section id="game" className="py-16 px-4 border-t border-[hsl(120,100%,10%)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-mono text-[hsl(280,80%,60%)] tracking-[0.3em] mb-2">
              FEATURED PROJECT
            </p>
            <h2 className="text-3xl md:text-4xl font-mono font-bold text-[hsl(140,100%,50%)] tracking-widest mb-2">
              EVENT HORIZON
            </h2>
            <p className="text-sm font-mono text-[hsl(280,80%,60%)] tracking-[0.3em]">
              THE DECOHERENCE
            </p>
            <p className="mt-3 text-xs font-mono text-[hsl(120,20%,40%)]">
              A 64-bit retro quantum physics space shooter — 6 levels, each teaching a real quantum principle
            </p>
          </div>
          <div className="flex justify-center">
            <EventHorizonGame />
          </div>
        </div>
      </section>

      {/* Skills / Level Mechanics Section */}
      <section id="skills" className="py-16 px-6 border-t border-[hsl(120,100%,10%)]">
        <div className="max-w-3xl mx-auto font-mono">
          <p className="text-xs text-[hsl(280,80%,60%)] tracking-[0.3em] mb-2 text-center">EXPERTISE</p>
          <h2 className="text-2xl text-[hsl(140,100%,50%)] mb-10 tracking-widest text-center">
            SKILLS & QUANTUM MECHANICS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: <Code2 size={20} />, title: 'Full Stack Dev', desc: 'React, TypeScript, Python, Node.js' },
              { icon: <Gamepad2 size={20} />, title: 'Game Development', desc: 'Canvas, WebGL, Pygame, Physics engines' },
              { icon: <Atom size={20} />, title: 'Quantum Computing', desc: 'Qiskit, Quantum algorithms, Simulations' },
            ].map((s, i) => (
              <div key={i} className="border border-[hsl(120,100%,12%)] p-5 rounded hover:border-[hsl(140,100%,30%)] transition-colors group">
                <div className="text-[hsl(280,80%,60%)] mb-3 group-hover:text-[hsl(140,100%,50%)] transition-colors">{s.icon}</div>
                <p className="text-[hsl(140,100%,50%)] text-sm mb-2">{s.title}</p>
                <p className="text-[hsl(120,20%,40%)] text-xs">{s.desc}</p>
              </div>
            ))}
          </div>

          <h3 className="text-lg text-[hsl(140,100%,50%)] mt-14 mb-6 tracking-widest text-center">
            GAME LEVELS — QUANTUM PRINCIPLES
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { lvl: 1, name: 'Measurement', desc: 'Scan to reveal hidden enemies' },
              { lvl: 2, name: 'Entanglement', desc: 'Linked enemies share damage' },
              { lvl: 3, name: 'Tunneling', desc: 'Boss phases through bullets' },
              { lvl: 4, name: 'Interference', desc: 'Find safe zones in wave patterns' },
              { lvl: 5, name: 'Superposition', desc: 'Boss exists in 4 places at once' },
              { lvl: 6, name: 'Uncertainty', desc: 'Speed blurs the target' },
            ].map(l => (
              <div key={l.lvl} className="border border-[hsl(120,100%,12%)] p-4 rounded hover:border-[hsl(280,80%,40%)] transition-colors">
                <span className="text-[hsl(280,80%,60%)] text-xs font-bold">LVL {l.lvl}</span>
                <p className="text-[hsl(140,100%,50%)] text-sm mt-1">{l.name}</p>
                <p className="text-[hsl(120,20%,40%)] text-xs mt-1">{l.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 px-6 border-t border-[hsl(120,100%,10%)]">
        <div className="max-w-xl mx-auto text-center font-mono">
          <p className="text-xs text-[hsl(280,80%,60%)] tracking-[0.3em] mb-2">GET IN TOUCH</p>
          <h2 className="text-2xl text-[hsl(140,100%,50%)] mb-6 tracking-widest">CONTACT</h2>
          <p className="text-sm text-[hsl(120,30%,50%)] mb-8">
            Interested in quantum computing, game dev, or collaboration? Let's connect.
          </p>
          <div className="flex justify-center gap-8">
            <a href="#" className="text-[hsl(120,40%,50%)] hover:text-[hsl(140,100%,50%)] transition-colors">
              <Github size={24} />
            </a>
            <a href="#" className="text-[hsl(120,40%,50%)] hover:text-[hsl(140,100%,50%)] transition-colors">
              <Linkedin size={24} />
            </a>
            <a href="#" className="text-[hsl(120,40%,50%)] hover:text-[hsl(140,100%,50%)] transition-colors">
              <Mail size={24} />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(120,100%,10%)] px-6 py-6 text-center font-mono text-xs text-[hsl(120,20%,25%)]">
        © 2026 — BUILT WITH QUANTUM PRECISION
      </footer>
    </div>
  );
};

export default Index;
