import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { FaCode, FaExternalLinkAlt, FaGithub } from "react-icons/fa";
import { USE_CASES } from "@/lib/useCases";

const ProjectCaseStudy = () => {
  const [match, params] = useRoute("/projects/:slug");

  if (!match) {
    return null;
  }

  const useCase = USE_CASES.find((item) => item.slug === params?.slug);

  if (!useCase) {
    return (
      <div className="min-h-screen bg-background py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Case Study Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This case study is not available yet. Go back to the catalog and open another system.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/projects">
              <span className="px-6 py-3 rounded-xl bg-card border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all cursor-pointer">
                Back to Case Studies
              </span>
            </Link>
            <Link href="/contact?tab=booking">
              <span className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-all cursor-pointer">
                Book Free ROI Audit
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16 sm:py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <Link href="/projects">
            <span className="text-sm text-primary font-semibold hover:underline cursor-pointer">
              ← Back to Case Studies
            </span>
          </Link>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-1 text-sm">
            {useCase.category}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400">
              AI-Assisted
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-400">
              Deterministic Fallback
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400">
              n8n Import-Tested
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mt-4">
            {useCase.title}
          </h1>
          <p className="text-muted-foreground mt-4 text-base sm:text-lg">{useCase.summary}</p>
        </motion.div>

        <div className="mb-10 overflow-hidden rounded-2xl border border-border">
          <img src={useCase.image} alt={useCase.title} className="w-full h-64 sm:h-80 object-cover" />
        </div>

        <div className="grid grid-cols-1 gap-8">
          <section className="bg-card/50 border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-3">Problem</h2>
            <p className="text-muted-foreground">{useCase.problem}</p>
          </section>

          <section className="bg-card/50 border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-3">System Built</h2>
            <p className="text-muted-foreground">{useCase.systemBuilt}</p>
          </section>

          <section id="system-flow" className="bg-card/50 border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-3">Workflow Architecture</h2>
            <ul className="space-y-2 text-muted-foreground">
              {useCase.workflowSteps.map((step) => (
                <li key={step} className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-card/50 border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-3">Production Reliability Controls</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {useCase.reliabilityControls.map((control) => (
                <div
                  key={control}
                  className="rounded-lg border border-border bg-background/40 px-3 py-2 text-sm text-muted-foreground"
                >
                  {control}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-card/50 border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-3">Outcome</h2>
            <p className="text-muted-foreground">{useCase.outcome}</p>
          </section>

          <section className="bg-card/50 border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-3">Tooling & Integrations</h2>
            <div className="mb-4">
              <p className="text-sm font-semibold text-foreground mb-2">Core Stack</p>
              <div className="flex flex-wrap gap-2">
                {useCase.technologies.map((tech) => (
                  <span key={tech} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Connected Systems</p>
              <div className="flex flex-wrap gap-2">
                {useCase.integrations.map((integration) => (
                  <span
                    key={integration}
                    className="px-3 py-1 rounded-full bg-background border border-border text-muted-foreground text-sm"
                  >
                    {integration}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-card/50 border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-3">Measured Impact</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {useCase.metrics.map((metric) => (
                <div key={metric.label} className="rounded-lg border border-border bg-background/40 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{metric.label}</p>
                  <p className="text-base font-bold text-foreground mt-1">{metric.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{metric.note}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-card/50 border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-3">Source & Workflow Files</h2>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <a
                href={useCase.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-card border border-border text-foreground font-semibold hover:bg-background transition-all"
              >
                <FaGithub />
                <span>Open GitHub Repo</span>
                <FaExternalLinkAlt className="text-xs" />
              </a>

              <a
                href={useCase.workflowJsonPath}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-card border border-border text-foreground font-semibold hover:bg-background transition-all"
              >
                <FaCode />
                <span>Open n8n Workflow JSON</span>
                <FaExternalLinkAlt className="text-xs" />
              </a>
            </div>

            <div className="space-y-2">
              {useCase.sourceFiles.map((file) => (
                <a
                  key={file.label}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-border bg-background/40 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {file.label}
                </a>
              ))}
            </div>
          </section>

          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <a
              href={useCase.demoUrl}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-all"
            >
              View Live Demo
            </a>
            <Link href="/contact?tab=booking">
              <span className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-card border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-all cursor-pointer">
                Book a Free Automation ROI Audit
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCaseStudy;
