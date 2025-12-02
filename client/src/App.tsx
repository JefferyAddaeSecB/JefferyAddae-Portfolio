import { Switch, Route, useLocation } from "wouter";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Skills from "@/pages/Skills";
import Projects from "@/pages/Projects";
import Contact from "@/pages/Contact";
import CV from "@/pages/CV";
import Experience from "@/pages/Experience";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import CursorPatternBackground from "@/components/CursorPatternBackground";
import { AIPortfolioAssistant } from "@/components/AIPortfolioAssistant";
import Loading from "@/components/Loading";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Suspense } from "react";
import About from './pages/About';

function Router() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait">
      <ErrorBoundary>
        <Suspense fallback={<Loading />}>
          <Switch location={location}>
            <Route path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/skills" component={Skills} />
            <Route path="/projects" component={Projects} />
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
      <AIPortfolioAssistant />
      <Toaster />
      <CursorPatternBackground 
        color="#3b82f6"
        particleCount={70}
        lineLength={100}
        speed={0.3}
      />
    </div>
  );
}

export default App;
