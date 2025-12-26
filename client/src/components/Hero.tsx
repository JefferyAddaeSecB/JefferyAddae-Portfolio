import { motion } from "framer-motion";
import { slideInLeft, slideInRight } from "@/lib/animations";

const Hero = () => {
  return (
    <section id="hero" className="min-h-screen pt-24 pb-16 flex items-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,107,63,0.15),transparent_70%),radial-gradient(circle_at_70%_70%,rgba(206,17,38,0.1),transparent_70%)]"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="order-2 md:order-1"
            initial="hidden"
            animate="visible"
            variants={slideInLeft}
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary border border-border mb-6">
              <span className="w-2 h-2 rounded-full bg-[hsl(var(--ghana-green))] animate-pulse mr-2"></span>
              <span className="text-sm font-medium">Available for freelance work</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight mb-6">
              I AM A FULL-STACK<br />
              WEB DEVELOPER & AI AUTOMATION SPECIALIST
            </h1>
            
            <div className="flex items-center space-x-3 mb-8">
              <div className="flex-shrink-0 px-3 py-1 rounded-full bg-secondary border border-border">
                <span className="text-sm font-medium">10+ Years</span>
              </div>
              <div className="flex-shrink-0 px-3 py-1 rounded-full bg-secondary border border-border">
                <span className="text-sm font-medium">3+ Countries</span>
              </div>
              <div className="flex-shrink-0 px-3 py-1 rounded-full bg-secondary border border-border">
                <span className="text-sm font-medium">MERN Stack</span>
              </div>
            </div>
            
            <p className="text-gray-400 text-lg mb-8 md:max-w-lg">
              Transforming ideas into powerful digital experiences with clean code and creative problem-solving.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <motion.a 
                href="#projects" 
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View My Work
              </motion.a>
              <motion.a 
                href="#contact" 
                className="px-6 py-3 bg-transparent hover:bg-secondary border border-gray-700 hover:border-gray-600 rounded-md font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact Me
              </motion.a>
            </div>
          </motion.div>
          
          <motion.div 
            className="order-1 md:order-2 flex justify-center md:justify-end"
            initial="hidden"
            animate="visible"
            variants={slideInRight}
          >
            <div className="relative">
              <div className="absolute -right-6 -top-6 w-24 h-24 ghana-gradient rounded-full opacity-30 blur-xl animate-pulse"></div>
              <motion.div 
                className="relative overflow-hidden rounded-xl border-4 border-secondary glow"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1596564231768-33cd9ecf10b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=600&q=80" 
                  alt="Professional developer portrait" 
                  className="w-full h-auto rounded-lg object-cover" 
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
