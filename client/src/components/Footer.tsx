import { Link } from "wouter";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-6">

        {/* TOP CTA */}
        <div className="mb-12 rounded-3xl border border-border bg-background/40 backdrop-blur p-8 md:p-10 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Ready to automate your business?
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            I help businesses remove manual work by building AI automation systems,
            internal tools, and scalable web platforms that save time and increase ROI.
          </p>
          <Link href="/contact">
            <span className="inline-block px-8 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-all cursor-pointer">
              Let’s Talk
            </span>
          </Link>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* BRAND */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary">
                <img
                  src="/assets/profile/profile-image.jpg"
                  alt="Jeffery Addae"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-heading font-bold text-xl text-foreground">
                  Jeffery Addae
                </div>
                <div className="text-sm text-muted-foreground">
                  AI Automation Specialist & Full-Stack Developer
                </div>
              </div>
            </div>

            <p className="text-muted-foreground">
              I design and build AI-powered workflows, automation systems,
              and modern web applications that help businesses operate faster
              and more efficiently.
            </p>
          </div>

          {/* NAVIGATION (MATCHES HEADER) */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Navigation
            </h3>
            <nav className="flex flex-col space-y-3">
              <Link href="/">
                <span className="text-muted-foreground hover:text-primary cursor-pointer">
                  Home
                </span>
              </Link>
              <Link href="/about">
                <span className="text-muted-foreground hover:text-primary cursor-pointer">
                  About
                </span>
              </Link>
              <Link href="/projects">
                <span className="text-muted-foreground hover:text-primary cursor-pointer">
                  Projects
                </span>
              </Link>
              <Link href="/experience">
                <span className="text-muted-foreground hover:text-primary cursor-pointer">
                  Experience
                </span>
              </Link>
              <Link href="/contact">
                <span className="text-muted-foreground hover:text-primary cursor-pointer">
                  Contact
                </span>
              </Link>
            </nav>
          </div>

          {/* WHAT I DO */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              What I Do
            </h3>
            <div className="flex flex-col space-y-3 text-muted-foreground">
              <span>AI automation workflows (n8n)</span>
              <span>Business process automation</span>
              <span>AI chatbots & internal tools</span>
              <span>Full-stack web applications</span>
              <span>API & system integrations</span>
            </div>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-muted-foreground text-sm">
            © {currentYear} Jeffery Addae. All rights reserved.
          </p>
          <div className="flex space-x-4 text-sm">
            <a
              href="https://github.com/JefferyAddaeSecB"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/jeffery-addae-297214398/"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="mailto:jeffaddai40@gmail.com"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Email
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;