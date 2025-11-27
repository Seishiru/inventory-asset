import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AlertTriangle } from 'lucide-react';
import { Accessory } from './AccessoriesDialog';

const LINE_GREEN = '#06C755';

interface DeleteAccessoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accessory: Accessory | null;
  onConfirm: (quantityToDelete: number) => void;
}

export function DeleteAccessoryDialog({
  open,
  onOpenChange,
  accessory,
  onConfirm,
}: DeleteAccessoryDialogProps) {
  const [quantityToDelete, setQuantityToDelete] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setQuantityToDelete(1);
      setError('');
    }
  }, [open]);

  const handleConfirm = () => {
    if (!accessory) return;

    if (quantityToDelete <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    if (quantityToDelete > accessory.quantity) {
      setError(`Cannot delete more than ${accessory.quantity} items`);
      return;
    }

    onConfirm(quantityToDelete);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Accessory
          </DialogTitle>
          <DialogDescription>
            This action will permanently delete the specified quantity of this accessory.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> This action cannot be undone. The deleted items will be permanently removed from the inventory.
            </p>
          </div>

          {accessory && (
            <>
              <div className="space-y-2">
                <Label className="text-gray-700">Accessory Type</Label>
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
                  {accessory.assetType}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">Barcode</Label>
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
                  {accessory.barcode || 'N/A'}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">Available Quantity</Label>
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
                  {accessory.quantity}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantityToDelete" className="text-gray-700">
                  Quantity to Delete <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quantityToDelete"
                  type="number"
                  min="1"
                  max={accessory.quantity}
                  value={quantityToDelete}
                  onChange={(e) => {
                    setQuantityToDelete(parseInt(e.target.value) || 0);
                    setError('');
                  }}
                  placeholder="Enter quantity to delete"
                  className="border-gray-300"
                  required
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Confirm Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}