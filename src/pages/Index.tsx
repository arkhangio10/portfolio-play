import EventHorizonGame from '@/components/game/EventHorizonGame';
import { Github, Linkedin, Mail, Code2, Atom, Gamepad2, Brain, Cloud, Eye, Briefcase, GraduationCap, Award } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-[hsl(160,30%,3%)] text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[hsl(160,30%,3%,0.85)] border-b border-[hsl(120,100%,12%)] px-6 py-4 flex items-center justify-between font-mono">
        <span className="text-[hsl(140,100%,50%)] font-bold tracking-widest text-lg">
          {'<'}ABEL{' />'}
        </span>
        <div className="flex gap-6 text-xs text-[hsl(120,40%,50%)] tracking-wider">
          <a href="#hero" className="hover:text-[hsl(140,100%,50%)] transition-colors">HOME</a>
          <a href="#experience" className="hover:text-[hsl(140,100%,50%)] transition-colors">EXPERIENCE</a>
          <a href="#skills" className="hover:text-[hsl(140,100%,50%)] transition-colors">SKILLS</a>
          <a href="#game" className="hover:text-[hsl(140,100%,50%)] transition-colors">GAME</a>
          <a href="#contact" className="hover:text-[hsl(140,100%,50%)] transition-colors">CONTACT</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <p className="text-xs font-mono text-[hsl(280,80%,60%)] tracking-[0.4em] mb-4 uppercase">
          Prompt Engineer · Cloud Engineer · Industrial Engineer
        </p>
        <h1 className="text-5xl md:text-7xl font-mono font-bold text-[hsl(140,100%,50%)] tracking-widest mb-4">
          ABEL MANCILLA
        </h1>
        <h2 className="text-xl md:text-2xl font-mono text-[hsl(120,40%,50%)] mb-6">
          AI & Cloud Solutions · Computer Vision · Quantum Tech
        </h2>
        <p className="max-w-2xl text-sm font-mono text-[hsl(120,20%,40%)] leading-relaxed mb-8">
          Industrial engineer with experience in AI, cloud infrastructure, and prompt engineering.
          Passionate about quantum computing, game development, and building intelligent systems
          that bridge the physical and digital worlds.
        </p>
        <div className="flex gap-4">
          <a
            href="#game"
            className="px-6 py-3 border-2 border-[hsl(140,100%,40%)] text-[hsl(140,100%,50%)] font-mono text-sm tracking-wider hover:bg-[hsl(140,100%,50%,0.1)] transition-colors"
          >
            ▶ PLAY MY GAME
          </a>
          <a
            href="#contact"
            className="px-6 py-3 border-2 border-[hsl(280,80%,50%)] text-[hsl(280,80%,60%)] font-mono text-sm tracking-wider hover:bg-[hsl(280,80%,50%,0.1)] transition-colors"
          >
            CONTACT ME
          </a>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-16 px-6 border-t border-[hsl(120,100%,10%)]">
        <div className="max-w-3xl mx-auto font-mono">
          <p className="text-xs text-[hsl(280,80%,60%)] tracking-[0.3em] mb-2 text-center">CAREER</p>
          <h2 className="text-2xl text-[hsl(140,100%,50%)] mb-10 tracking-widest text-center flex items-center justify-center gap-3">
            <Briefcase size={22} /> WORK EXPERIENCE
          </h2>

          <div className="space-y-6">
            {[
              {
                role: 'Prompt Engineer',
                company: 'Delfosti',
                period: 'Nov 2024 – Present',
                tasks: [
                  'Designed and optimized AI prompts for production-grade applications',
                  'Fine-tuned LLMs and integrated AI pipelines into client workflows',
                  'Collaborated with cross-functional teams to deploy AI solutions',
                ],
              },
              {
                role: 'Cloud Engineer',
                company: 'Grupo Hergon',
                period: 'Apr 2024 – Oct 2024',
                tasks: [
                  'Managed AWS and Azure cloud infrastructure for enterprise clients',
                  'Implemented CI/CD pipelines and infrastructure-as-code with Terraform',
                  'Monitored and optimized cloud costs and performance',
                ],
              },
              {
                role: 'Process Optimization Engineer',
                company: 'AGP Group',
                period: 'Jan 2023 – Mar 2024',
                tasks: [
                  'Led automation initiatives using computer vision and AI',
                  'Optimized manufacturing processes with data-driven approaches',
                  'Developed internal tools using Python and React',
                ],
              },
            ].map((job, i) => (
              <div
                key={i}
                className="border border-[hsl(120,100%,12%)] p-6 rounded hover:border-[hsl(140,100%,30%)] transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                  <div>
                    <p className="text-[hsl(140,100%,50%)] text-base font-bold">{job.role}</p>
                    <p className="text-[hsl(280,80%,60%)] text-sm">{job.company}</p>
                  </div>
                  <p className="text-[hsl(120,20%,40%)] text-xs mt-1 md:mt-0">{job.period}</p>
                </div>
                <ul className="space-y-1">
                  {job.tasks.map((t, j) => (
                    <li key={j} className="text-[hsl(120,20%,40%)] text-xs flex gap-2">
                      <span className="text-[hsl(140,100%,40%)]">▸</span> {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Education & Certifications */}
      <section className="py-16 px-6 border-t border-[hsl(120,100%,10%)]">
        <div className="max-w-3xl mx-auto font-mono">
          <p className="text-xs text-[hsl(280,80%,60%)] tracking-[0.3em] mb-2 text-center">LEARNING</p>
          <h2 className="text-2xl text-[hsl(140,100%,50%)] mb-10 tracking-widest text-center flex items-center justify-center gap-3">
            <GraduationCap size={22} /> EDUCATION & CERTS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Industrial Engineering', place: 'UPC — Universidad Peruana de Ciencias Aplicadas', year: '2018 – 2023' },
              { title: 'Mechatronics Technician', place: 'SENATI', year: '2015 – 2018' },
            ].map((edu, i) => (
              <div key={i} className="border border-[hsl(120,100%,12%)] p-5 rounded hover:border-[hsl(140,100%,30%)] transition-colors">
                <GraduationCap size={16} className="text-[hsl(280,80%,60%)] mb-2" />
                <p className="text-[hsl(140,100%,50%)] text-sm font-bold">{edu.title}</p>
                <p className="text-[hsl(120,20%,40%)] text-xs mt-1">{edu.place}</p>
                <p className="text-[hsl(120,20%,30%)] text-xs mt-1">{edu.year}</p>
              </div>
            ))}
            {[
              { title: 'IBM AI Developer Professional Certificate', org: 'IBM via Coursera' },
              { title: 'UI/UX Design Specialization', org: 'CalArts via Coursera' },
            ].map((cert, i) => (
              <div key={i} className="border border-[hsl(120,100%,12%)] p-5 rounded hover:border-[hsl(280,80%,40%)] transition-colors">
                <Award size={16} className="text-[hsl(280,80%,60%)] mb-2" />
                <p className="text-[hsl(140,100%,50%)] text-sm font-bold">{cert.title}</p>
                <p className="text-[hsl(120,20%,40%)] text-xs mt-1">{cert.org}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-16 px-6 border-t border-[hsl(120,100%,10%)]">
        <div className="max-w-3xl mx-auto font-mono">
          <p className="text-xs text-[hsl(280,80%,60%)] tracking-[0.3em] mb-2 text-center">EXPERTISE</p>
          <h2 className="text-2xl text-[hsl(140,100%,50%)] mb-10 tracking-widest text-center">
            TECHNICAL SKILLS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: <Brain size={20} />, title: 'AI & Prompt Engineering', desc: 'LLM fine-tuning, RAG pipelines, GPT, Claude, Gemini, LangChain' },
              { icon: <Cloud size={20} />, title: 'Cloud & DevOps', desc: 'AWS, Azure, Terraform, Docker, CI/CD, Kubernetes' },
              { icon: <Code2 size={20} />, title: 'Full Stack Development', desc: 'React, TypeScript, Python, Node.js, FastAPI, PostgreSQL' },
              { icon: <Eye size={20} />, title: 'Computer Vision', desc: 'OpenCV, YOLO, image segmentation, object detection' },
              { icon: <Atom size={20} />, title: 'Quantum Computing', desc: 'Qiskit, quantum algorithms, quantum simulations' },
              { icon: <Gamepad2 size={20} />, title: 'Game Development', desc: 'Canvas API, WebGL, Pygame, physics engines' },
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

      {/* Contact */}
      <section id="contact" className="py-16 px-6 border-t border-[hsl(120,100%,10%)]">
        <div className="max-w-xl mx-auto text-center font-mono">
          <p className="text-xs text-[hsl(280,80%,60%)] tracking-[0.3em] mb-2">GET IN TOUCH</p>
          <h2 className="text-2xl text-[hsl(140,100%,50%)] mb-6 tracking-widest">CONTACT</h2>
          <p className="text-sm text-[hsl(120,30%,50%)] mb-4">
            Interested in AI, cloud engineering, quantum computing, or collaboration? Let's connect.
          </p>
          <p className="text-xs text-[hsl(120,20%,40%)] mb-8">
            Lima, Peru · abel.mancilla@email.com · +51 XXX XXX XXX
          </p>
          <div className="flex justify-center gap-8">
            <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="text-[hsl(120,40%,50%)] hover:text-[hsl(140,100%,50%)] transition-colors">
              <Github size={24} />
            </a>
            <a href="https://linkedin.com/in/" target="_blank" rel="noopener noreferrer" className="text-[hsl(120,40%,50%)] hover:text-[hsl(140,100%,50%)] transition-colors">
              <Linkedin size={24} />
            </a>
            <a href="mailto:abel.mancilla@email.com" className="text-[hsl(120,40%,50%)] hover:text-[hsl(140,100%,50%)] transition-colors">
              <Mail size={24} />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(120,100%,10%)] px-6 py-6 text-center font-mono text-xs text-[hsl(120,20%,25%)]">
        © 2026 ABEL MANCILLA — BUILT WITH QUANTUM PRECISION
      </footer>
    </div>
  );
};

export default Index;
