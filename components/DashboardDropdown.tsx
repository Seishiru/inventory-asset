import { useState } from 'react';
import { Button } from './ui/button';
import { ChevronDown } from 'lucide-react';

const LINE_GREEN = '#06C755';

interface DashboardDropdownProps {
  activeDashboard: 'equipments' | 'accessories';
  onDashboardChange: (dashboard: 'equipments' | 'accessories') => void;
}

export function DashboardDropdown({ activeDashboard, onDashboardChange }: DashboardDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const dashboardLabel = activeDashboard === 'equipments' ? 'Equipments' : 'Accessories';

  const handleSelect = (dashboard: 'equipments' | 'accessories') => {
    onDashboardChange(dashboard);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="default"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: LINE_GREEN }}
        className="text-white hover:opacity-90 flex items-center gap-2"
      >
        {dashboardLabel}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute top-full mt-1 left-0 z-20 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[150px] overflow-hidden">
            <button
              onClick={() => handleSelect('equipments')}
              className={`w-full text-left px-4 py-2 hover:bg-green-50 transition-colors ${
                activeDashboard === 'equipments' ? 'bg-green-100 font-medium' : ''
              }`}
            >
              Equipments
            </button>
            <button
              onClick={() => handleSelect('accessories')}
              className={`w-full text-left px-4 py-2 hover:bg-green-50 transition-colors ${
                activeDashboard === 'accessories' ? 'bg-green-100 font-medium' : ''
              }`}
            >
              Accessories
            </button>
          </div>
        </>
      )}
    </div>
  );
}
