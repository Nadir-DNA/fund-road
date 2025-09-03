import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Component pour optimiser les performances et SEO globalement
export const SeoOptimizedApp = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  useEffect(() => {
    // Optimization 1: Scroll to top on route change
    window.scrollTo(0, 0);

    // Optimization 2: Update viewport meta for mobile
    const viewportMeta = document.querySelector('meta[name=viewport]');
    if (viewportMeta) {
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
    }

    // Optimization 3: Remove unused CSS classes (basic cleanup)
    const removeUnusedClasses = () => {
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        const classList = element.classList;
        if (classList.length === 0) return;
        
        // Remove empty or invalid classes
        Array.from(classList).forEach(className => {
          if (!className || className.trim() === '') {
            element.classList.remove(className);
          }
        });
      });
    };

    // Defer cleanup to avoid blocking main thread
    const idleCallback = (window as any).requestIdleCallback || ((cb: () => void) => setTimeout(cb, 1));
    idleCallback(removeUnusedClasses);

    // Optimization 4: Preload next likely page
    const preloadNextPage = () => {
      const currentPath = location.pathname;
      let nextPath = '';
      
      // Predict next likely page based on user journey
      switch (currentPath) {
        case '/':
          nextPath = '/fonctionnalites';
          break;
        case '/fonctionnalites':
          nextPath = '/blog';
          break;
        case '/blog':
          nextPath = '/contact';
          break;
        case '/contact':
          nextPath = '/tarifs';
          break;
        default:
          nextPath = '/';
      }

      // Preload the next page
      if (nextPath) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = nextPath;
        document.head.appendChild(link);
      }
    };

    // Defer preloading
    setTimeout(preloadNextPage, 2000);

  }, [location.pathname]);

  useEffect(() => {
    // Optimization 5: Improve Core Web Vitals
    const optimizeWebVitals = () => {
      // Reduce layout shifts by setting dimensions
      const images = document.querySelectorAll('img:not([width]):not([height])');
      images.forEach(img => {
        const htmlImg = img as HTMLImageElement;
        if (!img.hasAttribute('width') && !img.hasAttribute('height')) {
          // Set aspect ratio to prevent layout shift
          htmlImg.style.aspectRatio = '16/9';
        }
      });

      // Optimize button interactions
      const buttons = document.querySelectorAll('button, [role="button"]');
      buttons.forEach(button => {
        if (!button.hasAttribute('aria-label') && button.textContent) {
          button.setAttribute('aria-label', button.textContent.trim());
        }
      });
    };

    // Run optimizations when DOM is ready
    if (document.readyState === 'complete') {
      optimizeWebVitals();
    } else {
      window.addEventListener('load', optimizeWebVitals);
      return () => window.removeEventListener('load', optimizeWebVitals);
    }
  }, []);

  return <>{children}</>;
};

// Hook for manual SEO optimizations
export const useSeoOptimizations = () => {
  const optimizeImages = () => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // Add loading="lazy" if not already present
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
      
      // Add decoding="async" for better performance
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }
      
      // Ensure alt attribute exists
      if (!img.hasAttribute('alt')) {
        img.setAttribute('alt', 'Image Fund Road');
      }
    });
  };

  const optimizeLinks = () => {
    const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="fundroad.com"])');
    externalLinks.forEach(link => {
      // Add security attributes to external links
      link.setAttribute('rel', 'noopener noreferrer');
      link.setAttribute('target', '_blank');
    });
  };

  const optimizeHeadings = () => {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let h1Count = 0;
    
    headings.forEach(heading => {
      if (heading.tagName === 'H1') {
        h1Count++;
        if (h1Count > 1) {
          console.warn('Multiple H1 tags detected. Consider using H2-H6 for better SEO.');
        }
      }
    });
  };

  return {
    optimizeImages,
    optimizeLinks,
    optimizeHeadings,
    runAllOptimizations: () => {
      optimizeImages();
      optimizeLinks();
      optimizeHeadings();
    }
  };
};