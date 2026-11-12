// Aide de lien unique : Link, NavLink et useNavigate gardent utm_source/medium/campaign dans l'adresse des navigations
// internes vers /inscription, /connexion et /app (le pixel Searchtide lit l'URL). Aucun cookie, aucune colonne.
import { forwardRef, useCallback, type ComponentProps } from "react";
import { Link as RLink, NavLink as RNavLink, useNavigate as useRNavigate, type NavigateOptions, type To } from "react-router-dom";
import { keepUtm } from "./track.ts";

const tracked = /^\/(inscription|connexion|app)(?:[/?#]|$)/;
const keep = (to: To): To => (typeof to === "string" && tracked.test(to) ? keepUtm(to) : to);

export const Link = forwardRef<HTMLAnchorElement, ComponentProps<typeof RLink>>(function Link({ to, ...rest }, ref) {
  return <RLink ref={ref} to={keep(to)} {...rest} />;
});
export const NavLink = forwardRef<HTMLAnchorElement, ComponentProps<typeof RNavLink>>(function NavLink({ to, ...rest }, ref) {
  return <RNavLink ref={ref} to={keep(to)} {...rest} />;
});
export function useNavigate() {
  const navigate = useRNavigate();
  // Mémorisée comme celle de react-router : une fonction instable relancerait les effets qui la listent en dépendance.
  return useCallback((to: To | number, options?: NavigateOptions) => (typeof to === "number" ? navigate(to) : navigate(keep(to), options)), [navigate]);
}
