import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:3000/api';

export function useAssetData(currentUser: string) {
  const [assets, setAssets] = useState<any[]>([]);
  const [accessories, setAccessories] = useState<any[]>([]);
  const [brandOptions, setBrandOptions] = useState<string[]>([]);
  const [assetTypeOptions, setAssetTypeOptions] = useState<string[]>([]);

  // Load data from backend on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('📥 Loading data from backend...');
        
        // Load assets
        const assetsResponse = await fetch(`${API_BASE_URL}/assets`);
        if (assetsResponse.ok) {
          const assetsData = await assetsResponse.json();
          setAssets(assetsData.items || assetsData);
          console.log('✅ Assets loaded:', assetsData.items?.length || assetsData.length);
        } else {
          console.error('❌ Failed to load assets:', assetsResponse.status);
        }

        // Load accessories
        const accessoriesResponse = await fetch(`${API_BASE_URL}/accessories`);
        if (accessoriesResponse.ok) {
          const accessoriesData = await accessoriesResponse.json();
          setAccessories(accessoriesData.items || accessoriesData);
          console.log('✅ Accessories loaded:', accessoriesData.items?.length || accessoriesData.length);
        } else {
          console.error('❌ Failed to load accessories:', accessoriesResponse.status);
        }

        // Load brands
        const brandsResponse = await fetch(`${API_BASE_URL}/brands`);
        if (brandsResponse.ok) {
          const brandsData = await brandsResponse.json();
          setBrandOptions(brandsData.map((brand: any) => brand.name));
          console.log('✅ Brands loaded:', brandsData.length);
        } else {
          console.error('❌ Failed to load brands:', brandsResponse.status);
        }

      } catch (error) {
        console.error('❌ Error loading data from backend:', error);
        toast.error('Failed to load data from server');
      }
    };

    loadData();
  }, []);

  const handleAddAsset = async (assetData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assetData),
      });
      
      if (!response.ok) throw new Error('Failed to create asset');
      
      const newAsset = await response.json();
      setAssets([...assets, newAsset]);
      toast.success('Asset added successfully!');
    } catch (error) {
      console.error('Error saving asset:', error);
      toast.error('Failed to save asset');
    }
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete asset');
      
      setAssets(assets.filter((asset) => asset.id !== id));
      toast.success('Asset deleted successfully!');
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast.error('Failed to delete asset');
    }
  };

  const handleDuplicateAsset = async (asset: any) => {
    try {
      const duplicateData = {
        ...asset,
        serialNumber: `${asset.serialNumber}-COPY`,
        createdBy: currentUser,
        modifiedBy: currentUser,
      };

      const response = await fetch(`${API_BASE_URL}/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicateData),
      });

      if (!response.ok) throw new Error('Failed to duplicate asset');

      const newAsset = await response.json();
      setAssets([...assets, newAsset]);
      toast.success('Asset duplicated successfully!');
    } catch (error) {
      console.error('Error duplicating asset:', error);
      toast.error('Failed to duplicate asset');
    }
  };

  const handleAddAccessory = async (accessoryData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/accessories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accessoryData),
      });
      
      if (!response.ok) throw new Error('Failed to create accessory');
      
      const newAccessory = await response.json();
      setAccessories([...accessories, newAccessory]);
      toast.success('Accessory added successfully!');
    } catch (error) {
      console.error('Error saving accessory:', error);
      toast.error('Failed to save accessory');
    }
  };

  const handleRequestAccessory = (accessory: any) => {
    // Implementation would go here
    console.log('Request accessory:', accessory);
  };

  const handleStatusSelection = (status: 'On-Stock' | 'Reserve' | 'Issued' | 'Maintenance' | 'Retired') => {
    // Implementation would go here
    console.log('Status selected:', status);
  };

  const handleSubmitRequest = async (data: { borrowerName: string; quantity: number; status: string }) => {
    // Implementation would go here
    console.log('Submit request:', data);
  };

  const handleReturnAccessory = async (issuedAccessory: any) => {
    // Implementation would go here
    console.log('Return accessory:', issuedAccessory);
  };

  const handleIssueReserved = async (reservedAccessory: any) => {
    // Implementation would go here
    console.log('Issue reserved:', reservedAccessory);
  };

  const handleDeleteClick = (accessory: any) => {
    // Implementation would go here
    console.log('Delete click:', accessory);
  };

  const handleDeleteConfirm = async (quantityToDelete: number) => {
    // Implementation would go here
    console.log('Delete confirm:', quantityToDelete);
  };

  const handleAddBrand = async (brandName: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/brands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: brandName }),
      });
      
      if (!response.ok) throw new Error('Failed to create brand');
      
      const newBrand = await response.json();
      setBrandOptions([...brandOptions, newBrand.name]);
      toast.success('Brand added successfully!');
    } catch (error) {
      console.error('Error adding brand:', error);
      toast.error('Failed to add brand');
    }
  };

  const handleDeleteBrand = async (brandName: string) => {
    try {
      const brandsResponse = await fetch(`${API_BASE_URL}/brands`);
      if (brandsResponse.ok) {
        const brands = await brandsResponse.json();
        const brandToDelete = brands.find((brand: any) => brand.name === brandName);
        
        if (brandToDelete) {
          const deleteResponse = await fetch(`${API_BASE_URL}/brands/${brandToDelete.id}`, {
            method: 'DELETE',
          });
          
          if (!deleteResponse.ok) throw new Error('Failed to delete brand');
          
          setBrandOptions(brandOptions.filter(brand => brand !== brandName));
          toast.success('Brand deleted successfully!');
        }
      }
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast.error('Failed to delete brand');
    }
  };

  const handleAddAssetType = (assetType: string) => {
    if (assetType.trim() && !assetTypeOptions.includes(assetType.trim())) {
      const newAssetTypes = [...assetTypeOptions, assetType.trim()];
      setAssetTypeOptions(newAssetTypes);
      localStorage.setItem('assetTypeOptions', JSON.stringify(newAssetTypes));
      toast.success('Asset type added successfully!');
    }
  };

  return {
    assets,
    accessories,
    brandOptions,
    assetTypeOptions,
    setAssets,
    setAccessories,
    setBrandOptions,
    setAssetTypeOptions,
    handleAddAsset,
    handleDeleteAsset,
    handleDuplicateAsset,
    handleAddAccessory,
    handleRequestAccessory,
    handleStatusSelection,
    handleSubmitRequest,
    handleReturnAccessory,
    handleIssueReserved,
    handleDeleteClick,
    handleDeleteConfirm,
    handleAddBrand,
    handleDeleteBrand,
    handleAddAssetType
  };
}