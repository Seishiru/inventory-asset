import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Settings, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { toast } from 'sonner';

const LINE_GREEN = '#06C755';

interface ColumnOptionsMenuProps {
  brandOptions: string[];
  onBrandOptionsChange: (options: string[]) => void;
  assetTypeOptions: string[];
  onAssetTypeOptionsChange: (options: string[]) => void;
}

export function ColumnOptionsMenu({
  brandOptions,
  onBrandOptionsChange,
  assetTypeOptions,
  onAssetTypeOptionsChange,
}: ColumnOptionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [newBrand, setNewBrand] = useState('');
  const [newAssetType, setNewAssetType] = useState('');

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
    onBrandOptionsChange(brandOptions.filter((b) => b !== brand));
    toast.success(`Removed brand option: ${brand}`);
  };

  const addAssetTypeOption = () => {
    if (newAssetType.trim() && !assetTypeOptions.includes(newAssetType.trim())) {
      onAssetTypeOptionsChange([...assetTypeOptions, newAssetType.trim()]);
      setNewAssetType('');
      toast.success(`Added asset type: ${newAssetType.trim()}`);
    } else if (assetTypeOptions.includes(newAssetType.trim())) {
      toast.error('Asset type already exists');
    }
  };

  const removeAssetTypeOption = (assetType: string) => {
    onAssetTypeOptionsChange(assetTypeOptions.filter((a) => a !== assetType));
    toast.success(`Removed asset type: ${assetType}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 hover:bg-green-50 hover:border-green-300"
        >
          <Settings className="h-4 w-4" style={{ color: LINE_GREEN }} />
          Column Options
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Column Options</DialogTitle>
          <DialogDescription>
            Manage your asset type and brand/make options for the inventory system.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Asset Type Options */}
          <div className="space-y-3">
            <h3 className="text-sm">Asset Type Options</h3>
            <div className="flex gap-2">
              <Input
                value={newAssetType}
                onChange={(e) => setNewAssetType(e.target.value)}
                placeholder="Enter asset type..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAssetTypeOption();
                  }
                }}
              />
              <Button
                size="sm"
                onClick={addAssetTypeOption}
                style={{ backgroundColor: LINE_GREEN }}
                className="text-white hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto border rounded-md p-2">
              {assetTypeOptions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No asset types added yet</p>
              ) : (
                assetTypeOptions.map((assetType) => (
                  <div
                    key={assetType}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded border hover:bg-gray-100"
                  >
                    <span className="text-sm">{assetType}</span>
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

          <Separator />

          {/* Brand/Make Options */}
          <div className="space-y-3">
            <h3 className="text-sm">Brand/Make Options</h3>
            <div className="flex gap-2">
              <Input
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                placeholder="Enter brand name..."
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
            <div className="space-y-1 max-h-48 overflow-y-auto border rounded-md p-2">
              {brandOptions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No brands added yet</p>
              ) : (
                brandOptions.map((brand) => (
                  <div
                    key={brand}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded border hover:bg-gray-100"
                  >
                    <span className="text-sm">{brand}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBrandOption(brand)}
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
      </DialogContent>
    </Dialog>
  );
}