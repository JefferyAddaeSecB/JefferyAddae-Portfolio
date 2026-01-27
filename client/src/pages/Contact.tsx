import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import ContactForm from "@/components/ContactForm";
import FAQAccordion from "@/components/FAQAccordion";

const Contact = () => {
  const [, params] = useLocation();
  const [activeTab, setActiveTab] = useState<"booking" | "message">("booking");

  // Set active tab based on URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab") as "booking" | "message" | null;
    if (tab === "message") {
      setActiveTab("message");
    } else {
      setActiveTab("booking");
    }
  }, [params]);

  const faqItems = [
    {
      title: "What we'll cover",
      content: (
        <ul className="space-y-2">
          <li className="flex gap-2">
            <span className="text-primary font-bold flex-shrink-0">•</span>
            <span>Identify your biggest workflow bottleneck</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-bold flex-shrink-0">•</span>
            <span>Spot 1–3 automation opportunities with clear ROI</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-bold flex-shrink-0">•</span>
            <span>Walk through tools and timelines</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-bold flex-shrink-0">•</span>
            <span>Leave with a recommended next step</span>
          </li>
        </ul>
      ),
    },
    {
      title: "Not a fit if",
      content: (
        <ul className="space-y-2">
          <li className="flex gap-2">
            <span className="text-muted-foreground font-bold flex-shrink-0">•</span>
            <span>You want one-off Zapier hacks</span>
          </li>
          <li className="flex gap-2">
            <span className="text-muted-foreground font-bold flex-shrink-0">•</span>
            <span>You're only looking for tutorials</span>
          </li>
          <li className="flex gap-2">
            <span className="text-muted-foreground font-bold flex-shrink-0">•</span>
            <span>Reliability doesn't matter long-term</span>
          </li>
        </ul>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Above the Fold */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-16 sm:py-20"
      >
        <div className="max-w-6xl mx-auto">
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-3 leading-tight">
            Free 45-Minute <span className="text-primary">Automation</span>{" "}
            <span className="text-primary">ROI Audit</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-muted-foreground mb-6">
            Book a call or send a message — I'll reply within 24 hours.
          </p>

          {/* 3 Bullets */}
          <ul className="space-y-2 mb-8 text-sm sm:text-base text-foreground/80">
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold flex-shrink-0">•</span>
              <span>Identify your biggest workflow bottleneck</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold flex-shrink-0">•</span>
              <span>Spot 1–3 automation opportunities with clear ROI</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold flex-shrink-0">•</span>
              <span>Leave with a recommended next step</span>
            </li>
          </ul>

          {/* CTA Buttons - Side by side on desktop, stacked on mobile */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => {
                setActiveTab("booking");
                setTimeout(() => {
                  const bookingSection = document.getElementById("booking");
                  bookingSection?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
            >
              Book ROI Audit
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setActiveTab("message");
                setTimeout(() => {
                  const messageSection = document.getElementById("message");
                  messageSection?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
            >
              Send a Message
            </Button>
          </div>

          {/* Micro Trust Line */}
          <p className="text-xs sm:text-sm text-muted-foreground">
            No spam. No pressure. If there's no ROI, I'll tell you.
          </p>
        </div>
      </motion.div>

      {/* Divider */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
      />

      {/* Main Content - Below the Fold */}
      <div className="container mx-auto px-4 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-12 border-b border-border">
            <button
              onClick={() => setActiveTab("booking")}
              className={`pb-3 px-2 text-sm font-medium transition-colors ${
                activeTab === "booking"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Book the ROI Audit
            </button>
            <button
              onClick={() => setActiveTab("message")}
              className={`pb-3 px-2 text-sm font-medium transition-colors ${
                activeTab === "message"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Send a Message
            </button>
          </div>

          {/* Booking Section */}
          <div className={activeTab === "booking" ? "block" : "hidden"}>
            <motion.div
              id="booking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-16"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Book the ROI Audit
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Timezone shown automatically. Pick a time that works for you.
              </p>

              {/* Calendly Embed - Responsive */}
              <iframe
                title="Schedule an ROI audit"
                src="https://calendly.com/jeffaddai40/complimentary-strategy-call?hide_event_type_details=1&hide_gdpr_banner=1"
                className="w-full rounded-md border border-border bg-background"
                style={{ minWidth: "320px", height: "700px" }}
                loading="lazy"
              />
            </motion.div>
          </div>

          {/* Message Section */}
          <div className={activeTab === "message" ? "block" : "hidden"}>
            <motion.div
              id="message"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-16"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Send a Message
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Quick message? I'll respond within 24 hours.
              </p>

              <ContactForm />
            </motion.div>
          </div>

          {/* FAQ Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-16"
          >
            <h3 className="text-xl font-bold text-foreground mb-6">
              Questions?
            </h3>
            <FAQAccordion items={faqItems} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
