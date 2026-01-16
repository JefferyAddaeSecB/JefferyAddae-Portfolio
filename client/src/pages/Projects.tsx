import { motion } from "framer-motion";
import { PROJECTS } from "../lib/constants";
import { FaGithub } from "react-icons/fa";
import { useState, useEffect } from "react";
import { Link } from "wouter";

type ProjectCategory =
  | "All"
  | "Revenue Ops"
  | "Lead Automation"
  | "Internal Ops"
  | "AI Assistant"
  | "Backend Automation"
  | "Client Intake System";

const Projects = () => {
  const [filter, setFilter] = useState<ProjectCategory>("All");
  const [filteredProjects, setFilteredProjects] = useState(PROJECTS);

  useEffect(() => {
    if (filter === "All") {
      setFilteredProjects(PROJECTS);
    } else {
      setFilteredProjects(PROJECTS.filter(project => project.category === filter));
    }
  }, [filter]);

  const categories: ProjectCategory[] = [
    "All",
    "Revenue Ops",
    "Lead Automation",
    "Internal Ops",
    "AI Assistant",
    "Backend Automation",
    "Client Intake System",
  ];

  const badgeClasses: Record<Exclude<ProjectCategory, "All">, string> = {
    "Revenue Ops": "bg-emerald-500/15 text-emerald-400",
    "Lead Automation": "bg-primary/15 text-primary",
    "Internal Ops": "bg-sky-500/15 text-sky-400",
    "AI Assistant": "bg-violet-500/15 text-violet-400",
    "Backend Automation": "bg-amber-500/15 text-amber-500",
    "Client Intake System": "bg-rose-500/15 text-rose-400",
  };

  const patterns = [
    { title: "Lead Intake & Qualification", slug: "lead-intake-qualification-system" },
    { title: "CRM Sync & Enrichment", slug: "revenue-ops-crm-enrichment" },
    { title: "AI Email Follow-Ups", slug: "ai-support-assistant-triage" },
    { title: "Internal Ops Automation", slug: "internal-ops-request-routing" },
    { title: "Reporting & Dashboards", slug: "automated-reporting-dashboards" },
    { title: "AI Assistants for Support & Ops", slug: "ai-support-assistant-triage" },
  ];

  return (
    <div className="min-h-screen bg-background py-20 px-4 sm:px-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Real Automation Systems That Save Time & Scale Businesses
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-3xl mx-auto">
            These are production-ready systems I’ve built to automate lead intake, internal operations, reporting, and
            customer workflows — the same patterns I deploy for clients.
          </p>
          <p className="text-muted-foreground text-sm mt-3">
            Each project is a reusable automation framework — the same systems I deploy for paying clients.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
            <a
              href="/contact"
              className="px-6 py-3 rounded-xl bg-primary text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Book a Free 45-minute Strategy Call
            </a>
            <a
              href="#use-cases"
              className="px-6 py-3 rounded-xl bg-card border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all duration-300"
            >
              View Automation Use Cases
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12"
        >
          {categories.map((category) => (
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              id={`project-${project.slug}`}
              className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-border"
            >
              <div className="relative w-full h-48 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClasses[project.category as Exclude<ProjectCategory, "All">]}`}
                  >
                    {project.category}
                  </span>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {project.problem}
                  </p>
                </div>

                <ul className="space-y-2 text-sm text-muted-foreground">
                  {project.bullets.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 border-l-4 border-l-primary">
                  <p className="text-sm text-primary">
                    <span className="font-semibold">Automation Pattern:</span> {project.automationPattern}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground">
                  {project.techStack.join(" · ")}
                </p>

                <div className="text-xs text-muted-foreground space-y-1">
                  {project.bestFor ? (
                    <p>
                      <span className="font-semibold text-foreground">Best for:</span> {project.bestFor}
                    </p>
                  ) : null}
                  {project.outcome ? (
                    <p>
                      <span className="font-semibold text-foreground">Outcome:</span> {project.outcome}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href={`/projects/${project.slug}`}>
                    <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:opacity-90 transition-all cursor-pointer">
                      View Case Study
                    </span>
                  </Link>
                  {project.link ? (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-card border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all"
                    >
                      {project.linkLabel || "Live Demo"}
                    </a>
                  ) : (
                    <Link href={`/projects/${project.slug}#system-flow`}>
                      <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-card border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all cursor-pointer">
                        {project.linkLabel || "View System Flow"}
                      </span>
                    </Link>
                  )}
                </div>

                {project.github ? (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
                  >
                    <FaGithub className="text-sm" />
                    <span>Code</span>
                  </a>
                ) : null}
              </div>
            </motion.div>
          ))}
        </div>

        <section id="use-cases" className="mt-16 sm:mt-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Automation Patterns I Build for Clients
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
              These are repeatable systems I deploy to remove manual work and keep operations moving.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {patterns.map((pattern) => (
              <a
                key={pattern.title}
                href={`#project-${pattern.slug}`}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-foreground font-semibold">{pattern.title}</h3>
                  <span className="text-primary text-sm">View</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-16 sm:mt-20">
          <div className="bg-gradient-to-br from-primary/90 to-blue-600 rounded-3xl p-10 md:p-14 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/10" />
            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Want These Systems Built for Your Business?
              </h2>
              <p className="text-lg md:text-xl mb-8 opacity-95 max-w-3xl mx-auto">
                I’ll identify one high-friction workflow and show you exactly how to automate it — no obligation.
              </p>
              <Link href="/contact">
                <span className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all cursor-pointer">
                  Book Free 45-minute Strategy Call
                </span>
              </Link>
              <p className="text-sm opacity-90 mt-4">
                No sales pitch. Just systems thinking.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Projects;
