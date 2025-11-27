import { useState } from 'react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import { Download, Upload, Database, ChevronDown } from 'lucide-react';

interface ToolbarActionsMenuProps {
  onImportExcel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImportCSV: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportImage: () => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
  onExportSelectedExcel?: () => void;
  onPrint: () => void;
  onCreateBackup: () => void;
  onRestoreBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasSelection?: boolean;
}

export function ToolbarActionsMenu({
  onImportExcel,
  onImportCSV,
  onExportImage,
  onExportPDF,
  onExportExcel,
  onExportSelectedExcel,
  onPrint,
  onCreateBackup,
  onRestoreBackup,
  hasSelection = false,
}: ToolbarActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Database className="h-4 w-4" />
          Actions
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Import Section */}
        <DropdownMenuLabel className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Import
        </DropdownMenuLabel>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <label className="cursor-pointer w-full">
            Excel (.xlsx)
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => {
                onImportExcel(e);
                setIsOpen(false);
              }}
              className="hidden"
            />
          </label>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <label className="cursor-pointer w-full">
            CSV (.csv)
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                onImportCSV(e);
                setIsOpen(false);
              }}
              className="hidden"
            />
          </label>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Export Section */}
        <DropdownMenuLabel className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={onExportImage}>
          Export as Image
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportPDF}>
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportExcel}>
          Export as Excel
        </DropdownMenuItem>
        {hasSelection && onExportSelectedExcel && (
          <DropdownMenuItem onClick={onExportSelectedExcel}>
            Export Selected (Excel)
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onPrint}>
          Print
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Backup Section */}
        <DropdownMenuLabel className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Backup
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={onCreateBackup}>
          Create Backup
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <label className="cursor-pointer w-full">
            Restore Backup
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                onRestoreBackup(e);
                setIsOpen(false);
              }}
              className="hidden"
            />
          </label>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
