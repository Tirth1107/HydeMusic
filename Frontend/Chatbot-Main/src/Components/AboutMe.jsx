import React from "react";
import { motion } from "framer-motion";
import { 
  Github, 
  Linkedin, 
  Mail, 
  MapPin, 
  Calendar, 
  Code, 
  BookOpen, 
  Award,
  Sparkles,
  ExternalLink
} from "lucide-react";
import AuthButton from "./AuthButton";

export default function AboutMe({ onNavigate }) {
  const skills = [
    { name: "React", level: 90, category: "Frontend" },
    { name: "JavaScript", level: 88, category: "Frontend" },
    { name: "Python", level: 85, category: "Backend" },
    { name: "Node.js", level: 80, category: "Backend" },
    { name: "TypeScript", level: 75, category: "Frontend" },
    { name: "Flask", level: 82, category: "Backend" },
    { name: "MongoDB", level: 78, category: "Database" },
    { name: "Machine Learning", level: 75, category: "AI/ML" },
    { name: "TensorFlow", level: 70, category: "AI/ML" },
    { name: "Docker", level: 68, category: "DevOps" },
    { name: "Git", level: 85, category: "DevOps" },
    { name: "MySQL", level: 75, category: "Database" },
  ];

  const projects = [
    {
      title: "Discord Clone",
      description: "A fully Functional Clone of Discord with Realtime Chat and Voice Channels using Websockets and WebRTC.",
      tech: ["Node.js", "MongoDB", "Express", "Tailwind CSS", "Websockets", "WebRTC"],
      link: "#",
      github: "https://github.com/Bhavya773-coder/discord-clone"
    },
    {
      title: "Car Runner Game",
      description: "A 3D Car Racing Game with Multiplayer Support and Realtime Leaderboard using Unity and Blender.",
      tech: ["Unity", "C#", "Blender"],
      link: "#",
      github: "https://github.com/Bhavya773-coder/car-runner-game"
    },
    {
      title: "AI Weagon Detection",
      description: "A Realtime Object Detection System for Weagons using Own Models and OpenCV, Pytorch.",
      tech: ["Python", "Training Models", "OpenCV", "Pytorch", "Deep Learning", "CNN"],
      link: "#",
      github: "https://github.com/Bhavya773-coder/ai-weapon-detection"
    },
    {
      title: "VibeEra - AI Assistant",
      description: "Modern chatbot application with elegant UI design, user authentication, and AI integration capabilities.",
      tech: ["React", "Flask", "Clerk", "Framer Motion"],
      link: "#",
      github: "https://github.com/Bhavya773-coder/aura-chat"
    }
  ];

  const experiences = [
    {
      role: "Software Developer",
      company: "Personal Projects",
      period: "2023 - Present",
      description: "Building full-stack web applications using modern technologies. Focus on creating clean, maintainable code and excellent user experiences."
    },
    {
      role: "Frontend Developer",
      company: "Learning & Development",
      period: "2022 - Present",
      description: "Developing responsive user interfaces and exploring modern frontend frameworks. Passionate about creating intuitive and accessible web experiences."
    },
    {
      role: "Technology Enthusiast",
      company: "Continuous Learning",
      period: "2021 - Present",
      description: "Exploring new technologies and frameworks through hands-on projects. Active in developer communities and open-source contributions."
    }
  ];

  const education = [
    {
      degree: "Computer Science",
      school: "Kalyan Polytechnic",
      period: "2020 - 2023",
      description: "Studying computer science with focus on software development and modern programming practices. Actively participating in coding projects and technical communities."
    },
    {
      degree: "B.Tech",
      school: "Darshan University",
      period: "2023-Present",
      description: "Continuously expanding knowledge through online courses, documentation, and hands-on project development. Committed to staying current with industry trends. Learning as much as possible for AIML Devlopement."
    }
  ];

  return (
    <div className="about-root theme--dark">
      {/* Animated background */}
      <div className="bg-anim bg-anim--dark" aria-hidden="true" />

      <header className="about-header">
        <div className="about-header__left">
          <div className="about-logo">
            <Sparkles className="icon" />
          </div>
          <div>
            <h1 className="about-title">VibeEra</h1>
            <p className="about-subtitle">Full Stack Developer & AI Enthusiast</p>
          </div>
        </div>
        <div className="about-header__right">
          <AuthButton />
          <button className="btn btn--ghost" onClick={() => onNavigate('chat')}>Back to Chat</button>
        </div>
      </header>

      <main className="about-main">
        <div className="about-content">
          {/* Hero Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="hero-section"
          >
            <div className="hero-content">
              <div className="hero-text">
                <h2 className="hero-title">Hi, I'm <span className="highlight">Bhavya</span></h2>
                <p className="hero-description">
                  I'm an enthusiastic AI/ML Developer and Game Developer, eager to dive into building intelligent systems 
                  and immersive gaming experiences. I enjoy solving challenging problems by applying machine learning 
                  algorithms and creating engaging, interactive games. When I'm not coding, you'll find me exploring 
                  new AI/ML techniques, working on personal game projects, or contributing to open-source communities.
                </p>
                <div className="hero-stats">
                  <div className="stat">
                    <span className="stat-number">0</span>
                    <span className="stat-label">Years Experience</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">16+</span>
                    <span className="stat-label">Projects Completed</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">0</span>
                    <span className="stat-label">Happy Clients</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">20+</span>
                    <span className="stat-label">Technologies</span>
                  </div>
                </div>
              </div>
              <div className="hero-image">
                <div className="profile-placeholder">
                  <span>👨‍💻</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Contact Info */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="contact-section"
          >
            <h3 className="section-title">Get In Touch</h3>
            <div className="contact-grid">
              <a href="mailto:contact@example.com" className="contact-item">
                <Mail className="icon" />
                <span>contact@example.com</span>
              </a>
              <a href="https://github.com/Bhavya773-coder" className="contact-item">
                <Github className="icon" />
                <span>github.com/Bhavya773-coder</span>
              </a>
              <a href="https://linkedin.com/in/your-profile" className="contact-item">
                <Linkedin className="icon" />
                <span>linkedin.com/in/your-profile</span>
              </a>
              <div className="contact-item">
                <MapPin className="icon" />
                <span>India</span>
              </div>
              <div className="contact-item">
                <Calendar className="icon" />
                <span>Available for opportunities</span>
              </div>
            </div>
          </motion.section>

          {/* Projects */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="projects-section"
          >
            <h3 className="section-title">Featured Projects</h3>
            <div className="projects-grid">
              {projects.map((project, index) => (
                <motion.div
                  key={project.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="project-card"
                >
                  <div className="project-header">
                    <h4 className="project-title">{project.title}</h4>
                    <div className="project-links">
                      <a href={project.link} className="project-link" title="Live Demo">
                        <ExternalLink className="icon" />
                      </a>
                      <a href={project.github} className="project-link" title="GitHub">
                        <Github className="icon" />
                      </a>
                    </div>
                  </div>
                  <p className="project-description">{project.description}</p>
                  <div className="project-tech">
                    {project.tech.map(tech => (
                      <span key={tech} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Education */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.5 }}
            className="education-section"
          >
            <h3 className="section-title">Education</h3>
            <div className="education-grid">
              {education.map((edu, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="education-card"
                >
                  <div className="education-icon">
                    <BookOpen className="icon" />
                  </div>
                  <div className="education-content">
                    <h4 className="education-degree">{edu.degree}</h4>
                    <p className="education-school">{edu.school}</p>
                    <p className="education-period">{edu.period}</p>
                    <p className="education-description">{edu.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Call to Action */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.6 }}
            className="cta-section"
          >
            <div className="cta-content">
              <h3 className="cta-title">Let's Work Together!</h3>
              <p className="cta-description">
                I'm always interested in new opportunities and exciting projects. 
                Whether you have a question or just want to say hi, feel free to reach out!
              </p>
              <div className="cta-buttons">
                <a href="mailto:contact@example.com" className="btn btn--primary">
                  <Mail className="icon" />
                  Get In Touch
                </a>
                <button className="btn btn--ghost" onClick={() => onNavigate('chat')}>
                  <Code className="icon" />
                  Try My Chatbot
                </button>
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}