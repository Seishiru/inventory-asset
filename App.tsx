import { useState, useRef, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Checkbox } from './components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './components/ui/alert-dialog';
import { Label } from './components/ui/label';
import { AssetDialog, Asset } from './components/AssetDialog';
import { FilterBar } from './components/FilterBar';
import { ExportMenu } from './components/ExportMenu';
import { BackupMenu } from './components/BackupMenu';
import { ImportMenu } from './components/ImportMenu';
import { BulkActionsMenu } from './components/BulkActionsMenu';
import { KeyboardShortcuts } from './components/KeyboardShortcuts';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { AuthProvider, useAuth } from './components/AuthContext';
import { LoginDialog } from './components/LoginDialog';
import { SignupDialog } from './components/SignupDialog';
import { SettingsPanel } from './components/SettingsPanel';
import { SettingsTab } from './components/SettingsTab';
import { ActivityLogPage, ActivityLogEntry } from './components/ActivityLogPage';
import { LandingPage } from './components/LandingPage';
import { InventoryPage } from './components/InventoryPage';
import { StockPage } from './components/StockPage';
import { ReportsPage } from './components/ReportsPage';
import { Plus, Package, X, ArrowUpDown, ArrowUp, ArrowDown, Trash2, MessageSquare, Lock, Unlock, User } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import type { AuditEntry } from './components/AuditLog';
import "./styles/index.css";  

const LINE_GREEN = '#06C755';

interface AssetInventoryProps {
  onBackToLanding: () => void;
}

function AssetInventory({ onBackToLanding }: AssetInventoryProps) {
  const { user } = useAuth();
  const CURRENT_USER = user?.username || 'Admin User';
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assetTypeFilter, setAssetTypeFilter] = useState('all');
  const tableRef = useRef<HTMLDivElement>(null);
  const [customColumns, setCustomColumns] = useState<string[]>([]);
  const [addColumnDialogOpen, setAddColumnDialogOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [deleteColumnDialogOpen, setDeleteColumnDialogOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [updatedCells, setUpdatedCells] = useState<Set<string>>(new Set());
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Settings panel state
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [brandOptions, setBrandOptions] = useState<string[]>(() => {
    const saved = localStorage.getItem('brandOptions');
    return saved ? JSON.parse(saved) : ['Apple', 'Dell', 'HP', 'Lenovo', 'Microsoft', 'Herman Miller'];
  });
  const [statusOptions, setStatusOptions] = useState<string[]>(() => {
    const saved = localStorage.getItem('statusOptions');
    return saved ? JSON.parse(saved) : ['Active', 'Maintenance', 'Retired', 'In Storage', 'On Loan'];
  });

  // Activity Log
  const [activities, setActivities] = useState<ActivityLogEntry[]>(() => {
    const saved = localStorage.getItem('activityLog');
    return saved ? JSON.parse(saved).map((a: ActivityLogEntry) => ({
      ...a,
      timestamp: new Date(a.timestamp)
    })) : [];
  });
  const [activityLogOpen, setActivityLogOpen] = useState(false);
  const [showMainPage, setShowMainPage] = useState(true);

  // Fetch assets from backend
  const fetchAssets = async () => {
    setLoading(true);
    try {
      console.log('Fetching assets from backend...');
      const response = await fetch('http://localhost:3000/api/assets');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Assets fetched:', data.items);
        setAssets(data.items || []);
      } else {
        console.error('Failed to fetch assets:', response.status);
        setAssets([]);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const addActivity = (
    action: string,
    type: ActivityLogEntry['type'],
    details?: string
  ) => {
    const newActivity: ActivityLogEntry = {
      id: `activity-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      username: CURRENT_USER,
      action,
      details,
      type,
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  // Persist activity log
  useEffect(() => {
    localStorage.setItem('activityLog', JSON.stringify(activities));
  }, [activities]);
  
  // Column width resizing - Multi-column support
  const defaultColumnWidths: Record<string, number> = {
    index: 80,
    image: 100,
    assetType: 150,
    brandMake: 150,
    modelNumber: 150,
    serialNumber: 150,
    barcode: 150,
    status: 120,
    location: 150,
    userName: 150,
    createdBy: 150,
    modifiedBy: 150,
    createdAt: 180,
    lastUpdated: 180,
    description: 200,
    comments: 200,
  };
  
  const [globalResizeLock, setGlobalResizeLock] = useState<boolean>(true); // Master lock for all columns
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(defaultColumnWidths);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const resizeRef = useRef<{ startX: number; startWidth: number; columnKey: string } | null>(null);

  const assetTypes = Array.from(new Set(assets.map((asset) => asset.assetType).filter((type) => type && type.trim() !== '')));

  // Persist settings to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('brandOptions', JSON.stringify(brandOptions));
  }, [brandOptions]);

  useEffect(() => {
    localStorage.setItem('statusOptions', JSON.stringify(statusOptions));
  }, [statusOptions]);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N - Add new asset
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setDialogOpen(true);
      }
      
      // Ctrl+F - Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      
      // Ctrl+P - Print
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handlePrint();
      }
      
      // Ctrl+? - Show shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShowShortcuts(true);
      }
      
      // Delete - Delete selected
      if (e.key === 'Delete' && selectedRows.size > 0 && !dialogOpen) {
        e.preventDefault();
        handleBulkDelete();
      }
      
      // Escape - Close dialog or clear selection
      if (e.key === 'Escape') {
        if (dialogOpen) {
          closeDialog();
        } else if (selectedRows.size > 0) {
          clearSelection();
        }
      }
      
      // Arrow keys for pagination
      if (itemsPerPage !== 'all') {
        if (e.key === 'ArrowLeft' && currentPage > 1 && !dialogOpen) {
          setCurrentPage(currentPage - 1);
        }
        if (e.key === 'ArrowRight' && currentPage < totalPages && !dialogOpen) {
          setCurrentPage(currentPage + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialogOpen, selectedRows, currentPage, itemsPerPage]);

  // Prevent text selection while resizing
  useEffect(() => {
    if (resizingColumn) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [resizingColumn]);

  let filteredAssets = assets.filter((asset) => {
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

  // Apply sorting
  if (sortColumn) {
    filteredAssets = [...filteredAssets].sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';

      if (sortColumn === 'index') {
        aValue = a.index;
        bValue = b.index;
      } else if (sortColumn === 'assetType') {
        aValue = a.assetType;
        bValue = b.assetType;
      } else if (sortColumn === 'brandMake') {
        aValue = a.brandMake;
        bValue = b.brandMake;
      } else if (sortColumn === 'modelNumber') {
        aValue = a.modelNumber;
        bValue = b.modelNumber;
      } else if (sortColumn === 'serialNumber') {
        aValue = a.serialNumber;
        bValue = b.serialNumber;
      } else if (sortColumn === 'barcode') {
        aValue = a.barcode || '';
        bValue = b.barcode || '';
      } else if (sortColumn === 'status') {
        aValue = a.status;
        bValue = b.status;
      } else if (sortColumn === 'location') {
        aValue = a.location;
        bValue = b.location;
      } else if (sortColumn === 'userName') {
        aValue = a.userName;
        bValue = b.userName;
      } else if (sortColumn === 'createdBy') {
        aValue = a.createdBy;
        bValue = b.createdBy;
      } else if (sortColumn === 'modifiedBy') {
        aValue = a.modifiedBy;
        bValue = b.modifiedBy;
      } else if (sortColumn === 'lastUpdated') {
        aValue = new Date(a.lastUpdated).getTime();
        bValue = new Date(b.lastUpdated).getTime();
      } else if (a.customFields && b.customFields) {
        aValue = a.customFields[sortColumn] || '';
        bValue = b.customFields[sortColumn] || '';
      }

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

  // Reset to page 1 when filters change
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

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(value === 'all' ? 'all' : parseInt(value));
    setCurrentPage(1);
  };

  // Handle saving assets to backend
  const handleAddAsset = async (assetData: Omit<Asset, 'id' | 'index' | 'createdAt' | 'lastUpdated'>) => {
    console.log('Saving asset to backend:', assetData);
    
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
        body: JSON.stringify({
          ...assetData,
          assetType: assetData.assetType,
          brandMake: assetData.brandMake,
          modelNumber: assetData.modelNumber,
          serialNumber: assetData.serialNumber,
          location: assetData.location,
          userName: assetData.userName,
          createdBy: CURRENT_USER,
          modifiedBy: CURRENT_USER,
          status: assetData.status || 'Active'
        }),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const savedAsset = await response.json();
        console.log('Asset saved successfully:', savedAsset);
        
        // Refresh the asset list from backend
        await fetchAssets();
        
        // Close dialog and reset editing state
        setDialogOpen(false);
        setEditingAsset(undefined);
        
        // Add activity log entry
        addActivity(
          editingAsset 
            ? `updated asset "${assetData.assetType}" (${assetData.serialNumber})`
            : `created new asset "${assetData.assetType}" (${assetData.serialNumber})`,
          editingAsset ? 'update' : 'create',
          `Type: ${assetData.assetType}, Brand: ${assetData.brandMake}, Model: ${assetData.modelNumber}`
        );

        toast.success(editingAsset ? 'Asset updated successfully!' : 'Asset added successfully!');
      } else {
        const errorText = await response.text();
        console.error('Failed to save asset:', errorText);
        toast.error('Failed to save asset: ' + errorText);
      }
    } catch (error) {
      console.error('Error saving asset:', error);
      toast.error('Error saving asset: ' + error);
    }
  };

  // Handle deleting asset from backend
  const handleDeleteAsset = async (id: string) => {
    try {
      console.log('Deleting asset:', id);
      const response = await fetch(`http://localhost:3000/api/assets/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('Asset deleted successfully');
        // Refresh the asset list from backend
        await fetchAssets();
        setSelectedRows((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });

        // Add activity log entry
        const deletedAsset = assets.find(a => a.id === id);
        if (deletedAsset) {
          addActivity(
            `deleted asset "${deletedAsset.assetType}" (${deletedAsset.serialNumber})`,
            'delete',
            `Type: ${deletedAsset.assetType}, Brand: ${deletedAsset.brandMake}, Model: ${deletedAsset.modelNumber}`
          );
        }

        toast.success('Asset deleted successfully!');
      } else {
        console.error('Failed to delete asset');
        toast.error('Failed to delete asset');
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast.error('Error deleting asset');
    }
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingAsset(undefined);
  };

  const handleRowDoubleClick = (asset: Asset) => {
    setEditingAsset(asset);
    setDialogOpen(true);
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

  const handleCheckboxChange = (id: string) => {
    // Checkbox click always toggles while keeping other selections (like CTRL+Click)
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

  const handleRowClick = (id: string, event: React.MouseEvent) => {
    toggleRowSelection(id, event.ctrlKey || event.metaKey);
  };

  const clearSelection = () => {
    setSelectedRows(new Set());
  };

  const getStatusColor = (status: Asset['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500';
      case 'Inactive':
        return 'bg-gray-500';
      case 'Maintenance':
        return 'bg-yellow-500';
      case 'Retired':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const exportAsImage = async () => {
    if (!tableRef.current) return;
    try {
      const canvas = await html2canvas(tableRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      const link = document.createElement('a');
      const filename = `asset-inventory-${Date.now()}.png`;
      link.download = filename;
      link.href = canvas.toDataURL();
      link.click();

      // Add activity log entry
      addActivity(
        `exported inventory as image`,
        'export',
        `File: ${filename}, ${filteredAssets.length} assets`
      );

      toast.success('Exported as image successfully!');
    } catch (error) {
      toast.error('Failed to export as image');
    }
  };

  const exportAsPDF = async () => {
    if (!tableRef.current) return;
    try {
      const canvas = await html2canvas(tableRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      const filename = `asset-inventory-${Date.now()}.pdf`;
      pdf.save(filename);

      // Add activity log entry
      addActivity(
        `exported inventory as PDF`,
        'export',
        `File: ${filename}, ${filteredAssets.length} assets`
      );

      toast.success('Exported as PDF successfully!');
    } catch (error) {
      toast.error('Failed to export as PDF');
    }
  };

  const exportAsExcel = () => {
    try {
      const exportData = filteredAssets.map((asset) => {
        const baseData: any = {
          Index: asset.index,
          'Asset Type': asset.assetType,
          'Brand/Make': asset.brandMake,
          'Model Number': asset.modelNumber,
          'Serial Number': asset.serialNumber,
          Status: asset.status,
          'Location/Station': asset.location,
          'User Name': asset.userName,
          'Created By': asset.createdBy,
          'Modified By': asset.modifiedBy,
          'Created at': new Date(asset.createdAt).toLocaleString(),
          'Last Updated': new Date(asset.lastUpdated).toLocaleString(),
        };

        if (asset.customFields) {
          Object.entries(asset.customFields).forEach(([key, value]) => {
            baseData[key] = value;
          });
        }

        return baseData;
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Assets');

      const filename = `asset-inventory-${Date.now()}.xlsx`;
      XLSX.writeFile(workbook, filename);

      // Add activity log entry
      addActivity(
        `exported inventory as Excel`,
        'export',
        `File: ${filename}, ${filteredAssets.length} assets`
      );

      toast.success('Exported as Excel successfully!');
    } catch (error) {
      toast.error('Failed to export as Excel');
    }
  };

  const handleAddColumn = () => {
    if (newColumnName.trim() && !customColumns.includes(newColumnName.trim())) {
      setCustomColumns([...customColumns, newColumnName.trim()]);
      setAssets(
        assets.map((asset) => ({
          ...asset,
          customFields: {
            ...asset.customFields,
            [newColumnName.trim()]: '',
          },
        }))
      );
      setNewColumnName('');
      setAddColumnDialogOpen(false);

      // Add activity log entry
      addActivity(
        `added custom column "${newColumnName.trim()}"`,
        'other',
        `New column added to inventory`
      );

      toast.success('Column added successfully!');
    }
  };

  const createBackup = () => {
    try {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const year = now.getFullYear();
      const backupName = `${month}${day}${year}BackUp`;

      const backupData = {
        assets,
        customColumns,
        timestamp: now.toISOString(),
        version: '1.0',
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${backupName}.json`;
      link.click();
      URL.revokeObjectURL(url);

      // Add activity log entry
      addActivity(
        `created backup`,
        'backup',
        `Backup file: ${backupName}.json, ${assets.length} assets`
      );

      toast.success(`Backup created: ${backupName}.json`);
    } catch (error) {
      toast.error('Failed to create backup');
    }
  };

  const restoreBackup = (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const backupData = JSON.parse(e.target?.result as string);
          
          if (backupData.assets && Array.isArray(backupData.assets)) {
            setAssets(backupData.assets);
            if (backupData.customColumns && Array.isArray(backupData.customColumns)) {
              setCustomColumns(backupData.customColumns);
            }
            setSelectedRows(new Set());

            // Add activity log entry
            addActivity(
              `restored backup from file`,
              'restore',
              `Restored ${backupData.assets.length} assets from ${file.name}`
            );

            toast.success('Backup restored successfully!');
          } else {
            toast.error('Invalid backup file format');
          }
        } catch (error) {
          toast.error('Failed to parse backup file');
        }
      };
      reader.readAsText(file);
    } catch (error) {
      toast.error('Failed to restore backup');
    }
  };

  const importExcel = (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const importedAssets: Asset[] = jsonData.map((row: any, index: number) => ({
            id: Date.now().toString() + index,
            index: assets.length + index,
            image: row['Image'] || '',
            assetType: row['Asset Type'] || '',
            brandMake: row['Brand/Make'] || '',
            modelNumber: row['Model Number'] || '',
            serialNumber: row['Serial Number'] || '',
            status: (row['Status'] as Asset['status']) || 'Active',
            location: row['Location/Station'] || '',
            userName: row['User Name'] || '',
            createdBy: CURRENT_USER,
            modifiedBy: CURRENT_USER,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            customFields: {},
          }));

          setAssets([...assets, ...importedAssets]);

          // Add activity log entry
          addActivity(
            `imported assets from Excel`,
            'import',
            `File: ${file.name}, ${importedAssets.length} assets imported`
          );

          toast.success(`Imported ${importedAssets.length} assets from Excel`);
        } catch (error) {
          toast.error('Failed to parse Excel file');
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      toast.error('Failed to import Excel file');
    }
  };

  const importCSV = (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const workbook = XLSX.read(text, { type: 'string' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const importedAssets: Asset[] = jsonData.map((row: any, index: number) => ({
            id: Date.now().toString() + index,
            index: assets.length + index,
            image: row['Image'] || '',
            assetType: row['Asset Type'] || '',
            brandMake: row['Brand/Make'] || '',
            modelNumber: row['Model Number'] || '',
            serialNumber: row['Serial Number'] || '',
            status: (row['Status'] as Asset['status']) || 'Active',
            location: row['Location/Station'] || '',
            userName: row['User Name'] || '',
            createdBy: CURRENT_USER,
            modifiedBy: CURRENT_USER,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            customFields: {},
          }));

          setAssets([...assets, ...importedAssets]);

          // Add activity log entry
          addActivity(
            `imported assets from CSV`,
            'import',
            `File: ${file.name}, ${importedAssets.length} assets imported`
          );

          toast.success(`Imported ${importedAssets.length} assets from CSV`);
        } catch (error) {
          toast.error('Failed to parse CSV file');
        }
      };
      reader.readAsText(file);
    } catch (error) {
      toast.error('Failed to import CSV file');
    }
  };

  const exportSelectedExcel = () => {
    try {
      const selectedAssets = filteredAssets.filter((asset) => selectedRows.has(asset.id));
      
      if (selectedAssets.length === 0) {
        toast.error('No assets selected');
        return;
      }

      const exportData = selectedAssets.map((asset) => {
        const baseData: any = {
          Index: asset.index,
          'Asset Type': asset.assetType,
          'Brand/Make': asset.brandMake,
          'Model Number': asset.modelNumber,
          'Serial Number': asset.serialNumber,
          Status: asset.status,
          'Location/Station': asset.location,
          'User Name': asset.userName,
          'Created By': asset.createdBy,
          'Modified By': asset.modifiedBy,
          'Created at': new Date(asset.createdAt).toLocaleString(),
          'Last Updated': new Date(asset.lastUpdated).toLocaleString(),
        };

        if (asset.customFields) {
          Object.entries(asset.customFields).forEach(([key, value]) => {
            baseData[key] = value;
          });
        }

        return baseData;
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Selected Assets');

      const filename = `asset-inventory-selected-${Date.now()}.xlsx`;
      XLSX.writeFile(workbook, filename);

      // Add activity log entry
      addActivity(
        `exported ${selectedAssets.length} selected assets as Excel`,
        'export',
        `File: ${filename}`
      );

      toast.success(`Exported ${selectedAssets.length} selected assets`);
    } catch (error) {
      toast.error('Failed to export selected assets');
    }
  };

  const handlePrint = () => {
    // Add activity log entry
    addActivity(
      `printed inventory`,
      'export',
      `${filteredAssets.length} assets`
    );

    window.print();
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
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

  const handleBulkDelete = () => {
    const selectedIds = Array.from(selectedRows);
    const deletedAssets = assets.filter((asset) => selectedIds.includes(asset.id));
    setAssets(assets.filter((asset) => !selectedIds.includes(asset.id)));
    setSelectedRows(new Set());

    // Add activity log entry
    addActivity(
      `bulk deleted ${selectedIds.length} assets`,
      'delete',
      `Deleted assets: ${deletedAssets.map(a => a.serialNumber).join(', ')}`
    );

    toast.success(`Deleted ${selectedIds.length} assets`);
  };

  const handleBulkUpdateStatus = (status: string) => {
    const selectedIds = Array.from(selectedRows);
    const updatedAssets = assets.filter((asset) => selectedIds.includes(asset.id));
    setAssets(
      assets.map((asset) =>
        selectedIds.includes(asset.id)
          ? {
              ...asset,
              status: status as Asset['status'],
              modifiedBy: CURRENT_USER,
              lastUpdated: new Date().toISOString(),
            }
          : asset
      )
    );

    // Add activity log entry
    addActivity(
      `bulk updated status to "${status}" for ${selectedIds.length} assets`,
      'update',
      `Updated assets: ${updatedAssets.map(a => a.serialNumber).join(', ')}`
    );

    toast.success(`Updated status for ${selectedIds.length} assets`);
  };

  const handleBulkUpdateLocation = (location: string) => {
    const selectedIds = Array.from(selectedRows);
    const updatedAssets = assets.filter((asset) => selectedIds.includes(asset.id));
    setAssets(
      assets.map((asset) =>
        selectedIds.includes(asset.id)
          ? {
              ...asset,
              location,
              modifiedBy: CURRENT_USER,
              lastUpdated: new Date().toISOString(),
            }
          : asset
      )
    );

    // Add activity log entry
    addActivity(
      `bulk updated location to "${location}" for ${selectedIds.length} assets`,
      'update',
      `Updated assets: ${updatedAssets.map(a => a.serialNumber).join(', ')}`
    );

    toast.success(`Updated location for ${selectedIds.length} assets`);
  };

  const handleDuplicateAsset = (asset: Asset) => {
    const newAsset: Asset = {
      ...asset,
      id: Date.now().toString(),
      index: assets.length,
      serialNumber: `${asset.serialNumber}-COPY`,
      createdBy: CURRENT_USER,
      modifiedBy: CURRENT_USER,
      lastUpdated: new Date().toISOString(),
    };
    setAssets([...assets, newAsset]);

    // Add activity log entry
    addActivity(
      `duplicated asset "${asset.assetType}" (${asset.serialNumber})`,
      'create',
      `New serial: ${newAsset.serialNumber}`
    );

    toast.success('Asset duplicated successfully!');
  };

  const handleDeleteColumn = (column: string) => {
    setCustomColumns(customColumns.filter((col) => col !== column));
    setAssets(
      assets.map((asset) => {
        const newCustomFields = { ...asset.customFields };
        delete newCustomFields[column];
        return { ...asset, customFields: newCustomFields };
      })
    );
    setDeleteColumnDialogOpen(false);
    setColumnToDelete(null);

    // Add activity log entry
    addActivity(
      `deleted custom column "${column}"`,
      'delete',
      `Column removed from inventory`
    );

    toast.success('Column deleted successfully!');
  };

  const confirmDeleteColumn = (column: string) => {
    setColumnToDelete(column);
    setDeleteColumnDialogOpen(true);
  };

  // Helper to render resizable column header
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
              onClick={() => handleSort(sortKey)}
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
            {/* Invisible hitbox for easier grabbing */}
            <div
              className="absolute -right-2 top-0 bottom-0 w-6 cursor-col-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, columnKey)}
              style={{ userSelect: 'none' }}
              title="Drag to resize"
            />
            {/* Visible resize handle */}
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

  // Column width resizing handlers - Global lock toggle
  const handleGlobalLockToggle = () => {
    setGlobalResizeLock(!globalResizeLock);
    toast.info(globalResizeLock ? 'All columns unlocked - drag to resize' : 'All columns locked');
  };

  const handleMouseDown = (e: React.MouseEvent, columnKey: string) => {
    if (globalResizeLock) {
      console.log('Columns are locked, cannot resize');
      return;
    }
    
    console.log('Starting resize:', { columnKey, clientX: e.clientX, currentWidth: columnWidths[columnKey] });
    
    e.preventDefault();
    e.stopPropagation();
    
    resizeRef.current = {
      startX: e.clientX,
      startWidth: columnWidths[columnKey],
      columnKey,
    };
    setResizingColumn(columnKey);
  };

  useEffect(() => {
    if (!resizingColumn || !resizeRef.current) {
      return;
    }

    console.log('Setting up resize event listeners for:', resizingColumn);
    let currentWidth = columnWidths[resizingColumn];
    const columnKey = resizingColumn;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeRef.current || resizeRef.current.columnKey !== columnKey) return;
      
      e.preventDefault();
      const diff = e.clientX - resizeRef.current.startX;
      const newWidth = Math.max(40, Math.min(500, resizeRef.current.startWidth + diff));
      currentWidth = newWidth;
      setColumnWidths(prev => ({ ...prev, [columnKey]: newWidth }));
    };

    const handleMouseUp = (e: MouseEvent) => {
      console.log('Mouse up:', { currentWidth });
      e.preventDefault();
      setResizingColumn(null);
      resizeRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      console.log('Cleaning up resize event listeners');
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingColumn, columnWidths]);

  return (
    <div className={`min-h-screen p-6 transition-colors ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Toaster position="top-right" />
      
      {/* Settings Tab */}
      <SettingsTab onClick={() => setSettingsPanelOpen(true)} />
      
      {/* Settings Panel */}
      <SettingsPanel
        open={settingsPanelOpen}
        onClose={() => setSettingsPanelOpen(false)}
        darkMode={darkMode}
        onDarkModeChange={setDarkMode}
        brandOptions={brandOptions}
        onBrandOptionsChange={setBrandOptions}
        statusOptions={statusOptions}
        onStatusOptionsChange={setStatusOptions}
        onActivityLogOpen={() => {
          setActivityLogOpen(true);
          setShowMainPage(false);
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
        darkMode={darkMode}
        activities={activities}
      />

      {showMainPage && !activityLogOpen && (
        <>
        <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg" style={{ backgroundColor: LINE_GREEN }}>
                <Package className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className={darkMode ? 'text-gray-100' : 'text-gray-900'}>Asset Inventory</h1>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Manage and track your organizational assets</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* User Info */}
              {user && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div
                    className="flex items-center justify-center h-8 w-8 rounded-full text-white text-sm"
                    style={{ backgroundColor: LINE_GREEN }}
                  >
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{user.username}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{user.role}</p>
                  </div>
                </div>
              )}
              <ImportMenu onImportExcel={importExcel} onImportCSV={importCSV} />
              <ExportMenu 
                onExportImage={exportAsImage} 
                onExportPDF={exportAsPDF} 
                onExportExcel={exportAsExcel}
                onExportSelectedExcel={exportSelectedExcel}
                onPrint={handlePrint}
                hasSelection={selectedRows.size > 0}
              />
              <BackupMenu onCreateBackup={createBackup} onRestoreBackup={restoreBackup} />
              <Button onClick={() => setDialogOpen(true)} style={{ backgroundColor: LINE_GREEN }} className="text-white hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                Add Asset
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl" style={{ color: LINE_GREEN }}>
                  {filteredAssets.length}
                </div>
              </CardContent>
            </Card>
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-green-600">{filteredAssets.filter((a) => a.status === 'Active').length}</div>
              </CardContent>
            </Card>
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Maintenance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-yellow-600">{filteredAssets.filter((a) => a.status === 'Maintenance').length}</div>
              </CardContent>
            </Card>
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Asset Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl" style={{ color: LINE_GREEN }}>
                  {assetTypes.length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
            assetTypeFilter={assetTypeFilter}
            onAssetTypeFilterChange={handleAssetTypeFilterChange}
            assetTypes={assetTypes}
            searchInputRef={searchInputRef}
          />

          {/* Selection Indicator */}
          <div
            className="flex items-center justify-between px-4 rounded-lg border min-h-[52px]"
            style={{ 
              backgroundColor: darkMode ? '#1a4d2e' : '#f0fdf4', 
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
                    onBulkDelete={handleBulkDelete}
                    onBulkUpdateStatus={handleBulkUpdateStatus}
                    onBulkUpdateLocation={handleBulkUpdateLocation}
                  />
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
              </>
            ) : (
              <div className={`text-sm py-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Select a row
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div ref={tableRef}>
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardContent className="p-0">
              <div className="overflow-x-scroll" style={{ maxWidth: '100%' }}>
              <Table style={{ width: 'max-content', minWidth: '100%' }}>
                <TableHeader>
                  <TableRow style={{ backgroundColor: darkMode ? '#1a4d2e' : '#f0fdf4' }}>
                    <TableHead className="w-12 relative" style={{ backgroundColor: darkMode ? '#1a4d2e' : '#f0fdf4' }}>
                      <button
                        onClick={handleGlobalLockToggle}
                        className={`p-1.5 rounded transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                        title={globalResizeLock ? 'Unlock all columns to resize' : 'Lock all columns'}
                      >
                        {globalResizeLock ? (
                          <Lock className={`h-4 w-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                        ) : (
                          <Unlock className="h-4 w-4" style={{ color: LINE_GREEN }} />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="w-12"></TableHead>
                    {renderResizableHeader('index', 'Index', 'index')}
                    {renderResizableHeader('image', 'Image')}
                    {renderResizableHeader('assetType', 'Asset Type', 'assetType')}
                    {renderResizableHeader('brandMake', 'Brand/Make', 'brandMake')}
                    {renderResizableHeader('modelNumber', 'Model Number', 'modelNumber')}
                    {renderResizableHeader('serialNumber', 'Serial Number', 'serialNumber')}
                    {renderResizableHeader('barcode', 'Barcode', 'barcode')}
                    {renderResizableHeader('status', 'Status', 'status')}
                    {renderResizableHeader('location', 'Location/Station', 'location')}
                    {renderResizableHeader('userName', 'User Name', 'userName')}
                    {renderResizableHeader('createdBy', 'Created By', 'createdBy')}
                    {renderResizableHeader('modifiedBy', 'Modified By', 'modifiedBy')}
                    {renderResizableHeader('createdAt', 'Created at', 'createdAt')}
                    {renderResizableHeader('lastUpdated', 'Last Updated', 'lastUpdated')}
                    <TableHead 
                      className="relative hover:bg-green-100" 
                      style={{ 
                        width: `${columnWidths.comments || 200}px`, 
                        minWidth: `${columnWidths.comments || 200}px`,
                        maxWidth: `${columnWidths.comments || 200}px`
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>Comments</span>
                      </div>
                      {!globalResizeLock && (
                        <>
                          <div
                            className="absolute -right-2 top-0 bottom-0 w-6 cursor-col-resize z-10"
                            onMouseDown={(e) => handleMouseDown(e, 'comments')}
                            style={{ userSelect: 'none' }}
                            title="Drag to resize"
                          />
                          <div
                            className="absolute right-0 top-0 bottom-0 w-1 pointer-events-none transition-all z-10"
                            style={{ 
                              backgroundColor: resizingColumn === 'comments' ? '#16a34a' : '#4ade80',
                              boxShadow: resizingColumn === 'comments' ? '0 0 4px rgba(22, 163, 74, 0.5)' : 'none'
                            }}
                          />
                        </>
                      )}
                      {resizingColumn === 'comments' && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-20">
                          {columnWidths.comments || 200}px
                        </div>
                      )}
                    </TableHead>
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
                            <div className="flex items-center gap-1 cursor-pointer flex-1" onClick={() => handleSort(column)}>
                              <span>{column}</span>
                              {getSortIcon(column)}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => confirmDeleteColumn(column)}
                              className="h-6 w-6 p-0 hover:bg-red-100 flex-shrink-0"
                            >
                              <Trash2 className="h-3 w-3 text-red-600" />
                            </Button>
                          </div>
                          {!globalResizeLock && (
                            <>
                              <div
                                className="absolute -right-2 top-0 bottom-0 w-6 cursor-col-resize z-10"
                                onMouseDown={(e) => handleMouseDown(e, columnKey)}
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
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAddColumnDialogOpen(true)}
                        style={{ color: LINE_GREEN }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Column
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={17 + customColumns.length} className="text-center py-12">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                          <span className="ml-2">Loading assets...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredAssets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={17 + customColumns.length} className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {assets.length === 0 ? 'No assets found. Add your first asset to get started!' : 'No assets match your filters.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedAssets.map((asset) => {
                      const isSelected = selectedRows.has(asset.id);
                      const isHovered = hoveredRow === asset.id;
                      const showCheckbox = isSelected || isHovered;
                      const getCellHighlight = (fieldName: string) => {
                        const isUpdated = updatedCells.has(`${asset.id}-${fieldName}`) && !isSelected && !isHovered;
                        return isUpdated 
                          ? (darkMode ? 'border-2 border-yellow-500 rounded px-1 bg-yellow-900/30' : 'border-2 border-yellow-400 rounded px-1 bg-yellow-50')
                          : '';
                      };

                      return (
                        <TableRow
                          key={asset.id}
                          className={`transition-colors ${
                            darkMode 
                              ? `hover:bg-gray-700 ${isSelected ? 'bg-blue-900/50' : ''}` 
                              : `hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`
                          }`}
                          onDoubleClick={() => handleRowDoubleClick(asset)}
                          onClick={(e) => handleRowClick(asset.id, e)}
                          onMouseEnter={() => setHoveredRow(asset.id)}
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
                                onCheckedChange={() => handleCheckboxChange(asset.id)}
                              />
                            </div>
                          </TableCell>

                          {/* Index - Fixed, not editable */}
                          <TableCell style={{ 
                            width: `${columnWidths.index || 80}px`, 
                            minWidth: `${columnWidths.index || 80}px`,
                            maxWidth: `${columnWidths.index || 80}px`
                          }}>
                            <div className="text-center">{asset.index}</div>
                          </TableCell>

                          {/* Image */}
                          <TableCell style={{ 
                            width: `${columnWidths.image || 100}px`, 
                            minWidth: `${columnWidths.image || 100}px`,
                            maxWidth: `${columnWidths.image || 100}px`
                          }}>
                            {asset.image ? (
                              <ImageWithFallback
                                src={asset.image}
                                alt={asset.assetType}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </TableCell>

                          {/* Asset Type */}
                          <TableCell style={{ width: `${columnWidths.assetType || 150}px`, minWidth: `${columnWidths.assetType || 150}px`, maxWidth: `${columnWidths.assetType || 150}px` }}>
                            <div className={getCellHighlight('assetType')}>
                              {asset.assetType}
                            </div>
                          </TableCell>

                          {/* Brand/Make */}
                          <TableCell style={{ width: `${columnWidths.brandMake || 150}px`, minWidth: `${columnWidths.brandMake || 150}px`, maxWidth: `${columnWidths.brandMake || 150}px` }}>
                            <div className={getCellHighlight('brandMake')}>
                              {asset.brandMake}
                            </div>
                          </TableCell>

                          {/* Model Number */}
                          <TableCell style={{ width: `${columnWidths.modelNumber || 150}px`, minWidth: `${columnWidths.modelNumber || 150}px`, maxWidth: `${columnWidths.modelNumber || 150}px` }}>
                            <div className={getCellHighlight('modelNumber')}>
                              {asset.modelNumber}
                            </div>
                          </TableCell>

                          {/* Serial Number */}
                          <TableCell style={{ width: `${columnWidths.serialNumber || 150}px`, minWidth: `${columnWidths.serialNumber || 150}px`, maxWidth: `${columnWidths.serialNumber || 150}px` }}>
                            <div className={getCellHighlight('serialNumber')}>
                              {asset.serialNumber}
                            </div>
                          </TableCell>

                          {/* Barcode */}
                          <TableCell style={{ width: `${columnWidths.barcode || 150}px`, minWidth: `${columnWidths.barcode || 150}px`, maxWidth: `${columnWidths.barcode || 150}px` }}>
                            <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm ${getCellHighlight('barcode')}`}>
                              {asset.barcode || '-'}
                            </div>
                          </TableCell>

                          {/* Status */}
                          <TableCell style={{ width: `${columnWidths.status || 120}px`, minWidth: `${columnWidths.status || 120}px`, maxWidth: `${columnWidths.status || 120}px` }}>
                            <div className={`inline-block ${getCellHighlight('status')}`}>
                              <Badge className={`${getStatusColor(asset.status)} text-white`}>{asset.status}</Badge>
                            </div>
                          </TableCell>

                          {/* Location/Station */}
                          <TableCell style={{ width: `${columnWidths.location || 150}px`, minWidth: `${columnWidths.location || 150}px`, maxWidth: `${columnWidths.location || 150}px` }}>
                            <div className={getCellHighlight('location')}>
                              {asset.location}
                            </div>
                          </TableCell>

                          {/* User Name */}
                          <TableCell style={{ width: `${columnWidths.userName || 150}px`, minWidth: `${columnWidths.userName || 150}px`, maxWidth: `${columnWidths.userName || 150}px` }}>
                            <div className={getCellHighlight('userName')}>
                              {asset.userName}
                            </div>
                          </TableCell>

                          {/* Created By */}
                          <TableCell style={{ width: `${columnWidths.createdBy || 150}px`, minWidth: `${columnWidths.createdBy || 150}px`, maxWidth: `${columnWidths.createdBy || 150}px` }}>{asset.createdBy}</TableCell>

                          {/* Modified By */}
                          <TableCell style={{ width: `${columnWidths.modifiedBy || 150}px`, minWidth: `${columnWidths.modifiedBy || 150}px`, maxWidth: `${columnWidths.modifiedBy || 150}px` }}>{asset.modifiedBy}</TableCell>

                          {/* Created at */}
                          <TableCell style={{ width: `${columnWidths.createdAt || 180}px`, minWidth: `${columnWidths.createdAt || 180}px`, maxWidth: `${columnWidths.createdAt || 180}px` }}>
                            <div className="text-sm text-gray-600">{new Date(asset.createdAt).toLocaleString()}</div>
                          </TableCell>

                          {/* Last Updated */}
                          <TableCell style={{ width: `${columnWidths.lastUpdated || 180}px`, minWidth: `${columnWidths.lastUpdated || 180}px`, maxWidth: `${columnWidths.lastUpdated || 180}px` }}>
                            <div className="text-sm text-gray-600">{new Date(asset.lastUpdated).toLocaleString()}</div>
                          </TableCell>

                          {/* Comments */}
                          <TableCell style={{ width: `${columnWidths.comments || 200}px`, minWidth: `${columnWidths.comments || 200}px`, maxWidth: `${columnWidths.comments || 200}px` }}>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <MessageSquare className="h-4 w-4" />
                              <span>{asset.comments?.length || 0}</span>
                            </div>
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
                                <div className={`${updatedCells.has(`${asset.id}-${column}`) && !isSelected && !isHovered ? 'border-2 border-yellow-400 rounded px-1 bg-yellow-50' : ''}`}>
                                  {asset.customFields?.[column] || '-'}
                                </div>
                              </TableCell>
                            );
                          })}

                          {/* Empty cell for Add Column button alignment */}
                          <TableCell></TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Footer with Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {filteredAssets.length === 0 ? 0 : (currentPage - 1) * (itemsPerPage === 'all' ? filteredAssets.length : itemsPerPage) + 1} to {Math.min(currentPage * (itemsPerPage === 'all' ? filteredAssets.length : itemsPerPage), filteredAssets.length)} of {filteredAssets.length} assets
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {itemsPerPage !== 'all' && totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum ? "text-white" : ""}
                        style={currentPage === pageNum ? { backgroundColor: LINE_GREEN } : {}}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Asset Dialog */}
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
      />

      {/* Add Column Dialog */}
      <Dialog open={addColumnDialogOpen} onOpenChange={setAddColumnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Column</DialogTitle>
            <DialogDescription>
              Create a new custom column to track additional asset information.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="columnName">Column Name</Label>
            <Input
              id="columnName"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="e.g., Department, Cost Center"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddColumnDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddColumn} style={{ backgroundColor: LINE_GREEN }} className="text-white hover:opacity-90">
              Add Column
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Column Confirmation Dialog */}
      <AlertDialog open={deleteColumnDialogOpen} onOpenChange={setDeleteColumnDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Column</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the column "{columnToDelete}"? This will remove all data in this column from all assets. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => columnToDelete && handleDeleteColumn(columnToDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete Column
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcuts open={showShortcuts} onClose={() => setShowShortcuts(false)} />
        </>
      )}
    </div>
  );
}

// Main App component with authentication wrapper
export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <AuthProvider>
      <AppContent 
        showLogin={showLogin}
        setShowLogin={setShowLogin}
        showSignup={showSignup}
        setShowSignup={setShowSignup}
      />
    </AuthProvider>
  );
}

function AppContent({ 
  showLogin, 
  setShowLogin, 
  showSignup, 
  setShowSignup 
}: { 
  showLogin: boolean;
  setShowLogin: (show: boolean) => void;
  showSignup: boolean;
  setShowSignup: (show: boolean) => void;
}) {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<'landing' | 'inventory' | 'stock' | 'reports'>('landing');

  useEffect(() => {
    // Show login dialog if not authenticated
    if (!isAuthenticated) {
      setShowLogin(true);
    } else {
      // Close both dialogs when authenticated
      setShowLogin(false);
      setShowSignup(false);
    }
  }, [isAuthenticated]);

  // Prevent closing dialogs when not authenticated
  useEffect(() => {
    if (!isAuthenticated && !showLogin && !showSignup) {
      // If both dialogs are closed and user is not authenticated, reopen login
      setShowLogin(true);
    }
  }, [isAuthenticated, showLogin, showSignup]);

  // Reset to landing page when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentPage('landing');
    }
  }, [isAuthenticated]);

  const handleSwitchToSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const handleSwitchToLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  // Wrapper functions to prevent closing when not authenticated
  const handleLoginOpenChange = (open: boolean) => {
    // Only allow closing if authenticated
    if (isAuthenticated || open) {
      setShowLogin(open);
    }
    // If not authenticated and trying to close, do nothing (keep it open)
  };

  const handleSignupOpenChange = (open: boolean) => {
    // Only allow closing if authenticated
    if (isAuthenticated || open) {
      setShowSignup(open);
    }
    // If not authenticated and trying to close, do nothing (keep it open)
  };

  const handleNavigate = (page: 'landing' | 'inventory' | 'stock' | 'reports') => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'inventory':
        return (
          <InventoryPage 
            inventoryComponent={<AssetInventory onBackToLanding={() => handleNavigate('landing')} />}
            onBack={() => handleNavigate('landing')}
          />
        );
      case 'stock':
        return <StockPage onBack={() => handleNavigate('landing')} />;
      case 'reports':
        return <ReportsPage onBack={() => handleNavigate('landing')} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      {isAuthenticated ? (
        renderCurrentPage()
      ) : (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#06C755' }}>
                <Package className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl text-gray-900 mb-2">Asset Inventory</h1>
            <p className="text-gray-600 mb-6">Please login to continue</p>
          </div>
        </div>
      )}
      
      <LoginDialog
        open={showLogin}
        onOpenChange={handleLoginOpenChange}
        onSwitchToSignup={handleSwitchToSignup}
      />
      
      <SignupDialog
        open={showSignup}
        onOpenChange={handleSignupOpenChange}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </>
  );
}