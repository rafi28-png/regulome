import { createBrowserRouter } from 'react-router-dom';

// Pages
import LandingPage from '@/pages/LandingPage';
import OnboardingPage from '@/pages/OnboardingPage';
import DashboardPage from '@/pages/DashboardPage';
import VariantExplorerPage from '@/pages/VariantExplorerPage';
import VariantDetailPage from '@/pages/VariantDetailPage';
import GeneExpressionPage from '@/pages/GeneExpressionPage';
import NetworkAtlasPage from '@/pages/NetworkAtlasPage';
import GenomeExplorerPage from '@/pages/GenomeExplorerPage';
import DiseaseHubPage from '@/pages/DiseaseHubPage';
import EpigeneticClockPage from '@/pages/EpigeneticClockPage';
import OptimizationStudioPage from '@/pages/OptimizationStudioPage';
import SimulatorPage from '@/pages/SimulatorPage';
import EvidenceStudioPage from '@/pages/EvidenceStudioPage';
import ResearchWorkbenchPage from '@/pages/ResearchWorkbenchPage';
import ReportCenterPage from '@/pages/ReportCenterPage';
import HotspotAtlasPage from '@/pages/HotspotAtlasPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import DesignSystemPage from '@/pages/DesignSystemPage';
import DataStudioPage from '@/pages/DataStudioPage';
import SettingsPage from '@/pages/SettingsPage';

// Layout
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

export const router = createBrowserRouter([
  // Public routes (no sidebar)
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/onboarding',
    element: <OnboardingPage />,
  },

  // App routes (with sidebar layout)
  {
    path: '/app',
    element: <AppLayout />,
    children: [
      // Default app route → Dashboard (needs auth + upload in real mode)
      { index: true, element: <ProtectedRoute requireAuth requireUpload><DashboardPage /></ProtectedRoute> },

      // Auth required, but upload NOT required (accessible before uploading)
      { path: 'data-studio', element: <ProtectedRoute requireAuth><DataStudioPage /></ProtectedRoute> },
      { path: 'workbench', element: <ProtectedRoute requireAuth><ResearchWorkbenchPage /></ProtectedRoute> },
      { path: 'settings', element: <ProtectedRoute requireAuth><SettingsPage /></ProtectedRoute> },

      // Auth + upload required (needs genome data to show anything)
      { path: 'dashboard', element: <ProtectedRoute requireAuth requireUpload><DashboardPage /></ProtectedRoute> },
      { path: 'variants', element: <ProtectedRoute requireAuth requireUpload><VariantExplorerPage /></ProtectedRoute> },
      { path: 'variants/:variantId', element: <ProtectedRoute requireAuth requireUpload><VariantDetailPage /></ProtectedRoute> },
      { path: 'expression', element: <ProtectedRoute requireAuth requireUpload><GeneExpressionPage /></ProtectedRoute> },
      { path: 'network', element: <ProtectedRoute requireAuth requireUpload><NetworkAtlasPage /></ProtectedRoute> },
      { path: 'genome-3d', element: <ProtectedRoute requireAuth requireUpload><GenomeExplorerPage /></ProtectedRoute> },
      { path: 'diseases', element: <ProtectedRoute requireAuth requireUpload><DiseaseHubPage /></ProtectedRoute> },
      { path: 'epigenetic-clock', element: <ProtectedRoute requireAuth requireUpload><EpigeneticClockPage /></ProtectedRoute> },
      { path: 'optimization', element: <ProtectedRoute requireAuth requireUpload><OptimizationStudioPage /></ProtectedRoute> },
      { path: 'simulator', element: <ProtectedRoute requireAuth requireUpload><SimulatorPage /></ProtectedRoute> },
      { path: 'evidence', element: <ProtectedRoute requireAuth requireUpload><EvidenceStudioPage /></ProtectedRoute> },
      { path: 'reports', element: <ProtectedRoute requireAuth requireUpload><ReportCenterPage /></ProtectedRoute> },
      { path: 'atlas', element: <ProtectedRoute requireAuth requireUpload><HotspotAtlasPage /></ProtectedRoute> },
      { path: 'design-system', element: <DesignSystemPage /> },
    ],
  },
], { basename: '/regulome' });

// Route metadata for navigation
export interface RouteMetadata {
  path: string;
  label: string;
  icon: string;
  section: string;
}

export const appRoutes: RouteMetadata[] = [
  { path: '/app/data-studio', label: 'Data Studio', icon: 'UploadCloud', section: 'Core' },
  { path: '/app/dashboard', label: 'Dashboard', icon: 'LayoutDashboard', section: 'Core' },
  { path: '/app/variants', label: 'Variant Explorer', icon: 'Dna', section: 'Core' },
  { path: '/app/expression', label: 'Gene Expression', icon: 'Activity', section: 'Core' },
  { path: '/app/network', label: 'Network Atlas', icon: 'Network', section: 'Visualization' },
  { path: '/app/genome-3d', label: '3D Genome', icon: 'Globe', section: 'Visualization' },
  { path: '/app/atlas', label: 'Hotspot Atlas', icon: 'Map', section: 'Visualization' },
  { path: '/app/diseases', label: 'Disease Hub', icon: 'HeartPulse', section: 'Analysis' },
  { path: '/app/epigenetic-clock', label: 'Epigenetic Clock', icon: 'Clock', section: 'Analysis' },
  { path: '/app/simulator', label: 'Twin Simulator', icon: 'FlaskConical', section: 'Analysis' },
  { path: '/app/optimization', label: 'Optimization', icon: 'Target', section: 'Lifestyle' },
  { path: '/app/evidence', label: 'Evidence Studio', icon: 'BookOpen', section: 'Research' },
  { path: '/app/workbench', label: 'Workbench', icon: 'Wrench', section: 'Research' },
  { path: '/app/reports', label: 'Reports', icon: 'FileText', section: 'Research' },
  { path: '/app/settings', label: 'Settings', icon: 'Settings', section: 'System' },
];
