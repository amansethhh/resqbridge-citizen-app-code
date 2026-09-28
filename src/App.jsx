import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import { EmergencyProvider } from '@/state/EmergencyContext';
import AppLogo from '@/components/resqbridge/AppLogo';
// Add page imports here
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Onboarding from '@/pages/Onboarding';
import ProfileSetup from '@/pages/ProfileSetup';
import MainLayout from '@/components/resqbridge/MainLayout';
import Home from '@/pages/Home';
import Notifications from '@/pages/Notifications';
import ProfileHistory from '@/pages/ProfileHistory';
import FamilySharing from '@/pages/FamilySharing';
import EmergencyActivation from '@/pages/EmergencyActivation';
import EmergencyDetails from '@/pages/EmergencyDetails';
import MultimodalEvidence from '@/pages/MultimodalEvidence';
import VoiceRecording from '@/pages/VoiceRecording';
import ImageCapture from '@/pages/ImageCapture';
import AIImageAnalysis from '@/pages/AIImageAnalysis';
import AIEmergencySummary from '@/pages/AIEmergencySummary';
import LocationScreen from '@/pages/LocationScreen';
import NearbyHospitals from '@/pages/NearbyHospitals';
import EmergencyConfirmation from '@/pages/EmergencyConfirmation';
import EmergencyActive from '@/pages/EmergencyActive';
import AmbulanceAssigned from '@/pages/AmbulanceAssigned';
import LiveTracking from '@/pages/LiveTracking';
import HandoverCompletion from '@/pages/HandoverCompletion';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show branded splash while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center rq-bg-gradient gap-4">
        <AppLogo size="xl" showText={false} />
        <div>
          <p className="text-2xl font-extrabold text-rq-navy text-center">
            Res<span className="text-rq-primary">Q</span>Bridge
          </p>
          <p className="text-[10px] uppercase tracking-widest text-rq-muted text-center mt-1">
            Faster Response. Brighter Lives.
          </p>
        </div>
        <div className="w-8 h-8 border-4 border-rq-primary/20 border-t-rq-primary rounded-full animate-spin mt-2"></div>
        <p className="text-sm text-rq-muted">Loading ResQBridge…</p>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/family" element={<FamilySharing />} />

        <Route path="/emergency/activate" element={<EmergencyActivation />} />
        <Route path="/emergency/details" element={<EmergencyDetails />} />
        <Route path="/emergency/evidence" element={<MultimodalEvidence />} />
        <Route path="/emergency/voice" element={<VoiceRecording />} />
        <Route path="/emergency/camera" element={<ImageCapture />} />
        <Route path="/emergency/ai-analysis" element={<AIImageAnalysis />} />
        <Route path="/emergency/ai-summary" element={<AIEmergencySummary />} />
        <Route path="/emergency/location" element={<LocationScreen />} />
        <Route path="/emergency/hospitals" element={<NearbyHospitals />} />
        <Route path="/emergency/confirm" element={<EmergencyConfirmation />} />
        <Route path="/emergency/active" element={<EmergencyActive />} />
        <Route path="/emergency/ambulance" element={<AmbulanceAssigned />} />
        <Route path="/emergency/tracking" element={<LiveTracking />} />
        <Route path="/emergency/handover" element={<HandoverCompletion />} />

        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<ProfileHistory />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <EmergencyProvider>
            <AuthenticatedApp />
          </EmergencyProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App