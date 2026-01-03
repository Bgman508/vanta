import Account from './pages/Account';
import Dashboard from './pages/Dashboard';
import Documentation from './pages/Documentation';
import EventRoom from './pages/EventRoom';
import ExperienceDetail from './pages/ExperienceDetail';
import Home from './pages/Home';
import LabelConsole from './pages/LabelConsole';
import Profile from './pages/Profile';
import PublisherPortal from './pages/PublisherPortal';
import Studio from './pages/Studio';
import StudioDashboard from './pages/StudioDashboard';
import Vault from './pages/Vault';
import Onboarding from './pages/Onboarding';
import Favorites from './pages/Favorites';
import Notifications from './pages/Notifications';
import Artist from './pages/Artist';
import Admin from './pages/Admin';
import ActivityFeed from './pages/ActivityFeed';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Account": Account,
    "Dashboard": Dashboard,
    "Documentation": Documentation,
    "EventRoom": EventRoom,
    "ExperienceDetail": ExperienceDetail,
    "Home": Home,
    "LabelConsole": LabelConsole,
    "Profile": Profile,
    "PublisherPortal": PublisherPortal,
    "Studio": Studio,
    "StudioDashboard": StudioDashboard,
    "Vault": Vault,
    "Onboarding": Onboarding,
    "Favorites": Favorites,
    "Notifications": Notifications,
    "Artist": Artist,
    "Admin": Admin,
    "ActivityFeed": ActivityFeed,
    "Terms": Terms,
    "Privacy": Privacy,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};