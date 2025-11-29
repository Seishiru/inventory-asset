import { useState } from 'react';
import { Button } from './ui/button';      
import { Badge } from './ui/badge';       
import {
  X,
  Settings,
  LogOut,
  User,
  Activity,
  Home,
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

const LINE_GREEN = '#06C755';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  onActivityLogOpen: () => void;
  onGoBackToMainPage?: () => void;
}

export function SettingsPanel({
  open,
  onClose,
  onActivityLogOpen,
  onGoBackToMainPage,
}: SettingsPanelProps) {
  const { user, logout } = useAuth();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  

  const handleLogout = () => {
    logout();
    setLogoutDialogOpen(false);
    toast.success('Logged out successfully');
    onClose();
  };
  

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Side Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: LINE_GREEN }}>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" style={{ color: LINE_GREEN }} />
              <h2 className="text-lg">Settings & Options</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-4 border-b" style={{ backgroundColor: '#f0fdf4' }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center h-10 w-10 rounded-full text-white"
                  style={{ backgroundColor: LINE_GREEN }}
                >
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">{user.username}</p>
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{ borderColor: LINE_GREEN, color: LINE_GREEN }}
                  >
                    {user.role}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Settings Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Navigation</h3>

              {/* Go Back to Main Page */}
              {onGoBackToMainPage && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 hover:bg-green-50 hover:border-green-300"
                  onClick={() => {
                    onGoBackToMainPage();
                    onClose();
                  }}
                >
                  <Home className="h-4 w-4" style={{ color: LINE_GREEN }} />
                  <span>Go Back to Main Page</span>
                </Button>
              )}

              {/* Activity Log */}
              <Button
                variant="outline"
                className="w-full justify-start gap-2 hover:bg-green-50 hover:border-green-300"
                onClick={onActivityLogOpen}
              >
                <Activity className="h-4 w-4" style={{ color: LINE_GREEN }} />
                <span>Activity Log</span>
              </Button>

              {/* Logout */}
              <Button
                variant="outline"
                className="w-full justify-start gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                onClick={() => setLogoutDialogOpen(true)}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>

            {/* (Brand and Asset Type management moved to ColumnOptionsMenu) */}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You'll need to login again to access the Asset
              Inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="text-white"
              style={{ backgroundColor: LINE_GREEN }}
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 