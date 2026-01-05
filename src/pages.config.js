import Account from './pages/Account';
import ActivityFeed from './pages/ActivityFeed';
import Admin from './pages/Admin';
import Artist from './pages/Artist';
import Dashboard from './pages/Dashboard';
import Documentation from './pages/Documentation';
import EventRoom from './pages/EventRoom';
import ExperienceDetail from './pages/ExperienceDetail';
import Favorites from './pages/Favorites';
import Home from './pages/Home';
import LabelConsole from './pages/LabelConsole';
import Notifications from './pages/Notifications';
import Onboarding from './pages/Onboarding';
import Privacy from './pages/Privacy';
import Profile from './pages/Profile';
import PublisherPortal from './pages/PublisherPortal';
import Search from './pages/Search';
import Studio from './pages/Studio';
import StudioDashboard from './pages/StudioDashboard';
import Terms from './pages/Terms';
import Vault from './pages/Vault';
import Trending from './pages/Trending';
import Collections from './pages/Collections';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Account": Account,
    "ActivityFeed": ActivityFeed,
    "Admin": Admin,
    "Artist": Artist,
    "Dashboard": Dashboard,
    "Documentation": Documentation,
    "EventRoom": EventRoom,
    "ExperienceDetail": ExperienceDetail,
    "Favorites": Favorites,
    "Home": Home,
    "LabelConsole": LabelConsole,
    "Notifications": Notifications,
    "Onboarding": Onboarding,
    "Privacy": Privacy,
    "Profile": Profile,
    "PublisherPortal": PublisherPortal,
    "Search": Search,
    "Studio": Studio,
    "StudioDashboard": StudioDashboard,
    "Terms": Terms,
    "Vault": Vault,
    "Trending": Trending,
    "Collections": Collections,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};