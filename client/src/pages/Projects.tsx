import { motion } from "framer-motion";
import { Link } from "wouter";
import { useMemo, useState } from "react";
import { FaCode, FaGithub, FaPlayCircle } from "react-icons/fa";
import {
  USE_CASES,
  USE_CASE_CATEGORIES,
  type UseCaseCategory
} from "@/lib/useCases";

type FilterCategory = "All" | UseCaseCategory;

const badgeClasses: Record<UseCaseCategory, string> = {
  "Revenue Ops": "bg-emerald-500/15 text-emerald-400",
  "Lead Automation": "bg-primary/15 text-primary",
  "Internal Ops": "bg-sky-500/15 text-sky-400",
  "AI Assistant": "bg-violet-500/15 text-violet-400",
  "Backend Automation": "bg-amber-500/15 text-amber-400",
  "Client Intake System": "bg-rose-500/15 text-rose-400"
};

const Projects = () => {
  const [filter, setFilter] = useState<FilterCategory>("All");
  const [activeUseCaseSlug, setActiveUseCaseSlug] = useState(USE_CASES[0].slug);

  const filteredCases = useMemo(() => {
    if (filter === "All") return USE_CASES;
    return USE_CASES.filter((useCase) => useCase.category === filter);
  }, [filter]);

  const activeUseCase = useMemo(
    () => USE_CASES.find((useCase) => useCase.slug === activeUseCaseSlug) || USE_CASES[0],
    [activeUseCaseSlug]
  );

  return (
    <div className="relative min-h-screen bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="bg-gradient-1 absolute w-[600px] h-[600px] top-0 right-0 opacity-10" />
        <div className="bg-gradient-2 absolute w-[500px] h-[500px] bottom-0 left-0 opacity-10" />
      </div>

      <section className="flex items-center justify-center relative z-10 px-4 sm:px-6 py-16 sm:py-20">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
              Deep-Dive <span className="text-primary">Automation</span> Case Studies
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg max-w-3xl mx-auto">
              Production-grade n8n systems with architecture notes, workflow JSON, source links,
              and live technical walkthroughs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
              <Link href="/contact?tab=booking">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Book Automation ROI Audit
                </motion.button>
              </Link>
              <a href="#use-case-catalog">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-card border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-all duration-300"
                >
                  View Use Cases
                </motion.button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 pb-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12"
        >
          {USE_CASE_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                filter === category
                  ? "bg-primary text-white"
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        <section id="use-case-catalog" className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {filteredCases.map((useCase, index) => (
            <motion.article
              key={useCase.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-border"
            >
              <div className="relative w-full h-52 overflow-hidden">
                <img
                  src={useCase.image}
                  alt={useCase.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClasses[useCase.category]}`}
                  >
                    {useCase.category}
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">{useCase.title}</h3>
                  <p className="text-muted-foreground text-sm mb-2">Best for: {useCase.bestFor}</p>
                  <p className="text-sm text-foreground/90">{useCase.summary}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400">
                    AI-Assisted
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-500/15 text-sky-400">
                    Deterministic Fallback
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400">
                    n8n Import-Tested
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {useCase.metrics.map((metric) => (
                    <div key={metric.label} className="rounded-lg border border-border bg-background/40 p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{metric.label}</p>
                      <p className="text-sm font-bold text-foreground mt-1">{metric.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {useCase.technologies.map((tech) => (
                    <span key={tech} className="px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Link href={`/projects/${useCase.slug}`}>
                    <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:opacity-90 transition-all cursor-pointer">
                      View System
                    </span>
                  </Link>
                  <a
                    href={useCase.demoUrl}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-card border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all"
                  >
                    <FaPlayCircle />
                    <span>Live Demo</span>
                  </a>
                  <a
                    href={useCase.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-foreground font-semibold hover:bg-background transition-all"
                  >
                    <FaGithub />
                    <span>Source Repo</span>
                  </a>
                  <a
                    href={useCase.workflowJsonPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-foreground font-semibold hover:bg-background transition-all"
                  >
                    <FaCode />
                    <span>n8n JSON</span>
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </section>

        <section className="mt-16 sm:mt-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Technical Pattern Deep Dive
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
              Pick a use case below to inspect architecture decisions, reliability controls,
              and source file references.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {USE_CASES.map((useCase) => {
              const isActive = useCase.slug === activeUseCaseSlug;
              return (
                <button
                  key={useCase.slug}
                  onClick={() => setActiveUseCaseSlug(useCase.slug)}
                  className={`text-left bg-card border rounded-xl p-5 transition-all ${
                    isActive
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <p className={`font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>
                    {useCase.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">{useCase.oneLiner}</p>
                </button>
              );
            })}
          </div>

          <motion.div
            key={activeUseCase.slug}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-10 bg-card border border-border rounded-2xl p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClasses[activeUseCase.category]}`}>
                {activeUseCase.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-primary/10 text-primary">
                Production-Ready Pattern
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/15 text-emerald-400">
                AI-Assisted
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-sky-500/15 text-sky-400">
                Deterministic Fallback
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-amber-500/15 text-amber-400">
                n8n Import-Tested
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{activeUseCase.title}</h3>
            <p className="text-muted-foreground text-lg">{activeUseCase.oneLiner}</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-2">Problem</h4>
                <p className="text-muted-foreground mb-5">{activeUseCase.problem}</p>
                <h4 className="text-lg font-semibold text-foreground mb-2">System Built</h4>
                <p className="text-muted-foreground">{activeUseCase.systemBuilt}</p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-foreground mb-2">Workflow Steps</h4>
                <ul className="space-y-2 text-muted-foreground">
                  {activeUseCase.workflowSteps.map((step) => (
                    <li key={step} className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="text-lg font-semibold text-foreground mb-2">Reliability Controls</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {activeUseCase.reliabilityControls.map((control) => (
                  <div key={control} className="rounded-lg border border-border bg-background/40 px-3 py-2 text-sm text-muted-foreground">
                    {control}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h4 className="text-lg font-semibold text-foreground mb-2">Outcome</h4>
              <p className="text-muted-foreground">{activeUseCase.outcome}</p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={activeUseCase.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-card border border-border text-foreground font-semibold hover:bg-background transition-all"
              >
                <FaGithub />
                <span>Open Repo</span>
              </a>
              <a
                href={activeUseCase.workflowJsonPath}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-card border border-border text-foreground font-semibold hover:bg-background transition-all"
              >
                <FaCode />
                <span>View Workflow JSON</span>
              </a>
              <Link href={`/projects/${activeUseCase.slug}`}>
                <span className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-all cursor-pointer">
                  Open Full Case Study
                </span>
              </Link>
            </div>
          </motion.div>
        </section>

        <section className="mt-16 sm:mt-20">
          <div className="bg-gradient-to-br from-primary/90 to-blue-600 rounded-3xl p-10 md:p-14 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/10" />
            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Want One of These Systems for Your Business?
              </h2>
              <p className="text-lg md:text-xl mb-8 opacity-95 max-w-3xl mx-auto">
                Get a focused ROI audit and implementation roadmap tailored to your workflow stack.
              </p>
              <Link href="/contact?tab=booking">
                <span className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all cursor-pointer">
                  Book a Free Automation ROI Audit
                </span>
              </Link>
              <p className="text-sm opacity-90 mt-4">No fluff. Clear technical roadmap.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Projects;
