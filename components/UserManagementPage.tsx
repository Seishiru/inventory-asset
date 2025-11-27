import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { Plus, X, ArrowUpDown, Trash2, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const LINE_GREEN = '#06C755';

export interface User {
  id: string;
  index: number;
  email: string;
  name: string;
  password: string;
  status: 'active' | 'inactive';
  position: 'ITech' | 'Agent' | 'SAdmin' | 'CSagent' | 'SAgent' | 'TLCSales';
  createdAt: string;
  lastLogin?: string;
}

// Placeholder data
const initialUsers: User[] = [
  {
    id: '1',
    index: 0,
    email: 'admin@company.com',
    name: 'Admin User',
    password: 'admin123',
    status: 'active',
    position: 'SAdmin',
    createdAt: new Date('2024-01-15').toISOString(),
    lastLogin: new Date('2024-11-26').toISOString(),
  },
  {
    id: '2',
    index: 1,
    email: 'john.tech@company.com',
    name: 'John Doe',
    password: 'pass1234',
    status: 'active',
    position: 'ITech',
    createdAt: new Date('2024-02-20').toISOString(),
    lastLogin: new Date('2024-11-25').toISOString(),
  },
  {
    id: '3',
    index: 2,
    email: 'jane.agent@company.com',
    name: 'Jane Smith',
    password: 'pass5678',
    status: 'active',
    position: 'Agent',
    createdAt: new Date('2024-03-10').toISOString(),
    lastLogin: new Date('2024-11-24').toISOString(),
  },
  {
    id: '4',
    index: 3,
    email: 'mike.cs@company.com',
    name: 'Mike Johnson',
    password: 'pass9012',
    status: 'inactive',
    position: 'CSagent',
    createdAt: new Date('2024-04-05').toISOString(),
    lastLogin: new Date('2024-10-15').toISOString(),
  },
  {
    id: '5',
    index: 4,
    email: 'sarah.sales@company.com',
    name: 'Sarah Williams',
    password: 'pass3456',
    status: 'active',
    position: 'SAgent',
    createdAt: new Date('2024-05-12').toISOString(),
    lastLogin: new Date('2024-11-26').toISOString(),
  },
  {
    id: '6',
    index: 5,
    email: 'tom.lead@company.com',
    name: 'Tom Anderson',
    password: 'pass7890',
    status: 'active',
    position: 'TLCSales',
    createdAt: new Date('2024-06-18').toISOString(),
    lastLogin: new Date('2024-11-26').toISOString(),
  },
];

interface UserManagementPageProps {
  darkMode?: boolean;
  users?: User[];
  onUsersChange?: (users: User[]) => void;
}

export function UserManagementPage({ darkMode = false, users: externalUsers, onUsersChange }: UserManagementPageProps) {
  const [users, setUsers] = useState<User[]>(externalUsers || initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [itemsPerPage] = useState<number | 'all'>(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const tableRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    status: 'active' as 'active' | 'inactive',
    position: 'Agent' as User['position'],
  });

  // Column width resizing
  const defaultColumnWidths: Record<string, number> = {
    index: 80,
    email: 200,
    name: 180,
    password: 150,
    status: 120,
    position: 150,
    createdAt: 180,
    lastLogin: 180,
    actions: 120,
  };

  const [globalResizeLock, setGlobalResizeLock] = useState<boolean>(true);
  const [columnWidths] = useState<Record<string, number>>(defaultColumnWidths);

  const positions: User['position'][] = ['ITech', 'Agent', 'SAdmin', 'CSagent', 'SAgent', 'TLCSales'];

  // Sync users changes to parent component
  useEffect(() => {
    if (onUsersChange) {
      onUsersChange(users);
    }
  }, [users, onUsersChange]);

  // Filter users
  let filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesPosition = positionFilter === 'all' || user.position === positionFilter;

    return matchesSearch && matchesStatus && matchesPosition;
  });

  // Apply sorting
  if (sortColumn) {
    filteredUsers = [...filteredUsers].sort((a, b) => {
      let aValue: any = a[sortColumn as keyof User];
      let bValue: any = b[sortColumn as keyof User];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (sortDirection === 'asc') {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      } else {
        return bStr < aStr ? -1 : bStr > aStr ? 1 : 0;
      }
    });
  }

  // Pagination
  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = itemsPerPage === 'all' 
    ? filteredUsers 
    : filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
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

  const toggleRowSelection = (id: string, isCtrlClick: boolean = false) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      
      if (isCtrlClick) {
        // CTRL + Click: Toggle the clicked row while keeping others
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
      } else {
        // Regular click: Toggle only this row, clear others
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

  const handleRowClick = (id: string, event: React.MouseEvent) => {
    toggleRowSelection(id, event.ctrlKey || event.metaKey);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedUsers.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedUsers.map((u) => u.id)));
    }
  };

  const clearSelection = () => {
    setSelectedRows(new Set());
  };

  const handleBulkDelete = () => {
    if (selectedRows.size === 0) return;
    setUsers(users.filter((user) => !selectedRows.has(user.id)));
    setSelectedRows(new Set());
    toast.success(`Deleted ${selectedRows.size} user(s)`);
  };

  const openAddDialog = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      name: '',
      password: '',
      status: 'active',
      position: 'Agent',
    });
    setDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      password: user.password,
      status: user.status,
      position: user.position,
    });
    setDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (!formData.email || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    // For new users, password is optional (can be set later)
    // For editing, we already have the password from the form

    if (editingUser) {
      // Update existing user
      setUsers(users.map((user) =>
        user.id === editingUser.id
          ? {
              ...user,
              ...formData,
              // If password is empty when editing, keep the old password
              password: formData.password || user.password,
            }
          : user
      ));
      toast.success('User updated successfully');
    } else {
      // Add new user
      const newUser: User = {
        id: Date.now().toString(),
        index: users.length,
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setUsers([...users, newUser]);
      toast.success('User added successfully');
    }

    setDialogOpen(false);
  };

  // Deletion handled inline where needed; removed unused handler to avoid linter warnings

  const togglePasswordVisibility = (id: string) => {
    setShowPassword((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusColor = (status: User['status']) => {
    return status === 'active' ? 'bg-green-500' : 'bg-gray-500';
  };

  const getPositionColor = (position: User['position']) => {
    const colors: Record<User['position'], string> = {
      SAdmin: 'bg-purple-500',
      ITech: 'bg-blue-500',
      TLCSales: 'bg-indigo-500',
      CSagent: 'bg-cyan-500',
      SAgent: 'bg-green-500',
      Agent: 'bg-gray-500',
    };
    return colors[position];
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUpDown className="h-4 w-4 ml-1" style={{ color: LINE_GREEN }} />
    ) : (
      <ArrowUpDown className="h-4 w-4 ml-1 rotate-180" style={{ color: LINE_GREEN }} />
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl" style={{ color: LINE_GREEN }}>
              {filteredUsers.length}
            </div>
          </CardContent>
        </Card>
        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">
              {filteredUsers.filter((u) => u.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Inactive Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-gray-600">
              {filteredUsers.filter((u) => u.status === 'inactive').length}
            </div>
          </CardContent>
        </Card>
        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-purple-600">
              {filteredUsers.filter((u) => u.position === 'SAdmin').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className={`flex-1 ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : ''}`}
          />
          <Select value={statusFilter} onValueChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className={`w-[180px] ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : ''}`}>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={positionFilter} onValueChange={(value) => {
            setPositionFilter(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className={`w-[180px] ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : ''}`}>
              <SelectValue placeholder="Filter by position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {positions.map((pos) => (
                <SelectItem key={pos} value={pos}>{pos}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openAddDialog} style={{ backgroundColor: LINE_GREEN }} className="text-white hover:opacity-90 ml-4">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Selection Indicator */}
      {selectedRows.size > 0 && (
        <div
          className="flex items-center justify-between px-4 py-3 rounded-lg border"
          style={{ 
            backgroundColor: darkMode ? '#1a4d2e' : '#f0fdf4', 
            borderColor: LINE_GREEN 
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="px-3 py-1 rounded text-white"
              style={{ backgroundColor: LINE_GREEN }}
            >
              Selected {selectedRows.size} {selectedRows.size === 1 ? 'User' : 'Users'}
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Selected
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-green-100'}
          >
            <X className="h-4 w-4 mr-1" />
            Clear Selection
          </Button>
        </div>
      )}

      {/* Table */}
      <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
        <CardContent className="p-0">
          <div className="overflow-x-auto" ref={tableRef}>
            <Table>
              <TableHeader>
                <TableRow className={darkMode ? 'border-gray-700' : ''}>
                  <TableHead className="w-[50px]">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedRows.size === paginatedUsers.length && paginatedUsers.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setGlobalResizeLock(!globalResizeLock)}
                        title={globalResizeLock ? 'Unlock column resizing' : 'Lock column resizing'}
                      >
                        {globalResizeLock ? (
                          <Lock className="h-4 w-4" style={{ color: LINE_GREEN }} />
                        ) : (
                          <Unlock className="h-4 w-4" style={{ color: LINE_GREEN }} />
                        )}
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead 
                    style={{ width: columnWidths.index }}
                    className="cursor-pointer select-none"
                    onClick={() => handleSort('index')}
                  >
                    <div className="flex items-center">
                      ID
                      <SortIcon column="index" />
                    </div>
                  </TableHead>
                  <TableHead 
                    style={{ width: columnWidths.email }}
                    className="cursor-pointer select-none"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center">
                      Email
                      <SortIcon column="email" />
                    </div>
                  </TableHead>
                  <TableHead 
                    style={{ width: columnWidths.name }}
                    className="cursor-pointer select-none"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Name
                      <SortIcon column="name" />
                    </div>
                  </TableHead>
                  <TableHead style={{ width: columnWidths.password }}>Password</TableHead>
                  <TableHead 
                    style={{ width: columnWidths.status }}
                    className="cursor-pointer select-none"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      <SortIcon column="status" />
                    </div>
                  </TableHead>
                  <TableHead 
                    style={{ width: columnWidths.position }}
                    className="cursor-pointer select-none"
                    onClick={() => handleSort('position')}
                  >
                    <div className="flex items-center">
                      Position
                      <SortIcon column="position" />
                    </div>
                  </TableHead>
                  <TableHead 
                    style={{ width: columnWidths.createdAt }}
                    className="cursor-pointer select-none"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      Created At
                      <SortIcon column="createdAt" />
                    </div>
                  </TableHead>
                  <TableHead 
                    style={{ width: columnWidths.lastLogin }}
                    className="cursor-pointer select-none"
                    onClick={() => handleSort('lastLogin')}
                  >
                    <div className="flex items-center">
                      Last Login
                      <SortIcon column="lastLogin" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => {
                  const isSelected = selectedRows.has(user.id);
                  const isHovered = hoveredRow === user.id;
                  const showCheckbox = isSelected || isHovered;
                  
                  return (
                    <TableRow
                      key={user.id}
                      className={`${
                        isSelected ? (darkMode ? 'bg-gray-700' : 'bg-green-50') : ''
                      } ${isHovered ? (darkMode ? 'bg-gray-750' : 'bg-gray-50') : ''} ${
                        darkMode ? 'border-gray-700' : ''
                      } transition-colors cursor-pointer`}
                      onMouseEnter={() => setHoveredRow(user.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      onClick={(e) => handleRowClick(user.id, e)}
                      onDoubleClick={() => openEditDialog(user)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className={`transition-opacity duration-200 ${showCheckbox ? 'opacity-100' : 'opacity-0'}`}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleCheckboxChange(user.id)}
                          />
                        </div>
                      </TableCell>
                      <TableCell style={{ width: columnWidths.index }}>{user.index + 1}</TableCell>
                      <TableCell style={{ width: columnWidths.email }}>{user.email}</TableCell>
                      <TableCell style={{ width: columnWidths.name }}>{user.name}</TableCell>
                      <TableCell style={{ width: columnWidths.password }}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">
                            {showPassword[user.id] ? user.password : '••••••••'}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePasswordVisibility(user.id);
                            }}
                          >
                            {showPassword[user.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell style={{ width: columnWidths.status }}>
                        <Badge className={`${getStatusColor(user.status)} text-white`}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell style={{ width: columnWidths.position }}>
                        <Badge className={`${getPositionColor(user.position)} text-white`}>
                          {user.position}
                        </Badge>
                      </TableCell>
                      <TableCell style={{ width: columnWidths.createdAt }}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell style={{ width: columnWidths.lastLogin }}>
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {itemsPerPage !== 'all' && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((currentPage - 1) * (itemsPerPage as number)) + 1} to {Math.min(currentPage * (itemsPerPage as number), filteredUsers.length)} of {filteredUsers.length} users
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className={darkMode ? 'bg-gray-800 text-gray-100' : ''}>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update user information below.' : 'Enter the details to create a new user account.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={darkMode ? 'bg-gray-700 border-gray-600' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={darkMode ? 'bg-gray-700 border-gray-600' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password {!editingUser && '(optional)'}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={darkMode ? 'bg-gray-700 border-gray-600' : ''}
                placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}>
                <SelectTrigger className={darkMode ? 'bg-gray-700 border-gray-600' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Select value={formData.position} onValueChange={(value) => setFormData({ ...formData, position: value as User['position'] })}>
                <SelectTrigger className={darkMode ? 'bg-gray-700 border-gray-600' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser} style={{ backgroundColor: LINE_GREEN }} className="text-white">
              {editingUser ? 'Update' : 'Add'} User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}