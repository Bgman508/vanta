import Home from './pages/Home';
import ExperienceDetail from './pages/ExperienceDetail';
import Studio from './pages/Studio';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import StudioDashboard from './pages/StudioDashboard';
import LabelConsole from './pages/LabelConsole';
import PublisherPortal from './pages/PublisherPortal';
import EventRoom from './pages/EventRoom';
import Vault from './pages/Vault';
import Account from './pages/Account';
import Documentation from './pages/Documentation';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "ExperienceDetail": ExperienceDetail,
    "Studio": Studio,
    "Dashboard": Dashboard,
    "Profile": Profile,
    "StudioDashboard": StudioDashboard,
    "LabelConsole": LabelConsole,
    "PublisherPortal": PublisherPortal,
    "EventRoom": EventRoom,
    "Vault": Vault,
    "Account": Account,
    "Documentation": Documentation,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};