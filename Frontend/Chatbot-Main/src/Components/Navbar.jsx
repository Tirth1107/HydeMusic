import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { Menu, X, Music, ChevronRight, Zap, User } from "lucide-react";
import AuthButton from "./AuthButton";

// --- Magnet Effect Component ---
// Wraps buttons to make them magnetically attracted to the mouse cursor
const Magnetic = ({ children }) => {
    const ref = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e) => {
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        setPosition({ x: middleX * 0.1, y: middleY * 0.1 });
    };

    const reset = () => setPosition({ x: 0, y: 0 });

    const { x, y } = position;
    return (
        <motion.div
            style={{ position: "relative" }}
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x, y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
        >
            {children}
        </motion.div>
    );
};

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    // Scroll Progress Bar Logic
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Scroll detection for glass effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { title: "Dashboard", path: "/" },
        { title: "Music", path: "/music" },
        { title: "About", path: "/about/hyde" },
        { title: "Developer", path: "/about/developer" },
    ];

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-[100] h-20 transition-all duration-500 border-b ${scrolled
                    ? "bg-[#050505]/80 backdrop-blur-2xl border-white/5 shadow-2xl"
                    : "bg-transparent border-transparent"
                    }`}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between h-full px-6">
                    {/* --- Logo --- */}
                    <Magnetic>
                        <Link to="/" className="flex items-center gap-3 group relative z-50">
                            <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-[#ff3e3e] to-[#b01e1e] rounded-xl shadow-lg shadow-red-600/20 group-hover:scale-105 transition-transform duration-300">
                                <Music className="text-white w-5 h-5" />
                                <div className="absolute inset-0 bg-white/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <span className="font-black text-white tracking-tighter text-xl">
                                HYDE
                            </span>
                        </Link>
                    </Magnetic>

                    {/* --- Desktop Nav --- */}
                    <div className="hidden md:flex items-center gap-2">
                        <div className="flex items-center bg-white/5 rounded-full p-1.5 border border-white/5 backdrop-blur-md shadow-inner shadow-black/50">
                            {navLinks.map((link) => {
                                const isActive = location.pathname === link.path;
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`relative px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 z-10 ${isActive ? "text-white" : "text-gray-400 hover:text-white"
                                            }`}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-pill"
                                                className="absolute inset-0 bg-[#ff3e3e] rounded-full shadow-lg shadow-red-500/30 -z-10"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                        {link.title}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* --- Right Side Actions --- */}
                    <div className="flex items-center gap-4">
                        <div className="hidden md:block scale-90">
                            <AuthButton />
                        </div>

                        <Magnetic>
                            <Link
                                to="/music"
                                className="hidden md:flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#ff3e3e] hover:text-white hover:scale-105 transition-all shadow-lg active:scale-95 group overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                <Zap size={16} className="group-hover:fill-current transition-colors" />
                                <span>Launch</span>
                            </Link>
                        </Magnetic>

                        {/* Mobile Toggle */}
                        <button
                            className="md:hidden p-3 rounded-xl bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-colors active:scale-95"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* --- Scroll Progress Bar --- */}
                <motion.div
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#ff3e3e] via-red-500 to-[#ff3e3e] origin-left z-50"
                    style={{ scaleX }}
                />

                {/* --- Mobile Menu Overlay --- */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="md:hidden fixed inset-0 z-[90] bg-[#050505]/95 backdrop-blur-3xl flex flex-col pt-28 px-6"
                        >
                            <div className="flex flex-col gap-8">
                                {navLinks.map((link, i) => (
                                    <motion.div
                                        key={link.path}
                                        initial={{ opacity: 0, x: -50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <Link
                                            to={link.path}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`text-5xl font-black tracking-tighter flex items-center gap-6 group ${location.pathname === link.path ? "text-[#ff3e3e]" : "text-white/40"
                                                }`}
                                        >
                                            <span className={`text-sm font-mono transition-colors ${location.pathname === link.path ? "text-[#ff3e3e]" : "text-white/20 group-hover:text-white/60"
                                                }`}>0{i + 1}</span>
                                            <span className="group-hover:text-white transition-colors">{link.title}</span>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mt-auto mb-12 flex flex-col gap-6"
                            >
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-3 mb-4 text-white/50 text-sm font-bold uppercase tracking-widest">
                                        <User size={16} /> Account
                                    </div>
                                    <AuthButton />
                                </div>
                                <Link
                                    to="/music"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full bg-[#ff3e3e] py-5 rounded-2xl flex items-center justify-center gap-2 text-white font-bold uppercase tracking-widest shadow-lg shadow-red-900/20 active:scale-95 transition-transform"
                                >
                                    Launch Player <ChevronRight size={20} />
                                </Link>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </>
    );
}