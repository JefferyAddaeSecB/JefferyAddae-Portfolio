import React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { FaCheckCircle, FaCog, FaChartLine } from "react-icons/fa";

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: 1,
      title: "Automation Audit",
      description: "I identify your biggest workflow bottlenecks, map out automation opportunities, and calculate potential ROI.",
      icon: FaChartLine,
      timeline: "30–45 minutes",
      details: [
        "Walk through your current processes",
        "Identify 2–3 high-impact automation candidates",
        "Estimate time/cost savings",
        "Determine feasibility and tooling needed",
        "You leave with: workflow map + top 3 automation opportunities ranked by ROI + rollout plan"
      ]
    },
    {
      number: 2,
      title: "Design & Build",
      description: "I design the automation system, set up integrations, and deploy it in n8n with proper error handling and logging.",
      icon: FaCog,
      timeline: "1–3 weeks",
      details: [
        "Design workflow map & process flow",
        "Set up integrations (CRM, email, forms, Slack, etc.)",
        "Build automation logic in n8n with error handling",
        "Add retry logic, logging, and monitoring",
        "Create comprehensive documentation and runbooks"
      ]
    },
    {
      number: 3,
      title: "Deploy & Iterate",
      description: "I deploy the system, train your team, monitor performance, and continuously optimize based on real-world data.",
      icon: FaCheckCircle,
      timeline: "Ongoing",
      details: [
        "Deploy to production environment",
        "Train your team on system usage",
        "Set up monitoring, alerts, and execution logs",
        "Weekly check-ins and performance reviews",
        "Iterate based on real usage data and feedback"
      ]
    }
  ];

  const deliverables = [
    "Workflow map + architecture diagram",
    "Integrations set up (CRM, email, forms, Slack, etc.)",
    "Execution logs + monitoring dashboard",
    "Written documentation + runbooks",
    "Production n8n automation system (tested)",
    "Error handling + retry logic + alerts",
    "Loom walkthrough (handoff video)",
    "Team training + support window (14–30 days)"
  ];

  const timelines = [
    {
      scope: "Single High-Impact Workflow",
      time: "3–7 days",
      example: "Lead intake automation + follow-up sequence"
    },
    {
      scope: "Full System Rollout (2–3 workflows)",
      time: "2–4 weeks",
      example: "Lead ops + internal request routing + reporting"
    },
    {
      scope: "Complex Multi-System Integration",
      time: "4–8 weeks",
      example: "Full CRM sync + AI support + reporting + internal ops"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient effects */}
      <div className="bg-gradient-1 absolute w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] -top-10 sm:-top-20 -left-10 sm:-left-20 opacity-20 z-0"></div>
      <div className="bg-gradient-2 absolute w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] -bottom-10 sm:-bottom-20 -right-10 sm:-right-20 opacity-20 z-0"></div>

      <div className="container mx-auto px-4 py-16 sm:py-20 md:py-24 relative z-10">
        
        {/* HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 sm:mb-20"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6">
            How I Build <span className="text-primary">Automation</span> That Actually Sticks
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            From audit to deployment, a proven process that turns manual work into scalable systems.
          </p>
        </motion.div>

        {/* 3-STEP PROCESS */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((step, idx) => {
              const IconComponent = step.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="relative"
                >
                  {/* Connector line (hidden on mobile, visible on desktop) */}
                  {idx < steps.length - 1 && (
                    <div className="hidden md:block absolute top-20 left-[60%] w-[40%] h-1 bg-gradient-to-r from-primary/50 to-transparent"></div>
                  )}

                  <div className="bg-card/50 border border-border rounded-xl p-6 sm:p-8 h-full hover:border-primary/50 transition-colors">
                    {/* Step Number */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-primary/15 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">{step.number}</span>
                      </div>
                      <IconComponent className="text-primary text-2xl" />
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-base mb-4">
                      {step.description}
                    </p>

                    {/* Timeline badge */}
                    <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
                      {step.timeline}
                    </div>

                    {/* Details list */}
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIdx) => (
                        <li key={detailIdx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-primary mt-1">•</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* WHAT THIS LOOKS LIKE IN REAL LIFE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-16 sm:mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              What This Looks Like in Real Life
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A few common automation flows I build for service businesses and SaaS teams.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card/50 border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
              <h3 className="text-lg font-semibold text-foreground mb-3">Lead Intake Flow</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>Lead Intake → Auto-qualify</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>CRM Update → Booked Call</span>
                </div>
              </div>
            </div>
            <div className="bg-card/50 border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
              <h3 className="text-lg font-semibold text-foreground mb-3">Support Requests</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>Support Requests → AI Triage</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>Assign Owner → Follow-up SLA Reminders</span>
                </div>
              </div>
            </div>
            <div className="bg-card/50 border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
              <h3 className="text-lg font-semibold text-foreground mb-3">Ops Reporting</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>Ops Reporting → Data Sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  <span>Weekly Dashboard → Slack Alerts</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* WHAT YOU GET */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-16 sm:mb-20"
        >
          <div className="bg-card border border-border rounded-xl p-8 sm:p-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">
              What You Get
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {deliverables.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + idx * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-primary flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span className="text-foreground text-sm sm:text-base">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* TYPICAL TIMELINES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mb-16 sm:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-8 text-center">
            Typical Timelines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {timelines.map((timeline, idx) => (
              <div key={idx} className="bg-card/50 border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {timeline.scope}
                </h3>
                <p className="text-2xl font-bold text-primary mb-4">
                  {timeline.time}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Example:</span> {timeline.example}
                </p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6 max-w-2xl mx-auto">
            Exact timelines depend on integrations, data quality, and approval speed.
          </p>
        </motion.div>

        {/* CTA SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to automate?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Start with a free Automation ROI Audit. No commitment, no sales pitch—just a clear picture of what's possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact?tab=booking">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 sm:px-8 py-3 rounded-lg bg-primary text-white font-semibold hover:opacity-90 transition-all"
              >
                Get ROI Audit
              </motion.button>
            </Link>
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 sm:px-8 py-3 rounded-lg border border-border bg-card text-foreground font-semibold hover:border-primary/50 transition-all"
              >
                Book a Call
              </motion.button>
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default HowItWorks;
