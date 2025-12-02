import { useEffect, useState, useRef } from 'react';

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

const CountUp = ({ end, duration = 2, prefix = "", suffix = "" }: CountUpProps) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!countRef.current) return;

    observer.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true;
        
        const start = 0;
        const increment = end / (duration * 60); // 60fps
        const targetCount = Math.ceil(end);
        let currentCount = start;
        
        const timer = setInterval(() => {
          currentCount += increment;
          
          if (currentCount >= targetCount) {
            clearInterval(timer);
            setCount(targetCount);
          } else {
            setCount(Math.floor(currentCount));
          }
        }, 1000 / 60);
        
        return () => clearInterval(timer);
      }
    });

    observer.current.observe(countRef.current);

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [end, duration]);

  return (
    <span ref={countRef} className="inline-block">
      {prefix}{count}{suffix}
    </span>
  );
};

export default CountUp;