import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Globe, Zap, Heart, Sparkles, Music, Star, Users } from 'lucide-react';

const PillarCard = ({ icon: Icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.8 }}
        className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-primary/30 transition-all group"
    >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
            <Icon className="text-primary w-8 h-8" />
        </div>
        <h3 className="text-2xl font-black mb-4 text-white uppercase tracking-tight">{title}</h3>
        <p className="text-text-secondary leading-relaxed font-medium opacity-80">{description}</p>
    </motion.div>
);

export default function AboutHyde() {
    return (
        <div className="min-h-screen bg-bg-base pt-40 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-[10px] font-black tracking-widest uppercase mb-12 shadow-2xl"
                    >
                        <Sparkles size={14} /> The Power of Hyde
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl font-black tracking-tighter mb-8 text-white leading-none"
                    >
                        THE FUTURE IS <br />
                        <span className="text-primary">HYDE-DRIVEN</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto font-medium"
                    >
                        Hyde is more than just an organization; it's a movement towards a more transparent, user-centric, and performant digital ecosystem.
                    </motion.p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
                    <PillarCard
                        icon={Users}
                        title="Community Run"
                        description="Hyde belongs to its users. Decisions are made through absolute transparency and community feedback."
                        delay={0.1}
                    />
                    <PillarCard
                        icon={Globe}
                        title="Transparent"
                        description="Every line of code is open. We believe in absolute honesty and data sovereignty for every single user."
                        delay={0.2}
                    />
                    <PillarCard
                        icon={Zap}
                        title="Fast First"
                        description="Performance isn't an afterthought; it's our DNA. Hyde software is engineered for maximum efficiency."
                        delay={0.3}
                    />
                </div>

                <section className="p-16 md:p-24 rounded-[4rem] bg-white/[0.02] border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1">
                            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-none">Our Vision for the World</h2>
                            <p className="text-lg md:text-xl text-text-secondary font-medium leading-relaxed mb-10 opacity-80">
                                We aim to dismantle the monopolies of the digital world by providing high-quality, free, and open-source alternatives that respect user privacy and focus on what truly matters: the experience.
                            </p>
                            <div className="flex items-center gap-12">
                                <div>
                                    <div className="text-4xl font-black text-white mb-1">2026</div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Est. Hyde Org</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-black text-white mb-1">100%</div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Open Source</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-[40%] aspect-square glass rounded-[3rem] flex items-center justify-center p-12">
                            <div className="text-center">
                                <Music size={80} className="text-primary mb-8 mx-auto" opacity={0.5} />
                                <h3 className="text-2xl font-black text-white mb-4">Hyde Music</h3>
                                <p className="text-sm text-text-secondary font-medium">The first of many flagship products under the Hyde banner.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
