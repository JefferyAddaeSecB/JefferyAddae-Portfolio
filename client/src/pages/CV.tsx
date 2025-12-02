import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const CV = () => {
  // Function to handle CV download
  const handleDownloadCV = async () => {
    try {
      // Fetch the PDF file
      const response = await fetch('/assets/CV.pdf');
      if (!response.ok) {
        throw new Error('Failed to fetch PDF file');
      }
      
      // Convert the response to a blob
      const blob = await response.blob();
      
      // Create a blob URL
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a link element
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'Felix CV.pdf';
      
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
              src="/assets/profile/3.jpg" 
              alt="Felix Ashong" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-primary">FELIX ASHONG</h1>
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
              <h2 className="text-2xl font-bold text-foreground mb-4">Front-End Developer | Full Stack Web Developer
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">PROFESSIONAL SUMMARY</h3>
                  <p className="text-foreground/80">
                  A results-oriented individual and a motivated student eager to apply classroom knowledge to real-world experiences, with a strong willingness to learn and contribute. Effective communicator with a collaborative mindset, ready to bring fresh perspectives and a strong work ethic to any team.                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">WORK EXPERIENCE</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-1">
                        <h4 className="text-lg font-semibold text-foreground">Front-End Intern</h4>
                        <span className="text-primary">08/2023 - 10/2023</span>
                      </div>
                      <p className="text-foreground/80 mb-2">NAVANTRICS LTD | Kasoa</p>
                      <ul className="list-disc list-inside space-y-2 text-foreground/80">
                        <li>Developed 4 responsive webpages using React and CSS, improving user engagement by 10% based on client feedback.</li>
                        <li>Designed interactive UIs for 2 web apps using Figma, creating wireframes and prototypes that increased client satisfaction by 15%.</li>
                        <li>Gathered client requirements and feedback to refine UI designs, ensuring alignment with project goals.</li>
                        <li>Built responsive webpages with React and Node.js, viewable on my Github.</li>
                      </ul>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <h4 className="text-lg font-semibold text-foreground">Networking Intern</h4>
                        <span className="text-primary">01/2024 - 03/2024</span>
                      </div>
                      <p className="text-foreground/80 mb-2">University Of Ghana Computing Systems | Legon</p>
                      <ul className="list-disc list-inside space-y-2 text-foreground/80">
                        <li>Analyzed system needs with IT team, implementing solutions to enhance network reliability for students on campus.</li>
                        <li>Diagnosed and resolved over 15 network faults, restoring connectivity within couple of hours per incident.</li>
                        <li>Collaborated with various campus department to deploy network upgrades and fixes.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">EDUCATION</h3>
                  <div className="space-y-2">
                    <div>
                      <h4 className="text-lg font-semibold text-foreground">University of Ghana | Legon</h4>
                      <p className="text-foreground/80">BSC. Information Technology</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">CERTIFICATES</h3>
                  <ul className="list-disc list-inside space-y-2 text-foreground/80">
                    <li>ALX AI Career Essentials Certified</li>
                    <li>Prodigee Edtech UI/UX Design </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">LANGUAGES</h3>
                  <p className="text-foreground/80">English, Twi</p>
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
                  <p className="text-foreground/80">Accra, Ghana</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">Phone</h3>
                  <p className="text-foreground/80">0593125279</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-2">Email</h3>
                  <p className="text-foreground/80">felixashong4@gmail.com</p>
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