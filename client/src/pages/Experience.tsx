import React from 'react';
import { motion } from "framer-motion";

interface ExperienceItem {
  title: string;
  organization: string;
  location: string;
  period: string;
  type: "work" | "education";
  description: string[];
}

// Placeholder experience data - Jeffery will provide actual details
const EXPERIENCE_DATA: ExperienceItem[] = [
  {
    title: "Senior Full-Stack Developer & AI Automation Specialist",
    organization: "Tech Innovations Inc.",
    location: "Toronto, Canada",
    period: "2024 - Present",
    type: "work",
    description: [
      "Architected and deployed scalable SaaS applications serving 10,000+ users using Next.js and Supabase",
      "Led a team of 3 developers in building AI-powered features using OpenAI API",
      "Implemented CI/CD pipelines reducing deployment time by 60%",
      "Mentored junior developers on React best practices and TypeScript patterns"
    ]
  },
  {
    title: "Full-Stack Developer & AI Automation Specialist",
    organization: "Digital Solutions Agency",
    location: "Remote, Canada",
    period: "2023 - 2024",
    type: "work",
    description: [
      "Developed data-driven web applications using React, Next.js, and Supabase",
      "Implemented cloud integrations with Firebase and Cloudinary for scalable media management",
      "Designed and built RESTful APIs with Node.js for seamless frontend-backend communication",
      "Optimized application performance resulting in 40% faster load times"
    ]
  },
  {
    title: "Frontend Developer",
    organization: "Creative Web Studio",
    location: "Vancouver, Canada",
    period: "2022 - 2023",
    type: "work",
    description: [
      "Developed responsive web applications using React and TypeScript",
      "Collaborated with designers to implement pixel-perfect UI/UX designs",
      "Integrated third-party APIs and payment systems (Stripe, PayPal)",
      "Maintained and improved existing codebases with modern best practices"
    ]
  },
  {
    title: "Junior Web Developer",
    organization: "StartUp Labs",
    location: "Remote",
    period: "2021 - 2022",
    type: "work",
    description: [
      "Built responsive landing pages and marketing websites using React and Tailwind CSS",
      "Assisted in developing e-commerce features with Stripe payment integration",
      "Participated in code reviews and contributed to team documentation",
      "Gained hands-on experience with Git workflows and Agile methodologies"
    ]
  },
  {
    title: "Freelance Web Developer",
    organization: "Self-Employed",
    location: "Remote",
    period: "2020 - 2021",
    type: "work",
    description: [
      "Delivered 15+ custom websites for small businesses and startups",
      "Specialized in WordPress, React, and static site generators",
      "Managed client relationships and project timelines independently",
      "Built portfolio showcasing diverse web development skills"
    ]
  },
  {
    title: "Bachelor of Science in Computer Science",
    organization: "University of Technology",
    location: "Canada",
    period: "2018 - 2022",
    type: "education",
    description: [
      "Graduated with First Class Honors (GPA: 3.8/4.0)",
      "Specialized in Software Engineering and Web Development",
      "Led multiple student projects using modern web technologies",
      "Completed capstone project: Full-stack SaaS platform with real-time features"
    ]
  },
  {
    title: "Web Development Bootcamp",
    organization: "Tech Academy",
    location: "Online",
    period: "2020",
    type: "education",
    description: [
      "Completed intensive 12-week full-stack web development program",
      "Learned React, Node.js, Express, MongoDB, and modern deployment practices",
      "Built 5+ full-stack projects from scratch",
      "Received certification in Full-Stack JavaScript Development"
    ]
  }
];

const Experience: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16 sm:py-20 md:py-24 relative">
      {/* Background gradient effects */}
      <div className="bg-gradient-1 absolute w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] -top-10 sm:-top-20 -left-10 sm:-left-20 opacity-20 z-0"></div>
      <div className="bg-gradient-2 absolute w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] -bottom-10 sm:-bottom-20 -right-10 sm:-right-20 opacity-20 z-0"></div>

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12 sm:mb-16 relative z-10"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">
          EXPERIENCE & EDUCATION
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
          My professional journey and educational background
        </p>
      </motion.div>

      {/* Timeline */}
      <div className="relative max-w-4xl mx-auto">
        {/* Vertical line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/30 transform md:-translate-x-1/2"></div>

        {/* Timeline items */}
        <div className="space-y-12">
          {EXPERIENCE_DATA.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className={`relative flex flex-col md:flex-row gap-6 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Timeline dot */}
              <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-8 h-8 bg-primary rounded-full border-4 border-background flex items-center justify-center z-10">
                {item.type === "work" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-background" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-background" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                  </svg>
                )}
              </div>

              {/* Content card */}
              <div className={`ml-16 md:ml-0 md:w-[calc(50%-2rem)] ${
                index % 2 === 0 ? 'md:text-right' : 'md:text-left'
              }`}>
                <div className="bg-card rounded-lg p-6 shadow-lg hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                  {/* Badge */}
                  <div className={`inline-block mb-3 ${
                    index % 2 === 0 ? 'md:float-right md:ml-3' : 'md:float-left md:mr-3'
                  }`}>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.type === "work" 
                        ? "bg-primary/10 text-primary" 
                        : "bg-green-500/10 text-green-500"
                    }`}>
                      {item.type === "work" ? "Work Experience" : "Education"}
                    </span>
                  </div>

                  {/* Title and organization */}
                  <h3 className="text-xl font-bold text-foreground mb-2 clear-both">
                    {item.title}
                  </h3>
                  <p className="text-primary font-semibold mb-1">
                    {item.organization}
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      {item.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                        <line x1="16" x2="16" y1="2" y2="6"></line>
                        <line x1="8" x2="8" y1="2" y2="6"></line>
                        <line x1="3" x2="21" y1="10" y2="10"></line>
                      </svg>
                      {item.period}
                    </span>
                  </div>

                  {/* Description */}
                  <ul className={`space-y-2 text-sm text-muted-foreground ${
                    index % 2 === 0 ? 'md:text-right' : 'md:text-left'
                  }`}>
                    {item.description.map((desc, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className={`flex-shrink-0 mt-1 ${
                          index % 2 === 0 ? 'md:order-2' : ''
                        }`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </span>
                        <span className="flex-1">{desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="text-center mt-16 relative z-10"
      >
        <p className="text-muted-foreground mb-6">
          Want to know more about my work or discuss a project?
        </p>
        <a
          href="/contact"
          className="crystal-btn text-foreground px-8 py-4 text-lg font-medium inline-block"
        >
          Get In Touch
        </a>
      </motion.div>
    </div>
  );
};

export default Experience;
