import { X, Clock, User, Activity, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useState, useEffect } from 'react';

const LINE_GREEN = '#06C755';

export interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  username: string;
  action: string;
  details?: string;
  type: 'create' | 'update' | 'delete' | 'backup' | 'restore' | 'login' | 'logout' | 'export' | 'import' | 'other';
}

interface ActivityLogPageProps {
  open: boolean;
  onClose: () => void;
  activities?: ActivityLogEntry[];
}

export function ActivityLogPage({
  open,
  onClose,
  activities: externalActivities,
}: ActivityLogPageProps) {
  const [activities, setActivities] = useState<ActivityLogEntry[]>(externalActivities || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('🔄 [ActivityLog] useEffect triggered - open:', open, 'externalActivities:', externalActivities);
    if (open) {
      if (externalActivities) {
        console.log('📥 [ActivityLog] Using external activities:', externalActivities);
        setActivities(externalActivities);
      } else {
        console.log('🌐 [ActivityLog] No external activities, fetching from backend...');
        loadActivities();
      }
    }
  }, [open, externalActivities]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      console.log('🔍 [ActivityLog] Fetching from http://localhost:4000/activity-log');
      const response = await fetch('http://localhost:4000/activity-log');
      console.log('📡 [ActivityLog] Response status:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 [ActivityLog] Raw data from backend:', data);
        console.log('📊 [ActivityLog] Number of logs:', data.length);
        
        const mappedActivities = data.map((log: any) => ({
          id: String(log.id),
          timestamp: new Date(log.timestamp),
          username: log.username,
          action: log.action,
          details: log.details,
          type: log.type,
        }));
        
        console.log('✅ [ActivityLog] Mapped activities:', mappedActivities);
        setActivities(mappedActivities);
      } else {
        console.error('❌ [ActivityLog] Failed to fetch:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ [ActivityLog] Error response:', errorText);
      }
    } catch (error) {
      console.error('❌ [ActivityLog] Error loading activities:', error);
    } finally {
      setLoading(false);
      console.log('🏁 [ActivityLog] Fetch complete');
    }
  };
  const getActivityColor = (type: ActivityLogEntry['type']) => {
    switch (type) {
      case 'create':
        return '#10b981'; // green
      case 'update':
        return '#3b82f6'; // blue
      case 'delete':
        return '#ef4444'; // red
      case 'backup':
      case 'restore':
        return '#8b5cf6'; // purple
      case 'login':
      case 'logout':
        return '#f59e0b'; // amber
      case 'export':
      case 'import':
        return '#06b6d4'; // cyan
      default:
        return '#6b7280'; // gray
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const groupActivitiesByDate = (activities: ActivityLogEntry[]) => {
    const groups: { [key: string]: ActivityLogEntry[] } = {};
    
    activities.forEach((activity) => {
      const dateKey = new Date(activity.timestamp).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(activity);
    });
    
    return groups;
  };

  const groupedActivities = groupActivitiesByDate(activities);
  const sortedDates = Object.keys(groupedActivities).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Activity Log Page */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4`}
      >
        <div
          className="w-full max-w-4xl h-[90vh] rounded-lg shadow-2xl flex flex-col bg-white"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-6 border-b border-gray-200"
            style={{ borderBottomColor: LINE_GREEN }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center h-10 w-10 rounded-full text-white"
                style={{ backgroundColor: LINE_GREEN }}
              >
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl text-gray-900">
                  Activity Log
                </h2>
                <p className="text-sm text-gray-600">
                  Complete history of all actions performed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadActivities}
                disabled={loading}
                className="h-10 px-3 hover:bg-gray-100"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-10 w-10 p-0 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div
            className="flex items-center gap-4 px-6 py-4 border-b bg-gray-50 border-gray-200"
          >
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" style={{ color: LINE_GREEN }} />
              <span className="text-sm text-gray-700">
                Total Activities: <strong>{activities.length}</strong>
              </span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" style={{ color: LINE_GREEN }} />
              <span className="text-sm text-gray-700">
                Last Updated: <strong>{activities.length > 0 ? formatTimestamp(activities[0].timestamp) : 'N/A'}</strong>
              </span>
            </div>
          </div>

          {/* Activity List */}
          <ScrollArea className="flex-1 px-6 py-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <RefreshCw className="h-16 w-16 mb-4 text-gray-300 animate-spin" />
                <p className="text-lg text-gray-600">
                  Loading activities...
                </p>
              </div>
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Activity className="h-16 w-16 mb-4 text-gray-300" />
                <p className="text-lg text-gray-600">
                  No activities recorded yet
                </p>
                <p className="text-sm text-gray-400">
                  Activities will appear here as you use the application
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedDates.map((dateKey) => (
                  <div key={dateKey} className="space-y-3">
                    {/* Date Header */}
                    <div className="flex items-center gap-2 sticky top-0 py-2 z-10"
                      style={{ 
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <div
                        className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700"
                      >
                        {new Date(dateKey).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="flex-1 h-px bg-gray-300" />
                    </div>

                    {/* Activities for this date */}
                    <div className="space-y-2">
                      {groupedActivities[dateKey].map((activity) => (
                        <div
                          key={activity.id}
                          className="p-4 rounded-lg border transition-all hover:shadow-md bg-white border-gray-200 hover:bg-gray-50"
                        >
                          <div className="flex items-start gap-3">
                            {/* Timeline Dot */}
                            <div className="flex flex-col items-center pt-1">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: getActivityColor(activity.type) }}
                              />
                              <div className="w-px h-full mt-1 bg-gray-200" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge
                                  variant="outline"
                                  className="text-xs capitalize"
                                  style={{
                                    borderColor: getActivityColor(activity.type),
                                    color: getActivityColor(activity.type),
                                  }}
                                >
                                  {activity.type}
                                </Badge>
                                <span
                                  className="text-xs text-gray-500"
                                >
                                  {formatTimestamp(activity.timestamp)}
                                </span>
                              </div>

                              <div className="flex items-start gap-2">
                                <User className="h-4 w-4 mt-0.5 text-gray-500" />
                                <div className="flex-1">
                                  <p className="text-sm text-gray-900">
                                    <strong>{activity.username}</strong> {activity.action}
                                  </p>
                                  {activity.details && (
                                    <p className="text-sm mt-1 text-gray-600">
                                      {activity.details}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </>
  );
}
