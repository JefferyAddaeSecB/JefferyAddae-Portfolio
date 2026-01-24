import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Contact = () => {
  const [typeformLoaded, setTypeformLoaded] = useState(false);

  useEffect(() => {
    // Polyfill for crypto.randomUUID if not available
    if (!crypto.randomUUID) {
      crypto.randomUUID = function() {
        const hex = "0123456789abcdef";
        let result = "";
        for (let i = 0; i < 36; i++) {
          if (i === 8 || i === 13 || i === 18 || i === 23) {
            result += "-";
          } else if (i === 14) {
            result += "4";
          } else if (i === 19) {
            result += hex[(Math.random() * 4 | 0 | 0x8)];
          } else {
            result += hex[Math.random() * 16 | 0];
          }
        }
        return result as `${string}-${string}-${string}-${string}-${string}`;
      };
    }

    // Load Calendly script
    const calendlyScript = document.createElement("script");
    calendlyScript.src = "https://assets.calendly.com/assets/external/widget.js";
    calendlyScript.async = true;
    document.body.appendChild(calendlyScript);

    // Load Typeform script
    const typeformScript = document.createElement("script");
    typeformScript.src = "https://embed.typeform.com/embed.js";
    typeformScript.async = true;
    typeformScript.onload = () => setTypeformLoaded(true);
    document.body.appendChild(typeformScript);

    return () => {
      // Cleanup
      if (document.body.contains(calendlyScript)) {
        document.body.removeChild(calendlyScript);
      }
      if (document.body.contains(typeformScript)) {
        document.body.removeChild(typeformScript);
      }
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-20 sm:py-24 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">
          Automation ROI Audit (45 Minutes, Free)
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
          Pick a time that works for you. I'll walk you through where automation can save time, reduce cost, and unlock scale in your business.
        </p>
      </motion.div>

      {/* Calendly Inline Widget */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex justify-center"
      >
        <div
          className="calendly-inline-widget w-full md:w-4/5 lg:w-3/4"
          data-url="https://calendly.com/jeffaddai40/complimentary-strategy-call"
          style={{
            minWidth: "320px",
            height: "700px",
            maxWidth: "1000px",
          }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-center mt-12 mb-16"
      >
        <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-6">What We'll Actually Cover</h3>
        <div className="max-w-2xl mx-auto text-left">
          <p className="text-muted-foreground mb-6 text-base">In this call, we will:</p>
          <ul className="space-y-3 text-foreground/80">
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Identify your biggest workflow bottlenecks</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Map 1–3 automation opportunities with ROI potential</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Decide what should be automated now vs later</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Outline tools, timelines, and complexity</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">•</span>
              <span>Decide if it makes sense to work together</span>
            </li>
          </ul>
        </div>
        <p className="text-xs text-muted-foreground mt-6">
          No spam. No sales pressure. Just systems thinking.
        </p>
      </motion.div>

      {/* Who This Is Best For Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto mb-16 grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg sm:text-xl font-bold text-primary mb-4">Who This Is Best For</h3>
          <p className="text-muted-foreground mb-4 font-semibold">This is a good fit if you:</p>
          <ul className="space-y-3 text-foreground/80">
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">✓</span>
              <span>Run a service business, agency, or SaaS</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">✓</span>
              <span>Are wasting time on manual admin, follow-ups, or data entry</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">✓</span>
              <span>Use tools like Google Sheets, CRMs, Calendly, email, or forms</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">✓</span>
              <span>Want systems that scale — not duct-tape automation</span>
            </li>
          </ul>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg sm:text-xl font-bold text-primary mb-4">This May Not Be A Fit If</h3>
          <p className="text-muted-foreground mb-4 font-semibold">You're only looking for:</p>
          <ul className="space-y-3 text-foreground/80">
            <li className="flex items-start gap-3">
              <span className="text-muted-foreground font-bold">✗</span>
              <span>One-off Zapier zaps</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-muted-foreground font-bold">✗</span>
              <span>DIY tutorials</span>
            </li>
          </ul>
          <p className="text-xs text-muted-foreground mt-6">
            If that's your need, I'm happy to point you toward free resources instead.
          </p>
        </div>
      </motion.div>

      {/* Divider */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="my-20 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
      />

      {/* Typeform Section */}
      <motion.div
        id="form"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">
          Tell Me More About Your Needs
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
          Not ready to book a call? Fill out this quick form and I'll review your situation. No commitment needed.
        </p>
      </motion.div>

      {/* Typeform Embedded Widget */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex justify-center"
      >
        <div
          className="w-full md:w-4/5 lg:w-3/4"
          style={{
            maxWidth: "1000px",
            minHeight: "600px",
          }}
        >
          {typeformLoaded && (
            <iframe
              id="typeform-full"
              width="100%"
              height="600"
              frameBorder="0"
              allow="camera; microphone; autoplay; encrypted-media;"
              src="https://form.typeform.com/to/ogUFVbAO?typeform-medium=embed-snippet"
              style={{
                borderRadius: "8px",
                border: "1px solid var(--border)",
              }}
            />
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-center mt-12"
      >
        <p className="text-sm text-muted-foreground">
          I'll review your response and reach out within 24 hours with a personalized plan.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Your information is 100% confidential and will never be shared.
        </p>
      </motion.div>
    </div>
  );
};

export default Contact;
