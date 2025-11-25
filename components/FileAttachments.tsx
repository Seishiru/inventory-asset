import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Paperclip, Upload, Download, Trash2, FileText, Image as ImageIcon, File } from 'lucide-react';
import { toast } from 'sonner';

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface FileAttachmentsProps {
  attachments: FileAttachment[];
  onAddAttachment: (file: FileAttachment) => void;
  onRemoveAttachment: (id: string) => void;
  currentUser: string;
}

export function FileAttachments({ attachments, onAddAttachment, onRemoveAttachment, currentUser }: FileAttachmentsProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAttachment: FileAttachment = {
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: reader.result as string,
          uploadedBy: currentUser,
          uploadedAt: new Date().toISOString(),
        };
        onAddAttachment(newAttachment);
      };
      reader.readAsDataURL(file);
    });

    setUploading(false);
    e.target.value = '';
    toast.success('File(s) attached successfully');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (type.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const handleDownload = (attachment: FileAttachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    link.click();
    toast.success('File downloaded');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Paperclip className="h-4 w-4" />
            Attachments ({attachments.length})
          </div>
          <label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              asChild
            >
              <span className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Add Files'}
              </span>
            </Button>
            <Input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              accept="*/*"
            />
          </label>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          {attachments.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No attachments yet. Add files like manuals, receipts, or photos.
            </div>
          ) : (
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 text-gray-500">
                      {getFileIcon(attachment.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{attachment.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(attachment.size)} • {attachment.uploadedBy} • {new Date(attachment.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(attachment)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        onRemoveAttachment(attachment.id);
                        toast.success('Attachment removed');
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
