
import { Navigate } from "react-router-dom";

export default function Roadmap() {
  // This is now just a redirect to the new roadmap page
  return <Navigate to="/roadmap" replace />;
}
