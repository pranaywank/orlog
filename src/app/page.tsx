import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, getCountFromServer } from "firebase/firestore";
import { PM_TYPES } from "@/constants/types";

// Import Aceternity & Motion Components
import { BackgroundLines } from "@/components/ui/background-lines";
import { LampEffect } from "@/components/ui/lamp";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { Highlight } from "@/components/ui/hero-highlight";
import { Meteors } from "@/components/ui/meteors";
import * as motion from "motion/react-client";

export const revalidate = 0; // Disable caching to always show the latest count

export default async function Home() {
  // Fetch session count from Firestore
  let sessionCount = 0;
  try {
    const snapshot = await getCountFromServer(collection(db, "sessions"));
    sessionCount = snapshot.data().count;
  } catch (error) {
    console.error("Error fetching session count:", error);
  }

  // Format PM types for Card Hover Effect
  const pmTypeCards = Object.values(PM_TYPES).map((type) => ({
    title: type.name,
    description: `${type.subtitle}\n\n${type.tagline}`,
    link: "#types", // Internal anchor or keeping it empty if just for display
    rawType: type, // Pass full object for custom rendering inside HoverEffect if we extended it, otherwise we map locally below.
  }));

  return (
    <div className="flex min-h-screen flex-col font-sans bg-[#0A0A0A] text-[#F5F0E8] selection:bg-[#C45C3A] selection:text-white overflow-hidden">
      {/* --- SECTION 1: NAVIGATION BAR --- */}
      <nav className="absolute top-0 left-0 w-full z-50 bg-transparent">
        <div className="w-full pt-8 pl-10 flex items-center">
          <Link
            href="/"
            className="text-[28px] font-serif text-[#F5F0E8] font-normal tracking-tight opacity-50 hover:opacity-100 transition-opacity"
          >
            Orlog
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col w-full relative z-10">
        {/* === FIXED ATMOSPHERE BACKGROUND === */}
        <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
          <BackgroundLines />
          <ShootingStars />
          <LampEffect />
        </div>

        {/* --- SECTION 2: HERO --- */}
        <section className="relative w-full h-[100vh] min-h-[600px] flex items-center justify-center overflow-hidden">
          <div className="max-w-[660px] mx-auto w-full px-6 flex flex-col items-center text-center relative z-10">
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-[11px] font-sans font-bold tracking-[0.25em] text-[#C45C3A] uppercase mb-8"
              >
                PM PERSONALITY TEST
              </motion.div>

              <div className="text-[34px] sm:text-[42px] lg:text-[62px] font-serif font-normal text-[#F5F0E8] leading-[1.08] tracking-[-0.02em] mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                >
                  Discover the PM
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.38 }}
                >
                  you <span className="italic text-[#C45C3A]">truly</span> are.
                </motion.div>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 2.43 }}
                className="text-base font-sans text-[#6B6560] leading-[1.65] max-w-[400px] w-full mx-auto mb-10"
              >
                Trust your instincts. Know your type. Find your true path.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 3.23 }}
                className="mb-8"
              >
                <Link href="/test">
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: "0 0 36px rgba(196,92,58,0.45)" }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="inline-flex items-center justify-center rounded-full bg-[#C45C3A] px-[38px] py-[14px] font-sans text-[15px] font-medium text-[#F5F0E8] focus:outline-none"
                  >
                    Start The Experience <span className="ml-[0.25em] font-serif">→</span>
                  </motion.button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 3.83 }}
                className="text-[13px] font-sans text-[#3D3835] flex items-center justify-center gap-1.5"
              >
                🧭 {sessionCount.toLocaleString()} PMs have discovered their nature.
              </motion.div>
            </div>
        </section>

        {/* SECTION SEPARATOR */}
        <hr className="w-[80%] max-w-[1100px] mx-auto border-t border-[#1E1A17] my-0 relative z-10 relative" />

        {/* --- SECTION 3: THE 6 PM TYPES --- */}
        <section id="types" className="py-24 sm:py-32 bg-transparent w-full relative z-10">
          <div className="max-w-[1100px] mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center mb-16 sm:mb-20"
            >
              <h2 className="text-4xl sm:text-[44px] font-serif font-bold text-[#F5F0E8] mb-6">Which PM are you?</h2>
              <p className="text-lg text-[#8A8480] max-w-2xl mx-auto leading-relaxed">
                Orlog identifies 6 core PM personalities. Most people are a blend of two.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                {Object.values(PM_TYPES).map((type: any, i) => (
                  <div
                    key={i}
                    className="p-8 rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] flex flex-col group hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
                  >
                    <div
                      className="absolute top-0 left-0 w-full h-1"
                      style={{ backgroundColor: type.color }}
                    />
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at 50% 120%, ${type.color}, transparent)`,
                      }}
                    />
                    
                    <div className="text-4xl mb-6 relative z-10">{type.icon || "🔮"}</div>
                    
                    <h3 className="text-2xl font-serif font-bold text-[#F5F0E8] mb-1 relative z-10">{type.name}</h3>
                    <p className="text-[#8A8480] font-serif italic text-sm mb-4 relative z-10">{type.subtitle}</p>
                    <p className="text-[#8A8480] text-sm mb-8 flex-grow relative z-10">{type.tagline}</p>

                    <div className="flex flex-wrap gap-2 mt-auto relative z-10">
                      {(type.strengths || []).slice(0, 3).map((tag: string, j: number) => (
                        <span
                          key={j}
                          className="inline-flex px-3 py-1 font-bold uppercase tracking-wider rounded-md text-[11px]"
                          style={{
                            backgroundColor: `${type.color}26`, 
                            color: type.color,
                            border: `1px solid ${type.color}40`,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-16 sm:mt-20"
            >
              <Link
                href="/test"
                className="group inline-flex h-14 items-center justify-center rounded-full bg-[#C45C3A] px-10 font-medium text-white transition-all hover:bg-[#A34B2E] shadow-sm text-base hover:shadow-[0_0_20px_rgba(196,92,58,0.5)]"
              >
                Find Out Which One You Are <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* SECTION SEPARATOR */}
        <hr className="w-[80%] max-w-[1100px] mx-auto border-t border-[#1E1A17] my-0 relative z-10 relative" />

        {/* --- SECTION 4: HYBRID TYPES TEASER --- */}
        <section className="relative py-20 sm:py-24 bg-transparent overflow-hidden w-full selection:bg-[#C4973A] selection:text-[#1A1210] z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-[900px] mx-auto px-6 text-center relative z-10"
          >
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#C4973A] mb-6 drop-shadow-[0_0_10px_rgba(196,151,58,0.3)]">
              Your instincts. 6 core types. 15 unique combinations.
            </h2>
            <p className="text-lg sm:text-xl text-[#F5F0E8]/80 max-w-2xl mx-auto leading-relaxed mb-12">
              Your result isn't just a single type — it's a unique blend. Orlog identifies your hybrid personality from 15 possible combinations.
            </p>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-16">
              {["The Architect", "The Oracle", "The Titan", "The Crusader", "The Strategist"].map((hybrid, i) => (
                <div key={i} className="px-5 py-2.5 rounded-full border border-[#C4973A] text-[#C4973A] shadow-[0_0_10px_rgba(196,151,58,0.2)] font-medium text-sm sm:text-base whitespace-nowrap bg-black/40 backdrop-blur-md">
                  {hybrid}
                </div>
              ))}
            </div>

            <p className="text-sm text-[#F5F0E8]/60 mb-8 uppercase tracking-widest font-bold">
              Which hybrid are you? Take the test to find out.
            </p>
            <Link
              href="/test"
              className="group inline-flex h-14 items-center justify-center rounded-full border border-[#C4973A] bg-transparent px-10 font-medium text-[#C4973A] transition-all hover:bg-[#C4973A] hover:text-[#1A1210] text-sm sm:text-base hover:shadow-[0_0_20px_rgba(196,151,58,0.4)]"
            >
              Discover My Type <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>
        </section>

        {/* SECTION SEPARATOR */}
        <hr className="w-[80%] max-w-[1100px] mx-auto border-t border-[#1E1A17] my-0 relative z-10 relative" />

        {/* --- SECTION 5: HOW IT WORKS --- */}
        <section className="py-24 sm:py-32 bg-transparent w-full relative z-20">
          <div className="max-w-[1100px] mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-[40px] font-serif font-bold text-[#F5F0E8] mb-4">How Orlog Works</h2>
              <p className="text-lg text-[#8A8480]">Three steps to knowing your PM nature.</p>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.2 } },
              }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
            >
              {[
                { step: "01", icon: "📋", title: "Trust Your Gut", desc: "Immerse yourself in real workplace situations. There are no right answers — just your natural instincts." },
                { step: "02", icon: "🔮", title: "Get Your PM Type", desc: "Orlog maps your answers to one of 6 PM personalities and reveals your unique hybrid type." },
                { step: "03", icon: "🧭", title: "Understand Yourself", desc: "See your PM signature chart, your strengths, your blind spots, and famous PMs who think like you." }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="bg-[#1A1A1A] p-8 rounded-2xl border border-[#2A2A2A] shadow-lg"
                >
                  <span className="text-xl font-serif font-bold text-[#C45C3A] mb-6 block">{item.step}</span>
                  <div className="text-3xl mb-4 opacity-80">{item.icon}</div>
                  <h3 className="text-xl font-bold text-[#F5F0E8] mb-3">{item.title}</h3>
                  <p className="text-[#8A8480] leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* SECTION SEPARATOR */}
        <hr className="w-[80%] max-w-[1100px] mx-auto border-t border-[#1E1A17] my-0 relative z-10 relative" />

        {/* --- SECTION 6: SOCIAL PROOF --- */}
        <section className="py-24 sm:py-32 bg-transparent w-full relative z-10">
          <div className="max-w-[1100px] mx-auto px-6 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-[40px] font-serif font-bold text-[#F5F0E8] mb-16"
            >
              Built for real PMs
            </motion.h2>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.2 } },
              }}
              className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-8 mb-20 max-w-[900px] mx-auto"
            >
              {[
                { title: "Real PM Situations", desc: "Not abstract questions. Immerse yourself in the actual challenges PMs face every day." },
                { title: "Science-backed Framework", desc: "Built on PM archetypes, psychology dimensions, and product management research." },
                { title: "Free. Always.", desc: "No login required. Get your full result instantly." }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="flex flex-col items-center"
                >
                  <span className="text-[#C45C3A] text-xl mb-4">✦</span>
                  <h4 className="text-xl font-bold text-[#F5F0E8] mb-3">{item.title}</h4>
                  <p className="text-[#8A8480] leading-relaxed max-w-[260px]">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm font-bold text-[#8A8480] tracking-wide uppercase"
            >
              Join <span className="text-[#C45C3A]">{sessionCount.toLocaleString()}</span> PMs who already know their nature.
            </motion.p>
          </div>
        </section>

        {/* SECTION SEPARATOR */}
        <hr className="w-[80%] max-w-[1100px] mx-auto border-t border-[#1E1A17] my-0 relative z-10 relative" />

        {/* --- SECTION 7: FINAL CTA BANNER --- */}
        <section className="relative w-full h-[60vh] sm:h-[70vh] flex items-center justify-center overflow-hidden bg-transparent z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-20 max-w-[800px] mx-auto px-6 text-center pointer-events-auto"
          >
            <h2 className="text-4xl sm:text-[64px] font-serif font-bold text-[#F5F0E8] mb-6 leading-tight drop-shadow-xl">
              Ready to know your PM nature?
            </h2>
            <p className="text-lg sm:text-xl text-[#F5F0E8]/80 mb-12 drop-shadow-md">
              Takes 10–15 minutes. Free. No login required.
            </p>
            <Link
              href="/test"
              className="group inline-flex h-14 sm:h-16 items-center justify-center rounded-full bg-[#F5F0E8] px-10 font-bold text-[#0A0A0A] transition-all hover:bg-white hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)] text-base sm:text-lg"
            >
              Take the Orlog Test <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>
        </section>
      </main>

      {/* SECTION SEPARATOR */}
      <hr className="w-[80%] max-w-[1100px] mx-auto border-t border-[#1E1A17] my-0 relative z-10 relative" />

      {/* --- SECTION 8: FOOTER --- */}
      <footer className="w-full bg-transparent py-8 mt-auto z-10 relative">
        <div className="max-w-[1100px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <span className="text-xl font-serif text-[#F5F0E8] font-bold tracking-tight">Orlog</span>
            <span className="hidden sm:inline text-[#2A2A2A]">|</span>
            <span className="text-sm text-[#8A8480] font-medium">Know your PM nature.</span>
          </div>
          <div className="text-sm text-[#8A8480]/60 font-medium">
            © {new Date().getFullYear()} Orlog
          </div>
        </div>
      </footer>
    </div>
  );
}
