import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Lock, Unlock, ArrowUpDown, ArrowUp, ArrowDown, Send, Undo2 } from 'lucide-react';
import { Accessory } from './AccessoriesDialog';

const LINE_GREEN = '#06C755';

interface AccessoriesTableProps {
  accessories: Accessory[];
  selectedRows: Set<string>;
  hoveredRow: string | null;
  setHoveredRow: (id: string | null) => void;
  handleCheckboxChange: (id: string) => void;
  handleRowClick: (id: string, e: React.MouseEvent) => void;
  handleRowDoubleClick: (accessory: Accessory) => void;
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc';
  handleSort: (column: string) => void;
  globalResizeLock: boolean;
  handleGlobalLockToggle: () => void;
  columnWidths: Record<string, number>;
  onRequestAccessory?: (accessory: Accessory) => void;
  onReturnAccessory?: (accessory: Accessory) => void;
  onIssueReserved?: (accessory: Accessory) => void;
}

export function AccessoriesTable({
  accessories,
  selectedRows,
  hoveredRow,
  setHoveredRow,
  handleCheckboxChange,
  handleRowClick,
  handleRowDoubleClick,
  sortColumn,
  sortDirection,
  handleSort,
  globalResizeLock,
  handleGlobalLockToggle,
  columnWidths,
  onRequestAccessory,
  onReturnAccessory,
  onIssueReserved,
}: AccessoriesTableProps) {
  
  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-3 w-3 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3 w-3" style={{ color: LINE_GREEN }} />
    ) : (
      <ArrowDown className="h-3 w-3" style={{ color: LINE_GREEN }} />
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On-Stock':
        return 'bg-green-500';
      case 'Reserve':
        return 'bg-blue-500';
      case 'Issued':
        return 'bg-purple-500';
      case 'Maintenance':
        return 'bg-yellow-500';
      case 'Retired':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Table style={{ width: 'max-content', minWidth: '100%' }}>
      <TableHeader>
        <TableRow style={{ backgroundColor: '#f0fdf4' }}>
          {/* Lock Column */}
          <TableHead className="w-12 relative" style={{ backgroundColor: '#f0fdf4' }}>
            <button
              onClick={handleGlobalLockToggle}
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

          {/* Checkbox Column */}
          <TableHead className="w-12"></TableHead>

          {/* Asset Type */}
          <TableHead 
            className="cursor-pointer hover:bg-green-100"
            style={{ width: `${columnWidths.assetType || 150}px`, minWidth: `${columnWidths.assetType || 150}px` }}
            onClick={() => handleSort('assetType')}
          >
            <div className="flex items-center gap-1">
              <span>Asset Type</span>
              {getSortIcon('assetType')}
            </div>
          </TableHead>

          {/* Serial Number */}
          <TableHead 
            className="cursor-pointer hover:bg-green-100"
            style={{ width: `${columnWidths.serialNumber || 150}px`, minWidth: `${columnWidths.serialNumber || 150}px` }}
            onClick={() => handleSort('serialNumber')}
          >
            <div className="flex items-center gap-1">
              <span>Serial Number</span>
              {getSortIcon('serialNumber')}
            </div>
          </TableHead>

          {/* Quantity */}
          <TableHead 
            className="cursor-pointer hover:bg-green-100"
            style={{ width: `${columnWidths.quantity || 120}px`, minWidth: `${columnWidths.quantity || 120}px` }}
            onClick={() => handleSort('quantity')}
          >
            <div className="flex items-center gap-1">
              <span>Quantity</span>
              {getSortIcon('quantity')}
            </div>
          </TableHead>

          {/* Status */}
          <TableHead 
            className="cursor-pointer hover:bg-green-100"
            style={{ width: `${columnWidths.status || 120}px`, minWidth: `${columnWidths.status || 120}px` }}
            onClick={() => handleSort('status')}
          >
            <div className="flex items-center gap-1">
              <span>Status</span>
              {getSortIcon('status')}
            </div>
          </TableHead>

          {/* Last Updated */}
          <TableHead 
            className="cursor-pointer hover:bg-green-100"
            style={{ width: `${columnWidths.lastUpdated || 280}px`, minWidth: `${columnWidths.lastUpdated || 280}px` }}
            onClick={() => handleSort('lastUpdated')}
          >
            <div className="flex items-center gap-1">
              <span>Last Updated</span>
              {getSortIcon('lastUpdated')}
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {accessories.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-12 text-gray-500">
              No accessories found. Add your first accessory to get started!
            </TableCell>
          </TableRow>
        ) : (
          accessories.map((accessory) => {
            const isSelected = selectedRows.has(accessory.id);
            const isHovered = hoveredRow === accessory.id;
            const showCheckbox = isSelected || isHovered;

            return (
              <TableRow
                key={accessory.id}
                className={`transition-colors hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                onDoubleClick={() => handleRowDoubleClick(accessory)}
                onClick={(e) => handleRowClick(accessory.id, e)}
                onMouseEnter={() => setHoveredRow(accessory.id)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Empty cell for lock column */}
                <TableCell className="w-12"></TableCell>

                {/* Checkbox */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className={`transition-opacity duration-200 ${showCheckbox ? 'opacity-100' : 'opacity-0'}`}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleCheckboxChange(accessory.id)}
                    />
                  </div>
                </TableCell>

                {/* Asset Type */}
                <TableCell style={{ width: `${columnWidths.assetType || 150}px` }}>
                  {accessory.assetType}
                </TableCell>

                {/* Serial Number */}
                <TableCell style={{ width: `${columnWidths.serialNumber || 150}px` }}>
                  {accessory.serialNumber || '-'}
                </TableCell>

                {/* Quantity */}
                <TableCell style={{ width: `${columnWidths.quantity || 120}px` }}>
                  {accessory.quantity}
                </TableCell>

                {/* Status */}
                <TableCell style={{ width: `${columnWidths.status || 120}px` }}>
                  <Badge className={`${getStatusColor(accessory.status)} text-white`}>
                    {accessory.status}
                  </Badge>
                </TableCell>

                {/* Last Updated */}
                <TableCell style={{ width: `${columnWidths.lastUpdated || 280}px` }}>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-600">
                      {new Date(accessory.lastUpdated).toLocaleString()}
                    </div>
                    {accessory.status === 'On-Stock' && accessory.quantity > 0 && onRequestAccessory && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRequestAccessory(accessory);
                        }}
                        style={{ backgroundColor: LINE_GREEN }}
                        className="text-white hover:opacity-90 text-xs px-2 py-1 h-7"
                        title="Perform Action"
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Action
                      </Button>
                    )}
                    {accessory.status === 'Reserve' && onIssueReserved && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onIssueReserved(accessory);
                        }}
                        className="bg-purple-500 text-white hover:bg-purple-600 text-xs px-2 py-1 h-7"
                        title="Issue Reserved Accessory"
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Issue
                      </Button>
                    )}
                    {(accessory.status === 'Issued' || accessory.status === 'Maintenance' || accessory.status === 'Retired') && onReturnAccessory && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReturnAccessory(accessory);
                        }}
                        className="bg-blue-500 text-white hover:bg-blue-600 text-xs px-2 py-1 h-7"
                        title="Return Accessory"
                      >
                        <Undo2 className="h-3 w-3 mr-1" />
                        Return
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}