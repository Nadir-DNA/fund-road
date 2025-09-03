/**
 * Compatibility layer for react-router-dom to Next.js migration
 * This provides temporary compatibility while we migrate components
 */
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import React from 'react';

export const useNavigate = () => {
  const router = useRouter();
  
  return useCallback((to: string | number) => {
    if (typeof to === 'number') {
      if (to === -1) {
        router.back();
      } else {
        window.history.go(to);
      }
    } else {
      router.push(to);
    }
  }, [router]);
};

export const useLocation = () => {
  const router = useRouter();
  
  return {
    pathname: router.pathname,
    search: router.asPath.includes('?') ? router.asPath.split('?')[1] : '',
    hash: '',
    state: null,
    key: router.asPath
  };
};

export const useSearchParams = () => {
  const router = useRouter();
  const searchParams = new URLSearchParams(router.asPath.split('?')[1] || '');
  
  const setSearchParams = useCallback((params: URLSearchParams | Record<string, string>) => {
    const newParams = params instanceof URLSearchParams ? params : new URLSearchParams(params);
    const newPath = `${router.pathname}?${newParams.toString()}`;
    router.push(newPath);
  }, [router]);
  
  return [searchParams, setSearchParams] as const;
};

export const useParams = () => {
  const router = useRouter();
  return router.query as Record<string, string>;
};

// Link component compatibility
interface LinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

export const Link: React.FC<LinkProps> = ({ to, children, className, ...props }) => {
  const router = useRouter();
  
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    router.push(to);
  }, [router, to]);
  
  return React.createElement('a', {
    href: to,
    onClick: handleClick,
    className,
    ...props
  }, children);
};

export const NavLink = Link; // Simple alias for now

export const Outlet = () => {
  // In Next.js, children are rendered differently
  return null;
};