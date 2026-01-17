import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, Sparkles, Shield, Zap, Globe, Github, ArrowRight, Music, Heart, Smartphone, ChevronRight } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="p-10 rounded-[2.5rem] glass hover:bg-white/[0.05] border-white/5 hover:border-primary/30 transition-all group relative overflow-hidden"
    >
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary/20 transition-all shadow-[0_0_20px_rgba(255,0,51,0.1)]">
            <Icon className="text-primary w-8 h-8" />
        </div>
        <h3 className="text-2xl font-black mb-4 text-white tracking-tight">{title}</h3>
        <p className="text-text-secondary leading-relaxed font-medium opacity-80">{description}</p>
    </motion.div>
);

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-bg-base overflow-x-hidden">
            {/* Cinematic Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[160px] animate-float opacity-50" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[140px] animate-float opacity-50" style={{ animationDelay: '3s' }} />
                <div className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] animate-float opacity-30" style={{ animationDelay: '1.5s' }} />
            </div>

            <div className="relative z-10">
                {/* Hero Section */}
                <section className="relative pt-52 pb-32 px-6 max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-[10px] font-black tracking-[0.2em] uppercase mb-12 shadow-2xl backdrop-blur-md"
                    >
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Next-Gen Music Experience
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                        className="text-7xl md:text-[9rem] font-black tracking-tighter mb-12 leading-[0.85] text-white"
                    >
                        SOUND WITHOUT <br />
                        <span className="text-primary text-glow-red relative">
                            LIMITS
                            <motion.span
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 1, delay: 1 }}
                                className="absolute bottom-4 left-0 h-2 bg-primary/20 blur-sm"
                            />
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto mb-16 leading-relaxed font-medium opacity-90"
                    >
                        Hyde Music is a premium streaming platform built for the digital age. Enjoy unlimited access to millions of tracks with zero interruptions and absolute privacy.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="flex flex-col md:flex-row items-center justify-center gap-8"
                    >
                        <Link
                            to="/music"
                            className="group px-12 py-6 bg-primary text-white rounded-[2rem] font-black text-xl flex items-center gap-4 transition-all hover:scale-105 hover:shadow-[0_20px_60px_-15px_rgba(255,0,51,0.5)] active:scale-95 border-none"
                        >
                            Open Player <Play fill="white" size={24} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/about/hyde"
                            className="px-12 py-6 glass text-white rounded-[2rem] font-black text-xl hover:bg-white/10 transition-all border-white/10 flex items-center gap-2 group border-none"
                        >
                            Why Hyde? <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform opacity-50" />
                        </Link>
                    </motion.div>
                </section>

                {/* Features Section */}
                <section className="py-32 px-6 max-w-7xl mx-auto relative">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <FeatureCard
                            icon={Zap}
                            title="Pure Performance"
                            description="Engineered for speed. Experience high-fidelity audio with zero latency and smooth transitions."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={Shield}
                            title="Absolute Privacy"
                            description="Your listening history is yours alone. We don't track, we don't sell, we just play."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon={Globe}
                            title="Global Access"
                            description="Listen to your favorites anywhere in the world. Seamless syncing across all your devices."
                            delay={0.3}
                        />
                    </div>
                </section>

                {/* Cinematic Section */}
                <section className="py-32 px-6 max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="relative rounded-[4rem] overflow-hidden glass aspect-video md:aspect-[21/9] flex flex-col items-center justify-center text-center p-16 group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-primary/5 z-0" />
                        <div className="absolute inset-0 bg-black/60 z-0 backdrop-blur-3xl opacity-40" />

                        <div className="relative z-10 flex flex-col items-center">
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="w-24 h-24 bg-primary/20 rounded-3xl flex items-center justify-center mb-10 shadow-3xl"
                            >
                                <Music className="text-primary w-12 h-12" />
                            </motion.div>
                            <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-none">The Future of Sound is Open.</h2>
                            <p className="text-xl md:text-2xl text-text-secondary max-w-3xl font-medium leading-relaxed opacity-80">
                                Join the thousands of audiophiles who have already switched to a more transparent, faster, and beautiful music experience.
                            </p>
                        </div>
                    </motion.div>
                </section>

                {/* Tech Stack / Stats */}
                <section className="py-40 px-6 relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />
                    <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-20 text-center relative z-10">
                        {[
                            { label: 'Licensed Tracks', value: '100M+', icon: Play },
                            { label: 'Active Hyde Members', value: '500K+', icon: Globe },
                            { label: 'Global Regions', value: '120+', icon: Zap },
                            { label: 'Community Contributors', value: '5K+', icon: Heart },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -5 }}
                            >
                                <div className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tighter tabular-nums">{stat.value}</div>
                                <div className="text-primary text-xs font-black uppercase tracking-[0.3em]">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <footer className="pt-40 pb-20 px-6 border-t border-white/5 relative bg-white/[0.01]">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-24">
                        <div className="max-w-md">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                    <Music className="text-white w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-black text-white m-0 tracking-tight">HYDE<span className="text-primary">MUSIC</span></h2>
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-6 tracking-tight">Building the next era of sound exploration.</h3>
                            <p className="text-text-secondary mb-10 leading-relaxed font-medium">Community-driven, performance-focused, and absolutely transparent. This is how music should be.</p>
                            <div className="flex gap-4">
                                <Link to="/music" className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-white border border-white/5">
                                    <ArrowRight size={24} />
                                </Link>
                                <a href="https://github.com/Tirth1107" target="_blank" className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-white border border-white/5">
                                    <Github size={24} />
                                </a>
                                <button className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-white border border-white/5">
                                    <Smartphone size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-20">
                            <div className="flex flex-col gap-6">
                                <span className="text-white font-black uppercase tracking-widest text-[10px]">Ecosystem</span>
                                <Link to="/about/hyde" className="text-text-secondary hover:text-primary font-bold text-sm transition-colors">About Us</Link>
                                <Link to="/music" className="text-text-secondary hover:text-primary font-bold text-sm transition-colors">Music Player</Link>
                                <a href="#" className="text-text-secondary hover:text-primary font-bold text-sm transition-colors">Mobile App</a>
                                <a href="#" className="text-text-secondary hover:text-primary font-bold text-sm transition-colors">Beta Access</a>
                            </div>
                            <div className="flex flex-col gap-6">
                                <span className="text-white font-black uppercase tracking-widest text-[10px]">Community</span>
                                <a href="#" className="text-text-secondary hover:text-primary font-bold text-sm transition-colors">GitHub</a>
                                <a href="#" className="text-text-secondary hover:text-primary font-bold text-sm transition-colors">Join Discord</a>
                                <a href="#" className="text-text-secondary hover:text-primary font-bold text-sm transition-colors">Guidelines</a>
                                <a href="#" className="text-text-secondary hover:text-primary font-bold text-sm transition-colors">Open Source</a>
                            </div>
                            <div className="flex flex-col gap-6">
                                <span className="text-white font-black uppercase tracking-widest text-[10px]">Legal</span>
                                <a href="#" className="text-text-secondary hover:text-primary font-bold text-sm transition-colors">Privacy</a>
                                <a href="#" className="text-text-secondary hover:text-primary font-bold text-sm transition-colors">Terms</a>
                                <a href="#" className="text-text-secondary hover:text-primary font-bold text-sm transition-colors">Cookies</a>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto pt-32 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-white/5 mt-20 opacity-40">
                        <p className="text-xs font-bold tracking-wider text-text-dim text-center">© 2026 HYDE ORGANIZATION. ALL RIGHTS RESERVED.</p>
                        <p className="text-xs font-bold tracking-wider text-text-dim text-center">DESIGNED BY TIRTH JOSHI IN INDIA.</p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
