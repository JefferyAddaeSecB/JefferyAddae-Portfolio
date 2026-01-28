import { Switch, Route, useLocation } from "wouter";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Loading from "@/components/Loading";
import ErrorBoundary from "@/components/ErrorBoundary";
import ChatAssistant from "@/components/ChatAssistant";
import { Suspense, useEffect, useLayoutEffect, lazy } from "react";

// Lazily load pages/components to shrink the initial bundle
const Home = lazy(() => import("@/pages/Home"));
const About = lazy(() => import("@/pages/About"));
const Skills = lazy(() => import("@/pages/Skills"));
const Projects = lazy(() => import("@/pages/Projects"));
const ProjectCaseStudy = lazy(() => import("@/pages/ProjectCaseStudy"));
const Contact = lazy(() => import("@/pages/Contact"));
const CV = lazy(() => import("@/pages/CV"));
const HowItWorks = lazy(() => import("@/pages/HowItWorks"));
const Experience = lazy(() => import("@/pages/Experience"));
const NotFound = lazy(() => import("@/pages/not-found"));
const CursorPatternBackground = lazy(() => import("@/components/CursorPatternBackground"));

// Reset scroll on every route change so navigation (incl. footer links) opens at the top
const RouteScrollReset = () => {
  const [location] = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    // Check if there's a hash in the URL
    const hash = window.location.hash;
    
    if (hash) {
      // If there's a hash, scroll to that element
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      // Otherwise reset scroll to top
      const reset = () => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      };

      reset();
      requestAnimationFrame(reset);
      setTimeout(reset, 0);
    }
  }, [location]);

  return null;
};

function Router() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <ErrorBoundary>
        <Suspense fallback={<Loading />}>
          <RouteScrollReset />
          <Switch location={location}>
            <Route path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/skills" component={Skills} />
            <Route path="/projects/:slug" component={ProjectCaseStudy} />
            <Route path="/projects" component={Projects} />
            <Route path="/how-it-works" component={HowItWorks} />
            <Route path="/experience" component={Experience} />
            <Route path="/contact" component={Contact} />
            <Route path="/cv" component={CV} />
            {/* Fallback to 404 */}
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </ErrorBoundary>
    </AnimatePresence>
  );
}

function App() {
  return (
    <div className="flex flex-col min-h-screen max-w-[100vw] overflow-x-hidden bg-background text-foreground">
      <Header />
      <main className="flex-grow pt-[72px] md:pt-[88px] w-full">
        <Router />
      </main>
      <Footer />
      <ScrollToTop />
      <ChatAssistant />
      <Suspense fallback={null}>
        <CursorPatternBackground 
          color="#3b82f6"
          particleCount={70}
          lineLength={100}
          speed={0.3}
        />
      </Suspense>
      <Toaster />
    </div>
  );
}

export default App;
