import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Music, ChevronRight } from "lucide-react";
import AuthButton from "./AuthButton";

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const navLinks = [
        { title: "Dashboard", path: "/" },
        { title: "Music", path: "/music" },
        { title: "About", path: "/about/hyde" },
        { title: "Developer", path: "/about/developer" },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] h-16 bg-transparent flex items-center px-6">
            <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
                <Link to="/" className="flex items-center gap-3" style={{ textDecoration: "none" }}>
                    <div className="bg-primary rounded-xl flex items-center justify-center w-10 h-10">
                        <Music className="text-white w-5 h-5" />
                    </div>
                    <span className="font-black text-white tracking-tighter text-lg">HYDE</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-10">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`text-sm font-black tracking-widest uppercase transition-colors hover:text-primary ${location.pathname === link.path ? "text-primary" : "text-text-secondary"}`}
                        >
                            {link.title}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:block">
                        <AuthButton />
                    </div>
                    <Link
                        to="/music"
                        className="hidden md:flex items-center gap-2 bg-primary px-6 py-3 rounded-2xl text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95 border-none"
                    >
                        Launch Player
                    </Link>
                    <button
                        className="md:hidden p-3 rounded-xl glass text-white border-none"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden fixed inset-0 top-0 left-0 w-full h-screen bg-black/95 backdrop-blur-3xl z-[90] p-12 flex flex-col justify-center gap-12"
                    >
                        {navLinks.map((link, i) => (
                            <motion.div
                                key={link.path}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Link
                                    to={link.path}
                                    className="text-5xl font-black text-white tracking-tighter hover:text-primary transition-colors block"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.title}
                                </Link>
                            </motion.div>
                        ))}
                        <motion.div className="mt-12 flex flex-col gap-6">
                            <AuthButton />
                            <Link
                                to="/music"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center justify-between bg-primary p-6 rounded-3xl text-white font-black text-xl border-none"
                            >
                                Launch Player <ChevronRight size={28} />
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
