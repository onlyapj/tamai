import Home from './pages/Home';
import Mindfulness from './pages/Mindfulness';
import Finance from './pages/Finance';
import Health from './pages/Health';
import Goals from './pages/Goals';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Mindfulness": Mindfulness,
    "Finance": Finance,
    "Health": Health,
    "Goals": Goals,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};