import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const CV = () => {
  // Function to handle CV download
  const handleDownloadCV = async () => {
    try {
      // Fetch the PDF file from public/assets
      const response = await fetch('/assets/CV.pdf');
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF file: ${response.statusText}`);
      }
      
      // Convert the response to a blob
      const blob = await response.blob();
      
      // Verify blob is valid
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }
      
      // Create a blob URL
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a link element
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'Jeffery_Addae_CV.pdf';
      
      // Append to body and click
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
      alert('An error occurred while trying to download the CV. Please try again later.');
    }
  };
  
  // Animated background canvas effect for page
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      const canvas = document.getElementById('background-canvas') as HTMLCanvasElement;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      let width = window.innerWidth;
      let height = window.innerHeight;
      
      const resizeCanvas = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
      };
      
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();
      
      const particles: {x: number; y: number; size: number; speedX: number; speedY: number}[] = [];
      const particleCount = 50;
      
      // Create particles
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2 + 0.5,
          speedX: Math.random() * 0.5 - 0.25,
          speedY: Math.random() * 0.5 - 0.25
        });
      }
      
      const animate = () => {
        ctx.clearRect(0, 0, width, height);
        
        // Draw and update particles
        ctx.fillStyle = '#ff6b00';
        ctx.strokeStyle = '#ff6b00';
        ctx.lineWidth = 0.3;
        
        particles.forEach((particle, i) => {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fill();
          
          // Connect particles with lines if they're close enough
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[j].x - particle.x;
            const dy = particles[j].y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
          
          // Update position
          particle.x += particle.speedX;
          particle.y += particle.speedY;
          
          // Bounce off edges
          if (particle.x < 0 || particle.x > width) particle.speedX *= -1;
          if (particle.y < 0 || particle.y > height) particle.speedY *= -1;
        });
        
        requestAnimationFrame(animate);
      };
      
      animate();
      
      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, [mounted]);

  return (
    <div className="container mx-auto px-4 py-24 relative">
      {/* Animated background canvas */}
      <canvas id="background-canvas" className="fixed top-0 left-0 w-full h-full -z-10 opacity-20"></canvas>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-center md:items-start mb-8 gap-4"
      >
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Profile Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary mb-4 md:mb-0"
          >
            <img 
              src="/assets/profile/profile-image.jpg" 
              alt="Jeffery Addae" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          
          <div className="flex flex-col">
            <h1 className="text-4xl md:text-5xl font-bold text-primary">JEFFERY ADDAE</h1>
            <p className="text-muted-foreground text-base md:text-lg mt-2">
              AI Automation Engineer | Full-Stack Developer
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Toronto, Ontario, Canada
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              📧 jeffaddai40@gmail.com | 🌐 Portfolio | 💼 LinkedIn | 🧠 GitHub
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-1">
          <button 
            onClick={handleDownloadCV}
            className="crystal-btn text-white font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>
            Download CV
          </button>
        </div>
      </motion.div>
      
      <div className="bg-card rounded-lg p-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">PROFESSIONAL SUMMARY</h3>
                  <p className="text-foreground/80">
                    AI Automation Engineer and Full-Stack Developer specializing in workflow automation, AI systems, and scalable web applications.
                    Experienced in building production-ready n8n automations, backend services, and AI-powered tools that reduce manual work,
                    improve operational efficiency, and support business growth.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">PROFESSIONAL EXPERIENCE</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-1">
                        <h4 className="text-lg font-semibold text-foreground">AI Automation Engineer & Full-Stack Developer</h4>
                        <span className="text-primary">Mar 2024 – Present</span>
                      </div>
                      <p className="text-foreground/80 mb-2">Freelance / Contract — Remote</p>
                      <ul className="list-disc list-inside space-y-2 text-foreground/80">
                        <li>Designed and deployed AI-powered automation workflows using n8n for lead intake, CRM sync, internal operations, and reporting.</li>
                        <li>Built multi-step workflows with triggers, conditional logic, retries, and error handling.</li>
                        <li>Integrated third-party systems (forms, email, databases, dashboards) into unified automation pipelines.</li>
                        <li>Implemented AI assistants for support triage, email follow-ups, and internal knowledge retrieval.</li>
                        <li>Delivered reusable automation frameworks to improve scalability and reduce operational overhead.</li>
                      </ul>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <h4 className="text-lg font-semibold text-foreground">Full-Stack Developer | Tech Lead</h4>
                        <span className="text-primary">July 2024 – Present</span>
                      </div>
                      <p className="text-foreground/80 mb-2">CEMAR Counseling — Remote</p>
                      <ul className="list-disc list-inside space-y-2 text-foreground/80">
                        <li>Developed full-stack web applications using React, TypeScript, Node.js, and Firebase.</li>
                        <li>Designed RESTful APIs and integrated cloud services for authentication, storage, and data sync.</li>
                        <li>Improved application performance through modular architecture and optimization.</li>
                      </ul>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <h4 className="text-lg font-semibold text-foreground">Junior Web Developer</h4>
                        <span className="text-primary">Feb 2024 – Oct 2024</span>
                      </div>
                      <p className="text-foreground/80 mb-2">Africa Startup Academy — Remote</p>
                      <ul className="list-disc list-inside space-y-2 text-foreground/80">
                        <li>Built responsive UI components using React and Tailwind CSS.</li>
                        <li>Assisted with API integrations and backend feature development.</li>
                        <li>Participated in Git-based workflows and Agile development practices.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">EDUCATION</h3>
                  <div className="space-y-2">
                    <div>
                      <h4 className="text-lg font-semibold text-foreground">Humber College — Etobicoke, Canada</h4>
                      <p className="text-foreground/80">Diploma in Computer Programming</p>
                      <p className="text-foreground/80">Jan 2023 – Aug 2025</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">CERTIFICATIONS</h3>
                  <ul className="list-disc list-inside space-y-2 text-foreground/80">
                    <li>ALX AI Career Essentials — Applied AI fundamentals and chatbot systems</li>
                  </ul>
                  <p className="text-foreground/80 mt-2 text-sm">Feb 2024</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">TECHNICAL SKILLS</h3>
                  <div className="space-y-2 text-foreground/80">
                    <p><span className="font-semibold text-foreground">Automation & AI:</span> n8n, OpenAI API, Webhooks, AI Assistants</p>
                    <p><span className="font-semibold text-foreground">Frontend:</span> React, TypeScript, Tailwind CSS, Next.js</p>
                    <p><span className="font-semibold text-foreground">Backend:</span> Node.js, REST APIs, Supabase, PostgreSQL, Firebase</p>
                    <p><span className="font-semibold text-foreground">Tools:</span> Git/GitHub, Notion, Slack, Google Workspace, Vercel</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">Location</h3>
                  <p className="text-foreground/80">Toronto, Ontario, Canada</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">Email</h3>
                  <p className="text-foreground/80">jeffaddai40@gmail.com</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">Portfolio</h3>
                  <a
                    href="https://jeffery-addae-portfolio-web.vercel.app/"
                    className="text-foreground/80 hover:text-primary transition-colors"
                  >
                    jeffery-addae-portfolio-web.vercel.app
                  </a>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">LinkedIn</h3>
                  <a
                    href="https://www.linkedin.com/in/jeffery-addae-297214398/"
                    className="text-foreground/80 hover:text-primary transition-colors"
                  >
                    linkedin.com/in/jeffery-addae-297214398
                  </a>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">GitHub</h3>
                  <a
                    href="https://github.com/JefferyAddaeSecB"
                    className="text-foreground/80 hover:text-primary transition-colors"
                  >
                    github.com/JefferyAddaeSecB
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CV;
