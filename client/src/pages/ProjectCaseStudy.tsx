import { useRoute, Link } from "wouter";
import { PROJECTS } from "@/lib/constants";
import { motion } from "framer-motion";

const ProjectCaseStudy = () => {
  const [match, params] = useRoute("/projects/:slug");

  if (!match) {
    return null;
  }

  const project = PROJECTS.find((item) => item.slug === params?.slug);

  if (!project) {
    return (
      <div className="min-h-screen bg-background py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Case Study Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This case study doesn’t exist yet. Try another project or book an audit.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/projects">
              <span className="px-6 py-3 rounded-xl bg-card border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all cursor-pointer">
                Back to Projects
              </span>
            </Link>
            <Link href="/contact">
              <span className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-all cursor-pointer">
                Book Free 45-minute Strategy Call
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <Link href="/projects">
            <span className="text-sm text-primary font-semibold hover:underline cursor-pointer">
              ← Back to Automation Systems
            </span>
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-4">
            {project.title}
          </h1>
          <p className="text-muted-foreground mt-4 text-base sm:text-lg">
            {project.problem}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-1 text-sm">
            Automation Pattern: {project.automationPattern}
          </div>
        </motion.div>

        <div className="mb-10 overflow-hidden rounded-2xl border border-border">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-64 sm:h-80 object-cover"
          />
        </div>

        <div className="grid grid-cols-1 gap-8">
          <section className="bg-card/50 border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-3">Problem</h2>
            <p className="text-muted-foreground">{project.caseStudy.problem}</p>
          </section>

          <section className="bg-card/50 border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-3">Solution</h2>
            <p className="text-muted-foreground">{project.caseStudy.solution}</p>
          </section>

          <section id="system-flow" className="bg-card/50 border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-3">System Flow</h2>
            <div className="flex flex-wrap items-center gap-3">
              {project.caseStudy.systemFlow.map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <span className="px-4 py-2 rounded-full bg-background/60 border border-border text-sm text-foreground">
                    {step}
                  </span>
                  {index < project.caseStudy.systemFlow.length - 1 ? (
                    <span className="text-muted-foreground">→</span>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-card/50 border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-3">Impact (Designed To)</h2>
            <ul className="space-y-2 text-muted-foreground">
              {project.caseStudy.impact.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-card/50 border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-3">Where This Applies</h2>
            <div className="flex flex-wrap gap-2">
              {project.caseStudy.appliesTo.map((item) => (
                <span key={item} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                  {item}
                </span>
              ))}
            </div>
          </section>

          <section className="bg-gradient-to-br from-primary/90 to-blue-600 rounded-3xl p-8 sm:p-10 text-white text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Want this system customized for your business?
            </h2>
            <p className="text-base sm:text-lg mb-6 opacity-95">
              Book a Free 45-minute Strategy Call and I’ll map the fastest path to automate your workflow.
            </p>
            <Link href="/contact">
              <span className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-primary font-semibold shadow-lg hover:shadow-2xl transition-all cursor-pointer">
                Book Free 45-minute Strategy Call
              </span>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProjectCaseStudy;
