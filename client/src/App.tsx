import { Switch, Route, useLocation } from "wouter";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Loading from "@/components/Loading";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Suspense, useEffect, useLayoutEffect, lazy } from "react";

// Lazily load pages/components to shrink the initial bundle
const Home = lazy(() => import("@/pages/Home"));
const About = lazy(() => import("@/pages/About"));
const Skills = lazy(() => import("@/pages/Skills"));
const Projects = lazy(() => import("@/pages/Projects"));
const ProjectCaseStudy = lazy(() => import("@/pages/ProjectCaseStudy"));
const Contact = lazy(() => import("@/pages/Contact"));
const CV = lazy(() => import("@/pages/CV"));
const Experience = lazy(() => import("@/pages/Experience"));
const Appointments = lazy(() => import("@/pages/Appointments"));
const NotFound = lazy(() => import("@/pages/not-found"));
const CursorPatternBackground = lazy(() => import("@/components/CursorPatternBackground"));
const AIPortfolioAssistant = lazy(() =>
  import("@/components/AIPortfolioAssistant").then((mod) => ({ default: mod.AIPortfolioAssistant }))
);

// Reset scroll on every route change so navigation (incl. footer links) opens at the top
const RouteScrollReset = () => {
  const [location] = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    // Belt-and-suspenders: reset scroll immediately, next frame, and after paint
    const reset = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    reset();
    requestAnimationFrame(reset);
    setTimeout(reset, 0);
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
            <Route path="/projects" component={Projects} />
            <Route path="/projects/:slug" component={ProjectCaseStudy} />
            <Route path="/experience" component={Experience} />
            <Route path="/contact" component={Contact} />
            <Route path="/cv" component={CV} />
            <Route path="/appointments" component={Appointments} />
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
      <Suspense fallback={null}>
        <AIPortfolioAssistant />
      </Suspense>
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
