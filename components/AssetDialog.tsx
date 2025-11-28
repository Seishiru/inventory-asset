import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Upload, X, Trash2, Copy } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { AuditLog, AuditEntry } from './AuditLog';
import { FileAttachments, FileAttachment } from './FileAttachments';
import { CommentsSection, Comment } from './CommentsSection';

export interface Asset {
  id: string;
  index: number;
  image?: string;
  assetType: string;
  brandMake: string;
  modelNumber: string;
  serialNumber: string;
  barcode?: string;
  description?: string;
  status: 'On-Stock' | 'Inactive' | 'Maintenance' | 'Retired' | 'Reserve' | 'Issued';
  location: string;
  userName: string;
  createdBy: string;
  modifiedBy: string;
  createdAt: string;
  lastUpdated: string;
  customFields?: Record<string, string>;
  auditLog?: AuditEntry[];
  attachments?: FileAttachment[];
  comments?: Comment[];
}

interface AssetDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (asset: Omit<Asset, 'id' | 'index' | 'createdAt' | 'lastUpdated'>) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (asset: Asset) => void;
  currentUser: string;
  customColumns?: string[];
  editAsset?: Asset;
  brandOptions?: string[];
  assetTypeOptions?: string[];
  userOptions?: string[];
}

export function AssetDialog({ open, onClose, onSave, onDelete, onDuplicate, currentUser, customColumns = [], editAsset, brandOptions = [], assetTypeOptions = [], userOptions = [] }: AssetDialogProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState<Omit<Asset, 'id' | 'index' | 'createdAt' | 'lastUpdated'>>({
    image: '',
    assetType: '',
    brandMake: '',
    modelNumber: '',
    serialNumber: '',
    barcode: '',
    description: '',
    status: 'On-Stock',
    location: '',
    userName: '',
    createdBy: currentUser,
    modifiedBy: currentUser,
    customFields: {},
    auditLog: [],
    attachments: [],
    comments: [],
  });

  useEffect(() => {
    if (editAsset) {
      setFormData({
        image: editAsset.image || '',
        assetType: editAsset.assetType,
        brandMake: editAsset.brandMake,
        modelNumber: editAsset.modelNumber,
        serialNumber: editAsset.serialNumber,
        barcode: editAsset.barcode || '',
        description: editAsset.description || '',
        status: editAsset.status,
        location: editAsset.location,
        userName: editAsset.userName,
        createdBy: editAsset.createdBy,
        modifiedBy: currentUser,
        customFields: editAsset.customFields || {},
        auditLog: editAsset.auditLog || [],
        attachments: editAsset.attachments || [],
        comments: editAsset.comments || [],
      });
    } else {
      setFormData({
        image: '',
        assetType: '',
        brandMake: '',
        modelNumber: '',
        serialNumber: '',
        barcode: '',
        description: '',
        status: 'On-Stock',
        location: '',
        userName: '',
        createdBy: currentUser,
        modifiedBy: currentUser,
        customFields: {},
        auditLog: [],
        attachments: [],
        comments: [],
      });
    }
  }, [editAsset, currentUser, open]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleDelete = () => {
    if (editAsset && onDelete) {
      onDelete(editAsset.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const handleDuplicate = () => {
    if (editAsset && onDuplicate) {
      onDuplicate(editAsset);
      onClose();
    }
  };

  const handleAddComment = (text: string) => {
    const newComment: Comment = {
      id: `${Date.now()}-${Math.random()}`,
      text,
      author: currentUser,
      timestamp: new Date().toISOString(),
    };
    setFormData({
      ...formData,
      comments: [...(formData.comments || []), newComment],
    });
  };

  const handleEditComment = (id: string, text: string) => {
    setFormData({
      ...formData,
      comments: (formData.comments || []).map((comment) =>
        comment.id === id
          ? { ...comment, text, edited: true, editedAt: new Date().toISOString() }
          : comment
      ),
    });
  };

  const handleDeleteComment = (id: string) => {
    setFormData({
      ...formData,
      comments: (formData.comments || []).filter((comment) => comment.id !== id),
    });
  };

  const handleAddAttachment = (file: FileAttachment) => {
    setFormData({
      ...formData,
      attachments: [...(formData.attachments || []), file],
    });
  };

  const handleRemoveAttachment = (id: string) => {
    setFormData({
      ...formData,
      attachments: (formData.attachments || []).filter((file) => file.id !== id),
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editAsset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
            <DialogDescription>
              {editAsset ? 'Update the asset information below.' : 'Fill in the details to add a new asset to the inventory.'}
            </DialogDescription>
          </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
              {editAsset && <TabsTrigger value="comments">Comments</TabsTrigger>}
              {editAsset && <TabsTrigger value="activity">Activity Log</TabsTrigger>}
            </TabsList>

            <TabsContent value="details" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assetType">Asset Type *</Label>
                  <Select
                    value={formData.assetType}
                    onValueChange={(value) => setFormData({ ...formData, assetType: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an asset type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {assetTypeOptions.length > 0 ? (
                        assetTypeOptions.map((assetType) => (
                          <SelectItem key={assetType} value={assetType}>
                            {assetType}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-xs text-muted-foreground">
                          No asset types available. Add asset types in Settings.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brandMake">Brand/Make *</Label>
                  <Select
                    value={formData.brandMake}
                    onValueChange={(value) => setFormData({ ...formData, brandMake: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a brand..." />
                    </SelectTrigger>
                    <SelectContent>
                      {brandOptions.length > 0 ? (
                        brandOptions.map((brand) => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-xs text-muted-foreground">
                          No brands available. Add brands in Settings.
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="modelNumber">Model Number *</Label>
                  <Input
                    id="modelNumber"
                    value={formData.modelNumber}
                    onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                    placeholder="e.g., MBP-16-2024"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number *</Label>
                  <Input
                    id="serialNumber"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    placeholder="e.g., SN123456789"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="Leave empty - will be generated by backend"
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Barcode will be automatically generated by the Python backend</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add detailed description of the asset..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: Asset['status']) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="On-Stock">On-Stock</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Retired">Retired</SelectItem>
                      <SelectItem value="Reserve">Reserve</SelectItem>
                      <SelectItem value="Issued">Issued</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location/Station *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Office - Desk 12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userName">User Name *</Label>
                <Select
                  value={formData.userName}
                  onValueChange={(value) => setFormData({ ...formData, userName: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user name..." />
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

              <div className="space-y-2">
                <Label>Asset Image</Label>
                <div className="border-2 border-dashed rounded-lg p-4">
                  {formData.image ? (
                    <div className="relative">
                      <ImageWithFallback
                        src={formData.image}
                        alt="Asset preview"
                        className="w-full h-48 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => setFormData({ ...formData, image: '' })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center cursor-pointer">
                      <Upload className="h-12 w-12 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Click to upload image</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
              </div>

              {customColumns && customColumns.length > 0 && (
                <>
                  <div className="pt-4 border-t">
                    <h3 className="mb-3 text-sm">Custom Fields</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {customColumns.map((column) => (
                        <div key={column} className="space-y-2">
                          <Label htmlFor={column}>{column}</Label>
                          <Input
                            id={column}
                            value={formData.customFields?.[column] || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              customFields: {
                                ...formData.customFields,
                                [column]: e.target.value
                              }
                            })}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="attachments" className="py-4">
              <FileAttachments
                attachments={formData.attachments || []}
                onAddAttachment={handleAddAttachment}
                onRemoveAttachment={handleRemoveAttachment}
                currentUser={currentUser}
              />
            </TabsContent>

            {editAsset && (
              <TabsContent value="comments" className="py-4">
                <CommentsSection
                  comments={formData.comments || []}
                  onAddComment={handleAddComment}
                  onEditComment={handleEditComment}
                  onDeleteComment={handleDeleteComment}
                  currentUser={currentUser}
                />
              </TabsContent>
            )}

            {editAsset && (
              <TabsContent value="activity" className="py-4">
                <AuditLog entries={formData.auditLog || []} />
              </TabsContent>
            )}
          </Tabs>

          <DialogFooter className="flex justify-between mt-4">
            <div className="flex gap-2">
              {editAsset && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
              {editAsset && onDuplicate && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDuplicate}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                style={{ backgroundColor: '#06C755', color: 'white' }}
                className="hover:opacity-90"
              >
                {editAsset ? 'Update Asset' : 'Add Asset'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the asset "{editAsset?.assetType} - {editAsset?.modelNumber}".
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}