import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';

const LINE_GREEN = '#06C755';

interface ColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newColumnName: string;
  onNewColumnNameChange: (name: string) => void;
  onAddColumn: () => void;
}

export default function ColumnDialog({
  open,
  onOpenChange,
  newColumnName,
  onNewColumnNameChange,
  onAddColumn
}: ColumnDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            onChange={(e) => onNewColumnNameChange(e.target.value)}
            placeholder="e.g., Department, Cost Center"
            className="mt-2"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onAddColumn} style={{ backgroundColor: LINE_GREEN }} className="text-white hover:opacity-90">
            Add Column
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}