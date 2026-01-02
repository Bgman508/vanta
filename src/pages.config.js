import Home from './pages/Home';
import ExperienceDetail from './pages/ExperienceDetail';
import Studio from './pages/Studio';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "ExperienceDetail": ExperienceDetail,
    "Studio": Studio,
    "Dashboard": Dashboard,
    "Profile": Profile,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};