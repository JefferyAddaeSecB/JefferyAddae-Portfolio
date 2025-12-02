import { motion } from "framer-motion";
import { TESTIMONIALS } from "@/lib/constants";
import { fadeIn, staggerContainer } from "@/lib/animations";

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 bg-secondary">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeIn()}
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">CLIENT SAYS</h2>
          <div className="w-20 h-1 ghana-gradient mx-auto mb-6"></div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Don't just take my word for it - hear what my clients have to say about working with me.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid md:grid-cols-2 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
        >
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div 
              key={index}
              className="bg-background rounded-xl p-8 border border-gray-800 relative"
              variants={fadeIn(0.1 * index)}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <div className="text-[hsl(var(--ghana-yellow))] text-4xl absolute -top-4 -left-2">❝</div>
              <div className="relative z-10">
                <p className="text-gray-400 mb-6 italic">
                  "{testimonial.quote}"
                </p>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={`${testimonial.name} avatar`} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <div className="font-medium text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.title}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
