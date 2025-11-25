import { ArrowLeft, Package } from 'lucide-react';
import { Button } from './ui/button';

const LINE_GREEN = '#06C755';

interface InventoryPageProps {
  inventoryComponent: React.ReactNode;
  onBack?: () => void;
}

export function InventoryPage({ inventoryComponent, onBack }: InventoryPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Back Button */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="px-6 py-4 flex items-center gap-4">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4" style={{ color: LINE_GREEN }} />
              <span style={{ color: LINE_GREEN }}>Back to Main</span>
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" style={{ color: LINE_GREEN }} />
            <h1 className="text-xl text-gray-900 dark:text-gray-100">
              Inventory Assets
            </h1>
          </div>
        </div>
      </div>
      
      {inventoryComponent}
    </div>
  );
}
