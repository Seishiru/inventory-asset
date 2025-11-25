import { forwardRef } from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Filter } from 'lucide-react';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  assetTypeFilter: string;
  onAssetTypeFilterChange: (value: string) => void;
  assetTypes: string[];
}

export const FilterBar = forwardRef<HTMLInputElement, FilterBarProps>(
  function FilterBar(
    {
      searchTerm,
      onSearchChange,
      statusFilter,
      onStatusFilterChange,
      assetTypeFilter,
      onAssetTypeFilterChange,
      assetTypes,
    }: FilterBarProps,
    ref
  ) {
    return (
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={ref} // Use the forwarded ref here
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="w-48">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="All Statuses" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
              <SelectItem value="Retired">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-48">
          <Select value={assetTypeFilter} onValueChange={onAssetTypeFilterChange}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="All Asset Types" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Asset Types</SelectItem>
              {assetTypes
                .filter((type) => type && type.trim() !== '')
                .map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }
);