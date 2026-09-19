import React, { useState, useEffect } from 'react';
import {
  Search,
  Link as LinkIcon,
  Sliders,
  Tag,
  Building2,
  FolderOpen,
  Brain,
  Plus,
  X,
  Video,
  Key,
  Eye,
  EyeOff,
  Sparkles,
  Cpu,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import { extractAsinFromUrl } from '../services/api';

const GEMINI_KEY_STORAGE = 'shorts_hunter_gemini_api_key';
const GEMINI_MODEL_STORAGE = 'shorts_hunter_gemini_model';
const AI_PROVIDER_STORAGE = 'shorts_hunter_ai_provider';

export default function SearchForm({
  videoUrls,
  setVideoUrls,
  productUrl,
  setProductUrl,
  productName,
  setProductName,
  asin,
  setAsin,
  brand,
  setBrand,
  category,
  setCategory,
  maxResults,
  setMaxResults,
  aiProvider,
  setAiProvider,
  geminiApiKey,
  setGeminiApiKey,
  geminiModel,
  setGeminiModel,
  loading,
  onSubmit
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [rememberKey, setRememberKey] = useState(true);

  // Load API Key & Model from LocalStorage on mount
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem(GEMINI_KEY_STORAGE);
      const savedModel = localStorage.getItem(GEMINI_MODEL_STORAGE);
      const savedProvider = localStorage.getItem(AI_PROVIDER_STORAGE);
      if (savedKey && setGeminiApiKey) setGeminiApiKey(savedKey);
      if (savedModel && setGeminiModel) setGeminiModel(savedModel);
      if (savedProvider && setAiProvider) setAiProvider(savedProvider);
    } catch (e) {
      console.error('Lỗi đọc key từ storage', e);
    }
  }, [setGeminiApiKey, setGeminiModel, setAiProvider]);

  // Lưu API Key & Provider khi thay đổi
  const handleApiKeyChange = (val) => {
    setGeminiApiKey(val);
    if (rememberKey) {
      localStorage.setItem(GEMINI_KEY_STORAGE, val.trim());
    }
  };

  const handleProviderChange = (provider) => {
    setAiProvider(provider);
    localStorage.setItem(AI_PROVIDER_STORAGE, provider);
  };

  const handleModelChange = (model) => {
    setGeminiModel(model);
    localStorage.setItem(GEMINI_MODEL_STORAGE, model);
  };

  const updateUrl = (index, value) => {
    const newUrls = [...videoUrls];
    newUrls[index] = value;
    setVideoUrls(newUrls);
  };

  const addUrl = () => {
    if (videoUrls.length < 5) {
      setVideoUrls([...videoUrls, '']);
    }
  };

  const removeUrl = (index) => {
    if (videoUrls.length > 1) {
      setVideoUrls(videoUrls.filter((_, i) => i !== index));
    }
  };

  // Tự động cắt và nhận diện mã ASIN khi dán link sản phẩm Amazon
  const handleProductUrlChange = (val) => {
    setProductUrl(val);
    const autoAsin = extractAsinFromUrl(val);
    if (setAsin) {
      setAsin(autoAsin);
    }
  };

  const validUrlCount = videoUrls.filter((u) => u && u.trim().length > 0).length;
  const hasValidUrl = validUrlCount > 0;

  return (
    <form
      onSubmit={onSubmit}
      className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden space-y-6"
    >
      {/* Gradient glow effects */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/*  SECTION 1: AI MODEL ENGINE SELECTOR                                  */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3.5 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span>Mô Hình AI (Google Gemini Ultra / Pro & Local Hugging Face)</span>
          </label>

          {/* Toggle Switch */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleProviderChange('gemini')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                aiProvider === 'gemini'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Google Gemini AI</span>
            </button>

            <button
              type="button"
              onClick={() => handleProviderChange('local')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                aiProvider === 'local'
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>Hugging Face (Local)</span>
            </button>
          </div>
        </div>

        {/* Inputs khi chọn Google Gemini */}
        {aiProvider === 'gemini' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-3 border-t border-slate-800/80 animate-in fade-in-50">
            {/* Gemini Model Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                Model Google Gemini
              </label>
              <select
                value={geminiModel}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full h-10 bg-slate-800/90 border border-slate-700/90 rounded-xl px-3 text-xs text-slate-100 font-semibold focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              >
                <option value="gemini-3.6-flash">⚡ Gemini 3.6 Flash (Khuyên dùng - Cực nhanh & Tối ưu)</option>
                <option value="gemini-3.6-pro">🧠 Gemini 3.6 Pro (Ultra Reasoning & Content chuyên sâu)</option>
                <option value="gemini-3.5-flash">⚡ Gemini 3.5 Flash (Tốc độ cao & Ổn định)</option>
                <option value="gemini-3.1-pro">🧠 Gemini 3.1 Pro (Phân tích chuyên sâu)</option>
                <option value="gemini-2.5-flash">💡 Gemini 2.5 Flash (Thế hệ 2.5)</option>
                <option value="gemini-2.5-pro">💎 Gemini 2.5 Pro (Thế hệ 2.5 Pro)</option>
                <option value="gemini-2.0-flash">🚀 Gemini 2.0 Flash</option>
                <option value="gemini-1.5-flash">⚡ Gemini 1.5 Flash (Tương thích)</option>
                <option value="gemini-1.5-pro">🧠 Gemini 1.5 Pro (Tương thích)</option>
              </select>
            </div>

            {/* Gemini API Key Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                  <Key className="w-3 h-3 text-amber-400" />
                  Google Gemini API Key
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5"
                >
                  Lấy key AI Studio ↗
                </a>
              </div>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={geminiApiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  placeholder="Dán mã API Key (AIzaSy...)"
                  className="w-full h-10 bg-slate-800/90 border border-slate-700/90 rounded-xl px-3.5 pr-10 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 pt-1 border-t border-slate-800/80">
            💻 <b>Chế độ Local:</b> Sử dụng mô hình LaMini-Flan-T5 & SigLIP chạy 100% offline trên máy (hoàn toàn miễn phí, không cần API Key).
          </p>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/*  SECTION 2: LINK VIDEO MẪU & LINK SẢN PHẨM GỐC (CÂN XỨNG HOÀN HẢO)   */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10 items-stretch">
        {/* CỘT TRÁI: Link Video Mẫu (Nhiều URL) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            {/* Header Cột Trái */}
            <div className="flex items-center justify-between mb-2.5 h-6">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-purple-400" />
                <span>Link Video Mẫu Đầu Vào</span>
                <span className="text-rose-400">*</span>
              </label>
              <span className="text-[10px] font-bold text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-500/30">
                {validUrlCount}/5 video
              </span>
            </div>

            {/* Danh Sách Inputs */}
            <div className="space-y-2">
              {videoUrls.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-300 text-[11px] font-bold flex items-center justify-center shrink-0 border border-purple-500/30">
                    {index + 1}
                  </div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateUrl(index, e.target.value)}
                    placeholder={index === 0 ? 'Dán link video TikTok / YouTube / Douyin...' : 'Dán link video mẫu khác...'}
                    required={index === 0}
                    className="flex-1 h-10 bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
                  />
                  {videoUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeUrl(index)}
                      className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center transition-colors shrink-0"
                      title="Xóa link này"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Cột Trái */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            {videoUrls.length < 5 ? (
              <button
                type="button"
                onClick={addUrl}
                className="flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors py-1 px-2 rounded-lg hover:bg-purple-500/10"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm video mẫu ({videoUrls.length}/5)</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-500">Đã đạt tối đa 5 video mẫu</span>
            )}
            <span className="text-[10px] text-slate-500">Tất cả video nhập sẽ được giữ lại</span>
          </div>
        </div>

        {/* CỘT PHẢI: Link Sản Phẩm Gốc (Amazon / Web) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            {/* Header Cột Phải */}
            <div className="flex items-center justify-between mb-2.5 h-6">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-emerald-400" />
                <span>Link Sản Phẩm Gốc (Amazon / Web)</span>
              </label>
              {asin ? (
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 font-mono">
                  <Tag className="w-3 h-3" />
                  ASIN: {asin}
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Bọc geni.us
                </span>
              )}
            </div>

            {/* Input Link Sản Phẩm */}
            <div className="space-y-2">
              <input
                type="url"
                value={productUrl}
                onChange={(e) => handleProductUrlChange(e.target.value)}
                placeholder="https://www.amazon.com/dp/B0XXXXXX..."
                className="w-full h-10 bg-slate-800/90 border border-slate-700/80 rounded-xl px-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
              />
            </div>
          </div>

          {/* Footer Cột Phải */}
          <div className="pt-2 border-t border-slate-800/80">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {asin ? (
                <span className="text-amber-300/90 font-medium">
                  ✓ Đã tự động cắt mã ASIN: <b className="font-mono text-amber-300">{asin}</b>
                </span>
              ) : (
                <span>💡 Dán link Amazon, hệ thống sẽ tự động cắt lấy mã ASIN để định danh & so khớp video chuẩn xác.</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/*  SECTION 3: TÊN SẢN PHẨM                                              */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-2 relative z-10">
        <label className="block text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <Search className="w-4 h-4 text-cyan-400" />
          <span>Tên Sản Phẩm Amazon</span>
          <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          required
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Ví dụ: Neutrogena Ultra Sheer Dry-Touch Sunscreen SPF 70"
          className="w-full h-11 bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
        />
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/*  SECTION 4: TÙY CHỌN NÂNG CAO (Brand, Category)                      */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors py-1"
        >
          <Tag className="w-3.5 h-3.5" />
          <span>{showAdvanced ? 'Ẩn tùy chọn nâng cao' : 'Hiện tùy chọn nâng cao (Thương hiệu, Danh mục)'}</span>
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 relative z-10 animate-in slide-in-from-top-2">
          {/* Brand */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-emerald-400" />
              Thương hiệu (Tùy chọn)
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Neutrogena"
              className="w-full h-9 bg-slate-800/90 border border-slate-700 rounded-xl px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <FolderOpen className="w-3 h-3 text-blue-400" />
              Danh mục ngành hàng (Tùy chọn)
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Sunscreen, Skincare..."
              className="w-full h-9 bg-slate-800/90 border border-slate-700 rounded-xl px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/*  SECTION 5: SLIDER SỐ LƯỢNG & ACTION BUTTON                          */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      <div className="pt-4 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
        {/* Slider & Quick Presets */}
        <div className="w-full md:max-w-sm space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Số Lượng Video Tìm Thêm</span>
            </label>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
              {maxResults} video
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <input
              type="range"
              min="1"
              max="25"
              step="1"
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              className="flex-1 accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <input
              type="number"
              min="1"
              max="25"
              value={maxResults}
              onChange={(e) => setMaxResults(Math.max(1, Math.min(25, Number(e.target.value) || 1)))}
              className="w-14 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-center text-slate-100 font-bold focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
            <span className="text-[10px] text-slate-400 font-medium mr-1">Chọn nhanh:</span>
            {[3, 5, 8, 10, 15, 20].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setMaxResults(num)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                  maxResults === num
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20 scale-105'
                    : 'bg-slate-800/90 text-slate-400 border-slate-700/80 hover:text-slate-200 hover:bg-slate-700 hover:border-slate-600'
                }`}
              >
                {num} video
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !productName.trim() || !hasValidUrl}
          className={`flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-xl ${
            loading || !productName.trim() || !hasValidUrl
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.01] active:scale-[0.99]'
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>AI đang tìm & trích xuất video...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4 text-cyan-300" />
              <span>Khởi Chạy AI Tìm Video Sản Phẩm</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
