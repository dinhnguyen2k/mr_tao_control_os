import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../shared/components/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../shared/components/pagination';
import { Skeleton } from '../../shared/components/skeleton';
import { 
  Users,
  Shield, 
  Search, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Check, 
  X, 
  Save, 
  FileSpreadsheet, 
  ShieldAlert, 
  Info, 
  Sparkles,
  Lock,
  Unlock,
  Sliders,
  Filter,
  UserCheck,
  UserX,
  Phone,
  Calendar,
  User,
  Tags,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Settings,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Edit2,
  Activity,
  Clock,
  Mail,
  Key,
  Hash,
  MapPin,
  Briefcase,
  Eye,
  EyeOff,
  ArrowUpDown,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { RolePermissionRow, StaffMember } from '../../types/staff.types';
import { DEFAULT_STORE_ID, INITIAL_PERMISSION_ROWS, INITIAL_STAFF_MEMBERS } from '../../data';
import { ScrollArea } from '../../shared/components/scroll-area';
import {
  PRESET_VAI_TRO,
  PRESET_MODULES,
  ROLE_CODE,
  MODULE_CODE,
  getModuleMeta,
  getRoleFriendlyName,
  FILTER_ALL,
  DEFAULT_STAFF_ACCOUNT,
  DEFAULT_STAFF_FORM,
  DEFAULT_AVATAR,
  AVATAR_PRESETS,
  getDepartmentForRole,
  getPositionForRole,
} from '../../constants';
import { LOCAL_STORAGE_KEYS } from '../../constants';
import type { ModuleMetadata } from '../../constants';

interface StaffPermissionsViewProps {
  currentUser: {
    fullName: string;
    role: string;
    user: string;
  } | null;
}

interface SystemLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'SYNC' | 'RESET' | 'OTHER';
  target: string;
  details: string;
}

export default function StaffPermissionsView({ currentUser }: StaffPermissionsViewProps) {
  const activeStoreId = INITIAL_STAFF_MEMBERS[0]?.storeId ?? DEFAULT_STORE_ID;
  // 1. Tab State: 'staff' (Employees), 'permissions' (Security Grid), or 'logs' (Audit Logs)
  const [activeSubTab, setActiveSubTab] = useState<'staff' | 'permissions' | 'logs'>('staff');

  // Matrix and Role states for permissions
  const [matrixViewType, setMatrixViewType] = useState<'role-focus' | 'master-grid'>('role-focus');
  const [selectedRole, setSelectedRole] = useState<string>(ROLE_CODE.SALES);

  // Custom additions states
  const [newCustomRoleName, setNewCustomRoleName] = useState('');
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newCustomModuleName, setNewCustomModuleName] = useState('');
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);

  // Logs filters
  const [logTypeFilter, setLogTypeFilter] = useState(FILTER_ALL);
  const [logTargetFilter, setLogTargetFilter] = useState(FILTER_ALL);

  // System Logs State with realistic pre-populated log events
  const [logs, setLogs] = useState<SystemLog[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SYSTEM_LOGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing logs", e);
      }
    }
    return [
      {
        id: 'LOG-3091',
        timestamp: '2026-05-27T06:15:22.000Z',
        actor: 'Nguyá»…n Minh Äá»©c',
        role: 'Quáº£n lÃ½ showroom',
        actionType: 'UPDATE',
        target: 'NhÃ¢n sá»±',
        details: 'Cáº­p nháº­t tráº¡ng thÃ¡i hoáº¡t Ä‘á»™ng cá»§a nhÃ¢n viÃªn NV-003 (LÃª Thá»‹ Mai) thÃ nh Äang hoáº¡t Ä‘á»™ng.'
      },
      {
        id: 'LOG-4821',
        timestamp: '2026-05-27T05:40:10.000Z',
        actor: 'Nguyá»…n Minh Äá»©c',
        role: 'Quáº£n lÃ½ showroom',
        actionType: 'SYNC',
        target: 'Äá»“ng bá»™',
        details: 'Äá»“ng bá»™ cÆ¡ sá»› dá»¯ liá»‡u nhÃ¢n viÃªn & phÃ¢n quyá»n thÃ nh cÃ´ng vá»›i POS Google Sheets.'
      },
      {
        id: 'LOG-1294',
        timestamp: '2026-05-27T04:22:15.000Z',
        actor: 'Há»‡ thá»‘ng',
        role: 'QUAN_TRI_VIEN',
        actionType: 'CREATE',
        target: 'PhÃ¢n quyá»n',
        details: 'ThÃªm dÃ²ng quy táº¯c phÃ¢n quyá»n má»›i cho vai trÃ² KHO vá»›i module LOI_SOP (canView: true, canUpdate: true).'
      },
      {
        id: 'LOG-9104',
        timestamp: '2026-05-27T02:11:05.000Z',
        actor: 'Nguyá»…n Minh Äá»©c',
        role: 'Quáº£n lÃ½ showroom',
        actionType: 'UPDATE',
        target: 'NhÃ¢n sá»±',
        details: 'SÃ¡ch hÃ³a thÃ´ng tin nhÃ¢n viÃªn NV-005 (Tráº§n Thanh TÃ¹ng): sá»‘ Ä‘iá»‡n thoáº¡i má»›i 0987112233.'
      },
      {
        id: 'LOG-5527',
        timestamp: '2026-05-26T17:35:00.000Z',
        actor: 'Há»‡ thá»‘ng',
        role: 'QUAN_TRI_VIEN',
        actionType: 'RESET',
        target: 'Há»‡ thá»‘ng',
        details: 'KhÃ´i phá»¥c toÃ n bá»™ cáº¥u hÃ¬nh phÃ¢n quyá»n vÃ  nhÃ¢n sá»± máº«u vá» tráº¡ng thÃ¡i chuáº©n cá»§a cÃ´ng ty.'
      }
    ];
  });

  // Save logs to localStorage on changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.SYSTEM_LOGS, JSON.stringify(logs));
  }, [logs]);

  // Logger helper function
  const addLog = (actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'SYNC' | 'RESET' | 'OTHER', target: string, details: string) => {
    const newLog: SystemLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      actor: currentUser?.fullName || 'Nguyá»…n Minh Äá»©c',
      role: currentUser?.role || 'Quáº£n lÃ½ showroom',
      actionType,
      target,
      details
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // 2. Load and persist Permissions
  const [permissions, setPermissions] = useState<RolePermissionRow[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PERMISSIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing permissions", e);
      }
    }
    return INITIAL_PERMISSION_ROWS;
  });

  // 3. Load and persist Staff Members
  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.STAFF_MEMBERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing staff", e);
      }
    }
    return INITIAL_STAFF_MEMBERS;
  });

  // 4. Searching & Filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState(FILTER_ALL);
  const [statusFilter, setStatusFilter] = useState(FILTER_ALL);
  const [moduleFilter, setModuleFilter] = useState(FILTER_ALL);

  // Pagination & Loading States for Custom Tables
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10); // Default to 10 lines as per requested options (2/10/20/50/100)

  // 4B. Sorting States
  const [staffSort, setStaffSort] = useState<{ key: keyof StaffMember | null; order: 'asc' | 'desc' | null }>({ key: null, order: null });
  const [permSort, setPermSort] = useState<{ key: keyof RolePermissionRow | null; order: 'asc' | 'desc' | null }>({ key: null, order: null });
  const [logSort, setLogSort] = useState<{ key: string | null; order: 'asc' | 'desc' | null }>({ key: null, order: null });

  const handleSortStaff = (key: keyof StaffMember) => {
    setStaffSort(prev => {
      if (prev.key === key) {
        if (prev.order === 'asc') return { key, order: 'desc' };
        return { key: null, order: null };
      }
      return { key, order: 'asc' };
    });
  };

  const handleSortPerm = (key: keyof RolePermissionRow) => {
    setPermSort(prev => {
      if (prev.key === key) {
        if (prev.order === 'asc') return { key, order: 'desc' };
        return { key: null, order: null };
      }
      return { key, order: 'asc' };
    });
  };

  const handleSortLog = (key: string) => {
    setLogSort(prev => {
      if (prev.key === key) {
        if (prev.order === 'asc') return { key, order: 'desc' };
        return { key: null, order: null };
      }
      return { key, order: 'asc' };
    });
  };

  const renderSortIcon = (currentKey: string, activeSort: { key: string | null; order: 'asc' | 'desc' | null }) => {
    if (activeSort.key !== currentKey) {
      return <ArrowUpDown className="inline-block ml-1.5 w-3 h-3 opacity-40 hover:opacity-100 transition-opacity" />;
    }
    if (activeSort.order === 'asc') {
      return <ChevronUp className="inline-block ml-1.5 w-3 h-3 text-emerald-400 font-bold" />;
    }
    return <ChevronDown className="inline-block ml-1.5 w-3 h-3 text-emerald-400 font-bold" />;
  };

  // Reset page when category, search filters, or page size change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeSubTab, roleFilter, statusFilter, moduleFilter, logTypeFilter, logTargetFilter, searchTerm, itemsPerPage]);

  // Loading animation for smooth UX when tabs are switched
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [activeSubTab]);

  // simulated owner bypass
  const isActualOwner = currentUser?.user === 'admin' || currentUser?.role?.toLowerCase().includes('quáº£n lÃ½') || currentUser?.role?.toLowerCase().includes('admin');
  const [simulateOwnerMode, setSimulateOwnerMode] = useState(true);
  const hasWriteAccess = isActualOwner || simulateOwnerMode;

  // Save states
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PERMISSIONS, JSON.stringify(permissions));
  }, [permissions]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.STAFF_MEMBERS, JSON.stringify(staffList));
  }, [staffList]);

  // 5. Staff Form State
  const [showAddStaffForm, setShowAddStaffForm] = useState(false);
  const [staffForm, setStaffForm] = useState({
    ...DEFAULT_STAFF_FORM,
    joinedDate: new Date().toISOString().substring(0, 10),
  });

  // Edit Staff ID tracking (null if not editing)
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [dialogTab, setDialogTab] = useState<'editable' | 'readonly'>('readonly');
  const [showDialogPassword, setShowDialogPassword] = useState(false);

  // Elegant green/red toast states
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({
    show: false,
    msg: '',
    type: 'success'
  });

  const triggerToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, msg, type });
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // 6. Permission Form state
  const [showAddPermForm, setShowAddPermForm] = useState(false);
  const [newVaiTro, setNewVaiTro] = useState(ROLE_CODE.SALES as string);
  const [customVaiTro, setCustomVaiTro] = useState('');
  const [newModule, setNewModule] = useState(MODULE_CODE.CHECKLIST as string);
  const [customModule, setCustomModule] = useState('');
  const [newCanView, setNewCanView] = useState(true);
  const [newCanCreate, setNewCanCreate] = useState(false);
  const [newCanUpdate, setNewCanUpdate] = useState(false);
  const [newCanDelete, setNewCanDelete] = useState(false);
  const [newCanApprove, setNewCanApprove] = useState(false);

  // Sync state indication
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Handle staff toggle or action
  const handleToggleStaffStatus = (id: string) => {
    if (!hasWriteAccess) return;
    setStaffList(prev => prev.map(staff => {
      if (staff.id === id) {
        const nextStatus = staff.status === 'active' ? 'inactive' : 'active';
        addLog('UPDATE', 'NhÃ¢n sá»±', `Cáº­p nháº­t tráº¡ng thÃ¡i nhÃ¢n viÃªn ${staff.fullName} (${staff.id}) sang ${nextStatus === 'active' ? 'ðŸŸ¢ Hoáº¡t Äá»™ng' : 'ðŸ”´ Ngá»«ng Hoáº¡t Äá»™ng'}.`);
        return {
          ...staff,
          status: nextStatus
        };
      }
      return staff;
    }));
  };

  // Delete staff
  const handleDeleteStaff = (id: string) => {
    if (!hasWriteAccess) return;
    const targetStaff = staffList.find(s => s.id === id);
    if (window.confirm('Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a nhÃ¢n viÃªn nÃ y khá»i há»‡ thá»‘ng?')) {
      setStaffList(prev => prev.filter(staff => staff.id !== id));
      if (editingStaffId === id) setEditingStaffId(null);
      if (targetStaff) {
        addLog('DELETE', 'NhÃ¢n sá»±', `XÃ³a vÄ©nh viá»…n tÃ i khoáº£n nhÃ¢n sá»±: ${targetStaff.fullName} (${targetStaff.id}) khá»i chi nhÃ¡nh.`);
      }
    }
  };

  // Add staff Action
  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasWriteAccess) {
      triggerToast('PhiÃªn lÃ m viá»‡c hiá»‡n táº¡i khÃ´ng cÃ³ tháº©m quyá»n chá»‰nh sá»­a há»‡ thá»‘ng!', 'error');
      return;
    }

    if (!staffForm.fullName.trim() || !staffForm.username.trim()) {
      triggerToast('Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ Há» tÃªn vÃ  TÃªn Ä‘Äƒng nháº­p!', 'error');
      return;
    }

    if (editingStaffId) {
      // Perform update instead of create
      setStaffList(prev => prev.map(s => {
        if (s.id === editingStaffId) {
          addLog('UPDATE', 'NhÃ¢n sá»±', `Sá»­a chi tiáº¿t thÃ´ng tin nhÃ¢n viÃªn ${s.fullName} (${s.id}) - Chá»©c vá»¥: ${staffForm.role}, Phone: ${staffForm.phone}.`);
          return {
            ...s,
            fullName: staffForm.fullName,
            role: staffForm.role,
            username: staffForm.username,
            phone: staffForm.phone,
            status: staffForm.status,
            joinedDate: staffForm.joinedDate
          };
        }
        return s;
      }));
      setEditingStaffId(null);
    } else {
      // Create new
      const maxNumericId = staffList.reduce((max, s) => {
        const match = s.id.match(/NV-(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          return num > max ? num : max;
        }
        return max;
      }, 0);
      const nextId = `NV-${String(maxNumericId + 1).padStart(3, '0')}`;

      const newStaff: StaffMember = {
        id: nextId,
        storeId: activeStoreId,
        fullName: staffForm.fullName,
        role: staffForm.role,
        username: staffForm.username,
        phone: staffForm.phone,
        status: staffForm.status,
        joinedDate: staffForm.joinedDate,
        email: staffForm.email || `${staffForm.username}@mrtaocoop.com`,
        password: staffForm.password || DEFAULT_STAFF_ACCOUNT.password,
        pin: staffForm.pin || DEFAULT_STAFF_ACCOUNT.pin,
        department: staffForm.department || getDepartmentForRole(staffForm.role),
        position: staffForm.position || getPositionForRole(staffForm.role),
        employeeCode: staffForm.employeeCode || nextId.replace('NV-', 'MNS-'),
        avatar: staffForm.avatar || DEFAULT_AVATAR
      };
      setStaffList(prev => [...prev, newStaff]);
      addLog('CREATE', 'NhÃ¢n sá»±', `ThÃªm nhÃ¢n sá»± má»›i thÃ nh cÃ´ng: ${newStaff.fullName} (${newStaff.id}) - Vai trÃ²: ${newStaff.role}.`);
    }

    // Reset Form
    setStaffForm({
      ...DEFAULT_STAFF_FORM,
      joinedDate: new Date().toISOString().substring(0, 10),
    });
    setShowAddStaffForm(false);
  };

  const handleEditStaffClick = (staff: StaffMember) => {
    setEditingStaffId(staff.id);
    setDialogTab('editable');
    setShowDialogPassword(false);
    setStaffForm({
      fullName: staff.fullName,
      role: staff.role,
      username: staff.username,
      phone: staff.phone,
      status: staff.status,
      joinedDate: staff.joinedDate,
      email: staff.email || `${staff.username}@mrtaocoop.com`,
      password: staff.password || DEFAULT_STAFF_ACCOUNT.password,
      pin: staff.pin || DEFAULT_STAFF_ACCOUNT.pin,
      department: staff.department || getDepartmentForRole(staff.role),
      position: staff.position || getPositionForRole(staff.role),
      employeeCode: staff.employeeCode || staff.id.replace('NV-', 'MNS-'),
      avatar: staff.avatar || DEFAULT_AVATAR
    });
  };

  const handleEditStaffSave = () => {
    if (!staffForm.fullName.trim()) return;
    setStaffList(prev => prev.map(s => {
      if (s.id === editingStaffId) {
        addLog('UPDATE', 'NhÃ¢n sá»±', `Cáº­p nháº­t há»“ sÆ¡ tÃ i khoáº£n nhÃ¢n viÃªn ${staffForm.fullName} (${s.id}) báº±ng Dialog.`);
        return {
          ...s,
          fullName: staffForm.fullName,
          phone: staffForm.phone,
          email: staffForm.email,
          password: staffForm.password,
          pin: staffForm.pin,
          avatar: staffForm.avatar
        };
      }
      return s;
    }));
    setEditingStaffId(null);
  };

  // Permissions control
  const handleTogglePermValue = (id: string, field: keyof Omit<RolePermissionRow, 'id' | 'roleCode' | 'module'>) => {
    if (!hasWriteAccess) return;
    setPermissions(prev => prev.map(row => {
      if (row.id === id) {
        const nextVal = !row[field];
        addLog('UPDATE', 'PhÃ¢n quyá»n', `Cáº­p nháº­t phÃ¢n quyá»n [${row.id}] - Vai trÃ² ${row.roleCode}, Module ${row.module}: Äá»•i '${field}' sang ${nextVal ? 'Cho phÃ©p (Báº¬T)' : 'KhÃ³a (Táº®T)'}.`);
        return { ...row, [field]: nextVal };
      }
      return row;
    }));
  };

  const handleDeletePermRow = (id: string) => {
    if (!hasWriteAccess) return;
    const targetPerm = permissions.find(p => p.id === id);
    if (window.confirm('XÃ³a quy táº¯c phÃ¢n quyá»n Ä‘Ã£ chá»n?')) {
      setPermissions(prev => prev.filter(row => row.id !== id));
      if (targetPerm) {
        addLog('DELETE', 'PhÃ¢n quyá»n', `XÃ³a dÃ²ng quy táº¯c ma tráº­n phÃ¢n quyá»n mÃ£ sá»‘ ${targetPerm.id} cá»§a vai trÃ² ${targetPerm.roleCode} trÃªn phÃ¢n há»‡ ${targetPerm.module}.`);
      }
    }
  };

  const handleAddPermissionRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasWriteAccess) return;

    const finalRole = newVaiTro === 'CUSTOM' ? (customVaiTro.trim().toUpperCase() || 'CUSTOM_ROLE') : newVaiTro;
    const finalModule = newModule === 'CUSTOM' ? (customModule.trim().toUpperCase() || 'CUSTOM_MODULE') : newModule;

    const maxNumericId = permissions.reduce((max, row) => {
      const match = row.id.match(/PQ-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    const nextId = `PQ-${String(maxNumericId + 1).padStart(3, '0')}`;

    const newRule: RolePermissionRow = {
      id: nextId,
      storeId: activeStoreId,
      roleCode: finalRole,
      module: finalModule,
      canView: newCanView,
      canCreate: newCanCreate,
      canUpdate: newCanUpdate,
      canDelete: newCanDelete,
      canApprove: newCanApprove
    };

    setPermissions(prev => [...prev, newRule]);
    addLog('CREATE', 'PhÃ¢n quyá»n', `Khai bÃ¡o thÃ nh láº­p quy táº¯c phÃ¢n quyá»n má»›i [${newRule.id}] cho vai trÃ² ${newRule.roleCode} trÃªn Module ${newRule.module}.`);
    setCustomVaiTro('');
    setCustomModule('');
    setNewCanView(true);
    setNewCanCreate(false);
    setNewCanUpdate(false);
    setNewCanDelete(false);
    setNewCanApprove(false);
    setShowAddPermForm(false);
  };

  const handleSyncDatabase = () => {
    setSaveStatus('saving');
    addLog('SYNC', 'Äá»“ng bá»™', 'YÃªu cáº§u Ä‘á»“ng bá»™ toÃ n thá»ƒ tÃ i nguyÃªn nhÃ¢n sá»± vÃ  ma tráº­n báº£o máº­t lÃªn POS Cloud Sheets.');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2500);
    }, 1200);
  };

  const handleResetToStandard = () => {
    if (!hasWriteAccess) return;
    if (window.confirm('Táº£i láº¡i dá»¯ liá»‡u máº«u Cháº¥m cÃ´ng & PhÃ¢n quyá»n theo chuáº©n ban Ä‘áº§u?')) {
      setStaffList(INITIAL_STAFF_MEMBERS);
      setPermissions(INITIAL_PERMISSION_ROWS);
      setEditingStaffId(null);
      setShowAddStaffForm(false);
      setShowAddPermForm(false);
      addLog('RESET', 'Há»‡ thá»‘ng', 'KhÃ´i phá»¥c thÃ´ng sá»‘ phÃ¢n quyá»n vÃ  lÆ°u danh nhÃ¢n sá»± chi nhÃ¡nh chiá»ƒu theo tráº¡ng thÃ¡i máº·c Ä‘á»‹nh cá»§a tá»•ng cÃ´ng ty.');
    }
  };

  const handleClearLogs = () => {
    if (!hasWriteAccess) return;
    if (window.confirm('Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a toÃ n bá»™ lá»‹ch sá»­ log há»‡ thá»‘ng?')) {
      setLogs([]);
      addLog('DELETE', 'Há»‡ thá»‘ng', 'Lá»‹ch sá»­ nháº­t kÃ½ há»‡ thá»‘ng (System logs) Ä‘Ã£ bá»‹ xÃ³a sáº¡ch.');
    }
  };

  // Derived active roles and modules list
  const activeRolesList = React.useMemo(() => {
    const fromPerms = permissions.map(p => p.roleCode);
    const combined = Array.from(new Set([...PRESET_VAI_TRO, ...fromPerms]));
    return combined;
  }, [permissions]);

  const activeModulesList = React.useMemo(() => {
    const fromPerms = permissions.map(p => p.module);
    const combined = Array.from(new Set([...PRESET_MODULES, ...fromPerms]));
    return combined;
  }, [permissions]);

  const handleTogglePermission = (role: string, moduleKey: string, field: 'canView' | 'canCreate' | 'canUpdate' | 'canDelete' | 'canApprove') => {
    if (!hasWriteAccess) {
      triggerToast('PhiÃªn lÃ m viá»‡c hiá»‡n táº¡i khÃ´ng cÃ³ tháº©m quyá»n chá»‰nh sá»­a há»‡ thá»‘ng!', 'error');
      return;
    }
    
    let isSuccess = false;
    setPermissions(prev => {
      const existingIdx = prev.findIndex(p => p.roleCode === role && p.module === moduleKey);
      if (existingIdx !== -1) {
        const updated = [...prev];
        const target = updated[existingIdx];
        const newVal = !target[field];
        updated[existingIdx] = {
          ...target,
          [field]: newVal
        };
        addLog('UPDATE', 'PhÃ¢n quyá»n', `Cáº­p nháº­t phÃ¢n quyá»n [${role}]: [${moduleKey}] thay Ä‘á»•i '${field}' thÃ nh ${newVal ? 'Báº¬T' : 'Táº®T'}.`);
        isSuccess = true;
        return updated;
      } else {
        const newRowId = `PQ-${Math.floor(1000 + Math.random() * 9000)}`;
        const newRow = {
          id: newRowId,
          storeId: activeStoreId,
          roleCode: role,
          module: moduleKey,
          canView: false,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canApprove: false,
          [field]: true
        };
        addLog('CREATE', 'PhÃ¢n quyá»n', `Khá»Ÿi táº¡o phÃ¢n quyá»n [${role}]: [${moduleKey}] vá»›i Ä‘áº·c quyá»n '${field}' Ä‘Æ°á»£c Báº¬T.`);
        isSuccess = true;
        return [...prev, newRow];
      }
    });

    triggerToast(`ÄÃ£ lÆ°u cáº¥u hÃ¬nh quyá»n cá»§a ${getRoleFriendlyName(role)} trÃªn phÃ¢n há»‡ ${getModuleMeta(moduleKey).name}!`, 'success');
  };

  const handleToggleAllForModule = (role: string, moduleKey: string, enableAll: boolean) => {
    if (!hasWriteAccess) {
      triggerToast('PhiÃªn lÃ m viá»‡c hiá»‡n táº¡i khÃ´ng cÃ³ tháº©m quyá»n chá»‰nh sá»­a há»‡ thá»‘ng!', 'error');
      return;
    }
    
    setPermissions(prev => {
      const existing = prev.find(p => p.roleCode === role && p.module === moduleKey);
      if (existing) {
        return prev.map(p => {
          if (p.roleCode === role && p.module === moduleKey) {
            return {
              ...p,
              canView: enableAll,
              canCreate: enableAll,
              canUpdate: enableAll,
              canDelete: enableAll,
              canApprove: enableAll,
            };
          }
          return p;
        });
      } else {
        const newRowId = `PQ-${Math.floor(1000 + Math.random() * 9000)}`;
        const newRow = {
          id: newRowId,
          storeId: activeStoreId,
          roleCode: role,
          module: moduleKey,
          canView: enableAll,
          canCreate: enableAll,
          canUpdate: enableAll,
          canDelete: enableAll,
          canApprove: enableAll,
        };
        return [...prev, newRow];
      }
    });
    addLog('UPDATE', 'PhÃ¢n quyá»n', `Cáº­p nháº­t toÃ n bá»™ quyá»n phÃ¢n há»‡ ${moduleKey} cho [${role}] thÃ nh: ${enableAll ? 'KÃCH HOáº T Háº¾T' : 'THU Há»’I Háº¾T'}.`);
    triggerToast(enableAll ? `KÃ­ch hoáº¡t toÃ n quyá»n ${getModuleMeta(moduleKey).name} cho ${getRoleFriendlyName(role)} thÃ nh cÃ´ng!` : `ÄÃ£ thu há»“i toÃ n bá»™ quyá»n ${getModuleMeta(moduleKey).name} cá»§a ${getRoleFriendlyName(role)}!`, 'success');
  };

  const handleToggleAllForRole = (role: string, enableAll: boolean) => {
    if (!hasWriteAccess) {
      triggerToast('PhiÃªn lÃ m viá»‡c hiá»‡n táº¡i khÃ´ng cÃ³ tháº©m quyá»n chá»‰nh sá»­a há»‡ thá»‘ng!', 'error');
      return;
    }
    
    setPermissions(prev => {
      const copy = [...prev];
      activeModulesList.forEach(mKey => {
        const idx = copy.findIndex(p => p.roleCode === role && p.module === mKey);
        if (idx !== -1) {
          copy[idx] = {
            ...copy[idx],
            canView: enableAll,
            canCreate: enableAll,
            canUpdate: enableAll,
            canDelete: enableAll,
            canApprove: enableAll,
          };
        } else {
          const newRowId = `PQ-${Math.floor(1000 + Math.random() * 9000)}`;
          copy.push({
            id: newRowId,
            storeId: activeStoreId,
            roleCode: role,
            module: mKey,
            canView: enableAll,
            canCreate: enableAll,
            canUpdate: enableAll,
            canDelete: enableAll,
            canApprove: enableAll,
          });
        }
      });
      return copy;
    });
    addLog('UPDATE', 'PhÃ¢n quyá»n', `Cáº­p nháº­t toÃ n quyá»n táº¥t cáº£ phÃ¢n há»‡ cá»§a vai trÃ² [${role}] thÃ nh: ${enableAll ? 'KÃCH HOáº T Háº¾T' : 'THU Há»’I Háº¾T'}.`);
    triggerToast(enableAll ? `KÃ­ch hoáº¡t toÃ n quyá»n hoáº¡t Ä‘á»™ng há»‡ thá»‘ng cho ${getRoleFriendlyName(role)}!` : `ÄÃ£ thu há»“i toÃ n bá»™ quyá»n cá»§a ${getRoleFriendlyName(role)}!`, 'success');
  };

  const handleCreateCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    const rawRole = newCustomRoleName.trim().toUpperCase().replace(/\s+/g, '_');
    if (!rawRole) return;
    
    if (activeRolesList.includes(rawRole)) {
      triggerToast('Vai trÃ² nÃ y Ä‘Ã£ tá»“n táº¡i trÃªn showroom!', 'error');
      return;
    }

    const newRowId = `PQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRow = {
      id: newRowId,
      storeId: activeStoreId,
      roleCode: rawRole,
      module: 'HOM_NAY',
      canView: false,
      canCreate: false,
      canUpdate: false,
      canDelete: false,
      canApprove: false
    };
    
    setPermissions(prev => [...prev, newRow]);
    setSelectedRole(rawRole);
    setNewCustomRoleName('');
    setShowAddRoleModal(false);
    addLog('CREATE', 'PhÃ¢n quyá»n', `Khai bÃ¡o thÃ nh cÃ´ng vai trÃ² báº£o máº­t chi nhÃ¡nh má»›i: ${rawRole}.`);
    triggerToast(`ÄÃ£ ghi nháº­n vai trÃ² má»›i: ${rawRole} vÃ o ma tráº­n quyá»n!`, 'success');
  };

  const handleCreateCustomModule = (e: React.FormEvent) => {
    e.preventDefault();
    const rawModule = newCustomModuleName.trim().toUpperCase().replace(/\s+/g, '_');
    if (!rawModule) return;
    
    if (activeModulesList.includes(rawModule)) {
      triggerToast('PhÃ¢n há»‡ nÃ y Ä‘Ã£ tá»“n táº¡i trÃªn danh má»¥c!', 'error');
      return;
    }

    const newRowId = `PQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRow = {
      id: newRowId,
      storeId: activeStoreId,
      roleCode: 'CHU_CUA_HANG',
      module: rawModule,
      canView: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
      canApprove: true
    };
    
    setPermissions(prev => [...prev, newRow]);
    setNewCustomModuleName('');
    setShowAddModuleModal(false);
    addLog('CREATE', 'PhÃ¢n quyá»n', `XÃ¢y dá»±ng thÃ nh cÃ´ng phÃ¢n há»‡ chá»©c nÄƒng má»›i trÃªn báº£n Ä‘á»“ Ä‘áº·c quyá»n: ${rawModule}.`);
    triggerToast(`ÄÃ£ xuáº¥t báº£n phÃ¢n há»‡ nghiá»‡p vá»¥ má»›i: ${rawModule}!`, 'success');
  };

  // Filter staff entries
  const filteredStaff = staffList.filter(s => {
    const roleMatch = roleFilter === FILTER_ALL || s.role === roleFilter;
    const statusMatch = statusFilter === FILTER_ALL || s.status === statusFilter;
    const searchLow = searchTerm.toLowerCase();
    const searchMatch = !searchTerm || 
      s.fullName.toLowerCase().includes(searchLow) ||
      s.id.toLowerCase().includes(searchLow) ||
      s.username.toLowerCase().includes(searchLow) ||
      s.phone.includes(searchLow);

    return roleMatch && statusMatch && searchMatch;
  });

  // Filter permission rules
  const filteredPermissions = permissions.filter(row => {
    const roleMatch = roleFilter === FILTER_ALL || row.roleCode === roleFilter;
    const modMatch = moduleFilter === FILTER_ALL || row.module === moduleFilter;
    const searchLow = searchTerm.toLowerCase();
    const searchMatch = !searchTerm || 
      row.id.toLowerCase().includes(searchLow) ||
      row.roleCode.toLowerCase().includes(searchLow) ||
      row.module.toLowerCase().includes(searchLow);

    return roleMatch && modMatch && searchMatch;
  });

  // Filter security/system logs
  const filteredLogs = logs.filter(log => {
    const typeMatch = logTypeFilter === FILTER_ALL || log.actionType === logTypeFilter;
    const targetMatch = logTargetFilter === FILTER_ALL || log.target === logTargetFilter;
    const searchLow = searchTerm.toLowerCase();
    const searchMatch = !searchTerm ||
      log.actor.toLowerCase().includes(searchLow) ||
      log.target.toLowerCase().includes(searchLow) ||
      log.actionType.toLowerCase().includes(searchLow) ||
      log.details.toLowerCase().includes(searchLow);

    return typeMatch && targetMatch && searchMatch;
  });

  // Sort staff entries
  const sortedStaff = React.useMemo(() => {
    if (!staffSort.key || !staffSort.order) return filteredStaff;
    return [...filteredStaff].sort((a, b) => {
      const key = staffSort.key!;
      const aVal = a[key] ?? '';
      const bVal = b[key] ?? '';

      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal, 'vi', { sensitivity: 'base' });
      } else {
        comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      }
      return staffSort.order === 'asc' ? comparison : -comparison;
    });
  }, [filteredStaff, staffSort]);

  // Sort permission rules
  const sortedPermissions = React.useMemo(() => {
    if (!permSort.key || !permSort.order) return filteredPermissions;
    return [...filteredPermissions].sort((a, b) => {
      const key = permSort.key!;
      const aVal = a[key];
      const bVal = b[key];

      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal, 'vi', { sensitivity: 'base' });
      } else if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        comparison = (aVal ? 1 : 0) - (bVal ? 1 : 0);
      } else {
        comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      }
      return permSort.order === 'asc' ? comparison : -comparison;
    });
  }, [filteredPermissions, permSort]);

  // Sort security/system logs
  const sortedLogs = React.useMemo(() => {
    if (!logSort.key || !logSort.order) return filteredLogs;
    return [...filteredLogs].sort((a, b) => {
      const key = logSort.key!;
      const aVal = (a as any)[key] ?? '';
      const bVal = (b as any)[key] ?? '';

      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        if (key === 'timestamp') {
          comparison = new Date(aVal).getTime() - new Date(bVal).getTime();
        } else {
          comparison = aVal.localeCompare(bVal, 'vi', { sensitivity: 'base' });
        }
      } else {
        comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      }
      return logSort.order === 'asc' ? comparison : -comparison;
    });
  }, [filteredLogs, logSort]);

  // Slice calculations for all three subtabs
  const totalStaffItems = filteredStaff.length;
  const totalStaffPages = Math.ceil(totalStaffItems / itemsPerPage) || 1;
  const paginatedStaff = sortedStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPermItems = filteredPermissions.length;
  const totalPermPages = Math.ceil(totalPermItems / itemsPerPage) || 1;
  const paginatedPermissions = sortedPermissions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalLogItems = filteredLogs.length;
  const totalLogPages = Math.ceil(totalLogItems / itemsPerPage) || 1;
  const paginatedLogs = sortedLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reusable pagination helper
  const renderPagination = (totalPages: number) => {
    const activeColorClass = 
      activeSubTab === 'staff' 
        ? 'bg-[#107c41] text-white hover:bg-[#0c6232] shadow-sm shadow-emerald-500/10' 
        : activeSubTab === 'permissions'
          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/10'
          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-500/10';

    const selectFocusRingClass =
      activeSubTab === 'staff'
        ? 'focus:ring-[#107c41]'
        : activeSubTab === 'permissions'
          ? 'focus:ring-blue-500'
          : 'focus:ring-indigo-500';

    const displayTotalPages = totalPages || 1;

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50/30 border-t border-slate-100 select-none">
        {/* Bottom-left: Dynamic page size selector and indexing */}
        <div className="flex flex-wrap items-center gap-3 justify-start">
          <span className="text-[10px] font-black text-slate-400 font-mono uppercase tracking-wider block font-bold">
            TRANG {currentPage} / {displayTotalPages}
          </span>
          <span className="text-slate-250 hidden sm:inline text-xs">|</span>
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] uppercase font-black text-slate-400 tracking-wider font-sans font-bold">
              Hiá»ƒn thá»‹:
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                setItemsPerPage(newSize);
                setCurrentPage(1);
              }}
              className={`text-[11px] font-mono font-bold bg-white border border-slate-150 text-slate-600 px-2.5 py-1 rounded-lg shadow-2xs focus:ring-1 ${selectFocusRingClass} focus:outline-none cursor-pointer transition-all hover:border-slate-300`}
            >
              {[2, 10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} dÃ²ng / trang
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bottom-right: Pager buttons, properly aligned layout */}
        <div className="flex justify-end items-center">
          <Pagination className="w-auto m-0">
            <PaginationContent className="flex items-center gap-1.5">
              <PaginationItem>
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all select-none hover:bg-slate-50 border border-slate-150 bg-white shadow-3xs text-slate-500 ${
                    currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:scale-95'
                  }`}
                >
                  TrÆ°á»›c
                </button>
              </PaginationItem>
              
              {Array.from({ length: displayTotalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isFar = displayTotalPages > 5 && Math.abs(currentPage - pageNum) > 1 && pageNum !== 1 && pageNum !== displayTotalPages;
                if (isFar) {
                  if (pageNum === 2 || pageNum === displayTotalPages - 1) {
                    return (
                      <PaginationItem key={pageNum}>
                        <span className="px-1 text-slate-350 text-xs font-bold leading-none select-none">...</span>
                      </PaginationItem>
                    );
                  }
                  return null;
                }
                return (
                  <PaginationItem key={pageNum}>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`text-[11px] h-7 min-w-7 p-0 flex items-center justify-center font-bold font-mono rounded-lg transition-all cursor-pointer select-none ${
                        currentPage === pageNum 
                          ? activeColorClass 
                          : 'hover:bg-slate-50 text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {pageNum}
                    </button>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, displayTotalPages))}
                  disabled={currentPage === displayTotalPages}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all select-none hover:bg-slate-50 border border-slate-150 bg-white shadow-3xs text-slate-500 ${
                    currentPage === displayTotalPages ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer active:scale-95'
                  }`}
                >
                  Tiáº¿p
                </button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    );
  };

  const distinctRoles = Array.from(new Set(permissions.map(p => p.roleCode)));
  const distinctModules = Array.from(new Set(permissions.map(p => p.module)));

  // Analytics
  const activeStaffCount = staffList.filter(s => s.status === 'active').length;
  const inactiveStaffCount = staffList.length - activeStaffCount;

  return (
    <div className="space-y-3.5 font-sans">
      {/* 1. MASTER HERO TITLE */}
      <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 transition-all relative overflow-hidden text-left">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-center gap-3.5 relative z-10 text-left">
          <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-[#107c41] border border-emerald-100 shrink-0 shadow-sm">
            <Users className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9.5px] font-bold text-[#107c41] bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[#107c41] animate-pulse"></span>
                ERP Há»£p Nháº¥t SOP
              </span>
              <span className="text-[9.5px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                STAFF_PERMS_V2
              </span>
            </div>
            <h1 className="text-lg font-extrabold text-slate-800 tracking-tight mt-0.5">Há»“ SÆ¡ NhÃ¢n Sá»± &amp; PhÃ¢n Quyá»n</h1>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 font-sans">Kho lÆ°u trá»¯ káº¿t ná»‘i thÃ nh viÃªn showroom vá»›i báº£ng chÃ­nh sÃ¡ch Ä‘áº·c quyá»n báº£o máº­t Mr. TÃ¡o</p>
          </div>
        </div>
      </div>

      {/* 3. CONSOLIDATED SPREADSHEET CARD */}
      <div className="bg-white rounded-2xl border border-slate-150 shadow-md relative overflow-hidden transition-all flex flex-col">
        {/* CLEARLY SPLIT DUAL TABS HEADER WITH ACTION BUTTON TO THE RIGHT */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-slate-50 border-b border-slate-200 p-2.5 gap-3">
          <div className="flex bg-slate-200/50 p-1 rounded-xl self-start flex-wrap gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveSubTab('staff');
                setSearchTerm('');
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all tracking-wider cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'staff'
                  ? 'bg-white text-[#107c41] shadow-xs border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <Users className={`w-3.5 h-3.5 ${activeSubTab === 'staff' ? 'text-[#107c41]' : 'text-slate-400'}`} />
              <span>Quáº£n LÃ½ NhÃ¢n Sá»± ({staffList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSubTab('permissions');
                setSearchTerm('');
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all tracking-wider cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'permissions'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <Shield className={`w-3.5 h-3.5 ${activeSubTab === 'permissions' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Ma Tráº­n PhÃ¢n Quyá»n ({permissions.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSubTab('logs');
                setSearchTerm('');
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all tracking-wider cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'logs'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <Activity className={`w-3.5 h-3.5 ${activeSubTab === 'logs' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>Ghi log há»‡ thá»‘ng ({logs.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center pr-1">
            {activeSubTab === 'staff' ? (
              <button
                type="button"
                onClick={() => {
                  setEditingStaffId(null);
                  setStaffForm({
                    fullName: '',
                    role: 'SALES',
                    username: '',
                    phone: '',
                    status: 'active',
                    joinedDate: new Date().toISOString().substring(0, 10)
                  });
                  setShowAddStaffForm(!showAddStaffForm);
                }}
                disabled={!hasWriteAccess}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer ${
                  showAddStaffForm && !editingStaffId
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs' 
                    : 'bg-[#107c41] hover:bg-[#0c6232] text-white shadow-xs'
                }`}
              >
                {showAddStaffForm && !editingStaffId ? (
                  <>
                     <X className="w-3.5 h-3.5" />
                     <span>Lá»›p Ä‘Ã³ng Form</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>ThÃªm nhÃ¢n sá»± má»›i</span>
                  </>
                )}
              </button>
            ) : activeSubTab === 'permissions' ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRoleModal(true)}
                  disabled={!hasWriteAccess}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer bg-white"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2]" />
                  <span>+ Vai trÃ² má»›i</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModuleModal(true)}
                  disabled={!hasWriteAccess}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer bg-white"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2]" />
                  <span>+ PhÃ¢n há»‡ má»›i</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleClearLogs}
                disabled={!hasWriteAccess || logs.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 disabled:opacity-40 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>XÃ³a sáº¡ch nháº­t kÃ½</span>
              </button>
            )}
          </div>
        </div>

        {/* ELEGANT LIGHT FILTERS CONTAINER ABOVE TABLE */}
        <div className="bg-slate-50/40 p-4 border-b border-slate-200 text-left space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder={
                  activeSubTab === 'staff' 
                    ? "TÃ¬m theo tÃªn, ID, ÄT, tÃªn Ä‘Äƒng nháº­p..." 
                    : activeSubTab === 'permissions'
                      ? "TÃ¬m theo ID vai trÃ², module..."
                      : "TÃ¬m theo tÃªn ngÆ°á»i thá»±c hiá»‡n, phÃ¢n loáº¡i log hoáº·c ná»™i dung..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#107c41] focus:border-[#107c41] pl-9 pr-4 py-2 rounded-xl text-[11.5px] font-bold text-slate-700 placeholder-slate-400 shadow-xs transition-all text-left"
              />
            </div>

            {/* Dynamic Role / LogType Selector */}
            <div className="sm:col-span-3 text-left">
              {activeSubTab === 'logs' ? (
                <select
                  value={logTypeFilter}
                  onChange={(e) => setLogTypeFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600 rounded-xl px-2.5 py-2 text-xs font-bold text-indigo-700 shadow-xs"
                >
                  <option value="ALL">Táº¥t cáº£ hÃ nh Ä‘á»™ng</option>
                  <option value="CREATE">ðŸŸ¢ THÃŠM Má»šI (CREATE)</option>
                  <option value="UPDATE">ðŸ”µ Sá»¬A Äá»”I (UPDATE)</option>
                  <option value="DELETE">ðŸ”´ XÃ“A Bá»Ž (DELETE)</option>
                  <option value="SYNC">ðŸŸ  Äá»’NG Bá»˜ (SYNC)</option>
                  <option value="RESET">âš« KHÃ”I PHá»¤C (RESET)</option>
                </select>
              ) : (
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#107c41] rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 shadow-xs"
                >
                  <option value="ALL">Táº¥t cáº£ vai trÃ²</option>
                  <option value="CHU_CUA_HANG">ðŸ‘‘ Chá»§ cá»­a hÃ ng (Owner)</option>
                  <option value="QUAN_LY">ðŸ‘” Quáº£n lÃ½</option>
                  <option value="SALES">ðŸ‘¥ NhÃ¢n viÃªn Sales</option>
                  <option value="KHO">ðŸ“¦ NhÃ¢n viÃªn Kho</option>
                  <option value="CSKH">ðŸ’¬ NhÃ¢n viÃªn CSKH</option>
                  <option value="QUAN_TRI_VIEN">âš™ï¸ Quáº£n trá»‹ viÃªn</option>
                </select>
              )}
            </div>

            {/* Dynamic Selector 2 (Status / Module / LogTarget) */}
            <div className="sm:col-span-3 text-left">
              {activeSubTab === 'staff' ? (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#107c41] rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 shadow-xs"
                >
                  <option value="ALL">Táº¥t cáº£ Tráº¡ng thÃ¡i</option>
                  <option value="active">ðŸŸ¢ Äang hoáº¡t Ä‘á»™ng</option>
                  <option value="inactive">ðŸ”´ Ngá»«ng hoáº¡t Ä‘á»™ng</option>
                </select>
              ) : activeSubTab === 'permissions' ? (
                <select
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 shadow-xs"
                >
                  <option value="ALL">Táº¥t cáº£ module</option>
                  {distinctModules.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              ) : (
                <select
                  value={logTargetFilter}
                  onChange={(e) => setLogTargetFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600 rounded-xl px-2.5 py-2 text-xs font-bold text-indigo-700 shadow-xs"
                >
                  <option value="ALL">PhÃ¢n loáº¡i Ä‘á»‘i tÆ°á»£ng</option>
                  <option value="NhÃ¢n sá»±">ðŸ‘¤ Táº­p tin NhÃ¢n sá»±</option>
                  <option value="PhÃ¢n quyá»n">ðŸ›¡ï¸ Ma tráº­n PhÃ¢n quyá»n</option>
                  <option value="Äá»“ng bá»™">ðŸ”„ Tiáº¿n trÃ¬nh Äá»“ng bá»™</option>
                  <option value="Há»‡ thá»‘ng">âš™ï¸ Tham sá»‘ Há»‡ thá»‘ng</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* 4. EXPANDABLE ADD/EDIT STAFF FORM inside card */}
        {showAddStaffForm && activeSubTab === 'staff' && hasWriteAccess && (
          <div className="mx-4 my-3 bg-emerald-50/10 border border-emerald-100 p-4.5 rounded-xl text-left">
            <form onSubmit={handleAddStaffSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                <span className="text-xs font-extrabold text-[#107c41] uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  {editingStaffId ? `Chá»‰nh sá»­a há»“ sÆ¡ NhÃ¢n sá»± [ID: ${editingStaffId}]` : 'Khai bÃ¡o há»“ sÆ¡ NhÃ¢n sá»± Showroom má»›i'}
                </span>
                {editingStaffId && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingStaffId(null);
                      setShowAddStaffForm(false);
                    }} 
                    className="text-[11px] font-bold text-rose-500 hover:underline"
                  >
                    Há»§y cháº¿ Ä‘á»™ sá»­a
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Há» vÃ  TÃªn</label>
                  <input 
                    type="text"
                    required
                    placeholder="VÃ­ dá»¥: HoÃ ng VÄƒn Linh"
                    value={staffForm.fullName}
                    onChange={(e) => setStaffForm({...staffForm, fullName: e.target.value})}
                    className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-855 focus:outline-none focus:ring-1 focus:ring-emerald-555"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">TÃªn ÄÄƒng Nháº­p</label>
                  <input 
                    type="text"
                    required
                    disabled={!!editingStaffId}
                    placeholder="VÃ­ dá»¥: linhv, sales_hn"
                    value={staffForm.username}
                    onChange={(e) => setStaffForm({...staffForm, username: e.target.value.toLowerCase().replace(/\s+/g, '')})}
                    className="w-full bg-white disabled:bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-855 focus:outline-none focus:ring-1 focus:ring-emerald-555"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Vai trÃ² nghiá»‡p vá»¥</label>
                  <select
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({...staffForm, role: e.target.value})}
                    className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-855 focus:outline-none focus:ring-1 focus:ring-emerald-555"
                  >
                    <option value="CHU_CUA_HANG">ðŸ‘‘ Chá»§ cá»­a hÃ ng (Owner)</option>
                    <option value="QUAN_LY">ðŸ‘” Quáº£n lÃ½ (Manager)</option>
                    <option value="SALES">ðŸ‘¥ BÃ¡n láº» (Sales)</option>
                    <option value="KHO">ðŸ“¦ HÃ ng hÃ³a (Thá»§ kho)</option>
                    <option value="CSKH">ðŸ’¬ ChÄƒm sÃ³c khÃ¡ch hÃ ng</option>
                    <option value="QUAN_TRI_VIEN">âš™ï¸ Quáº£n trá»‹ viÃªn</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Sá»‘ Ä‘iá»‡n thoáº¡i</label>
                  <input 
                    type="text"
                    placeholder="VÃ­ dá»¥: 0912xxxxxx"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({...staffForm, phone: e.target.value.replace(/\D/g, '')})}
                    className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-855 focus:outline-none focus:ring-1 focus:ring-emerald-555"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">NgÃ y gia nháº­p chi nhÃ¡nh</label>
                  <input 
                    type="date"
                    value={staffForm.joinedDate}
                    onChange={(e) => setStaffForm({...staffForm, joinedDate: e.target.value})}
                    className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-855 focus:outline-none focus:ring-1 focus:ring-emerald-555 text-left"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tráº¡ng thÃ¡i váº­n hÃ nh</label>
                  <select
                    value={staffForm.status}
                    onChange={(e) => setStaffForm({...staffForm, status: e.target.value as 'active' | 'inactive'})}
                    className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-855 focus:outline-none focus:ring-1 focus:ring-emerald-555"
                  >
                    <option value="active">ðŸŸ¢ Äang lÃ m viá»‡c (PhÃ¡t tháº» ca)</option>
                    <option value="inactive">ðŸ”´ Ngá»«ng lÃ m viá»‡c (Thu há»“i tháº»)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-emerald-100">
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#107c41] hover:bg-[#0c6232] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider cursor-pointer shadow-xs text-center flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>XÃ¡c nháº­n thiáº¿t láº­p</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 5. EXPANDABLE ADD/EDIT PERMISSIONS FORM inside card (removed in V2) */}

        {/* 6A. CURRENT TAB: STAFF MEMBERS DATATABLE */}
        {activeSubTab === 'staff' ? (
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <Skeleton className="h-9 w-1/4 rounded-lg bg-slate-100" />
                    <Skeleton className="h-9 w-1/4 rounded-lg bg-slate-100" />
                    <Skeleton className="h-9 w-1/4 rounded-lg bg-slate-100" />
                  </div>
                  <div className="space-y-2 pt-2">
                    {Array.from({ length: 6 }).map((_, rIdx) => (
                      <div key={rIdx} className="flex gap-4 items-center justify-between border-b border-slate-100 py-3">
                        <Skeleton className="h-5 w-12 rounded bg-slate-100" />
                        <Skeleton className="h-5 w-40 rounded bg-slate-100" />
                        <Skeleton className="h-5 w-24 rounded bg-slate-100" />
                        <Skeleton className="h-5 w-32 rounded bg-slate-100" />
                        <Skeleton className="h-5 w-28 rounded bg-slate-100" />
                        <Skeleton className="h-5 w-20 rounded bg-slate-100" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Table className="w-full text-left font-sans">
                  <TableHeader className="bg-[#107c41] hover:bg-[#107c41]">
                    <TableRow className="bg-[#107c41] hover:bg-[#0c6232] border-b border-[#0a5c30]/10 select-none text-xs">
                      <TableHead 
                        onClick={() => handleSortStaff('id')}
                        className="px-5 py-3 font-mono text-[10.5px] font-bold tracking-widest uppercase text-center text-white w-[80px] cursor-pointer hover:bg-[#0c6232] transition-colors select-none"
                      >
                        MÃ£ sá»‘ {renderSortIcon('id', staffSort)}
                      </TableHead>
                      <TableHead 
                        onClick={() => handleSortStaff('fullName')}
                        className="px-5 py-3 font-bold tracking-widest uppercase text-white w-[200px] cursor-pointer hover:bg-[#0c6232] transition-colors select-none"
                      >
                        Há» vÃ  TÃªn {renderSortIcon('fullName', staffSort)}
                      </TableHead>
                      <TableHead 
                        onClick={() => handleSortStaff('username')}
                        className="px-4 py-3 font-bold tracking-widest uppercase text-white w-[140px] cursor-pointer hover:bg-[#0c6232] transition-colors select-none"
                      >
                        TÃªn Ä‘Äƒng nháº­p {renderSortIcon('username', staffSort)}
                      </TableHead>
                      <TableHead 
                        onClick={() => handleSortStaff('role')}
                        className="px-5 py-3 font-bold tracking-widest uppercase text-white w-[180px] cursor-pointer hover:bg-[#0c6232] transition-colors select-none"
                      >
                        Chá»©c vá»¥ / Vai trÃ² {renderSortIcon('role', staffSort)}
                      </TableHead>
                      <TableHead 
                        onClick={() => handleSortStaff('phone')}
                        className="px-4 py-3 font-bold tracking-widest uppercase text-white w-[120px] cursor-pointer hover:bg-[#0c6232] transition-colors select-none"
                      >
                        Sá»‘ Ä‘iá»‡n thoáº¡i {renderSortIcon('phone', staffSort)}
                      </TableHead>
                      <TableHead 
                        onClick={() => handleSortStaff('joinedDate')}
                        className="px-4 py-3 font-bold tracking-widest uppercase text-white w-[130px] text-center cursor-pointer hover:bg-[#0c6232] transition-colors select-none"
                      >
                        Gia nháº­p {renderSortIcon('joinedDate', staffSort)}
                      </TableHead>
                      <TableHead 
                        onClick={() => handleSortStaff('status')}
                        className="px-4 py-3 font-bold tracking-widest uppercase text-white w-[140px] text-center cursor-pointer hover:bg-[#0c6232] transition-colors select-none"
                      >
                        Tráº¡ng thÃ¡i ca {renderSortIcon('status', staffSort)}
                      </TableHead>
                      <TableHead className="px-4 py-3 font-bold tracking-widest uppercase text-white text-center w-[125px]">HÃ nh Ä‘á»™ng</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedStaff.length > 0 ? (
                      paginatedStaff.map((staff, sIdx) => {
                        const linkedRules = permissions.filter(p => p.roleCode === staff.role && p.canView);
                        return (
                          <TableRow 
                            key={staff.id}
                            className={`text-xs border-b border-slate-100/70 hover:bg-slate-50/70 transition-colors ${
                              sIdx % 2 === 1 ? 'bg-slate-50/10' : 'bg-white'
                            }`}
                          >
                            {/* ID */}
                            <TableCell className="px-5 py-3.5 text-center font-mono font-bold text-slate-500 bg-slate-50/30">
                              {staff.id}
                            </TableCell>

                            {/* Name + Details block */}
                            <TableCell className="px-5 py-3.5 font-extrabold text-slate-800">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">ðŸ‘¤</span>
                                <div>
                                  <p className="font-bold tracking-tight">{staff.fullName}</p>
                                  {linkedRules.length > 0 && (
                                    <p className="text-[9px] text-[#107c41] font-mono mt-0.5 flex items-center gap-0.5 font-bold">
                                      <ShieldCheck className="w-2.5 h-2.5 shrink-0" />
                                      CÃ³ {linkedRules.length} module Ä‘Ã£ phÃ¢n quyá»n
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>

                            {/* Login ID */}
                            <TableCell className="px-4 py-3.5 font-mono text-[#1e293b] font-bold select-all bg-slate-50/10">
                              {staff.username}
                            </TableCell>

                            {/* Role Friendly Badge */}
                            <TableCell className="px-5 py-3.5 font-semibold text-slate-700">
                              <span className="inline-block px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold font-mono text-slate-700">
                                {getRoleFriendlyName(staff.role)}
                              </span>
                            </TableCell>

                            {/* Phone */}
                            <TableCell className="px-4 py-3.5 font-mono text-slate-600">
                              {staff.phone ? (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  {staff.phone}
                                </span>
                              ) : (
                                <span className="text-slate-350 italic">KhÃ´ng cÃ³</span>
                              )}
                            </TableCell>

                            {/* Joined Date */}
                            <TableCell className="px-4 py-3.5 text-center font-mono font-semibold text-slate-500">
                              <span className="flex items-center justify-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                {staff.joinedDate}
                              </span>
                            </TableCell>

                            {/* Status badge toggler */}
                            <TableCell className="px-4 py-3.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleStaffStatus(staff.id)}
                                disabled={!hasWriteAccess}
                                className={`mx-auto flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${
                                  staff.status === 'active'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-rose-50 text-rose-500 border-rose-200 hover:bg-rose-100'
                                } ${hasWriteAccess ? 'cursor-pointer' : 'cursor-not-allowed opacity-90'}`}
                              >
                                <span>{staff.status === 'active' ? 'ðŸŸ¢ Hoáº¡t Äá»™ng' : 'ðŸ”´ Äiá»ƒm Nghá»‰'}</span>
                              </button>
                            </TableCell>

                            {/* Quick action group */}
                            <TableCell className="px-4 py-3.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleEditStaffClick(staff)}
                                  disabled={!hasWriteAccess}
                                  className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 active:scale-90 disabled:opacity-40 rounded-lg transition-all cursor-pointer"
                                  title="Sá»­a há»“ sÆ¡ nhÃ¢n viÃªn"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteStaff(staff.id)}
                                  disabled={!hasWriteAccess}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-90 disabled:opacity-40 rounded-lg transition-all cursor-pointer"
                                  title="XÃ³a nhÃ¢n viÃªn khá»i database"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="px-5 py-12 text-center text-slate-400 italic font-mono bg-white">
                          KhÃ´ng cÃ³ káº¿t quáº£ lá»c thÃ­ch há»£p trong quyá»ƒn LÆ°u danh NhÃ¢n sá»±.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {renderPagination(totalStaffPages)}
              </>
            )}
          </div>
        ) : activeSubTab === 'permissions' ? (
          /* 6B. DYNAMIC DUAL-MODE PERMISSION MATRIX & SECURITY workspace */
          <div className="flex flex-col min-h-[500px]">
            {isLoading ? (
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <Skeleton className="h-9 w-1/4 rounded-lg bg-slate-100" />
                    <Skeleton className="h-9 w-1/4 rounded-lg bg-slate-100" />
                    <Skeleton className="h-9 w-1/4 rounded-lg bg-slate-100" />
                  </div>
                  <div className="space-y-2 pt-2">
                    {Array.from({ length: 6 }).map((_, rIdx) => (
                      <div key={rIdx} className="flex gap-4 items-center justify-between border-b border-slate-100 py-3">
                        <Skeleton className="h-5 w-12 rounded bg-slate-100" />
                        <Skeleton className="h-5 w-40 rounded bg-slate-100" />
                        <Skeleton className="h-5 w-24 rounded bg-slate-100" />
                        <Skeleton className="h-5 w-32 rounded bg-slate-100" />
                        <Skeleton className="h-5 w-28 rounded bg-slate-100" />
                        <Skeleton className="h-5 w-20 rounded bg-slate-100" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* VIEW MODE CONTROLLER - TAB HEADER BODY */}
                <div className="p-4 bg-slate-50 border-b border-slate-150 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="text-left space-y-0.5">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Cáº¥u HÃ¬nh PhÃ¢n Quyá»n Váº­n HÃ nh</h3>
                    <p className="text-[11px] text-slate-500 font-medium font-sans">Äáº·c quyá»n (Xem, ThÃªm, Sá»­a, XÃ³a, Duyá»‡t) Ä‘Æ°á»£c cáº¥u hÃ³a thÃ´ng minh, Ä‘á»“ng bá»™ tá»± Ä‘á»™ng cao.</p>
                  </div>
                  
                  <div className="flex bg-slate-200/50 p-1 rounded-xl text-xs self-start md:self-auto gap-1">
                    <button
                      type="button"
                      onClick={() => setMatrixViewType('role-focus')}
                      className={`px-3 py-1.5 rounded-lg font-bold tracking-wide transition-all cursor-pointer ${
                        matrixViewType === 'role-focus'
                          ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      ðŸŽ¯ Cáº¥u hÃ¬nh theo vai trÃ²
                    </button>
                    <button
                      type="button"
                      onClick={() => setMatrixViewType('master-grid')}
                      className={`px-3 py-1.5 rounded-lg font-bold tracking-wide transition-all cursor-pointer ${
                        matrixViewType === 'master-grid'
                          ? 'bg-white text-blue-750 shadow-xs border border-slate-200'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      ðŸ“Š Báº£n Ä‘á»“ Ma tráº­n Tá»•ng há»£p
                    </button>
                  </div>
                </div>

                {/* MODE 1: ROLE CONFIGURATOR */}
                {matrixViewType === 'role-focus' ? (
                  <div className="flex flex-col">
                    {/* ROLE SELECTOR GRID */}
                    <div className="p-4 bg-white border-b border-slate-150 text-left">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Chá»n vai trÃ² cáº§n hiá»‡u chá»‰nh:</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {activeRolesList.map(role => {
                          const isSelected = selectedRole === role;
                          const employeeCount = staffList.filter(s => s.role === role && s.status === 'active').length;
                          const moduleCount = activeModulesList.filter(m => {
                            const matching = permissions.find(p => p.roleCode === role && p.module === m);
                            return matching && (matching.canView || matching.canCreate || matching.canUpdate || matching.canDelete || matching.canApprove);
                          }).length;
                          
                          return (
                            <button
                              key={role}
                              type="button"
                              onClick={() => setSelectedRole(role)}
                              className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-20 group cursor-pointer ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-50/10 shadow-xs text-blue-900 ring-1 ring-blue-600'
                                  : 'border-slate-200 bg-white hover:border-slate-350 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="text-left w-full">
                                <div className="text-[11.5px] font-extrabold line-clamp-1 group-hover:text-blue-700 transition-colors uppercase tracking-tight">
                                  {getRoleFriendlyName(role)}
                                </div>
                                <div className="text-[9px] font-mono text-slate-400 mt-1">
                                  {role}
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between text-[9px] font-bold mt-1 w-full pt-1 border-t border-slate-50">
                                <span className="text-slate-450 font-normal">Äang hoáº¡t Ä‘á»™ng: <b className="font-mono text-slate-700">{employeeCount}</b></span>
                                <span className={`px-1 rounded-full font-mono text-[8.5px] text-center ${moduleCount > 0 ? 'bg-blue-50 text-blue-700 border border-blue-200/50' : 'bg-slate-105 text-slate-500'}`}>
                                  {moduleCount}/{activeModulesList.length} PH
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* ACTIONS ROW & TARGET DETAILED HEADER */}
                    <div className="p-4 bg-slate-50/20">
                      <div className="bg-white rounded-xl border border-slate-150 p-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                        <div className="space-y-0.5 text-left">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Báº£ng Ä‘iá»u hÆ°á»›ng tÆ°Æ¡ng tÃ¡c</h4>
                          <div className="text-sm font-extrabold text-[#112d4e] uppercase flex items-center gap-1.5 mt-1 flex-wrap">
                            <span>{getRoleFriendlyName(selectedRole)}</span>
                            <span className="text-[9.5px] px-1.5 py-0.5 bg-slate-100 text-slate-500 font-mono rounded-md border border-slate-200">{selectedRole}</span>
                          </div>
                          <p className="text-[11.5px] text-slate-500 font-semibold font-sans">Click cÃ¡c quy táº¯c checkbox trá»±c quan Ä‘á»ƒ cáº­p nháº­t ngay láº­p tá»©c, khÃ´ng qua bÃ n cá»©u trung gian.</p>
                        </div>
                        
                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleToggleAllForRole(selectedRole, true)}
                            disabled={!hasWriteAccess}
                            className="px-3 py-1.5 bg-white border border-blue-600 text-blue-650 hover:bg-blue-50/50 rounded-lg text-xs font-semibold select-none cursor-pointer transition-all flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Báº­t háº¿t quyá»n</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleAllForRole(selectedRole, false)}
                            disabled={!hasWriteAccess}
                            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-semibold select-none cursor-pointer transition-all flex items-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Thu há»“i háº¿t</span>
                          </button>
                        </div>
                      </div>

                      {/* EDITABLE GRID */}
                      <div className="bg-white rounded-xl border border-slate-150 overflow-hidden shadow-xs">
                        <Table className="w-full text-left font-sans">
                          <TableHeader className="bg-slate-50 select-none">
                            <TableRow className="border-b border-slate-150 text-xs text-slate-600">
                              <TableHead className="px-5 py-3 font-extrabold text-[10.5px] uppercase tracking-wider text-slate-600 min-w-[220px]">
                                PhÃ¢n Há»‡ Nghiá»‡p Vá»¥ (Module)
                              </TableHead>
                              <TableHead className="px-4 py-3 font-extrabold text-[10.5px] uppercase tracking-wider text-center text-slate-600 w-[90px]">
                                ðŸ‘ï¸ Xem
                              </TableHead>
                              <TableHead className="px-4 py-3 font-extrabold text-[10.5px] uppercase tracking-wider text-center text-slate-600 w-[90px]">
                                âž• ThÃªm
                              </TableHead>
                              <TableHead className="px-4 py-3 font-extrabold text-[10.5px] uppercase tracking-wider text-center text-slate-600 w-[90px]">
                                âœï¸ Sá»­a
                              </TableHead>
                              <TableHead className="px-4 py-3 font-extrabold text-[10.5px] uppercase tracking-wider text-center text-slate-600 w-[90px]">
                                âŒ XÃ³a
                              </TableHead>
                              <TableHead className="px-4 py-3 font-extrabold text-[10.5px] uppercase tracking-wider text-center text-slate-600 w-[90px]">
                                ðŸ›¡ï¸ Duyá»‡t
                              </TableHead>
                              <TableHead className="px-4 py-3 font-extrabold text-[10.5px] uppercase tracking-wider text-center text-slate-600 w-[160px]">
                                HÃ nh Ä‘á»™ng nhanh
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {activeModulesList.map(mKey => {
                              const meta = getModuleMeta(mKey);
                              const row = permissions.find(p => p.roleCode === selectedRole && p.module === mKey) || {
                                canView: false,
                                canCreate: false,
                                canUpdate: false,
                                canDelete: false,
                                canApprove: false,
                              };
                              
                              return (
                                <TableRow key={mKey} className="border-b border-slate-100 hover:bg-slate-50/20 transition-all text-xs">
                                  {/* Module Info Cell */}
                                  <TableCell className="px-5 py-3.5 text-left">
                                    <div className="flex items-start gap-2.5 text-left">
                                      <span className="text-base leading-none mt-0.5">{meta.icon}</span>
                                      <div className="space-y-0.5 text-left">
                                        <div className="font-extrabold text-slate-800 text-[11.5px] uppercase tracking-tight flex items-center gap-1.5 flex-wrap">
                                          <span>{meta.name}</span>
                                          <span className="text-[8.5px] font-mono px-1 bg-slate-100 text-slate-450 border border-slate-200 rounded">
                                            {mKey}
                                          </span>
                                        </div>
                                        <p className="text-[10.5px] text-slate-400 font-medium font-sans leading-relaxed max-w-[440px]">
                                          {meta.desc}
                                        </p>
                                      </div>
                                    </div>
                                  </TableCell>
                                  
                                  {/* Boolean Permissions checkboxes */}
                                  {[
                                    { key: 'canView', label: 'Xem' },
                                    { key: 'canCreate', label: 'ThÃªm' },
                                    { key: 'canUpdate', label: 'Sá»­a' },
                                    { key: 'canDelete', label: 'XÃ³a' },
                                    { key: 'canApprove', label: 'Duyá»‡t' }
                                  ].map(pField => {
                                    const fieldKey = pField.key as 'canView' | 'canCreate' | 'canUpdate' | 'canDelete' | 'canApprove';
                                    const isChecked = row[fieldKey];
                                    
                                    return (
                                      <TableCell key={pField.key} className="px-4 py-3 text-center">
                                        <button
                                          type="button"
                                          onClick={() => handleTogglePermission(selectedRole, mKey, fieldKey)}
                                          disabled={!hasWriteAccess}
                                          className={`mx-auto h-7 w-7 rounded-lg border flex items-center justify-center transition-all ${
                                            isChecked 
                                              ? 'bg-emerald-50 text-emerald-600 border-emerald-400 shadow-xs scale-105' 
                                              : 'bg-white border-slate-200 text-slate-400 hover:border-slate-350 hover:bg-slate-50'
                                          } ${hasWriteAccess ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-not-allowed opacity-[0.40]'}`}
                                          title={`áº¤n Ä‘á»ƒ Báº¬T/Táº®T quyá»n '${pField.label}' cá»§a ${getRoleFriendlyName(selectedRole)} trÃªn phÃ¢n há»‡ ${meta.name}`}
                                        >
                                          {isChecked ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <div className="w-1 h-1 bg-slate-300 rounded-full" />}
                                        </button>
                                      </TableCell>
                                    );
                                  })}
                                  
                                  {/* Quick shortcuts for role in module */}
                                  <TableCell className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleAllForModule(selectedRole, mKey, true)}
                                        disabled={!hasWriteAccess}
                                        className="px-2 py-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-350 rounded text-[9.5px] font-semibold transition-all cursor-pointer select-none"
                                      >
                                        Báº­t táº¥t
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleToggleAllForModule(selectedRole, mKey, false)}
                                        disabled={!hasWriteAccess}
                                        className="px-2 py-1 bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 rounded text-[9.5px] font-semibold transition-all cursor-pointer select-none"
                                      >
                                        KhÃ³a táº¥t
                                      </button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* MODE 2: MASTER GRID OVERVIEW BOARD */
                  <div className="p-4 bg-white flex flex-col text-left">
                    <div className="text-left mb-3.5 pb-2 border-b border-slate-150">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-blue-600" />
                        Báº£n Ä‘á»“ Äáº·c quyá»n Tá»•ng há»£p Váº­n hÃ nh Showroom
                      </h4>
                      <p className="text-[11px] text-slate-505 font-medium">Báº£ng tá»•ng quÃ¡t cÃ¡c hoÃ¡n Ä‘á»•i Ä‘iá»u phá»‘i quyá»n toÃ n thá»ƒ vá»‹ trÃ­ cá»§a há»‡ thá»‘ng. Click trá»±c tiáº¿p cÃ¡c Ã´ Ä‘á»ƒ cáº­p nháº­t nÃ³ng.</p>
                    </div>
                    
                    <div className="border border-slate-150 rounded-xl overflow-x-auto shadow-xs">
                      <Table className="w-full text-left font-sans border-collapse">
                        <TableHeader className="bg-slate-50 select-none">
                          <TableRow className="border-b border-slate-150 text-xs text-slate-600">
                            <TableHead className="px-4 py-3 font-extrabold uppercase tracking-wider text-slate-600 w-[180px] bg-slate-50 sticky left-0 z-10 border-r border-slate-150">
                              Vai trÃ² báº£o máº­t (Role)
                            </TableHead>
                            {activeModulesList.map(mKey => (
                              <TableHead key={mKey} className="px-3 py-3 font-extrabold uppercase text-center text-slate-600 tracking-wider">
                                <div className="flex flex-col items-center gap-0.5 min-w-[130px]" title={getModuleMeta(mKey).desc}>
                                  <span className="text-base">{getModuleMeta(mKey).icon}</span>
                                  <span className="text-[9.5px] uppercase font-extrabold tracking-tight">{getModuleMeta(mKey).name}</span>
                                </div>
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activeRolesList.map(role => (
                            <TableRow key={role} className="border-b border-slate-100 hover:bg-slate-50/20 text-xs">
                              {/* Leftmost Sticky Role Title */}
                              <TableCell className="px-4 py-3 font-bold text-slate-750 bg-slate-50/40 sticky left-0 z-1 border-r border-slate-150 text-left cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => { setSelectedRole(role); setMatrixViewType('role-focus'); }}>
                                <div className="font-extrabold uppercase text-slate-800 tracking-tight flex items-center gap-1">
                                  <span>{getRoleFriendlyName(role)}</span>
                                  <Sparkles className="w-3 h-3 text-slate-350 opacity-0 group-hover:opacity-100" />
                                </div>
                                <div className="text-[9px] font-mono text-slate-450 mt-0.5">{role}</div>
                              </TableCell>
                              
                              {/* Modules cells */}
                              {activeModulesList.map(mKey => {
                                const row = permissions.find(p => p.roleCode === role && p.module === mKey) || {
                                  canView: false,
                                  canCreate: false,
                                  canUpdate: false,
                                  canDelete: false,
                                  canApprove: false,
                                };
                                
                                const activeCount = [row.canView, row.canCreate, row.canUpdate, row.canDelete, row.canApprove].filter(Boolean).length;
                                
                                return (
                                  <TableCell key={mKey} className="px-2 py-3 text-center border-r last:border-r-0 border-slate-100 bg-white">
                                    <div className="flex flex-col items-center justify-center space-y-1.5">
                                      <div className="flex items-center gap-0.5 justify-center flex-wrap">
                                        {[
                                          { char: 'X', field: 'canView' as const, label: 'Xem' },
                                          { char: 'T', field: 'canCreate' as const, label: 'ThÃªm' },
                                          { char: 'S', field: 'canUpdate' as const, label: 'Sá»­a' },
                                          { char: 'X', field: 'canDelete' as const, label: 'XÃ³a' },
                                          { char: 'D', field: 'canApprove' as const, label: 'Duyá»‡t' },
                                        ].map(opt => {
                                          const isAssigned = row[opt.field];
                                          return (
                                            <button
                                              key={opt.field}
                                              type="button"
                                              onClick={() => handleTogglePermission(role, mKey, opt.field)}
                                              disabled={!hasWriteAccess}
                                              className={`h-5 w-5 rounded-md text-[8.5px] font-mono font-extrabold flex items-center justify-center border transition-all ${
                                                isAssigned
                                                  ? 'bg-blue-600 border-blue-700 text-white shadow-xs'
                                                  : 'bg-slate-50 text-slate-300 border-slate-100'
                                              } ${hasWriteAccess ? 'cursor-pointer hover:scale-110 active:scale-90' : 'cursor-not-allowed opacity-[0.40]'}`}
                                              title={`${getRoleFriendlyName(role)} @ ${mKey}: ${opt.label} = ${isAssigned ? 'Äang báº­t' : 'Äang táº¯t'}`}
                                            >
                                              {opt.char}
                                            </button>
                                          );
                                        })}
                                      </div>
                                      
                                      <div className={`text-[8px] font-mono px-1 py-0.2 rounded-full font-bold ${activeCount > 0 ? 'bg-emerald-50 text-emerald-800 font-bold' : 'bg-slate-50 text-slate-350'}`}>
                                        {activeCount}/5
                                      </div>
                                    </div>
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* FLOATING DIALOG OVERLAY: ADD CUSTOM ROLE */}
            {showAddRoleModal && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-left">
                <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full border border-slate-150 p-5 transform duration-300 scale-100 relative">
                  <button 
                    type="button" 
                    onClick={() => setShowAddRoleModal(false)}
                    className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  <div className="mb-4">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                      <Shield className="w-4 h-4 text-blue-600" />
                      Khai BÃ¡o Vai TrÃ² Báº£o Máº­t Má»›i
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 font-sans">Vai trÃ² má»›i sáº½ Ä‘Æ°á»£c Ä‘Äƒng kÃ½ tá»©c kháº¯c lÃªn há»‡ thá»‘ng vÃ  hiá»ƒn thá»‹ trá»±c tiáº¿p trÃªn ma tráº­n phÃ¢n quyá»n.</p>
                  </div>
                  
                  <form onSubmit={handleCreateCustomRole} className="space-y-4">
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">MÃ£ vai trÃ² (IN HOA khÃ´ng dáº¥u, vÃ­ dá»¥: SALES_LEAD)</label>
                      <input
                        type="text"
                        required
                        placeholder="VÃ­ dá»¥: QUAN_LY_SHOWROOM, GIAM_SAT"
                        value={newCustomRoleName}
                        onChange={(e) => setNewCustomRoleName(e.target.value.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, ''))}
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-left font-mono"
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowAddRoleModal(false)}
                        className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer border border-slate-200 hover:bg-slate-105"
                      >
                        ÄÃ³ng
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer select-none shadow-xs flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Khai bÃ¡o</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* FLOATING DIALOG OVERLAY: ADD CUSTOM MODULE */}
            {showAddModuleModal && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-left">
                <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full border border-slate-150 p-5 transform duration-300 scale-100 relative">
                  <button 
                    type="button" 
                    onClick={() => setShowAddModuleModal(false)}
                    className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  <div className="mb-4">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      XÃ¢y Dá»±ng PhÃ¢n Há»‡ Má»›i
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 font-sans">ÄÄƒng kÃ½ tÃ­nh nÄƒng phÃ¢n há»‡ nghiá»‡p vá»¥ má»›i lÃªn showroom. Chá»§ cá»­a hÃ ng sáº½ nháº­n Ä‘áº·c quyá»n tuyá»‡t Ä‘á»‘i.</p>
                  </div>
                  
                  <form onSubmit={handleCreateCustomModule} className="space-y-4">
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">MÃ£ phÃ¢n há»‡ (IN HOA khÃ´ng dáº¥u, vÃ­ dá»¥: KHO_QUY)</label>
                      <input
                        type="text"
                        required
                        placeholder="VÃ­ dá»¥: KHO_QUY, CHUNG_LAP"
                        value={newCustomModuleName}
                        onChange={(e) => setNewCustomModuleName(e.target.value.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, ''))}
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-left font-mono"
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowAddModuleModal(false)}
                        className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer border border-slate-200 hover:bg-slate-105"
                      >
                        ÄÃ³ng
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer select-none shadow-xs flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>XÃ¢y dá»±ng</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 6C. SYSTEM ACTION LOGS DATATABLE */
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <Skeleton className="h-9 w-1/4 rounded-lg bg-slate-100" />
                    <Skeleton className="h-9 w-1/4 rounded-lg bg-slate-100" />
                    <Skeleton className="h-9 w-1/4 rounded-lg bg-slate-100" />
                  </div>
                  <div className="space-y-2 pt-2">
                    {Array.from({ length: 6 }).map((_, rIdx) => (
                      <div key={rIdx} className="flex gap-4 items-center justify-between border-b border-slate-100 py-3">
                        <Skeleton className="h-5 w-12 rounded bg-slate-100" />
                        <Skeleton className="h-5 w-40 rounded bg-slate-100" />
                        <Skeleton className="h-5 w-24 rounded bg-slate-100" />
                        <Skeleton className="h-5 w-32 rounded bg-slate-100" />
                        <Skeleton className="h-5 w-28 rounded bg-slate-100" />
                        <Skeleton className="h-5 w-20 rounded bg-slate-100" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Table className="w-full text-left font-sans">
                  <TableHeader className="bg-indigo-800 hover:bg-indigo-800">
                    <TableRow className="bg-indigo-800 hover:bg-indigo-900 border-b border-indigo-900/10 select-none text-xs">
                      <TableHead 
                        onClick={() => handleSortLog('timestamp')}
                        className="px-5 py-3 font-mono text-[10.5px] font-bold tracking-widest uppercase text-center text-white w-[140px] cursor-pointer hover:bg-[#3d4bb7] transition-colors select-none"
                      >
                        Thá»i gian {renderSortIcon('timestamp', logSort)}
                      </TableHead>
                      <TableHead 
                        onClick={() => handleSortLog('actor')}
                        className="px-5 py-3 font-bold tracking-widest uppercase text-white w-[150px] cursor-pointer hover:bg-[#3d4bb7] transition-colors select-none"
                      >
                        NgÆ°á»i thá»±c hiá»‡n {renderSortIcon('actor', logSort)}
                      </TableHead>
                      <TableHead 
                        onClick={() => handleSortLog('target')}
                        className="px-5 py-3 font-bold tracking-widest uppercase text-white w-[130px] cursor-pointer hover:bg-[#3d4bb7] transition-colors select-none"
                      >
                        Äá»‘i tÆ°á»£ng {renderSortIcon('target', logSort)}
                      </TableHead>
                      <TableHead 
                        onClick={() => handleSortLog('actionType')}
                        className="px-5 py-3 font-bold tracking-widest uppercase text-white w-[120px] text-center font-sans cursor-pointer hover:bg-[#3d4bb7] transition-colors select-none"
                      >
                        HÃ nh Ä‘á»™ng {renderSortIcon('actionType', logSort)}
                      </TableHead>
                      <TableHead 
                        onClick={() => handleSortLog('details')}
                        className="px-5 py-3 font-bold tracking-widest uppercase text-white cursor-pointer hover:bg-[#3d4bb7] transition-colors select-none"
                      >
                        Ná»™i dung chi tiáº¿t thao tÃ¡c {renderSortIcon('details', logSort)}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLogs.length > 0 ? (
                      paginatedLogs.map((log, lIdx) => {
                        let actionBadge = '';
                        switch (log.actionType) {
                          case 'CREATE':
                            actionBadge = 'bg-emerald-50 text-emerald-700 border-emerald-250';
                            break;
                          case 'UPDATE':
                            actionBadge = 'bg-sky-50 text-sky-800 border-sky-250';
                            break;
                          case 'DELETE':
                            actionBadge = 'bg-rose-50 text-rose-700 border-rose-250';
                            break;
                          case 'SYNC':
                            actionBadge = 'bg-amber-50 text-amber-800 border-amber-250';
                            break;
                          case 'RESET':
                            actionBadge = 'bg-purple-50 text-purple-800 border-purple-200';
                            break;
                          default:
                            actionBadge = 'bg-slate-100 text-slate-705 text-slate-700 border-slate-205';
                        }

                        const dateObj = new Date(log.timestamp);
                        const formattedTime = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

                        return (
                          <TableRow 
                            key={log.id}
                            className={`text-xs border-b border-slate-100/70 hover:bg-slate-50/70 transition-colors ${
                              lIdx % 2 === 1 ? 'bg-indigo-50/5' : 'bg-white'
                            }`}
                          >
                            <TableCell className="px-5 py-3 text-center font-mono text-[11px] text-slate-500 bg-slate-50/30 whitespace-nowrap">
                              {formattedTime}
                            </TableCell>
                            <TableCell className="px-5 py-3 font-bold text-slate-800 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                <span>{log.actor}</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-5 py-3 font-bold whitespace-nowrap">
                              <span className="inline-block px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md text-[10px] text-slate-600 font-sans tracking-wide">
                                {log.target}
                              </span>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-center whitespace-nowrap">
                              <span className={`inline-block px-3 py-1 border rounded-full text-[10px] font-extrabold tracking-wider ${actionBadge}`}>
                                {log.actionType}
                              </span>
                            </TableCell>
                            <TableCell className="px-5 py-3 text-left text-slate-700 font-medium leading-relaxed font-sans select-text">
                              {log.details}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="px-5 py-12 text-center text-slate-400 italic font-mono bg-white">
                          ðŸ’¡ KhÃ´ng tÃ¬m tháº¥y hoáº¡t Ä‘á»™ng ghi nháº­n nÃ o khá»›p vá»›i bá»™ lá»c dá»¯ liá»‡u nháº­t kÃ½ hiá»‡n táº¡i.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {renderPagination(totalLogPages)}
              </>
            )}
          </div>
        )}

        {/* Excel cloud footer indicators */}
        <div className={`border-t border-slate-200 px-5 py-3 flex flex-wrap justify-between items-center gap-3 text-xs text-left ${
          activeSubTab === 'staff' 
            ? 'bg-[#107c41]/10 text-[#107c41]' 
            : activeSubTab === 'permissions' 
              ? 'bg-blue-600/10 text-blue-700'
              : 'bg-indigo-600/10 text-indigo-750 text-indigo-700'
        }`}>
          <span className="font-bold flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider">
            <span className={`w-2 h-2 rounded-full animate-pulse ${
              activeSubTab === 'staff' 
                ? 'bg-[#107c41]' 
                : activeSubTab === 'permissions' 
                  ? 'bg-blue-600'
                  : 'bg-indigo-600'
            }`}></span>
            Máº¡ng lÆ°á»›i SOP chi nhÃ¡nh Ä‘á»“ng bá»™ hoÃ n chá»‰nh v2.1
          </span>
          <span className="font-medium text-slate-400 text-[10.5px]">
            {activeSubTab === 'staff' 
              ? 'TÃ i khoáº£n Ä‘á»•i cÃ³ thá»ƒ test thá»­ báº±ng presets Ä‘Äƒng nháº­p ngay!'
              : activeSubTab === 'permissions'
                ? 'ID ma tráº­n PQ-01 báº¯t Ä‘áº§u cÃ³ hiá»‡u hiá»‡u lá»±c tá»©c thá»i.'
                : 'Nháº­t kÃ½ báº£o máº­t lÆ°u trá»¯ cá»¥c bá»™ (Local Audit Trail) Ä‘Ã£ hoáº¡t Ä‘á»™ng.'}
          </span>
        </div>
      </div>
    

      {/* EDIT STAFF MODAL DIALOG */}
      {editingStaffId !== null && (
        <div className="fixed inset-0 bg-slate-933/60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl w-full max-w-md overflow-hidden flex flex-col scale-100 max-h-[90vh] text-left">
            
            {/* Modal Header */}
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8.5 h-8.5 rounded-xl bg-[#107c41]/10 text-[#107c41] flex items-center justify-center font-bold">
                  ðŸ‘¤
                </div>
                <div>
                  <h3 className="text-xs font-black font-display text-slate-900 uppercase tracking-tight">Cáº­p nháº­t tÃ i khoáº£n</h3>
                  <p className="text-[10px] text-slate-400 font-mono font-bold uppercase mt-0.5">MÃƒ NV: {editingStaffId}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingStaffId(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/50 px-5 pt-2">
              <button
                onClick={() => setDialogTab('editable')}
                className={`flex-1 pb-2.5 text-center text-[10px] font-black uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                  dialogTab === 'editable' ? 'border-[#107c41] text-[#107c41]' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                âœï¸ Thay Ä‘á»•i
              </button>
              <button
                onClick={() => setDialogTab('readonly')}
                className={`flex-1 pb-2.5 text-center text-[10px] font-black uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                  dialogTab === 'readonly' ? 'border-[#107c41] text-[#107c41]' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                ðŸ”’ Há»‡ thá»‘ng (Cá»‘ Ä‘á»‹nh)
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {dialogTab === 'editable' ? (
                <div className="space-y-3.5">
                  {/* Há» vÃ  TÃªn */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 font-bold">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>Há» vÃ  TÃªn</span>
                    </label>
                    <input 
                      type="text" 
                      value={staffForm.fullName}
                      onChange={(e) => setStaffForm({...staffForm, fullName: e.target.value})}
                      placeholder="Nháº­p há» tÃªn Ä‘áº§y Ä‘á»§..." 
                      className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#107c41] focus:bg-white"
                    />
                  </div>

                  {/* Äiá»‡n thoáº¡i & Email */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 font-bold">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>Sá»‘ Ä‘iá»‡n thoáº¡i</span>
                    </label>
                    <input 
                      type="text" 
                      value={staffForm.phone}
                      onChange={(e) => setStaffForm({...staffForm, phone: e.target.value})}
                      placeholder="Nháº­p sá»‘ Ä‘iá»‡n thoáº¡i..." 
                      className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#107c41] focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 font-bold">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>Há»™p thÆ° Email</span>
                    </label>
                    <input 
                      type="email" 
                      value={staffForm.email}
                      onChange={(e) => setStaffForm({...staffForm, email: e.target.value})}
                      placeholder="Nháº­p email..." 
                      className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#107c41] focus:bg-white"
                    />
                  </div>

                  {/* Máº­t kháº©u & PIN ca */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 font-bold">
                        <Lock className="w-3.5 h-3.5 text-[#107c41]" />
                        <span>Máº­t kháº©u</span>
                      </label>
                      <div className="relative">
                        <input 
                          type={showDialogPassword ? "text" : "password"} 
                          value={staffForm.password}
                          onChange={(e) => setStaffForm({...staffForm, password: e.target.value})}
                          placeholder="Máº­t kháº©u..." 
                          className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl pl-3 px-8 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#107c41] focus:bg-white"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowDialogPassword(!showDialogPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                        >
                          {showDialogPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 font-bold">
                        <Key className="w-3.5 h-3.5 text-slate-500" />
                        <span>MÃ£ PIN ca</span>
                      </label>
                      <input 
                        type="text" 
                        maxLength={6}
                        value={staffForm.pin}
                        onChange={(e) => setStaffForm({...staffForm, pin: e.target.value})}
                        placeholder="MÃ£ PIN..." 
                        className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#107c41] focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Avatar preset selection */}
                  <div className="space-y-2 pt-1">
                    <label className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider block font-bold">HÃ¬nh Ä‘áº¡i diá»‡n ca trá»±c</label>
                    <div className="flex items-center gap-2">
                      {AVATAR_PRESETS.map((url, idx) => {
                        const isChosen = staffForm.avatar === url;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setStaffForm({...staffForm, avatar: url})}
                            className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer shrink-0 ${
                              isChosen ? 'border-[#107c41] ring-2 ring-emerald-250 scale-105' : 'border-slate-200 hover:border-[#107c41]/40'
                            }`}
                          >
                            <img src={url} alt="preset" className="w-full h-full object-cover rounded-[10px]" referrerPolicy="no-referrer" />
                          </button>
                        );
                      })}
                    </div>
                    <div className="pt-0.5">
                      <input 
                        type="text" 
                        value={staffForm.avatar}
                        onChange={(e) => setStaffForm({...staffForm, avatar: e.target.value})}
                        placeholder="Hoáº·c dÃ¡n URL hÃ¬nh Ä‘áº¡i diá»‡n khÃ¡c..." 
                        className="w-full text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#107c41] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5 text-[10px] text-amber-700 font-semibold flex items-start gap-1.5 leading-relaxed">
                    <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>Há»‡ thá»‘ng khÃ³a: Báº¡n khÃ´ng thá»ƒ trá»±c tiáº¿p thay Ä‘á»•i vai trÃ², bá»™ pháº­n, vá»‹ trÃ­ hoáº·c tráº¡ng thÃ¡i cá»§a ca váº­n hÃ nh táº¡i Ä‘Ã¢y.</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 font-bold">
                        <Hash className="w-3 h-3 text-slate-400" />
                        <span>ID Váº­n HÃ nh</span>
                      </label>
                      <input 
                        type="text" 
                        disabled 
                        value={editingStaffId || ''}
                        className="w-full text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 cursor-not-allowed"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 font-bold">
                        <UserCheck className="w-3 h-3 text-slate-400" />
                        <span>MÃ£ NhÃ¢n Sá»±</span>
                      </label>
                      <input 
                        type="text" 
                        disabled 
                        value={staffForm.employeeCode}
                        className="w-full text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 font-bold">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        <span>Vai TrÃ² / Chá»©c danh</span>
                      </label>
                      <input 
                        type="text" 
                        disabled 
                        value={staffForm.role}
                        className="w-full text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 cursor-not-allowed"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 font-bold">
                        <Shield className="w-3 h-3 text-emerald-500" />
                        <span>Tráº¡ng thÃ¡i</span>
                      </label>
                      <div className="w-full text-xs font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-1.5 flex items-center gap-1.5 h-8.5 select-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>{staffForm.status === 'active' ? 'Äang hoáº¡t Ä‘á»™ng' : 'Ngá»«ng hoáº¡t Ä‘á»™ng'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 font-bold">
                        <Briefcase className="w-3 h-3 text-slate-400" />
                        <span>Bá»™ Pháº­n</span>
                      </label>
                      <input 
                        type="text" 
                        disabled 
                        value={staffForm.department}
                        className="w-full text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 cursor-not-allowed"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 font-bold">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>Vá»‹ TrÃ­ Trá»±c Ca</span>
                      </label>
                      <input 
                        type="text" 
                        disabled 
                        value={staffForm.position}
                        className="w-full text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 px-5 py-4 bg-slate-50 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setEditingStaffId(null)}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 font-bold border border-slate-250 rounded-xl cursor-pointer transition-colors"
              >
                Há»§y
              </button>
              <button
                type="button"
                onClick={handleEditStaffSave}
                className="px-4 py-2 bg-[#107c41] hover:bg-[#0c6232] text-white font-black rounded-xl cursor-pointer transition-colors flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                LÆ°u cáº­p nháº­t
              </button>
            </div>

          </div>
        </div>
      )}

      {/* FLOATING SUCCESS / ERROR TOAST NOTIFICATION - BOTTOM LEFT CORNER COORD */}
      {toast.show && (
        <div 
          className={`fixed bottom-6 left-6 z-50 flex items-center gap-3.5 px-4.5 py-3.5 rounded-2xl shadow-xl border animate-in slide-in-from-bottom duration-200 ${
            toast.type === 'success' 
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-sans shadow-[0_12px_24px_-8px_rgba(16,185,129,0.3)]' 
              : 'bg-rose-50 border-rose-300 text-rose-950 font-sans shadow-[0_12px_24px_-8px_rgba(244,63,94,0.3)]'
          }`}
          style={{ minWidth: '320px', maxWidth: '425px' }}
        >
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
            toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white'
          }`}>
            {toast.type === 'success' ? <Check className="w-5 h-5 stroke-[3]" /> : <X className="w-4.5 h-4.5 stroke-[3]" />}
          </div>
          <div className="flex-1 text-left font-sans min-w-0">
            <span className="text-[9px] font-extrabold uppercase tracking-widest block opacity-50">
              {toast.type === 'success' ? 'HoÃ n thÃ nh' : 'Gáº·p lá»—i ngoáº¡i lá»‡'}
            </span>
            <span className="text-[11.5px] font-extrabold leading-snug block mt-0.5 break-words">
              {toast.msg}
            </span>
          </div>
          <button 
            type="button" 
            onClick={() => setToast(prev => ({ ...prev, show: false }))}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 hover:bg-slate-100 rounded-lg shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}








