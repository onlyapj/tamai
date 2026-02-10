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
import AIAssistant from './pages/AIAssistant';
import AdminFeedback from './pages/AdminFeedback';
import Analytics from './pages/Analytics';
import BusinessDashboard from './pages/BusinessDashboard';
import BusinessHome from './pages/BusinessHome';
import Calendar from './pages/Calendar';
import Finance from './pages/Finance';
import FinanceCFO from './pages/FinanceCFO';
import Goals from './pages/Goals';
import GoalsOKR from './pages/GoalsOKR';
import Health from './pages/Health';
import Home from './pages/Home';
import Investments from './pages/Investments';
import Landing from './pages/Landing';
import Mindfulness from './pages/Mindfulness';
import NotificationSettings from './pages/NotificationSettings';
import Organizations from './pages/Organizations';
import Profile from './pages/Profile';
import RecurringTransactions from './pages/RecurringTransactions';
import SharedProjects from './pages/SharedProjects';
import TaskManager from './pages/TaskManager';
import TeamManagement from './pages/TeamManagement';
import TrueLayerCallback from './pages/TrueLayerCallback';
import UserManagement from './pages/UserManagement';
import Wearable from './pages/Wearable';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIAssistant": AIAssistant,
    "AdminFeedback": AdminFeedback,
    "Analytics": Analytics,
    "BusinessDashboard": BusinessDashboard,
    "BusinessHome": BusinessHome,
    "Calendar": Calendar,
    "Finance": Finance,
    "FinanceCFO": FinanceCFO,
    "Goals": Goals,
    "GoalsOKR": GoalsOKR,
    "Health": Health,
    "Home": Home,
    "Investments": Investments,
    "Landing": Landing,
    "Mindfulness": Mindfulness,
    "NotificationSettings": NotificationSettings,
    "Organizations": Organizations,
    "Profile": Profile,
    "RecurringTransactions": RecurringTransactions,
    "SharedProjects": SharedProjects,
    "TaskManager": TaskManager,
    "TeamManagement": TeamManagement,
    "TrueLayerCallback": TrueLayerCallback,
    "UserManagement": UserManagement,
    "Wearable": Wearable,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};