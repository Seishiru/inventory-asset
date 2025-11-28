
import { useState, useEffect } from 'react';
import { useAuth } from './components/AuthContext';
import { LoginDialog } from './components/LoginDialog';
import { SignupDialog } from './components/SignupDialog';
import { LandingPage } from './components/LandingPage';
import { InventoryPage } from './components/InventoryPage';
import { UserManagementPage } from './components/UserManagementPage';
import { ReportsPage } from './components/ReportsPage';
import { MonthlyReportsPage } from './components/MonthlyReportsPage';
import { ActivityLogFullPage } from './components/ActivityLogFullPage';
import AssetInventory from './components/AssetInventory';
import { Button } from './components/ui/button';
import { ArrowLeft, Users, Package } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000/api';

export default function AppContent() {
  const { isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [currentPage, setCurrentPage] = useState<'landing' | 'inventory' | 'user-management' | 'reports' | 'monthly-reports' | 'activity-log'>('landing');
  const [assets, setAssets] = useState<any[]>([]);
  const [accessories, setAccessories] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activities] = useState<any[]>([]);

  // Load data from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        const assetsResponse = await fetch(`${API_BASE_URL}/assets`);
        if (assetsResponse.ok) {
          const assetsData = await assetsResponse.json();
          setAssets(assetsData.items || assetsData);
        }

        const accessoriesResponse = await fetch(`${API_BASE_URL}/accessories`);
        if (accessoriesResponse.ok) {
          const accessoriesData = await accessoriesResponse.json();
          setAccessories(accessoriesData.items || accessoriesData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowLogin(true);
    } else {
      setShowLogin(false);
      setShowSignup(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated && !showLogin && !showSignup) {
      setShowLogin(true);
    }
  }, [isAuthenticated, showLogin, showSignup]);

  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentPage('landing');
    }
  }, [isAuthenticated]);

  const handleSwitchToSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const handleSwitchToLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  const handleLoginOpenChange = (open: boolean) => {
    if (isAuthenticated || open) {
      setShowLogin(open);
    }
  };

  const handleSignupOpenChange = (open: boolean) => {
    if (isAuthenticated || open) {
      setShowSignup(open);
    }
  };

  const handleNavigate = (page: 'landing' | 'inventory' | 'user-management' | 'reports' | 'monthly-reports' | 'activity-log') => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'inventory':
        return (
          <InventoryPage 
            inventoryComponent={
              <AssetInventory 
                onBackToLanding={() => handleNavigate('landing')} 
                onNavigateToActivityLog={() => handleNavigate('activity-log')} 
              />
            }
            onBack={() => handleNavigate('landing')}
          />
        );
      case 'user-management':
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
              <div className="px-6 py-4 flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigate('landing')}
                  className="gap-2 hover:bg-gray-100"
                >
                  <ArrowLeft className="h-4 w-4" style={{ color: '#06C755' }} />
                  <span style={{ color: '#06C755' }}>Back to Main</span>
                </Button>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" style={{ color: '#06C755' }} />
                  <h1 className="text-xl text-gray-900">User Management</h1>
                </div>
              </div>
            </div>
            <UserManagementPage users={users} onUsersChange={setUsers} />
          </div>
        );
      case 'reports':
        return <ReportsPage onBack={() => handleNavigate('landing')} />;
      case 'monthly-reports':
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
              <div className="px-6 py-4 flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigate('landing')}
                  className="gap-2 hover:bg-gray-100"
                >
                  <ArrowLeft className="h-4 w-4" style={{ color: '#06C755' }} />
                  <span style={{ color: '#06C755' }}>Back to Main</span>
                </Button>
              </div>
            </div>
            <MonthlyReportsPage assets={assets} accessories={accessories} />
          </div>
        );
      case 'activity-log':
        return <ActivityLogFullPage activities={activities} onBack={() => handleNavigate('landing')} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      {isAuthenticated ? (
        renderCurrentPage()
      ) : (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#06C755' }}>
                <Package className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl text-gray-900 mb-2">Asset Inventory</h1>
            <p className="text-gray-600 mb-6">Please login to continue</p>
          </div>
        </div>
      )}
      
      <LoginDialog
        open={showLogin}
        onOpenChange={handleLoginOpenChange}
        onSwitchToSignup={handleSwitchToSignup}
      />
      
      <SignupDialog
        open={showSignup}
        onOpenChange={handleSignupOpenChange}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </>
  );
}