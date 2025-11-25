import { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import {
  X,
  Settings,
  Palette,
  LogOut,
  User,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';

const LINE_GREEN = '#06C755';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  darkMode: boolean;
  onDarkModeChange: (enabled: boolean) => void;
  brandOptions: string[];
  onBrandOptionsChange: (options: string[]) => void;
  statusOptions: string[];
  onStatusOptionsChange: (options: string[]) => void;
  onActivityLogOpen: () => void;
  onGoBackToMainPage?: () => void;
}

export function SettingsPanel({
  open,
  onClose,
  darkMode,
  onDarkModeChange,
  brandOptions,
  onBrandOptionsChange,
  statusOptions,
  onStatusOptionsChange,
  onActivityLogOpen,
  onGoBackToMainPage,
}: SettingsPanelProps) {
  const { user, logout } = useAuth();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [newBrand, setNewBrand] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [optionsOpen, setOptionsOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);

  const handleLogout = () => {
    logout();
    setLogoutDialogOpen(false);
    toast.success('Logged out successfully');
    onClose();
  };

  const addBrandOption = () => {
    if (newBrand.trim() && !brandOptions.includes(newBrand.trim())) {
      onBrandOptionsChange([...brandOptions, newBrand.trim()]);
      setNewBrand('');
      toast.success(`Added brand option: ${newBrand.trim()}`);
    } else if (brandOptions.includes(newBrand.trim())) {
      toast.error('Brand option already exists');
    }
  };

  const removeBrandOption = (brand: string) => {
    onBrandOptionsChange(brandOptions.filter(b => b !== brand));
    toast.success(`Removed brand option: ${brand}`);
  };

  const addStatusOption = () => {
    if (newStatus.trim() && !statusOptions.includes(newStatus.trim())) {
      onStatusOptionsChange([...statusOptions, newStatus.trim()]);
      setNewStatus('');
      toast.success(`Added status option: ${newStatus.trim()}`);
    } else if (statusOptions.includes(newStatus.trim())) {
      toast.error('Status option already exists');
    }
  };

  const removeStatusOption = (status: string) => {
    onStatusOptionsChange(statusOptions.filter(s => s !== status));
    toast.success(`Removed status option: ${status}`);
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
        className={`dark:bg-gray-900 dark:border-r dark:border-gray-700 fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="dark:border-gray-700 flex items-center justify-between p-4 border-b" style={{ borderColor: LINE_GREEN }}>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" style={{ color: LINE_GREEN }} />
              <h2 className="text-lg">Settings & Options</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="dark:hover:bg-gray-800 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User Info */}
          {user && (
            <div className="dark:bg-gray-800 dark:border-gray-700 p-4 border-b" style={{ backgroundColor: '#f0fdf4' }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center h-10 w-10 rounded-full text-white"
                  style={{ backgroundColor: LINE_GREEN }}
                >
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="dark:text-white text-sm text-gray-900">{user.username}</p>
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Options Section */}
            <Collapsible open={optionsOpen} onOpenChange={setOptionsOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="dark:hover:bg-gray-800 w-full justify-between p-2 hover:bg-gray-100"
                >
                  <span className="text-sm">Column Options</span>
                  {optionsOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-2">
                {/* Brand/Make Options */}
                <div className="space-y-2">
                  <Label className="text-sm">Brand/Make Options</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newBrand}
                      onChange={(e) => setNewBrand(e.target.value)}
                      placeholder="Add brand..."
                      className="dark:bg-gray-800 dark:border-gray-700"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addBrandOption();
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={addBrandOption}
                      style={{ backgroundColor: LINE_GREEN }}
                      className="text-white hover:opacity-90"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {brandOptions.map((brand) => (
                      <div
                        key={brand}
                        className="dark:bg-gray-800 dark:border-gray-700 flex items-center justify-between p-2 bg-gray-50 rounded border"
                      >
                        <span className="text-sm">{brand}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBrandOption(brand)}
                          className="dark:hover:bg-red-900 h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Status Options */}
                <div className="space-y-2">
                  <Label className="text-sm">Status Options</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      placeholder="Add status..."
                      className="dark:bg-gray-800 dark:border-gray-700"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addStatusOption();
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={addStatusOption}
                      style={{ backgroundColor: LINE_GREEN }}
                      className="text-white hover:opacity-90"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {statusOptions.map((status) => (
                      <div
                        key={status}
                        className="dark:bg-gray-800 dark:border-gray-700 flex items-center justify-between p-2 bg-gray-50 rounded border"
                      >
                        <span className="text-sm">{status}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStatusOption(status)}
                          className="dark:hover:bg-red-900 h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Settings Section */}
            <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="dark:hover:bg-gray-800 w-full justify-between p-2 hover:bg-gray-100"
                >
                  <span className="text-sm">Settings</span>
                  {settingsOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-2">
                {/* Go Back to Main Page */}
                {onGoBackToMainPage && (
                  <Button
                    variant="outline"
                    className="dark:hover:bg-gray-800 dark:border-gray-700 w-full justify-start gap-2 hover:bg-green-50 hover:border-green-300"
                    onClick={() => {
                      onGoBackToMainPage();
                      onClose();
                    }}
                    style={{ 
                      borderColor: darkMode ? undefined : LINE_GREEN,
                    }}
                  >
                    <Home className="h-4 w-4" style={{ color: LINE_GREEN }} />
                    <span>Go Back to Main Page</span>
                  </Button>
                )}

                {/* Activity Log */}
                <Button
                  variant="outline"
                  className="dark:hover:bg-gray-800 dark:border-gray-700 w-full justify-start gap-2 hover:bg-green-50 hover:border-green-300"
                  onClick={() => {
                    onActivityLogOpen();
                    onClose();
                  }}
                  style={{ 
                    borderColor: darkMode ? undefined : LINE_GREEN,
                  }}
                >
                  <Activity className="h-4 w-4" style={{ color: LINE_GREEN }} />
                  <span>Activity Log</span>
                </Button>

                {/* Dark Mode */}
                <div className="dark:bg-gray-800 dark:border-gray-700 flex items-center justify-between p-3 bg-gray-50 rounded border">
                  <div className="flex items-center gap-2">
                    <Palette className="dark:text-gray-300 h-4 w-4 text-gray-600" />
                    <Label htmlFor="dark-mode" className="text-sm cursor-pointer">
                      Dark Mode
                    </Label>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={darkMode}
                    onCheckedChange={onDarkModeChange}
                  />
                </div>

                {/* Logout */}
                <Button
                  variant="outline"
                  className="dark:hover:bg-red-900 dark:border-gray-700 w-full justify-start gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                  onClick={() => setLogoutDialogOpen(true)}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </CollapsibleContent>
            </Collapsible>
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
