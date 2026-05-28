import React, { useState, useMemo } from 'react';
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
  ClipboardList
} from 'lucide-react';
import { ChecklistCategory, ChecklistItem } from '../../types/checklist.types';

interface ChecklistViewProps {
  categories: ChecklistCategory[];
  items: ChecklistItem[];
  onToggleItem: (itemId: string) => void;
  onAddItem: (categoryId: string, title: string) => void;
  onAddCategory: (title: string) => void;
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
    badgeBg: 'bg-emerald-100/70 text-emerald-800',
    accentHex: '#107c41'
  },
  sales: {
    label: '2. Bán hàng – Bàn giao',
    themeColor: 'border-blue-200 bg-blue-50/20 text-blue-800',
    barColor: 'bg-blue-600',
    iconBg: 'bg-blue-100 text-blue-700',
    iconColor: 'text-blue-600',
    badgeBg: 'bg-blue-100/70 text-blue-800',
    accentHex: '#0066CC'
  },
  cleaning: {
    label: '3. Sửa chữa – Bảo hành',
    themeColor: 'border-amber-200 bg-amber-50/20 text-amber-800',
    barColor: 'bg-amber-500',
    iconBg: 'bg-amber-100 text-amber-700',
    iconColor: 'text-amber-600',
    badgeBg: 'bg-amber-100/70 text-amber-800',
    accentHex: '#E67E22'
  },
  inventory: {
    label: '4. Kho – Kiểm kê',
    themeColor: 'border-purple-200 bg-purple-50/20 text-purple-800',
    barColor: 'bg-purple-600',
    iconBg: 'bg-purple-100 text-purple-700',
    iconColor: 'text-purple-600',
    badgeBg: 'bg-purple-100/70 text-purple-800',
    accentHex: '#8E44AD'
  },
  closing: {
    label: '5. Chốt ca – Báo cáo',
    themeColor: 'border-rose-200 bg-rose-50/20 text-rose-800',
    barColor: 'bg-[#C21A1A]',
    iconBg: 'bg-rose-100 text-rose-700',
    iconColor: 'text-[#C21A1A]',
    badgeBg: 'bg-rose-100/70 text-rose-800',
    accentHex: '#C21A1A'
  }
};

// Map mock timings to items for a highly realistic feel
const ITEM_TIMINGS: Record<string, string> = {
  // Opening
  op1: '07:30',
  op2: '07:35',
  op3: '07:40',
  op4: '07:45',
  op5: '07:50',
  // Cleaning / Sửa chữa
  cl1: '08:30',
  cl2: '08:35',
  cl3: '08:40',
  cl4: '08:45',
  // Inventory
  iv1: '09:00',
  iv2: '09:10',
  iv3: '09:20',
  iv4: '09:30',
  iv5: '09:40',
  // Sales
  sl1: '08:05',
  sl2: '08:10',
  sl3: '08:15',
  sl4: '08:20',
  sl5: '08:25',
  sl6: '10:00',
  sl7: '10:15',
  // Closing
  cs1: '20:30',
  cs2: '20:45',
  cs3: '21:00',
  cs4: '21:15',
};

export default function ChecklistView({
  categories,
  items,
  onToggleItem,
  onAddItem,
  onAddCategory
}: ChecklistViewProps) {
  const [subTab, setSubTab] = useState<'today' | 'process' | 'completed'>('today');
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>('opening');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Custom states for inputs
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [selectedCategoryForNewItem, setSelectedCategoryForNewItem] = useState(categories[0]?.id || 'opening');

  // Handle accordion toggle
  const toggleExpand = (catId: string) => {
    setExpandedCategoryId(expandedCategoryId === catId ? null : catId);
  };

  // Filter categories and search items
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      // Step 1: Filter by sub-tab state
      if (subTab === 'completed') {
        if (cat.countDone !== cat.countTotal || cat.countTotal === 0) return false;
      }
      if (subTab === 'process') {
        if (cat.countDone === cat.countTotal && cat.countTotal > 0) return false;
      }
      return true;
    }).map(cat => {
      // Step 2: Decorate with label & metadata matching phone UI list
      const meta = CATEGORY_META[cat.id] || {
        label: cat.title,
        themeColor: 'border-slate-200 bg-slate-50 text-slate-800',
        barColor: 'bg-slate-600',
        iconBg: 'bg-slate-100 text-slate-700',
        iconColor: 'text-slate-600',
        badgeBg: 'bg-slate-100 text-slate-800',
        accentHex: '#C21A1A'
      };

      // Filter tasks within this cat if search string is present
      const catTasks = items.filter(it => it.categoryId === cat.id);
      const filteredTasks = catTasks.filter(it => 
        it.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return {
        ...cat,
        meta,
        tasks: filteredTasks,
        originalCount: catTasks.length
      };
    }).filter(cat => {
      if (searchTerm.trim() !== '') {
        return cat.tasks.length > 0;
      }
      return true;
    });
  }, [categories, items, subTab, searchTerm]);

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    onAddItem(selectedCategoryForNewItem, newItemTitle.trim());
    setNewItemTitle('');
    setIsAddingItem(false);
  };

  return (
    <div className="space-y-3.5 text-left">
      
      {/* 1. Header Block wrapped in card with border */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black font-display tracking-tight text-slate-900 flex items-center gap-2">
            📋 Checklist &amp; Quy trình
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Thực thi hằng ngày theo tiêu chuẩn và được duyệt.
          </p>
        </div>

        {/* System Primary Brand Add button */}
        <button
          onClick={() => {
            setSelectedCategoryForNewItem(categories[0]?.id || 'opening');
            setIsAddingItem(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#C21A1A] hover:bg-red-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-xs hover:shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm checklist mới</span>
        </button>
      </div>

      {/* 2. Tabs & Search Input Inline Container */}
      <div className="flex flex-col md:flex-row gap-3.5 justify-between items-stretch md:items-center">
        {/* Tabs - Aligned on left */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto scrollbar-none gap-0.5 shrink-0 self-start md:self-auto w-full md:w-auto">
          <button
            onClick={() => setSubTab('today')}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap flex-1 md:flex-initial ${
              subTab === 'today'
                ? 'bg-white text-[#C21A1A] border border-red-150 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Hôm nay</span>
          </button>
          
          <button
            onClick={() => setSubTab('process')}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap flex-1 md:flex-initial ${
              subTab === 'process'
                ? 'bg-white text-[#C21A1A] border border-red-150 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Theo quy trình</span>
          </button>

          <button
            onClick={() => setSubTab('completed')}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap flex-1 md:flex-initial ${
              subTab === 'completed'
                ? 'bg-white text-[#C21A1A] border border-red-150 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Đã hoàn thành</span>
          </button>
        </div>

        {/* Search input - Aligned line-by-line with tab row */}
        <div className="flex gap-2 flex-1 md:max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Tìm kiếm checklist hoặc công việc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs font-medium pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/90 focus:outline-hidden focus:border-[#C21A1A] focus:ring-1 focus:ring-[#C21A1A] bg-white transition-all shadow-2xs"
            />
          </div>
          <button 
            title="Bộ lọc nâng cao"
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors text-slate-600 flex items-center justify-center shrink-0 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. MAIN INTERACTIVE ACCORDION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        
        {/* Left main pane (Spans 8) - NHÓM CHECKLIST THEO TÁC VỤ */}
        <div className="lg:col-span-8 space-y-3.5">
          {filteredCategories.length === 0 ? (
            <div className="bg-white p-16 text-center rounded-2xl border border-dashed border-slate-200 space-y-3">
              <Smile className="w-12 h-12 text-slate-350 mx-auto" />
              <p className="text-sm font-semibold text-slate-500">Không tìm thấy checklist trùng khớp theo bộ lọc.</p>
              <button 
                onClick={() => {
                  setSubTab('today');
                  setSearchTerm('');
                }}
                className="text-[#C21A1A] font-extrabold text-xs hover:underline uppercase tracking-wide"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            filteredCategories.map((cat) => {
              const isExpanded = expandedCategoryId === cat.id;
              const ratio = cat.countTotal > 0 ? (cat.countDone / cat.countTotal) : 0;
              const isFinishedList = cat.countDone === cat.countTotal;

              return (
                <div 
                  key={cat.id} 
                  className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-xs hover:shadow-xs ${
                    isExpanded ? 'border-slate-300 ring-2 ring-slate-100/35' : 'border-slate-200'
                  }`}
                >
                  
                  {/* Category Card Header */}
                  <div 
                    onClick={() => toggleExpand(cat.id)}
                    className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1 text-left">
                      {/* Left Specific Round Icon Container matching each workflow color */}
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${cat.meta.iconBg}`}>
                        {cat.id === 'opening' && <Calendar className="w-5 h-5 text-emerald-600" />}
                        {cat.id === 'sales' && <Coins className="w-5 h-5 text-blue-600" />}
                        {cat.id === 'cleaning' && <Wrench className="w-5 h-5 text-amber-600" />}
                        {cat.id === 'inventory' && <Warehouse className="w-5 h-5 text-purple-600" />}
                        {cat.id === 'closing' && <FileText className="w-5 h-5 text-[#C21A1A]" />}
                        {!['opening', 'sales', 'cleaning', 'inventory', 'closing'].includes(cat.id) && <Layers className="w-5 h-5 text-slate-600" />}
                      </span>

                      <div className="min-w-0 flex-1">
                        <h3 className={`font-black text-xs uppercase tracking-tight text-slate-850 flex items-center gap-1.5`}>
                          <span style={{ color: cat.meta.accentHex }}>{cat.meta.label}</span>
                          {isFinishedList && <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded-sm">Xong</span>}
                        </h3>
                        
                        {/* Dynamic Progress indicator with Horizontal Mini progress bar on collapsed/header state too */}
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap sm:flex-nowrap">
                          <span className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-md shrink-0 ${cat.meta.badgeBg}`}>
                            {cat.countDone}/{cat.countTotal} việc hoàn thành
                          </span>
                          
                          {/* Sled-like minimalist bar slider inside headers as in screenshot design */}
                          <div className="w-24 sm:w-32 bg-slate-100 h-1.5 rounded-full overflow-hidden shrink-0">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${cat.meta.barColor}`} 
                              style={{ width: `${ratio * 100}%` }}
                            />
                          </div>
                          <span className="text-[9.5px] font-mono font-black text-slate-400 shrink-0">
                            {Math.round(ratio * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expand/Collapse arrow */}
                    <span className="p-1.5 rounded-lg bg-slate-50 border border-slate-150 text-slate-400 hover:text-slate-800 transition-colors">
                      {isExpanded ? <ChevronUp className="w-4 h-4 cursor-pointer" /> : <ChevronDown className="w-4 h-4 cursor-pointer" />}
                    </span>
                  </div>

                  {/* Progressive indicator top bar for active Accordion */}
                  <div className="w-full bg-slate-100 h-[1.5px]">
                    <div 
                      className={`h-full transition-all duration-300 ${cat.meta.barColor}`}
                      style={{ width: `${ratio * 100}%` }}
                    />
                  </div>

                  {/* Accordion Children details (Checklist items roster inside) */}
                  {isExpanded && (
                    <div className="bg-slate-50/50 p-1.5 divide-y divide-slate-150/60 border-t border-slate-100">
                      {cat.tasks.length === 0 ? (
                        <p className="text-xs text-slate-410 italic p-6 text-center font-semibold">Danh mục quy trình trống rỗng. Thêm đầu việc mới để khởi động.</p>
                      ) : (
                        cat.tasks.map((item) => {
                          const mockTime = ITEM_TIMINGS[item.id] || '08:00';
                          return (
                            <div 
                              key={item.id} 
                              onClick={() => onToggleItem(item.id)}
                              className="py-3.5 px-3.5 flex items-center justify-between gap-4 hover:bg-white cursor-pointer select-none transition-all rounded-lg text-left"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                {/* Left Checkbox icon: Round tick xanh lá or Empty circle - TIẾN ĐỘ & TRẠNG THÁI */}
                                <span className="transition-transform group-hover:scale-110 duration-200 shrink-0">
                                  {item.isCompleted ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-blue-500 hover:text-blue-700" />
                                  )}
                                </span>
                                <span className={`text-xs font-bold leading-relaxed truncate ${
                                  item.isCompleted 
                                    ? 'text-slate-400 line-through font-normal' 
                                    : 'text-slate-700'
                                }`}>
                                  {item.title}
                                </span>
                              </div>

                              {/* Right indicators and metadata elements EXACTLY AS SHOWN IN SCREENSHOT */}
                              <div className="flex items-center gap-2.5 shrink-0 pl-2">
                                {/* Mock Hour Timing Badge */}
                                <span className="text-[10px] font-mono font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm">
                                  {mockTime}
                                </span>

                                {/* BẰNG CHỨNG & DUYỆT Icons */}
                                <span className="p-1 rounded bg-slate-50 border border-slate-150 text-slate-400 hover:text-slate-650" title="Đính kèm minh chứng hình ảnh">
                                  <Image className="w-3.5 h-3.5 stroke-[2]" />
                                </span>
                                <span className="p-1 rounded bg-slate-50 border border-slate-150 text-slate-400 hover:text-slate-650" title="Quyền phân vai/Người phụ trách">
                                  <User className="w-3.5 h-3.5 stroke-[2]" />
                                </span>

                                {/* Chevron indicator */}
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                              </div>
                            </div>
                          );
                        })
                      )}

                      {/* Add entry quick launch component */}
                      <div className="py-3 px-3.5 text-left">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategoryForNewItem(cat.id);
                            setIsAddingItem(true);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-black text-[#C21A1A] hover:underline"
                        >
                          <Plus className="w-4 h-4" /> 
                          <span>Thêm đầu việc mới vào nhóm này</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Help widget checklist panel (Spans 4) */}
        <div className="lg:col-span-4 space-y-3">
          
          {/* Quick Stats overview panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs text-left">
            <h3 className="font-extrabold text-slate-800 font-display text-xs uppercase tracking-wider mb-4 pb-2 border-b border-slate-150 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#C21A1A]" />
              Tiêu chuẩn quy trình thiết kế
            </h3>

            <div className="space-y-3.5">
              <div className="p-3 bg-slate-50/70 border border-slate-155 rounded-xl text-left">
                <span className="text-[10px] font-extrabold text-[#C21A1A] uppercase tracking-wider block">Nguyên tắc thi hành</span>
                <p className="text-[11px] text-slate-600 mt-1 font-semibold leading-relaxed">
                  Nhóm các checklist theo chu trình thời gian rõ ràng để hạn chế tối đa sai lệch của nhân viên cửa hàng.
                </p>
              </div>

              <div className="p-3 bg-slate-50/70 border border-slate-155 rounded-xl text-left">
                <span className="text-[10px] font-extrabold text-[#107c41] uppercase tracking-wider block font-sans">Thời gian nghiêm ngặt</span>
                <p className="text-[11px] text-slate-600 mt-1 font-semibold leading-relaxed text-left">
                  Từng đầu việc nhỏ có gán khung giờ chốt nhằm giúp cho giám sát cửa hàng nắm bắt kịp thời và tối ưu vận hành.
                </p>
              </div>
            </div>
          </div>

          {/* Quick system instructions widget */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-2.5">
            <div className="flex items-center gap-2 text-[#C21A1A]">
              <Info className="w-4 h-4 shrink-0" />
              <h4 className="text-[10.5px] font-bold font-display uppercase tracking-wider text-slate-800">Ghi chú vận hành</h4>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-sans font-medium text-left">
              Bắt buộc chụp hình bằng chứng cụ thể trước khi bấm duyệt hoành thành với các đầu mối công việc quan trọng liên quan đến két an toàn và quản lý dòng tiền mặt của showroom.
            </p>
          </div>
          
        </div>

      </div>

      {/* 5. FLOATING RED "+" BUTTON AT THE BOTTOM RIGHT CORNER (DIỀU HƯỚNG 1 TAY) */}
      <button 
        onClick={() => {
          setSelectedCategoryForNewItem(categories[0]?.id || 'opening');
          setIsAddingItem(true);
        }}
        className="fixed bottom-24 right-5 lg:bottom-12 lg:right-12 w-14 h-14 bg-[#C21A1A] hover:bg-red-800 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-lg cursor-pointer z-40"
        title="Thêm checklist mới nhanh (1 tay)"
      >
        <Plus className="w-7 h-7 stroke-[3]" />
      </button>

      {/* MODAL WINDOW DIALOG: CREATE NEW CHECKLIST WORKFLOW */}
      {isAddingItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-sm font-black text-slate-850 pb-3 border-b border-slate-100 mb-4 font-display flex items-center gap-2 uppercase tracking-wide">
              <CheckCircle className="w-5 h-5 text-[#C21A1A]" />
              Thêm Checklist Độc Lập
            </h3>
            
            <form onSubmit={handleCreateItem} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-wider">Chọn nhóm quy trình</label>
                <select 
                  value={selectedCategoryForNewItem}
                  onChange={(e) => setSelectedCategoryForNewItem(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:outline-[#C21A1A] focus:ring-1 focus:ring-[#C21A1A] px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.id === 'opening' ? '1. Mở cửa' :
                       cat.id === 'sales' ? '2. Bán hàng – Bàn giao' :
                       cat.id === 'cleaning' ? '3. Sửa chữa – Bảo hành' :
                       cat.id === 'inventory' ? '4. Kho – Kiểm kê' :
                       cat.id === 'closing' ? '5. Chốt ca – Báo cáo' : cat.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-wider">Nội dung đầu việc cần làm</label>
                <textarea
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  placeholder="Ví dụ: Kiểm tra an ninh showroom và chuyển giao tiền mặt..."
                  rows={3}
                  required
                  className="w-full bg-slate-50 border border-slate-200 focus:outline-[#C21A1A] focus:ring-1 focus:ring-[#C21A1A] p-3 rounded-xl text-xs font-semibold leading-relaxed"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingItem(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black text-white bg-[#C21A1A] hover:bg-red-800 rounded-lg shadow-sm transition-all cursor-pointer uppercase tracking-wider"
                >
                  Xác nhận thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
