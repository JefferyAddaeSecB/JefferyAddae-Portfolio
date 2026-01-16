import React from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations";

const PACKAGES = [
  {
    title: "Strategy Call",
    price: "Free (45 min)",
    description: "In 45 minutes, I’ll map your automation opportunities + next steps.",
    features: ["Workflow map + quick wins", "Tool stack review", "Automation plan + next steps"],
    cta: "Book a Call",
    href: "#contact",
    icon: "ri-search-eye-line",
  },
  {
    title: "Build Sprint",
    price: "From $1,500",
    description: "A complete automation built in n8n with integrations, testing, and documentation.",
    features: ["n8n workflow build", "Integrations (CRM, email, sheets, etc.)", "Error handling + logging", "Documentation + handover"],
    cta: "Start a Sprint",
    href: "#contact",
    icon: "ri-flashlight-line",
  },
  {
    title: "Optimization Retainer",
    price: "From $500/mo",
    description: "Ongoing monitoring, improvements, and new automations as your business grows.",
    features: ["Monthly improvements", "Fixes + monitoring", "New automation requests", "Performance reporting"],
    cta: "Get Support",
    href: "#contact",
    icon: "ri-settings-3-line",
  },
];

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
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            AI AUTOMATION + FULL-STACK SERVICES
          </h2>
          <div className="w-20 h-1 ghana-gradient mx-auto mb-6"></div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Productized offers built to deliver ROI fast: automate your workflows, capture more leads, and reduce manual work.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
        >
          {PACKAGES.map((pkg, index) => (
            <motion.div
              key={pkg.title}
              className="bg-background rounded-xl p-8 border border-gray-800 hover:border-primary transition-all hover:-translate-y-1 duration-300"
              variants={fadeIn(0.1 * index)}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                <i className={`${pkg.icon} text-2xl text-primary`}></i>
              </div>

              <div className="flex items-baseline justify-between gap-3 mb-2">
                <h3 className="text-xl font-semibold text-white">{pkg.title}</h3>
                <span className="text-sm text-gray-300 bg-secondary border border-border px-2 py-1 rounded-md">
                  {pkg.price}
                </span>
              </div>

              <p className="text-gray-400 mb-5">{pkg.description}</p>

              <ul className="space-y-2 text-sm text-gray-400 mb-6">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <i className="ri-check-line text-primary mt-1 mr-2"></i>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={pkg.href}
                className="inline-flex items-center justify-center w-full px-5 py-3 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
              >
                {pkg.cta}
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
