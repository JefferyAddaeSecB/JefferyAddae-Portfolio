// Core skills for About page based on Jeffery's roadmap
export const CORE_SKILLS = [
  { name: "Full-Stack Development", description: "React / Next.js / Node.js / Supabase", percentage: 95 },
  { name: "Cloud & Database Integration", description: "Supabase, Firebase, Cloudinary", percentage: 90 },
  { name: "API Design & Integration", description: "RESTful APIs, GraphQL", percentage: 92 },
  { name: "UI/UX Optimization", description: "Responsive design, accessibility", percentage: 88 },
  { name: "Automation & AI Systems", description: "AI-driven integrations, workflow automation", percentage: 85 },
  { name: "Responsive Web Design", description: "Mobile-first, cross-browser compatible", percentage: 93 },
  { name: "Product Management", description: "Startup / MVP building, Agile workflow", percentage: 87 },
  { name: "Strategic Thinking", description: "Problem solving, scalable architecture", percentage: 90 }
];

export const FRONTEND_SKILLS = [
  { name: "React.js", percentage: 95 },
  { name: "Next.js", percentage: 92 },
  { name: "TypeScript", percentage: 90 },
  { name: "Tailwind CSS", percentage: 93 },
  { name: "JavaScript (ES6+)", percentage: 95 }
];

export const BACKEND_SKILLS = [
  { name: "Node.js", percentage: 92 },
  { name: "Supabase", percentage: 90 },
  { name: "Firebase", percentage: 88 },
  { name: "RESTful APIs", percentage: 93 },
  { name: "PostgreSQL", percentage: 85 }
];

export const CLOUD_INTEGRATION_SKILLS = [
  { name: "Supabase", percentage: 90 },
  { name: "Firebase", percentage: 88 },
  { name: "Cloudinary", percentage: 87 },
  { name: "Vercel", percentage: 92 },
  { name: "Cloud Functions", percentage: 85 }
];

export const SOFTWARE_SKILLS = [
  { name: "System Architecture", percentage: 90 },
  { name: "Design Patterns", percentage: 85 },
  { name: "Data Structures", percentage: 87 },
  { name: "Algorithms", percentage: 85 },
  { name: "Testing & QA", percentage: 82 },
  { name: "CI/CD", percentage: 88 }
];

export const TOOLS = [
  { 
    name: "React", 
    percentage: 95,
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
  },
  { 
    name: "Next.js", 
    percentage: 92,
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg"
  },
  { 
    name: "Node.js", 
    percentage: 92,
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg"
  },
  { 
    name: "TypeScript", 
    percentage: 90,
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg"
  },
  { 
    name: "Supabase", 
    percentage: 90,
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg"
  },
  { 
    name: "Firebase", 
    percentage: 88,
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg"
  },
  { 
    name: "OpenAI", 
    percentage: 85,
    icon: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/openai.svg"
  },
  { 
    name: "LangChain", 
    percentage: 82,
    icon: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/langchain.svg"
  },
  { 
    name: "n8n", 
    percentage: 80,
    icon: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/n8n.svg"
  },
  { 
    name: "Git & GitHub", 
    percentage: 95,
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg"
  },
  { 
    name: "Figma", 
    percentage: 85,
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg"
  }
];

// Bio and Philosophy
export const BIO = {
  name: "Jeffery Addae",
  tagline: "Full-Stack Developer & AI Automation Specialist",
  intro: "I design, build, and deploy modern web applications and AI automation systems that help businesses save time. Whether it's developing data-driven platforms, optimizing cloud integrations, or crafting responsive UI, I bring ideas to life through clean, scalable code.",
  philosophy: [
    "Build scalable, maintainable systems with clean architecture",
    "Balance functionality, performance, and exceptional user experience",
    "Deliver value quickly with an MVP-first, Agile mindset"
  ]
};

export const PROJECTS = [
  {
    title: "Project Name 1",
    description: "A full-stack data-driven web application built with React, Next.js, and Supabase, featuring real-time updates and cloud media management.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&auto=format",
    category: "Full-Stack",
    categoryColor: "blue",
    technologies: ["React", "Next.js", "Supabase", "Cloudinary", "TypeScript"],
    link: "cemar-counseling-main-zip.vercel.app",
    github: "https://github.com/JefferyAddaeSecB/Cemar-Counseling-Main-Zip"
  },
  {
    title: "AI-Powered SaaS Platform",
    description: "A SaaS product with AI integrations, automated workflows, and seamless API integrations for modern businesses.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop&auto=format",
    category: "AI",
    categoryColor: "purple",
    technologies: ["Next.js", "Node.js", "OpenAI API", "Supabase", "Stripe"],
    link: "https://project2.example.com",
    github: "https://github.com/jeffery-addae/project2"
  },
  {
    title: "E-Commerce MVP",
    description: "A fast, responsive e-commerce platform with product management, payment processing, and user authentication.",
    image: "https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=600&fit=crop&auto=format",
    category: "SaaS",
    categoryColor: "green",
    technologies: ["React", "Firebase", "Stripe", "Tailwind CSS", "Node.js"],
    link: "https://project3.example.com",
    github: "https://github.com/jeffery-addae/project3"
  },
  {
    title: "Real-Time Dashboard",
    description: "An analytics dashboard with real-time data sync, interactive charts, and cloud database integration.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&auto=format",
    category: "Full-Stack",
    categoryColor: "red",
    technologies: ["React", "Supabase", "Recharts", "TypeScript", "Tailwind CSS"],
    link: "https://project4.example.com",
    github: "https://github.com/jeffery-addae/project4"
  },
  {
    title: "Social Media App",
    description: "A modern social media platform with real-time messaging, post feeds, and user profiles. Features include image uploads, likes, comments, and notifications.",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop&auto=format",
    category: "Full-Stack",
    categoryColor: "blue",
    technologies: ["React", "Node.js", "Socket.io", "MongoDB", "Cloudinary"],
    link: "https://project5.example.com",
    github: "https://github.com/jeffery-addae/project5"
  },
  {
    title: "Task Management System",
    description: "A comprehensive project management tool with kanban boards, team collaboration, and deadline tracking. Includes task assignments and progress visualization.",
    image: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&h=600&fit=crop&auto=format",
    category: "SaaS",
    categoryColor: "green",
    technologies: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS", "Framer Motion"],
    link: "https://project6.example.com",
    github: "https://github.com/jeffery-addae/project6"
  },
  {
    title: "Fitness Tracker App",
    description: "A health and fitness tracking application with workout logging, progress charts, and personalized fitness goals. Includes nutrition tracking and meal planning.",
    image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&h=600&fit=crop&auto=format",
    category: "Mobile",
    categoryColor: "orange",
    technologies: ["React Native", "Firebase", "Redux", "Chart.js", "Node.js"],
    link: "https://project7.example.com",
    github: "https://github.com/jeffery-addae/project7"
  },
  {
    title: "AI Content Generator",
    description: "An AI-powered content creation tool that generates blog posts, social media captions, and marketing copy. Features multiple AI models and custom templates.",
    image: "https://images.unsplash.com/photo-1676299081847-824916de030a?w=800&h=600&fit=crop&auto=format",
    category: "AI",
    categoryColor: "purple",
    technologies: ["Next.js", "OpenAI API", "TypeScript", "Prisma", "PostgreSQL"],
    link: "https://project8.example.com",
    github: "https://github.com/jeffery-addae/project8"
  },
  {
    title: "Restaurant Booking Platform",
    description: "A reservation system for restaurants with table booking, menu browsing, and customer reviews. Includes admin dashboard for restaurant owners.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&auto=format",
    category: "Full-Stack",
    categoryColor: "red",
    technologies: ["React", "Node.js", "Express", "MongoDB", "Stripe"],
    link: "https://project9.example.com",
    github: "https://github.com/jeffery-addae/project9"
  },
  {
    title: "Learning Management System",
    description: "An online education platform with course creation, video hosting, quizzes, and student progress tracking. Features certificate generation and payment integration.",
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=600&fit=crop&auto=format",
    category: "SaaS",
    categoryColor: "blue",
    technologies: ["Next.js", "Supabase", "Stripe", "Cloudinary", "TypeScript"],
    link: "jeffery-addae-portfolio.vercel.app",
    github: "https://www.linkedin.com/in/jeffery-addae-297214398/"
  }
];

// Placeholder - Jeffery will provide actual projects later

export const TESTIMONIALS = [
  {
    quote: "Jeffery's ability to deliver high-quality MVPs quickly is unmatched. He helped us launch our SaaS platform ahead of schedule and provided invaluable strategic insights throughout the development process.",
    name: "Sarah Mitchell",
    title: "Founder, TechVenture Inc.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=120&h=120&q=80"
  },
  {
    quote: "Working with Jeffery was seamless. His expertise in React, Supabase, and cloud integrations transformed our product vision into reality. Highly recommend for any full-stack project.",
    name: "David Chen",
    title: "CTO, StartupLab",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=120&h=120&q=80"
  }
];

export const SOCIAL_LINKS = [
  { name: "GitHub", icon: "ri-github-fill", url: "https://github.com/jefferyAddaeSecB", hoverColor: "red" },
  { name: "LinkedIn", icon: "ri-linkedin-fill", url: "https://www.linkedin.com/in/jeffery-addae-297214398/", hoverColor: "yellow" },
  { name: "Twitter", icon: "ri-twitter-fill", url: "https://x.com/jeffery_addae", hoverColor: "green" },
  { name: "Email", icon: "ri-mail-fill", url: "mailto:jeffaddai40@gmail.com", hoverColor: "blue" }
];

export const SERVICES = [
  {
    title: "Full-Stack Development",
    description: "Building modern, data-driven web applications using React, Next.js, Node.js, and cloud databases like Supabase and Firebase.",
    features: [
      "React & Next.js Development",
      "Node.js Backend & API Design",
      "Supabase & Firebase Integration",
      "TypeScript Implementation",
      "Responsive & Performance Optimization"
    ]
  },
  {
    title: "Cloud & Database Integration",
    description: "Seamlessly integrating cloud services and databases for scalable, real-time applications.",
    features: [
      "Supabase & Firebase Setup",
      "Cloudinary Media Management",
      "Real-time Data Sync",
      "Authentication & Authorization",
      "Cloud Functions & Serverless"
    ]
  },
  {
    title: "API Design & Integration",
    description: "Designing and integrating RESTful and GraphQL APIs to power modern web applications.",
    features: [
      "RESTful API Development",
      "GraphQL Implementation",
      "Third-party API Integration",
      "Authentication & Security",
      "API Documentation"
    ]
  },
  {
    title: "UI/UX Optimization",
    description: "Creating beautiful, accessible, and high-performance user interfaces.",
    features: [
      "Responsive Web Design",
      "Accessibility (WCAG) Compliance",
      "Performance Optimization",
      "Design Systems & Component Libraries"
    ]
  },
  {
    title: "Automation & AI-Driven Systems",
    description: "Building AI automation systems that help businesses save time and streamline operations.",
    features: [
      "Workflow Automation",
      "AI Model Integration (OpenAI, etc.)",
      "AI Assistants & Agents",
      "Process Optimization & Analytics"
    ]
  },
  {
    title: "Product Management & MVP Building",
    description: "Helping startups and businesses build MVPs and iterate quickly with Agile workflows.",
    features: [
      "MVP Development",
      "Agile Workflow Management",
      "Product Strategy & Roadmapping",
      "User Feedback & Iteration"
    ]
  }
];
