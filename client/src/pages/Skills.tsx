import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { FRONTEND_SKILLS, BACKEND_SKILLS, CLOUD_INTEGRATION_SKILLS, TOOLS } from "@/lib/constants";

interface SkillBarProps {
  name: string;
  percentage: number;
  delay: number;
}

const SkillBar = ({ name, percentage, delay }: SkillBarProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className="mb-6"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-foreground font-medium">{name}</h3>
        <span className="text-muted-foreground">{percentage}%</span>
      </div>
      <Progress 
        value={percentage} 
        className={`h-2 w-full bg-muted overflow-hidden`} 
        style={{ background: "rgb(30, 30, 30)" }}
      />
    </motion.div>
  );
};

const Skills = () => {
  return (
    <div className="container mx-auto px-4 py-24 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">MY SKILLS</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Specializing in full-stack development with modern technologies like React, Next.js, Node.js, and cloud platforms.
          Below is a showcase of my technical proficiencies and tools I work with.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl font-bold text-foreground mb-8"
          >
            Frontend Development
          </motion.h2>
          
          {FRONTEND_SKILLS.map((skill, index) => (
            <SkillBar 
              key={skill.name}
              name={skill.name}
              percentage={skill.percentage}
              delay={index + 2}
            />
          ))}
        </div>
        
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl font-bold text-foreground mb-8"
          >
            Backend Development
          </motion.h2>
          
          {BACKEND_SKILLS.map((skill, index) => (
            <SkillBar 
              key={skill.name}
              name={skill.name}
              percentage={skill.percentage}
              delay={index + 2}
            />
          ))}
        </div>

        <div>
          <motion.h2 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl font-bold text-foreground mb-8"
          >
            Cloud & Database Integration
          </motion.h2>
          
          {CLOUD_INTEGRATION_SKILLS.map((skill, index) => (
            <SkillBar 
              key={skill.name}
              name={skill.name}
              percentage={skill.percentage}
              delay={index + 2}
            />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-16"
      >
        <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Tools & Technologies</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {TOOLS.map((tool, index) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className="bg-card hover:bg-card/80 rounded-lg p-6 text-center transition-colors flex flex-col items-center justify-center h-32"
            >
              <div className="mb-3">
                <img 
                  src={tool.icon} 
                  alt={tool.name}
                  className="w-12 h-12 object-contain"
                />
              </div>
              <h3 className="text-foreground font-medium">{tool.name}</h3>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
      >
        <div className="bg-card rounded-lg p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">What I Can Do</h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <svg className="text-primary mr-3 mt-1 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span className="text-muted-foreground">Develop responsive and user-friendly web applications</span>
            </li>
            <li className="flex items-start">
              <svg className="text-primary mr-3 mt-1 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span className="text-muted-foreground">Design and implement RESTful APIs for seamless data exchange</span>
            </li>
            <li className="flex items-start">
              <svg className="text-primary mr-3 mt-1 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span className="text-muted-foreground">Create and manage databases for efficient data storage</span>
            </li>
            <li className="flex items-start">
              <svg className="text-primary mr-3 mt-1 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span className="text-muted-foreground">Optimize web performance for faster loading times</span>
            </li>
            <li className="flex items-start">
              <svg className="text-primary mr-3 mt-1 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span className="text-muted-foreground">Implement user authentication and authorization systems</span>
            </li>
            <li className="flex items-start">
              <svg className="text-primary mr-3 mt-1 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span className="text-muted-foreground">Deploy and maintain applications in cloud environments</span>
            </li>
            <li className="flex items-start">
              <svg className="text-primary mr-3 mt-1 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span className="text-muted-foreground">Integrate cloud services (Supabase, Firebase, Cloudinary)</span>
            </li>
            <li className="flex items-start">
              <svg className="text-primary mr-3 mt-1 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span className="text-muted-foreground">Build AI-driven systems and automation workflows</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-card rounded-lg p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Professional Skills</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-foreground font-medium mb-3">Problem Solving</h3>
              <Progress value={95} className="h-2 w-full bg-muted" style={{ background: "rgb(30, 30, 30)" }} />
            </div>
            <div>
              <h3 className="text-foreground font-medium mb-3">Communication</h3>
              <Progress value={90} className="h-2 w-full bg-muted" style={{ background: "rgb(30, 30, 30)" }} />
            </div>
            <div>
              <h3 className="text-foreground font-medium mb-3">Team Work</h3>
              <Progress value={85} className="h-2 w-full bg-muted" style={{ background: "rgb(30, 30, 30)" }} />
            </div>
            <div>
              <h3 className="text-foreground font-medium mb-3">Leadership</h3>
              <Progress value={80} className="h-2 w-full bg-muted" style={{ background: "rgb(30, 30, 30)" }} />
            </div>
            <div>
              <h3 className="text-foreground font-medium mb-3">Creativity</h3>
              <Progress value={88} className="h-2 w-full bg-muted" style={{ background: "rgb(30, 30, 30)" }} />
            </div>
            <div>
              <h3 className="text-foreground font-medium mb-3">Organization</h3>
              <Progress value={92} className="h-2 w-full bg-muted" style={{ background: "rgb(30, 30, 30)" }} />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-card rounded-lg p-8 text-center"
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">My Development Approach</h2>
        <p className="text-muted-foreground mb-8 max-w-3xl mx-auto">
          I follow a structured approach to web development that ensures high-quality, 
          maintainable code and excellent user experiences. My process includes thorough planning, 
          modern development practices, and rigorous testing.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="relative">
            <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
              <span className="text-primary font-bold text-xl">01</span>
            </div>
            <div className="hidden md:block absolute top-8 left-1/2 w-full h-1 bg-primary/20 -z-0"></div>
            <h3 className="text-foreground font-medium mb-2">Planning</h3>
            <p className="text-sm text-muted-foreground">Understanding requirements and architecting solutions</p>
          </div>
          
          <div className="relative">
            <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
              <span className="text-primary font-bold text-xl">02</span>
            </div>
            <div className="hidden md:block absolute top-8 left-1/2 w-full h-1 bg-primary/20 -z-0"></div>
            <h3 className="text-foreground font-medium mb-2">Design</h3>
            <p className="text-sm text-muted-foreground">Creating intuitive and responsive interfaces</p>
          </div>
          
          <div className="relative">
            <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
              <span className="text-primary font-bold text-xl">03</span>
            </div>
            <div className="hidden md:block absolute top-8 left-1/2 w-full h-1 bg-primary/20 -z-0"></div>
            <h3 className="text-foreground font-medium mb-2">Development</h3>
            <p className="text-sm text-muted-foreground">Writing clean, efficient, and maintainable code</p>
          </div>
          
          <div>
            <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-primary font-bold text-xl">04</span>
            </div>
            <h3 className="text-foreground font-medium mb-2">Deployment</h3>
            <p className="text-sm text-muted-foreground">Testing and delivering high-quality applications</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Skills;