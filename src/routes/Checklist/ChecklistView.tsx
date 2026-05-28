import React, { useEffect, useMemo, useState } from 'react';
import { 
  Plus, 
  Layers, 
  Wrench, 
  Warehouse, 
  Coins, 
  CheckCircle, 
  CheckCircle2, 
  Smile, 
  Info,
  Calendar,
  Search,
  SlidersHorizontal,
  Image,
  User,
  Circle,
  FileText,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Sparkles,
  ClipboardList,
  AlertTriangle,
  X,
  Edit2,
  Trash2,
  Check,
  Clock,
  Award,
  AlertCircle
} from 'lucide-react';
import { ChecklistCategory, ChecklistItem } from '../../types/checklist.types';

interface ChecklistViewProps {
  todayCategories: ChecklistCategory[];
  processCategories: ChecklistCategory[];
  items: ChecklistItem[];
  allChecklistItems?: ChecklistItem[];
  onToggleItem: (itemId: string) => void;
  roleOptions: Array<{ code: string; name: string }>;
  defaultRoleCode: string;
  onCreateRoleChecklist: (roleCode: string, categoryId: string, checklistName: string, taskTitle: string) => void;
  onCreateTodayChecklistBatch?: (roleCode: string, categoryId: string, checklistName: string, tasksList: Array<{ title: string; timeLimit?: string }>) => Promise<void>;
  onCreateRoleChecklistBatch?: (roleCode: string, categoryId: string, checklistName: string, tasksList: Array<{ title: string; timeLimit?: string }>) => Promise<void>;
  onCreateCategory?: (title: string, categoryType: 'today' | 'process') => Promise<void>;
  onUpdateCategory?: (id: string, title: string, categoryType: 'today' | 'process') => Promise<void>;
  onDeleteCategory?: (id: string, categoryType: 'today' | 'process') => Promise<void>;
  onDeleteChecklistItem?: (itemId: string) => Promise<void>;
  onUpdateChecklistItem?: (itemId: string, updates: Partial<ChecklistItem>) => Promise<void>;
  permissions: {
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
  errorMessage?: string | null;
  onDismissError?: () => void;
}

// Map category metadata dynamically for theme symmetry matching the reference phone UI image
const CATEGORY_META: Record<string, {
  label: string;
  themeColor: string; // Tailwinds classes
  barColor: string;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  accentHex: string;
}> = {
  opening: {
    label: '1. Mở cửa',
    themeColor: 'border-emerald-200 bg-emerald-50/20 text-emerald-800',
    barColor: 'bg-emerald-600',
    iconBg: 'bg-emerald-100 text-emerald-700',
    iconColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-100/70 text-emerald-850',
    accentHex: '#107c41'
  },
  sales: {
    label: '2. Bán hàng – Bàn giao',
    themeColor: 'border-blue-200 bg-blue-50/20 text-blue-800',
    barColor: 'bg-blue-600',
    iconBg: 'bg-blue-100 text-blue-700',
    iconColor: 'text-blue-600',
    badgeBg: 'bg-blue-100/70 text-blue-850',
    accentHex: '#0066CC'
  },
  cleaning: {
    label: '3. Sửa chữa – Bảo hành',
    themeColor: 'border-amber-200 bg-amber-50/20 text-amber-800',
    barColor: 'bg-amber-500',
    iconBg: 'bg-amber-100 text-amber-700',
    iconColor: 'text-amber-600',
    badgeBg: 'bg-amber-100/70 text-amber-850',
    accentHex: '#E67E22'
  },
  inventory: {
    label: '4. Kho – Kiểm kê',
    themeColor: 'border-purple-200 bg-purple-50/20 text-purple-800',
    barColor: 'bg-purple-600',
    iconBg: 'bg-purple-100 text-purple-700',
    iconColor: 'text-purple-600',
    badgeBg: 'bg-purple-100/70 text-purple-850',
    accentHex: '#8E44AD'
  },
  closing: {
    label: '5. Chốt ca – Báo cáo',
    themeColor: 'border-rose-200 bg-rose-50/20 text-rose-800',
    barColor: 'bg-[#C21A1A]',
    iconBg: 'bg-rose-100 text-rose-700',
    iconColor: 'text-[#C21A1A]',
    badgeBg: 'bg-rose-100/70 text-rose-850',
    accentHex: '#C21A1A'
  }
};

const DYNAMIC_PALETTES = [
  {
    themeColor: 'border-emerald-200 bg-emerald-50/20 text-emerald-800',
    barColor: 'bg-emerald-600',
    iconBg: 'bg-emerald-100 text-emerald-700',
    iconColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-100/70 text-emerald-850',
    accentHex: '#107c41'
  },
  {
    themeColor: 'border-blue-200 bg-blue-50/20 text-blue-800',
    barColor: 'bg-blue-600',
    iconBg: 'bg-blue-100 text-blue-700',
    iconColor: 'text-blue-600',
    badgeBg: 'bg-blue-100/70 text-blue-850',
    accentHex: '#0066CC'
  },
  {
    themeColor: 'border-amber-200 bg-amber-50/20 text-amber-800',
    barColor: 'bg-amber-500',
    iconBg: 'bg-amber-100 text-amber-700',
    iconColor: 'text-amber-600',
    badgeBg: 'bg-amber-100/70 text-amber-850',
    accentHex: '#E67E22'
  },
  {
    themeColor: 'border-purple-200 bg-purple-50/20 text-purple-800',
    barColor: 'bg-purple-600',
    iconBg: 'bg-purple-100 text-purple-700',
    iconColor: 'text-purple-600',
    badgeBg: 'bg-purple-100/70 text-purple-850',
    accentHex: '#8E44AD'
  },
  {
    themeColor: 'border-rose-200 bg-rose-50/20 text-rose-800',
    barColor: 'bg-[#C21A1A]',
    iconBg: 'bg-rose-100 text-rose-700',
    iconColor: 'text-[#C21A1A]',
    badgeBg: 'bg-rose-100/70 text-[#C21A1A]',
    accentHex: '#C21A1A'
  },
  {
    themeColor: 'border-cyan-200 bg-cyan-50/20 text-cyan-800',
    barColor: 'bg-cyan-600',
    iconBg: 'bg-cyan-100 text-cyan-700',
    iconColor: 'text-cyan-600',
    badgeBg: 'bg-cyan-100/70 text-cyan-850',
    accentHex: '#008B8B'
  },
  {
    themeColor: 'border-teal-200 bg-teal-50/20 text-teal-800',
    barColor: 'bg-teal-650',
    iconBg: 'bg-teal-100 text-teal-700',
    iconColor: 'text-teal-600',
    badgeBg: 'bg-teal-100/70 text-teal-850',
    accentHex: '#008080'
  }
];

const CATEGORY_DISPLAY_ORDER = ['opening', 'sales', 'cleaning', 'inventory', 'closing'];
const CATEGORY_ORDER_MAP = new Map(CATEGORY_DISPLAY_ORDER.map((id, index) => [id, index]));

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatCheckedAt(value?: string) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('vi-VN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Compare completion time with timeLimit to check if late
function isItemLate(item: ChecklistItem): boolean {
  if (!item.timeLimit) return false;
  
  const [limitHour, limitMinute] = item.timeLimit.split(':').map(Number);
  if (Number.isNaN(limitHour) || Number.isNaN(limitMinute)) return false;

  let checkTime: Date;
  if (item.isCompleted && item.checkedAt) {
    checkTime = new Date(item.checkedAt);
  } else {
    // If not completed and it is for today or past days, check against current time
    const today = new Date();
    if (item.dateKey && item.dateKey !== today.toISOString().slice(0, 10)) {
      const itemDate = new Date(item.dateKey);
      if (itemDate < today) {
        return true; // Not completed and past day -> late
      }
    }
    checkTime = today;
  }

  const checkHour = checkTime.getHours();
  const checkMinute = checkTime.getMinutes();

  if (checkHour > limitHour) return true;
  if (checkHour === limitHour && checkMinute > limitMinute) return true;
  
  return false;
}

function getWeekDates(): Array<{ dateStr: string; label: string; dateKey: string }> {
  const current = new Date();
  const week: Array<{ dateStr: string; label: string; dateKey: string }> = [];
  const distance = current.getDay() === 0 ? -6 : 1 - current.getDay();
  const monday = new Date(current);
  monday.setDate(current.getDate() + distance);

  const daysLabel = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const dateKey = day.toISOString().slice(0, 10);
    week.push({
      dateStr: day.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      label: daysLabel[i],
      dateKey,
    });
  }
  return week;
}

export default function ChecklistView({
  todayCategories,
  processCategories,
  items,
  allChecklistItems = [],
  onToggleItem,
  roleOptions,
  defaultRoleCode,
  onCreateRoleChecklist,
  onCreateTodayChecklistBatch,
  onCreateRoleChecklistBatch,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onDeleteChecklistItem,
  onUpdateChecklistItem,
  permissions,
  errorMessage,
  onDismissError,
}: ChecklistViewProps) {
  const [subTab, setSubTab] = useState<'today' | 'process' | 'completed'>('today');
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>('opening');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Tab Completed Viewing Mode
  const [completedViewMode, setCompletedViewMode] = useState<'day' | 'week'>('day');
  const [selectedWeekDayKey, setSelectedWeekDayKey] = useState(getTodayKey());
  const weekDates = useMemo(() => getWeekDates(), []);

  // Inline edit state for checklist items
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemTitle, setEditItemTitle] = useState('');
  const [editItemTimeLimit, setEditItemTimeLimit] = useState('');

  // Batch Dialog form states
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [dialogRoleCode, setDialogRoleCode] = useState(defaultRoleCode);
  const [dialogCategoryId, setDialogCategoryId] = useState('');
  const [dialogChecklistName, setDialogChecklistName] = useState('');
  const [dialogTasks, setDialogTasks] = useState<Array<{ title: string; timeLimit: string }>>([
    { title: '', timeLimit: '08:00' }
  ]);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [isSubmittingDialog, setIsSubmittingDialog] = useState(false);

  // States for inline category creator
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryTitle, setEditingCategoryTitle] = useState('');

  const activeCategories = subTab === 'process' ? processCategories : todayCategories;
  const activeCategoryType: 'today' | 'process' = subTab === 'process' ? 'process' : 'today';

  useEffect(() => {
    setDialogRoleCode(defaultRoleCode);
  }, [defaultRoleCode]);

  useEffect(() => {
    if (activeCategories.length > 0 && !dialogCategoryId) {
      setDialogCategoryId(activeCategories[0].id);
    }
  }, [activeCategories, dialogCategoryId]);

  useEffect(() => {
    if (activeCategories.length > 0) {
      setDialogCategoryId(activeCategories[0].id);
    }
  }, [subTab]);

  // Recalculate category accordion expansions
  const toggleExpand = (catId: string) => {
    setExpandedCategoryId(expandedCategoryId === catId ? null : catId);
  };

  // Filter dynamic categories and items
  const filteredCategories = useMemo(() => {
    const normalizedSelectedRole = dialogRoleCode.trim().toUpperCase();

    // 1. Process templates (subTab === 'process')
    if (subTab === 'process') {
      const templates = allChecklistItems.filter(
        (it) => it.isTemplate && it.roleCode?.trim().toUpperCase() === normalizedSelectedRole
      );

      return [...processCategories]
        .sort((a, b) => {
          const orderA = CATEGORY_ORDER_MAP.get(a.id) ?? Number.MAX_SAFE_INTEGER;
          const orderB = CATEGORY_ORDER_MAP.get(b.id) ?? Number.MAX_SAFE_INTEGER;
          return orderA !== orderB ? orderA - orderB : a.title.localeCompare(b.title, 'vi');
        })
        .map((cat, index) => {
          const palette = DYNAMIC_PALETTES[index % DYNAMIC_PALETTES.length];
          const autoLabel = cat.id === 'opening' ? '1. Mở cửa' :
                            cat.id === 'sales' ? '2. Bán hàng – Bàn giao' :
                            cat.id === 'cleaning' ? '3. Sửa chữa – Bảo hành' :
                            cat.id === 'inventory' ? '4. Kho – Kiểm kê' :
                            cat.id === 'closing' ? '5. Chốt ca – Báo cáo' :
                            `${index + 1}. ${cat.title}`;

          const meta = CATEGORY_META[cat.id] || {
            label: autoLabel,
            themeColor: palette.themeColor,
            barColor: palette.barColor,
            iconBg: palette.iconBg,
            iconColor: palette.iconColor,
            badgeBg: palette.badgeBg,
            accentHex: palette.accentHex
          };

          const catTasks = templates.filter((it) => it.categoryId === cat.id);
          const filteredTasks = catTasks.filter((it) =>
            it.title.toLowerCase().includes(searchTerm.toLowerCase())
          );

          return {
            ...cat,
            countDone: 0,
            countTotal: catTasks.length,
            isCompleted: false,
            meta,
            tasks: filteredTasks,
          };
        })
        .filter((cat) => (searchTerm.trim() !== '' ? cat.tasks.length > 0 : true));
    }

    // 2. Completed items (subTab === 'completed')
    if (subTab === 'completed') {
      const targetDateKey = completedViewMode === 'day' ? getTodayKey() : selectedWeekDayKey;
      const completedItems = allChecklistItems.filter(
        (it) => it.isCompleted && !it.isTemplate && it.dateKey === targetDateKey
      );

      return [...todayCategories]
        .sort((a, b) => {
          const orderA = CATEGORY_ORDER_MAP.get(a.id) ?? Number.MAX_SAFE_INTEGER;
          const orderB = CATEGORY_ORDER_MAP.get(b.id) ?? Number.MAX_SAFE_INTEGER;
          return orderA !== orderB ? orderA - orderB : a.title.localeCompare(b.title, 'vi');
        })
        .map((cat, index) => {
          const palette = DYNAMIC_PALETTES[index % DYNAMIC_PALETTES.length];
          const autoLabel = cat.id === 'opening' ? '1. Mở cửa' :
                            cat.id === 'sales' ? '2. Bán hàng – Bàn giao' :
                            cat.id === 'cleaning' ? '3. Sửa chữa – Bảo hành' :
                            cat.id === 'inventory' ? '4. Kho – Kiểm kê' :
                            cat.id === 'closing' ? '5. Chốt ca – Báo cáo' :
                            `${index + 1}. ${cat.title}`;

          const meta = CATEGORY_META[cat.id] || {
            label: autoLabel,
            themeColor: palette.themeColor,
            barColor: palette.barColor,
            iconBg: palette.iconBg,
            iconColor: palette.iconColor,
            badgeBg: palette.badgeBg,
            accentHex: palette.accentHex
          };

          const catTasks = completedItems.filter((it) => it.categoryId === cat.id);
          const filteredTasks = catTasks.filter((it) =>
            it.title.toLowerCase().includes(searchTerm.toLowerCase())
          );

          return {
            ...cat,
            countDone: catTasks.length,
            countTotal: catTasks.length,
            isCompleted: catTasks.length > 0,
            meta,
            tasks: filteredTasks,
          };
        })
        .filter((cat) => cat.tasks.length > 0);
    }

    // 3. Today's checklists (subTab === 'today')
    return [...todayCategories]
      .sort((a, b) => {
        const orderA = CATEGORY_ORDER_MAP.get(a.id) ?? Number.MAX_SAFE_INTEGER;
        const orderB = CATEGORY_ORDER_MAP.get(b.id) ?? Number.MAX_SAFE_INTEGER;
        return orderA !== orderB ? orderA - orderB : a.title.localeCompare(b.title, 'vi');
      })
      .map((cat, index) => {
        const palette = DYNAMIC_PALETTES[index % DYNAMIC_PALETTES.length];
        const autoLabel = cat.id === 'opening' ? '1. Mở cửa' :
                          cat.id === 'sales' ? '2. Bán hàng – Bàn giao' :
                          cat.id === 'cleaning' ? '3. Sửa chữa – Bảo hành' :
                          cat.id === 'inventory' ? '4. Kho – Kiểm kê' :
                          cat.id === 'closing' ? '5. Chốt ca – Báo cáo' :
                          `${index + 1}. ${cat.title}`;

        const meta = CATEGORY_META[cat.id] || {
          label: autoLabel,
          themeColor: palette.themeColor,
          barColor: palette.barColor,
          iconBg: palette.iconBg,
          iconColor: palette.iconColor,
          badgeBg: palette.badgeBg,
          accentHex: palette.accentHex
        };

        const catTasks = items.filter((it) => it.categoryId === cat.id);
        const filteredTasks = catTasks.filter((it) =>
          it.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const doneCount = catTasks.filter((it) => it.isCompleted).length;

        return {
          ...cat,
          countDone: doneCount,
          countTotal: catTasks.length,
          isCompleted: catTasks.length > 0 && doneCount === catTasks.length,
          meta,
          tasks: filteredTasks,
        };
      })
      .filter((cat) => (searchTerm.trim() !== '' ? cat.tasks.length > 0 : true));
  }, [todayCategories, processCategories, items, allChecklistItems, subTab, searchTerm, dialogRoleCode, completedViewMode, selectedWeekDayKey]);

  // Compute overall KPI metrics based on today's items
  const kpiStats = useMemo(() => {
    const todayItems = items;
    const total = todayItems.length;
    const completed = todayItems.filter(it => it.isCompleted);
    const completedCount = completed.length;

    let onTimeCount = 0;
    let lateCount = 0;

    todayItems.forEach(item => {
      if (item.timeLimit) {
        if (isItemLate(item)) {
          lateCount++;
        } else if (item.isCompleted) {
          onTimeCount++;
        }
      } else if (item.isCompleted) {
        onTimeCount++;
      }
    });

    const onTimePercent = total > 0 ? Math.round((onTimeCount / total) * 100) : 0;
    const latePercent = total > 0 ? Math.round((lateCount / total) * 100) : 0;
    const completionPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    return {
      total,
      completedCount,
      onTimeCount,
      lateCount,
      onTimePercent,
      latePercent,
      completionPercent
    };
  }, [items]);

  // Batch Dialog Add Task Row
  const addDialogTaskRow = () => {
    setDialogTasks([...dialogTasks, { title: '', timeLimit: '08:00' }]);
  };

  // Batch Dialog Delete Task Row
  const removeDialogTaskRow = (index: number) => {
    if (dialogTasks.length <= 1) return;
    setDialogTasks(dialogTasks.filter((_, i) => i !== index));
  };

  // Batch Dialog Task change handler
  const updateDialogTask = (index: number, fields: Partial<{ title: string; timeLimit: string }>) => {
    setDialogTasks(
      dialogTasks.map((task, i) => (i === index ? { ...task, ...fields } : task))
    );
  };

  // Submit batch creation from dialog
  const handleDialogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDialogError(null);
    setIsSubmittingDialog(true);

    const checklistName = dialogChecklistName.trim();
    if (!checklistName) {
      setDialogError('Vui lòng điền tên checklist / quy trình.');
      setIsSubmittingDialog(false);
      return;
    }

    const validTasks = dialogTasks.filter((t) => t.title.trim() !== '');
    if (validTasks.length === 0) {
      setDialogError('Vui lòng thêm ít nhất 1 nội dung công việc.');
      setIsSubmittingDialog(false);
      return;
    }

    try {
      if (subTab === 'today' && onCreateTodayChecklistBatch) {
        await onCreateTodayChecklistBatch(dialogRoleCode, dialogCategoryId, checklistName, validTasks);
      } else if (onCreateRoleChecklistBatch) {
        await onCreateRoleChecklistBatch(dialogRoleCode, dialogCategoryId, checklistName, validTasks);
      } else {
        // Fallback sequentially if batch creator is not provided
        for (const t of validTasks) {
          await onCreateRoleChecklist(dialogRoleCode, dialogCategoryId, checklistName, t.title);
        }
      }
      // Reset & Close
      setIsAddingItem(false);
      setDialogChecklistName('');
      setDialogTasks([{ title: '', timeLimit: '08:00' }]);
    } catch (err: any) {
      setDialogError(err?.message || 'Không thể lưu checklist mới. Vui lòng kiểm tra dữ liệu và thử lại.');
    } finally {
      setIsSubmittingDialog(false);
    }
  };

  // Individual item inline edit save
  const handleInlineSave = async (itemId: string) => {
    if (!editItemTitle.trim()) return;
    try {
      if (onUpdateChecklistItem) {
        await onUpdateChecklistItem(itemId, {
          title: editItemTitle.trim(),
          timeLimit: editItemTimeLimit || undefined,
        });
      }
      setEditingItemId(null);
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  };

  // Individual item delete
  const handleDeleteItem = async (itemId: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa công việc "${title}"?`)) {
      try {
        if (onDeleteChecklistItem) {
          await onDeleteChecklistItem(itemId);
        }
      } catch (err) {
        console.error('Failed to delete item:', err);
      }
    }
  };

  return (
    <div className="space-y-4 text-left antialiased font-sans">
      
      {/* 1. Header block */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        {/* Decorative ambient background accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#C21A1A]/3 rounded-full blur-xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-50 text-[#C21A1A]">📋</span>
            <span>Checklist &amp; Quy trình vận hành</span>
          </h1>
          <p className="text-xs text-slate-400 font-bold mt-1 max-w-xl leading-relaxed">
            {subTab === 'today' && 'Thực thi daily các đầu việc đúng mốc giờ quy định và chụp hình minh chứng ca trực.'}
            {subTab === 'process' && 'Cấu hình và chuẩn hóa quy trình template checklist cho từng vai trò nhân sự.'}
            {subTab === 'completed' && 'Lịch sử lưu trữ đầu việc đã kiểm định hoàn thành theo ngày và tuần.'}
          </p>
        </div>

        {/* Action Button checked with permissions */}
        <div className="relative z-10 flex gap-2 shrink-0 self-start sm:self-auto">
          {subTab === 'today' && permissions.canCreate && (
            <button
              onClick={() => {
                setDialogRoleCode(defaultRoleCode);
                setDialogCategoryId(activeCategories[0]?.id || 'opening');
                setDialogChecklistName('');
                setDialogTasks([{ title: '', timeLimit: '08:00' }]);
                setDialogError(null);
                setIsAddingItem(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C21A1A] hover:bg-red-800 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm checklist hôm nay</span>
            </button>
          )}

          {subTab === 'process' && permissions.canCreate && (
            <button
              onClick={() => {
                setDialogRoleCode(defaultRoleCode);
                setDialogCategoryId(activeCategories[0]?.id || 'opening');
                setDialogChecklistName('');
                setDialogTasks([{ title: '', timeLimit: '08:00' }]);
                setDialogError(null);
                setIsAddingItem(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C21A1A] hover:bg-red-800 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm quy trình chuẩn</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Global Error Message Banner */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex items-start justify-between gap-3 animate-in slide-in-from-top-2 duration-200 shadow-2xs">
          <div className="flex items-start gap-2.5 text-rose-700">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-xs font-bold leading-relaxed">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={onDismissError}
            className="text-rose-500 hover:text-rose-700 p-0.5 rounded transition-colors cursor-pointer"
            title="Đóng thông báo lỗi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Navigation tabs and Search Filter bar */}
      <div className="flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/90 overflow-x-auto scrollbar-none gap-0.5 shrink-0 w-full lg:w-auto">
          <button
            onClick={() => setSubTab('today')}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap flex-1 lg:flex-initial ${
              subTab === 'today'
                ? 'bg-white text-[#C21A1A] border border-red-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Hôm nay</span>
          </button>
          
          <button
            onClick={() => setSubTab('process')}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap flex-1 lg:flex-initial ${
              subTab === 'process'
                ? 'bg-white text-[#C21A1A] border border-red-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Theo quy trình</span>
          </button>

          <button
            onClick={() => setSubTab('completed')}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap flex-1 lg:flex-initial ${
              subTab === 'completed'
                ? 'bg-white text-[#C21A1A] border border-red-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Đã hoàn thành</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="flex gap-2 flex-1 lg:max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder={
                subTab === 'process'
                  ? 'Tìm kiếm quy trình chuẩn...'
                  : 'Tìm kiếm công việc hôm nay...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs font-bold pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#C21A1A] focus:ring-1 focus:ring-[#C21A1A] bg-white transition-all shadow-2xs"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button 
            title="Bộ lọc nâng cao"
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-350 transition-colors text-slate-500 flex items-center justify-center shrink-0 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. Sub-Configuration Bar inside "Theo quy trình" */}
      {(subTab === 'process' || subTab === 'today') && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-left shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">
            {subTab === 'process' && (
              <div className="flex items-center gap-2 shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#C21A1A]" />
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Chọn vai trò:</span>
              </div>
            )}
            
            <div className="flex items-center gap-3 flex-wrap">
              {subTab === 'process' && (
                <>
                  <select
                    value={dialogRoleCode}
                    onChange={(e) => setDialogRoleCode(e.target.value)}
                    className="bg-white border border-slate-200 focus:outline-[#C21A1A] focus:ring-1 focus:ring-[#C21A1A] px-3 py-2 rounded-xl text-xs font-bold cursor-pointer hover:border-slate-350 transition-all shrink-0 shadow-2xs"
                  >
                    {roleOptions.map((role) => (
                      <option key={role.code} value={role.code}>
                        {role.name} ({role.code})
                      </option>
                    ))}
                  </select>

                  <span className="text-slate-300 text-xs hidden sm:inline">|</span>
                </>
              )}

              {/* Dynamic Group Creator */}
              {isCreatingCategory ? (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newCategoryTitle.trim() && onCreateCategory) {
                      void onCreateCategory(newCategoryTitle.trim(), activeCategoryType);
                      setNewCategoryTitle('');
                      setIsCreatingCategory(false);
                    }
                  }}
                  className="flex items-center gap-2 shrink-0 animate-in fade-in slide-in-from-left-2 duration-150"
                >
                  <input
                    type="text"
                    value={newCategoryTitle}
                    onChange={(e) => setNewCategoryTitle(e.target.value)}
                    placeholder="Tên nhóm mới..."
                    autoFocus
                    required
                    className="bg-white border border-[#C21A1A] px-3 py-1.5 rounded-xl text-xs font-semibold w-40 shadow-2xs focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#C21A1A] hover:bg-red-800 text-white rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-xs transition-all"
                  >
                    Lưu
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewCategoryTitle('');
                      setIsCreatingCategory(false);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                  >
                    Hủy
                  </button>
                </form>
              ) : (
                permissions.canCreate && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#C21A1A]/5 hover:bg-[#C21A1A]/10 text-[#C21A1A] border border-rose-100 rounded-xl text-xs font-extrabold tracking-wide transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{subTab === 'process' ? 'Thêm nhóm quy trình' : 'Thêm nhóm checklist'}</span>
                  </button>
                )
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-slate-450 shrink-0">
            <Info className="w-4 h-4 shrink-0 text-[#C21A1A] opacity-80" />
            <p className="text-[10.5px] font-semibold">
              {subTab === 'process'
                ? 'Quy trình chuẩn hóa template cho mỗi role. Tự động áp dụng daily khi bắt đầu ca trực.'
                : 'Nhóm checklist hôm nay được quản lý riêng để theo dõi vận hành theo ca trực.'}
            </p>
          </div>
        </div>
      )}

      {/* 5. Subbar for Completed View */}
      {subTab === 'completed' && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-[#C21A1A]" />
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Xem lịch sử:</span>
            </div>

            <div className="flex bg-slate-200/60 p-0.5 rounded-lg border border-slate-250 shrink-0">
              <button
                onClick={() => setCompletedViewMode('day')}
                className={`px-3 py-1 rounded-md text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  completedViewMode === 'day' ? 'bg-white text-[#C21A1A] shadow-2xs' : 'text-slate-500'
                }`}
              >
                Theo Ngày
              </button>
              <button
                onClick={() => setCompletedViewMode('week')}
                className={`px-3 py-1 rounded-md text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  completedViewMode === 'week' ? 'bg-white text-[#C21A1A] shadow-2xs' : 'text-slate-500'
                }`}
              >
                Theo Tuần
              </button>
            </div>
          </div>

          {completedViewMode === 'week' && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 w-full md:w-auto scrollbar-none">
              {weekDates.map((d) => {
                const isSelected = selectedWeekDayKey === d.dateKey;
                return (
                  <button
                    key={d.dateKey}
                    onClick={() => setSelectedWeekDayKey(d.dateKey)}
                    className={`px-3 py-1.5 rounded-lg border text-[10.5px] font-bold cursor-pointer transition-all shrink-0 flex flex-col items-center leading-tight ${
                      isSelected
                        ? 'bg-[#C21A1A] border-[#C21A1A] text-white shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-350'
                    }`}
                  >
                    <span className="text-[9px] uppercase font-black opacity-80">{d.label}</span>
                    <span>{d.dateStr}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400">
              {completedViewMode === 'day' ? 'Hiển thị các công việc đã hoàn thành hôm nay' : `Lịch sử hoàn thành ngày ${selectedWeekDayKey}`}
            </span>
          </div>
        </div>
      )}

      {/* 6. Layout Grid: Main Content & Sidebar Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left interactive Accordion pane */}
        <div className="lg:col-span-8 space-y-3.5">
          {filteredCategories.length === 0 ? (
            <div className="bg-white p-16 text-center rounded-2xl border border-dashed border-slate-200 space-y-4 shadow-2xs">
              <Smile className="w-12 h-12 text-slate-300 mx-auto" />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Không có dữ liệu checklist phù hợp</p>
                <p className="text-[11px] text-slate-400 mt-1">Không tìm thấy checklist hoặc các công việc đã hoàn thành trong nhóm này.</p>
              </div>
              <button 
                onClick={() => {
                  setSubTab('today');
                  setSearchTerm('');
                  setCompletedViewMode('day');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10.5px] font-black text-[#C21A1A] uppercase tracking-wider hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            filteredCategories.map((cat) => {
              const isExpanded = expandedCategoryId === cat.id;
              const ratio = cat.countTotal > 0 ? (cat.countDone / cat.countTotal) : 0;
              const isFinishedList = cat.countTotal > 0 && cat.countDone === cat.countTotal;

              return (
                <div 
                  key={cat.id} 
                  className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-2xs ${
                    isExpanded ? 'border-slate-350 shadow-xs ring-4 ring-slate-100/50' : 'border-slate-200/90'
                  }`}
                >
                  {/* Accordion header */}
                  <div 
                    onClick={() => toggleExpand(cat.id)}
                    className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none relative"
                  >
                    {/* Progress indicator border accent */}
                    <div 
                      className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${cat.meta.barColor}`}
                    ></div>

                    <div className="flex items-center gap-3.5 min-w-0 flex-1 text-left">
                      {/* Left icon wrapper */}
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-extrabold ${cat.meta.iconBg}`}>
                        {cat.id === 'opening' && <Calendar className="w-5 h-5 text-emerald-600" />}
                        {cat.id === 'sales' && <Coins className="w-5 h-5 text-blue-600" />}
                        {cat.id === 'cleaning' && <Wrench className="w-5 h-5 text-amber-600" />}
                        {cat.id === 'inventory' && <Warehouse className="w-5 h-5 text-purple-600" />}
                        {cat.id === 'closing' && <FileText className="w-5 h-5 text-[#C21A1A]" />}
                        {!['opening', 'sales', 'cleaning', 'inventory', 'closing'].includes(cat.id) && <Layers className="w-5 h-5 text-slate-600" />}
                      </span>

                      <div className="min-w-0 flex-1">
                        {editingCategoryId === cat.id ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (editingCategoryTitle.trim() && onUpdateCategory) {
                                  void onUpdateCategory(cat.id, editingCategoryTitle.trim(), activeCategoryType);
                                setEditingCategoryId(null);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()} 
                            className="flex items-center gap-1.5 mt-0.5 animate-in zoom-in-95 duration-100"
                          >
                            <input
                              type="text"
                              value={editingCategoryTitle}
                              onChange={(e) => setEditingCategoryTitle(e.target.value)}
                              autoFocus
                              required
                              onBlur={() => {
                                if (editingCategoryTitle.trim() && onUpdateCategory && editingCategoryTitle.trim() !== cat.title) {
                                  void onUpdateCategory(cat.id, editingCategoryTitle.trim(), activeCategoryType);
                                }
                                setEditingCategoryId(null);
                              }}
                              className="bg-slate-50 border border-[#C21A1A] focus:outline-none px-2.5 py-1 rounded-lg text-xs font-bold w-48 shadow-2xs"
                            />
                            <button
                              type="submit"
                              className="px-2.5 py-1 bg-[#C21A1A] text-white text-[10px] rounded-md font-black uppercase tracking-wider cursor-pointer"
                            >
                              Lưu
                            </button>
                          </form>
                        ) : (
                          <div className="flex items-center gap-2 group/title">
                            <h3 className="font-black text-xs uppercase tracking-tight text-slate-800 flex items-center gap-1.5">
                              <span style={{ color: cat.meta.accentHex }}>{cat.meta.label}</span>
                              {subTab !== 'process' && isFinishedList && (
                                <span className="text-[9px] text-emerald-600 font-black bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Hoàn tất</span>
                              )}
                            </h3>

                            {/* Inline edit and delete categories when allowed */}
                            {(permissions.canUpdate || permissions.canDelete) && (
                              <div className="flex items-center gap-1 opacity-0 group-hover/title:opacity-100 transition-opacity pl-2">
                                {permissions.canUpdate && (
                                  <button
                                    type="button"
                                    title="Đổi tên nhóm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingCategoryId(cat.id);
                                      setEditingCategoryTitle(cat.title);
                                    }}
                                    className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                  >
                                    <Edit2 className="w-3 h-3 stroke-[2.5]" />
                                  </button>
                                )}
                                {permissions.canDelete && (
                                  <button
                                    type="button"
                                    title={subTab === 'process' ? 'Xóa nhóm quy trình' : 'Xóa nhóm checklist'}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (window.confirm(`Bạn có chắc chắn muốn xóa nhóm "${cat.title}"? Tất cả công việc bên trong cũng sẽ bị xóa vĩnh viễn.`)) {
                                        if (onDeleteCategory) {
                                          void onDeleteCategory(cat.id, activeCategoryType);
                                        }
                                      }
                                    }}
                                    className="p-1 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3 stroke-[2.5]" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Progress and indicators */}
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap sm:flex-nowrap">
                          {subTab === 'process' ? (
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 shrink-0">
                              {cat.countTotal} đầu việc chuẩn
                            </span>
                          ) : (
                            <>
                              <span className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-md shrink-0 ${cat.meta.badgeBg}`}>
                                {cat.countDone}/{cat.countTotal} việc đã xong
                              </span>
                              
                              {/* Sleek horizontal progress bar */}
                              <div className="w-20 sm:w-28 bg-slate-100 h-1.5 rounded-full overflow-hidden shrink-0">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${cat.meta.barColor}`} 
                                  style={{ width: `${ratio * 100}%` }}
                                />
                              </div>
                              <span className="text-[9.5px] font-mono font-black text-slate-400 shrink-0">
                                {Math.round(ratio * 100)}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Collapse icon */}
                    <span className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-800 transition-colors">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </div>

                  {/* Sleek separator line */}
                  {subTab !== 'process' && (
                    <div className="w-full bg-slate-100 h-[1px]">
                      <div 
                        className={`h-full transition-all duration-500 ${cat.meta.barColor}`}
                        style={{ width: `${ratio * 100}%` }}
                      />
                    </div>
                  )}

                  {/* Accordion content body */}
                  {isExpanded && (
                    <div className="bg-slate-50/40 divide-y divide-slate-150/50 border-t border-slate-100">
                      {cat.tasks.length === 0 ? (
                        <p className="text-xs text-slate-400 italic p-6 text-center font-bold">Chưa có công việc nào trong danh mục này.</p>
                      ) : (
                        cat.tasks.map((item) => {
                          const isLate = isItemLate(item);
                          const isCurrentlyEditing = editingItemId === item.id;

                          return (
                            <div 
                              key={item.id} 
                              onClick={() => {
                                // Double check permission before toggle
                                if (subTab !== 'process' && !isCurrentlyEditing) {
                                  onToggleItem(item.id);
                                }
                              }}
                              className={`py-3 px-4 flex items-center justify-between gap-4 transition-all ${
                                subTab === 'process'
                                  ? 'hover:bg-white/80'
                                  : 'hover:bg-white/80 cursor-pointer select-none'
                              } ${isCurrentlyEditing ? 'bg-white p-3.5 border-l-2 border-[#C21A1A]' : ''}`}
                            >
                              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                {/* Left Checkbox or File icon */}
                                <span className="transition-transform group-hover:scale-105 duration-200 shrink-0">
                                  {subTab === 'process' ? (
                                    <FileText className="w-4 h-4 text-slate-400" />
                                  ) : item.isCompleted ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                                  ) : (
                                    <Circle className={`w-5 h-5 ${isLate ? 'text-rose-500' : 'text-slate-350 hover:text-slate-500'}`} />
                                  )}
                                </span>

                                <div className="min-w-0 flex-1">
                                  {isCurrentlyEditing ? (
                                    <div 
                                      className="flex flex-col sm:flex-row gap-2 w-full"
                                      onClick={(e) => e.stopPropagation()} // Stop accordion select
                                    >
                                      <input
                                        type="text"
                                        value={editItemTitle}
                                        onChange={(e) => setEditItemTitle(e.target.value)}
                                        placeholder="Nhập tên đầu việc..."
                                        className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-250 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#C21A1A] flex-1"
                                      />
                                      <input
                                        type="time"
                                        value={editItemTimeLimit}
                                        onChange={(e) => setEditItemTimeLimit(e.target.value)}
                                        className="text-xs font-mono font-bold text-slate-650 bg-slate-50 border border-slate-250 rounded-lg px-2 py-1.5 focus:outline-none w-24"
                                      />
                                      <div className="flex gap-1 shrink-0 items-center justify-end">
                                        <button
                                          type="button"
                                          onClick={() => handleInlineSave(item.id)}
                                          className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer transition-colors"
                                          title="Duyệt lưu"
                                        >
                                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setEditingItemId(null)}
                                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg cursor-pointer transition-colors"
                                          title="Hủy"
                                        >
                                          <X className="w-3.5 h-3.5 stroke-[3]" />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <span className={`text-xs font-bold leading-normal block truncate ${
                                        subTab !== 'process' && item.isCompleted
                                          ? 'text-slate-400 line-through font-medium'
                                          : 'text-slate-700'
                                      }`}>
                                        {item.title}
                                      </span>

                                      {/* Extra descriptions under checklist title */}
                                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                        {subTab === 'process' && item.checklistName && (
                                          <span className="text-[9.5px] text-slate-400 font-bold bg-slate-100 px-1 py-0.5 rounded-sm">
                                            Bộ: {item.checklistName}
                                          </span>
                                        )}
                                        {item.roleCode && (
                                          <span className="text-[9.5px] text-blue-700 bg-blue-50 px-1 py-0.5 rounded-sm uppercase tracking-wider font-extrabold">
                                            Role: {item.roleCode}
                                          </span>
                                        )}
                                        {subTab !== 'process' && item.isCompleted && (item.checkedByName || item.checkedAt) && (
                                          <span className="text-[9.5px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                                            Đã check bởi {item.checkedByName || 'N/A'}{item.checkedAt ? ` lúc ${formatCheckedAt(item.checkedAt)}` : ''}
                                          </span>
                                        )}
                                        {subTab !== 'process' && isLate && (
                                          <span className="text-[9.5px] text-rose-700 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-black flex items-center gap-1 animate-pulse">
                                            <AlertCircle className="w-3 h-3 shrink-0" />
                                            <span>Trễ hạn</span>
                                          </span>
                                        )}
                                        {subTab !== 'process' && item.isCompleted && !isLate && item.timeLimit && (
                                          <span className="text-[9.5px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-extrabold">
                                            Đúng hạn
                                          </span>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Right timing, proofs and actions */}
                              {!isCurrentlyEditing && (
                                <div className="flex items-center gap-2 shrink-0 pl-2" onClick={(e) => e.stopPropagation()}>
                                  {/* Timing slot badge */}
                                  {item.timeLimit && (
                                    <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md flex items-center gap-1 select-none ${
                                      subTab !== 'process' && isLate 
                                        ? 'bg-rose-50 border border-rose-200 text-rose-700'
                                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                                    }`}>
                                      <Clock className="w-3 h-3 stroke-[2.2]" />
                                      <span>Trước {item.timeLimit}</span>
                                    </span>
                                  )}

                                  {/* Proof attach placeholder */}
                                  {subTab !== 'process' && (
                                    <span className="p-1 rounded bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-650 hover:bg-slate-100 transition-colors" title="Bằng chứng hình ảnh ca trực">
                                      <Image className="w-3.5 h-3.5 stroke-[2]" />
                                    </span>
                                  )}

                                  {/* Actions: Edit & Delete verified with permissions */}
                                  {permissions.canUpdate && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingItemId(item.id);
                                        setEditItemTitle(item.title);
                                        setEditItemTimeLimit(item.timeLimit || '08:00');
                                      }}
                                      className="p-1 rounded bg-slate-50 border border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                      title="Chỉnh sửa công việc"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {permissions.canDelete && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteItem(item.id, item.title)}
                                      className="p-1 rounded bg-slate-50 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                      title="Xóa công việc"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  <ChevronRight className="w-3.5 h-3.5 text-slate-350" />
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}

                      {/* Quick launch item form inside "Theo quy trình" */}
                      {subTab === 'process' && permissions.canCreate && (
                        <div className="py-3 px-4 text-left">
                          <button 
                            onClick={() => {
                              setDialogRoleCode(dialogRoleCode || defaultRoleCode);
                              setDialogCategoryId(cat.id);
                              setDialogChecklistName(cat.title);
                              setDialogTasks([{ title: '', timeLimit: '08:00' }]);
                              setDialogError(null);
                              setIsAddingItem(true);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-black text-[#C21A1A] hover:underline cursor-pointer"
                          >
                            <Plus className="w-4 h-4 stroke-[2.5]" /> 
                            <span>Thêm công việc chuẩn vào nhóm này</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Sidebar Stats & Instructions */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Card KPI Progress Stats */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs text-left relative overflow-hidden">
            {/* Ambient indicator */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-[#C21A1A]"></div>

            <h3 className="font-extrabold text-slate-800 font-display text-xs uppercase tracking-wider mb-4 pb-2 border-b border-slate-150 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#C21A1A]" />
              Thống kê tiến độ hôm nay
            </h3>

            <div className="space-y-4 text-xs font-bold">
              {/* Progress summary circles */}
              <div className="grid grid-cols-2 gap-3">
                {/* On time */}
                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex flex-col justify-between h-20 text-left">
                  <span className="text-[9.5px] font-black uppercase text-emerald-700 tracking-wider">Đúng hạn</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-black text-emerald-700">{kpiStats.onTimeCount}</span>
                    <span className="text-[11px] font-black text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded-md">{kpiStats.onTimePercent}%</span>
                  </div>
                </div>

                {/* Late count */}
                <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-2xl flex flex-col justify-between h-20 text-left">
                  <span className="text-[9.5px] font-black uppercase text-rose-700 tracking-wider">Trễ hạn</span>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-2xl font-black text-rose-700">{kpiStats.lateCount}</span>
                    <span className="text-[11px] font-black text-rose-600 bg-rose-100/50 px-2 py-0.5 rounded-md">{kpiStats.latePercent}%</span>
                  </div>
                </div>
              </div>

              {/* Progress bar general */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] font-black text-slate-700 uppercase tracking-wide">
                  <span>Tổng hoàn thành</span>
                  <span>{kpiStats.completedCount}/{kpiStats.total} ({kpiStats.completionPercent}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex border border-slate-200">
                  {/* On time completed progress segment */}
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-500 shadow-inner"
                    style={{ width: `${kpiStats.total > 0 ? (kpiStats.onTimeCount / kpiStats.total) * 100 : 0}%` }}
                    title="Đúng hạn"
                  />
                  {/* Late completed or uncompleted late segment */}
                  <div 
                    className="bg-rose-500 h-full transition-all duration-500"
                    style={{ width: `${kpiStats.total > 0 ? (kpiStats.lateCount / kpiStats.total) * 100 : 0}%` }}
                    title="Trễ hạn"
                  />
                </div>
                
                <div className="flex items-center justify-start gap-4 text-[9.5px] font-extrabold text-slate-400 pt-1">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Đúng hạn</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span>Trễ hạn / Quá giờ</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-200"></span>Chưa hoàn thành</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick instructions widget */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/90 text-left space-y-2.5 relative overflow-hidden">
            <div className="flex items-center gap-2 text-[#C21A1A]">
              <Info className="w-4 h-4 shrink-0" />
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-800">Ghi chú showroom chuẩn</h4>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
              Báo cáo đúng hạn checklist giúp tăng 15% điểm thưởng KPI chất lượng dịch vụ showroom. Các đầu việc tiền mặt và bàn giao két an toàn bắt buộc đính kèm minh chứng hình ảnh thực tế.
            </p>
          </div>
          
        </div>

      </div>

      {/* 7. FLOATING QUICK LAUNCH BUTTON FOR 1-HAND OPERATIONS */}
      {permissions.canCreate && (
        <button 
          onClick={() => {
            setDialogRoleCode(defaultRoleCode);
            setDialogCategoryId(activeCategories[0]?.id || 'opening');
            setDialogChecklistName('');
            setDialogTasks([{ title: '', timeLimit: '08:00' }]);
            setDialogError(null);
            setIsAddingItem(true);
          }}
          className="fixed bottom-24 right-5 lg:bottom-12 lg:right-12 w-14 h-14 bg-[#C21A1A] hover:bg-red-800 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-lg cursor-pointer z-40"
          title="Thêm checklist mới nhanh (1 tay)"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>
      )}

      {/* 8. MODAL WINDOW BATCH DIALOG: CREATE NEW CHECKLIST/TEMPLATE WORKFLOW */}
      {isAddingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 text-left">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col border border-slate-200 relative">
            {/* Ambient absolute top red marker line */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 to-[#C21A1A] rounded-t-3xl"></div>

            {/* Header */}
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between shrink-0 pt-1">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider font-display flex items-center gap-2">
                <span>📋 Thêm Cấu Hình Checklist Mới</span>
              </h3>
              <button
                onClick={() => setIsAddingItem(false)}
                className="text-slate-400 hover:text-slate-650 p-1.5 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Scrollable Form Body */}
            <form onSubmit={handleDialogSubmit} className="flex-1 overflow-y-auto pr-1 my-4 space-y-4 text-xs font-bold text-slate-700">
              {/* Internal Dialog Error banner */}
              {dialogError && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 flex items-start gap-2.5 text-rose-700 animate-in slide-in-from-top-2 duration-150">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="font-bold leading-normal">{dialogError}</p>
                </div>
              )}

              {/* Role selection & Category selection in Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-wider">Chọn vai trò</label>
                  <select 
                    value={dialogRoleCode}
                    onChange={(e) => setDialogRoleCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:outline-[#C21A1A] focus:ring-1 focus:ring-[#C21A1A] px-3.5 py-2.5 rounded-xl cursor-pointer"
                  >
                    {roleOptions.map((role) => (
                      <option key={role.code} value={role.code}>
                        {role.name} ({role.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-wider">Chọn Nhóm checklist</label>
                  <select
                    value={dialogCategoryId}
                    onChange={(e) => setDialogCategoryId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:outline-[#C21A1A] focus:ring-1 focus:ring-[#C21A1A] px-3.5 py-2.5 rounded-xl cursor-pointer"
                  >
                    {activeCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Checklist Name input */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-wider">Tên bộ checklist / quy trình</label>
                <input
                  type="text"
                  value={dialogChecklistName}
                  onChange={(e) => setDialogChecklistName(e.target.value)}
                  placeholder="Ví dụ: Quy trình bàn giao ca sáng..."
                  required
                  className="w-full bg-slate-50 border border-slate-250 focus:outline-[#C21A1A] focus:ring-1 focus:ring-[#C21A1A] px-3.5 py-2.5 rounded-xl"
                />
              </div>

              {/* Multiple Subtasks batch lists configuration */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Danh sách công việc con</label>
                  <button
                    type="button"
                    onClick={addDialogTaskRow}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#C21A1A]/5 hover:bg-[#C21A1A]/10 text-[#C21A1A] border border-rose-100 rounded-xl text-[10.5px] font-extrabold tracking-wide cursor-pointer transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Thêm dòng mới</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {dialogTasks.map((task, index) => (
                    <div key={index} className="flex gap-2 items-center animate-in slide-in-from-bottom-2 duration-150">
                      <span className="text-slate-400 text-xs shrink-0 font-mono">#{index + 1}</span>
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) => updateDialogTask(index, { title: e.target.value })}
                        placeholder="Nhiệm vụ: VD: Dọn sạch quầy, Kiểm két..."
                        required
                        className="flex-1 bg-slate-50 border border-slate-255 rounded-xl px-3 py-2 focus:outline-none focus:border-[#C21A1A] focus:ring-1 focus:ring-[#C21A1A] font-medium"
                      />
                      <input
                        type="time"
                        value={task.timeLimit}
                        onChange={(e) => updateDialogTask(index, { timeLimit: e.target.value })}
                        required
                        className="w-24 bg-slate-50 border border-slate-255 rounded-xl px-2 py-2 focus:outline-none focus:border-[#C21A1A] text-center font-mono font-bold"
                        title="Giờ giới hạn quy định"
                      />
                      <button
                        type="button"
                        onClick={() => removeDialogTaskRow(index)}
                        disabled={dialogTasks.length <= 1}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                          dialogTasks.length <= 1
                            ? 'text-slate-300 border-slate-100 cursor-not-allowed bg-slate-50'
                            : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 border-slate-200'
                        }`}
                        title="Xóa dòng"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddingItem(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-55 rounded-xl transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDialog}
                  className="px-5 py-2.5 text-xs font-black text-white bg-[#C21A1A] hover:bg-red-800 rounded-xl shadow-xs transition-all cursor-pointer uppercase tracking-wider flex items-center gap-1.5 active:scale-98 disabled:opacity-50"
                >
                  {isSubmittingDialog ? (
                    <>
                      <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <span>Lưu cấu hình</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
