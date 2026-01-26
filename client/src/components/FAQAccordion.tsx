import { useState } from "react";
import { motion } from "framer-motion";

interface FAQItem {
  title: string;
  content: string | React.ReactNode;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

const FAQAccordion = ({ items }: FAQAccordionProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="border border-border rounded-lg overflow-hidden"
        >
          <button
            onClick={() =>
              setExpandedIndex(expandedIndex === index ? null : index)
            }
            className="w-full px-4 py-3 text-left font-medium text-foreground hover:bg-muted/50 transition-colors flex justify-between items-center"
            aria-expanded={expandedIndex === index}
          >
            <span className="text-sm sm:text-base">{item.title}</span>
            <motion.svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              animate={{ rotate: expandedIndex === index ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-muted-foreground flex-shrink-0 ml-2"
            >
              <polyline points="6 9 12 15 18 9" />
            </motion.svg>
          </button>

          {expandedIndex === index && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 py-3 border-t border-border bg-muted/30 text-sm text-foreground/80"
            >
              {typeof item.content === "string" ? (
                <p>{item.content}</p>
              ) : (
                item.content
              )}
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FAQAccordion;
