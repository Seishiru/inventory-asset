import { useState } from 'react';
import { Button } from './ui/button';      
import { Label } from './ui/label';        
import { Input } from './ui/input';        
import { Badge } from './ui/badge';        
import { Separator } from './ui/separator';
import {
  X,
  Settings,
  LogOut,
  User,
  Plus,
  Trash2,
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
  brandOptions: string[];
  onBrandOptionsChange: (options: string[]) => void;
  onAddBrand: (brandName: string) => void;
  onDeleteBrand: (brandName: string) => void;
  assetTypeOptions: string[];
  onAssetTypeOptionsChange: (options: string[]) => void;
  onAddAssetType: (assetType: string) => void;
  onActivityLogOpen: () => void;
  onGoBackToMainPage?: () => void;
}

export function SettingsPanel({
  open,
  onClose,
  brandOptions,
  onAddBrand,
  onDeleteBrand,
  assetTypeOptions,
  onAssetTypeOptionsChange,
  onAddAssetType,
  onActivityLogOpen,
  onGoBackToMainPage,
}: SettingsPanelProps) {
  const { user, logout } = useAuth();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [newBrand, setNewBrand] = useState('');
  const [newAssetType, setNewAssetType] = useState('');

  const handleLogout = () => {
    logout();
    setLogoutDialogOpen(false);
    toast.success('Logged out successfully');
    onClose();
  };

  const handleAddBrand = async () => {
    if (newBrand.trim() && !brandOptions.includes(newBrand.trim())) {
      try {
        await onAddBrand(newBrand.trim());
        setNewBrand('');
      } catch (error) {
        toast.error('Failed to add brand');
      }
    } else if (brandOptions.includes(newBrand.trim())) {
      toast.error('Brand option already exists');
    }
  };

  const handleRemoveBrand = async (brand: string) => {
    try {
      await onDeleteBrand(brand);
    } catch (error) {
      toast.error('Failed to delete brand');
    }
  };

  const handleAddAssetType = () => {
    if (newAssetType.trim() && !assetTypeOptions.includes(newAssetType.trim())) {
      onAddAssetType(newAssetType.trim());
      setNewAssetType('');
    } else if (assetTypeOptions.includes(newAssetType.trim())) {
      toast.error('Asset type already exists');
    }
  };

  const removeAssetTypeOption = (assetType: string) => {
    onAssetTypeOptionsChange(assetTypeOptions.filter(a => a !== assetType));
    toast.success(`Removed asset type: ${assetType}`);
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

            <Separator />

            {/* Brand Management Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Brand Management</h3>
              
              <div className="space-y-2">
                <Label htmlFor="newBrand">Add New Brand</Label>
                <div className="flex gap-2">
                  <Input
                    id="newBrand"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    placeholder="Enter brand name"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddBrand();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleAddBrand}
                    size="sm"
                    style={{ backgroundColor: LINE_GREEN }}
                    className="text-white hover:opacity-90"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Available Brands</Label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {brandOptions.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-2">No brands added yet</p>
                  ) : (
                    brandOptions.map((brand) => (
                      <div
                        key={brand}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                      >
                        <span>{brand}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveBrand(brand)}
                          className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Asset Type Management Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Asset Type Management</h3>
              
              <div className="space-y-2">
                <Label htmlFor="newAssetType">Add New Asset Type</Label>
                <div className="flex gap-2">
                  <Input
                    id="newAssetType"
                    value={newAssetType}
                    onChange={(e) => setNewAssetType(e.target.value)}
                    placeholder="Enter asset type"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddAssetType();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleAddAssetType}
                    size="sm"
                    style={{ backgroundColor: LINE_GREEN }}
                    className="text-white hover:opacity-90"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Available Asset Types</Label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {assetTypeOptions.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-2">No asset types added yet</p>
                  ) : (
                    assetTypeOptions.map((assetType) => (
                      <div
                        key={assetType}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                      >
                        <span>{assetType}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAssetTypeOption(assetType)}
                          className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
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