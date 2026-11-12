import React, { useEffect, useRef, useState } from 'react';

const LazySection = ({ children, className = '', placeholderHeight = 420 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className={className}>
      {isVisible ? (
        children
      ) : (
        <div style={{ minHeight: placeholderHeight }} aria-hidden="true" />
      )}
    </section>
  );
};

export default LazySection;
