import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Download,
  Link as LinkIcon,
  Sparkles,
  ShieldCheck,
  Trash2,
  Plus,
  ExternalLink,
  Sliders,
  FolderOpen,
  FileText,
  Brain,
  RefreshCw,
  Wand2,
  Tag,
  Key,
  Eye,
  EyeOff,
  Zap,
  Cpu
} from 'lucide-react';
import { shortenAffiliateLink, generateSocialCaptions, extractAsinFromUrl } from '../services/api';

const STORAGE_KEY = 'shorts_hunter_affiliate_settings_v8';
const GEMINI_KEY_STORAGE = 'shorts_hunter_gemini_api_key';
const AI_MODEL_STORAGE = 'shorts_hunter_ai_model';
const DEFAULT_GROUP_ID = '410395';

// ── Bộ Hook Dự Phòng Phong Phú Tại Frontend (Đảm bảo 100% không bao giờ trùng lặp) ──
const FRONTEND_FALLBACK_HOOKS = [
  "I finally found the best {prod} on Amazon! Don't sleep on this ✨ #amazonfinds #musthaves",
  "This {prod} literally changed the game for me! 10/10 recommend 🔥 #tiktokmademebuyit",
  "Amazon find you didn't know you needed until now! ✨ #amazonmusthaves #lifehacks",
  "Unboxing my new favorite {prod}! So obsessed with the quality 💖 #unboxing",
  "Say goodbye to daily hassles with this amazing {prod}! ✨ #viralproducts",
  "Is this the best {prod} on Amazon? Testing it out for you! 👀 #productreview",
  "Best purchase I made this month! This {prod} is worth every penny ✨ #musthaves",
  "Stop scrolling if you need a good {prod}! Truly a lifesaver 🙌 #lifeeasier",
  "POV: You found the ultimate {prod} that everyone is raving about! 🔥 #amazonfinds",
  "Why did nobody tell me about this {prod} sooner?! 🤯 #viral #lifehacks",
  "Top tier Amazon find: this {prod} exceeded all my expectations! ✨ #amazonhaul",
  "Adding this {prod} to my daily essentials immediately! 100% worth it 💖 #musthave",
  "If you love smart and useful gadgets, you NEED this {prod}! 🔥 #tiktokmademebuyit",
  "Testing out the viral {prod} and it actually works! 👏 #review #amazonfinds",
  "My honest thoughts on this {prod}: absolute game changer! ✨ #honestreview",
  "Level up your everyday routine with this incredible {prod}! 🔥 #gadgets",
  "Aesthetic and super functional: obsessed with this {prod} ✨ #aesthetic",
  "Run, don't walk! This {prod} is an absolute must-have on Amazon 🔥 #deals",
  "The hype around this {prod} is 100% real! Check it out ✨ #viralvideo",
  "Smart purchase alert! This {prod} makes life so much easier 🙌 #amazongadgets",
  "Hands down the best {prod} I've tested so far! 10/10 🔥 #favorites",
  "Upgrade your lifestyle with this awesome {prod}! ✨ #amazonfavorites",
  "The secret to making daily tasks easier: this {prod}! 🙌 #lifehacks",
  "Never going back after using this {prod}! Totally obsessed 💖 #musthaves",
  "Can't believe I lived without this {prod} for so long! ✨ #amazonfinds",
];

export default function SheetGenerator({
  selectedVideos = [],
  productUrl = '',
  productName = '',
  asin = '',
  brand = '',
  category = '',
  aiProvider: parentAiProvider = 'gemini',
  geminiApiKey: parentGeminiApiKey = '',
  geminiModel: parentGeminiModel = 'gemini-3.6-flash',
}) {
  // ── AI Model & API Key State ──
  const [selectedAiModel, setSelectedAiModel] = useState(parentGeminiModel || 'gemini-3.6-flash');
  const [geminiApiKey, setGeminiApiKey] = useState(parentGeminiApiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);

  // ── Affiliate & Settings State ──
  const [currentProductUrl, setCurrentProductUrl] = useState(productUrl);
  const [groupId, setGroupId] = useState(DEFAULT_GROUP_ID);
  const [defaultPage, setDefaultPage] = useState('');
  const [defaultStatus, setDefaultStatus] = useState('Lên lịch');
  const [maxContentCount, setMaxContentCount] = useState(selectedVideos.length || 1);
  const [addHashtags, setAddHashtags] = useState(true);
  const [rememberSettings, setRememberSettings] = useState(true);

  // ── Tùy biến Cột C: Link SP (Có tên SP hoặc câu kêu gọi trước Link) ──
  const [linkFormatType, setLinkFormatType] = useState('product_name'); // 'product_name' | 'get_here' | 'link_sp' | 'pure' | 'custom'
  const [customLinkPrefix, setCustomLinkPrefix] = useState('👉 Mua tại đây:');

  // ── Sheet Data State ──
  const [sheetRows, setSheetRows] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegeneratingContent, setIsRegeneratingContent] = useState(false);
  const [copiedTsv, setCopiedTsv] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [shortUrlResult, setShortUrlResult] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  // Đồng bộ props từ App
  useEffect(() => {
    if (parentGeminiApiKey && !geminiApiKey) {
      setGeminiApiKey(parentGeminiApiKey);
    }
  }, [parentGeminiApiKey]);

  useEffect(() => {
    if (parentGeminiModel && parentGeminiModel !== selectedAiModel) {
      setSelectedAiModel(parentGeminiModel);
    }
  }, [parentGeminiModel]);

  // Đồng bộ productUrl từ bước 1
  useEffect(() => {
    if (productUrl && productUrl.trim()) {
      setCurrentProductUrl(productUrl.trim());
    } else if (!currentProductUrl && asin) {
      setCurrentProductUrl(`https://www.amazon.com/dp/${asin.trim()}`);
    }
  }, [productUrl, asin]);

  // Cập nhật maxContentCount khi selectedVideos thay đổi
  useEffect(() => {
    if (selectedVideos.length > 0) {
      setMaxContentCount(selectedVideos.length);
    }
  }, [selectedVideos.length]);

  // Load saved settings from LocalStorage
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem(GEMINI_KEY_STORAGE);
      if (savedKey) setGeminiApiKey(savedKey);

      const savedModel = localStorage.getItem(AI_MODEL_STORAGE);
      if (savedModel) setSelectedAiModel(savedModel);

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.groupId) setGroupId(parsed.groupId);
        if (parsed.defaultPage) setDefaultPage(parsed.defaultPage);
        if (parsed.defaultStatus) setDefaultStatus(parsed.defaultStatus);
        if (parsed.addHashtags !== undefined) setAddHashtags(parsed.addHashtags);
        if (parsed.linkFormatType) setLinkFormatType(parsed.linkFormatType);
        if (parsed.customLinkPrefix) setCustomLinkPrefix(parsed.customLinkPrefix);
      }
    } catch (e) {
      console.error('Không thể đọc settings từ localStorage', e);
    }
  }, []);

  // Lưu cấu hình vào LocalStorage
  const handleSaveSettings = () => {
    if (rememberSettings) {
      const config = {
        groupId,
        defaultPage,
        defaultStatus,
        addHashtags,
        linkFormatType,
        customLinkPrefix,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      localStorage.setItem(AI_MODEL_STORAGE, selectedAiModel);
      if (geminiApiKey.trim()) {
        localStorage.setItem(GEMINI_KEY_STORAGE, geminiApiKey.trim());
      }
    }
  };

  // Helper rút gọn tên sản phẩm cho Cột C nếu quá dài
  const getShortProductName = () => {
    const raw = (productName || brand || 'Sản phẩm').trim();
    const words = raw.split(/\s+/);
    if (words.length > 8) {
      return words.slice(0, 8).join(' ');
    }
    return raw;
  };

  // Helper định dạng giá trị Cột C (Link SP kèm tên / câu dẫn)
  const formatLinkSpValue = (rawShortUrl) => {
    if (!rawShortUrl) return '';
    const cleanUrl = rawShortUrl.trim();
    const shortProd = getShortProductName();

    if (linkFormatType === 'product_name') {
      return `${shortProd} 👉 ${cleanUrl}`;
    }
    if (linkFormatType === 'get_here') {
      return `Get it here 👉 ${cleanUrl}`;
    }
    if (linkFormatType === 'link_sp') {
      return `Link sp 👉 ${cleanUrl}`;
    }
    if (linkFormatType === 'custom') {
      const pfx = (customLinkPrefix || '👉').trim();
      return `${pfx} ${cleanUrl}`;
    }
    if (linkFormatType === 'pure') {
      return cleanUrl;
    }
    return `${shortProd} 👉 ${cleanUrl}`;
  };

  // Helper sinh Content không trùng lặp cho từng hàng
  const getUniqueContentForRow = (index, aiCaptionsList, video) => {
    if (aiCaptionsList && aiCaptionsList.length > index && aiCaptionsList[index]) {
      return aiCaptionsList[index].replace(/[\r\n\t]+/g, ' ').trim();
    }
    // Fallback: Lấy hook riêng biệt từ danh sách frontend
    const shortProd = getShortProductName();
    const hookTpl = FRONTEND_FALLBACK_HOOKS[index % FRONTEND_FALLBACK_HOOKS.length];
    let res = hookTpl.replace('{prod}', shortProd).trim();
    
    // Bổ sung hashtag nếu cần
    if (addHashtags && brand && !res.includes(`#${brand.toLowerCase()}`)) {
      res += ` #${brand.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;
    }
    return res;
  };

  // ── Sinh dữ liệu bảng Sheet (Kết hợp AI Content Độc Nhất + Link SP Có Tên) ──
  const handleGenerateSheet = async () => {
    if (selectedVideos.length === 0) {
      alert('Vui lòng chọn ít nhất 1 video để tạo Sheet!');
      return;
    }

    // Kiểm tra API Key nếu chọn model Gemini
    if (selectedAiModel.startsWith('gemini') && !geminiApiKey.trim()) {
      setStatusMessage({
        type: 'error',
        text: '⚠️ Vui lòng nhập Google Gemini API Key để sử dụng mô hình Gemini (hoặc chọn "Hugging Face (Local)" để chạy miễn phí không cần key)!',
      });
      return;
    }

    setIsGenerating(true);
    setStatusMessage(null);
    handleSaveSettings();

    try {
      const targetUrl = currentProductUrl.trim() || productUrl.trim();
      let finalShortUrl = targetUrl;

      // 1. Bọc link qua Geniuslink API backend
      if (targetUrl) {
        try {
          const res = await shortenAffiliateLink({
            url: targetUrl,
            groupId: groupId.trim() || DEFAULT_GROUP_ID,
          });
          if (res && res.short_url) {
            finalShortUrl = res.short_url;
            setShortUrlResult(finalShortUrl);
          }
        } catch (linkErr) {
          console.warn('Không thể bọc Geniuslink, dùng URL gốc:', linkErr);
        }
      }

      // 2. Số lượng dòng cần tạo
      const targetCount = Math.max(1, Math.min(50, Number(maxContentCount) || selectedVideos.length || 1));

      // 3. Gọi AI (Google Gemini hoặc Hugging Face) để sinh danh sách Content RIÊNG BIỆT (100% Unique)
      let aiCaptions = [];
      const isGemini = selectedAiModel.startsWith('gemini');
      const modelLabel = isGemini ? `Google Gemini (${selectedAiModel})` : 'Hugging Face Local';

      try {
        const aiRes = await generateSocialCaptions({
          productName: productName || 'Amazon Product',
          brand: brand || '',
          category: category || '',
          count: targetCount,
          aiProvider: isGemini ? 'gemini' : 'local',
          geminiApiKey: geminiApiKey.trim(),
          geminiModel: selectedAiModel,
        });
        if (aiRes && aiRes.captions && aiRes.captions.length > 0) {
          aiCaptions = aiRes.captions;
        }
      } catch (aiErr) {
        console.warn('Lỗi gọi AI sinh content, chuyển sang fallback đa dạng:', aiErr);
      }

      // 4. Lắp ghép các hàng
      const rows = [];
      const linkSpCellVal = formatLinkSpValue(finalShortUrl);

      for (let i = 0; i < targetCount; i++) {
        const video = selectedVideos[i % selectedVideos.length];
        const contentText = getUniqueContentForRow(i, aiCaptions, video);

        rows.push({
          id: `${video.video_url}-${i}-${Date.now()}`,
          // Cột A: Content (Mỗi hàng là một nội dung khác nhau hoàn toàn)
          content: contentText,
          // Cột B: URL (Đường dẫn video gốc)
          url: (video.video_url || '').trim(),
          // Cột C: Link sp (Có tên sản phẩm / câu dẫn trước link)
          linkSp: linkSpCellVal,
          // Cột D: Page (Tên Page hoặc để trống)
          page: defaultPage.trim(),
          // Cột E: Trạng thái ("Đã đăng" hoặc "Lên lịch")
          status: defaultStatus === 'Đã đăng' ? 'Đã đăng' : 'Lên lịch',
          // Cột F: Post ( Date time) - ĐỂ TRỐNG HOÀN TOÀN
          postTime: '',
          // Cột G: Link Post (Để trống nếu chưa đăng)
          linkPost: '',
        });
      }

      setSheetRows(rows);
      setStatusMessage({
        type: 'success',
        text: `✨ ${modelLabel} đã tạo ${rows.length} dòng nội dung viral! Cột C: "${linkSpCellVal.slice(0, 40)}..."`,
      });
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Có lỗi xảy ra khi tạo dữ liệu Sheet.' });
    } finally {
      setIsGenerating(false);
    }
  };

  // ── AI TẠO LẠI TOÀN BỘ CONTENT MỚI (MỖI HÀNG 1 CONTENT ĐỘC NHẤT) ──
  const handleRegenerateAiContent = async () => {
    if (sheetRows.length === 0) return;

    if (selectedAiModel.startsWith('gemini') && !geminiApiKey.trim()) {
      setStatusMessage({
        type: 'error',
        text: '⚠️ Vui lòng nhập Google Gemini API Key để sử dụng mô hình Gemini!',
      });
      return;
    }

    setIsRegeneratingContent(true);
    try {
      const isGemini = selectedAiModel.startsWith('gemini');
      const aiRes = await generateSocialCaptions({
        productName: productName || 'Amazon Product',
        brand: brand || '',
        category: category || '',
        count: sheetRows.length,
        aiProvider: isGemini ? 'gemini' : 'local',
        geminiApiKey: geminiApiKey.trim(),
        geminiModel: selectedAiModel,
      });

      let aiCaptions = (aiRes && aiRes.captions) || [];

      const updated = sheetRows.map((row, idx) => ({
        ...row,
        content: getUniqueContentForRow(idx, aiCaptions, { title: row.content }),
      }));

      setSheetRows(updated);
      setStatusMessage({
        type: 'success',
        text: `🤖 ${selectedAiModel.startsWith('gemini') ? 'Google Gemini' : 'Local AI'} đã làm mới toàn bộ nội dung Cột A (Mỗi hàng là 1 nội dung riêng biệt)!`,
      });
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối AI để tạo lại nội dung.');
    } finally {
      setIsRegeneratingContent(false);
    }
  };

  // Cập nhật lại định dạng Cột C cho toàn bộ các dòng hiện có
  const handleReapplyLinkSpFormat = () => {
    if (sheetRows.length === 0) return;
    const baseShort = shortUrlResult.trim() || currentProductUrl.trim() || productUrl.trim();
    const newFormatted = formatLinkSpValue(baseShort);
    const updated = sheetRows.map((r) => ({
      ...r,
      linkSp: newFormatted,
    }));
    setSheetRows(updated);
    setStatusMessage({ type: 'success', text: `Đã áp dụng định dạng Link SP mới cho toàn bộ ${sheetRows.length} dòng!` });
  };

  // Update 1 ô trong sheet
  const handleCellChange = (rowIndex, field, value) => {
    const updated = [...sheetRows];
    if (field === 'content' || field === 'linkSp') {
      value = value.replace(/[\r\n\t]+/g, ' ');
    }
    updated[rowIndex][field] = value;
    setSheetRows(updated);
  };

  // Xóa 1 hàng
  const handleDeleteRow = (rowIndex) => {
    setSheetRows(sheetRows.filter((_, i) => i !== rowIndex));
  };

  // Thêm 1 hàng mới
  const handleAddRow = () => {
    const baseShort = shortUrlResult.trim() || currentProductUrl.trim() || productUrl.trim();
    const newIndex = sheetRows.length;
    setSheetRows([
      ...sheetRows,
      {
        id: `custom-${Date.now()}`,
        content: getUniqueContentForRow(newIndex, [], { title: productName || '' }),
        url: '',
        linkSp: formatLinkSpValue(baseShort),
        page: defaultPage.trim(),
        status: defaultStatus === 'Đã đăng' ? 'Đã đăng' : 'Lên lịch',
        postTime: '',
        linkPost: '',
      },
    ]);
  };

  // ── Copy to Clipboard dạng TSV (CHỈ COPY DỮ LIỆU, KHÔNG COPY TIÊU ĐỀ TITLE, KHÔNG COPY CỘT SỐ) ──
  const handleCopyForGoogleSheets = () => {
    if (sheetRows.length === 0) return;

    // Data TSV (CHỈ CÁC DÒNG DỮ LIỆU - KHÔNG CÓ DÒNG HEADER TITLE)
    const rowsText = sheetRows.map((r) =>
      [
        (r.content || '').replace(/[\r\n\t]+/g, ' ').trim(),
        (r.url || '').replace(/[\r\n\t]+/g, ' ').trim(),
        (r.linkSp || '').replace(/[\r\n\t]+/g, ' ').trim(),
        (r.page || '').replace(/[\r\n\t]+/g, ' ').trim(),
        (r.status || '').replace(/[\r\n\t]+/g, ' ').trim(),
        '', // Cột F: Post ( Date time) luôn để trống
        (r.linkPost || '').replace(/[\r\n\t]+/g, ' ').trim(),
      ].join('\t')
    );

    const fullTsv = rowsText.join('\n');

    navigator.clipboard.writeText(fullTsv);
    setCopiedTsv(true);
    setTimeout(() => setCopiedTsv(false), 2500);
  };

  // ── Copy Bảng Markdown Hoàn Chỉnh (Markdown Table) ──
  const handleCopyMarkdownTable = () => {
    if (sheetRows.length === 0) return;

    const headers = ['Content', 'URL', 'Link sp', 'Page', 'Trạng thái', 'Post ( Date time)', 'Link Post'];
    const separator = ['---', '---', '---', '---', '---', '---', '---'];

    const escapeMd = (val) => String(val || '').replace(/\|/g, '\\|').replace(/[\r\n\t]+/g, ' ').trim();

    const mdRows = sheetRows.map((r) =>
      `| ${escapeMd(r.content)} | ${escapeMd(r.url)} | ${escapeMd(r.linkSp)} | ${escapeMd(r.page)} | ${escapeMd(r.status)} |  | ${escapeMd(r.linkPost)} |`
    );

    const mdTable = [
      `| ${headers.join(' | ')} |`,
      `| ${separator.join(' | ')} |`,
      ...mdRows,
    ].join('\n');

    navigator.clipboard.writeText(mdTable);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2500);
  };

  // ── Xuất File CSV (Chuẩn 7 cột, UTF-8 BOM) ──
  const handleExportCSV = () => {
    if (sheetRows.length === 0) return;

    const headers = ['Content', 'URL', 'Link sp', 'Page', 'Trạng thái', 'Post ( Date time)', 'Link Post'];

    const escapeCsv = (val) => {
      const str = String(val || '').replace(/[\r\n\t]+/g, ' ').trim();
      if (str.includes(',') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent =
      '\uFEFF' + // UTF-8 BOM
      [
        headers.map(escapeCsv).join(','),
        ...sheetRows.map((r) =>
          [r.content, r.url, r.linkSp, r.page, r.status, '', r.linkPost].map(escapeCsv).join(',')
        ),
      ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sheet_${productName ? productName.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30) : 'Content'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl relative mt-8 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Tạo Sheet & AI Sinh Nội Dung (Google Gemini Ultra/Pro & Local)
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                {selectedVideos.length} video đã chọn
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Mỗi hàng là một Content riêng biệt (100% Unique) · Cột C có tên sản phẩm / câu dẫn trước link
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>AI: {selectedAiModel.startsWith('gemini') ? selectedAiModel : 'LaMini-Flan-T5 (Local)'}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Geniuslink (Group: {groupId})</span>
          </div>
        </div>
      </div>

      {/* ── Bộ Chọn AI Model Cho Bước Tạo Sheet ── */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Mô Hình AI Sinh Caption Cột A
          </label>
          <span className="text-[11px] text-slate-400">
            Hỗ trợ tài khoản Google Gemini Ultra / Pro / Flash & Local Offline
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <select
              value={selectedAiModel}
              onChange={(e) => {
                setSelectedAiModel(e.target.value);
                localStorage.setItem(AI_MODEL_STORAGE, e.target.value);
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:border-purple-500"
            >
              <option value="gemini-3.6-flash">⚡ Google Gemini 3.6 Flash (Khuyên dùng - Cực nhanh & Tối ưu)</option>
              <option value="gemini-3.6-pro">🧠 Google Gemini 3.6 Pro (Ultra Reasoning & Content chuyên sâu)</option>
              <option value="gemini-3.5-flash">⚡ Google Gemini 3.5 Flash (Tốc độ cao & Ổn định)</option>
              <option value="gemini-3.1-pro">🧠 Google Gemini 3.1 Pro (Phân tích chuyên sâu)</option>
              <option value="gemini-2.5-flash">💡 Google Gemini 2.5 Flash (Thế hệ 2.5)</option>
              <option value="gemini-2.5-pro">💎 Google Gemini 2.5 Pro (Thế hệ 2.5 Pro)</option>
              <option value="gemini-2.0-flash">🚀 Google Gemini 2.0 Flash</option>
              <option value="gemini-1.5-flash">⚡ Google Gemini 1.5 Flash (Tương thích)</option>
              <option value="gemini-1.5-pro">🧠 Google Gemini 1.5 Pro (Tương thích)</option>
              <option value="local">💻 Hugging Face (Local Offline - Không cần API Key)</option>
            </select>
          </div>

          {selectedAiModel.startsWith('gemini') && (
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={geminiApiKey}
                onChange={(e) => {
                  setGeminiApiKey(e.target.value);
                  localStorage.setItem(GEMINI_KEY_STORAGE, e.target.value.trim());
                }}
                placeholder="Nhập Google Gemini API Key (AIzaSy...)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 pr-9 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Form Nhập Liệu ── */}
      <div className="space-y-4">
        {/* Row 1: Link Sản Phẩm & Group ID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Link sản phẩm gốc */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
                Link Sản Phẩm Gốc (Tự động lấy từ bước trên để bọc geni.us)
              </span>
              {(asin || extractAsinFromUrl(currentProductUrl)) && (
                <span className="text-[10px] text-amber-300 font-mono font-bold bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  ASIN: {asin || extractAsinFromUrl(currentProductUrl)}
                </span>
              )}
            </label>
            <input
              type="url"
              value={currentProductUrl}
              onChange={(e) => setCurrentProductUrl(e.target.value)}
              placeholder="https://www.amazon.com/dp/B0XXXXXX..."
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
            />
          </div>

          {/* Group ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-purple-400" />
              Geniuslink Group ID
            </label>
            <input
              type="text"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              placeholder="410395 hoặc 427612"
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>
        </div>

        {/* Row 2: Tùy Chọn Định Dạng Cột C (Link SP có Tên / Câu Dẫn) */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              Định dạng Cột C (Link SP): Có tên sản phẩm hoặc câu dẫn trước link
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              Ví dụ: <span className="text-emerald-300 font-semibold">{formatLinkSpValue('https://geni.us/sample')}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
              type="button"
              onClick={() => setLinkFormatType('product_name')}
              className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all text-left truncate ${
                linkFormatType === 'product_name'
                  ? 'bg-purple-600/30 text-purple-200 border-purple-500 shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Ghép tên sản phẩm vào trước link: [Tên SP] 👉 https://geni.us/..."
            >
              ⭐ [Tên SP] 👉 Link
            </button>

            <button
              type="button"
              onClick={() => setLinkFormatType('get_here')}
              className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all text-left truncate ${
                linkFormatType === 'get_here'
                  ? 'bg-purple-600/30 text-purple-200 border-purple-500 shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Get it here 👉 https://geni.us/..."
            >
              👉 Get it here 👉 Link
            </button>

            <button
              type="button"
              onClick={() => setLinkFormatType('link_sp')}
              className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all text-left truncate ${
                linkFormatType === 'link_sp'
                  ? 'bg-purple-600/30 text-purple-200 border-purple-500 shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Link sp 👉 https://geni.us/..."
            >
              🔗 Link sp 👉 Link
            </button>

            <button
              type="button"
              onClick={() => setLinkFormatType('pure')}
              className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all text-left truncate ${
                linkFormatType === 'pure'
                  ? 'bg-purple-600/30 text-purple-200 border-purple-500 shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Chỉ chứa duy nhất URL: https://geni.us/..."
            >
              🌐 Chỉ URL thuần
            </button>

            <button
              type="button"
              onClick={() => setLinkFormatType('custom')}
              className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all text-left truncate ${
                linkFormatType === 'custom'
                  ? 'bg-purple-600/30 text-purple-200 border-purple-500 shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Tự điền câu dẫn tùy chỉnh"
            >
              ✏️ Tùy chỉnh...
            </button>
          </div>

          {/* Ô nhập tùy chỉnh nếu chọn custom */}
          {linkFormatType === 'custom' && (
            <div className="pt-1 flex items-center gap-2">
              <input
                type="text"
                value={customLinkPrefix}
                onChange={(e) => setCustomLinkPrefix(e.target.value)}
                placeholder="Nhập câu dẫn (vd: 👉 Mua tại đây:)"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              {sheetRows.length > 0 && (
                <button
                  type="button"
                  onClick={handleReapplyLinkSpFormat}
                  className="px-3 py-2 rounded-xl bg-cyan-600/20 text-cyan-300 text-xs font-semibold border border-cyan-500/40 hover:bg-cyan-600/30 transition-colors"
                >
                  Áp dụng vào bảng
                </button>
              )}
            </div>
          )}
        </div>

        {/* Row 3: Số lượng dòng & Cấu hình Page/Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
          {/* Số lượng dòng Sheet */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Số Lượng Dòng Cần Tạo (AI sẽ sinh từng nội dung riêng)
              </span>
              <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                {maxContentCount} dòng
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={maxContentCount}
                onChange={(e) => setMaxContentCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                className="flex-1 accent-amber-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <input
                type="number"
                min="1"
                max="50"
                value={maxContentCount}
                onChange={(e) => setMaxContentCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                className="w-14 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-center text-slate-100 font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {[1, 3, 5, 10, 20].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setMaxContentCount(num)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                    maxContentCount === num
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {num} dòng
                </button>
              ))}
            </div>
          </div>

          {/* Tên Page */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Tên Page (Cột D)
            </label>
            <input
              type="text"
              value={defaultPage}
              onChange={(e) => setDefaultPage(e.target.value)}
              placeholder="Để trống hoặc tên Page"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Trạng Thái (Cột E)
            </label>
            <select
              value={defaultStatus}
              onChange={(e) => setDefaultStatus(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-semibold"
            >
              <option value="Lên lịch">Lên lịch</option>
              <option value="Đã đăng">Đã đăng</option>
            </select>
          </div>
        </div>

        {/* Row 4: Tùy chọn Hashtags & Lưu cấu hình */}
        <div className="flex items-center justify-between flex-wrap gap-4 pt-1 border-t border-slate-800/60">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="add_hashtags_v8"
              checked={addHashtags}
              onChange={(e) => setAddHashtags(e.target.checked)}
              className="w-4 h-4 rounded accent-purple-500 bg-slate-800 border-slate-700 cursor-pointer"
            />
            <label htmlFor="add_hashtags_v8" className="text-xs text-slate-300 cursor-pointer flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Tự động thêm Hashtags viral vào bài viết
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember_settings_v8"
              checked={rememberSettings}
              onChange={(e) => setRememberSettings(e.target.checked)}
              className="w-4 h-4 rounded accent-purple-500 bg-slate-800 border-slate-700 cursor-pointer"
            />
            <label htmlFor="remember_settings_v8" className="text-xs text-slate-400 cursor-pointer">
              Lưu cấu hình cho lần sau
            </label>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                : statusMessage.type === 'warning'
                ? 'bg-amber-950/40 text-amber-300 border border-amber-500/30'
                : 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
            }`}
          >
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Nút Action Tạo Sheet */}
        <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
          <span className="text-xs text-slate-500">
            {selectedVideos.length > 0
              ? `Sẵn sàng tạo ${maxContentCount} dòng (Mỗi dòng 1 Content riêng biệt)`
              : 'Hãy chọn ít nhất 1 video ở bảng kết quả phía trên'}
          </span>

          <button
            type="button"
            onClick={handleGenerateSheet}
            disabled={isGenerating || selectedVideos.length === 0}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs transition-all shadow-lg ${
              isGenerating || selectedVideos.length === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.01]'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{selectedAiModel.startsWith('gemini') ? 'Gemini AI' : 'AI'} đang viết Content & bọc link...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 text-cyan-300" />
                <span>AI Sinh Content & Tạo Sheet (7 Cột)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/*  BẢN PREVIEW SHEET (CHUẨN 7 CỘT: A, B, C, D, E, F, G)                   */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {sheetRows.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-800 space-y-4 animate-in fade-in-50 duration-500">
          {/* Sheet Actions Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-200 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-purple-400" />
                Bảng Google Sheets Đã Tạo ({sheetRows.length} dòng)
              </span>
              <span className="text-[11px] text-slate-500">· Cột A 100% Unique · Cột F để trống</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Nút AI Tạo Lại Content Mới */}
              <button
                type="button"
                onClick={handleRegenerateAiContent}
                disabled={isRegeneratingContent}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/40 transition-all hover:scale-105"
                title="Yêu cầu AI viết lại toàn bộ nội dung Cột A với các hook và review mới (không trùng lặp)"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingContent ? 'animate-spin' : ''}`} />
                <span>{isRegeneratingContent ? 'AI Đang Viết...' : 'AI Đổi Nội Dung Mới'}</span>
              </button>

              {/* Copy for Google Sheets (TSV - DATA ONLY, NO TITLE) */}
              <button
                type="button"
                onClick={handleCopyForGoogleSheets}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95"
                title="Sao chép toàn bộ các dòng dữ liệu (không kèm dòng title). Sang Google Sheets bấm Ctrl+V để dán trực tiếp!"
              >
                {copiedTsv ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedTsv ? 'Đã Copy Dữ Liệu!' : 'Copy Dán Vào Google Sheets'}</span>
              </button>

              {/* Copy Markdown Table */}
              <button
                type="button"
                onClick={handleCopyMarkdownTable}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                title="Sao chép dưới dạng bảng Markdown Table"
              >
                {copiedMd ? <Check className="w-4 h-4 text-emerald-300" /> : <FileText className="w-4 h-4 text-purple-400" />}
                <span>{copiedMd ? 'Đã Copy MD!' : 'Copy Markdown'}</span>
              </button>

              {/* Export CSV */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                title="Tải về file CSV chuẩn Excel"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Xuất CSV</span>
              </button>

              {/* Add row */}
              <button
                type="button"
                onClick={handleAddRow}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
                title="Thêm một dòng mới"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Thêm dòng</span>
              </button>
            </div>
          </div>

          {/* Google Sheets Table UI (7 Cột Chuẩn Tuyệt Đối) */}
          <div className="overflow-x-auto rounded-xl border border-slate-700/80 shadow-2xl bg-[#0d1322]">
            <table className="w-full text-left border-collapse text-xs font-sans">
              {/* Table Headers */}
              <thead>
                <tr className="border-b border-slate-700 font-bold select-none text-[11px]">
                  {/* STT Chỉ mục UI (KHÔNG LƯU) */}
                  <th className="p-2.5 w-10 text-center bg-slate-800/90 text-slate-400 border-r border-slate-700" title="Chỉ số giao diện (không copy vào Sheet)">
                    #
                  </th>

                  {/* Cột A: Content */}
                  <th className="p-2.5 min-w-[280px] bg-[#e6d8c3] text-slate-900 border-r border-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-purple-700" />
                      <span>A · Content (AI Generated - Mỗi Hàng 1 Nội Dung)</span>
                    </div>
                  </th>

                  {/* Cột B: URL */}
                  <th className="p-2.5 min-w-[200px] bg-[#cde0f7] text-slate-900 border-r border-slate-600">
                    <span>B · URL</span>
                  </th>

                  {/* Cột C: Link sp */}
                  <th className="p-2.5 min-w-[230px] bg-[#e6d8c3] text-slate-900 border-r border-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3 h-3 text-amber-700" />
                      <span>C · Link sp (Kèm tên/câu dẫn)</span>
                    </div>
                  </th>

                  {/* Cột D: Page */}
                  <th className="p-2.5 w-28 bg-[#f6a21e] text-slate-950 border-r border-slate-600">
                    <span>D · Page</span>
                  </th>

                  {/* Cột E: Trạng thái */}
                  <th className="p-2.5 w-32 bg-[#f6a21e] text-slate-950 border-r border-slate-600">
                    <span>E · Trạng thái</span>
                  </th>

                  {/* Cột F: Post ( Date time) */}
                  <th className="p-2.5 min-w-[150px] bg-[#27ae60] text-white border-r border-slate-600">
                    <span>F · Post ( Date time)</span>
                  </th>

                  {/* Cột G: Link Post */}
                  <th className="p-2.5 min-w-[160px] bg-[#27ae60] text-white border-r border-slate-600">
                    <span>G · Link Post</span>
                  </th>

                  {/* Action delete */}
                  <th className="p-2.5 w-10 text-center bg-slate-800 text-slate-400">
                    ✕
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-800/80 bg-slate-950/90 text-slate-200">
                {sheetRows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="hover:bg-purple-950/10 transition-colors group border-b border-slate-800/60"
                  >
                    {/* Index UI */}
                    <td className="p-2 text-center text-slate-500 font-mono text-[10px] border-r border-slate-800 select-none bg-slate-900/40">
                      {index + 2}
                    </td>

                    {/* Cột A: Content (Mỗi dòng riêng biệt) */}
                    <td className="p-1.5 border-r border-slate-800/80">
                      <input
                        type="text"
                        value={row.content}
                        onChange={(e) => handleCellChange(index, 'content', e.target.value)}
                        className="w-full bg-transparent p-1.5 text-xs text-slate-100 rounded focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                        placeholder="Nội dung bài viết kèm hashtag..."
                      />
                    </td>

                    {/* Cột B: URL */}
                    <td className="p-1.5 border-r border-slate-800/80">
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={row.url}
                          onChange={(e) => handleCellChange(index, 'url', e.target.value)}
                          className="w-full bg-transparent p-1.5 text-xs text-blue-400 font-mono underline rounded focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 truncate"
                        />
                        {row.url && (
                          <a
                            href={row.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-500 hover:text-blue-400 shrink-0"
                            title="Mở video"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Cột C: Link sp (KÈM TÊN SP / CÂU DẪN) */}
                    <td className="p-1.5 border-r border-slate-800/80">
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={row.linkSp}
                          onChange={(e) => handleCellChange(index, 'linkSp', e.target.value)}
                          className="w-full bg-transparent p-1.5 text-xs text-emerald-400 font-mono rounded focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 font-semibold"
                          placeholder="[Tên SP] 👉 https://geni.us/..."
                        />
                        {row.linkSp && (
                          <a
                            href={row.linkSp.includes('http') ? row.linkSp.slice(row.linkSp.indexOf('http')) : '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-500 hover:text-emerald-400 shrink-0"
                            title="Thử mở link sản phẩm"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Cột D: Page */}
                    <td className="p-1.5 border-r border-slate-800/80">
                      <input
                        type="text"
                        value={row.page}
                        onChange={(e) => handleCellChange(index, 'page', e.target.value)}
                        className="w-full bg-transparent p-1.5 text-xs text-slate-200 rounded focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 text-center"
                        placeholder="Page..."
                      />
                    </td>

                    {/* Cột E: Trạng thái (CHỈ 2 GIÁ TRỊ: "Đã đăng" hoặc "Lên lịch") */}
                    <td className="p-1.5 border-r border-slate-800/80 text-center">
                      <select
                        value={row.status}
                        onChange={(e) => handleCellChange(index, 'status', e.target.value)}
                        className={`w-full text-[11px] font-bold py-1.5 px-2 rounded-lg border appearance-none text-center cursor-pointer transition-colors ${
                          row.status === 'Đã đăng'
                            ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                        }`}
                      >
                        <option value="Lên lịch" className="bg-slate-900 text-amber-300 font-bold">Lên lịch</option>
                        <option value="Đã đăng" className="bg-slate-900 text-emerald-300 font-bold">Đã đăng</option>
                      </select>
                    </td>

                    {/* Cột F: Post ( Date time) - ĐỂ TRỐNG */}
                    <td className="p-1.5 border-r border-slate-800/80">
                      <input
                        type="text"
                        value={row.postTime}
                        onChange={(e) => handleCellChange(index, 'postTime', e.target.value)}
                        className="w-full bg-transparent p-1.5 text-xs text-emerald-400 font-mono rounded focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 text-center"
                        placeholder="(Để trống)"
                      />
                    </td>

                    {/* Cột G: Link Post */}
                    <td className="p-1.5 border-r border-slate-800/80">
                      <input
                        type="text"
                        value={row.linkPost}
                        onChange={(e) => handleCellChange(index, 'linkPost', e.target.value)}
                        className="w-full bg-transparent p-1.5 text-xs text-blue-300 font-mono rounded focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        placeholder="facebook.com/..."
                      />
                    </td>

                    {/* Action delete */}
                    <td className="p-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(index)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Xóa dòng này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Guide */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 flex-wrap gap-2">
            <span className="flex items-center gap-1.5">
              💡 <b>Mẹo:</b> Bấm <b>"Copy Dán Vào Google Sheets"</b> → Sang Sheets đặt con trỏ tại ô trống đầu tiên nhấn <b>Ctrl+V</b> (Cmd+V) để dán chuẩn xác đúng 7 cột A → G (không dính dòng tiêu đề).
            </span>
            <span className="text-purple-400 font-mono font-semibold">
              {selectedAiModel.startsWith('gemini') ? `Google Gemini (${selectedAiModel})` : 'Hugging Face Local'} · 100% Unique Captions
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
