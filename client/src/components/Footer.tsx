import { Link } from "wouter";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-card border-t border-gray-800 py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-primary">
                <img 
                  src="/assets/profile/profile-image.jpg" 
                  alt="Jeffery Addae Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-heading font-bold text-2xl text-foreground dark:text-white hidden md:inline ml-2">Jeffery Addae</span>
            </div>
            <p className="text-muted-foreground">
              Building modern web applications with React, Next.js, and cloud technologies.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="https://github.com/JefferyAddaeSecB" className="text-muted-foreground hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
              </a>
              <a href="https://www.linkedin.com/in/jeffery-addae-297214398/" className="text-muted-foreground hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <a href="mailto:jeffaddai40@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground dark:text-white mb-4">Quick Links</h3>
            <nav className="flex flex-col space-y-3">
              <Link href="/">
                <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Home</span>
              </Link>
              <Link href="/about">
                <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">About</span>
              </Link>
              <Link href="/projects">
                <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Projects</span>
              </Link>
              <Link href="/experience">
                <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Experience</span>
              </Link>
              <Link href="/contact">
                <span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Contact</span>
              </Link>
            </nav>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground dark:text-white mb-4">Services</h3>
            <nav className="flex flex-col space-y-3">
              <span className="text-muted-foreground hover:text-primary transition-colors">Full-Stack Development</span>
              <span className="text-muted-foreground hover:text-primary transition-colors">Cloud Integration</span>
              <span className="text-muted-foreground hover:text-primary transition-colors">API Design</span>
              <span className="text-muted-foreground hover:text-primary transition-colors">AI-Driven Systems</span>
            </nav>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground dark:text-white mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mt-1"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                <a href="tel:+14374991703" className="text-muted-foreground hover:text-primary transition-colors">+1 (437) 499-1703</a>
              </div>
              <div className="flex items-start space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mt-1"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                <a href="mailto:jeffaddai40@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">jeffaddai40@gmail.com</a>
              </div>
              <div className="flex items-start space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mt-1"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <a href="https://maps.google.com/?q=Toronto,+Ontario,+Canada" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">Toronto, Ontario, Canada</a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm mb-4 md:mb-0">
            © {currentYear} Jeffery Addae. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
