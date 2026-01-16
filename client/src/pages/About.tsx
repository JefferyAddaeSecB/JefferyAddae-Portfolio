import React, { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { CORE_SKILLS, BIO } from "@/lib/constants";

const TestimonialsSlider = lazy(() => import("@/components/TestimonialsSlider"));

const About: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16 sm:py-20 md:py-24 relative">
      {/* Background gradient effects */}
      <div className="bg-gradient-1 absolute w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] -top-10 sm:-top-20 -left-10 sm:-left-20 opacity-20 z-0"></div>
      <div className="bg-gradient-2 absolute w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] -bottom-10 sm:-bottom-20 -right-10 sm:-right-20 opacity-20 z-0"></div>

      {/* About Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12 sm:mb-16 relative z-10"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">
          Built to Eliminate Manual Work — Not Add More Software
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          I help service businesses and SaaS teams automate high-friction workflows so they save hours every week,
          reduce errors, and scale without hiring.
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16 relative z-10">
        {/* Profile Image */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative aspect-square rounded-lg overflow-hidden border-4 border-primary mb-4 md:mb-0"
        >
          <img
            src="/assets/profile/profile-image.jpg"
            alt="Jeffery Addae"
            className="w-full h-full object-cover bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20"
          />
        </motion.div>

        {/* About Content */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6"
        >
          <h2 className="text-2xl sm:text-2xl font-bold text-foreground">
            {BIO.tagline}
          </h2>

          <p className="text-muted-foreground text-sm sm:text-base">
            I work with growing businesses that are stuck doing repetitive manual work — lead intake, follow-ups,
            reporting, and internal operations — and turn those processes into automated systems that run quietly in
            the background.
          </p>
          <p className="text-muted-foreground text-sm sm:text-base">
            My focus isn’t automation for automation’s sake. It’s building reliable systems that actually save time,
            reduce operational drag, and deliver measurable ROI.
          </p>

          {/* What you do (ROI) */}
          <div className="bg-card/50 p-4 sm:p-6 rounded-lg border border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">What I help businesses do</h3>
            <div className="space-y-3">
              {[
                "Eliminate repetitive workflows across lead intake, follow-ups, and internal ops",
                "Centralize tools (CRM, forms, email, spreadsheets, databases) into one system",
                "Deploy AI-powered workflows that respond instantly and reduce support load",
                "Scale internal tools and platforms without increasing headcount",
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-primary"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <p className="text-muted-foreground text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* My Approach (keep your BIO.philosophy) */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-foreground">My Approach</h3>
            {BIO.philosophy.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <p className="text-muted-foreground text-sm">{item}</p>
              </div>
            ))}
          </div>

        </motion.div>

        <div className="md:col-span-2 bg-card/40 border border-border rounded-2xl p-6 sm:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6">
            <div className="bg-background/50 p-4 sm:p-5 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/10 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <h3 className="text-foreground font-bold text-sm sm:text-base">Experience</h3>
              </div>
              <p className="text-muted-foreground text-sm">2+ years building automation & production systems</p>
            </div>

            <div className="bg-background/50 p-4 sm:p-5 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/10 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <h3 className="text-foreground font-bold text-sm sm:text-base">Location</h3>
              </div>
              <p className="text-muted-foreground text-sm">Toronto, Ontario, Canada</p>
            </div>

            <div className="bg-background/50 p-4 sm:p-5 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/10 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                </div>
                <h3 className="text-foreground font-bold text-sm sm:text-base">Education</h3>
              </div>
              <p className="text-muted-foreground text-sm">Humber College — Computer Programming</p>
            </div>

            <div className="bg-background/50 p-4 sm:p-5 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/10 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                </div>
                <h3 className="text-foreground font-bold text-sm sm:text-base">Freelance</h3>
              </div>
              <p className="text-muted-foreground text-sm">Available</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Link href="/contact">
                <span className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-all cursor-pointer text-center">
                  Book a Free 45-minute Strategy Call
                </span>
              </Link>
              <Link href="/projects">
                <span className="px-6 py-3 rounded-xl bg-card border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all cursor-pointer text-center">
                  View Case Studies
                </span>
              </Link>
            </div>

            <div className="flex gap-4">
              <a
                href="https://github.com/JefferyAddaeSecB"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub Profile"
                className="text-foreground hover:text-primary transition-colors"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
              </a>
              <a
                href="https://www.linkedin.com/in/jeffery-addae-297214398/"
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn Profile"
                className="text-foreground hover:text-primary transition-colors"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <a
                href="mailto:jeffaddai40@gmail.com"
                title="Email"
                className="text-foreground hover:text-primary transition-colors"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Core Skills Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-12 sm:mb-16 relative z-10"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6 sm:mb-8 text-center">
          CAPABILITIES
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {CORE_SKILLS.map((skill, index) => (
            <div
              key={index}
              className="bg-card/50 p-4 sm:p-6 rounded-lg hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
            >
              <div className="flex flex-col gap-2">
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  {skill.name}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {skill.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Testimonials */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="relative z-10"
      >
        <Suspense
          fallback={
            <div className="text-center text-muted-foreground text-sm">
              Loading feedback…
            </div>
          }
        >
          <TestimonialsSlider />
        </Suspense>
      </motion.div>
    </div>
  );
};

export default About;
