import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FilterBar } from '../FilterBar';
import { BulkActionsMenu } from '../BulkActionsMenu';
import { ImportExportBackupMenu } from '../ImportExportBackupMenu';
import { ColumnOptionsMenu } from '../ColumnOptionsMenu';
import { DashboardDropdown } from '../DashboardDropdown';
import { Button } from '../ui/button';
import { X, Plus, Package, UserIcon } from 'lucide-react';

const LINE_GREEN = '#06C755';

interface AssetInventoryHeaderProps {
  activeDashboard: 'equipments' | 'accessories';
  onDashboardChange: (dashboard: 'equipments' | 'accessories') => void;
  user: any;
  filteredAssets: any[];
  filteredAccessories: any[];
  onAddItem: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  assetTypeFilter: string;
  onAssetTypeFilterChange: (value: string) => void;
  assetTypes: string[];
  searchInputRef: React.RefObject<HTMLInputElement>;
  selectedRows: Set<string>;
  onBulkDelete: () => void;
  onBulkUpdateStatus: (status: string) => void;
  onBulkUpdateLocation: (location: string) => void;
  onClearSelection: () => void;
  brandOptions?: string[];
  onBrandOptionsChange?: (options: string[]) => void;
  onAddBrand?: (brandName: string) => void;
  onDeleteBrand?: (brandName: string) => void;
  assetTypeOptions?: string[];
  onAssetTypeOptionsChange?: (options: string[]) => void;
  onAddAssetType?: (assetType: string) => void;
  onDeleteAssetType?: (assetType: string) => void;
}

export default function AssetInventoryHeader({
  activeDashboard,
  onDashboardChange,
  user,
  filteredAssets,
  filteredAccessories,
  onAddItem,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  assetTypeFilter,
  onAssetTypeFilterChange,
  assetTypes,
  searchInputRef,
  selectedRows,
  onBulkDelete,
  onBulkUpdateStatus,
  onBulkUpdateLocation,
  onClearSelection
  ,
  brandOptions,
  onBrandOptionsChange,
  onAddBrand,
  onDeleteBrand,
  assetTypeOptions,
  onAssetTypeOptionsChange,
  onAddAssetType,
  onDeleteAssetType
}: AssetInventoryHeaderProps) {
  return (
    <div className="max-w-[1600px] mx-auto mb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg" style={{ backgroundColor: LINE_GREEN }}>
              <Package className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900">Asset Inventory</h1>
              <div className="flex gap-2 mt-1">
                <DashboardDropdown
                  activeDashboard={activeDashboard}
                  onDashboardChange={onDashboardChange}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* User Info */}
            {user && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                <div
                  className="flex items-center justify-center h-8 w-8 rounded-full text-white text-sm"
                  style={{ backgroundColor: LINE_GREEN }}
                >
                  <UserIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">{user.username}</p>
                  <p className="text-xs text-gray-600">{user.role}</p>
                </div>
              </div>
            )}
            <ImportExportBackupMenu
              onImportExcel={() => {}}
              onImportCSV={() => {}}
              onExportImage={() => {}}
              onExportPDF={() => {}}
              onExportExcel={() => {}}
              onExportSelectedExcel={() => {}}
              onPrint={() => {}}
              onCreateBackup={() => {}}
              onRestoreBackup={() => {}}
              hasSelection={selectedRows.size > 0}
            />
            <ColumnOptionsMenu
              brandOptions={brandOptions ?? []}
              onBrandOptionsChange={onBrandOptionsChange ?? (() => {})}
              onAddBrand={onAddBrand}
              onDeleteBrand={onDeleteBrand}
              assetTypeOptions={assetTypeOptions ?? []}
              onAssetTypeOptionsChange={onAssetTypeOptionsChange ?? (() => {})}
              onAddAssetType={onAddAssetType}
              onDeleteAssetType={onDeleteAssetType}
            />
            <Button 
              onClick={onAddItem} 
              style={{ backgroundColor: LINE_GREEN }} 
              className="text-white hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              {activeDashboard === 'equipments' ? 'Add Equipment' : 'Add Accessory'}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">
                {activeDashboard === 'equipments' ? 'Total Equipment' : 'Total Accessories'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl" style={{ color: LINE_GREEN }}>
                {activeDashboard === 'equipments' ? filteredAssets.length : filteredAccessories.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">On-Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-green-600">
                {activeDashboard === 'equipments' 
                  ? filteredAssets.filter((a) => a.status === 'On-Stock').length
                  : filteredAccessories.filter((a) => a.status === 'On-Stock').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Reserve</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-blue-600">
                {activeDashboard === 'equipments'
                  ? filteredAssets.filter((a) => a.status === 'Reserve').length
                  : filteredAccessories.filter((a) => a.status === 'Reserve').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Issued</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-purple-600">
                {activeDashboard === 'equipments'
                  ? filteredAssets.filter((a) => a.status === 'Issued').length
                  : filteredAccessories.filter((a) => a.status === 'Issued').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
          assetTypeFilter={assetTypeFilter}
          onAssetTypeFilterChange={onAssetTypeFilterChange}
          assetTypes={assetTypes}
          searchInputRef={searchInputRef}
        />

        {/* Selection Indicator */}
        <div
          className="flex items-center justify-between px-4 rounded-lg border min-h-[52px]"
          style={{ 
            backgroundColor: '#f0fdf4', 
            borderColor: LINE_GREEN 
          }}
        >
          {selectedRows.size > 0 ? (
            <>
              <div className="flex items-center gap-2 py-3">
                <div
                  className="px-3 py-1 rounded text-white"
                  style={{ backgroundColor: LINE_GREEN }}
                >
                  Selected {selectedRows.size} {selectedRows.size === 1 ? 'Row' : 'Rows'}
                </div>
                <BulkActionsMenu
                  selectedCount={selectedRows.size}
                  onBulkDelete={onBulkDelete}
                  onBulkUpdateStatus={onBulkUpdateStatus}
                  onBulkUpdateLocation={onBulkUpdateLocation}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="hover:bg-green-100"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Selection
              </Button>
            </>
          ) : (
            <div className="text-sm py-3 text-gray-500">
              Select a row
            </div>
          )}
        </div>
      </div>
    </div>
  );
}