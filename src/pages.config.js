/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Academy from './pages/Academy';
import Account from './pages/Account';
import ActivityFeed from './pages/ActivityFeed';
import Admin from './pages/Admin';
import Artist from './pages/Artist';
import BeatsMarketplace from './pages/BeatsMarketplace';
import Collections from './pages/Collections';
import Dashboard from './pages/Dashboard';
import Documentation from './pages/Documentation';
import EventRoom from './pages/EventRoom';
import ExperienceDetail from './pages/ExperienceDetail';
import Favorites from './pages/Favorites';
import Home from './pages/Home';
import LabelConsole from './pages/LabelConsole';
import Leaderboard from './pages/Leaderboard';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Onboarding from './pages/Onboarding';
import Privacy from './pages/Privacy';
import Profile from './pages/Profile';
import PublisherPortal from './pages/PublisherPortal';
import Search from './pages/Search';
import Settings from './pages/Settings';
import Studio from './pages/Studio';
import StudioDashboard from './pages/StudioDashboard';
import Terms from './pages/Terms';
import Trending from './pages/Trending';
import Vault from './pages/Vault';
import MasterclassPlayer from './pages/MasterclassPlayer';
import VirtualEvents from './pages/VirtualEvents';
import StudioBookings from './pages/StudioBookings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Academy": Academy,
    "Account": Account,
    "ActivityFeed": ActivityFeed,
    "Admin": Admin,
    "Artist": Artist,
    "BeatsMarketplace": BeatsMarketplace,
    "Collections": Collections,
    "Dashboard": Dashboard,
    "Documentation": Documentation,
    "EventRoom": EventRoom,
    "ExperienceDetail": ExperienceDetail,
    "Favorites": Favorites,
    "Home": Home,
    "LabelConsole": LabelConsole,
    "Leaderboard": Leaderboard,
    "Messages": Messages,
    "Notifications": Notifications,
    "Onboarding": Onboarding,
    "Privacy": Privacy,
    "Profile": Profile,
    "PublisherPortal": PublisherPortal,
    "Search": Search,
    "Settings": Settings,
    "Studio": Studio,
    "StudioDashboard": StudioDashboard,
    "Terms": Terms,
    "Trending": Trending,
    "Vault": Vault,
    "MasterclassPlayer": MasterclassPlayer,
    "VirtualEvents": VirtualEvents,
    "StudioBookings": StudioBookings,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};