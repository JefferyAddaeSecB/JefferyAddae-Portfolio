import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import { useEffect, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

const Header = () => {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/projects", label: "Case Studies" },
    { path: "/how-it-works", label: "How It Works" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-primary"
            >
              <img
                src="https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=Jeffery&backgroundColor=b6e3f4&eyebrows=default&eyes=happy&mouth=smile&skinColor=light&hair=short04&hairColor=4a312c&clothingColor=262e33"
                alt="Jeffery Addae Avatar"
                className="w-full h-full object-cover"
              />
            </motion.div>

            <div className="leading-tight">
              <div className="font-heading font-bold text-lg md:text-xl text-foreground">
                Jeffery Addae
              </div>
              <div className="hidden sm:block text-xs md:text-sm text-muted-foreground">
                AI Automation • Full-Stack Systems
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <motion.span
                  className={`relative px-2 py-1 text-sm font-medium transition-colors cursor-pointer inline-block ${
                    isActive(item.path)
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.label}
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="activeNavItem"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.span>
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 rounded-xl bg-card border border-border hover:border-primary/50 text-foreground font-semibold transition-all"
                >
                  Get ROI Audit
                </motion.button>
              </Link>
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-all shadow-sm"
                >
                  Book a Call
                </motion.button>
              </Link>
            </div>

            <ThemeToggle />

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden"
            >
              <div className="py-4 space-y-2">
                {navItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <motion.span
                      className={`block px-4 py-2 text-base font-medium transition-colors cursor-pointer ${
                        isActive(item.path)
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </motion.span>
                  </Link>
                ))}

                {/* Mobile CTAs */}
                <div className="px-4 pt-2 flex flex-col gap-2">
                  <Link href="/contact">
                    <span className="w-full text-center block px-4 py-3 rounded-xl bg-card border border-border hover:border-primary/50 text-foreground font-semibold transition-all">
                      Get ROI Audit
                    </span>
                  </Link>
                  <Link href="/contact">
                    <span className="w-full text-center block px-4 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition-all">
                      Book a Call
                    </span>
                  </Link>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;