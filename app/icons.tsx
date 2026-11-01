// Icônes Font Awesome (libre, open source) exposées sous les noms déjà utilisés dans l'app
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowRight,
  faArrowUpRightFromSquare,
  faBars,
  faBuilding,
  faChartPie,
  faCheck,
  faChevronRight,
  faCircleCheck,
  faCircleExclamation,
  faClock,
  faComments,
  faCreditCard,
  faDownload,
  faFileLines,
  faFolderOpen,
  faGear,
  faGift,
  faGlobe,
  faLink,
  faMagnifyingGlass,
  faPaperPlane,
  faPlus,
  faRightFromBracket,
  faRotateRight,
  faShieldHalved,
  faSliders,
  faSun,
  faMoon,
  faUpload,
  faUsers,
  faListCheck,
  faXmark,
  faLocationDot,
  faCoins,
  faSeedling,
} from "@fortawesome/free-solid-svg-icons";

const icon =
  (def: IconDefinition) =>
  ({ size = 18 }: { size?: number }) => (
    <FontAwesomeIcon
      icon={def}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );

export const ArrowRight = icon(faArrowRight);
export const ArrowUpRight = icon(faArrowRight);
export const ExternalLink = icon(faArrowUpRightFromSquare);
export const Menu = icon(faBars);
export const X = icon(faXmark);
export const Building2 = icon(faBuilding);
export const LayoutDashboard = icon(faChartPie);
export const Check = icon(faCheck);
export const ChevronRight = icon(faChevronRight);
export const CheckCircle2 = icon(faCircleCheck);
export const AlertCircle = icon(faCircleExclamation);
export const Clock = icon(faClock);
export const MessageSquare = icon(faComments);
export const CreditCard = icon(faCreditCard);
export const Download = icon(faDownload);
export const FileText = icon(faFileLines);
export const FolderOpen = icon(faFolderOpen);
export const Settings = icon(faGear);
export const Gift = icon(faGift);
export const Globe = icon(faGlobe);
export const Link2 = icon(faLink);
export const Search = icon(faMagnifyingGlass);
export const Send = icon(faPaperPlane);
export const Plus = icon(faPlus);
export const LogOut = icon(faRightFromBracket);
export const RefreshCw = icon(faRotateRight);
export const ShieldCheck = icon(faShieldHalved);
export const SlidersHorizontal = icon(faSliders);
export const Upload = icon(faUpload);
export const Users = icon(faUsers);
export const Sparkles = icon(faListCheck);
export const MapPin = icon(faLocationDot);
export const Coins = icon(faCoins);
export const Seedling = icon(faSeedling);
export const Sun = icon(faSun);
export const Moon = icon(faMoon);
