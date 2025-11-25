import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Upload } from 'lucide-react';

interface ImportMenuProps {
  onImportExcel: (file: File) => void;
  onImportCSV: (file: File) => void;
}

export function ImportMenu({ onImportExcel, onImportCSV }: ImportMenuProps) {
  const handleFileInput = (accept: string, callback: (file: File) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        callback(file);
      }
    };
    input.click();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleFileInput('.xlsx,.xls', onImportExcel)}>
          Import from Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleFileInput('.csv', onImportCSV)}>
          Import from CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
