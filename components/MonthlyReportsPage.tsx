import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  FileDown,
  FileText,
  Printer,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Edit,
  Archive,
  Search,
  Filter,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const LINE_GREEN = '#06C755';

// Status colors
const STATUS_COLORS = {
  onStock: '#10b981', // Green
  issued: '#3b82f6', // Blue
  maintenance: '#f97316', // Orange
  retired: '#ef4444', // Red
};

interface AssetCard {
  id: string;
  assetType: string;
  make: string;
  model: string;
  onStock: number;
  issued: number;
  retired: number;
  maintenance: number;
  total: number;
  monthYear: string;
}

interface ArchivedReport {
  id: string;
  monthYear: string;
  lastUpdated: string;
  editedBy?: string;
  cards: AssetCard[];
  notes: string;
}

// Generated from real inventory data when available

interface MonthlyReportsPageProps {
  assets?: any[]; // Real inventory assets
  accessories?: any[]; // Real accessories
}

export function MonthlyReportsPage({ assets = [], accessories = [] }: MonthlyReportsPageProps) {
  const currentMonthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Generate asset cards from real inventory data
  const generateCardsFromInventory = (monthYear: string): AssetCard[] => {
    const assetsByType = new Map<string, { make: string; model: string; onStock: number; issued: number; retired: number; maintenance: number }>();
    
    // Process equipment assets
    assets.forEach((asset) => {
      const key = `${asset.assetType}-${asset.brandMake}-${asset.modelNumber}`;
      if (!assetsByType.has(key)) {
        assetsByType.set(key, {
          make: asset.brandMake || 'N/A',
          model: asset.modelNumber || 'N/A',
          onStock: 0,
          issued: 0,
          retired: 0,
          maintenance: 0,
        });
      }
      
      const data = assetsByType.get(key)!;
      if (asset.status === 'On-Stock') data.onStock++;
      else if (asset.status === 'Issued') data.issued++;
      else if (asset.status === 'Retired') data.retired++;
      else if (asset.status === 'Under Maintenance') data.maintenance++;
    });
    
    // Process accessories
    accessories.forEach((accessory) => {
      const key = `${accessory.assetType}-${accessory.brandMake}-${accessory.modelNumber}`;
      if (!assetsByType.has(key)) {
        assetsByType.set(key, {
          make: accessory.brandMake || 'N/A',
          model: accessory.modelNumber || 'N/A',
          onStock: 0,
          issued: 0,
          retired: 0,
          maintenance: 0,
        });
      }
      
      const data = assetsByType.get(key)!;
      const quantity = accessory.quantity || 0;
      if (accessory.status === 'On-Stock') data.onStock += quantity;
      else if (accessory.status === 'Issued') data.issued += quantity;
      else if (accessory.status === 'Retired') data.retired += quantity;
      else if (accessory.status === 'Under Maintenance') data.maintenance += quantity;
    });
    
    // Convert to AssetCard array
    const cards: AssetCard[] = [];
    let index = 0;
    assetsByType.forEach((data, key) => {
      const [assetType, make, model] = key.split('-');
      cards.push({
        id: `card-${index}`,
        assetType,
        make,
        model,
        onStock: data.onStock,
        issued: data.issued,
        retired: data.retired,
        maintenance: data.maintenance,
        total: data.onStock + data.issued + data.retired + data.maintenance,
        monthYear,
      });
      index++;
    });
    
    return cards.sort((a, b) => a.assetType.localeCompare(b.assetType));
  };
  
  const [assetCards, setAssetCards] = useState<AssetCard[]>(() => generateCardsFromInventory(currentMonthYear));
  const [archivedReports, setArchivedReports] = useState<ArchivedReport[]>([]);
  const [selectedMonthYear, setSelectedMonthYear] = useState(currentMonthYear);
  const [reportType, setReportType] = useState<'monthly' | 'quarterly' | 'yearly' | 'custom'>('monthly');
  const [customDateRange, setCustomDateRange] = useState({ from: '', to: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [notes, setNotes] = useState('');
  const [viewMode, setViewMode] = useState<'current' | 'archive'>('current');
  const [editingArchive, setEditingArchive] = useState<ArchivedReport | null>(null);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Calculate global summary
  const globalSummary = {
    totalAssetTypes: assetCards.length,
    totalOnStock: assetCards.reduce((sum, card) => sum + card.onStock, 0),
    totalIssued: assetCards.reduce((sum, card) => sum + card.issued, 0),
    totalMaintenance: assetCards.reduce((sum, card) => sum + card.maintenance, 0),
    totalRetired: assetCards.reduce((sum, card) => sum + card.retired, 0),
    totalAssetsOverall: assetCards.reduce((sum, card) => sum + card.total, 0),
  };

  // Filter cards
  const filteredCards = assetCards.filter((card) => {
    const matchesSearch =
      card.assetType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.model.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || card.assetType === typeFilter;
    const matchesBrand = brandFilter === 'all' || card.make === brandFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'onStock') matchesStatus = card.onStock > 0;
    if (statusFilter === 'issued') matchesStatus = card.issued > 0;
    if (statusFilter === 'maintenance') matchesStatus = card.maintenance > 0;
    if (statusFilter === 'retired') matchesStatus = card.retired > 0;

    return matchesSearch && matchesType && matchesBrand && matchesStatus;
  });

  // Get unique values for filters
  const assetTypes = Array.from(new Set(assetCards.map((c) => c.assetType))).filter(t => t && t.trim() !== '');
  const brands = Array.from(new Set(assetCards.map((c) => c.make))).filter(b => b && b.trim() !== '');

  // Chart data
  const barChartData = filteredCards.map((card) => ({
    name: card.assetType,
    'On-Stock': card.onStock,
    Issued: card.issued,
    Maintenance: card.maintenance,
    Retired: card.retired,
  }));

  const pieChartData = [
    { name: 'On-Stock', value: globalSummary.totalOnStock, color: STATUS_COLORS.onStock },
    { name: 'Issued', value: globalSummary.totalIssued, color: STATUS_COLORS.issued },
    { name: 'Maintenance', value: globalSummary.totalMaintenance, color: STATUS_COLORS.maintenance },
    { name: 'Retired', value: globalSummary.totalRetired, color: STATUS_COLORS.retired },
  ];

  // Trend data (no hardcoded/mock values) — derive from archived reports or leave empty
  const trendData: { month: string; onStock: number; issued: number; maintenance: number; retired: number }[] = [];

  // Export functions
  const exportToCSV = (data: AssetCard[], filename: string) => {
    const headers = ['Asset Type', 'Make/Brand', 'Model', 'On-Stock', 'Issued', 'Retired', 'Maintenance', 'Total'];
    const rows = data.map((card) => [
      card.assetType,
      card.make,
      card.model,
      card.onStock,
      card.issued,
      card.retired,
      card.maintenance,
      card.total,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    downloadFile(csvContent, `${filename}.csv`, 'text/csv');
    toast.success('Exported to CSV successfully');
  };

  const exportToJSON = (data: AssetCard[], filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, `${filename}.json`, 'application/json');
    toast.success('Exported to JSON successfully');
  };

  const exportToExcel = (data: AssetCard[], filename: string) => {
    // Mock Excel export (in real app, use library like xlsx)
    const csvContent = [
      ['Asset Type', 'Make/Brand', 'Model', 'On-Stock', 'Issued', 'Retired', 'Maintenance', 'Total'],
      ...data.map((card) => [
        card.assetType,
        card.make,
        card.model,
        card.onStock,
        card.issued,
        card.retired,
        card.maintenance,
        card.total,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');
    downloadFile(csvContent, `${filename}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    toast.success('Exported to Excel successfully');
  };

  const printCard = (cardId: string) => {
    const cardElement = cardRefs.current[cardId];
    if (!cardElement) {
      toast.error('Unable to print card');
      return;
    }

    const card = filteredCards.find(c => c.id === cardId);
    if (!card) {
      toast.error('Card not found');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print');
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Asset Card - ${card.assetType}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              background: white;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              padding: 30px;
            }
            .header {
              border-bottom: 3px solid ${LINE_GREEN};
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              color: #111827;
              margin-bottom: 10px;
            }
            .subtitle {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 5px;
            }
            .value {
              font-size: 16px;
              color: #111827;
              margin-bottom: 20px;
            }
            .stats {
              margin-top: 20px;
              border-top: 1px solid #e5e7eb;
              padding-top: 20px;
            }
            .stat-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 12px 0;
              border-bottom: 1px solid #f3f4f6;
            }
            .stat-label {
              font-size: 14px;
              color: #6b7280;
            }
            .stat-value {
              padding: 6px 12px;
              border-radius: 4px;
              color: white;
              font-weight: bold;
              min-width: 50px;
              text-align: center;
            }
            .total-row {
              border-top: 2px solid #e5e7eb;
              margin-top: 10px;
              padding-top: 15px;
              font-size: 16px;
            }
            .total-value {
              background-color: ${LINE_GREEN};
              padding: 8px 16px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #9ca3af;
              font-size: 12px;
            }
            @media print {
              body { padding: 20px; }
              .container { border: 1px solid #e5e7eb; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="title">${card.assetType}</div>
            </div>
            
            <div class="subtitle">Make/Brand</div>
            <div class="value">${card.make}</div>
            
            <div class="subtitle">Model</div>
            <div class="value">${card.model}</div>
            
            <div class="stats">
              <div class="stat-row">
                <span class="stat-label">On-Stock</span>
                <span class="stat-value" style="background-color: ${STATUS_COLORS.onStock}">${card.onStock}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Issued</span>
                <span class="stat-value" style="background-color: ${STATUS_COLORS.issued}">${card.issued}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Under Maintenance</span>
                <span class="stat-value" style="background-color: ${STATUS_COLORS.maintenance}">${card.maintenance}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Retired</span>
                <span class="stat-value" style="background-color: ${STATUS_COLORS.retired}">${card.retired}</span>
              </div>
              <div class="stat-row total-row">
                <span class="stat-label" style="font-weight: bold; color: #111827;">Total</span>
                <span class="stat-value total-value">${card.total}</span>
              </div>
            </div>
            
            <div class="footer">
              DIPH Monthly Inventory Summary Report - ${currentMonthYear}
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 250);
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const openArchiveForEdit = (report: ArchivedReport) => {
    setEditingArchive(report);
    setArchiveDialogOpen(true);
  };

  const saveArchivedReport = () => {
    if (!editingArchive) return;

    setArchivedReports(
      archivedReports.map((report) =>
        report.id === editingArchive.id
          ? { ...editingArchive, lastUpdated: new Date().toISOString(), editedBy: 'Current User' }
          : report
      )
    );
    setArchiveDialogOpen(false);
    toast.success('Archived report updated successfully');
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  // Archive current report to backend
  const archiveCurrentReport = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/monthly-report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Report archived successfully for ${selectedMonthYear}`);
        // Refresh archived reports list
        loadArchivedReports();
      } else {
        const error = await response.json();
        toast.error(`Failed to archive report: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error archiving report:', error);
      toast.error('Failed to archive report');
    } finally {
      setLoading(false);
    }
  };

  // Load archived reports from backend
  const loadArchivedReports = async () => {
    try {
      const response = await fetch('http://localhost:4000/monthly-report');
      if (response.ok) {
        const reports = await response.json();
        // Map backend reports to frontend format
        const mappedReports: ArchivedReport[] = reports.map((report: any) => ({
          id: String(report.id),
          monthYear: new Date(report.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          lastUpdated: report.updatedAt || report.createdAt,
          editedBy: 'System',
          cards: [], // Backend doesn't store individual cards, only summary
          notes: '',
        }));
        setArchivedReports(mappedReports);
      }
    } catch (error) {
      console.error('Error loading archived reports:', error);
    }
  };

  // Load archived reports on mount when viewing archive
  useState(() => {
    if (viewMode === 'archive') {
      loadArchivedReports();
    }
  });

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl text-gray-900">
              DIPH Monthly Inventory Summary Report
            </h1>
            <p className="text-xl mt-2 text-gray-600" style={{ color: LINE_GREEN }}>
              for {selectedMonthYear}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'current' ? 'default' : 'outline'}
              onClick={() => setViewMode('current')}
              style={viewMode === 'current' ? { backgroundColor: LINE_GREEN } : {}}
              className={viewMode === 'current' ? 'text-white' : ''}
            >
              Current Report
            </Button>
            <Button
              variant={viewMode === 'archive' ? 'default' : 'outline'}
              onClick={() => {
                setViewMode('archive');
                loadArchivedReports();
              }}
              style={viewMode === 'archive' ? { backgroundColor: LINE_GREEN } : {}}
              className={viewMode === 'archive' ? 'text-white' : ''}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
            {viewMode === 'current' && (
              <Button
                onClick={archiveCurrentReport}
                disabled={loading}
                style={{ backgroundColor: LINE_GREEN }}
                className="text-white"
              >
                <Archive className="h-4 w-4 mr-2" />
                {loading ? 'Archiving...' : 'Archive Current Report'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {viewMode === 'current' ? (
        <>
          {/* Global Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">
                  Total Asset Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl" style={{ color: LINE_GREEN }}>
                  {globalSummary.totalAssetTypes}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">
                  Total On-Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl" style={{ color: STATUS_COLORS.onStock }}>
                  {globalSummary.totalOnStock}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">
                  Total Issued
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl" style={{ color: STATUS_COLORS.issued }}>
                  {globalSummary.totalIssued}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">
                  Under Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl" style={{ color: STATUS_COLORS.maintenance }}>
                  {globalSummary.totalMaintenance}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">
                  Total Retired
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl" style={{ color: STATUS_COLORS.retired }}>
                  {globalSummary.totalRetired}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">
                  Total Assets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl" style={{ color: LINE_GREEN }}>
                  {globalSummary.totalAssetsOverall}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Asset Distribution by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="On-Stock" fill={STATUS_COLORS.onStock} />
                    <Bar dataKey="Issued" fill={STATUS_COLORS.issued} />
                    <Bar dataKey="Maintenance" fill={STATUS_COLORS.maintenance} />
                    <Bar dataKey="Retired" fill={STATUS_COLORS.retired} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Overall Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tracker Section - Month-to-Month Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Asset Trends (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="onStock" stroke={STATUS_COLORS.onStock} name="On-Stock" />
                  <Line type="monotone" dataKey="issued" stroke={STATUS_COLORS.issued} name="Issued" />
                  <Line type="monotone" dataKey="maintenance" stroke={STATUS_COLORS.maintenance} name="Maintenance" />
                  <Line type="monotone" dataKey="retired" stroke={STATUS_COLORS.retired} name="Retired" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Filters & Search */}
          <Card>
            <CardHeader>
              <CardTitle>Filters & Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search assets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-8`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Asset Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {assetTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Select value={brandFilter} onValueChange={setBrandFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Brands</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="onStock">On-Stock</SelectItem>
                      <SelectItem value="issued">Issued</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || brandFilter !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                    setBrandFilter('all');
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Export Full Report */}
          <Card>
            <CardHeader>
              <CardTitle>Export Full Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => exportToCSV(filteredCards, `DIPH_Report_${selectedMonthYear.replace(' ', '_')}`)}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => exportToJSON(filteredCards, `DIPH_Report_${selectedMonthYear.replace(' ', '_')}`)}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
                <Button
                  variant="outline"
                  onClick={() => exportToExcel(filteredCards, `DIPH_Report_${selectedMonthYear.replace(' ', '_')}`)}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
                <Button variant="outline" onClick={() => toast.info('PDF export coming soon')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Asset Cards */}
          <div className="space-y-4">
            <h2 className="text-2xl text-gray-900">
              Asset Cards ({filteredCards.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCards.map((card) => (
                <Card key={card.id}>
                  <div ref={(el) => (cardRefs.current[card.id] = el)}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{card.assetType}</CardTitle>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => printCard(card.id)}
                            title="Print Card"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => exportToCSV([card], `${card.assetType}_${card.model}`)}
                            title="Export CSV"
                          >
                            <FileDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className={`text-sm text-gray-600`}>Make/Brand</p>
                        <p className={`text-gray-900`}>{card.make}</p>
                      </div>
                      <div>
                        <p className={`text-sm text-gray-600`}>Model</p>
                        <p className={`text-gray-900`}>{card.model}</p>
                      </div>
                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className={`text-sm text-gray-600`}>On-Stock:</span>
                          <span className="px-2 py-1 rounded text-white text-sm" style={{ backgroundColor: STATUS_COLORS.onStock }}>
                            {card.onStock}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-sm text-gray-600`}>Issued:</span>
                          <span className="px-2 py-1 rounded text-white text-sm" style={{ backgroundColor: STATUS_COLORS.issued }}>
                            {card.issued}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-sm text-gray-600`}>Maintenance:</span>
                          <span className="px-2 py-1 rounded text-white text-sm" style={{ backgroundColor: STATUS_COLORS.maintenance }}>
                            {card.maintenance}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={`text-sm text-gray-600`}>Retired:</span>
                          <span className="px-2 py-1 rounded text-white text-sm" style={{ backgroundColor: STATUS_COLORS.retired }}>
                            {card.retired}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className={`text-gray-900`}>Total:</span>
                          <span className="px-3 py-1 rounded text-white" style={{ backgroundColor: LINE_GREEN }}>
                            {card.total}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Notes / Remarks */}
          <Card>
            <CardHeader>
              <CardTitle>Notes & Remarks</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add notes for this monthly report (issues, incidents, explanations for major changes, internal comments)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className=""
              />
              <Button className="mt-2" style={{ backgroundColor: LINE_GREEN }} onClick={() => toast.success('Notes saved')}>
                Save Notes
              </Button>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Archive Section */
        <Card>
          <CardHeader>
            <CardTitle>Archived Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month/Year</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Edited By</TableHead>
                  <TableHead>Total Assets</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archivedReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className={`text-gray-900`}>{report.monthYear}</TableCell>
                    <TableCell className={`text-gray-600`}>
                      {new Date(report.lastUpdated).toLocaleDateString()}
                    </TableCell>
                    <TableCell className={`text-gray-600`}>
                      {report.editedBy || 'System'}
                    </TableCell>
                    <TableCell className={`text-gray-900`}>
                      {report.cards.reduce((sum, card) => sum + card.total, 0)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openArchiveForEdit(report)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Modify
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportToCSV(report.cards, `Archive_${report.monthYear.replace(' ', '_')}`)}
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit Archive Dialog */}
      <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Archived Report - {editingArchive?.monthYear}</DialogTitle>
            <DialogDescription>
              Modify the archived report data below. Changes will be tracked.
            </DialogDescription>
          </DialogHeader>
          {editingArchive && (
            <div className="space-y-4">
              <div>
                <Label>Report Notes</Label>
                <Textarea
                  value={editingArchive.notes}
                  onChange={(e) =>
                    setEditingArchive({ ...editingArchive, notes: e.target.value })
                  }
                  rows={3}
                  className=""
                />
              </div>
              <div className="space-y-2">
                <Label>Asset Cards</Label>
                {editingArchive.cards.map((card, index) => (
                  <div key={card.id} className="p-3 border rounded space-y-2">
                    <p className={`text-gray-900`}>{card.assetType} - {card.make} {card.model}</p>
                    <div className="grid grid-cols-5 gap-2">
                      <div>
                        <Label className="text-xs">On-Stock</Label>
                        <Input
                          type="number"
                          value={card.onStock}
                          onChange={(e) => {
                            const newCards = [...editingArchive.cards];
                            newCards[index].onStock = parseInt(e.target.value) || 0;
                            newCards[index].total = newCards[index].onStock + newCards[index].issued + newCards[index].maintenance + newCards[index].retired;
                            setEditingArchive({ ...editingArchive, cards: newCards });
                          }}
                          className=""
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Issued</Label>
                        <Input
                          type="number"
                          value={card.issued}
                          onChange={(e) => {
                            const newCards = [...editingArchive.cards];
                            newCards[index].issued = parseInt(e.target.value) || 0;
                            newCards[index].total = newCards[index].onStock + newCards[index].issued + newCards[index].maintenance + newCards[index].retired;
                            setEditingArchive({ ...editingArchive, cards: newCards });
                          }}
                          className=""
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Maintenance</Label>
                        <Input
                          type="number"
                          value={card.maintenance}
                          onChange={(e) => {
                            const newCards = [...editingArchive.cards];
                            newCards[index].maintenance = parseInt(e.target.value) || 0;
                            newCards[index].total = newCards[index].onStock + newCards[index].issued + newCards[index].maintenance + newCards[index].retired;
                            setEditingArchive({ ...editingArchive, cards: newCards });
                          }}
                          className=""
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Retired</Label>
                        <Input
                          type="number"
                          value={card.retired}
                          onChange={(e) => {
                            const newCards = [...editingArchive.cards];
                            newCards[index].retired = parseInt(e.target.value) || 0;
                            newCards[index].total = newCards[index].onStock + newCards[index].issued + newCards[index].maintenance + newCards[index].retired;
                            setEditingArchive({ ...editingArchive, cards: newCards });
                          }}
                          className=""
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Total</Label>
                        <Input
                          type="number"
                          value={card.total}
                          disabled
                          className=""
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveArchivedReport} style={{ backgroundColor: LINE_GREEN }} className="text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}