import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:4000';

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
          const normalizedAssets = (assetsData.items || assetsData).map((a: any) => ({
            ...a,
            status: normalizeStatus(a.status),
          }));
          setAssets(normalizedAssets);
          console.log('✅ Assets loaded:', assetsData.items?.length || assetsData.length);
        } else {
          console.error('❌ Failed to load assets:', assetsResponse.status);
        }

        // Load accessories
        const accessoriesResponse = await fetch(`${API_BASE_URL}/accessories`);
        if (accessoriesResponse.ok) {
          const accessoriesData = await accessoriesResponse.json();
          const normalizedAccessories = (accessoriesData.items || accessoriesData).map((a: any) => ({
            ...a,
            status: normalizeStatus(a.status),
          }));
          setAccessories(normalizedAccessories);
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

        // Load asset type options from backend
        const assetTypesResponse = await fetch(`${API_BASE_URL}/asset-type-options`);
        if (assetTypesResponse.ok) {
          const typesData = await assetTypesResponse.json();
          setAssetTypeOptions(typesData.map((t: any) => t.assetType));
          console.log('✅ Asset types loaded:', typesData.length);
        } else {
          console.error('❌ Failed to load asset types:', assetTypesResponse.status);
        }

      } catch (error) {
        console.error('❌ Error loading data from backend:', error);
        toast.error('Failed to load data from server');
      }
    };

    loadData();
  }, []);

  const normalizeStatus = (status: string) => {
    if (!status) return status;
    switch (String(status)) {
      case 'On_Stock':
      case 'On-Stock':
        return 'On-Stock';
      case 'Reserved':
      case 'Reserve':
        return 'Reserve';
      default:
        return String(status).replace('_', '-');
    }
  };

  const logActivity = async (type: string, action: string, details?: string, assetId?: number, isAccessory: boolean = false) => {
    try {
      const response = await fetch(`${API_BASE_URL}/activity-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          username: currentUser,
          action,
          details,
          equipmentAssetId: !isAccessory ? assetId : undefined,
          accessoryAssetId: isAccessory ? assetId : undefined,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        console.error('Activity log error:', error);
      }
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw - activity logging shouldn't break the main operation
    }
  };

  const handleAddAsset = async (assetData: any) => {
    try {
      // map frontend asset shape to backend/Prisma EquipmentAsset shape
      const mapped = {
        assetType: assetData.assetType,
        brandMake: assetData.brandMake,
        modelNumber: assetData.modelNumber,
        serialNumber: assetData.serialNumber,
        barcode: assetData.barcode || undefined,
        description: assetData.description || undefined,
        status: assetData.status || undefined,
        location: assetData.location || undefined,
        userName: assetData.userName || assetData.username || undefined,
        image: assetData.image || undefined,
        attachments: assetData.attachments || undefined,
        comments: assetData.comments || undefined,
      };

      const response = await fetch(`${API_BASE_URL}/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mapped),
      });
      
      if (!response.ok) throw new Error('Failed to create asset');
      
      const newAsset = await response.json();
      setAssets([...assets, { ...newAsset, status: normalizeStatus(newAsset.status) }]);
      await logActivity('create', 'Created asset', `Added ${newAsset.assetType} - ${newAsset.serialNumber}`, newAsset.id, false);
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
      
      const deletedAsset = assets.find(a => a.id === id);
      setAssets(assets.filter((asset) => asset.id !== id));
      await logActivity('delete', 'Deleted asset', `Removed ${deletedAsset?.assetType || 'asset'} - ${deletedAsset?.serialNumber || id}`, Number(id), false);
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
        body: JSON.stringify({
          assetType: duplicateData.assetType,
          brandMake: duplicateData.brandMake,
          modelNumber: duplicateData.modelNumber,
          serialNumber: duplicateData.serialNumber,
          barcode: duplicateData.barcode || undefined,
          description: duplicateData.description || undefined,
          status: duplicateData.status || undefined,
          location: duplicateData.location || undefined,
          userName: duplicateData.userName || duplicateData.username || undefined,
          image: duplicateData.image || undefined,
          attachments: duplicateData.attachments || undefined,
          comments: duplicateData.comments || undefined,
        }),
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

  const handleUpdateAsset = async (id: number | string, assetData: any) => {
    try {
      const mapped = {
        assetType: assetData.assetType,
        brandMake: assetData.brandMake,
        modelNumber: assetData.modelNumber,
        serialNumber: assetData.serialNumber,
        barcode: assetData.barcode || undefined,
        description: assetData.description || undefined,
        status: assetData.status || undefined,
        location: assetData.location || undefined,
        userName: assetData.userName || assetData.username || undefined,
        image: assetData.image || undefined,
        attachments: assetData.attachments || undefined,
        comments: assetData.comments || undefined,
      };

      const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapped),
      });

      if (!response.ok) throw new Error('Failed to update asset');

      const updated = await response.json();
      const normalizedUpdated = { ...updated, status: normalizeStatus(updated.status) };
      setAssets(assets.map(a => (a.id === normalizedUpdated.id ? normalizedUpdated : a)));
      await logActivity('update', 'Updated asset', `Modified ${updated.assetType} - ${updated.serialNumber}`, updated.id, false);
      toast.success('Asset updated successfully!');
    } catch (error) {
      console.error('Error updating asset:', error);
      toast.error('Failed to update asset');
    }
  };

  const handleAddAccessory = async (accessoryData: any) => {
    try {
      const mapped = {
        assetType: accessoryData.assetType,
        modelNumber: accessoryData.modelNumber || undefined,
        brandMake: accessoryData.brandMake || undefined,
        serialNumber: accessoryData.serialNumber || undefined,
        barcode: accessoryData.barcode || undefined,
        quantity: typeof accessoryData.quantity === 'number' ? accessoryData.quantity : (accessoryData.quantity ? Number(accessoryData.quantity) : 1),
        status: accessoryData.status || undefined,
        location: accessoryData.location || undefined,
        attachments: accessoryData.attachments || undefined,
        comments: accessoryData.comments || undefined,
      };

      const response = await fetch(`${API_BASE_URL}/accessories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mapped),
      });
      
      if (!response.ok) throw new Error('Failed to create accessory');
      
      const newAccessory = await response.json();
      setAccessories([...accessories, { ...newAccessory, status: normalizeStatus(newAccessory.status) }]);
      await logActivity('create', 'Created accessory', `Added ${newAccessory.assetType} (Qty: ${newAccessory.quantity})`, newAccessory.id, true);
      toast.success('Accessory added successfully!');
    } catch (error) {
      console.error('Error saving accessory:', error);
      toast.error('Failed to save accessory');
    }
  };

  const handleUpdateAccessory = async (id: number | string, accessoryData: any) => {
    try {
      const mapped = {
        assetType: accessoryData.assetType,
        modelNumber: accessoryData.modelNumber || undefined,
        brandMake: accessoryData.brandMake || undefined,
        serialNumber: accessoryData.serialNumber || undefined,
        barcode: accessoryData.barcode || undefined,
        quantity: accessoryData.quantity || 1,
        status: accessoryData.status || undefined,
        location: accessoryData.location || undefined,
        attachments: accessoryData.attachments || undefined,
        comments: accessoryData.comments || undefined,
      };

      const response = await fetch(`${API_BASE_URL}/accessories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapped),
      });

      if (!response.ok) throw new Error('Failed to update accessory');

      const updated = await response.json();
      const normalizedUpdated = { ...updated, status: normalizeStatus(updated.status) };
      setAccessories(accessories.map(a => (a.id === normalizedUpdated.id ? normalizedUpdated : a)));
      await logActivity('update', 'Updated accessory', `Modified ${updated.assetType} (Qty: ${updated.quantity})`, updated.id, true);
      toast.success('Accessory updated successfully!');
    } catch (error) {
      console.error('Error updating accessory:', error);
      toast.error('Failed to update accessory');
    }
  };

  const handleRequestAccessory = (accessory: any) => {
    // Opened via UI; actual status change is handled in handleSubmitRequest
    console.log('Request accessory:', accessory);
  };

  const handleStatusSelection = (status: 'On-Stock' | 'Reserve' | 'Issued' | 'Maintenance' | 'Retired') => {
    // Implementation would go here
    console.log('Status selected:', status);
  };

  const handleSubmitRequest = async (data: { borrowerName: string; quantity: number; status: string }) => {
    try {
      // Find the selected accessory from current state if needed; UI should pass the selected one separately.
      // Here we assume the ActionDialog was opened for a specific accessory and caller will set selected one in state.
      // For simplicity, apply to the first selected accessory with matching status preconditions.
      const target = accessories.find((a: any) => {
        // Prefer On-Stock for Reserve/Issue flows
        return a.status === 'On-Stock' || a.status === 'Reserve';
      });
      if (!target) {
        toast.error('No accessory selected for action');
        return;
      }

      const nextStatus = data.status;
      const quantityChange = data.quantity || 1;
      const updatedPayload = {
        assetType: target.assetType,
        modelNumber: target.modelNumber,
        brandMake: target.brandMake,
        serialNumber: target.serialNumber,
        barcode: target.barcode,
        quantity: Math.max(0, Number(target.quantity || 0) - (nextStatus === 'Issued' ? quantityChange : 0)),
        status: nextStatus,
        location: target.location,
        attachments: target.attachments,
        comments: target.comments,
      };

      const response = await fetch(`${API_BASE_URL}/accessories/${target.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload),
      });

      if (!response.ok) throw new Error('Failed to update accessory');

      const updated = await response.json();
      const normalizedUpdated = { ...updated, status: normalizeStatus(updated.status), lastUpdated: updated.lastUpdated || new Date().toISOString() };
      setAccessories(accessories.map(a => (a.id === normalizedUpdated.id ? normalizedUpdated : a)));
      await logActivity('update', `Changed accessory status to ${nextStatus}`, `${target.assetType} - ${data.borrowerName || 'N/A'} (Qty: ${quantityChange})`, updated.id, true);
      toast.success(`Accessory ${nextStatus.toLowerCase()} successfully!`);
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to process action');
    }
  };

  const handleReturnAccessory = async (issuedAccessory: any) => {
    try {
      const updatedPayload = {
        assetType: issuedAccessory.assetType,
        modelNumber: issuedAccessory.modelNumber,
        brandMake: issuedAccessory.brandMake,
        serialNumber: issuedAccessory.serialNumber,
        barcode: issuedAccessory.barcode,
        quantity: Number(issuedAccessory.quantity || 0) + 1,
        status: 'On-Stock',
        location: issuedAccessory.location,
        attachments: issuedAccessory.attachments,
        comments: issuedAccessory.comments,
      };

      const response = await fetch(`${API_BASE_URL}/accessories/${issuedAccessory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload),
      });

      if (!response.ok) throw new Error('Failed to return accessory');

      const updated = await response.json();
      const normalizedUpdated = { ...updated, status: normalizeStatus(updated.status), lastUpdated: updated.lastUpdated || new Date().toISOString() };
      setAccessories(accessories.map(a => (a.id === normalizedUpdated.id ? normalizedUpdated : a)));
      await logActivity('update', 'Returned accessory to stock', `${issuedAccessory.assetType} returned`, updated.id, true);
      toast.success('Accessory returned to stock');
    } catch (error) {
      console.error('Error returning accessory:', error);
      toast.error('Failed to return accessory');
    }
  };

  const handleIssueReserved = async (reservedAccessory: any) => {
    try {
      const updatedPayload = {
        assetType: reservedAccessory.assetType,
        modelNumber: reservedAccessory.modelNumber,
        brandMake: reservedAccessory.brandMake,
        serialNumber: reservedAccessory.serialNumber,
        barcode: reservedAccessory.barcode,
        quantity: Math.max(0, Number(reservedAccessory.quantity || 0) - 1),
        status: 'Issued',
        location: reservedAccessory.location,
        attachments: reservedAccessory.attachments,
        comments: reservedAccessory.comments,
      };

      const response = await fetch(`${API_BASE_URL}/accessories/${reservedAccessory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload),
      });

      if (!response.ok) throw new Error('Failed to issue reserved accessory');

      const updated = await response.json();
      const normalizedUpdated = { ...updated, status: normalizeStatus(updated.status), lastUpdated: updated.lastUpdated || new Date().toISOString() };
      setAccessories(accessories.map(a => (a.id === normalizedUpdated.id ? normalizedUpdated : a)));
      await logActivity('update', 'Issued reserved accessory', `${reservedAccessory.assetType} issued`, updated.id, true);
      toast.success('Reserved accessory issued');
    } catch (error) {
      console.error('Error issuing reserved accessory:', error);
      toast.error('Failed to issue reserved accessory');
    }
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

  const handleDeleteAssetType = async (assetTypeName: string) => {
    try {
      const typesResponse = await fetch(`${API_BASE_URL}/asset-type-options`);
      if (typesResponse.ok) {
        const types = await typesResponse.json();
        const typeToDelete = types.find((t: any) => t.assetType === assetTypeName);

        if (typeToDelete) {
          const deleteResponse = await fetch(`${API_BASE_URL}/asset-type-options/${typeToDelete.id}`, {
            method: 'DELETE',
          });

          if (!deleteResponse.ok) throw new Error('Failed to delete asset type');

          setAssetTypeOptions(assetTypeOptions.filter(t => t !== assetTypeName));
          toast.success('Asset type deleted successfully!');
        }
      }
    } catch (error) {
      console.error('Error deleting asset type:', error);
      toast.error('Failed to delete asset type');
    }
  };

  const handleAddAssetType = async (assetType: string) => {
    try {
      if (!assetType.trim()) return;
      // create on backend
      const response = await fetch(`${API_BASE_URL}/asset-type-options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetType: assetType.trim() }),
      });
      if (!response.ok) throw new Error('Failed to create asset type');
      const created = await response.json();
      setAssetTypeOptions([...assetTypeOptions, created.assetType || assetType.trim()]);
      toast.success('Asset type added successfully!');
    } catch (error) {
      console.error('Error adding asset type:', error);
      toast.error('Failed to add asset type');
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
    handleUpdateAsset,
    handleAddAccessory,
    handleUpdateAccessory,
    handleRequestAccessory,
    handleStatusSelection,
    handleSubmitRequest,
    handleReturnAccessory,
    handleIssueReserved,
    handleDeleteClick,
    handleDeleteConfirm,
    handleAddBrand,
    handleDeleteBrand,
    handleAddAssetType,
    handleDeleteAssetType
  };
}