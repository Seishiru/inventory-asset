import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Archive, Download, Upload } from 'lucide-react';

interface BackupMenuProps {
  onCreateBackup: () => void;
  onRestoreBackup: (file: File) => void;
}

export function BackupMenu({ onCreateBackup, onRestoreBackup }: BackupMenuProps) {
  const handleRestore = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onRestoreBackup(file);
      }
    };
    input.click();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline"
          style={{ borderColor: '#06C755', color: '#06C755' }}
          className="hover:bg-green-50"
        >
          <Archive className="h-4 w-4 mr-2" />
          Backup
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onCreateBackup}>
          <Download className="h-4 w-4 mr-2" />
          Create Backup
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleRestore}>
          <Upload className="h-4 w-4 mr-2" />
          Restore Backup
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
