import React from 'react';
import { motion } from "framer-motion";
import { SERVICES } from "@/lib/constants";
import { fadeIn, staggerContainer } from "@/lib/animations";

interface Service {
  title: string;
  description: string;
  features: string[];
  color?: string;
  icon?: string;
}

const Services: React.FC = () => {
  return (
    <section id="services" className="py-20 bg-secondary">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeIn()}
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">MODERN WEB & SOFTWARE DEVELOPMENT SERVICES</h2>
          <div className="w-20 h-1 ghana-gradient mx-auto mb-6"></div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Comprehensive web and software development solutions tailored to your specific needs, from concept to deployment and beyond.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
        >
          {SERVICES.map((service: Service, index: number) => (
            <motion.div 
              key={index}
              className={`bg-background rounded-xl p-8 border border-gray-800 hover:border-primary transition-all hover:-translate-y-1 duration-300`}
              variants={fadeIn(0.1 * index)}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <i className={`${service.icon || 'ri-code-line'} text-2xl text-primary`}></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{service.title}</h3>
              <p className="text-gray-400 mb-4">
                {service.description}
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                {service.features.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start">
                    <i className="ri-check-line text-primary mt-1 mr-2"></i>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
