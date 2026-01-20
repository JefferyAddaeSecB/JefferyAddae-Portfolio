import { motion } from "framer-motion";
import { useEffect } from "react";

const Contact = () => {
  useEffect(() => {
    // Load Calendly script
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
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
          className="calendly-inline-widget"
          data-url="https://calendly.com/jeffaddai40/complimentary-strategy-call"
          style={{
            minWidth: "320px",
            height: "700px",
            maxWidth: "100%",
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
    </div>
  );
};

export default Contact;
