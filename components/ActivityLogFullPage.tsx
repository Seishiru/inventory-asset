import { useState } from 'react';
import { Clock, User, Activity, FileDown, Filter, Search, ArrowLeft, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

const LINE_GREEN = '#06C755';

export interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  username: string;
  action: string;
  details?: string;
  type: 'create' | 'update' | 'delete' | 'backup' | 'restore' | 'login' | 'logout' | 'export' | 'import' | 'other';
}

interface ActivityLogFullPageProps {
  activities: ActivityLogEntry[];
  onBack: () => void;
}

export function ActivityLogFullPage({
  activities,
  onBack,
}: ActivityLogFullPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');

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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  // Get unique users
  const uniqueUsers = Array.from(new Set(activities.map(a => a.username)));

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = 
      activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.details && activity.details.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || activity.type === typeFilter;
    const matchesUser = userFilter === 'all' || activity.username === userFilter;

    return matchesSearch && matchesType && matchesUser;
  });

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

  const groupedActivities = groupActivitiesByDate(filteredActivities);
  const sortedDates = Object.keys(groupedActivities).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  // Calculate stats
  const stats = {
    total: activities.length,
    creates: activities.filter(a => a.type === 'create').length,
    updates: activities.filter(a => a.type === 'update').length,
    deletes: activities.filter(a => a.type === 'delete').length,
    logins: activities.filter(a => a.type === 'login').length,
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Timestamp', 'User', 'Type', 'Action', 'Details'];
    const rows = filteredActivities.map(activity => [
      formatTimestamp(activity.timestamp),
      activity.username,
      activity.type,
      activity.action,
      activity.details || '',
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Activity log exported to CSV');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="gap-2 hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4" style={{ color: LINE_GREEN }} />
                <span style={{ color: LINE_GREEN }}>Back</span>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center h-10 w-10 rounded-full text-white"
                  style={{ backgroundColor: LINE_GREEN }}
                >
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl text-gray-900">Activity Log</h1>
                  <p className="text-sm text-gray-600">
                    Complete history of all actions performed
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={exportToCSV}
              className="gap-2"
            >
              <FileDown className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">
                Total Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl" style={{ color: LINE_GREEN }}>
                {stats.total}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">
                Creates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl" style={{ color: '#10b981' }}>
                {stats.creates}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">
                Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl" style={{ color: '#3b82f6' }}>
                {stats.updates}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">
                Deletes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl" style={{ color: '#ef4444' }}>
                {stats.deletes}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">
                Logins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl" style={{ color: '#f59e0b' }}>
                {stats.logins}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-700">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-700">Activity Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="logout">Logout</SelectItem>
                    <SelectItem value="export">Export</SelectItem>
                    <SelectItem value="import">Import</SelectItem>
                    <SelectItem value="backup">Backup</SelectItem>
                    <SelectItem value="restore">Restore</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-700">User</label>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {uniqueUsers.map(user => (
                      <SelectItem key={user} value={user}>{user}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(searchTerm || typeFilter !== 'all' || userFilter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('all');
                  setUserFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Activity List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Activities ({filteredActivities.length})
              </CardTitle>
              {activities.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  Last: {formatTimestamp(activities[0].timestamp)}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {filteredActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Activity className="h-16 w-16 mb-4 text-gray-300" />
                <p className="text-lg text-gray-600">
                  No activities found
                </p>
                <p className="text-sm text-gray-400">
                  {activities.length === 0 
                    ? 'Activities will appear here as you use the application'
                    : 'Try adjusting your filters'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedDates.map((dateKey) => (
                  <div key={dateKey} className="space-y-3">
                    {/* Date Header */}
                    <div className="flex items-center gap-2">
                      <div className="text-sm px-3 py-1 rounded-full text-white" style={{ backgroundColor: LINE_GREEN }}>
                        {formatDate(new Date(dateKey))}
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
                                <span className="text-xs text-gray-500">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
