import { motion } from "framer-motion";
import { Link } from "wouter";
import CountUp from "@/components/CountUp";
import GlowingProfileImage from "@/components/GlowingProfileImage";

const Home = () => {
  return (
    <div className="relative min-h-screen">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="bg-gradient-1 absolute w-[600px] h-[600px] top-0 right-0 opacity-10"></div>
        <div className="bg-gradient-2 absolute w-[500px] h-[500px] bottom-0 left-0 opacity-10"></div>
      </div>

      {/* Hero Section - Full Screen */}
      <section className="min-h-screen flex items-center justify-center relative z-10 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-semibold"
              >
                👋 I help businesses eliminate time leaks with AI.
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
                <span className="text-primary">Automate</span> your operations with{" "}
                <span className="text-primary">AI</span> —{" "}
                <span className="text-primary">save hours</span> every week.
              </h1>

              <p className="text-lg text-muted-foreground mb-2 max-w-xl mx-auto lg:mx-0">
                I build n8n + AI workflows that remove manual work from
                lead intake, follow-ups, reporting, and internal ops.
              </p>

              <div className="flex flex-wrap items-center gap-2 mb-6 justify-center lg:justify-start">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">Best for</span>
                {["Agencies", "Service Businesses", "SaaS Teams"].map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 rounded-full bg-card border border-border text-sm text-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Link href="/contact">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Book Free 45-minute Strategy Call
                  </motion.button>
                </Link>
                <Link href="/projects">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-card border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-all duration-300"
                  >
                    See Proof
                  </motion.button>
                </Link>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                Fast setup • Measurable ROI • Scalable systems
              </p>

              {/* Quick Stats */}
              <div className="flex gap-8 justify-center lg:justify-start text-center">
                <div>
                  <div className="text-3xl font-bold text-primary">
                    <CountUp end={2} suffix="+" />
                  </div>
                  <div className="text-sm text-muted-foreground">Years Exp.</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">
                    <CountUp end={3} suffix="+" />
                  </div>
                  <div className="text-sm text-muted-foreground">Projects</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">
                    <CountUp end={3} suffix="+" />
                  </div>
                  <div className="text-sm text-muted-foreground">Clients</div>
                </div>
              </div>
            </motion.div>

            {/* Right: Profile Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center lg:justify-end"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-3xl"></div>
                <div className="relative w-72 h-72 sm:w-96 sm:h-96">
                  <GlowingProfileImage
                    imageUrl="/assets/profile/profile-image.jpg"
                    altText="Jeffery Addae"
                    glowColor="#3b82f6"
                    glowIntensity={0.8}
                    className="w-full h-full rounded-3xl"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-muted/30 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              What I <span className="text-primary">Do</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Specializing in full-stack development and AI automation systems that streamline business workflows
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 5h16v10H4z" />
                    <path d="M2 19h20" />
                  </svg>
                ),
                title: "Custom Internal Tools",
                desc: "Replace manual steps with tailored tools that keep teams fast and consistent.",
              },
              {
                icon: (
                  <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.7-1.4A4 4 0 0 1 17 18H7z" />
                  </svg>
                ),
                title: "Scalable Systems That Don’t Break",
                desc: "Reliable automation pipelines with logging, alerts, and clean handoffs.",
              },
              {
                icon: (
                  <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 3h6v6H9z" />
                    <path d="M9 15h6v6H9z" />
                    <path d="M3 9h6v6H3z" />
                    <path d="M15 9h6v6h-6z" />
                  </svg>
                ),
                title: "Automate Repetitive Work",
                desc: "Automate lead intake, follow-ups, reporting, and internal workflows using AI and n8n.",
              },
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-card rounded-2xl p-8 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
              >
                <div className="mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{service.title}</h3>
                <p className="text-muted-foreground">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      {/* Technologies Section */}
<section className="py-20 relative z-10">
  <div className="container mx-auto px-4 max-w-6xl">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12"
    >
      <h2 className="text-4xl md:text-5xl font-bold mb-4">
        Tools I Use to <span className="text-primary">Ship Results</span>
      </h2>
      <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
        These are production tools I use to deploy automations that save teams time within days — not months.
      </p>
    </motion.div>

    {/* Stack Groups */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* AI + Automation */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <h3 className="text-lg font-bold text-foreground mb-2">AI & Automation</h3>
        <p className="text-sm text-muted-foreground mb-5">
          AI chatbots, workflow automations, integrations, and agent systems.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {[
            { name: "n8n", icon: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/n8n.svg", invert: true },
            { name: "OpenAI", icon: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/openai.svg", invert: true },
            { name: "LangChain", icon: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/langchain.svg", invert: true },
            { name: "Zapier", icon: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/zapier.svg", invert: true },
          ].map((t) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="bg-background/40 rounded-xl p-4 border border-border hover:border-primary/50 transition-all duration-300 flex items-center gap-3"
            >
              <img
                src={t.icon}
                alt={t.name}
                className={`w-8 h-8 object-contain ${t.invert ? "dark:invert" : ""}`}
              />
              <span className="text-sm font-medium text-foreground">{t.name}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Web + Product */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <h3 className="text-lg font-bold text-foreground mb-2">Web & Product</h3>
        <p className="text-sm text-muted-foreground mb-5">
          Fast, modern UI + reliable backend systems built for scale.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {[
            { name: "React", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
            { name: "Next.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
            { name: "TypeScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
            { name: "Node.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
          ].map((t) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="bg-background/40 rounded-xl p-4 border border-border hover:border-primary/50 transition-all duration-300 flex items-center gap-3"
            >
              <img src={t.icon} alt={t.name} className="w-8 h-8 object-contain" />
              <span className="text-sm font-medium text-foreground">{t.name}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Data + Cloud */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <h3 className="text-lg font-bold text-foreground mb-2">Data & Cloud</h3>
        <p className="text-sm text-muted-foreground mb-5">
          Authentication, databases, storage, deployment, and analytics-ready infra.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {[
            { name: "Supabase", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg" },
            { name: "PostgreSQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
            { name: "Firebase", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg" },
            { name: "Vercel", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg", invert: true },
          ].map((t) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="bg-background/40 rounded-xl p-4 border border-border hover:border-primary/50 transition-all duration-300 flex items-center gap-3"
            >
              <img
                src={t.icon}
                alt={t.name}
                className={`w-8 h-8 object-contain ${t.invert ? "dark:invert" : ""}`}
              />
              <span className="text-sm font-medium text-foreground">{t.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>

    {/* Credibility strip */}
    <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/30 border border-border rounded-2xl p-6">
      <div>
        <p className="text-foreground font-semibold">
          Want a quick ROI win?
        </p>
        <p className="text-sm text-muted-foreground">
          I can automate one high-friction workflow first (lead intake, follow-ups, reporting, internal ops), then scale from there.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/projects">
          <button className="px-5 py-2.5 rounded-xl bg-card border border-border hover:border-primary/50 text-foreground font-semibold transition-all">
            See Proof
          </button>
        </Link>
        <Link href="/contact">
          <button className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-all">
            Book Free 45-minute Strategy Call
          </button>
        </Link>
      </div>
    </div>
  </div>
</section>
    </div>
  );
};

export default Home;
