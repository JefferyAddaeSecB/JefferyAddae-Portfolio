import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TESTIMONIALS } from '@/lib/constants';

const TestimonialsSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 8000); // Change slide every 8 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto py-12">
      <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4 text-center">
        Early Results & Founder Feedback
      </h2>
      <p className="text-xs text-muted-foreground text-center mb-8">
        Typical workflows automated: Lead intake • CRM sync • Follow-ups • Reporting • Internal ops • AI assistants
      </p>
      
      <div className="relative h-[300px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <div className="flex flex-col items-center justify-center text-center px-4">
              <div className="w-20 h-20 rounded-full overflow-hidden mb-4">
              <img
                src={TESTIMONIALS[currentIndex].avatar}
                alt={TESTIMONIALS[currentIndex].name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {TESTIMONIALS[currentIndex].name}
              </h3>
              <p className="text-primary mb-6">{TESTIMONIALS[currentIndex].title}</p>
              <p className="text-muted-foreground max-w-2xl italic">
                "{TESTIMONIALS[currentIndex].quote}"
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-2 mt-6">
        {TESTIMONIALS.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              index === currentIndex ? 'bg-primary' : 'bg-primary/30'
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>

    </div>
  );
};

export default TestimonialsSlider; 
