import { useState, useRef, useMemo } from 'react';
import { useAuth } from '../AuthContext';
import AssetInventoryHeader from './AssetInventoryHeader';
import AssetInventoryTable from './AssetInventoryTable';
import AssetInventoryFooter from './AssetInventoryFooter';
import { AssetDialog } from '../AssetDialog';
import { AccessoriesDialog } from '../AccessoriesDialog';
import { DeleteAccessoryDialog } from '../DeleteAccessoryDialog';
import { StatusSelectionDialog } from '../StatusSelectionDialog';
import { ActionDialog } from '../ActionDialog';
import { SettingsPanel } from '../SettingsPanel';
import { SettingsTab } from '../SettingsTab';
import { ActivityLogPage } from '../ActivityLogPage';
import { KeyboardShortcuts } from '../KeyboardShortcuts';
import ColumnDialog from './ColumnDialog';
import DeleteColumnDialog from './DeleteColumnDialog';
import { useAssetData } from './hooks/useAssetData';
import { useColumnResize } from './hooks/useColumnResize';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { usePagination } from './hooks/usePagination';
import { useSelection } from './hooks/useSelection';
import { toast, Toaster } from 'sonner';
// removed incorrect re-export (this file defines the AssetInventory component)



interface AssetInventoryProps {
  onBackToLanding: () => void;
  onNavigateToActivityLog?: () => void;
}

export default function AssetInventory({ onBackToLanding, onNavigateToActivityLog }: AssetInventoryProps) {
  const { user } = useAuth();
  const CURRENT_USER = user?.username || 'Admin User';
  
  // State management
  const [activeDashboard, setActiveDashboard] = useState<'equipments' | 'accessories'>('equipments');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(undefined);
  const [accessoriesDialogOpen, setAccessoriesDialogOpen] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState<any>(undefined);
  const [statusSelectionOpen, setStatusSelectionOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [requestingAccessory] = useState<any>(null);
  const [selectedActionStatus] = useState<'On-Stock' | 'Reserve' | 'Issued' | 'Maintenance' | 'Retired'>('On-Stock');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAccessory] = useState<any>(null);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [addColumnDialogOpen, setAddColumnDialogOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [deleteColumnDialogOpen, setDeleteColumnDialogOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);
  const [activityLogOpen, setActivityLogOpen] = useState(false);
  const [showMainPage, setShowMainPage] = useState(true);

  // Custom hooks
  const {
    assets,
    accessories,
    brandOptions,
    assetTypeOptions,
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
  } = useAssetData(CURRENT_USER);

  const { selectedRows, hoveredRow, handleCheckboxChange, handleRowClick, clearSelection } = useSelection();
  const { sortColumn, sortDirection, handleSort, itemsPerPage, currentPage, setCurrentPage, handleItemsPerPageChange } = usePagination();
  const { globalResizeLock, columnWidths, resizingColumn, handleGlobalLockToggle, handleMouseDown } = useColumnResize();

  // Refs
  const tableRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assetTypeFilter, setAssetTypeFilter] = useState('all');
  const [customColumns, setCustomColumns] = useState<string[]>([]);
  

  // Filtered data
  const filteredAssets = useMemo(() => {
    return assets.filter((asset: any) => {
      const matchesSearch =
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
  }, [assets, searchTerm, statusFilter, assetTypeFilter]);

  const filteredAccessories = useMemo(() => {
    return accessories.filter((accessory: any) => {
      const matchesSearch = searchTerm === '' || 
        Object.values(accessory).some((value: any) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesStatus = statusFilter === 'all' || accessory.status === statusFilter;
      const matchesType = assetTypeFilter === 'all' || accessory.assetType === assetTypeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [accessories, searchTerm, statusFilter, assetTypeFilter]);

  // Keyboard shortcuts
  function handleBulkDelete() {
    // Placeholder bulk delete implementation
    console.log('Bulk delete');
  }

  useKeyboardShortcuts({
    dialogOpen,
    selectedRows,
    currentPage,
    itemsPerPage,
    searchInputRef,
    setDialogOpen,
    setShowShortcuts,
    handlePrint,
    handleBulkDelete,
    clearSelection
  });

  // Close dialog handler
  const closeDialog = () => {
    setDialogOpen(false);
    setEditingAsset(undefined);
  };

  const closeAccessoriesDialog = () => {
    setAccessoriesDialogOpen(false);
    setEditingAccessory(undefined);
  };

  const handleRowDoubleClick = (asset: any) => {
    setEditingAsset(asset);
    setDialogOpen(true);
  };

  const handleAccessoryRowDoubleClick = (accessory: any) => {
    setEditingAccessory(accessory);
    setAccessoriesDialogOpen(true);
  };

  // Add these handler functions
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleAssetTypeFilterChange = (value: string) => {
    setAssetTypeFilter(value);
    setCurrentPage(1);
  };

  const handleAddColumn = () => {
    if (newColumnName.trim() && !customColumns.includes(newColumnName.trim())) {
      setCustomColumns([...customColumns, newColumnName.trim()]);
      setNewColumnName('');
      setAddColumnDialogOpen(false);
      toast.success('Column added successfully!');
    }
  };

  const handleDeleteColumn = (column: string) => {
    setCustomColumns(customColumns.filter((col) => col !== column));
    setDeleteColumnDialogOpen(false);
    setColumnToDelete(null);
    toast.success('Column deleted successfully!');
  };

  const confirmDeleteColumn = (column: string) => {
    setColumnToDelete(column);
    setDeleteColumnDialogOpen(true);
  };

  // Placeholder functions for bulk operations (implementation above)

  function handlePrint() {
    window.print();
  }

  const userOptions = useMemo(() => {
    return ['N/A', 'Admin User', 'IT User', 'Regular User'];
  }, []);

  const assetTypes = activeDashboard === 'equipments'
    ? Array.from(new Set(assets.map((asset: any) => asset.assetType).filter((type: any) => type && type.trim() !== '')))
    : Array.from(new Set(accessories.map((accessory: any) => accessory.assetType).filter((type: any) => type && type.trim() !== '')));

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Settings Tab */}
      <SettingsTab onClick={() => setSettingsPanelOpen(true)} />
      
      {/* Settings Panel */}
      <SettingsPanel
        open={settingsPanelOpen}
        onClose={() => setSettingsPanelOpen(false)}
        brandOptions={brandOptions}
        onBrandOptionsChange={setBrandOptions}
        onAddBrand={handleAddBrand}
        onDeleteBrand={handleDeleteBrand}
        assetTypeOptions={assetTypeOptions}
        onAssetTypeOptionsChange={setAssetTypeOptions}
        onAddAssetType={handleAddAssetType}
        onActivityLogOpen={() => {
          if (onNavigateToActivityLog) {
            onNavigateToActivityLog();
            setSettingsPanelOpen(false);
          }
        }}
        onGoBackToMainPage={() => {
          onBackToLanding();
        }}
      />

      {/* Activity Log Page */}
      <ActivityLogPage
        open={activityLogOpen}
        onClose={() => {
          setActivityLogOpen(false);
          setShowMainPage(true);
        }}
        activities={[]}
      />

      {showMainPage && !activityLogOpen && (
        <>
          <AssetInventoryHeader
            activeDashboard={activeDashboard}
            onDashboardChange={setActiveDashboard}
            user={user}
            filteredAssets={filteredAssets}
            filteredAccessories={filteredAccessories}
            onAddItem={() => activeDashboard === 'equipments' ? setDialogOpen(true) : setAccessoriesDialogOpen(true)}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
            assetTypeFilter={assetTypeFilter}
            onAssetTypeFilterChange={handleAssetTypeFilterChange}
            assetTypes={assetTypes}
            searchInputRef={searchInputRef}
            selectedRows={selectedRows}
            onBulkDelete={handleBulkDelete}
            onBulkUpdateStatus={() => {}}
            onBulkUpdateLocation={() => {}}
            onClearSelection={clearSelection}
          />

          <AssetInventoryTable
            activeDashboard={activeDashboard}
            filteredAssets={filteredAssets}
            filteredAccessories={filteredAccessories}
            selectedRows={selectedRows}
            hoveredRow={hoveredRow}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            customColumns={customColumns}
            globalResizeLock={globalResizeLock}
            columnWidths={columnWidths}
            resizingColumn={resizingColumn}
            tableRef={tableRef}
            onRowDoubleClick={handleRowDoubleClick}
            onAccessoryRowDoubleClick={handleAccessoryRowDoubleClick}
            onRowClick={handleRowClick}
            onCheckboxChange={handleCheckboxChange}
            onSort={handleSort}
            onGlobalLockToggle={handleGlobalLockToggle}
            onMouseDown={handleMouseDown}
            onRequestAccessory={handleRequestAccessory}
            onReturnAccessory={handleReturnAccessory}
            onIssueReserved={handleIssueReserved}
            onDeleteColumn={confirmDeleteColumn}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
          />

          <AssetInventoryFooter
            activeDashboard={activeDashboard}
            filteredAssets={filteredAssets}
            filteredAccessories={filteredAccessories}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            totalPages={Math.ceil((activeDashboard === 'equipments' ? filteredAssets.length : filteredAccessories.length) / (itemsPerPage === 'all' ? 1 : itemsPerPage))}
            onItemsPerPageChange={handleItemsPerPageChange}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* Dialogs */}
      <AssetDialog
        open={dialogOpen}
        onClose={closeDialog}
        onSave={handleAddAsset}
        onDelete={handleDeleteAsset}
        onDuplicate={handleDuplicateAsset}
        currentUser={CURRENT_USER}
        customColumns={customColumns}
        editAsset={editingAsset}
        brandOptions={brandOptions}
        assetTypeOptions={assetTypeOptions}
        userOptions={userOptions}
      />

      <AccessoriesDialog
        open={accessoriesDialogOpen}
        onOpenChange={closeAccessoriesDialog}
        accessory={editingAccessory}
        onSave={handleAddAccessory}
        onDeleteClick={handleDeleteClick}
        assetTypeOptions={assetTypeOptions}
        brandOptions={brandOptions}
        userOptions={userOptions}
      />

      <DeleteAccessoryDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        accessory={deletingAccessory}
        onConfirm={handleDeleteConfirm}
      />

      <StatusSelectionDialog
        open={statusSelectionOpen}
        onOpenChange={setStatusSelectionOpen}
        onSelectStatus={handleStatusSelection}
      />

      <ActionDialog
        open={actionDialogOpen}
        onOpenChange={setActionDialogOpen}
        accessory={requestingAccessory}
        selectedStatus={selectedActionStatus}
        onSubmit={handleSubmitRequest}
        userOptions={userOptions}
      />

      <ColumnDialog
        open={addColumnDialogOpen}
        onOpenChange={setAddColumnDialogOpen}
        newColumnName={newColumnName}
        onNewColumnNameChange={setNewColumnName}
        onAddColumn={handleAddColumn}
      />

      <DeleteColumnDialog
        open={deleteColumnDialogOpen}
        onOpenChange={setDeleteColumnDialogOpen}
        columnToDelete={columnToDelete}
        onDeleteColumn={handleDeleteColumn}
      />

      <KeyboardShortcuts open={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
}