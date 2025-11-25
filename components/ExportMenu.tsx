import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Download, FileImage, FileText, FileSpreadsheet, Printer } from 'lucide-react';

interface ExportMenuProps {
  onExportImage: () => void;
  onExportPDF: () => void;
  onExportExcel: () => void;
  onExportSelectedExcel?: () => void;
  onPrint: () => void;
  hasSelection?: boolean;
}

export function ExportMenu({ 
  onExportImage, 
  onExportPDF, 
  onExportExcel, 
  onExportSelectedExcel,
  onPrint,
  hasSelection = false 
}: ExportMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline"
          style={{ borderColor: '#06C755', color: '#06C755' }}
          className="hover:bg-green-50"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onExportImage}>
          <FileImage className="h-4 w-4 mr-2" />
          Export as Image
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportExcel}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
        {hasSelection && onExportSelectedExcel && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onExportSelectedExcel}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Selected Only
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onPrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print View
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
