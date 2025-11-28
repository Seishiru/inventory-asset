import { AuthProvider } from './components/AuthContext';
import AppContent from './AppContent';
import "./styles/globals.css";

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}