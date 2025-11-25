import { Construction, ArrowLeft, FileText } from 'lucide-react';
import { Button } from './ui/button';

const LINE_GREEN = '#06C755';

interface ReportsPageProps {
  onBack?: () => void;
}

export function ReportsPage({ onBack }: ReportsPageProps) {
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
            <FileText className="h-5 w-5" style={{ color: LINE_GREEN }} />
            <h1 className="text-xl text-gray-900 dark:text-gray-100">
              Reports
            </h1>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-73px)]">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div
              className="p-6 rounded-full"
              style={{ backgroundColor: `${LINE_GREEN}20` }}
            >
              <Construction
                className="h-16 w-16"
                style={{ color: LINE_GREEN }}
              />
            </div>
          </div>
          <h2 className="text-2xl text-gray-900 dark:text-gray-100">
            Under Maintenance
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            The Reports feature is currently under development. Please check back later.
          </p>
        </div>
      </div>
    </div>
  );
}
