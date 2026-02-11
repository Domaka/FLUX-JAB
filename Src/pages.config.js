import Dashboard from './pages/Dashboard';
import ProductBuilder from './pages/ProductBuilder';
import CreativeLab from './pages/CreativeLab';
import Analytics from './pages/Analytics';
import MarketFinder from './pages/MarketFinder';
import MarketProductFit from './pages/MarketProductFit';
import PlanningReadiness from './pages/PlanningReadiness';
import CreativeMessaging from './pages/CreativeMessaging';
import AnalyticsForecasting from './pages/AnalyticsForecasting';
import RiskSimulation from './pages/RiskSimulation';
import PlaybooksModes from './pages/PlaybooksModes';
import PostLaunch from './pages/PostLaunch';
import Home from './pages/Home';
import AudienceChannels from './pages/AudienceChannels';
import Resources from './pages/Resources';
import ProjectView from './pages/ProjectView';
import BMCBuilder from './pages/BMCBuilder';
import Copilot from './pages/Copilot';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "ProductBuilder": ProductBuilder,
    "CreativeLab": CreativeLab,
    "Analytics": Analytics,
    "MarketFinder": MarketFinder,
    "MarketProductFit": MarketProductFit,
    "PlanningReadiness": PlanningReadiness,
    "CreativeMessaging": CreativeMessaging,
    "AnalyticsForecasting": AnalyticsForecasting,
    "RiskSimulation": RiskSimulation,
    "PlaybooksModes": PlaybooksModes,
    "PostLaunch": PostLaunch,
    "Home": Home,
    "AudienceChannels": AudienceChannels,
    "Resources": Resources,
    "ProjectView": ProjectView,
    "BMCBuilder": BMCBuilder,
    "Copilot": Copilot,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};