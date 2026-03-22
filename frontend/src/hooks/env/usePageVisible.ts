import { useEffect, useState } from 'react';

export const usePageVisible = (threshold: number): boolean => {
  const [visible, setVisible] = useState(docVis);

  useEffect(() => {
    let pageVis = docVis();
    let intersectVis = true;

    const updateVis = () => {
      const vis = docVis();
      if (pageVis !== vis) {
        pageVis = vis;
        if (intersectVis) {
          setVisible(pageVis);
        }
      }
    };
    document.addEventListener('visibilitychange', updateVis);
    try {
      const observer = new IntersectionObserver(
        (entries) => {
          const last = entries[entries.length - 1];
          if (last) {
            const vis = last.intersectionRatio > threshold;
            if (vis !== intersectVis) {
              intersectVis = vis;
              if (pageVis) {
                setVisible(intersectVis);
              }
            }
          }
        },
        { threshold },
      );
      observer.observe(document.documentElement);
      return () => {
        observer.disconnect();
        document.removeEventListener('visibilitychange', updateVis);
      };
    } catch {
      return () => document.removeEventListener('visibilitychange', updateVis);
    }
  }, [threshold]);

  return visible;
};

const docVis = () => document.visibilityState === 'visible';
