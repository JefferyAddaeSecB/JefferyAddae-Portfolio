import { motion } from "framer-motion";
import { PROJECTS } from "../lib/constants";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { useState, useEffect } from "react";

type ProjectCategory = "All" | "Full-Stack" | "AI" | "SaaS";

const Projects = () => {
  const [filter, setFilter] = useState<ProjectCategory>("All");
  const [filteredProjects, setFilteredProjects] = useState(PROJECTS);

  useEffect(() => {
    if (filter === "All") {
      setFilteredProjects(PROJECTS);
    } else {
      setFilteredProjects(PROJECTS.filter(project => project.category === filter));
    }
  }, [filter]);

  return (
    <div className="min-h-screen bg-background py-20 px-4 sm:px-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            My Projects
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Explore my portfolio of projects across different domains, from software development to mobile applications.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12"
        >
          {(["All", "Full-Stack", "AI", "SaaS"] as ProjectCategory[]).map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                filter === category
                  ? "bg-primary text-white"
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group"
            >
              <div className="relative w-full h-48 sm:h-56 overflow-hidden group">
                <div className="h-full w-full overflow-y-auto scrollbar-hide">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                      project.categoryColor === "red"
                        ? "bg-red-500/20 text-red-500"
                        : project.categoryColor === "blue"
                        ? "bg-blue-500/20 text-blue-500"
                        : project.categoryColor === "green"
                        ? "bg-green-500/20 text-green-500"
                        : project.categoryColor === "purple"
                        ? "bg-purple-500/20 text-purple-500"
                        : project.categoryColor === "yellow"
                        ? "bg-yellow-500/20 text-yellow-500"
                        : "bg-orange-500/20 text-orange-500"
                    }`}
                  >
                    {project.category}
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                  {project.title}
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base mb-4">{project.description}</p>

                <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 sm:px-3 py-1 bg-primary/10 text-primary rounded-full text-xs sm:text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 sm:gap-2 text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm"
                  >
                    <FaGithub className="text-base sm:text-lg" />
                    <span>View Code</span>
                  </a>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 sm:gap-2 text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm"
                  >
                    <FaExternalLinkAlt className="text-base sm:text-lg" />
                    <span>Live Demo</span>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
