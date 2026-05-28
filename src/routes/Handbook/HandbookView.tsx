import React, { useState } from 'react';
import { 
  Shield, 
  FileText, 
  Network, 
  Lock, 
  User, 
  Scale, 
  Settings, 
  GraduationCap, 
  Search, 
  ChevronRight, 
  ArrowLeft, 
  Bell, 
  Check, 
  ExternalLink,
  BookOpen,
  Info,
  Sparkles,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { HANDBOOK_DOCS } from '../../data';
import { ScrollArea } from '../../shared/components/scroll-area';

interface UICardMetadata {
  id: string;
  iconBg: string;
  iconColor: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeText?: string;
  hasSeen?: boolean;
  isUpdated?: boolean;
  driveLink?: string;
  categoryKey: string;
}

export default function HandbookView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'required' | 'updated'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Local interaction states for marking documents read
  const [readDocs, setReadDocs] = useState<Record<string, boolean>>({
    'doc-5': true, // "Mô tả công việc" already marked as read
  });
  
  // Toast notifications for user actions
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleConfirmRead = (docId: string, title: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setReadDocs(prev => ({ ...prev, [docId]: true }));
    showToast(`Xác nhận đã đọc thành công: "${title}"`);
  };

  // Pre-configured list elements matching the exact visual spec of the template image
  const cardMetadataMap: Record<string, UICardMetadata> = {
    'doc-1': {
      id: 'doc-1',
      iconBg: 'bg-rose-50 text-red-650 hover:bg-rose-100',
      iconColor: 'text-red-600',
      icon: Shield,
      badgeText: 'Bắt buộc đọc',
      categoryKey: 'văn hóa'
    },
    'doc-2': {
      id: 'doc-2',
      iconBg: 'bg-orange-50 text-orange-650 hover:bg-orange-100',
      iconColor: 'text-orange-500',
      icon: FileText,
      badgeText: 'Bắt buộc đọc',
      categoryKey: 'nội quy'
    },
    'doc-4': {
      id: 'doc-4',
      iconBg: 'bg-emerald-50 text-emerald-650 hover:bg-emerald-100',
      iconColor: 'text-emerald-500',
      icon: Network,
      badgeText: 'Xem tóm tắt',
      categoryKey: 'sơ đồ'
    },
    'doc-10': { 
      id: 'doc-10',
      iconBg: 'bg-blue-50 text-blue-650 hover:bg-blue-100',
      iconColor: 'text-blue-500',
      icon: Lock,
      badgeText: 'Xem tóm tắt',
      categoryKey: 'phân quyền'
    },
    'doc-5': {
      id: 'doc-5',
      iconBg: 'bg-indigo-50 text-indigo-650 hover:bg-indigo-100',
      iconColor: 'text-indigo-500',
      icon: User,
      badgeText: 'Xem tóm tắt',
      hasSeen: true,
      categoryKey: 'mô tả công việc'
    },
    'doc-3': {
      id: 'doc-3',
      iconBg: 'bg-pink-50 text-pink-650 hover:bg-pink-100',
      iconColor: 'text-pink-600',
      icon: Scale,
      isUpdated: true,
      badgeText: 'Xác nhận đã đọc',
      categoryKey: 'quy chế'
    },
    'doc-6': {
      id: 'doc-6',
      iconBg: 'bg-sky-50 text-sky-650 hover:bg-sky-100',
      iconColor: 'text-sky-600',
      icon: Settings,
      driveLink: 'https://drive.google.com/drive/folders/mrt_tech_training_fake',
      categoryKey: 'sop gốc'
    },
    'doc-8': {
      id: 'doc-8',
      iconBg: 'bg-amber-50 text-amber-650 hover:bg-amber-100',
      iconColor: 'text-amber-500',
      icon: GraduationCap,
      driveLink: 'https://drive.google.com/drive/folders/mrt_finance_forms_fake',
      categoryKey: 'đào tạo'
    }
  };

  // Prepare standard list incorporating items
  const processedDocs = HANDBOOK_DOCS.map(doc => {
    const meta = cardMetadataMap[doc.id] || {
      id: doc.id,
      iconBg: 'bg-slate-100 text-slate-650',
      iconColor: 'text-slate-500',
      icon: FileText,
      badgeText: 'Xem tóm tắt',
      categoryKey: 'khác'
    };
    return {
      ...doc,
      meta
    };
  });

  // Filter handbook topics based on Search Term, Pills Selected Filter, and Category selection shorthand
  const filteredDocs = processedDocs.filter(doc => {
    // 1. Category check
    if (selectedCategory) {
      const docCat = doc.category.toLowerCase();
      const targetCat = selectedCategory.toLowerCase();
      // Match partials like "Văn hóa" -> "Văn hóa - Triết lý vận hành"
      if (!docCat.includes(targetCat) && !doc.title.toLowerCase().includes(targetCat)) {
        return false;
      }
    }

    // 2. Search term
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // 3. Pills filter
    if (selectedFilter === 'required') {
      return doc.meta.badgeText === 'Bắt buộc đọc';
    }
    if (selectedFilter === 'updated') {
      return doc.meta.isUpdated;
    }

    return true;
  });

  const activeDoc = processedDocs.find(doc => doc.id === activeDocId);

  // Formatter for rendering doc markup
  const renderFormattedContent = (content: string) => {
    return content.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-sm font-black text-slate-800 mt-6 mb-3 font-display uppercase tracking-wider border-b border-slate-100 pb-1">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('#### ')) {
        return (
          <h4 key={idx} className="text-xs font-black text-[#C21A1A] mt-4 mb-2 uppercase tracking-wide">
            {line.replace('#### ', '')}
          </h4>
        );
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <div key={idx} className="flex gap-2 items-start pl-1 py-1">
            <span className="text-[#C21A1A] mt-1.5 select-none shrink-0 text-xs font-bold">▪</span>
            <span className="text-xs text-slate-700 font-medium leading-relaxed">{line.substring(2)}</span>
          </div>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2"></div>;
      }
      
      const matchLink = line.match(/\[(.*?)\]\((.*?)\)/);
      if (matchLink) {
        const textStr = matchLink[1];
        const urlStr = matchLink[2];
        return (
          <p key={idx} className="text-xs py-1.5">
            <a 
              href={urlStr} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1 text-[#C21A1A] hover:underline font-bold"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{textStr}</span>
            </a>
          </p>
        );
      }

      return <p key={idx} className="text-xs text-slate-600 leading-relaxed py-1.5">{line}</p>;
    });
  };

  const documentCategoriesList = [
    { name: 'Văn hóa', icon: Shield, bg: 'bg-[#C21A1A]/10 text-[#C21A1A]', key: 'văn hóa' },
    { name: 'Nội quy', icon: FileText, bg: 'bg-orange-500/10 text-orange-650', key: 'nội quy' },
    { name: 'Sơ đồ', icon: Network, bg: 'bg-emerald-500/10 text-emerald-650', key: 'sơ đồ' },
    { name: 'Phân quyền', icon: Lock, bg: 'bg-blue-500/10 text-blue-650', key: 'phân quyền' },
    { name: 'Mô tả công việc', icon: User, bg: 'bg-indigo-500/10 text-indigo-650', key: 'mô tả' },
    { name: 'Quy chế', icon: Scale, bg: 'bg-pink-500/10 text-pink-650', key: 'quy chế' },
    { name: 'SOP gốc', icon: Settings, bg: 'bg-sky-500/10 text-sky-650', key: 'sop gốc' },
    { name: 'Đào tạo', icon: GraduationCap, bg: 'bg-amber-500/10 text-amber-650', key: 'đào tạo' },
  ];

  return (
    <div className="w-full space-y-3.5">
      
      {/* Dynamic Toast Notification popup */}
      {toastMessage && (
        <div className="fixed bottom-5 left-5 z-55 flex items-center gap-2.5 px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 shadow-xl text-xs font-bold font-sans max-w-sm transition-all animate-bounce">
          <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
          <span className="text-left font-sans">{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Block wrapped in card with border */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none text-left">
        <div className="font-sans">
          <h1 className="text-xl font-black font-display tracking-tight text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#C21A1A] shrink-0" />
            <span>SỔ TAY ĐIỀU HÀNH &amp; HỆ THỐNG VẬN HÀNH</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Chuẩn vận hành cốt lõi giúp nhân sự dễ dàng học tập, làm đúng quy trình.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-extrabold text-[#C21A1A] uppercase tracking-wider">Hệ thống tóm tắt tối ưu (SOP Lite)</span>
        </div>
      </div>

      {/* Main Content Panel Layout - Full Width optimized system space */}
      <div className="w-full space-y-4">
        
        {/* Left Column Bento Grid: Contains visual guidance and info translated from mockup sides */}
        <aside className="hidden">
          
          {/* Màn hình giới thiệu panel area */}
          <div className="bg-[#C21A1A] text-white p-5 rounded-2xl shadow-sm text-left select-none relative overflow-hidden">
            <div className="absolute right-[-10px] bottom-[-20px] opacity-10 pointer-events-none">
              <BookOpen className="w-40 h-40" />
            </div>
            
            <h3 className="text-xs font-black tracking-widest uppercase text-[#FFA8A8]">SỔ TAY MR.TÁO</h3>
            <h2 className="text-lg font-extrabold leading-tight mt-1">Sổ Tay / Hệ Thống</h2>
            <p className="text-[11px] text-[#FFC4C4] font-medium leading-relaxed mt-2.5">
              Tập trung toàn bộ chuẩn vận hành cốt lõi, giúp nhân sự dễ dàng tra cứu nhanh, hiểu đúng và làm chuẩn ngay từ đầu.
            </p>

            <div className="mt-5 pt-4 border-t border-white/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-xs">🍎</div>
                <div className="text-left">
                  <p className="text-[9px] text-[#FFA8A8] font-black uppercase leading-none">Vận hành chuẩn</p>
                  <p className="text-[10px] font-black leading-none mt-0.5">MR.TÁO STANDARD</p>
                </div>
              </div>
              <span className="text-[9px] bg-white/15 px-2 py-0.5 rounded uppercase font-bold tracking-wider">v1.1</span>
            </div>
          </div>

          {/* NHÓM TÀI LIỆU Category Grid shortcut clickable buttons */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3.5 select-none">
              Danh mục phễu lọc tài liệu
            </p>
            <div className="grid grid-cols-2 gap-2">
              {documentCategoriesList.map((cat) => {
                const isSelected = selectedCategory === cat.key;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.name}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedCategory(null); // Deselect
                        showToast(`Bỏ lọc theo ${cat.name}`);
                      } else {
                        setSelectedCategory(cat.key);
                        showToast(`Đang hiển thị tài liệu thuộc nhóm ${cat.name}`);
                      }
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 group transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-[#C21A1A] border-[#C21A1A] text-white shadow-sm scale-98' 
                        : 'bg-white border-slate-150 hover:border-[#C21A1A]/40 text-slate-700 hover:text-[#C21A1A]'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg transition-colors ${isSelected ? 'bg-white/20 text-white' : cat.bg}`}>
                      <Icon className="w-4 h-4 shrink-0" />
                    </div>
                    <span className="text-[10px] font-bold tracking-tight line-clamp-1">{cat.name}</span>
                  </button>
                );
              })}
            </div>
            {selectedCategory && (
              <button 
                onClick={() => setSelectedCategory(null)}
                className="w-full mt-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-[#C21A1A] text-[10px] font-black uppercase tracking-wider rounded-lg border border-slate-200 cursor-pointer transition-colors text-center"
              >
                Xóa lọc danh mục (Hiển thị tất cả)
              </button>
            )}
          </div>

          {/* NGUYÊN TẮC THIẾT KẾ cards panel */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs text-left space-y-4">
            <div className="flex items-center gap-2 text-slate-800">
              <Sparkles className="w-4.5 h-4.5 text-[#C21A1A] shrink-0" />
              <p className="text-[11px] font-black uppercase tracking-wider">Nguyên tắc thiết kế hệ thống</p>
            </div>
            
            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="flex gap-2.5 items-start">
                <span className="text-red-500 font-bold">🚨</span>
                <div className="text-left">
                  <h4 className="font-extrabold text-slate-800 text-[11px] leading-tight mb-0.5">Không tài liệu dài lê thê</h4>
                  <p className="text-[10px] font-medium leading-relaxed text-slate-400">Không đưa tài liệu dày cộp làm ngộp nhân viên.</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="text-emerald-500 font-bold">✨</span>
                <div className="text-left">
                  <h4 className="font-extrabold text-slate-800 text-[11px] leading-tight mb-0.5">Chỉ hiển thị tóm tắt cốt lõi</h4>
                  <p className="text-[10px] font-medium leading-relaxed text-slate-400">SOP Lite trực quan, đọc hiểu nhanh trong 3 phút.</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="text-sky-500 font-bold">📂</span>
                <div className="text-left">
                  <h4 className="font-extrabold text-slate-800 text-[11px] leading-tight mb-0.5">Tài liệu gốc đồng bộ trên Drive</h4>
                  <p className="text-[10px] font-medium leading-relaxed text-slate-400">Có link trực tiếp tới Drive tổng công ty khi cần tra cứu chi tiết.</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <span className="text-amber-500 font-bold">✍</span>
                <div className="text-left">
                  <h4 className="font-extrabold text-slate-800 text-[11px] leading-tight mb-0.5">Cam kết trách nhiệm văn bản</h4>
                  <p className="text-[10px] font-medium leading-relaxed text-slate-400">Nút bấm Xác nhận đã đọc lưu vết hệ thống, đảm bảo tuân thủ.</p>
                </div>
              </div>
            </div>
          </div>

          {/* TRẠNG THÁI TÀI LIỆU legend panel area */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-4.5 text-left select-none">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Trạng thái tài liệu chi tiết</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-red-50 border border-red-150 rounded text-red-600 text-[9px] font-black">🔖 Bắt buộc đọc</span>
                <span className="text-[9px] text-slate-400 font-bold">Quy chế bắt buộc ký xác nhận</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[#10B981] font-black text-[9px] uppercase"><Check className="w-3 h-3 stroke-[3]" /> Đã đọc</span>
                <span className="text-[9px] text-slate-400 font-bold">Vết ghi nhận của bạn trên hệ thống</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[#1E40AF] font-bold text-[9px] bg-blue-50 px-1 border border-blue-150 rounded"><span className="w-1.5 h-1.5 rounded-full bg-[#1E40AF]"></span> Mới</span>
                <span className="text-[9px] text-slate-400 font-bold">Mới ban hành hoặc có cập nhật</span>
              </div>
            </div>
          </div>

        </aside>

        {/* Right Content Panel Layout (Master Dashboard List or Detail Reader Panel) */}
        <div className="w-full space-y-4">
          
          {activeDocId === null ? (
            /* 2A. MASTER DOCUMENT DIRECTORY VIEW - Outer card border removed to avoid duplicate outline clutter */
            <div className="flex flex-col gap-4 min-h-[500px]">
              
              {/* 2. Tabs & Search Input Inline Container */}
              <div className="flex flex-col md:flex-row gap-3.5 justify-between items-stretch md:items-center text-left">
                {/* Tabs - Aligned on left */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto scrollbar-none gap-0.5 shrink-0 self-start md:self-auto w-full md:w-auto">
                  <button
                    onClick={() => {
                      setSelectedFilter('all');
                      showToast('Đang hiển thị tất cả tài liệu');
                    }}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap flex-1 md:flex-initial ${
                      selectedFilter === 'all'
                        ? 'bg-white text-[#C21A1A] border border-red-150 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>Tất cả tài liệu</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFilter('required');
                      showToast('Đang lọc tài liệu bắt buộc đọc');
                    }}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap flex-1 md:flex-initial ${
                      selectedFilter === 'required'
                        ? 'bg-white text-[#C21A1A] border border-red-150 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>Bắt buộc đọc</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFilter('updated');
                      showToast('Đang lọc tài liệu mới cập nhật');
                    }}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer whitespace-nowrap flex-1 md:flex-initial ${
                      selectedFilter === 'updated'
                        ? 'bg-white text-[#C21A1A] border border-red-150 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedFilter === 'updated' ? 'bg-[#C21A1A]' : 'bg-[#1E40AF]'}`} />
                    <span>Cập nhật mới</span>
                  </button>
                </div>

                {/* Search bar widget - Inline aligned with Tabs */}
                <div className="flex gap-2 flex-1 md:max-w-md w-full">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm nhanh tài liệu, nội quy, quy định, SOP..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full text-xs font-medium pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/90 focus:outline-hidden focus:border-[#C21A1A] focus:ring-1 focus:ring-[#C21A1A] bg-white transition-all shadow-2xs"
                    />
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold font-sans cursor-pointer"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Sub category filter micro-badges underneath search/tab inline row */}
              <div className="flex flex-col gap-2 pb-2">
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1.5 select-none">Nhóm danh mục:</span>
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      showToast('Hiển thị tất cả nhóm tài liệu');
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer ${
                      selectedCategory === null 
                        ? 'bg-slate-800 text-white shadow-xs' 
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Tất cả nhóm
                  </button>
                  {documentCategoriesList.map((cat) => {
                    const isSelected = selectedCategory === cat.key;
                    const CatIcon = cat.icon;
                    return (
                      <button
                        key={cat.name}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedCategory(null);
                            showToast(`Bỏ lọc nhóm ${cat.name}`);
                          } else {
                            setSelectedCategory(cat.key);
                            showToast(`Đang lọc theo nhóm ${cat.name}`);
                          }
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold tracking-tight flex items-center gap-1 transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-[#C21A1A] text-white shadow-xs' 
                            : 'bg-slate-50 text-slate-600 border border-slate-250 hover:bg-slate-100'
                        }`}
                      >
                        <CatIcon className="w-3.5 h-3.5 shrink-0" />
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status active category notification line */}
              {(selectedCategory || selectedFilter !== 'all' || searchTerm) && (
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-150 inline-flex text-xs font-bold text-slate-600 text-left">
                  <span>
                    Kết quả lọc: &nbsp;
                    {selectedCategory && <span className="bg-white border text-[#C21A1A] px-2 py-0.5 rounded mr-1.5 uppercase font-extrabold text-[10px]">Danh mục: {selectedCategory}</span>}
                    {selectedFilter !== 'all' && <span className="bg-white border text-[#1E40AF] px-2 py-0.5 rounded mr-1.5 uppercase font-extrabold text-[10px]">Bộ lọc: {selectedFilter === 'required' ? 'Bắt buộc đọc' : 'Mới cập nhật'}</span>}
                    {searchTerm && <span className="bg-white border text-emerald-600 px-2 py-0.5 rounded mr-1.5 font-mono">Từ khóa: "{searchTerm}"</span>}
                  </span>
                  
                  <button 
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedFilter('all');
                      setSearchTerm('');
                      showToast('Đọc đặt lại bộ lọc hiển thị tất cả');
                    }}
                    className="text-[#C21A1A] hover:underline cursor-pointer uppercase text-[10px] font-black ml-2"
                  >
                    Đặt lại tất cả
                  </button>
                </div>
              )}

              {/* Grid of SOP/Guidelines Adapted beautifully to desktop three-column full width web view */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-3">
                {filteredDocs.length === 0 ? (
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 py-16 text-center flex flex-col items-center justify-center">
                    <BookOpen className="w-12 h-12 text-slate-200 mb-3" />
                    <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Không tìm thấy bất kỳ tài liệu nào phù hợp</h4>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm font-medium">Bạn có thể thay đổi từ khóa lọc hoặc nhấp vào "Đặt lại tất cả" bên trên để xem toàn bộ chuẩn SOP.</p>
                  </div>
                ) : (
                  filteredDocs.map((doc) => {
                    const IconComponent = doc.meta.icon;
                    const isDocRead = readDocs[doc.id] || false;

                    return (
                      <div 
                        key={doc.id}
                        onClick={() => {
                          if (doc.meta.driveLink) {
                            window.open(doc.meta.driveLink, '_blank');
                            showToast(`Đang chuyển hướng mở liên kết tài liệu đầy đủ trên Google Drive`);
                          } else {
                            setActiveDocId(doc.id);
                          }
                        }}
                        className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between hover:border-[#C21A1A] hover:shadow-md transition-all duration-200 cursor-pointer text-left relative group hover:-translate-y-0.5"
                      >
                        {/* Upper row */}
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            {/* Icon block badge layout */}
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-lg ${doc.meta.iconBg} flex items-center justify-center shrink-0`}>
                                <IconComponent className={`w-4.5 h-4.5`} />
                              </div>
                              <div>
                                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 border px-1.5 py-0.5 rounded uppercase leading-none">
                                  {doc.category}
                                </span>
                              </div>
                            </div>

                            {/* Arrow utility decoration */}
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#C21A1A] group-hover:translate-x-1 transition-all shrink-0" />
                          </div>

                          {/* Central descriptions text */}
                          <div>
                            <h3 className="font-extrabold text-[#111827] text-xs leading-snug tracking-tight group-hover:text-[#C21A1A] transition-colors">
                              {doc.title}
                            </h3>
                            <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-1 line-clamp-2">
                              {doc.summary}
                            </p>
                          </div>
                        </div>

                        {/* Lower statuses layout rows footer */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 text-[10px]">
                          
                          {/* Left dynamic markers indicators */}
                          <div className="flex items-center gap-1.5">
                            {isDocRead ? (
                              <span className="flex items-center gap-1 text-[#10B981] font-black uppercase tracking-wider text-[9px]">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                <span>Đã đọc</span>
                              </span>
                            ) : doc.meta.isUpdated ? (
                              <span className="flex items-center gap-1 text-[#1E40AF] font-bold uppercase tracking-wider text-[8.5px] bg-blue-50 border border-blue-150 px-1.5 py-0.5 rounded select-none">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#1E40AF]"></span>
                                <span>Mới cập nhật</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium select-none">Chưa đọc</span>
                            )}
                          </div>

                          {/* Right action control display elements */}
                          <div className="flex items-center">
                            {doc.meta.badgeText === 'Bắt buộc đọc' ? (
                              <span className="px-2.5 py-1 bg-rose-50 border border-rose-150 rounded-lg text-[#C21A1A] text-[9.5px] font-black tracking-tight flex items-center gap-1 whitespace-nowrap select-none">
                                <span className="text-red-600">🔖</span>
                                <span>Bắt buộc đọc</span>
                              </span>
                            ) : doc.meta.badgeText === 'Xác nhận đã đọc' && !isDocRead ? (
                              <button
                                onClick={(e) => handleConfirmRead(doc.id, doc.title, e)}
                                className="px-2.5 py-1 bg-[#1E40AF] hover:bg-[#1E40AF]/90 text-white font-black text-[9px] tracking-wider rounded-lg uppercase whitespace-nowrap cursor-pointer transition-all active:scale-95 shadow-sm"
                              >
                                Xác nhận đã đọc
                              </button>
                            ) : doc.meta.driveLink ? (
                              <span className="px-2 py-1 bg-[#F1F5F9] border border-slate-250 hover:bg-slate-200 rounded-lg text-slate-600 font-bold text-[9px] tracking-tight inline-flex items-center gap-1 whitespace-nowrap transition-colors">
                                Xem Drive gốc
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 font-bold text-[9px]">
                                {doc.meta.badgeText}
                              </span>
                            )}
                          </div>

                        </div>

                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Quick-View Helper Map Guide */}
              <div className="mt-auto bg-slate-50 rounded-2xl border border-slate-150 p-4 flex flex-col md:flex-row items-center gap-4 text-left">
                <div className="p-2 bg-white rounded-xl border border-slate-200">
                  <span className="text-xl">💡</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-slate-800 text-xs">Mẹo tìm kiếm năng suất:</h4>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-0.5">
                    Click vào tiêu mục các Danh mục shortcut bên trái để lọc ngay lập tức các chủ đề liên quan (ví dụ: click "Quy chế" để chỉ hiển thị tài liệu quy định về thưởng, phạt, nghỉ phép).
                  </p>
                </div>
              </div>

            </div>
          ) : (
            /* 2B. IMMERSIVE INLINE WEB DOCUMENT READING PANEL & SPLIT PANE */
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col gap-4 animate-in fade-in duration-205">
              
              {/* Back navigation & details summary menu card */}
              <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-left">
                
                <button
                  onClick={() => setActiveDocId(null)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200 hover:border-slate-350 transition-all cursor-pointer shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-650 stroke-[3]" />
                  <span>Quay lại Danh sách</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs bg-white border border-slate-200 px-2.5 py-1 rounded-xl text-slate-500 font-extrabold uppercase tracking-wide">
                    {activeDoc?.category}
                  </span>
                  {activeDoc && readDocs[activeDoc.id] && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-150 rounded-xl text-emerald-600 text-xs font-black uppercase">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Bạn đã đọc</span>
                    </span>
                  )}
                </div>

              </div>

              {/* Reader Grid pane split: Col-1: Reading sheet, Col-2: Meta specs & rules */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                
                {/* 1. Large scrolling Document Sheet panel wrapper */}
                <div className="md:col-span-8 bg-slate-50/40 rounded-2xl border border-slate-155 p-5 flex flex-col select-text leading-relaxed">
                  
                  {/* Brand tags header inside reading sheet */}
                  <div className="flex items-center gap-2 select-none text-[#C21A1A] font-bold mb-3">
                    <span className="h-2 w-2 rounded-full bg-[#C21A1A]" />
                    <span className="text-[10px] font-black font-mono tracking-widest uppercase">mr. táo SOP standard - standard operating procedure</span>
                  </div>

                  <h2 className="text-base font-black tracking-tight text-slate-900 uppercase border-b border-slate-150 pb-4 mb-4 leading-snug font-display select-text text-left">
                    {activeDoc?.title}
                  </h2>

                  {/* Scroll viewport */}
                  <ScrollArea className="h-[450px] pr-3 select-text text-left">
                    <div className="space-y-2 pb-12 font-sans font-medium text-slate-700">
                      {activeDoc ? renderFormattedContent(activeDoc.content) : null}
                    </div>
                  </ScrollArea>

                </div>

                {/* 2. Side Panel layout inside Reader: Summary metadata check card */}
                <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between text-left shrink-0">
                  
                  <div className="space-y-4">
                    <div className="p-3 bg-red-50/40 rounded-xl border border-red-100 flex items-center gap-2.5">
                      <div className="p-1 rounded-full bg-[#C21A1A] text-white">
                        <Info className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11px] font-black text-slate-800 uppercase tracking-wide">Trách nghiệm tuân thủ</span>
                    </div>

                    {/* Metadata items list */}
                    <div className="space-y-3.5 text-xs text-slate-600">
                      <div>
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">CHỦ ĐỀ LỚN</span>
                        <span className="font-extrabold text-slate-800 text-[11px] mt-0.5 block">{activeDoc?.category}</span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">PHIÊN BẢN CÔNG BỐ</span>
                        <span className="font-mono font-bold text-slate-800 text-[11px] mt-0.5 block">SOP-LITE-PRO-2026</span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">PHÂN LOẠI QUY CHUẨN</span>
                        <span className="font-bold text-slate-800 text-[11px] mt-0.5 block">
                          {activeDoc?.meta.badgeText || 'Tài liệu hướng dẫn'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">CAM KẾT LƯU VẾT</span>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-1 font-medium">
                          Bằng việc nhấn hoàn tất đọc, bạn tự nguyện xác nhận hiểu rõ quy trình tóm tắt và thực hành đúng tiêu chuẩn tại cửa hàng.
                        </p>
                      </div>

                      {activeDoc?.meta.driveLink && (
                        <div className="pt-3 border-t">
                          <a 
                            href={activeDoc.meta.driveLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-extrabold text-[11px] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                            <span>Mở liên kết Drive Gốc</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Complete & signature workflow button section */}
                  <div className="pt-6 border-t mt-6 space-y-2 select-none">
                    {activeDoc && (
                      <button
                        onClick={() => {
                          setReadDocs(prev => ({ ...prev, [activeDoc.id]: true }));
                          showToast(`Xác nhận đã đọc thành công: "${activeDoc.title}"`);
                          setActiveDocId(null);
                        }}
                        className={`w-full py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 ${
                          readDocs[activeDoc.id]
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-[#C21A1A] hover:bg-[#A81515] text-white'
                        }`}
                      >
                        <FileCheck className="w-4 h-4 stroke-[2.5]" />
                        <span>
                          {readDocs[activeDoc.id] ? 'Ký lại xác nhận đã đọc' : 'Ký xác nhận đã đọc'}
                        </span>
                      </button>
                    )}

                    <p className="text-[10px] text-center text-slate-400 font-medium">
                      Biên bản điện tử được ghi nhận lưu trữ tại ca trực của bạn.
                    </p>
                  </div>

                </div>

              </div>

              {/* Reader bottom footer compliance panel */}
              <div className="px-4 py-3 bg-slate-50 rounded-2xl border border-slate-150 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium text-slate-400 select-none text-center sm:text-left">
                <span>MR.TÁO CONTROL SYSTEM • Hệ truyền đạt quy trình SOP Lite v1.1 • Độc quyền lưu hành nội bộ</span>
                <span className="font-mono text-[10px] text-slate-350">ID: {activeDoc?.id?.toUpperCase()}</span>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
