import { useState, useRef, useEffect } from 'react';

const defaultColumnWidths: Record<string, number> = {
  index: 80,
  image: 100,
  assetType: 150,
  brandMake: 150,
  modelNumber: 150,
  serialNumber: 150,
  barcode: 150,
  quantity: 120,
  status: 120,
  location: 150,
  userName: 150,
  createdBy: 150,
  modifiedBy: 150,
  createdAt: 180,
  lastUpdated: 280,
  description: 200,
  comments: 200,
};

export function useColumnResize() {
  const [globalResizeLock, setGlobalResizeLock] = useState<boolean>(true);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(defaultColumnWidths);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const resizeRef = useRef<{ startX: number; startWidth: number; columnKey: string } | null>(null);

  // Prevent text selection while resizing
  useEffect(() => {
    if (resizingColumn) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [resizingColumn]);

  const handleGlobalLockToggle = () => {
    setGlobalResizeLock(!globalResizeLock);
  };

  const handleMouseDown = (e: React.MouseEvent, columnKey: string) => {
    if (globalResizeLock) {
      console.log('Columns are locked, cannot resize');
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    resizeRef.current = {
      startX: e.clientX,
      startWidth: columnWidths[columnKey],
      columnKey,
    };
    setResizingColumn(columnKey);
  };

  useEffect(() => {
    if (!resizingColumn || !resizeRef.current) {
      return;
    }

    const columnKey = resizingColumn;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeRef.current || resizeRef.current.columnKey !== columnKey) return;
      
      e.preventDefault();
      const diff = e.clientX - resizeRef.current.startX;
      const newWidth = Math.max(40, Math.min(500, resizeRef.current.startWidth + diff));
      setColumnWidths(prev => ({ ...prev, [columnKey]: newWidth }));
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      setResizingColumn(null);
      resizeRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingColumn, columnWidths]);

  return {
    globalResizeLock,
    columnWidths,
    resizingColumn,
    handleGlobalLockToggle,
    handleMouseDown
  };
}