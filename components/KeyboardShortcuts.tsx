import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsProps {
  open: boolean;
  onClose: () => void;
}

export function KeyboardShortcuts({ open, onClose }: KeyboardShortcutsProps) {
  const shortcuts = [
    { key: 'Ctrl + N', description: 'Add new asset' },
    { key: 'Ctrl + F', description: 'Focus search bar' },
    { key: 'Ctrl + P', description: 'Print view' },
    { key: 'Ctrl + S', description: 'Save changes (in dialog)' },
    { key: 'Ctrl + ?', description: 'Show keyboard shortcuts' },
    { key: 'Delete', description: 'Delete selected assets' },
    { key: 'Escape', description: 'Close dialog/Clear selection' },
    { key: 'Arrow Keys', description: 'Navigate pages' },
    { key: 'Ctrl + Click', description: 'Multi-select rows' },
    { key: 'Double Click', description: 'Edit asset' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate faster
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50"
            >
              <span className="text-sm text-gray-600">{shortcut.description}</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 border border-gray-300 rounded">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
