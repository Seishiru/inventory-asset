import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { Plus, Package, X, ArrowUpDown, Trash2, Lock, Unlock, ArrowLeft, Archive, Edit } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';

const LINE_GREEN = '#06C755';

interface StockAsset {
  id: string;
  index: number;
  image?: string;
  itemName: string;
  category: string;
  sku: string;
  quantity: number;
  unit: string;
  location: string;
  status: 'Available' | 'Low Stock' | 'Out of Stock' | 'Reserved';
  lastRestocked: string;
  supplier: string;
  userName: string; // User who is using this item
}

// Placeholder data
const initialStockAssets: StockAsset[] = [
  {
    id: '1',
    index: 0,
    itemName: 'Office Chair - Executive',
    category: 'Furniture',
    sku: 'FUR-CH-001',
    quantity: 25,
    unit: 'pcs',
    location: 'Warehouse A - Shelf 12',
    status: 'Available',
    lastRestocked: new Date('2024-11-20').toISOString(),
    supplier: 'Office Supplies Inc.',
    userName: 'Unassigned',
  },
  {
    id: '2',
    index: 1,
    itemName: 'USB-C Cable (2m)',
    category: 'Electronics',
    sku: 'ELEC-CAB-023',
    quantity: 5,
    unit: 'pcs',
    location: 'Warehouse B - Bin 45',
    status: 'Low Stock',
    lastRestocked: new Date('2024-11-15').toISOString(),
    supplier: 'Tech Distributors',
    userName: 'John Doe',
  },
  {
    id: '3',
    index: 2,
    itemName: 'Wireless Mouse',
    category: 'Electronics',
    sku: 'ELEC-MOU-015',
    quantity: 0,
    unit: 'pcs',
    location: 'Warehouse A - Shelf 8',
    status: 'Out of Stock',
    lastRestocked: new Date('2024-10-30').toISOString(),
    supplier: 'Tech Distributors',
    userName: 'Unassigned',
  },
  {
    id: '4',
    index: 3,
    itemName: 'Whiteboard Marker Set',
    category: 'Stationery',
    sku: 'STAT-MAR-007',
    quantity: 50,
    unit: 'sets',
    location: 'Warehouse C - Box 15',
    status: 'Available',
    lastRestocked: new Date('2024-11-18').toISOString(),
    supplier: 'Stationery World',
    userName: 'Jane Smith',
  },
  {
    id: '5',
    index: 4,
    itemName: 'Laptop Stand',
    category: 'Accessories',
    sku: 'ACC-STD-012',
    quantity: 15,
    unit: 'pcs',
    location: 'Warehouse A - Shelf 20',
    status: 'Reserved',
    lastRestocked: new Date('2024-11-22').toISOString(),
    supplier: 'Office Supplies Inc.',
    userName: 'Mike Johnson',
  },
];

// Predefined user list for dropdown
const availableUsers = [
  'Unassigned',
  'Admin User',
  'John Doe',
  'Jane Smith',
  'Mike Johnson',
  'Sarah Williams',
  'Tom Anderson',
];

interface StockPageProps {
  onBack?: () => void;
  darkMode?: boolean;
}

export function StockPage({ onBack, darkMode = false }: StockPageProps) {
  const [assets, setAssets] = useState<StockAsset[]>(initialStockAssets);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<StockAsset | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Column width resizing
  const defaultColumnWidths: Record<string, number> = {
    index: 80,
    image: 100,
    itemName: 200,
    category: 150,
    sku: 150,
    quantity: 120,
    unit: 100,
    location: 200,
    status: 120,
    lastRestocked: 180,
    supplier: 180,
    userName: 150,
  };

  const [globalResizeLock, setGlobalResizeLock] = useState<boolean>(true);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(defaultColumnWidths);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);

  const categories = Array.from(new Set(assets.map((asset) => asset.category)));

  // Filter assets
  let filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.userName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || asset.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Apply sorting
  if (sortColumn) {
    filteredAssets = [...filteredAssets].sort((a, b) => {
      let aValue: any = a[sortColumn as keyof StockAsset];
      let bValue: any = b[sortColumn as keyof StockAsset];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (sortDirection === 'asc') {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      } else {
        return bStr < aStr ? -1 : bStr > aStr ? 1 : 0;
      }
    });
  }

  // Pagination
  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(filteredAssets.length / itemsPerPage);
  const paginatedAssets = itemsPerPage === 'all' 
    ? filteredAssets 
    : filteredAssets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleRowSelection = (id: string, isCtrlClick: boolean = false) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      
      if (isCtrlClick) {
        // CTRL + Click: Toggle the clicked row while keeping others
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
      } else {
        // Regular click: Toggle only this row, clear others
        if (newSet.has(id) && newSet.size === 1) {
          newSet.delete(id);
        } else {
          newSet.clear();
          newSet.add(id);
        }
      }
      
      return newSet;
    });
  };

  const handleRowClick = (id: string, event: React.MouseEvent) => {
    toggleRowSelection(id, event.ctrlKey || event.metaKey);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedAssets.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedAssets.map((a) => a.id)));
    }
  };

  const clearSelection = () => {
    setSelectedRows(new Set());
  };

  const handleBulkDelete = () => {
    if (selectedRows.size === 0) return;
    setAssets(assets.filter((asset) => !selectedRows.has(asset.id)));
    setSelectedRows(new Set());
    toast.success(`Deleted ${selectedRows.size} stock item(s)`);
  };

  const handleRowDoubleClick = (asset: StockAsset) => {
    setEditingAsset(asset);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingAsset) return;
    
    setAssets(assets.map(a => a.id === editingAsset.id ? editingAsset : a));
    setEditDialogOpen(false);
    setEditingAsset(null);
    toast.success('Stock item updated successfully!');
  };

  const handleAddNew = () => {
    setEditingAsset({
      id: Date.now().toString(),
      index: assets.length,
      itemName: '',
      category: '',
      sku: '',
      quantity: 0,
      unit: 'pcs',
      location: '',
      status: 'Available',
      lastRestocked: new Date().toISOString(),
      supplier: '',
      userName: 'Unassigned',
    });
    setAddDialogOpen(true);
  };

  const handleSaveNew = () => {
    if (!editingAsset) return;
    
    setAssets([...assets, editingAsset]);
    setAddDialogOpen(false);
    setEditingAsset(null);
    toast.success('Stock item added successfully!');
  };

  const getStatusColor = (status: StockAsset['status']) => {
    switch (status) {
      case 'Available':
        return 'bg-green-500';
      case 'Low Stock':
        return 'bg-yellow-500';
      case 'Out of Stock':
        return 'bg-red-500';
      case 'Reserved':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUpDown className="h-4 w-4 ml-1" style={{ color: LINE_GREEN }} />
    ) : (
      <ArrowUpDown className="h-4 w-4 ml-1 rotate-180" style={{ color: LINE_GREEN }} />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Back Button */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="px-6 py-4 flex items-center gap-4">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4" style={{ color: LINE_GREEN }} />
              <span style={{ color: LINE_GREEN }}>Back to Main</span>
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Archive className="h-5 w-5" style={{ color: LINE_GREEN }} />
            <h1 className="text-xl text-gray-900 dark:text-gray-100">
              Stock Assets
            </h1>
          </div>
          <div className="ml-auto">
            <Button
              onClick={handleAddNew}
              className="gap-2"
              style={{ backgroundColor: LINE_GREEN }}
            >
              <Plus className="h-4 w-4" />
              Add Stock Item
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl" style={{ color: LINE_GREEN }}>
                {filteredAssets.length}
              </div>
            </CardContent>
          </Card>
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-green-600">
                {filteredAssets.filter((a) => a.status === 'Available').length}
              </div>
            </CardContent>
          </Card>
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Low Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-yellow-600">
                {filteredAssets.filter((a) => a.status === 'Low Stock').length}
              </div>
            </CardContent>
          </Card>
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Out of Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-red-600">
                {filteredAssets.filter((a) => a.status === 'Out of Stock').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search stock items..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className={`flex-1 ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : ''}`}
          />
          <Select value={statusFilter} onValueChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className={`w-[180px] ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : ''}`}>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Low Stock">Low Stock</SelectItem>
              <SelectItem value="Out of Stock">Out of Stock</SelectItem>
              <SelectItem value="Reserved">Reserved</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={(value) => {
            setCategoryFilter(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className={`w-[180px] ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : ''}`}>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selection Indicator */}
        {selectedRows.size > 0 && (
          <div
            className="flex items-center justify-between px-4 py-3 rounded-lg border"
            style={{ 
              backgroundColor: darkMode ? '#1a4d2e' : '#f0fdf4', 
              borderColor: LINE_GREEN 
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="px-3 py-1 rounded text-white"
                style={{ backgroundColor: LINE_GREEN }}
              >
                Selected {selectedRows.size} {selectedRows.size === 1 ? 'Row' : 'Rows'}
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Selected
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-green-100'}
            >
              <X className="h-4 w-4 mr-1" />
              Clear Selection
            </Button>
          </div>
        )}

        {/* Table */}
        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
          <CardContent className="p-0">
            <div className="overflow-x-auto" ref={tableRef}>
              <Table>
                <TableHeader>
                  <TableRow className={darkMode ? 'border-gray-700' : ''}>
                    <TableHead className="w-[50px]">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedRows.size === paginatedAssets.length && paginatedAssets.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => setGlobalResizeLock(!globalResizeLock)}
                          title={globalResizeLock ? 'Unlock column resizing' : 'Lock column resizing'}
                        >
                          {globalResizeLock ? (
                            <Lock className="h-4 w-4" style={{ color: LINE_GREEN }} />
                          ) : (
                            <Unlock className="h-4 w-4" style={{ color: LINE_GREEN }} />
                          )}
                        </Button>
                      </div>
                    </TableHead>
                    <TableHead 
                      style={{ width: columnWidths.index }}
                      className="cursor-pointer select-none"
                      onClick={() => handleSort('index')}
                    >
                      <div className="flex items-center">
                        #
                        <SortIcon column="index" />
                      </div>
                    </TableHead>
                    <TableHead style={{ width: columnWidths.image }}>Image</TableHead>
                    <TableHead 
                      style={{ width: columnWidths.itemName }}
                      className="cursor-pointer select-none"
                      onClick={() => handleSort('itemName')}
                    >
                      <div className="flex items-center">
                        Item Name
                        <SortIcon column="itemName" />
                      </div>
                    </TableHead>
                    <TableHead 
                      style={{ width: columnWidths.category }}
                      className="cursor-pointer select-none"
                      onClick={() => handleSort('category')}
                    >
                      <div className="flex items-center">
                        Category
                        <SortIcon column="category" />
                      </div>
                    </TableHead>
                    <TableHead 
                      style={{ width: columnWidths.sku }}
                      className="cursor-pointer select-none"
                      onClick={() => handleSort('sku')}
                    >
                      <div className="flex items-center">
                        SKU
                        <SortIcon column="sku" />
                      </div>
                    </TableHead>
                    <TableHead 
                      style={{ width: columnWidths.quantity }}
                      className="cursor-pointer select-none"
                      onClick={() => handleSort('quantity')}
                    >
                      <div className="flex items-center">
                        Quantity
                        <SortIcon column="quantity" />
                      </div>
                    </TableHead>
                    <TableHead style={{ width: columnWidths.unit }}>Unit</TableHead>
                    <TableHead 
                      style={{ width: columnWidths.location }}
                      className="cursor-pointer select-none"
                      onClick={() => handleSort('location')}
                    >
                      <div className="flex items-center">
                        Location
                        <SortIcon column="location" />
                      </div>
                    </TableHead>
                    <TableHead 
                      style={{ width: columnWidths.status }}
                      className="cursor-pointer select-none"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        Status
                        <SortIcon column="status" />
                      </div>
                    </TableHead>
                    <TableHead 
                      style={{ width: columnWidths.lastRestocked }}
                      className="cursor-pointer select-none"
                      onClick={() => handleSort('lastRestocked')}
                    >
                      <div className="flex items-center">
                        Last Restocked
                        <SortIcon column="lastRestocked" />
                      </div>
                    </TableHead>
                    <TableHead 
                      style={{ width: columnWidths.supplier }}
                      className="cursor-pointer select-none"
                      onClick={() => handleSort('supplier')}
                    >
                      <div className="flex items-center">
                        Supplier
                        <SortIcon column="supplier" />
                      </div>
                    </TableHead>
                    <TableHead 
                      style={{ width: columnWidths.userName }}
                      className="cursor-pointer select-none"
                      onClick={() => handleSort('userName')}
                    >
                      <div className="flex items-center">
                        User Name
                        <SortIcon column="userName" />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAssets.map((asset) => {
                    const isSelected = selectedRows.has(asset.id);
                    const isHovered = hoveredRow === asset.id;
                    const showCheckbox = isSelected || isHovered;
                    
                    return (
                      <TableRow
                        key={asset.id}
                        className={`${
                          isSelected ? (darkMode ? 'bg-blue-900/50' : 'bg-blue-50') : ''
                        } ${isHovered ? (darkMode ? 'bg-gray-700' : 'bg-gray-50') : ''} ${
                          darkMode ? 'border-gray-700' : ''
                        } transition-colors cursor-pointer`}
                        onMouseEnter={() => setHoveredRow(asset.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        onDoubleClick={() => handleRowDoubleClick(asset)}
                        onClick={(e) => handleRowClick(asset.id, e)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className={`transition-opacity duration-200 ${showCheckbox ? 'opacity-100' : 'opacity-0'}`}>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleCheckboxChange(asset.id)}
                            />
                          </div>
                        </TableCell>
                        <TableCell style={{ width: columnWidths.index }}>{asset.index + 1}</TableCell>
                        <TableCell style={{ width: columnWidths.image }}>
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        </TableCell>
                        <TableCell style={{ width: columnWidths.itemName }}>{asset.itemName}</TableCell>
                        <TableCell style={{ width: columnWidths.category }}>{asset.category}</TableCell>
                        <TableCell style={{ width: columnWidths.sku }}>{asset.sku}</TableCell>
                        <TableCell style={{ width: columnWidths.quantity }}>
                          <span className={asset.quantity === 0 ? 'text-red-600' : asset.quantity < 10 ? 'text-yellow-600' : ''}>
                            {asset.quantity}
                          </span>
                        </TableCell>
                        <TableCell style={{ width: columnWidths.unit }}>{asset.unit}</TableCell>
                        <TableCell style={{ width: columnWidths.location }}>{asset.location}</TableCell>
                        <TableCell style={{ width: columnWidths.status }}>
                          <Badge className={`${getStatusColor(asset.status)} text-white`}>
                            {asset.status}
                          </Badge>
                        </TableCell>
                        <TableCell style={{ width: columnWidths.lastRestocked }}>
                          {new Date(asset.lastRestocked).toLocaleDateString()}
                        </TableCell>
                        <TableCell style={{ width: columnWidths.supplier }}>{asset.supplier}</TableCell>
                        <TableCell style={{ width: columnWidths.userName }}>{asset.userName}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {itemsPerPage !== 'all' && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((currentPage - 1) * (itemsPerPage as number)) + 1} to {Math.min(currentPage * (itemsPerPage as number), filteredAssets.length)} of {filteredAssets.length} items
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Stock Item</DialogTitle>
            <DialogDescription>
              Make changes to the stock item details below.
            </DialogDescription>
          </DialogHeader>
          {editingAsset && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Item Name</Label>
                  <Input
                    value={editingAsset.itemName}
                    onChange={(e) => setEditingAsset({ ...editingAsset, itemName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input
                    value={editingAsset.category}
                    onChange={(e) => setEditingAsset({ ...editingAsset, category: e.target.value })}
                  />
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input
                    value={editingAsset.sku}
                    onChange={(e) => setEditingAsset({ ...editingAsset, sku: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={editingAsset.quantity}
                    onChange={(e) => setEditingAsset({ ...editingAsset, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Input
                    value={editingAsset.unit}
                    onChange={(e) => setEditingAsset({ ...editingAsset, unit: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={editingAsset.location}
                    onChange={(e) => setEditingAsset({ ...editingAsset, location: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={editingAsset.status}
                    onValueChange={(value: any) => setEditingAsset({ ...editingAsset, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Low Stock">Low Stock</SelectItem>
                      <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                      <SelectItem value="Reserved">Reserved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Supplier</Label>
                  <Input
                    value={editingAsset.supplier}
                    onChange={(e) => setEditingAsset({ ...editingAsset, supplier: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>User Name (Who is using)</Label>
                  <Select
                    value={editingAsset.userName}
                    onValueChange={(value) => setEditingAsset({ ...editingAsset, userName: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map((user) => (
                        <SelectItem key={user} value={user}>{user}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} style={{ backgroundColor: LINE_GREEN }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Stock Item</DialogTitle>
            <DialogDescription>
              Enter the details for the new stock item.
            </DialogDescription>
          </DialogHeader>
          {editingAsset && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Item Name</Label>
                  <Input
                    value={editingAsset.itemName}
                    onChange={(e) => setEditingAsset({ ...editingAsset, itemName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input
                    value={editingAsset.category}
                    onChange={(e) => setEditingAsset({ ...editingAsset, category: e.target.value })}
                  />
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input
                    value={editingAsset.sku}
                    onChange={(e) => setEditingAsset({ ...editingAsset, sku: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={editingAsset.quantity}
                    onChange={(e) => setEditingAsset({ ...editingAsset, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Input
                    value={editingAsset.unit}
                    onChange={(e) => setEditingAsset({ ...editingAsset, unit: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={editingAsset.location}
                    onChange={(e) => setEditingAsset({ ...editingAsset, location: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={editingAsset.status}
                    onValueChange={(value: any) => setEditingAsset({ ...editingAsset, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Low Stock">Low Stock</SelectItem>
                      <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                      <SelectItem value="Reserved">Reserved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Supplier</Label>
                  <Input
                    value={editingAsset.supplier}
                    onChange={(e) => setEditingAsset({ ...editingAsset, supplier: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>User Name (Who is using)</Label>
                  <Select
                    value={editingAsset.userName}
                    onValueChange={(value) => setEditingAsset({ ...editingAsset, userName: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map((user) => (
                        <SelectItem key={user} value={user}>{user}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNew} style={{ backgroundColor: LINE_GREEN }}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}