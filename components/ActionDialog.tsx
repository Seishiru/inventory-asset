import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const LINE_GREEN = '#06C755';

interface ActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accessory: {
    id: string;
    assetType: string;
    barcode?: string;
    quantity: number;
    originalId?: string;
  } | null;
  selectedStatus: 'On-Stock' | 'Reserve' | 'Issued' | 'Maintenance' | 'Retired';
  onSubmit: (data: { borrowerName: string; quantity: number; status: string }) => void;
  userOptions: string[];
}

export function ActionDialog({
  open,
  onOpenChange,
  accessory,
  selectedStatus,
  onSubmit,
  userOptions,
}: ActionDialogProps) {
  const [borrowerName, setBorrowerName] = useState('N/A');
  const [quantity, setQuantity] = useState('1');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setBorrowerName('N/A');
      setQuantity('1');
      setError('');
    }
  }, [open]);

  const handleSubmit = () => {
    const qty = parseInt(quantity);
    
    if (!qty || qty <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    if (accessory && qty > accessory.quantity) {
      setError(`Only ${accessory.quantity} available in stock`);
      return;
    }

    onSubmit({
      borrowerName: borrowerName.trim() || 'N/A',
      quantity: qty,
      status: selectedStatus,
    });

    onOpenChange(false);
  };

  const showBorrowerField = selectedStatus === 'Reserve' || selectedStatus === 'Issued';

  const getActionVerb = () => {
    switch (selectedStatus) {
      case 'On-Stock':
        return 'Stock';
      case 'Reserve':
        return 'Reserve';
      case 'Issued':
        return 'Issue';
      case 'Maintenance':
        return 'Maintain';
      case 'Retired':
        return 'Retire';
      default:
        return 'Process';
    }
  };

  const getDialogTitle = () => {
    switch (selectedStatus) {
      case 'On-Stock':
        return 'Return to Stock';
      case 'Reserve':
        return 'Reserve Accessory';
      case 'Issued':
        return 'Issue Accessory';
      case 'Maintenance':
        return 'Send to Maintenance';
      case 'Retired':
        return 'Retire Accessory';
      default:
        return 'Process Accessory';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle style={{ color: LINE_GREEN }}>
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription>
            {selectedStatus === 'On-Stock' ? 'Return the accessory to the stock.' : `Perform the ${getActionVerb().toLowerCase()} action on the accessory.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-gray-700">Accessory Type</Label>
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
              {accessory?.assetType || 'N/A'}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">Barcode</Label>
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
              {accessory?.barcode || 'N/A'}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">Available Quantity</Label>
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
              {accessory?.quantity || 0}
            </div>
          </div>

          {showBorrowerField && (
            <div className="space-y-2">
              <Label htmlFor="borrowerName" className="text-gray-700">
                {selectedStatus === 'Reserve' ? 'Reserved For' : 'Issued To'}
              </Label>
              <Select
                value={borrowerName}
                onValueChange={(value) => setBorrowerName(value)}
              >
                <SelectTrigger
                  id="borrowerName"
                  className="border-gray-300"
                >
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {userOptions.map((user) => (
                    <SelectItem key={user} value={user}>
                      {user}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-gray-700">
              Quantity to {getActionVerb()} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={accessory?.quantity || 1}
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setError('');
              }}
              placeholder="Enter quantity"
              className="border-gray-300"
              required
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            style={{ backgroundColor: LINE_GREEN }}
            className="text-white hover:opacity-90"
          >
            Confirm {getActionVerb()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}