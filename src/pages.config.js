import Account from './pages/Account';
import ActivityFeed from './pages/ActivityFeed';
import Admin from './pages/Admin';
import Artist from './pages/Artist';
import Collections from './pages/Collections';
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
import Settings from './pages/Settings';
import Studio from './pages/Studio';
import StudioDashboard from './pages/StudioDashboard';
import Terms from './pages/Terms';
import Trending from './pages/Trending';
import Vault from './pages/Vault';
import Messages from './pages/Messages';
import Leaderboard from './pages/Leaderboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Account": Account,
    "ActivityFeed": ActivityFeed,
    "Admin": Admin,
    "Artist": Artist,
    "Collections": Collections,
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
    "Settings": Settings,
    "Studio": Studio,
    "StudioDashboard": StudioDashboard,
    "Terms": Terms,
    "Trending": Trending,
    "Vault": Vault,
    "Messages": Messages,
    "Leaderboard": Leaderboard,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};