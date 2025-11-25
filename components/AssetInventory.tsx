// components/AssetInventory.tsx (or wherever you're using AssetDialog)
import { useState, useEffect } from 'react';
import { AssetDialog, Asset } from './AssetDialog';
import { FilterBar } from './FilterBar';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';

export function AssetInventory() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | undefined>();
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assetTypeFilter, setAssetTypeFilter] = useState('all');

  // Fetch assets from backend
  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/assets');
      if (response.ok) {
        const data = await response.json();
        setAssets(data.items || []);
      } else {
        console.error('Failed to fetch assets');
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // Handle saving assets (both create and update)
  const handleSaveAsset = async (assetData: Omit<Asset, 'id' | 'index' | 'createdAt' | 'lastUpdated'>) => {
    console.log('Saving asset:', assetData); // Debug log
    
    try {
      const url = editingAsset 
        ? `http://localhost:3000/api/assets/${editingAsset.id}`
        : 'http://localhost:3000/api/assets';
      
      const method = editingAsset ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assetData),
      });

      console.log('Response status:', response.status); // Debug log

      if (response.ok) {
        const savedAsset = await response.json();
        console.log('Asset saved successfully:', savedAsset); // Debug log
        
        // Refresh the asset list
        await fetchAssets();
        
        // Close dialog and reset editing state
        setIsDialogOpen(false);
        setEditingAsset(undefined);
      } else {
        const errorText = await response.text();
        console.error('Failed to save asset:', errorText);
        alert('Failed to save asset: ' + errorText);
      }
    } catch (error) {
      console.error('Error saving asset:', error);
      alert('Error saving asset: ' + error);
    }
  };

  // Handle deleting asset
  const handleDeleteAsset = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/assets/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('Asset deleted successfully');
        await fetchAssets(); // Refresh the list
      } else {
        console.error('Failed to delete asset');
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
    }
  };

  // Handle duplicating asset
  const handleDuplicateAsset = async (asset: Asset) => {
    try {
      const response = await fetch(`http://localhost:3000/api/assets/${asset.id}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          createdBy: 'current-user' // Replace with actual user
        }),
      });

      if (response.ok) {
        const duplicatedAsset = await response.json();
        console.log('Asset duplicated:', duplicatedAsset);
        await fetchAssets(); // Refresh the list
      } else {
        console.error('Failed to duplicate asset');
      }
    } catch (error) {
      console.error('Error duplicating asset:', error);
    }
  };

  // Open dialog for editing
  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setIsDialogOpen(true);
  };

  // Open dialog for creating new asset
  const handleAddAsset = () => {
    setEditingAsset(undefined);
    setIsDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAsset(undefined);
  };

  // Get unique asset types for filter
  const assetTypes = [...new Set(assets.map(asset => asset.assetType).filter(Boolean))];

  // Filter assets based on search and filters
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = searchTerm === '' || 
      asset.assetType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.brandMake.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.modelNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.userName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesAssetType = assetTypeFilter === 'all' || asset.assetType === assetTypeFilter;

    return matchesSearch && matchesStatus && matchesAssetType;
  });

  return (
    <div className="p-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Inventory</h1>
          <p className="text-gray-600">Manage your company assets</p>
        </div>
        <Button 
          onClick={handleAddAsset}
          style={{ backgroundColor: '#06C755' }}
          className="hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Asset
        </Button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        assetTypeFilter={assetTypeFilter}
        onAssetTypeFilterChange={setAssetTypeFilter}
        assetTypes={assetTypes}
      />

      {/* Assets Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">Loading assets...</div>
        ) : filteredAssets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No assets found. {assets.length === 0 ? 'Add your first asset!' : 'Try changing your filters.'}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 font-medium">Asset Type</th>
                <th className="text-left p-4 font-medium">Brand</th>
                <th className="text-left p-4 font-medium">Model</th>
                <th className="text-left p-4 font-medium">Serial Number</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Location</th>
                <th className="text-left p-4 font-medium">User</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">{asset.assetType}</td>
                  <td className="p-4">{asset.brandMake}</td>
                  <td className="p-4">{asset.modelNumber}</td>
                  <td className="p-4">{asset.serialNumber}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      asset.status === 'Active' ? 'bg-green-100 text-green-800' :
                      asset.status === 'Inactive' ? 'bg-gray-100 text-gray-800' :
                      asset.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="p-4">{asset.location}</td>
                  <td className="p-4">{asset.userName}</td>
                  <td className="p-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditAsset(asset)}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Asset Dialog */}
      <AssetDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveAsset}
        onDelete={handleDeleteAsset}
        onDuplicate={handleDuplicateAsset}
        currentUser="current-user" // Replace with actual user from auth
        customColumns={[]} // Add your custom columns here
        editAsset={editingAsset}
        brandOptions={[]} // You can fetch these from your backend too
      />
    </div>
  );
}