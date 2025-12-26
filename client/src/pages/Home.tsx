import { motion } from "framer-motion";
import { Link } from "wouter";
import { FiMonitor, FiCloud, FiCpu } from "react-icons/fi";
import CountUp from "@/components/CountUp";
import GlowingProfileImage from "@/components/GlowingProfileImage";

const Home = () => {
  return (
    <div className="relative min-h-screen">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="bg-gradient-1 absolute w-[600px] h-[600px] top-0 right-0 opacity-10"></div>
        <div className="bg-gradient-2 absolute w-[500px] h-[500px] bottom-0 left-0 opacity-10"></div>
      </div>
      
      {/* Hero Section - Full Screen */}
      <section className="min-h-screen flex items-center justify-center relative z-10 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-semibold"
              >
                👋 Welcome — I help businesses fix time leaks.
              </motion.div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="text-foreground">I’m </span>
                <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Jeffery Addae</span>
              </h1>
              
              <h2 className="text-2xl md:text-3xl font-semibold text-muted-foreground mb-6">
                AI Automation Specialist & Full-Stack Developer
              </h2>
              
              <p className="text-lg text-muted-foreground mb-6 max-w-xl mx-auto lg:mx-0">
                Most businesses lose money to manual work, slow processes, and human bottlenecks. I help solve that by implementing AI automation systems that reduce manpower strain, save time, and increase return on investment.
              </p>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                I build the systems behind the scenes, from AI-powered workflows and chatbots to scalable web platforms — so your business runs faster, leaner, and smarter.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Link href="/projects">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    View My Work →
                  </motion.button>
                </Link>
                <Link href="/contact">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-card border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-all duration-300"
                  >
                    Let's Talk
                  </motion.button>
                </Link>
              </div>
              
              {/* Quick Stats */}
              <div className="flex gap-8 justify-center lg:justify-start text-center">
                <div>
                  <div className="text-3xl font-bold text-primary"><CountUp end={2} suffix="+" /></div>
                  <div className="text-sm text-muted-foreground">Years Exp.</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary"><CountUp end={5} suffix="+" /></div>
                  <div className="text-sm text-muted-foreground">Projects</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary"><CountUp end={15} suffix="+" /></div>
                  <div className="text-sm text-muted-foreground">Clients</div>
                </div>
              </div>
            </motion.div>
            
            {/* Right: Profile Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center lg:justify-end"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-3xl"></div>
                <div className="relative w-72 h-72 sm:w-96 sm:h-96">
                  <GlowingProfileImage 
                    imageUrl="/assets/profile/profile-image.jpg"
                    altText="Jeffery Addae"
                    glowColor="#3b82f6"
                    glowIntensity={0.8}
                    className="w-full h-full rounded-3xl"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-muted/30 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              What I <span className="text-primary">Do</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Specializing in full-stack development and AI automation systems that streamline business workflows
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <FiMonitor className="w-10 h-10 text-primary" />,
                title: "Full-Stack Development",
                desc: "React, Next.js, Node.js, and TypeScript for modern web apps"
              },
              {
                icon: <FiCloud className="w-10 h-10 text-primary" />,
                title: "Cloud Integration",
                desc: "Supabase, Firebase, and Cloudinary for scalable solutions"
              },
              {
                icon: <FiCpu className="w-10 h-10 text-primary" />,
                title: "AI & Automation",
                desc: "Building AI automation systems that help businesses save time and reduce manual work"
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-card rounded-2xl p-8 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
              >
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{service.title}</h3>
                <p className="text-muted-foreground">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Tech <span className="text-primary">Stack</span>
            </h2>
            <p className="text-muted-foreground text-lg">Technologies I work with daily</p>
          </motion.div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 flex flex-col items-center justify-center h-32 hover:shadow-lg"
          >
            <img 
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
              alt="React"
              className="w-12 h-12 object-contain mb-2"
            />
            <span className="text-foreground font-medium text-sm">React</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 flex flex-col items-center justify-center h-32 hover:shadow-lg"
          >
            <img 
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg"
              alt="Node.js"
              className="w-12 h-12 object-contain mb-2"
            />
            <span className="text-foreground font-medium text-sm">Node.js</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 flex flex-col items-center justify-center h-32 hover:shadow-lg"
          >
            <img 
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg"
              alt="TypeScript"
              className="w-12 h-12 object-contain mb-2"
            />
            <span className="text-foreground font-medium text-sm">TypeScript</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 flex flex-col items-center justify-center h-32 hover:shadow-lg"
          >
            <img 
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg"
              alt="Next.js"
              className="w-12 h-12 object-contain mb-2"
            />
            <span className="text-foreground font-medium text-sm">Next.js</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 flex flex-col items-center justify-center h-32 hover:shadow-lg"
          >
            <img 
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg"
              alt="MongoDB"
              className="w-12 h-12 object-contain mb-2"
            />
            <span className="text-foreground font-medium text-sm">MongoDB</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 flex flex-col items-center justify-center h-32 hover:shadow-lg"
          >
            <img 
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg"
              alt="Figma"
              className="w-12 h-12 object-contain mb-2"
            />
            <span className="text-foreground font-medium text-sm">Figma</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 flex flex-col items-center justify-center h-32 hover:shadow-lg"
          >
            <img 
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg"
              alt="Tailwind CSS"
              className="w-12 h-12 object-contain mb-2"
            />
            <span className="text-foreground font-medium text-sm">Tailwind CSS</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 flex flex-col items-center justify-center h-32 hover:shadow-lg"
          >
            <img 
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg"
              alt="Git"
              className="w-12 h-12 object-contain mb-2"
            />
            <span className="text-foreground font-medium text-sm">Git</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 flex flex-col items-center justify-center h-32 hover:shadow-lg"
          >
            <img 
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg"
              alt="Firebase"
              className="w-12 h-12 object-contain mb-2"
            />
            <span className="text-foreground font-medium text-sm">Firebase</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 flex flex-col items-center justify-center h-32 hover:shadow-lg"
          >
            <img 
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg"
              alt="Supabase"
              className="w-12 h-12 object-contain mb-2"
            />
            <span className="text-foreground font-medium text-sm">Supabase</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 flex flex-col items-center justify-center h-32 hover:shadow-lg"
          >
            <img 
              src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/openai.svg"
              alt="OpenAI"
              className="w-12 h-12 object-contain mb-2 dark:invert"
            />
            <span className="text-foreground font-medium text-sm">OpenAI</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 flex flex-col items-center justify-center h-32 hover:shadow-lg"
          >
            <img 
              src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/langchain.svg"
              alt="LangChain"
              className="w-12 h-12 object-contain mb-2 dark:invert"
            />
            <span className="text-foreground font-medium text-sm">LangChain</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 flex flex-col items-center justify-center h-32 hover:shadow-lg"
          >
            <img 
              src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/n8n.svg"
              alt="n8n"
              className="w-12 h-12 object-contain mb-2 dark:invert"
            />
            <span className="text-foreground font-medium text-sm">n8n</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 flex flex-col items-center justify-center h-32 hover:shadow-lg"
          >
            <img 
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg"
              alt="PostgreSQL"
              className="w-12 h-12 object-contain mb-2"
            />
            <span className="text-foreground font-medium text-sm">PostgreSQL</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all duration-300 flex flex-col items-center justify-center h-32 hover:shadow-lg"
          >
            <img 
              src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg"
              alt="Vercel"
              className="w-12 h-12 object-contain mb-2 dark:invert"
            />
            <span className="text-foreground font-medium text-sm">Vercel</span>
          </motion.div>
        </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-primary/90 to-blue-600 rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-grid-white/10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Let's Build Something Amazing
              </h2>
              <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Ready to turn your ideas into reality? Let's collaborate and create exceptional digital experiences together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white text-primary rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300"
                  >
                    Start a Project
                  </motion.button>
                </Link>
                <Link href="/projects">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white/10 backdrop-blur border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
                  >
                    View Portfolio
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
