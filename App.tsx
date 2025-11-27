import { useState, useRef, useEffect, useMemo } from 'react';
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
import { BulkActionsMenu } from './components/BulkActionsMenu';
import { ImportExportBackupMenu } from './components/ImportExportBackupMenu';
import { ColumnOptionsMenu } from './components/ColumnOptionsMenu';
import { KeyboardShortcuts } from './components/KeyboardShortcuts';
// Removed unused `ImageWithFallback` import (not referenced in this file)
import { AuthProvider, useAuth } from './components/AuthContext';
import { LoginDialog } from './components/LoginDialog';
import { SignupDialog } from './components/SignupDialog';
import { SettingsPanel } from './components/SettingsPanel';
import { SettingsTab } from './components/SettingsTab';
import { ActivityLogPage, ActivityLogEntry } from './components/ActivityLogPage';
import { ActivityLogFullPage } from './components/ActivityLogFullPage';
import { LandingPage } from './components/LandingPage';
import { InventoryPage } from './components/InventoryPage';
import { UserManagementPage, User } from './components/UserManagementPage';
import { ReportsPage } from './components/ReportsPage';
import { AccessoriesDialog, Accessory } from './components/AccessoriesDialog';
import { AccessoriesTable } from './components/AccessoriesTable';
import { StatusSelectionDialog } from './components/StatusSelectionDialog';
import { ActionDialog } from './components/ActionDialog';
import { DashboardDropdown } from './components/DashboardDropdown';
import { DeleteAccessoryDialog } from './components/DeleteAccessoryDialog';
import { MonthlyReportsPage } from './components/MonthlyReportsPage';
import { Plus, Package, X, ArrowUpDown, ArrowUp, ArrowDown, Trash2, Lock, Unlock, User as UserIcon, ArrowLeft, Users } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import type { AuditEntry } from './components/AuditLog';
import "./styles/globals.css";

const LINE_GREEN = '#06C755';

const initialAssets: Asset[] = [
  {
    id: '1',
    index: 0,
    image: undefined,
    assetType: 'Laptop',
    brandMake: 'Apple',
    modelNumber: 'MBP-16-2024',
    serialNumber: 'SN1234567890',
    barcode: '',
    description: '',
    status: 'On-Stock',
    location: 'Office - Desk 12',
    userName: 'John Smith',
    createdBy: 'Admin User',
    modifiedBy: 'Admin User',
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    customFields: {},
    auditLog: [],
    attachments: [],
    comments: [],
  },
  {
    id: '2',
    index: 1,
    image: undefined,
    assetType: 'Chair',
    brandMake: 'Herman Miller',
    modelNumber: 'Aeron-2023',
    serialNumber: 'SN0987654321',
    barcode: '',
    description: '',
    status: 'On-Stock',
    location: 'Office - Desk 12',
    userName: 'John Smith',
    createdBy: 'Admin User',
    modifiedBy: 'Admin User',
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    customFields: {},
    auditLog: [],
    attachments: [],
    comments: [],
  },
  {
    id: '3',
    index: 2,
    image: undefined,
    assetType: 'Monitor',
    brandMake: 'Dell',
    modelNumber: 'U2723DE',
    serialNumber: 'SN1122334455',
    barcode: '',
    description: '',
    status: 'Maintenance',
    location: 'Warehouse',
    userName: 'Unassigned',
    createdBy: 'Admin User',
    modifiedBy: 'Admin User',
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    customFields: {},
    auditLog: [],
    attachments: [],
    comments: [],
  },
];

interface AssetInventoryProps {
  onBackToLanding: () => void;
  onNavigateToActivityLog?: () => void;
}

function AssetInventory({ onBackToLanding, onNavigateToActivityLog }: AssetInventoryProps) {
  const { user } = useAuth();
  const CURRENT_USER = user?.username || 'Admin User';
  
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
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
  const [brandOptions, setBrandOptions] = useState<string[]>(() => {
    const saved = localStorage.getItem('brandOptions');
    return saved ? JSON.parse(saved) : ['Apple', 'Dell', 'HP', 'Lenovo', 'Microsoft', 'Herman Miller'];
  });
  const [assetTypeOptions, setAssetTypeOptions] = useState<string[]>(() => {
    const saved = localStorage.getItem('assetTypeOptions');
    return saved ? JSON.parse(saved) : ['Laptop', 'Desktop', 'Monitor', 'Chair', 'Desk', 'Keyboard', 'Mouse', 'Headset', 'USB Cable', 'HDMI Cable', 'Adapter', 'Webcam', 'Microphone', 'Docking Station'];
  });
  // Derive user options from registered users (get from localStorage)
  const userOptions = useMemo(() => {
    const saved = localStorage.getItem('users');
    if (saved) {
      const users = JSON.parse(saved);
      return ['N/A', ...users.map((user: User) => user.name)];
    }
    return ['N/A', 'Admin User', 'IT Staff'];
  }, []);
  
  // Dashboard state
  const [activeDashboard, setActiveDashboard] = useState<'equipments' | 'accessories'>('equipments');
  
  // Accessories state
  const [accessories, setAccessories] = useState<Accessory[]>(() => {
    const saved = localStorage.getItem('accessories');
    if (saved) {
      return JSON.parse(saved);
    }
    // Default sample accessories
    return [
      {
        id: 'acc-1',
        index: 0,
        assetType: 'Mouse',
        modelNumber: 'MX Master 3',
        brandMake: 'Logitech',
        barcode: 'ACC-MOUSE-001',
        serialNumber: 'MXM3-12345',
        quantity: 15,
        status: 'On-Stock',
        location: 'Storage Room A',
        auditLog: [{
          id: 'audit-1',
          timestamp: new Date().toISOString(),
          user: 'Admin User',
          action: 'created',
          description: 'created accessory',
        }],
        dateCreated: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'acc-2',
        index: 1,
        assetType: 'Headset',
        modelNumber: 'Cloud II',
        brandMake: 'HyperX',
        barcode: 'ACC-HEADSET-001',
        serialNumber: 'CLD2-67890',
        quantity: 12,
        status: 'On-Stock',
        location: 'Storage Room A',
        auditLog: [{
          id: 'audit-2',
          timestamp: new Date().toISOString(),
          user: 'Admin User',
          action: 'created',
          description: 'created accessory',
        }],
        dateCreated: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'acc-3',
        index: 2,
        assetType: 'HDMI Cable',
        modelNumber: 'N/A',
        brandMake: 'N/A',
        barcode: 'ACC-HDMI-001',
        serialNumber: 'N/A',
        quantity: 25,
        status: 'On-Stock',
        location: 'Storage Room B',
        auditLog: [{
          id: 'audit-3',
          timestamp: new Date().toISOString(),
          user: 'Admin User',
          action: 'created',
          description: 'created accessory',
        }],
        dateCreated: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'acc-4',
        index: 3,
        assetType: 'Keyboard',
        modelNumber: 'K380',
        brandMake: 'Logitech',
        barcode: 'ACC-KEYB-001',
        serialNumber: 'K380-11223',
        quantity: 10,
        status: 'On-Stock',
        location: 'Storage Room A',
        auditLog: [{
          id: 'audit-4',
          timestamp: new Date().toISOString(),
          user: 'Admin User',
          action: 'created',
          description: 'created accessory',
        }],
        dateCreated: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'acc-5',
        index: 4,
        assetType: 'USB Cable',
        modelNumber: 'USB-C 3.1',
        brandMake: 'N/A',
        barcode: 'ACC-USB-001',
        serialNumber: 'N/A',
        quantity: 50,
        status: 'On-Stock',
        location: 'Storage Room B',
        auditLog: [{
          id: 'audit-5',
          timestamp: new Date().toISOString(),
          user: 'Admin User',
          action: 'created',
          description: 'created accessory',
        }],
        dateCreated: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'acc-6',
        index: 5,
        assetType: 'Webcam',
        modelNumber: 'C920',
        brandMake: 'Logitech',
        barcode: 'ACC-WEBCAM-001',
        serialNumber: 'C920-44556',
        quantity: 8,
        status: 'On-Stock',
        location: 'Storage Room A',
        auditLog: [{
          id: 'audit-6',
          timestamp: new Date().toISOString(),
          user: 'Admin User',
          action: 'created',
          description: 'created accessory',
        }],
        dateCreated: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'acc-7',
        index: 6,
        assetType: 'Monitor Stand',
        modelNumber: 'MS-2024',
        brandMake: 'Dell',
        barcode: 'ACC-STAND-001',
        serialNumber: 'MS-77889',
        quantity: 20,
        status: 'On-Stock',
        location: 'Storage Room C',
        auditLog: [{
          id: 'audit-7',
          timestamp: new Date().toISOString(),
          user: 'Admin User',
          action: 'created',
          description: 'created accessory',
        }],
        dateCreated: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'acc-8',
        index: 7,
        assetType: 'Laptop Charger',
        modelNumber: '65W USB-C',
        brandMake: 'Dell',
        barcode: 'ACC-CHARGER-001',
        serialNumber: 'N/A',
        quantity: 18,
        status: 'On-Stock',
        location: 'Storage Room A',
        auditLog: [{
          id: 'audit-8',
          timestamp: new Date().toISOString(),
          user: 'Admin User',
          action: 'created',
          description: 'created accessory',
        }],
        dateCreated: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
    ];
  });
  const [accessoriesDialogOpen, setAccessoriesDialogOpen] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState<Accessory | undefined>(undefined);
  const [statusSelectionOpen, setStatusSelectionOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [requestingAccessory, setRequestingAccessory] = useState<Accessory | null>(null);
  const [selectedActionStatus, setSelectedActionStatus] = useState<'On-Stock' | 'Reserve' | 'Issued' | 'Maintenance' | 'Retired'>('On-Stock');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAccessory, setDeletingAccessory] = useState<Accessory | null>(null);
  
  // Status types are now fixed: On-Stock, Reserve, Issued

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
  
  // Persist accessories
  useEffect(() => {
    localStorage.setItem('accessories', JSON.stringify(accessories));
  }, [accessories]);
  
  // Clear selection and reset page when switching dashboards
  useEffect(() => {
    setSelectedRows(new Set());
    setCurrentPage(1);
  }, [activeDashboard]);
  
  // Column width resizing - Multi-column support
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
  
  const [globalResizeLock, setGlobalResizeLock] = useState<boolean>(true); // Master lock for all columns
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(defaultColumnWidths);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const resizeRef = useRef<{ startX: number; startWidth: number; columnKey: string } | null>(null);

  const assetTypes = activeDashboard === 'equipments'
    ? Array.from(new Set(assets.map((asset) => asset.assetType).filter((type) => type && type.trim() !== '')))
    : Array.from(new Set(accessories.map((accessory) => accessory.assetType).filter((type) => type && type.trim() !== '')));

  // Persist settings to localStorage
  useEffect(() => {
    localStorage.setItem('brandOptions', JSON.stringify(brandOptions));
  }, [brandOptions]);

  useEffect(() => {
    localStorage.setItem('assetTypeOptions', JSON.stringify(assetTypeOptions));
  }, [assetTypeOptions]);

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

  // Filter and sort accessories
  let filteredAccessories = accessories.filter((accessory) => {
    const matchesSearch = searchTerm === '' || 
      Object.values(accessory).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesStatus = statusFilter === 'all' || accessory.status === statusFilter;
    const matchesType = assetTypeFilter === 'all' || accessory.assetType === assetTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Apply sorting to accessories
  if (sortColumn) {
    filteredAccessories = [...filteredAccessories].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortColumn === 'assetType') {
        aValue = a.assetType;
        bValue = b.assetType;
      } else if (sortColumn === 'serialNumber') {
        aValue = a.serialNumber || '';
        bValue = b.serialNumber || '';
      } else if (sortColumn === 'quantity') {
        aValue = a.quantity;
        bValue = b.quantity;
      } else if (sortColumn === 'status') {
        aValue = a.status;
        bValue = b.status;
      } else if (sortColumn === 'lastUpdated') {
        aValue = new Date(a.lastUpdated).getTime();
        bValue = new Date(b.lastUpdated).getTime();
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
  const currentItems = activeDashboard === 'equipments' ? filteredAssets : filteredAccessories;
  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(currentItems.length / itemsPerPage);
  const paginatedAssets = itemsPerPage === 'all' 
    ? filteredAssets 
    : filteredAssets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const paginatedAccessories = itemsPerPage === 'all'
    ? filteredAccessories
    : filteredAccessories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

  const handleAddAsset = (assetData: Omit<Asset, 'id' | 'index' | 'createdAt' | 'lastUpdated'>) => {
    if (editingAsset) {
      // Track changes for audit log and highlighting
      const changes: AuditEntry[] = [];
      const changedCells = new Set<string>();
      
      Object.keys(assetData).forEach((key) => {
        const oldValue = editingAsset[key as keyof Asset];
        const newValue = assetData[key as keyof Omit<Asset, 'id' | 'index' | 'createdAt' | 'lastUpdated'>];
        
        if (oldValue !== newValue && key !== 'modifiedBy' && key !== 'auditLog' && key !== 'customFields' && key !== 'attachments' && key !== 'comments') {
          changes.push({
            id: `${Date.now()}-${key}`,
            timestamp: new Date().toISOString(),
            user: CURRENT_USER,
            action: 'updated',
            field: key,
            oldValue: String(oldValue),
            newValue: String(newValue),
            description: `updated ${key}`,
          });
          changedCells.add(`${editingAsset.id}-${key}`);
        }
      });

      // Update existing asset
      setAssets(
        assets.map((asset) =>
          asset.id === editingAsset.id
            ? {
                ...asset,
                ...assetData,
                modifiedBy: CURRENT_USER,
                lastUpdated: new Date().toISOString(),
                auditLog: [...(asset.auditLog ?? []), ...changes],
              }
            : asset
        )
      );

      // Highlight changed cells
      setUpdatedCells(new Set([...updatedCells, ...changedCells]));
      setTimeout(() => {
        setUpdatedCells(new Set());
      }, 3000);

      // Add activity log entry
      addActivity(
        `updated asset "${assetData.assetType}" (${assetData.serialNumber})`,
        'update',
        changes.map(c => `${c.field}: "${c.oldValue}" → "${c.newValue}"`).join(', ')
      );

      toast.success('Asset updated successfully!');
    } else {
      // Add new asset with initial audit log entry
      const initialAudit: AuditEntry = {
        id: `${Date.now()}-created`,
        timestamp: new Date().toISOString(),
        user: CURRENT_USER,
        action: 'created',
        description: 'created asset',
      };

      const newAsset: Asset = {
        ...assetData,
        id: Date.now().toString(),
        index: assets.length,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        auditLog: [initialAudit],
      };
      setAssets([...assets, newAsset]);

      // Add activity log entry
      addActivity(
        `created new asset "${assetData.assetType}" (${assetData.serialNumber})`,
        'create',
        `Type: ${assetData.assetType}, Brand: ${assetData.brandMake}, Model: ${assetData.modelNumber}`
      );

      toast.success('Asset added successfully!');
    }
  };

  const handleDeleteAsset = (id: string) => {
    const asset = assets.find(a => a.id === id);
    setAssets(assets.filter((asset) => asset.id !== id));
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });

    // Add activity log entry
    if (asset) {
      addActivity(
        `deleted asset "${asset.assetType}" (${asset.serialNumber})`,
        'delete',
        `Type: ${asset.assetType}, Brand: ${asset.brandMake}, Model: ${asset.modelNumber}`
      );
    }

    toast.success('Asset deleted successfully!');
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingAsset(undefined);
  };

  const handleRowDoubleClick = (asset: Asset) => {
    setEditingAsset(asset);
    setDialogOpen(true);
  };

  // Accessories handlers
  const handleAddAccessory = (accessoryData: Omit<Accessory, 'id' | 'index' | 'auditLog' | 'dateCreated' | 'lastUpdated'>) => {
    if (editingAccessory) {
      // Track changes for audit log
      const changes: AuditEntry[] = [];
      
      Object.keys(accessoryData).forEach((key) => {
        const oldValue = editingAccessory[key as keyof Accessory];
        const newValue = accessoryData[key as keyof Omit<Accessory, 'id' | 'index' | 'auditLog' | 'dateCreated' | 'lastUpdated'>];
        
        if (oldValue !== newValue && key !== 'auditLog' && key !== 'attachments') {
          changes.push({
            id: `${Date.now()}-${key}`,
            timestamp: new Date().toISOString(),
            user: CURRENT_USER,
            action: 'updated',
            field: key,
            oldValue: String(oldValue),
            newValue: String(newValue),
            description: `updated ${key}`,
          });
        }
      });

      // Update existing accessory
      setAccessories(
        accessories.map((accessory) =>
          accessory.id === editingAccessory.id
            ? {
                ...accessory,
                ...accessoryData,
                lastUpdated: new Date().toISOString(),
                auditLog: [...accessory.auditLog, ...changes],
              }
            : accessory
        )
      );

      // Add activity log entry
      addActivity(
        `updated accessory \"${accessoryData.assetType}\" (${accessoryData.barcode})`,
        'update',
        changes.map(c => `${c.field}: \"${c.oldValue}\" → \"${c.newValue}\"`).join(', ')
      );

      toast.success('Accessory updated successfully!');
    } else {
      // Add new accessory with initial audit log entry
      const initialAudit: AuditEntry = {
        id: `${Date.now()}-created`,
        timestamp: new Date().toISOString(),
        user: CURRENT_USER,
        action: 'created',
        description: 'created accessory',
      };

      const newAccessory: Accessory = {
        ...accessoryData,
        id: Date.now().toString(),
        index: accessories.length,
        dateCreated: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        auditLog: [initialAudit],
      };
      setAccessories([...accessories, newAccessory]);

      // Add activity log entry
      addActivity(
        `created new accessory \"${accessoryData.assetType}\" (${accessoryData.barcode})`,
        'create',
        `Type: ${accessoryData.assetType}, Quantity: ${accessoryData.quantity}`
      );

      toast.success('Accessory added successfully!');
    }
    setAccessoriesDialogOpen(false);
    setEditingAccessory(undefined);
  };

  const closeAccessoriesDialog = () => {
    setAccessoriesDialogOpen(false);
    setEditingAccessory(undefined);
  };

  const handleAccessoryRowDoubleClick = (accessory: Accessory) => {
    setEditingAccessory(accessory);
    setAccessoriesDialogOpen(true);
  };

  const handleRequestAccessory = (accessory: Accessory) => {
    setRequestingAccessory(accessory);
    setStatusSelectionOpen(true);
  };

  const handleStatusSelection = (status: 'On-Stock' | 'Reserve' | 'Issued' | 'Maintenance' | 'Retired') => {
    setSelectedActionStatus(status);
    setStatusSelectionOpen(false);
    setActionDialogOpen(true);
  };

  const handleSubmitRequest = (data: { borrowerName: string; quantity: number; status: string }) => {
    if (!requestingAccessory) return;

    const requestedQuantity = data.quantity;
    const originalAccessory = requestingAccessory;
    const selectedStatus = data.status;

    const updatedAccessories = accessories.map((acc) =>
      acc.id === originalAccessory.id
        ? {
            ...acc,
            quantity: acc.quantity - requestedQuantity,
            lastUpdated: new Date().toISOString(),
            auditLog: [
              ...(acc.auditLog ?? []),
              {
                id: `${Date.now()}-action`,
                timestamp: new Date().toISOString(),
                user: CURRENT_USER,
                action: 'updated',
                description: `changed to ${selectedStatus} - ${requestedQuantity} item(s) ${data.borrowerName !== 'N/A' ? `for ${data.borrowerName}` : ''}`,
              },
            ],
          }
        : acc
    );

    const statusSuffix = selectedStatus.toUpperCase().replace(/[^A-Z]/g, '');
    const newAccessory: Accessory = {
      id: `${Date.now()}`,
      index: accessories.length,
      assetType: originalAccessory.assetType,
      modelNumber: originalAccessory.modelNumber,
      brandMake: originalAccessory.brandMake,
      barcode: `${originalAccessory.barcode}-${statusSuffix}-${Date.now()}`,
      serialNumber: originalAccessory.serialNumber,
      quantity: requestedQuantity,
      status: selectedStatus as Accessory['status'],
      userName: data.borrowerName,
      location: originalAccessory.location,
      comments: `${selectedStatus} from ${originalAccessory.barcode}`,
      originalId: originalAccessory.id,
      auditLog: [
        {
          id: `${Date.now()}-created`,
          timestamp: new Date().toISOString(),
          user: CURRENT_USER,
          action: 'created',
          description: `${selectedStatus} - ${requestedQuantity} item(s) ${data.borrowerName !== 'N/A' ? `for ${data.borrowerName}` : ''}`,
        },
      ],
      dateCreated: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    setAccessories([...updatedAccessories, newAccessory]);

    addActivity(
      `changed ${requestedQuantity} x ${originalAccessory.assetType} to ${selectedStatus}`,
      'create',
      `Barcode: ${originalAccessory.barcode}, Remaining: ${originalAccessory.quantity - requestedQuantity}`
    );

    toast.success(`Successfully changed ${requestedQuantity} x ${originalAccessory.assetType} to ${selectedStatus}`);
    setActionDialogOpen(false);
    setRequestingAccessory(null);
  };

  const handleReturnAccessory = (issuedAccessory: Accessory) => {
    if (!issuedAccessory.originalId) {
      toast.error('Cannot return: Original accessory not found');
      return;
    }

    const returnedQuantity = issuedAccessory.quantity;

    const updatedAccessories = accessories.map((acc) =>
      acc.id === issuedAccessory.originalId
        ? {
            ...acc,
            quantity: acc.quantity + returnedQuantity,
            lastUpdated: new Date().toISOString(),
            auditLog: [
              ...(acc.auditLog ?? []),
              {
                id: `${Date.now()}-return`,
                timestamp: new Date().toISOString(),
                user: CURRENT_USER,
                action: 'updated',
                description: `returned ${returnedQuantity} item(s) from ${issuedAccessory.userName || 'N/A'}`,
              },
            ],
          }
        : acc
    );

    const finalAccessories = updatedAccessories.filter((acc) => acc.id !== issuedAccessory.id);

    setAccessories(finalAccessories);

    addActivity(
      `returned ${returnedQuantity} x ${issuedAccessory.assetType} from ${issuedAccessory.userName || 'N/A'}`,
      'delete',
      `Barcode: ${issuedAccessory.barcode}`
    );

    toast.success(`Successfully returned ${returnedQuantity} x ${issuedAccessory.assetType}`);
  };

  const handleIssueReserved = (reservedAccessory: Accessory) => {
    const updatedAccessories = accessories.map((acc) =>
      acc.id === reservedAccessory.id
        ? {
            ...acc,
            status: 'Issued' as 'On-Stock' | 'Reserve' | 'Issued' | 'Maintenance' | 'Retired',
            lastUpdated: new Date().toISOString(),
            auditLog: [
              ...(acc.auditLog ?? []),
              {
                id: `${Date.now()}-issue`,
                timestamp: new Date().toISOString(),
                user: CURRENT_USER,
                action: 'updated',
                description: `changed status from Reserved to Issued`,
              },
            ],
          }
        : acc
    );

    setAccessories(updatedAccessories);

    addActivity(
      `issued ${reservedAccessory.quantity} x ${reservedAccessory.assetType}`,
      'update',
      `Barcode: ${reservedAccessory.barcode}, Status changed from Reserved to Issued`
    );

    toast.success(`Successfully issued ${reservedAccessory.quantity} x ${reservedAccessory.assetType}`);
  };

  const handleDeleteClick = (accessory: Accessory) => {
    setDeletingAccessory(accessory);
    setAccessoriesDialogOpen(false);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = (quantityToDelete: number) => {
    if (!deletingAccessory) return;

    if (quantityToDelete >= deletingAccessory.quantity) {
      // Delete the entire record
      const updatedAccessories = accessories.filter((acc) => acc.id !== deletingAccessory.id);
      setAccessories(updatedAccessories);

      addActivity(
        `deleted ${quantityToDelete} x ${deletingAccessory.assetType}`,
        'delete',
        `Barcode: ${deletingAccessory.barcode}, Completely removed from inventory`
      );

      toast.success(`Successfully deleted ${deletingAccessory.assetType}`);
    } else {
      // Reduce the quantity
      const updatedAccessories = accessories.map((acc) =>
        acc.id === deletingAccessory.id
          ? {
              ...acc,
              quantity: acc.quantity - quantityToDelete,
              lastUpdated: new Date().toISOString(),
              auditLog: [
                ...acc.auditLog,
                {
                  id: `${Date.now()}-delete`,
                  timestamp: new Date().toISOString(),
                  user: CURRENT_USER,
                  action: 'updated',
                  description: `deleted ${quantityToDelete} item(s) from inventory`,
                },
              ],
            }
          : acc
      );

      setAccessories(updatedAccessories);

      addActivity(
        `deleted ${quantityToDelete} x ${deletingAccessory.assetType}`,
        'update',
        `Barcode: ${deletingAccessory.barcode}, Remaining: ${deletingAccessory.quantity - quantityToDelete}`
      );

      toast.success(`Successfully deleted ${quantityToDelete} x ${deletingAccessory.assetType}`);
    }

    setDeletingAccessory(null);
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
          'Serial Number': asset.serialNumber,
          'Location/Station': asset.location,
          Status: asset.status,
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
            image: undefined,
            assetType: row['Asset Type'] || '',
            brandMake: '',
            modelNumber: '',
            serialNumber: row['Serial Number'] || '',
            barcode: '',
            description: '',
            status: (row['Status'] as Asset['status']) || 'On-Stock',
            location: row['Location/Station'] || '',
            userName: '',
            createdBy: CURRENT_USER,
            modifiedBy: CURRENT_USER,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            customFields: {},
            auditLog: [],
            attachments: [],
            comments: [],
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
            image: undefined,
            assetType: row['Asset Type'] || '',
            brandMake: '',
            modelNumber: '',
            serialNumber: row['Serial Number'] || '',
            barcode: '',
            description: '',
            status: (row['Status'] as Asset['status']) || 'On-Stock',
            location: row['Location/Station'] || '',
            userName: '',
            createdBy: CURRENT_USER,
            modifiedBy: CURRENT_USER,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            customFields: {},
            auditLog: [],
            attachments: [],
            comments: [],
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
          'Serial Number': asset.serialNumber,
          'Location/Station': asset.location,
          Status: asset.status,
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
    
    if (activeDashboard === 'equipments') {
      const deletedAssets = assets.filter((asset) => selectedIds.includes(asset.id));
      setAssets(assets.filter((asset) => !selectedIds.includes(asset.id)));
      setSelectedRows(new Set());

      // Add activity log entry
      addActivity(
        `bulk deleted ${selectedIds.length} equipment`,
        'delete',
        `Deleted equipment: ${deletedAssets.map(a => a.serialNumber).join(', ')}`
      );

      toast.success(`Deleted ${selectedIds.length} equipment`);
    } else {
      const deletedAccessories = accessories.filter((accessory) => selectedIds.includes(accessory.id));
      setAccessories(accessories.filter((accessory) => !selectedIds.includes(accessory.id)));
      setSelectedRows(new Set());

      // Add activity log entry
      addActivity(
        `bulk deleted ${selectedIds.length} accessories`,
        'delete',
        `Deleted accessories: ${deletedAccessories.map(a => a.barcode).join(', ')}`
      );

      toast.success(`Deleted ${selectedIds.length} accessories`);
    }
  };

  const handleBulkUpdateStatus = (status: string) => {
    const selectedIds = Array.from(selectedRows);
    
    if (activeDashboard === 'equipments') {
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
        `bulk updated status to "${status}" for ${selectedIds.length} equipment`,
        'update',
        `Updated equipment: ${updatedAssets.map(a => a.serialNumber).join(', ')}`
      );

      toast.success(`Updated status for ${selectedIds.length} equipment`);
    } else {
      const updatedAccessories = accessories.filter((accessory) => selectedIds.includes(accessory.id));
      setAccessories(
        accessories.map((accessory) =>
          selectedIds.includes(accessory.id)
            ? {
                ...accessory,
                status: status as Accessory['status'],
                lastUpdated: new Date().toISOString(),
              }
            : accessory
        )
      );

      // Add activity log entry
      addActivity(
        `bulk updated status to "${status}" for ${selectedIds.length} accessories`,
        'update',
        `Updated accessories: ${updatedAccessories.map(a => a.barcode).join(', ')}`
      );

      toast.success(`Updated status for ${selectedIds.length} accessories`);
    }
  };

  const handleBulkUpdateLocation = (location: string) => {
    const selectedIds = Array.from(selectedRows);
    
    if (activeDashboard === 'equipments') {
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
        `bulk updated location to "${location}" for ${selectedIds.length} equipment`,
        'update',
        `Updated equipment: ${updatedAssets.map(a => a.serialNumber).join(', ')}`
      );

      toast.success(`Updated location for ${selectedIds.length} equipment`);
    } else {
      const updatedAccessories = accessories.filter((accessory) => selectedIds.includes(accessory.id));
      setAccessories(
        accessories.map((accessory) =>
          selectedIds.includes(accessory.id)
            ? {
                ...accessory,
                location,
                lastUpdated: new Date().toISOString(),
              }
            : accessory
        )
      );

      // Add activity log entry
      addActivity(
        `bulk updated location to "${location}" for ${selectedIds.length} accessories`,
        'update',
        `Updated accessories: ${updatedAccessories.map(a => a.barcode).join(', ')}`
      );

      toast.success(`Updated location for ${selectedIds.length} accessories`);
    }
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
        assetTypeOptions={assetTypeOptions}
        onAssetTypeOptionsChange={setAssetTypeOptions}
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
                <h1 className="text-gray-900">Asset Inventory</h1>
                <div className="flex gap-2 mt-1">
                  <DashboardDropdown
                    activeDashboard={activeDashboard}
                    onDashboardChange={setActiveDashboard}
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
                onImportExcel={importExcel}
                onImportCSV={importCSV}
                onExportImage={exportAsImage}
                onExportPDF={exportAsPDF}
                onExportExcel={exportAsExcel}
                onExportSelectedExcel={exportSelectedExcel}
                onPrint={handlePrint}
                onCreateBackup={createBackup}
                onRestoreBackup={restoreBackup}
                hasSelection={selectedRows.size > 0}
              />
              <ColumnOptionsMenu
                brandOptions={brandOptions}
                onBrandOptionsChange={setBrandOptions}
                assetTypeOptions={assetTypeOptions}
                onAssetTypeOptionsChange={setAssetTypeOptions}
              />
              <Button 
                onClick={() => activeDashboard === 'equipments' ? setDialogOpen(true) : setAccessoriesDialogOpen(true)} 
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
                    onBulkDelete={handleBulkDelete}
                    onBulkUpdateStatus={handleBulkUpdateStatus}
                    onBulkUpdateLocation={handleBulkUpdateLocation}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
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

        {/* Table */}
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
                      const getCellHighlight = (fieldName: string) => {
                        const isUpdated = updatedCells.has(`${asset.id}-${fieldName}`) && !isSelected && !isHovered;
                        return isUpdated 
                          ? 'border-2 border-yellow-400 rounded px-1 bg-yellow-50'
                          : '';
                      };

                      return (
                        <TableRow
                          key={asset.id}
                          className={`transition-colors hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
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

                          {/* Asset Type */}
                          <TableCell style={{ width: `${columnWidths.assetType || 150}px`, minWidth: `${columnWidths.assetType || 150}px`, maxWidth: `${columnWidths.assetType || 150}px` }}>
                            <div className={getCellHighlight('assetType')}>
                              {asset.assetType}
                            </div>
                          </TableCell>

                          {/* Serial Number */}
                          <TableCell style={{ width: `${columnWidths.serialNumber || 200}px`, minWidth: `${columnWidths.serialNumber || 200}px`, maxWidth: `${columnWidths.serialNumber || 200}px` }}>
                            <div className={getCellHighlight('serialNumber')}>
                              {asset.serialNumber}
                            </div>
                          </TableCell>

                          {/* Location/Station */}
                          <TableCell style={{ width: `${columnWidths.location || 200}px`, minWidth: `${columnWidths.location || 200}px`, maxWidth: `${columnWidths.location || 200}px` }}>
                            <div className={getCellHighlight('location')}>
                              {asset.location}
                            </div>
                          </TableCell>

                          {/* Status */}
                          <TableCell style={{ width: `${columnWidths.status || 120}px`, minWidth: `${columnWidths.status || 120}px`, maxWidth: `${columnWidths.status || 120}px` }}>
                            <div className={`inline-block ${getCellHighlight('status')}`}>
                              <Badge className={`${getStatusColor(asset.status)} text-white`}>{asset.status}</Badge>
                            </div>
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
                                <div className={`${updatedCells.has(`${asset.id}-${column}`) && !isSelected && !isHovered ? 'border-2 border-yellow-400 rounded px-1 bg-yellow-50' : ''}`}>
                                  {asset.customFields?.[column] || '-'}
                                </div>
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
                  accessories={paginatedAccessories}
                  selectedRows={selectedRows}
                  hoveredRow={hoveredRow}
                  setHoveredRow={setHoveredRow}
                  handleCheckboxChange={handleCheckboxChange}
                  handleRowClick={handleRowClick}
                  handleRowDoubleClick={handleAccessoryRowDoubleClick}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  handleSort={handleSort}
                  globalResizeLock={globalResizeLock}
                  handleGlobalLockToggle={handleGlobalLockToggle}
                  columnWidths={columnWidths}
                  onRequestAccessory={handleRequestAccessory}
                  onReturnAccessory={handleReturnAccessory}
                  onIssueReserved={handleIssueReserved}
                />
              )}
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Footer with Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {activeDashboard === 'equipments' ? (
              <>Showing {filteredAssets.length === 0 ? 0 : (currentPage - 1) * (itemsPerPage === 'all' ? filteredAssets.length : itemsPerPage) + 1} to {Math.min(currentPage * (itemsPerPage === 'all' ? filteredAssets.length : itemsPerPage), filteredAssets.length)} of {filteredAssets.length} equipment</>
            ) : (
              <>Showing {filteredAccessories.length === 0 ? 0 : (currentPage - 1) * (itemsPerPage === 'all' ? filteredAccessories.length : itemsPerPage) + 1} to {Math.min(currentPage * (itemsPerPage === 'all' ? filteredAccessories.length : itemsPerPage), filteredAccessories.length)} of {filteredAccessories.length} accessories</>
            )}
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
        assetTypeOptions={assetTypeOptions}
        userOptions={userOptions}
      />

      {/* Add/Edit Accessory Dialog */}
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

      {/* Delete Accessory Dialog */}
      <DeleteAccessoryDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        accessory={deletingAccessory}
        onConfirm={handleDeleteConfirm}
      />

      {/* Status Selection Dialog */}
      <StatusSelectionDialog
        open={statusSelectionOpen}
        onOpenChange={setStatusSelectionOpen}
        onSelectStatus={handleStatusSelection}
      />

      {/* Action Dialog */}
      <ActionDialog
        open={actionDialogOpen}
        onOpenChange={setActionDialogOpen}
        accessory={requestingAccessory}
        selectedStatus={selectedActionStatus}
        onSubmit={handleSubmitRequest}
        userOptions={userOptions}
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
  const [currentPage, setCurrentPage] = useState<'landing' | 'inventory' | 'user-management' | 'reports' | 'monthly-reports' | 'activity-log'>('landing');

  // Assets and Accessories state for Monthly Reports
  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem('assets');
    if (saved) {
      return JSON.parse(saved);
    }
    return initialAssets;
  });

  const [accessories, setAccessories] = useState<Accessory[]>(() => {
    const saved = localStorage.getItem('accessories');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

  // Activities state for Activity Log
  const [activities, setActivities] = useState<ActivityLogEntry[]>(() => {
    const saved = localStorage.getItem('activityLog');
    return saved ? JSON.parse(saved).map((a: ActivityLogEntry) => ({
      ...a,
      timestamp: new Date(a.timestamp)
    })) : [];
  });

  // Users state for User Management
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('users');
    if (saved) {
      return JSON.parse(saved);
    }
    // Default users if none exist
    return [
      {
        id: '1',
        index: 0,
        email: 'admin@company.com',
        name: 'Admin User',
        password: 'admin123',
        status: 'active',
        position: 'SAdmin',
        dateCreated: new Date().toISOString(),
      },
      {
        id: '2',
        index: 1,
        email: 'it@company.com',
        name: 'IT Staff',
        password: 'it123',
        status: 'active',
        position: 'IT/OJT',
        dateCreated: new Date().toISOString(),
      },
    ];
  });

  // Save users to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

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

  // Sync assets, accessories, and activities from localStorage when page is visible
  useEffect(() => {
    const syncData = () => {
      const savedAssets = localStorage.getItem('assets');
      const savedAccessories = localStorage.getItem('accessories');
      const savedActivities = localStorage.getItem('activityLog');
      
      if (savedAssets) {
        setAssets(JSON.parse(savedAssets));
      }
      if (savedAccessories) {
        setAccessories(JSON.parse(savedAccessories));
      }
      if (savedActivities) {
        setActivities(JSON.parse(savedActivities).map((a: ActivityLogEntry) => ({
          ...a,
          timestamp: new Date(a.timestamp)
        })));
      }
    };

    // Initial sync
    syncData();

    // Sync on storage events (when localStorage changes in another tab/window)
    window.addEventListener('storage', syncData);
    
    // Sync periodically to catch changes from the same tab
    const interval = setInterval(syncData, 1000);

    return () => {
      window.removeEventListener('storage', syncData);
      clearInterval(interval);
    };
  }, []);

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

  const handleNavigate = (page: 'landing' | 'inventory' | 'user-management' | 'reports' | 'monthly-reports' | 'activity-log') => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'inventory':
        return (
          <InventoryPage 
            inventoryComponent={<AssetInventory onBackToLanding={() => handleNavigate('landing')} onNavigateToActivityLog={() => handleNavigate('activity-log')} />}
            onBack={() => handleNavigate('landing')}
          />
        );
      case 'user-management':
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
              <div className="px-6 py-4 flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigate('landing')}
                  className="gap-2 hover:bg-gray-100"
                >
                  <ArrowLeft className="h-4 w-4" style={{ color: '#06C755' }} />
                  <span style={{ color: '#06C755' }}>Back to Main</span>
                </Button>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" style={{ color: '#06C755' }} />
                  <h1 className="text-xl text-gray-900">
                    User Management
                  </h1>
                </div>
              </div>
            </div>
            <UserManagementPage users={users} onUsersChange={setUsers} />
          </div>
        );
      case 'reports':
        return <ReportsPage onBack={() => handleNavigate('landing')} />;
      case 'monthly-reports':
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
              <div className="px-6 py-4 flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigate('landing')}
                  className="gap-2 hover:bg-gray-100"
                >
                  <ArrowLeft className="h-4 w-4" style={{ color: '#06C755' }} />
                  <span style={{ color: '#06C755' }}>Back to Main</span>
                </Button>
              </div>
            </div>
            <MonthlyReportsPage assets={assets} accessories={accessories} />
          </div>
        );
      case 'activity-log':
        return <ActivityLogFullPage activities={activities} onBack={() => handleNavigate('landing')} />;
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
