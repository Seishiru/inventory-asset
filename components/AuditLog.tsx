import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Clock, User, Edit } from 'lucide-react';

export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  description: string;
}

interface AuditLogProps {
  entries?: AuditEntry[];
}

export function AuditLog({ entries }: AuditLogProps) {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const sortedEntries = [...safeEntries].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {sortedEntries.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No activity recorded yet
            </div>
          ) : (
            <div className="space-y-4">
              {sortedEntries.map((entry) => (
                <div key={entry.id} className="flex gap-3 pb-4 border-b last:border-b-0">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      {entry.action === 'created' ? (
                        <User className="h-4 w-4 text-green-600" />
                      ) : (
                        <Edit className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{entry.user}</span>{' '}
                          <span className="text-gray-600">{entry.description}</span>
                        </p>
                        {entry.field && (
                          <div className="mt-1 text-xs text-gray-500">
                            <span className="font-medium">{entry.field}:</span>{' '}
                            {entry.oldValue && (
                              <>
                                <span className="line-through text-red-500">{entry.oldValue}</span>
                                {' → '}
                              </>
                            )}
                            <span className="text-green-600">{entry.newValue}</span>
                          </div>
                        )}
                      </div>
                      <time className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(entry.timestamp).toLocaleString()}
                      </time>
                    </div>
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
