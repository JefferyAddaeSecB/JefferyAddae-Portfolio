import { motion } from "framer-motion";
import { slideInLeft, slideInRight } from "@/lib/animations";

const Hero = () => {
  return (
    <section id="hero" className="min-h-screen pt-24 pb-16 flex items-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,107,63,0.15),transparent_70%),radial-gradient(circle_at_70%_70%,rgba(206,17,38,0.1),transparent_70%)]" />

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
              <span className="text-sm font-medium">Available for Automation & Web Projects</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight mb-4">
              Automate your operations with AI — save hours every week.
            </h1>

            <p className="text-gray-400 text-lg mb-3 md:max-w-lg">
              I build n8n + AI workflows that remove manual work from lead intake, follow-ups, reporting, and internal ops.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Fast setup • measurable time saved • scalable systems
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-xs uppercase tracking-wide text-gray-400 mr-2">Ideal for</span>
              {["Agencies", "Coaches", "Local Services", "E-commerce Ops", "SaaS Teams"].map((item) => (
                <span key={item} className="px-3 py-1 rounded-full bg-secondary border border-border text-sm text-gray-200">
                  {item}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <motion.a
                href="#contact"
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Book a Free 45-minute Strategy Call
              </motion.a>

              <motion.a
                href="/projects"
                className="px-6 py-3 bg-transparent hover:bg-secondary border border-gray-700 hover:border-gray-600 rounded-md font-medium transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                See Proof
              </motion.a>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Typical builds: lead capture → CRM → email/SMS follow-up → booking → reporting dashboards.
            </p>
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
                {/* Replace with your real image for credibility */}
                <img
                  src="/assets/profile/profile-image.jpg"
                  alt="Jeffery Addae"
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
