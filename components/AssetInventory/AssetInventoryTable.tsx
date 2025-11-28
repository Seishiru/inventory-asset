import { Card, CardContent } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Lock, Unlock, ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { AccessoriesTable } from '../AccessoriesTable';

const LINE_GREEN = '#06C755';

interface AssetInventoryTableProps {
  activeDashboard: 'equipments' | 'accessories';
  filteredAssets: any[];
  filteredAccessories: any[];
  selectedRows: Set<string>;
  hoveredRow: string | null;
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc';
  customColumns: string[];
  globalResizeLock: boolean;
  columnWidths: Record<string, number>;
  resizingColumn: string | null;
  tableRef: React.RefObject<HTMLDivElement>;
  onRowDoubleClick: (asset: any) => void;
  onAccessoryRowDoubleClick: (accessory: any) => void;
  onRowClick: (id: string, event: React.MouseEvent) => void;
  onCheckboxChange: (id: string) => void;
  onSort: (column: string) => void;
  onGlobalLockToggle: () => void;
  onMouseDown: (e: React.MouseEvent, columnKey: string) => void;
  onRequestAccessory: (accessory: any) => void;
  onReturnAccessory: (accessory: any) => void;
  onIssueReserved: (accessory: any) => void;
  onDeleteColumn: (column: string) => void;
  itemsPerPage: number | 'all';
  currentPage: number;
}

export default function AssetInventoryTable({
  activeDashboard,
  filteredAssets,
  filteredAccessories,
  selectedRows,
  hoveredRow,
  sortColumn,
  sortDirection,
  customColumns,
  globalResizeLock,
  columnWidths,
  resizingColumn,
  tableRef,
  onRowDoubleClick,
  onAccessoryRowDoubleClick,
  onRowClick,
  onCheckboxChange,
  onSort,
  onGlobalLockToggle,
  onMouseDown,
  onRequestAccessory,
  onReturnAccessory,
  onIssueReserved,
  onDeleteColumn,
  itemsPerPage,
  currentPage
}: AssetInventoryTableProps) {

  const defaultColumnWidths: Record<string, number> = {
    index: 80,
    image: 100,
    assetType: 150,
    brandMake: 150,
    modelNumber: 150,
    serialNumber: 150,
    barcode: 150,
    quantity: 120,
    status: 120,
    location: 150,
    userName: 150,
    createdBy: 150,
    modifiedBy: 150,
    createdAt: 180,
    lastUpdated: 280,
    description: 200,
    comments: 200,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On-Stock':
        return 'bg-green-500';
      case 'Inactive':
        return 'bg-gray-500';
      case 'Maintenance':
        return 'bg-yellow-500';
      case 'Retired':
        return 'bg-red-500';
      case 'Reserve':
        return 'bg-blue-500';
      case 'Issued':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 inline opacity-50" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-1 inline" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1 inline" />
    );
  };

  const renderResizableHeader = (
    columnKey: string,
    label: string,
    sortKey?: string,
    className?: string
  ) => {
    const width = columnWidths[columnKey] || defaultColumnWidths[columnKey] || 150;
    const isCurrentlyResizing = resizingColumn === columnKey;

    return (
      <TableHead 
        key={columnKey}
        className={`relative hover:bg-green-100 ${className || ''}`}
        style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}
      >
        <div className="flex items-center justify-between gap-2">
          {sortKey ? (
            <div 
              className="flex items-center gap-1 cursor-pointer flex-1" 
              onClick={() => onSort(sortKey)}
            >
              <span>{label}</span>
              {getSortIcon(sortKey)}
            </div>
          ) : (
            <span className="flex-1">{label}</span>
          )}
        </div>
        {!globalResizeLock && (
          <>
            <div
              className="absolute -right-2 top-0 bottom-0 w-6 cursor-col-resize z-10"
              onMouseDown={(e) => onMouseDown(e, columnKey)}
              style={{ userSelect: 'none' }}
              title="Drag to resize"
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-1 pointer-events-none transition-all z-10"
              style={{ 
                backgroundColor: isCurrentlyResizing ? '#16a34a' : '#4ade80',
                boxShadow: isCurrentlyResizing ? '0 0 4px rgba(22, 163, 74, 0.5)' : 'none'
              }}
            />
          </>
        )}
        {isCurrentlyResizing && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-20">
            {width}px
          </div>
        )}
      </TableHead>
    );
  };

  const paginatedAssets = itemsPerPage === 'all' 
    ? filteredAssets 
    : filteredAssets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div ref={tableRef}>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-scroll" style={{ maxWidth: '100%' }}>
            {activeDashboard === 'equipments' ? (
              <Table style={{ width: 'max-content', minWidth: '100%' }}>
                <TableHeader>
                  <TableRow style={{ backgroundColor: '#f0fdf4' }}>
                    <TableHead className="w-12 relative" style={{ backgroundColor: '#f0fdf4' }}>
                      <button
                        onClick={onGlobalLockToggle}
                        className="p-1.5 rounded transition-colors hover:bg-gray-200"
                        title={globalResizeLock ? 'Unlock all columns to resize' : 'Lock all columns'}
                      >
                        {globalResizeLock ? (
                          <Lock className="h-4 w-4 text-gray-600" />
                        ) : (
                          <Unlock className="h-4 w-4" style={{ color: LINE_GREEN }} />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="w-12"></TableHead>
                    {renderResizableHeader('assetType', 'Asset Type', 'assetType')}
                    {renderResizableHeader('serialNumber', 'Serial Number', 'serialNumber')}
                    {renderResizableHeader('location', 'Location/Station', 'location')}
                    {renderResizableHeader('status', 'Status', 'status')}
                    {renderResizableHeader('lastUpdated', 'Last Updated', 'lastUpdated')}
                    {customColumns.map((column) => {
                      const columnKey = `custom_${column}`;
                      const width = columnWidths[columnKey] || 150;
                      
                      return (
                        <TableHead 
                          key={column} 
                          className="relative hover:bg-green-100"
                          style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1 cursor-pointer flex-1" onClick={() => onSort(column)}>
                              <span>{column}</span>
                              {getSortIcon(column)}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteColumn(column)}
                              className="h-6 w-6 p-0 hover:bg-red-100 flex-shrink-0"
                            >
                              <Trash2 className="h-3 w-3 text-red-600" />
                            </Button>
                          </div>
                          {!globalResizeLock && (
                            <>
                              <div
                                className="absolute -right-2 top-0 bottom-0 w-6 cursor-col-resize z-10"
                                onMouseDown={(e) => onMouseDown(e, columnKey)}
                                style={{ userSelect: 'none' }}
                                title="Drag to resize"
                              />
                              <div
                                className="absolute right-0 top-0 bottom-0 w-1 pointer-events-none transition-all z-10"
                                style={{ 
                                  backgroundColor: resizingColumn === columnKey ? '#16a34a' : '#4ade80',
                                  boxShadow: resizingColumn === columnKey ? '0 0 4px rgba(22, 163, 74, 0.5)' : 'none'
                                }}
                              />
                            </>
                          )}
                          {resizingColumn === columnKey && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-20">
                              {width}px
                            </div>
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7 + customColumns.length} className="text-center py-12 text-gray-500">
                        No assets found. Add your first asset to get started!
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedAssets.map((asset) => {
                      const isSelected = selectedRows.has(asset.id);
                      const isHovered = hoveredRow === asset.id;
                      const showCheckbox = isSelected || isHovered;

                      return (
                        <TableRow
                          key={asset.id}
                          className={`transition-colors hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                          onDoubleClick={() => onRowDoubleClick(asset)}
                          onClick={(e) => onRowClick(asset.id, e)}
                          onMouseEnter={() => {}}
                          onMouseLeave={() => {}}
                          style={{ cursor: 'pointer' }}
                        >
                          {/* Empty cell for lock column */}
                          <TableCell className="w-12"></TableCell>
                          
                          {/* Checkbox */}
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className={`transition-opacity duration-200 ${showCheckbox ? 'opacity-100' : 'opacity-0'}`}>
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => onCheckboxChange(asset.id)}
                              />
                            </div>
                          </TableCell>

                          {/* Asset Type */}
                          <TableCell style={{ width: `${columnWidths.assetType || 150}px`, minWidth: `${columnWidths.assetType || 150}px`, maxWidth: `${columnWidths.assetType || 150}px` }}>
                            {asset.assetType}
                          </TableCell>

                          {/* Serial Number */}
                          <TableCell style={{ width: `${columnWidths.serialNumber || 200}px`, minWidth: `${columnWidths.serialNumber || 200}px`, maxWidth: `${columnWidths.serialNumber || 200}px` }}>
                            {asset.serialNumber}
                          </TableCell>

                          {/* Location/Station */}
                          <TableCell style={{ width: `${columnWidths.location || 200}px`, minWidth: `${columnWidths.location || 200}px`, maxWidth: `${columnWidths.location || 200}px` }}>
                            {asset.location}
                          </TableCell>

                          {/* Status */}
                          <TableCell style={{ width: `${columnWidths.status || 120}px`, minWidth: `${columnWidths.status || 120}px`, maxWidth: `${columnWidths.status || 120}px` }}>
                            <Badge className={`${getStatusColor(asset.status)} text-white`}>{asset.status}</Badge>
                          </TableCell>

                          {/* Last Updated */}
                          <TableCell style={{ width: `${columnWidths.lastUpdated || 180}px`, minWidth: `${columnWidths.lastUpdated || 180}px`, maxWidth: `${columnWidths.lastUpdated || 180}px` }}>
                            <div className="text-sm text-gray-600">{new Date(asset.lastUpdated).toLocaleString()}</div>
                          </TableCell>

                          {/* Custom Columns */}
                          {customColumns.map((column) => {
                            const columnKey = `custom_${column}`;
                            const width = columnWidths[columnKey] || 150;
                            return (
                              <TableCell 
                                key={column}
                                style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}
                              >
                                {asset.customFields?.[column] || '-'}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            ) : (
              <AccessoriesTable
                accessories={itemsPerPage === 'all' ? filteredAccessories : filteredAccessories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
                selectedRows={selectedRows}
                hoveredRow={hoveredRow}
                setHoveredRow={() => {}}
                handleCheckboxChange={onCheckboxChange}
                handleRowClick={onRowClick}
                handleRowDoubleClick={onAccessoryRowDoubleClick}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                handleSort={onSort}
                globalResizeLock={globalResizeLock}
                handleGlobalLockToggle={onGlobalLockToggle}
                columnWidths={columnWidths}
                onRequestAccessory={onRequestAccessory}
                onReturnAccessory={onReturnAccessory}
                onIssueReserved={onIssueReserved}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}