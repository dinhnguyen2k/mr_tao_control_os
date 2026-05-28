import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { 
  Home, 
  CheckSquare, 
  ListTodo, 
  Award, 
  AlertTriangle, 
  BarChart4, 
  BookMarked,
  HelpCircle,
  LogOut,
  Bell,
  Menu,
  ChevronRight,
  Sparkles,
  Layers,
  Shield,
  Users,
  Check,
  X,
  User,
  Phone,
  Mail,
  Briefcase,
  MapPin,
  UserCheck,
  Lock,
  Hash
} from 'lucide-react';

// Type definitions
import { TabType } from '../types/app.types';
import { ChecklistCategory, ChecklistItem } from '../types/checklist.types';
import { SOPIssue } from '../types/issues.types';
import { StaffRank } from '../types/kpi.types';
import { DailyReport } from '../types/reports.types';
import { TaskItem } from '../types/tasks.types';
import { KPIStats } from '../types/today.types';

// Initial Data
import { 
  DEFAULT_STORE_ID,
  INITIAL_KPI_STATS, 
  INITIAL_CHECKLIST_CATEGORIES, 
  INITIAL_CHECKLIST_ITEMS, 
  INITIAL_TASKS, 
  INITIAL_STAFF_RANKS, 
  INITIAL_SOP_ISSUES, 
  DAILY_REPORT_DATA 
} from '../data';

// Components
import TodayView from './Today/TodayView';
import ChecklistView from './Checklist/ChecklistView';
import TasksView from './Tasks/TasksView';
import KpiView from './Kpi/KpiView';
import IssuesView from './Issues/IssuesView';
import ReportsView from './Reports/ReportsView';
import HandbookView from './Handbook/HandbookView';
import LoginView from './Login/LoginView';
import StaffPermissionsView from './StaffPermissions/StaffPermissionsView';
import NotificationsView from './Notifications/NotificationsView';
import { ScrollArea } from '../shared/components/scroll-area';
import { useAppStore } from '../stores/app-store';
import Logo from './Logo';
import { signOutInternalStaff } from '../services/admin/internal-auth-service';


export interface UserSession {
  username: string;
  fullName: string;
  role: string;
  avatar?: string;
  id?: string;
  employeeCode?: string;
  phone?: string;
  email?: string;
  department?: string;
  position?: string;
  statusLabel?: string;
}

export function enrichSessionWithDefaultFields(user: any): UserSession {
  if (!user) {
    return {
      username: 'sales',
      fullName: 'Nguyễn Văn A',
      role: 'Nhân viên bán lẻ',
      id: 'NV-002',
      employeeCode: 'MNS-002',
      phone: '0987654321',
      email: 'sales@mrtaocoop.com',
      department: 'Phòng Kinh Doanh',
      position: 'Quầy Bán Lẻ Hàng Hóa',
      statusLabel: 'Đang hoạt động',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
    };
  }
  const username = user.username || 'admin';
  const fullName = user.fullName || (username === 'admin' ? 'Nguyễn Minh Đức' : username === 'sales' ? 'Nguyễn Văn A' : username === 'tech' ? 'Trần Thị B' : 'Lê Hoàng C');
  const role = user.role || (username === 'admin' ? 'Chủ cửa hàng' : username === 'sales' ? 'Nhân viên bán lẻ' : username === 'tech' ? 'Kỹ thuật viên' : 'Quản lý cửa hàng');
  
  return {
    username,
    fullName,
    role,
    avatar: user.avatar || (username === 'admin' 
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' 
      : username === 'sales' 
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'),
    id: user.id || (username === 'admin' ? 'NV-001' : username === 'sales' ? 'NV-002' : username === 'tech' ? 'NV-003' : 'NV-005'),
    employeeCode: user.employeeCode || user.maNhanSu || (username === 'admin' ? 'MNS-001' : username === 'sales' ? 'MNS-002' : username === 'tech' ? 'MNS-003' : 'MNS-005'),
    phone: user.phone || (username === 'admin' ? '0912345678' : username === 'sales' ? '0987654321' : username === 'tech' ? '0901238899' : '0944556677'),
    email: user.email || (username === 'admin' ? 'duc.nm@mrtaocoop.com' : username === 'sales' ? 'sales@mrtaocoop.com' : username === 'tech' ? 'tech@mrtaocoop.com' : 'manager@mrtaocoop.com'),
    department: user.department || user.boPhan || (username === 'admin' ? 'Ban Điều Hành' : username === 'sales' ? 'Phòng Kinh Doanh' : username === 'tech' ? 'Ban Kỹ Thuật' : 'Ban Quản Lý'),
    position: user.position || user.viTri || (username === 'admin' ? 'Quầy Trưởng Showroom' : username === 'sales' ? 'Quầy Bán Lẻ Hàng Hóa' : username === 'tech' ? 'Bàn Sửa Chữa & Thẩm Định' : 'Phòng Làm Việc'),
    statusLabel: user.statusLabel || user.trangThai || 'Đang hoạt động'
  };
}

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const activeTab = useAppStore((state) => state.activeTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const currentUser = useAppStore((state) => state.currentUser);
  const handleLogin = useAppStore((state) => state.login);
  const clearSession = useAppStore((state) => state.logout);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tabTransitioning, setTabTransitioning] = useState(false);

  useEffect(() => {
    setTabTransitioning(true);
    const timer = setTimeout(() => {
      setTabTransitioning(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [activeTab]);

  useEffect(() => {
    if (!currentUser?.sessionExpiresAt) {
      return;
    }

    const delayMs = currentUser.sessionExpiresAt - Date.now();
    if (delayMs <= 0) {
      void handleLogout();
      return;
    }

    const sessionTimer = window.setTimeout(() => {
      void handleLogout();
    }, delayMs);

    return () => window.clearTimeout(sessionTimer);
  }, [currentUser?.sessionExpiresAt]);

  // User profile popover edit state
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);
  const [popoverTab, setPopoverTab] = useState<'editable' | 'readonly'>('editable');
  const [editFullName, setEditFullName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  
  // Additional profile fields state
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editId, setEditId] = useState('');
  const [editMaNhanSu, setEditMaNhanSu] = useState('');
  const [editBoPhan, setEditBoPhan] = useState('');
  const [editViTri, setEditViTri] = useState('');
  const [editTrangThai, setEditTrangThai] = useState('');

  // Central React States
  const [stats, setStats] = useState<KPIStats>(INITIAL_KPI_STATS);
  const [checklistCategories, setChecklistCategories] = useState<ChecklistCategory[]>(INITIAL_CHECKLIST_CATEGORIES);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(INITIAL_CHECKLIST_ITEMS);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [staffRanks, setStaffRanks] = useState<StaffRank[]>(INITIAL_STAFF_RANKS);
  const [issues, setIssues] = useState<SOPIssue[]>(INITIAL_SOP_ISSUES);
  const [dailyReport, setDailyReport] = useState<DailyReport>(DAILY_REPORT_DATA);
  const activeStoreId = dailyReport.storeId || DEFAULT_STORE_ID;

  const handleLogout = async () => {
    try {
      await signOutInternalStaff();
    } finally {
      clearSession();
    }
  };

  // --- ACTIONS & STATE MODIFIERS ---

  // Checklist Item completed toggler
  const handleToggleChecklistItem = (itemId: string) => {
    const updatedItems = checklistItems.map(item => {
      if (item.id === itemId) {
        return { ...item, isCompleted: !item.isCompleted };
      }
      return item;
    });
    setChecklistItems(updatedItems);
    recalculateChecklistProgress(updatedItems, checklistCategories);
  };

  // Add sub checklist item inside existing category
  const handleAddingChecklistItem = (categoryId: string, title: string) => {
    const newItem: ChecklistItem = {
      id: `custom-chk-${Date.now()}`,
      storeId: activeStoreId,
      categoryId,
      title,
      isCompleted: false
    };
    
    const updatedItems = [...checklistItems, newItem];
    setChecklistItems(updatedItems);

    // Update Category total count
    const updatedCategories = checklistCategories.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, countTotal: cat.countTotal + 1, isCompleted: false };
      }
      return cat;
    });
    setChecklistCategories(updatedCategories);
    recalculateChecklistProgress(updatedItems, updatedCategories);
  };

  // Create new category group
  const handleAddingChecklistCategory = (title: string) => {
    const newId = `cat-${Date.now()}`;
    const newCat: ChecklistCategory = {
      id: newId,
      storeId: activeStoreId,
      title,
      countDone: 0,
      countTotal: 0,
      isCompleted: false
    };
    setChecklistCategories([...checklistCategories, newCat]);
  };

  // Recalculates category counters and today kpi completion ratio
  const recalculateChecklistProgress = (itemsList: ChecklistItem[], categoriesList: ChecklistCategory[]) => {
    let totalDoneAll = 0;
    let totalCountAll = 0;

    const updatedCategories = categoriesList.map(cat => {
      const catItems = itemsList.filter(it => it.categoryId === cat.id);
      const doneValue = catItems.filter(it => it.isCompleted).length;
      const totalValue = catItems.length;
      
      totalDoneAll += doneValue;
      totalCountAll += totalValue;

      return {
        ...cat,
        countDone: doneValue,
        countTotal: totalValue,
        isCompleted: totalValue > 0 && doneValue === totalValue
      };
    });

    setChecklistCategories(updatedCategories);

    // Flow ratio back to KPIStats today checklist percent
    const overallRatio = totalCountAll > 0 ? Math.round((totalDoneAll / totalCountAll) * 105) : stats.checklistCompletion;
    const finalPercent = overallRatio > 100 ? 100 : overallRatio;
    
    setStats(prev => ({
      ...prev,
      checklistCompletion: finalPercent
    }));
  };

  // Add Task handler
  const handleAddTask = (taskParam: Omit<TaskItem, 'id' | 'storeId'>) => {
    const newTask: TaskItem = {
      ...taskParam,
      storeId: activeStoreId,
      id: `task-${Date.now()}`
    };
    setTasks([newTask, ...tasks]);
    
    // Update KPIStats counts
    setStats(prev => ({
      ...prev,
      delayedTasksCount: taskParam.status !== 'completed' && taskParam.deadline.includes('08/05')
        ? prev.delayedTasksCount + 1 
        : prev.delayedTasksCount
    }));
  };

  // Update Task Status
  const handleUpdateTaskStatus = (taskId: string, status: TaskItem['status']) => {
    const previousTask = tasks.find(t => t.id === taskId);
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, status };
      }
      return t;
    });
    setTasks(updatedTasks);

    // Re-calculate stats delayed count
    let changeLate = 0;
    if (previousTask) {
      const isLateDeadline = previousTask.deadline.includes('08/05') || previousTask.deadline.includes('Trễ');
      if (isLateDeadline) {
        if (status === 'completed' && previousTask.status !== 'completed') {
          changeLate = -1;
        } else if (status !== 'completed' && previousTask.status === 'completed') {
          changeLate = 1;
        }
      }
    }

    setStats(prev => ({
      ...prev,
      delayedTasksCount: Math.max(0, prev.delayedTasksCount + changeLate)
    }));
  };

  // Add SOP error / Improvement item
  const handleAddIssue = (issueParam: Omit<SOPIssue, 'id' | 'storeId'>) => {
    const newIssue: SOPIssue = {
      ...issueParam,
      storeId: activeStoreId,
      id: `issue-${Date.now()}`
    };
    setIssues([newIssue, ...issues]);

    // If it's a SOP error for Today, increment Count
    if (issueParam.category === 'sop_error') {
      setStats(prev => ({
        ...prev,
        sopErrorsCount: prev.sopErrorsCount + 1
      }));
    }
  };

  // Change Issue status
  const handleUpdateIssueStatus = (issueId: string, status: SOPIssue['status']) => {
    const updatedIssues = issues.map(iss => {
      if (iss.id === issueId) {
        return { ...iss, status };
      }
      return iss;
    });
    setIssues(updatedIssues);
  };

  // --- COMPONENT MANDATED RENDER TRAGETS ---
  // The prompt explicitly requires writing these specific function names:

  /**
   * Màn hình 1: Hôm nay
   */
  function renderToday() {
    // Computes dynamic counts
    const completedChecklistsCount = checklistItems.filter(it => it.isCompleted).length;
    const totalChecklistsCount = checklistItems.length;

    return (
      <TodayView 
        stats={stats} 
        onSetTab={setActiveTab}
        completedChecklistsCount={completedChecklistsCount}
        totalChecklistsCount={totalChecklistsCount}
      />
    );
  }

  /**
   * Màn hình 2: Checklist & Quy trình
   */
  function renderChecklist() {
    return (
      <ChecklistView 
        categories={checklistCategories}
        items={checklistItems}
        onToggleItem={handleToggleChecklistItem}
        onAddItem={handleAddingChecklistItem}
        onAddCategory={handleAddingChecklistCategory}
      />
    );
  }

  /**
   * Màn hình 3: Giao việc
   */
  function renderTasks() {
    return (
      <TasksView 
        tasks={tasks}
        onAddTask={handleAddTask}
        onUpdateTaskStatus={handleUpdateTaskStatus}
      />
    );
  }

  /**
   * Màn hình 4: KPI
   */
  function renderKpi() {
    return (
      <KpiView 
        staffRanks={staffRanks}
        onSetTab={setActiveTab}
      />
    );
  }

  /**
   * Màn hình 5: Lỗi SOP & Cải tiến
   */
  function renderIssues() {
    return (
      <IssuesView 
        issues={issues}
        onAddIssue={handleAddIssue}
        onUpdateIssueStatus={handleUpdateIssueStatus}
      />
    );
  }

  /**
   * Màn hình 6: Báo cáo
   */
  function renderReports() {
    return (
      <ReportsView 
        dailyReport={dailyReport}
        stats={stats}
        checklistItems={checklistItems}
        tasks={tasks}
        issues={issues}
        currentUser={currentUser}
      />
    );
  }

  /**
   * Màn hình 7: Sổ tay hệ thống
   */
  function renderHandbook() {
    return (
      <HandbookView />
    );
  }

  const renderSkeletonLoader = () => {
    return (
      <div className="space-y-4 animate-pulse text-left p-1 select-none">
        {/* Header Block skeleton */}
        <div className="bg-white h-20 rounded-2xl border border-slate-100 p-5 flex flex-col justify-center gap-2">
          <div className="h-4.5 bg-slate-200/70 rounded w-1/4"></div>
          <div className="h-3 bg-slate-200/50 rounded w-1/3"></div>
        </div>

        {/* Content Layout structure switcher skeleton */}
        {activeTab === 'Today' ? (
          <div className="space-y-4">
            <div className="h-28 bg-white rounded-2xl border border-slate-100"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="h-64 bg-white rounded-2xl border border-slate-100"></div>
              <div className="h-64 bg-white rounded-2xl border border-slate-100"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-12 bg-white rounded-xl border border-slate-100"></div>
            <div className="bg-white rounded-2xl border border-slate-100 h-80 flex flex-col p-5 gap-4 justify-between">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 bg-slate-100 rounded-lg"></div>
                ))}
              </div>
              <div className="h-8 bg-slate-100 rounded-lg w-1/3"></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Choose component content selector
  const renderActiveScreen = () => {
    if (tabTransitioning) {
      return renderSkeletonLoader();
    }
    switch (activeTab) {
      case 'Today': return renderToday();
      case 'Notifications': return <NotificationsView />;
      case 'Checklist': return renderChecklist();
      case 'Tasks': return renderTasks();
      case 'KPI': return renderKpi();
      case 'SOP': return renderIssues();
      case 'Reports': return renderReports();
      case 'Handbook': return renderHandbook();
      case 'Staff': return <StaffPermissionsView currentUser={currentUser ? { fullName: currentUser.fullName, role: currentUser.role, user: currentUser.username } : null} />;
      default: return renderToday();
    }
  };

  // UI lists of sidebar options
  const sidebarLinks = [
    { key: 'Today', label: 'Hôm nay', icon: Home },
    { key: 'Checklist', label: 'Checklist', icon: CheckSquare },
    { key: 'Tasks', label: 'Giao việc', icon: ListTodo },
    { key: 'KPI', label: 'KPI', icon: Award },
    { key: 'SOP', label: 'Lỗi SOP / Ngoại lệ', icon: AlertTriangle },
    { key: 'Reports', label: 'Báo cáo', icon: BarChart4 },
    { key: 'Handbook', label: 'Sổ tay chuẩn', icon: BookMarked },
    { key: 'Staff', label: 'Tài khoản', icon: Users },
  ];

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-surface-bg flex justify-center w-full antialiased p-0">
      <div className="w-full flex flex-col md:flex-row p-0 gap-0 min-w-0">
      
      {/* 1. DESKTOP SIDE BAR NAVIGATION */}
      <aside className="hidden md:flex flex-col w-[240px] bg-white border-r border-slate-200 shrink-0 sticky top-0 h-screen shadow-xs text-slate-700 py-5 px-4">
        {/* Brand identity area */}
        <div className="px-2 pb-4 mb-4 border-b border-slate-100 flex items-center justify-start">
          <Logo size="sm" variant="dark" />
        </div>

        {/* Dynamic Nav link Items */}
        <ScrollArea className="flex-1 pr-1 my-2">
          <nav className="space-y-1">
            {sidebarLinks.map((link) => {
              const IconComp = link.icon;
              const isSelected = activeTab === link.key;
              return (
                <button
                  key={link.key}
                  onClick={() => {
                    setActiveTab(link.key as TabType);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-left text-xs font-semibold transition-all group cursor-pointer ${
                    isSelected 
                      ? 'bg-[#C21A1A] text-white shadow-xs' 
                      : 'text-slate-600 hover:bg-rose-50 hover:text-[#C21A1A] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-500 group-hover:text-[#C21A1A]'}`} />
                    <span>{link.label}</span>
                  </div>
                  {!isSelected && <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-[#C21A1A] transition-opacity translate-x-[-2px] group-hover:translate-x-0" />}
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer info moved into Sidebar */}
        <div className="pt-3 pb-1 border-t border-slate-100 flex flex-col items-center justify-center select-none text-center shrink-0">
          <span className="text-[10.5px] font-bold text-slate-500 tracking-wide">Powered by NguyenTD</span>
          <span className="text-[9.5px] text-slate-400 font-mono font-semibold mt-0.5">v1.2.0</span>
        </div>
      </aside>

      {/* 2. MOBILE TOP NAVIGATION BAR */}
      <header className="md:hidden sticky top-0 bg-[#C21A1A] border-b border-rose-800 h-16 w-full px-4 flex items-center justify-between z-40 shadow-md">
        <Logo size="xs" variant="light" />

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button 
            onClick={() => { setActiveTab('Notifications'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`p-1.5 text-white hover:bg-white/10 rounded-lg cursor-pointer relative ${activeTab === 'Notifications' ? 'bg-white/20' : ''}`}
            title="Thông báo"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span>
          </button>
          {/* Expand and responsive menu pop triggers */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-white hover:bg-white/10 rounded-lg cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 3. MOBILE BOTTOM DRAWER MENU SHEET */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          {/* Dark backdrop overlay with slate tint and subtle blur */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-45"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sliding up panel */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-8px_32px_rgba(0,0,0,0.12)] z-50 p-5 pb-8 animate-in slide-in-from-bottom duration-250 flex flex-col border-t border-slate-200">
            {/* Horizontal grab handle indicator */}
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4 shrink-0" />

            {/* Profile row area */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-3.5 shrink-0">
              <div className="flex items-center gap-3">
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt="Avatar" className="w-9 h-9 rounded-full border border-slate-200 object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs uppercase font-extrabold">
                    {currentUser?.fullName.charAt(0)}
                  </div>
                )}
                <div className="text-left font-sans">
                  <span className="text-sm font-black text-slate-800 block leading-tight">{currentUser?.fullName}</span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 leading-none">{currentUser?.role}</p>
                </div>
              </div>
              
              <button 
                onClick={handleLogout}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-500 font-extrabold text-[10px] rounded-xl border border-rose-150 uppercase tracking-wider cursor-pointer transition-all"
              >
                Đăng xuất
              </button>
            </div>

            {/* Title */}
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 select-none text-left shrink-0">HỆ THỐNG PHÂN HỆ VẬN HÀNH</p>
            
            {/* 2-column navigation grid inside bottom sheet */}
            <div className="grid grid-cols-2 gap-2.5 pb-5 overflow-y-auto max-h-[35vh]">
              {sidebarLinks.map((link) => {
                const IconComp = link.icon;
                const isSelected = activeTab === link.key;
                return (
                  <button
                    key={link.key}
                    onClick={() => {
                      setActiveTab(link.key as TabType);
                      setMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl text-left text-xs font-black transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-[#C21A1A] text-white shadow-xs' 
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-150/50'
                    }`}
                  >
                    <IconComp className={`w-4 h-4 shrink-0 col-span-1 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                    <span className="truncate">{link.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom cancel close button */}
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 active:scale-99 text-slate-700 font-black text-xs uppercase tracking-wider rounded-xl border border-slate-250 cursor-pointer transition-all shrink-0 text-center"
            >
              Đóng menu
            </button>
          </div>
        </div>
      )}

      {/* 4. MAIN LAYOUT CONTAINER CANVAS */}
      <main className="flex-1 flex flex-col gap-0 min-h-0">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between h-14 px-6 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
          {/* Header Left: Current Screen Title or Breadcrumb */}
          <div className="flex items-center gap-3 select-none">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">MR.TÁO OS</span>
            <span className="text-slate-300 text-[10px]">\</span>
            <span className="text-[11px] font-black text-[#C21A1A] uppercase tracking-widest">
              {activeTab === 'Today' ? 'Tổng quan Hôm nay' :
               activeTab === 'Notifications' ? 'Thông báo Phê duyệt' :
               activeTab === 'Checklist' ? 'Hồ sơ Checklist ca trực' :
               activeTab === 'Tasks' ? 'Giao phó công việc' :
               activeTab === 'KPI' ? 'Chỉ số hiệu kỹ (KPI)' :
               activeTab === 'SOP' ? 'Ngoại lệ & Lỗi SOP' :
               activeTab === 'Reports' ? 'Báo cáo tổng kết ca' :
               activeTab === 'Handbook' ? 'Sổ tay Vận hành chuẩn (SOP)' :
               activeTab === 'Staff' ? 'Phân quyền cộng tác viên' : 'Hệ thống'}
            </span>
          </div>

          {/* Header Right: Account Details + Notification Bell + Fast Actions */}
          <div className="flex items-center gap-5">
            {/* Quick Helper Button */}
            <button 
              className="px-3 py-1.5 bg-[#C21A1A]/5 border border-rose-100 text-[#C21A1A] hover:bg-[#C21A1A]/10 rounded-xl text-[10.5px] font-black tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
              title="Hướng dẫn chuẩn SOP"
              onClick={() => setActiveTab('Handbook')}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Trợ giúp &amp; HD SOP</span>
            </button>

            {/* Notification Bell Button with badge count */}
            <button
              onClick={() => {
                setActiveTab('Notifications');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer relative ${
                activeTab === 'Notifications'
                  ? 'bg-rose-50 border-rose-300 text-[#C21A1A] ring-2 ring-rose-250/20'
                  : 'bg-slate-50 border-slate-200 hover:bg-[#C21A1A]/5 hover:border-rose-150 hover:text-[#C21A1A] text-slate-500'
              }`}
              title="Danh sách Phê duyệt ngoại lệ"
            >
              <Bell className="w-4 h-4" />
              {/* Pulse marker icon */}
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C21A1A] text-[8px] font-black text-white border border-white">
                4
              </span>
            </button>

            {/* Account Profile Bar with Popover */}
            <div className="relative">
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  const enriched = enrichSessionWithDefaultFields(currentUser);
                  setEditFullName(enriched.fullName || '');
                  setEditRole(enriched.role || '');
                  setEditAvatar(enriched.avatar || '');
                  setEditPhone(enriched.phone || '');
                  setEditEmail(enriched.email || '');
                  setEditId(enriched.id || '');
                  setEditMaNhanSu(enriched.employeeCode || '');
                  setEditBoPhan(enriched.department || '');
                  setEditViTri(enriched.position || '');
                  setEditTrangThai(enriched.statusLabel || 'Đang hoạt động');
                  setPopoverTab('editable');
                  setUserPopoverOpen(!userPopoverOpen);
                }}
                className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer group select-none"
                title="Cập nhật thông tin vận hành"
              >
                <div className="text-right leading-tight">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono font-bold">Phiên vận hành</span>
                  <span className="text-[11.5px] font-black text-slate-800 group-hover:text-[#C21A1A] transition-colors block">{currentUser?.fullName}</span>
                  <span className="text-[9.5px] font-bold text-slate-500 opacity-95 block leading-none mt-0.5">{currentUser?.role}</span>
                </div>

                {currentUser?.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt="Avatar" 
                    className="w-10 h-10 rounded-xl border-2 border-slate-200 group-hover:border-[#C21A1A] transition-all object-cover shrink-0" 
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-[#C21A1A] text-white flex items-center justify-center text-xs font-black shrink-0">
                    {currentUser?.fullName?.charAt(0)}
                  </div>
                )}
              </div>

              {/* Popover Card */}
              {userPopoverOpen && (
                <>
                  {/* Invisible global click-outside overlay */}
                  <div 
                    className="fixed inset-0 z-40 cursor-default" 
                    onClick={() => setUserPopoverOpen(false)}
                  />
                  
                  {/* Popover Card Content */}
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 mt-3.5 w-84 bg-white border border-slate-250/90 rounded-2xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-150 text-left space-y-3.5"
                  >
                    {/* Header */}
                    <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
                      <div className="text-left">
                        <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Cập Nhật Tài Khoản Ca</h4>
                        <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">Thay đổi thông tin phiên vận hành chuẩn</p>
                      </div>
                      <button 
                        onClick={() => setUserPopoverOpen(false)}
                        className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-55 rounded-lg transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Popover Tabs Selector */}
                    <div className="flex border-b border-slate-100 pb-0.5">
                      <button
                        onClick={() => setPopoverTab('editable')}
                        className={`flex-1 pb-2 text-center text-[10px] font-black uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                          popoverTab === 'editable' ? 'border-[#C21A1A] text-[#C21A1A]' : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        ✏️ Thay đổi
                      </button>
                      <button
                        onClick={() => setPopoverTab('readonly')}
                        className={`flex-1 pb-2 text-center text-[10px] font-black uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                          popoverTab === 'readonly' ? 'border-[#C21A1A] text-[#C21A1A]' : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        🔒 Hệ thống (Cố định)
                      </button>
                    </div>

                    {/* Content depending on selected tab */}
                    {popoverTab === 'editable' ? (
                      <div className="space-y-3 text-xs max-h-[300px] overflow-y-auto pr-1">
                        {/* Name input */}
                        <div className="space-y-1">
                          <label className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            <span>Họ và Tên</span>
                          </label>
                          <input 
                            type="text" 
                            value={editFullName}
                            onChange={(e) => setEditFullName(e.target.value)}
                            placeholder="Nhập họ tên đầy đủ..." 
                            className="w-full text-xs font-bold text-slate-750 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#C21A1A] focus:bg-white"
                          />
                        </div>

                        {/* Phone & Email side-by-side or stacked cleanly */}
                        <div className="space-y-1">
                          <label className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span>Số điện thoại</span>
                          </label>
                          <input 
                            type="text" 
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            placeholder="Nhập số điện thoại..." 
                            className="w-full text-xs font-bold text-slate-750 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#C21A1A] focus:bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <span>Hộp thư Email</span>
                          </label>
                          <input 
                            type="email" 
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            placeholder="Nhập email..." 
                            className="w-full text-xs font-bold text-slate-750 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#C21A1A] focus:bg-white"
                          />
                        </div>

                        {/* Quick Avatar selection */}
                        <div className="space-y-1 pt-1">
                          <label className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider block">Hình đại diện ca trực</label>
                          
                          {/* Quick preset grids */}
                          <div className="flex items-center gap-2 py-1">
                            {[
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
                              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
                            ].map((url, idx) => {
                              const isChosen = editAvatar === url;
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setEditAvatar(url)}
                                  className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer shrink-0 ${
                                    isChosen ? 'border-[#C21A1A] ring-2 ring-rose-200 scale-105' : 'border-slate-200 hover:border-[#C21A1A]/40'
                                  }`}
                                >
                                  <img src={url} alt="preset" className="w-full h-full object-cover rounded-[10px]" referrerPolicy="no-referrer" />
                                </button>
                              );
                            })}
                          </div>

                          {/* URL custom input */}
                          <div className="pt-0.5">
                            <input 
                              type="text" 
                              value={editAvatar}
                              onChange={(e) => setEditAvatar(e.target.value)}
                              placeholder="Hoặc dán URL hình đại diện khác..." 
                              className="w-full text-[10px] font-semibold text-slate-550 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#C21A1A] focus:bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 text-xs">
                        <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-2 text-[9.5px] text-amber-700 font-semibold mb-1 flex items-start gap-1.5 leading-relaxed">
                          <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>Hệ thống khóa: Bạn không thể tự ý thay đổi vai trò, bộ phận, vị trí hoặc trạng thái của ca vận hành.</span>
                        </div>

                        {/* ID & Employee code */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                              <Hash className="w-3 h-3 text-slate-400" />
                              <span>ID Vận Hành</span>
                            </label>
                            <input 
                              type="text" 
                              disabled 
                              value={editId}
                              className="w-full text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 cursor-not-allowed"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                              <UserCheck className="w-3 h-3 text-slate-400" />
                              <span>Mã Nhân Sự</span>
                            </label>
                            <input 
                              type="text" 
                              disabled 
                              value={editMaNhanSu}
                              className="w-full text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 cursor-not-allowed"
                            />
                          </div>
                        </div>

                        {/* Role & status */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                              <Briefcase className="w-3 h-3 text-slate-400" />
                              <span>Vai Trò / Chức danh</span>
                            </label>
                            <input 
                              type="text" 
                              disabled 
                              value={editRole}
                              className="w-full text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 cursor-not-allowed"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                              <Shield className="w-3 h-3 text-emerald-500" />
                              <span>Trạng thái</span>
                            </label>
                            <div className="w-full text-xs font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-1.5 flex items-center gap-1.5 h-8 select-none">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              <span>{editTrangThai}</span>
                            </div>
                          </div>
                        </div>

                        {/* Department & location */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                              <Briefcase className="w-3 h-3 text-slate-400" />
                              <span>Bộ Phận</span>
                            </label>
                            <input 
                              type="text" 
                              disabled 
                              value={editBoPhan}
                              className="w-full text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 cursor-not-allowed"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>Vị Trí Trực Ca</span>
                            </label>
                            <input 
                              type="text" 
                              disabled 
                              value={editViTri}
                              className="w-full text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Buttons CTA */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setUserPopoverOpen(false)}
                        className="px-2.5 py-1.5 border border-slate-250 hover:bg-slate-55 text-slate-500 rounded-lg font-bold cursor-pointer transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (editFullName.trim() === '') return;
                          
                          // Merge edited ones with existing system locking properties
                          const updatedSession = {
                            username: currentUser?.username || 'admin',
                            fullName: editFullName.trim(),
                            avatar: editAvatar || currentUser?.avatar,
                            phone: editPhone.trim(),
                            email: editEmail.trim(),
                            
                            // Locked/Read-only fields remain unchanged
                            id: currentUser?.id || editId || 'NV-001',
                            employeeCode: currentUser?.employeeCode || editMaNhanSu || 'MNS-001',
                            role: currentUser?.role || editRole || 'Chủ cửa hàng',
                            department: currentUser?.department || editBoPhan || 'Ban Điều Hành',
                            position: currentUser?.position || editViTri || 'Quầy Trưởng Showroom',
                            statusLabel: currentUser?.statusLabel || editTrangThai || 'Đang hoạt động'
                          };
                          handleLogin(updatedSession);
                          setUserPopoverOpen(false);
                        }}
                        className="px-3.5 py-1.5 bg-[#C21A1A] hover:bg-[#A31616] text-white rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Lưu cập nhật</span>
                      </button>
                    </div>

                  </div>
                </>
              )}
            </div>

            {/* Logout button in header */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-500 border border-slate-200 hover:border-rose-200 cursor-pointer transition-all"
              title="Đăng xuất ca trực"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="p-4 md:p-6 pb-20 md:pb-6 w-full max-w-[1536px] mx-auto space-y-4">
          {/* Render Active View Target */}
          {renderActiveScreen()}
        </div>

        {/* Bottom footer removed */}
      </main>

      {/* 5. MOBILE BOTTOM FAST TAPPING NAVIGATION PANEL */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 px-2 flex justify-around items-center z-45 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] rounded-t-2xl pb-safe">
        <button 
          onClick={() => { setActiveTab('Today'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`flex flex-col items-center justify-center flex-1 h-full font-bold relative cursor-pointer ${activeTab === 'Today' ? 'text-[#C21A1A]' : 'text-slate-400'}`}
        >
          <Home className="w-4.5 h-4.5 mb-1" />
          <span className="text-[10px]">Hôm nay</span>
          {activeTab === 'Today' && <span className="absolute bottom-1 w-4 h-0.5 bg-[#C21A1A] rounded-full"></span>}
        </button>

        <button 
          onClick={() => { setActiveTab('Checklist'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`flex flex-col items-center justify-center flex-1 h-full font-bold relative cursor-pointer ${activeTab === 'Checklist' ? 'text-[#C21A1A]' : 'text-slate-400'}`}
        >
          <CheckSquare className="w-4.5 h-4.5 mb-1" />
          <span className="text-[10px]">Checklist</span>
          {activeTab === 'Checklist' && <span className="absolute bottom-1 w-4 h-0.5 bg-[#C21A1A] rounded-full"></span>}
        </button>

        <button 
          onClick={() => { setActiveTab('Tasks'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`flex flex-col items-center justify-center flex-1 h-full font-bold relative cursor-pointer ${activeTab === 'Tasks' ? 'text-[#C21A1A]' : 'text-slate-400'}`}
        >
          <ListTodo className="w-4.5 h-4.5 mb-1" />
          <span className="text-[10px]">Giao việc</span>
          {activeTab === 'Tasks' && <span className="absolute bottom-1 w-4 h-0.5 bg-[#C21A1A] rounded-full"></span>}
        </button>

        <button 
          onClick={() => { setActiveTab('KPI'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className={`flex flex-col items-center justify-center flex-1 h-full font-bold relative cursor-pointer ${activeTab === 'KPI' ? 'text-[#C21A1A]' : 'text-slate-400'}`}
        >
          <Award className="w-4.5 h-4.5 mb-1" />
          <span className="text-[10px]">KPI</span>
          {activeTab === 'KPI' && <span className="absolute bottom-1 w-4 h-0.5 bg-[#C21A1A] rounded-full"></span>}
        </button>

        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`flex flex-col items-center justify-center flex-1 h-full font-bold relative cursor-pointer ${mobileMenuOpen ? 'text-[#C21A1A]' : 'text-slate-400'}`}
        >
          <Layers className="w-4.5 h-4.5 mb-1" />
          <span className="text-[10px]">Menu</span>
        </button>
      </nav>

      </div>
    </div>
  );
}

