import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { AuditLog, AuditEntry } from './AuditLog';
import { Upload, X, File } from 'lucide-react';
import { toast } from 'sonner';

const LINE_GREEN = '#06C755';

export interface Accessory {
  id: string;
  index: number;
  assetType: string;
  modelNumber?: string;
  brandMake?: string;
  barcode?: string;
  serialNumber?: string;
  quantity: number;
  status: 'On-Stock' | 'Reserve' | 'Issued' | 'Maintenance' | 'Retired';
  userName?: string;
  location?: string;
  attachments?: { name: string; url: string; uploadedAt: string }[];
  comments?: string;
  auditLog: AuditEntry[];
  dateCreated: string;
  lastUpdated: string;
  originalId?: string; // For tracking which stock accessory this issued item came from
}

interface AccessoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accessory?: Accessory;
  onSave: (accessory: Omit<Accessory, 'id' | 'index' | 'auditLog' | 'dateCreated' | 'lastUpdated'>) => void;
  onDeleteClick?: (accessory: Accessory) => void;
  assetTypeOptions: string[];
  brandOptions: string[];
  userOptions: string[];
}

export function AccessoriesDialog({
  open,
  onOpenChange,
  accessory,
  onSave,
  onDeleteClick,
  assetTypeOptions,
  brandOptions,
  userOptions,
}: AccessoriesDialogProps) {
  const [formData, setFormData] = useState({
    assetType: '',
    modelNumber: '',
    brandMake: '',
    barcode: '',
    serialNumber: '',
    quantity: 1,
    status: 'On-Stock' as 'On-Stock' | 'Reserve' | 'Issued' | 'Maintenance' | 'Retired',
    userName: '',
    location: '',
    comments: '',
  });

  const [attachments, setAttachments] = useState<{ name: string; url: string; uploadedAt: string }[]>([]);

  useEffect(() => {
    if (accessory) {
      setFormData({
        assetType: accessory.assetType,
        modelNumber: accessory.modelNumber || '',
        brandMake: accessory.brandMake || '',
        barcode: accessory.barcode || '',
        serialNumber: accessory.serialNumber || '',
        quantity: accessory.quantity,
        status: accessory.status,
        userName: accessory.userName || '',
        location: accessory.location || '',
        comments: typeof accessory.comments === 'string'
          ? accessory.comments
          : Array.isArray(accessory.comments)
            ? accessory.comments.join('\n')
            : (accessory.comments ? String(accessory.comments) : ''),
      });
      setAttachments(accessory.attachments || []);
    } else {
      // Reset for new accessory
      setFormData({
        assetType: '',
        modelNumber: '',
        brandMake: '',
        barcode: '',
        serialNumber: '',
        quantity: 1,
        status: 'On-Stock',
        userName: '',
        location: '',
        comments: '',
      });
      setAttachments([]);
    }
  }, [accessory, open]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newAttachments = Array.from(files).map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
      }));
      setAttachments([...attachments, ...newAttachments]);
      toast.success(`Uploaded ${files.length} file(s)`);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
    toast.success('Attachment removed');
  };

  const handleSave = () => {
    // Validation
    if (!formData.assetType) {
      toast.error('Asset Type is required');
      return;
    }
    if (formData.quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }

    // Auto-generate barcode if not provided
    const finalBarcode = (typeof formData.barcode === 'string' ? formData.barcode.trim() : '') || `ACC-${Date.now()}`;

    const safeComments = typeof formData.comments === 'string' ? formData.comments.trim() : undefined;
    onSave({
      ...formData,
      barcode: finalBarcode,
      modelNumber: (typeof formData.modelNumber === 'string' ? formData.modelNumber.trim() : '') || 'N/A',
      brandMake: formData.brandMake || 'N/A',
      serialNumber: (typeof formData.serialNumber === 'string' ? formData.serialNumber.trim() : '') || 'N/A',
      userName: formData.userName || undefined,
      location: (typeof formData.location === 'string' ? formData.location.trim() : '') || 'N/A',
      comments: safeComments || undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
    });
  };

  const handleDelete = () => {
    if (accessory && onDeleteClick) {
      onDeleteClick(accessory);
    }
  };

  const showUserName = accessory && (formData.status === 'Reserve' || formData.status === 'Issued');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{accessory ? 'Edit Accessory' : 'Add New Accessory'}</DialogTitle>
          <DialogDescription>
            {accessory ? 'Make changes to the accessory details.' : 'Enter the details for the new accessory.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Asset Type */}
          <div className="space-y-2">
            <Label htmlFor="assetType">
              Asset Type <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.assetType} onValueChange={(value) => setFormData({ ...formData, assetType: value })}>
              <SelectTrigger id="assetType">
                <SelectValue placeholder="Select asset type" />
              </SelectTrigger>
              <SelectContent>
                {assetTypeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model Number */}
          <div className="space-y-2">
            <Label htmlFor="modelNumber">Model Number</Label>
            <Input
              id="modelNumber"
              value={formData.modelNumber}
              onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
              placeholder="Enter model number"
            />
          </div>

          {/* Brand/Make */}
          <div className="space-y-2">
            <Label htmlFor="brandMake">Brand/Make</Label>
            <Select value={formData.brandMake} onValueChange={(value) => setFormData({ ...formData, brandMake: value })}>
              <SelectTrigger id="brandMake">
                <SelectValue placeholder="Select brand/make" />
              </SelectTrigger>
              <SelectContent>
                {brandOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Barcode */}
          <div className="space-y-2">
            <Label htmlFor="barcode">
              Barcode
            </Label>
            <Input
              id="barcode"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              placeholder="Auto-generated if left blank"
            />
          </div>

          {/* Serial Number */}
          <div className="space-y-2">
            <Label htmlFor="serialNumber">Serial Number</Label>
            <Input
              id="serialNumber"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              placeholder="Enter serial number (optional)"
            />
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantity <span className="text-red-500">*</span>
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">
              Status <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="On-Stock">On-Stock</SelectItem>
                <SelectItem value="Reserve">Reserve</SelectItem>
                <SelectItem value="Issued">Issued</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Name - Only show when editing and status is Reserve or Issued */}
          {showUserName && (
            <div className="space-y-2">
              <Label htmlFor="userName">{formData.status === 'Reserve' ? 'Reserved For' : 'Issued To'}</Label>
              <Select value={formData.userName} onValueChange={(value) => setFormData({ ...formData, userName: value })}>
                <SelectTrigger id="userName">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {userOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Enter location"
            />
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label>Attachments</Label>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
              <input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
              {attachments.length > 0 && (
                <div className="space-y-1 border rounded-md p-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4 text-gray-500" />
                        <span className="truncate">{file.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                        className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments">Comments</Label>
            <Textarea
              id="comments"
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              placeholder="Enter any additional comments"
              rows={3}
            />
          </div>

          {/* Activity Log - Only show when editing */}
          {accessory && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label>Activity Log</Label>
                <AuditLog entries={accessory.auditLog} />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {onDeleteClick && accessory && (
            <Button
              onClick={handleDelete}
              style={{ backgroundColor: 'red' }}
              className="text-white hover:opacity-90"
            >
              Delete
            </Button>
          )}
          <Button onClick={handleSave} style={{ backgroundColor: LINE_GREEN }} className="text-white hover:opacity-90">
            {accessory ? 'Save Changes' : 'Add Accessory'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}