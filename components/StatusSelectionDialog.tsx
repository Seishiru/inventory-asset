import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Package, Clock, Send, Wrench, Archive } from 'lucide-react';

const LINE_GREEN = '#06C755';

interface StatusSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectStatus: (status: 'On-Stock' | 'Reserve' | 'Issued' | 'Maintenance' | 'Retired') => void;
}

export function StatusSelectionDialog({ open, onOpenChange, onSelectStatus }: StatusSelectionDialogProps) {
  const statusOptions = [
    { value: 'On-Stock', label: 'On-Stock', icon: Package, color: 'bg-green-500' },
    { value: 'Reserve', label: 'Reserved', icon: Clock, color: 'bg-blue-500' },
    { value: 'Issued', label: 'Issued', icon: Send, color: 'bg-purple-500' },
    { value: 'Maintenance', label: 'Maintenance', icon: Wrench, color: 'bg-yellow-500' },
    { value: 'Retired', label: 'Retired', icon: Archive, color: 'bg-gray-500' },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Action Status</DialogTitle>
          <DialogDescription>Choose the status for the item.</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          {statusOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.value}
                variant="outline"
                className="w-full justify-start h-auto py-4 px-4 hover:bg-green-50 hover:border-green-300"
                onClick={() => onSelectStatus(option.value)}
              >
                <div className="flex items-center gap-3">
                  <div className={`${option.color} p-2 rounded-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-base">{option.label}</span>
                </div>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}