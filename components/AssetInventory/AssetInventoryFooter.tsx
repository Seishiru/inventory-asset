import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const LINE_GREEN = '#06C755';

interface AssetInventoryFooterProps {
  activeDashboard: 'equipments' | 'accessories';
  filteredAssets: any[];
  filteredAccessories: any[];
  itemsPerPage: number | 'all';
  currentPage: number;
  totalPages: number;
  onItemsPerPageChange: (value: string) => void;
  onPageChange: (page: number) => void;
}

export default function AssetInventoryFooter({
  activeDashboard,
  filteredAssets,
  filteredAccessories,
  itemsPerPage,
  currentPage,
  totalPages,
  onItemsPerPageChange,
  onPageChange
}: AssetInventoryFooterProps) {
  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="text-sm text-gray-500">
        {activeDashboard === 'equipments' ? (
          <>Showing {filteredAssets.length === 0 ? 0 : (currentPage - 1) * (itemsPerPage === 'all' ? filteredAssets.length : itemsPerPage) + 1} to {Math.min(currentPage * (itemsPerPage === 'all' ? filteredAssets.length : itemsPerPage), filteredAssets.length)} of {filteredAssets.length} equipment</>
        ) : (
          <>Showing {filteredAccessories.length === 0 ? 0 : (currentPage - 1) * (itemsPerPage === 'all' ? filteredAccessories.length : itemsPerPage) + 1} to {Math.min(currentPage * (itemsPerPage === 'all' ? filteredAccessories.length : itemsPerPage), filteredAccessories.length)} of {filteredAccessories.length} accessories</>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show:</span>
          <Select value={itemsPerPage.toString()} onValueChange={onItemsPerPageChange}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {itemsPerPage !== 'all' && totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className={currentPage === pageNum ? "text-white" : ""}
                    style={currentPage === pageNum ? { backgroundColor: LINE_GREEN } : {}}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}