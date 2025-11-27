import { useState } from 'react';
import { Button } from './ui/button';
import { Download, Upload, Database, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './ui/dropdown-menu';

const LINE_GREEN = '#06C755';

interface ImportExportBackupMenuProps {
  onImportExcel: (file: File) => void;
  onImportCSV: (file: File) => void;
  onExportImage: () => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
  onExportSelectedExcel: () => void;
  onPrint: () => void;
  onCreateBackup: () => void;
  onRestoreBackup: (file: File) => void;
  hasSelection: boolean;
}

export function ImportExportBackupMenu({
  onImportExcel,
  onImportCSV,
  onExportImage,
  onExportPDF,
  onExportExcel,
  onExportSelectedExcel,
  onPrint,
  onCreateBackup,
  onRestoreBackup,
  hasSelection,
}: ImportExportBackupMenuProps) {
  const [importSubMenuOpen, setImportSubMenuOpen] = useState(false);
  const [exportSubMenuOpen, setExportSubMenuOpen] = useState(false);
  const [backupSubMenuOpen, setBackupSubMenuOpen] = useState(false);

  const handleImportExcel = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) onImportExcel(file);
    };
    input.click();
  };

  const handleImportCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) onImportCSV(file);
    };
    input.click();
  };

  const handleRestoreBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) onRestoreBackup(file);
    };
    input.click();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 hover:bg-green-50 hover:border-green-300"
        >
          <Database className="h-4 w-4" style={{ color: LINE_GREEN }} />
          Import / Export / Backup
          <ChevronDown className="h-4 w-4" style={{ color: LINE_GREEN }} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Import Section */}
        <DropdownMenuLabel className="flex items-center gap-2">
          <Upload className="h-4 w-4" style={{ color: LINE_GREEN }} />
          Import
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={handleImportExcel} className="cursor-pointer">
          Import from Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleImportCSV} className="cursor-pointer">
          Import from CSV
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Export Section */}
        <DropdownMenuLabel className="flex items-center gap-2">
          <Download className="h-4 w-4" style={{ color: LINE_GREEN }} />
          Export
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={onExportExcel} className="cursor-pointer">
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportPDF} className="cursor-pointer">
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportImage} className="cursor-pointer">
          Export as Image
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onPrint} className="cursor-pointer">
          Print
        </DropdownMenuItem>
        {hasSelection && (
          <DropdownMenuItem onClick={onExportSelectedExcel} className="cursor-pointer">
            Export Selected
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Backup Section */}
        <DropdownMenuLabel className="flex items-center gap-2">
          <Database className="h-4 w-4" style={{ color: LINE_GREEN }} />
          Backup
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={onCreateBackup} className="cursor-pointer">
          Create Backup
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleRestoreBackup} className="cursor-pointer">
          Restore Backup
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
