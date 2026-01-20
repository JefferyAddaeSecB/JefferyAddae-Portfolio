import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Contact = () => {
  const [typeformLoaded, setTypeformLoaded] = useState(false);

  useEffect(() => {
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
          Book Your Free 45-Minute Strategy Call
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
          Pick a time that works for you. I'll walk you through automation opportunities specific to your business.
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
        className="text-center mt-12"
      >
        <p className="text-sm text-muted-foreground">
          In 45 minutes, I'll map your automation opportunities + next steps.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          No spam. No sales pressure. Just systems thinking.
        </p>
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
