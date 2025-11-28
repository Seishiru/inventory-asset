import { useState } from 'react';

export function useSelection() {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const toggleRowSelection = (id: string, isCtrlClick: boolean = false) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      
      if (isCtrlClick) {
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
      } else {
        if (newSet.has(id) && newSet.size === 1) {
          newSet.delete(id);
        } else {
          newSet.clear();
          newSet.add(id);
        }
      }
      
      return newSet;
    });
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleRowClick = (id: string, event: React.MouseEvent) => {
    toggleRowSelection(id, event.ctrlKey || event.metaKey);
  };

  const clearSelection = () => {
    setSelectedRows(new Set());
  };

  return {
    selectedRows,
    hoveredRow,
    setHoveredRow,
    toggleRowSelection,
    handleCheckboxChange,
    handleRowClick,
    clearSelection
  };
}