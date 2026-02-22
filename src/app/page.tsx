import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { PM_TYPES } from '@/constants/types';

export const revalidate = 0; // Disable caching to always show the latest count

export default async function Home() {
  // Fetch session count from Supabase
  const { count, error } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error("Error fetching session count:", error);
  }

  const sessionCount = count || 0;

  return (
    <div className="flex min-h-screen flex-col font-sans bg-earth-cream selection:bg-earth-terracotta selection:text-white">

      {/* --- SECTION 1: NAVIGATION BAR --- */}
      <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-earth-border shadow-sm transition-all duration-300">
        <div className="max-w-[1100px] mx-auto px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-serif text-earth-dark font-bold tracking-tight">
              Orlog
            </Link>
            {/* Runes-inspired decorative mark */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-earth-terracotta">
              <path d="M12 4L12 20M12 4L18 10M12 12L18 18M12 20L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <Link
            href="/test"
            className="inline-flex h-10 sm:h-11 items-center justify-center rounded-full bg-earth-terracotta px-6 font-medium text-white transition-all hover:bg-[#A34B2E] focus:outline-none focus:ring-2 focus:ring-earth-terracotta focus:ring-offset-2 text-sm sm:text-base font-sans"
          >
            Take the Test <span className="ml-1.5 transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col w-full">

        {/* --- SECTION 2: HERO --- */}
        <section className="relative w-full overflow-hidden min-h-[80vh] flex items-center pt-8 pb-16 sm:py-24">
          {/* Subtle radial gradients */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-earth-terracotta/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 z-0"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-earth-sage/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 z-0"></div>

          <div className="max-w-[1100px] mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 relative z-10">
            {/* Left Column */}
            <div className="flex flex-col justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
              <span className="text-xs sm:text-sm font-bold tracking-[0.2em] text-earth-terracotta uppercase mb-6 block">
                PM Personality Test
              </span>
              <h1 className="text-[44px] sm:text-[56px] lg:text-[64px] font-serif font-bold text-earth-dark leading-[1.05] tracking-tight mb-6">
                Discover the PM<br />
                you <span className="italic text-earth-terracotta pr-2">truly</span> are.
              </h1>
              <p className="text-lg sm:text-xl text-earth-muted leading-relaxed max-w-[440px] mb-10">
                Orlog reveals your product management personality through 30 real-world scenarios. Know your type. Understand your strengths. Find your path.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link
                  href="/test"
                  className="group inline-flex h-14 w-full sm:w-auto min-w-[200px] items-center justify-center rounded-full bg-earth-terracotta px-8 font-medium text-white transition-all hover:bg-[#A34B2E] shadow-sm text-base"
                >
                  Take the Test <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
                <a
                  href="#types"
                  className="group inline-flex h-14 w-full sm:w-auto min-w-[200px] items-center justify-center rounded-full border-2 border-earth-terracotta bg-transparent px-8 font-medium text-earth-terracotta transition-all hover:bg-earth-terracotta/5 text-base"
                >
                  See the 6 Types <span className="ml-2 transition-transform duration-300 group-hover:translate-y-1">↓</span>
                </a>
              </div>

              <p className="text-sm font-medium text-earth-muted flex items-center gap-2">
                <span className="text-base">🧭</span> {sessionCount.toLocaleString()} PMs have discovered their nature.
              </p>
            </div>

            {/* Right Column (Decorative Card) */}
            <div className="flex items-center justify-center lg:justify-end animate-in fade-in duration-1000 delay-300 fill-mode-both relative">
              <div className="w-full max-w-[400px] bg-earth-card p-8 sm:p-10 rounded-3xl border border-earth-border shadow-xl transform rotate-3 hover:rotate-2 transition-transform duration-500 floating-card border-l-4 border-l-earth-terracotta relative overflow-hidden group">
                {/* Subtle sheen reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out z-20 pointer-events-none"></div>

                <p className="text-xs font-bold tracking-widest text-earth-muted uppercase mb-4">Pranay, you are…</p>
                <h3 className="text-[40px] font-serif font-bold text-earth-terracotta leading-none mb-1 relative z-10">{PM_TYPES.seer.name}</h3>
                <p className="text-earth-terracotta/80 font-serif italic mb-2 relative z-10 text-lg">{PM_TYPES.seer.subtitle}</p>
                <p className="text-earth-dark/70 font-serif italic mb-6">with traits of {PM_TYPES.forge.name}</p>

                <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-earth-sage text-white font-semibold text-xs tracking-wider shadow-sm mb-8 z-10 relative">
                  The Architect
                </div>

                {/* Fake Radar Chart graphic */}
                <div className="w-full flex justify-center mt-2 relative z-10">
                  <svg width="220" height="220" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Outline webs */}
                    <polygon points="100,20 170,60 170,140 100,180 30,140 30,60" stroke="#E8E4DC" strokeWidth="1" fill="none" />
                    <polygon points="100,45 145,70 145,130 100,155 55,130 55,70" stroke="#E8E4DC" strokeWidth="1" fill="none" />
                    <polygon points="100,70 125,85 125,115 100,130 75,115 75,85" stroke="#E8E4DC" strokeWidth="1" fill="none" />
                    {/* Center crosshairs */}
                    <line x1="100" y1="20" x2="100" y2="180" stroke="#E8E4DC" strokeWidth="1" />
                    <line x1="30" y1="60" x2="170" y2="140" stroke="#E8E4DC" strokeWidth="1" />
                    <line x1="170" y1="60" x2="30" y2="140" stroke="#E8E4DC" strokeWidth="1" />

                    {/* Filled data polygon */}
                    <polygon points="100,30 160,80 140,150 100,120 40,140 60,60" fill="#C45C3A" fillOpacity="0.3" stroke="#C45C3A" strokeWidth="2" strokeLinejoin="round" />

                    {/* Dots */}
                    <circle cx="100" cy="30" r="4" fill="#4A7C6F" />
                    <circle cx="160" cy="80" r="4" fill="#4A7C6F" />
                    <circle cx="140" cy="150" r="4" fill="#4A7C6F" />
                    <circle cx="100" cy="120" r="4" fill="#4A7C6F" />
                    <circle cx="40" cy="140" r="4" fill="#4A7C6F" />
                    <circle cx="60" cy="60" r="4" fill="#4A7C6F" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 3: HOW IT WORKS --- */}
        <section className="py-24 sm:py-32 bg-earth-cream w-full">
          <ScrollReveal className="max-w-[1100px] mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-[40px] font-serif font-bold text-earth-dark mb-4">How Orlog Works</h2>
              <p className="text-lg text-earth-muted">Three steps to knowing your PM nature.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                { step: "01", icon: "📋", title: "Answer 30 Scenarios", desc: "Real workplace situations. No right answers — just your instincts. Takes 10–15 minutes." },
                { step: "02", icon: "🔮", title: "Get Your PM Type", desc: "Orlog maps your answers to one of 6 PM personalities and reveals your unique hybrid type." },
                { step: "03", icon: "🧭", title: "Understand Yourself", desc: "See your PM signature chart, your strengths, your blind spots, and famous PMs who think like you." }
              ].map((item, i) => (
                <div key={i} className="bg-earth-card p-8 rounded-2xl border border-earth-border shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                  <span className="text-xl font-serif font-bold text-earth-terracotta mb-6 block">{item.step}</span>
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-earth-dark mb-3">{item.title}</h3>
                  <p className="text-earth-muted leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* --- SECTION 4: THE 6 PM TYPES --- */}
        <section id="types" className="py-24 sm:py-32 bg-[#FDF5F2] w-full border-y border-earth-border/50">
          <ScrollReveal className="max-w-[1100px] mx-auto px-6">
            <div className="text-center mb-16 sm:mb-20">
              <h2 className="text-4xl sm:text-[44px] font-serif font-bold text-earth-dark mb-6">Which PM are you?</h2>
              <p className="text-lg text-earth-dark/70 max-w-2xl mx-auto leading-relaxed">
                Orlog identifies 6 core PM personalities. Most people are a blend of two.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.values(PM_TYPES).map((type, i) => (
                <div key={i} className="bg-earth-card p-8 rounded-2xl border border-earth-border shadow-sm hover:scale-[1.02] hover:shadow-lg transition-transform duration-300 border-l-4 flex flex-col" style={{ borderLeftColor: type.color }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-serif font-bold text-xl mb-6 text-white" style={{ backgroundColor: type.color }}>
                    {type.name.replace("The ", "").charAt(0)}
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-earth-dark mb-0">{type.name}</h3>
                  <p className="text-earth-muted font-serif italic text-sm mb-4">{type.subtitle}</p>
                  <p className="text-earth-muted text-sm mb-8 flex-grow">{type.tagline}</p>

                  <div className="flex flex-wrap gap-2 mt-auto">
                    {type.strengths.slice(0, 3).map((tag, j) => (
                      <span key={j} className="inline-flex px-3 py-1 bg-earth-cream text-earth-dark text-[11px] font-bold uppercase tracking-wider rounded-md border border-earth-border">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-16 sm:mt-20">
              <Link
                href="/test"
                className="group inline-flex h-14 items-center justify-center rounded-full bg-earth-terracotta px-10 font-medium text-white transition-all hover:bg-[#A34B2E] shadow-sm text-base"
              >
                Find Out Which One You Are <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </ScrollReveal>
        </section>

        {/* --- SECTION 5: HYBRID TYPES TEASER --- */}
        <section className="py-20 sm:py-24 bg-[#2A2420] w-full selection:bg-earth-gold selection:text-[#2A2420]">
          <ScrollReveal className="max-w-[900px] mx-auto px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-earth-gold mb-6">
              30 scenarios. 6 types. 15 possible combinations.
            </h2>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-12">
              Your result isn't just a single type — it's a unique blend. Orlog identifies your hybrid personality from 15 possible combinations.
            </p>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-16">
              {["The Architect", "The Oracle", "The Titan", "The Crusader", "The Strategist"].map((hybrid, i) => (
                <div key={i} className="px-5 py-2.5 rounded-full border border-earth-gold/40 text-earth-gold font-medium text-sm sm:text-base whitespace-nowrap bg-white/5 backdrop-blur-sm">
                  {hybrid}
                </div>
              ))}
            </div>

            <p className="text-sm text-white/60 mb-8 uppercase tracking-widest font-bold">
              Which hybrid are you? Take the test to find out.
            </p>
            <Link
              href="/test"
              className="group inline-flex h-14 items-center justify-center rounded-full border-2 border-white bg-transparent px-10 font-medium text-white transition-all hover:bg-white hover:text-[#2A2420] text-sm sm:text-base"
            >
              Discover My Type <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </ScrollReveal>
        </section>

        {/* --- SECTION 6: SOCIAL PROOF --- */}
        <section className="py-24 sm:py-32 bg-earth-cream w-full">
          <ScrollReveal className="max-w-[1100px] mx-auto px-6 text-center">
            <h2 className="text-3xl sm:text-[40px] font-serif font-bold text-earth-dark mb-16">Built for real PMs</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-8 mb-20 max-w-[900px] mx-auto">
              {[
                { title: "30 Real Scenarios", desc: "Not abstract questions. Real PM situations you've actually faced." },
                { title: "Science-backed Framework", desc: "Built on PM archetypes, psychology dimensions, and product management research." },
                { title: "Free. Always.", desc: "No login required. Get your full result instantly." }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-earth-terracotta text-xl mb-4">✦</span>
                  <h4 className="text-xl font-bold text-earth-dark mb-3">{item.title}</h4>
                  <p className="text-earth-muted leading-relaxed max-w-[260px]">{item.desc}</p>
                </div>
              ))}
            </div>

            <p className="text-sm font-bold text-earth-muted tracking-wide uppercase">
              Join <span className="text-earth-terracotta">{sessionCount.toLocaleString()}</span> PMs who already know their nature.
            </p>
          </ScrollReveal>
        </section>

        {/* --- SECTION 7: FINAL CTA BANNER --- */}
        <section className="py-24 sm:py-32 bg-earth-terracotta w-full text-center selection:bg-white selection:text-earth-terracotta">
          <ScrollReveal className="max-w-[800px] mx-auto px-6">
            <h2 className="text-4xl sm:text-[56px] font-serif font-bold text-white mb-6 leading-tight">
              Ready to know your PM nature?
            </h2>
            <p className="text-lg sm:text-xl text-white/80 mb-12">
              Takes 10–15 minutes. Free. No login required.
            </p>
            <Link
              href="/test"
              className="group inline-flex h-14 sm:h-16 items-center justify-center rounded-full bg-white px-10 font-bold text-earth-terracotta transition-all hover:bg-earth-cream hover:scale-105 shadow-xl text-base sm:text-lg"
            >
              Take the Orlog Test <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </ScrollReveal>
        </section>
      </main>

      {/* --- SECTION 8: FOOTER --- */}
      <footer className="w-full bg-earth-cream border-t border-earth-border py-8 mt-auto">
        <div className="max-w-[1100px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <span className="text-xl font-serif text-earth-dark font-bold tracking-tight">Orlog</span>
            <span className="hidden sm:inline text-earth-border">|</span>
            <span className="text-sm text-earth-muted font-medium">Know your PM nature.</span>
          </div>
          <div className="text-sm text-earth-muted/60 font-medium">
            © {new Date().getFullYear()} Orlog
          </div>
        </div>
      </footer>
    </div>
  );
}
