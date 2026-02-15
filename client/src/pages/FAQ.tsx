import { motion } from "framer-motion";
import { Link } from "wouter";
import FAQAccordion from "@/components/FAQAccordion";
import { Button } from "@/components/ui/button";

const faqItems = [
  {
    title: "Who is this for?",
    content:
      "This is best for service businesses, agencies, and SaaS teams with repetitive workflows in lead ops, follow-ups, reporting, and internal handoffs."
  },
  {
    title: "What results can we expect?",
    content:
      "Most clients eliminate 5-15 hours per week of manual work within the first automation. Exact ROI depends on workflow complexity, data quality, and current inefficiencies."
  },
  {
    title: "What happens in the free ROI Audit?",
    content:
      "We review your current workflows, identify bottlenecks, estimate potential ROI, and leave you with a ranked action plan for what to automate first."
  },
  {
    title: "How do you identify high-ROI workflows?",
    content:
      "I audit lead intake, follow-ups, reporting, and internal ops to find repetitive, high-friction processes that cost time or revenue. Workflows are prioritized by impact, feasibility, and speed to value."
  },
  {
    title: "How long does implementation take?",
    content: (
      <ul className="space-y-2">
        <li>
          <strong>Audit:</strong> 30-45 minutes
        </li>
        <li>
          <strong>Architecture:</strong> 1-3 days
        </li>
        <li>
          <strong>Build:</strong> 3-10 days
        </li>
        <li>
          <strong>Testing:</strong> 2-5 days
        </li>
        <li>
          <strong>Deployment:</strong> 1-2 days
        </li>
      </ul>
    )
  },
  {
    title: "Which tools can you integrate?",
    content:
      "Common integrations include CRMs, Calendly, Stripe, webhooks, email tools, internal tools, and custom APIs. If your systems support APIs or webhooks, they can usually be connected."
  },
  {
    title: "What if we already use Zapier or Make?",
    content:
      "That is common. I often refactor fragile automations into more scalable systems with better observability, error handling, and ownership so they hold up in production."
  },
  {
    title: "What does production-ready mean?",
    content:
      "Production-ready means logging, monitoring, alerts, retry logic, error handling, documentation, and clear ownership so the system is reliable in real operations."
  },
  {
    title: "How is pricing structured?",
    content: (
      <ul className="space-y-2">
        <li>
          <strong>Project-based</strong> for defined scope and fixed deliverables
        </li>
        <li>
          <strong>Retainer</strong> for ongoing refinement and optimization
        </li>
        <li>
          Pricing depends on system complexity and risk, not just the number of automations
        </li>
      </ul>
    )
  },
  {
    title: "Do we own the system?",
    content:
      "Yes. You get full ownership, including workflow access, credentials, and documentation. No lock-in."
  },
  {
    title: "What if something breaks?",
    content:
      "Systems include monitoring alerts and recovery paths. For ongoing partnerships, issues are tracked through regular check-ins and continuous hardening."
  },
  {
    title: "Can you work with our team?",
    content:
      "Yes. I work with your existing team and process owners so automation fits how your business already operates."
  },
  {
    title: "Is this ongoing or one-off?",
    content:
      "Both are available. You can start with a one-off build and move into ongoing optimization as needs evolve."
  },
  {
    title: "When is this not a good fit?",
    content: (
      <ul className="space-y-2">
        <li>Cheap one-off zaps with no reliability requirements</li>
        <li>DIY tutorial-style help only</li>
        <li>Set-and-forget expectations with no maintenance plan</li>
      </ul>
    )
  },
  {
    title: "How do we get started?",
    content: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>ROI Audit</li>
        <li>System Design</li>
        <li>Build + Test</li>
        <li>Optimize</li>
      </ol>
    )
  }
];

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-16 sm:py-20"
      >
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
            FAQ
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">
            Frequently Asked <span className="text-primary">Questions</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Straight answers on scope, timelines, pricing, and how automation work
            is delivered.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/contact?tab=booking">
              <Button size="lg">Book Free ROI Audit</Button>
            </Link>
            <Link href="/contact?tab=message">
              <Button size="lg" variant="outline">
                Ask a Question
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>

      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
      />

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-14 sm:py-16"
      >
        <div className="max-w-4xl mx-auto">
          <FAQAccordion items={faqItems} />

          <div className="mt-10 rounded-xl border border-border bg-card p-6 sm:p-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Need a specific answer?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-5">
              Send your question directly and get a personal reply within 24 hours.
            </p>
            <Link href="/contact?tab=message">
              <Button>Send a Message</Button>
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default FAQ;
