import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  dialogOpen: boolean;
  selectedRows: Set<string>;
  currentPage: number;
  itemsPerPage: number | 'all';
  searchInputRef: React.RefObject<HTMLInputElement>;
  setDialogOpen: (open: boolean) => void;
  setShowShortcuts: (show: boolean) => void;
  handlePrint: () => void;
  handleBulkDelete: () => void;
  clearSelection: () => void;
}

export function useKeyboardShortcuts({
  dialogOpen,
  selectedRows,
  currentPage,
  itemsPerPage,
  searchInputRef,
  setDialogOpen,
  setShowShortcuts,
  handlePrint,
  handleBulkDelete,
  clearSelection
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N - Add new asset
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setDialogOpen(true);
      }
      
      // Ctrl+F - Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      
      // Ctrl+P - Print
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handlePrint();
      }
      
      // Ctrl+? - Show shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShowShortcuts(true);
      }
      
      // Delete - Delete selected
      if (e.key === 'Delete' && selectedRows.size > 0 && !dialogOpen) {
        e.preventDefault();
        handleBulkDelete();
      }
      
      // Escape - Close dialog or clear selection
      if (e.key === 'Escape') {
        if (dialogOpen) {
          // Close dialog handled by dialog component
        } else if (selectedRows.size > 0) {
          clearSelection();
        }
      }
      
      // Arrow keys for pagination
      if (itemsPerPage !== 'all') {
        if (e.key === 'ArrowLeft' && currentPage > 1 && !dialogOpen) {
          // Page change handled by pagination
        }
        if (e.key === 'ArrowRight' && currentPage < Math.ceil(selectedRows.size / (typeof itemsPerPage === 'number' ? itemsPerPage : 1)) && !dialogOpen) {
          // Page change handled by pagination
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialogOpen, selectedRows, currentPage, itemsPerPage, setDialogOpen, setShowShortcuts, handlePrint, handleBulkDelete, clearSelection, searchInputRef]);
}