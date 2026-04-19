import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Reset window scroll to top on every route change.
 * Mount once inside <BrowserRouter>.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
