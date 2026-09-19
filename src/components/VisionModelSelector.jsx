import React, { useState, useEffect, useCallback } from 'react';
import {
  Eye,
  Cpu,
  Download,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
  MemoryStick,
  RefreshCw,
  CircleDot,
  Circle,
  PlusCircle,
  MinusCircle,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { getVisionModels, downloadVisionModel } from '../services/api';

const VISION_MODE_STORAGE      = 'shorts_hunter_vision_mode';
const VISION_PRIMARY_STORAGE   = 'shorts_hunter_vision_primary';
const VISION_SECONDARY_STORAGE = 'shorts_hunter_vision_secondary';

/* ── Thông tin phần cứng tối thiểu ───────────────────────────────────────── */
const MODEL_HW = {
  'siglip-base': {
    emoji: '🟢', badge: 'CPU OK',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    ramBadge: '~0.3 GB', minSpec: 'CPU 2+ nhân · RAM ≥ 2 GB',
    speed: '⚡ Rất nhanh', accuracy: '★★☆☆☆',
    note: 'SigLIP Base cũ — tương thích nhưng không khuyên dùng cho production.',
  },
  'siglip2-base': {
    emoji: '🟡', badge: 'CPU OK',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    ramBadge: '~0.4 GB', minSpec: 'CPU 2+ nhân · RAM ≥ 2 GB',
    speed: '⚡ Nhanh', accuracy: '★★★☆☆',
    note: 'SigLIP 2 Base — nhẹ, chạy tốt trên máy bình thường.',
  },
  'siglip2-so400m': {
    emoji: '🔵', badge: 'Khuyên dùng',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    ramBadge: '~1.6 GB', minSpec: 'CPU 4+ nhân · RAM ≥ 4 GB (GPU không bắt buộc)',
    speed: '🚀 Trung bình', accuracy: '★★★★☆',
    note: 'SO400M 384px — tốt nhất dòng SigLIP cho video retrieval.',
  },
  'clip-vit-b32': {
    emoji: '🟢', badge: 'CPU OK',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    ramBadge: '~0.3 GB', minSpec: 'CPU 2+ nhân · RAM ≥ 1 GB',
    speed: '⚡ Rất nhanh', accuracy: '★★☆☆☆',
    note: 'CLIP ViT-B/32 — nhanh nhưng kém chính xác hơn thế hệ mới.',
  },
  'clip-vit-l14': {
    emoji: '🟠', badge: 'GPU Gợi ý',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    ramBadge: '~1.2 GB', minSpec: 'CPU 4+ nhân · RAM ≥ 4 GB hoặc GPU 4 GB VRAM',
    speed: '🚀 Trung bình', accuracy: '★★★★☆',
    note: 'CLIP ViT-L/14 — lớn hơn B/32 đáng kể, nên có GPU để tăng tốc.',
  },
  'dinov2-small': {
    emoji: '🟢', badge: 'CPU OK',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    ramBadge: '~0.1 GB', minSpec: 'CPU bất kỳ · RAM ≥ 1 GB',
    speed: '⚡ Rất nhanh', accuracy: '★★★☆☆',
    note: 'DINOv2 nhỏ nhất — nhẹ, phù hợp làm model phụ (ensemble).',
  },
  'dinov2-base': {
    emoji: '🟡', badge: 'CPU OK',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    ramBadge: '~0.3 GB', minSpec: 'CPU 2+ nhân · RAM ≥ 2 GB',
    speed: '⚡ Nhanh', accuracy: '★★★☆☆',
    note: 'DINOv2 Base — cân bằng tốt tốc độ và độ chính xác visual.',
  },
  'dinov2-large': {
    emoji: '🔵', badge: 'GPU Gợi ý',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    ramBadge: '~1.2 GB', minSpec: 'CPU 4+ nhân · RAM ≥ 4 GB hoặc GPU 4 GB VRAM',
    speed: '🚀 Trung bình', accuracy: '★★★★☆',
    note: 'DINOv2 Large — rất mạnh cho visual/product matching. Ensemble tốt với SigLIP2.',
  },
  'dinov2-giant': {
    emoji: '🔴', badge: 'GPU Bắt buộc',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
    ramBadge: '~4.5 GB VRAM', minSpec: 'GPU NVIDIA ≥ 8 GB VRAM (RTX 3080 trở lên)',
    speed: '🐢 Chậm', accuracy: '★★★★★',
    note: 'Mạnh nhất DINOv2 — cần GPU mạnh, không chạy được trên CPU thường.',
  },
};

const ALL_MODELS = Object.keys(MODEL_HW);

/* ── Preset shortcuts ─────────────────────────────────────────────────────── */
const PRESETS = [
  { id: 'fast',     label: '⚡ Nhanh',      primary: 'siglip2-base',   secondary: null,          minSpec: 'RAM ≥ 2 GB',     color: 'text-yellow-400', activeBg: 'bg-yellow-500/10 border-yellow-500/40' },
  { id: 'balanced', label: '⭐ Cân Bằng',   primary: 'siglip2-so400m', secondary: null,          minSpec: 'RAM ≥ 4 GB',     color: 'text-blue-400',   activeBg: 'bg-blue-500/10 border-blue-500/40'   },
  { id: 'accurate', label: '🎯 Chính Xác',  primary: 'siglip2-so400m', secondary: 'dinov2-large', minSpec: 'RAM ≥ 8 GB/GPU', color: 'text-purple-400', activeBg: 'bg-purple-500/10 border-purple-500/40'},
];

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function VisionModelSelector({
  visionMode,
  setVisionMode,
  visionPrimaryModel,
  setVisionPrimaryModel,
  visionSecondaryModel,
  setVisionSecondaryModel,
}) {
  const [expanded,       setExpanded]       = useState(false);
  const [loadedSet,      setLoadedSet]      = useState(new Set());   // model IDs đã tải về
  const [downloading,    setDownloading]    = useState({});          // {id: true/false}
  const [downloadErr,    setDownloadErr]    = useState({});          // {id: true/false}
  const [backendOk,      setBackendOk]      = useState(true);

  /* ── Fetch trạng thái tải từ backend ─────────────────────────────────── */
  const fetchStatus = useCallback(async () => {
    try {
      const data = await getVisionModels();
      const loaded = new Set(
        (data.models || []).filter((m) => m.is_loaded).map((m) => m.id)
      );
      setLoadedSet(loaded);
      setBackendOk(true);
    } catch {
      setBackendOk(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  /* ── Restore từ localStorage (chỉ giữ nếu model đó đã được tải) ──────── */
  useEffect(() => {
    if (loadedSet.size === 0) return;           // chờ fetchStatus xong trước
    const savedMode      = localStorage.getItem(VISION_MODE_STORAGE);
    const savedPrimary   = localStorage.getItem(VISION_PRIMARY_STORAGE);
    const savedSecondary = localStorage.getItem(VISION_SECONDARY_STORAGE);

    const validPrimary   = savedPrimary   && loadedSet.has(savedPrimary)   ? savedPrimary   : null;
    const validSecondary = savedSecondary && loadedSet.has(savedSecondary) ? savedSecondary : null;

    if (validPrimary)   setVisionPrimaryModel(validPrimary);
    if (validSecondary) setVisionSecondaryModel(validSecondary);
    if (savedMode)      setVisionMode(savedMode);
  }, [loadedSet]); // eslint-disable-line

  /* ── Nếu model đang chọn bị xoá khỏi loadedSet → reset ──────────────── */
  useEffect(() => {
    if (visionPrimaryModel && !loadedSet.has(visionPrimaryModel)) {
      setVisionPrimaryModel(null);
      setVisionSecondaryModel(null);
      localStorage.removeItem(VISION_PRIMARY_STORAGE);
      localStorage.removeItem(VISION_SECONDARY_STORAGE);
    }
    if (visionSecondaryModel && !loadedSet.has(visionSecondaryModel)) {
      setVisionSecondaryModel(null);
      localStorage.removeItem(VISION_SECONDARY_STORAGE);
    }
  }, [loadedSet]); // eslint-disable-line

  /* ── Helpers ──────────────────────────────────────────────────────────── */
  const persist = (mode, primary, secondary) => {
    setVisionMode(mode);
    setVisionPrimaryModel(primary);
    setVisionSecondaryModel(secondary);
    localStorage.setItem(VISION_MODE_STORAGE, mode);
    primary   ? localStorage.setItem(VISION_PRIMARY_STORAGE, primary)     : localStorage.removeItem(VISION_PRIMARY_STORAGE);
    secondary ? localStorage.setItem(VISION_SECONDARY_STORAGE, secondary) : localStorage.removeItem(VISION_SECONDARY_STORAGE);
  };

  /* Chọn preset — chỉ set nếu model đã tải */
  const applyPreset = (preset) => {
    const primary   = loadedSet.has(preset.primary)            ? preset.primary   : null;
    const secondary = preset.secondary && loadedSet.has(preset.secondary) ? preset.secondary : null;
    persist(preset.id, primary, secondary);
  };

  /* Chọn primary từ card (chỉ khi đã tải) */
  const selectPrimary = (modelId) => {
    if (!loadedSet.has(modelId)) return;
    const newSec = visionSecondaryModel === modelId ? null : visionSecondaryModel;
    persist('custom', modelId, newSec);
  };

  /* Toggle secondary */
  const toggleSecondary = (modelId) => {
    if (!loadedSet.has(modelId)) return;
    const newSec = visionSecondaryModel === modelId ? null : modelId;
    persist('custom', visionPrimaryModel, newSec);
  };

  /* Tải model */
  const handleDownload = async (modelId) => {
    setDownloading((p) => ({ ...p, [modelId]: true }));
    setDownloadErr((p) => ({ ...p, [modelId]: false }));
    try {
      const res = await downloadVisionModel(modelId);
      if (res.success) {
        setLoadedSet((prev) => new Set([...prev, modelId]));
      } else {
        setDownloadErr((p) => ({ ...p, [modelId]: true }));
      }
    } catch {
      setDownloadErr((p) => ({ ...p, [modelId]: true }));
    } finally {
      setDownloading((p) => ({ ...p, [modelId]: false }));
      fetchStatus();
    }
  };

  /* ── Derived ─────────────────────────────────────────────────────────── */
  const hasAnyLoaded = loadedSet.size > 0;
  const hasSelected  = !!visionPrimaryModel;

  const summaryText = hasSelected
    ? `${visionPrimaryModel}${visionSecondaryModel ? ' + ' + visionSecondaryModel + ' (ensemble)' : ''}`
    : 'Chưa chọn model';

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 relative z-10 transition-colors ${
      !hasSelected ? 'bg-amber-950/20 border-amber-500/30' : 'bg-slate-950/70 border-slate-800'
    }`}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <span>Computer Vision Model</span>
          {!hasSelected && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
              <AlertCircle className="w-3 h-3" /> Bắt buộc chọn
            </span>
          )}
        </label>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {expanded ? 'Thu gọn' : 'Mở rộng'}
        </button>
      </div>

      {/* Cảnh báo khi chưa có model nào */}
      {!hasAnyLoaded && (
        <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-amber-300">Chưa có Vision Model nào được tải về</p>
            <p className="text-[10px] text-amber-400/80 mt-0.5">
              Mở rộng phần này → chọn model phù hợp với máy → nhấn <b>Tải về</b> → sau đó chọn để dùng.
            </p>
          </div>
        </div>
      )}

      {/* Summary khi có model đã chọn & đang đóng */}
      {!expanded && hasSelected && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-xs text-slate-200 font-medium font-mono truncate">{summaryText}</span>
          {MODEL_HW[visionPrimaryModel] && (
            <span className={`ml-auto shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${MODEL_HW[visionPrimaryModel].badgeColor}`}>
              {MODEL_HW[visionPrimaryModel].badge}
            </span>
          )}
        </div>
      )}

      {/* Expanded panel */}
      {expanded && (
        <div className="space-y-4 pt-2 border-t border-slate-800/80 animate-in fade-in-50">

          {/* ── Preset buttons ─────────────────────────────────────────── */}
          <div>
            <p className="text-[11px] font-semibold text-slate-400 mb-2">Chọn nhanh theo preset</p>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((p) => {
                const primaryLoaded   = loadedSet.has(p.primary);
                const secondaryLoaded = !p.secondary || loadedSet.has(p.secondary);
                const fullyAvailable  = primaryLoaded && secondaryLoaded;
                const partlyAvailable = primaryLoaded && !secondaryLoaded;
                const isActive        = visionMode === p.id && visionPrimaryModel === p.primary;

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => fullyAvailable || partlyAvailable ? applyPreset(p) : null}
                    disabled={!primaryLoaded}
                    className={`relative flex flex-col gap-1 p-2.5 rounded-xl border text-left transition-all ${
                      !primaryLoaded
                        ? 'bg-slate-900/30 border-slate-800 opacity-40 cursor-not-allowed'
                        : isActive
                        ? `${p.activeBg} shadow-sm`
                        : 'bg-slate-900/50 border-slate-700/80 hover:border-slate-600 cursor-pointer'
                    }`}
                  >
                    {!primaryLoaded && (
                      <Lock className="absolute top-2 right-2 w-3 h-3 text-slate-600" />
                    )}
                    <span className={`text-[11px] font-bold ${isActive ? p.color : primaryLoaded ? 'text-slate-300' : 'text-slate-600'}`}>
                      {p.label}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono leading-tight">
                      {p.primary}
                      {p.secondary && <><br />+ {p.secondary}</>}
                    </span>
                    {partlyAvailable && (
                      <span className="text-[9px] text-amber-400">⚠ model phụ chưa tải</span>
                    )}
                    {!primaryLoaded && (
                      <span className="text-[9px] text-slate-600">Cần tải model trước</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Model list ─────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <Info className="w-3 h-3" />
                Tất cả models — tải về để mở khoá chọn
              </p>
              <button type="button" onClick={fetchStatus}
                className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mb-3 px-1 flex-wrap">
              <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <CircleDot className="w-3.5 h-3.5 text-cyan-400" /> Model chính (Primary)
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <PlusCircle className="w-3.5 h-3.5 text-purple-400" /> Model phụ Ensemble
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <Lock className="w-3 h-3 text-slate-600" /> Cần tải trước
              </span>
            </div>

            <div className="space-y-2">
              {ALL_MODELS.map((modelId) => {
                const hw             = MODEL_HW[modelId];
                const isLoaded       = loadedSet.has(modelId);
                const isDownloading  = !!downloading[modelId];
                const hasError       = !!downloadErr[modelId];
                const isPrimary      = visionPrimaryModel === modelId;
                const isSecondary    = visionSecondaryModel === modelId;
                const canBeSecondary = isLoaded && !!visionPrimaryModel && visionPrimaryModel !== modelId;

                return (
                  <div
                    key={modelId}
                    className={`rounded-xl border transition-all ${
                      isPrimary   ? 'bg-cyan-500/8 border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                      : isSecondary ? 'bg-purple-500/8 border-purple-500/40'
                      : isLoaded    ? 'bg-slate-900/60 border-slate-700/80 hover:border-slate-600'
                      :               'bg-slate-900/30 border-slate-800/60 opacity-60'
                    }`}
                  >
                    {/* Main row */}
                    <div className="flex items-start gap-3 p-3">

                      {/* Radio chọn Primary — chỉ click được khi đã tải */}
                      <button
                        type="button"
                        title={isLoaded ? 'Chọn làm model chính' : 'Tải về trước để chọn'}
                        onClick={() => isLoaded && selectPrimary(modelId)}
                        className={`mt-0.5 shrink-0 transition-colors ${
                          !isLoaded    ? 'text-slate-700 cursor-not-allowed'
                          : isPrimary  ? 'text-cyan-400 cursor-pointer'
                          :              'text-slate-500 hover:text-slate-300 cursor-pointer'
                        }`}
                      >
                        {isPrimary
                          ? <CircleDot className="w-4 h-4" />
                          : isLoaded
                          ? <Circle className="w-4 h-4" />
                          : <Lock className="w-4 h-4" />
                        }
                      </button>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className={`text-xs font-bold font-mono ${isLoaded ? 'text-slate-100' : 'text-slate-500'}`}>
                            {modelId}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${hw.badgeColor}`}>
                            {hw.badge}
                          </span>
                          {isPrimary && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              ✓ Đang dùng (Primary)
                            </span>
                          )}
                          {isSecondary && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              ✓ Ensemble
                            </span>
                          )}
                        </div>

                        <p className={`text-[10px] leading-snug ${isLoaded ? 'text-slate-400' : 'text-slate-600'}`}>
                          {hw.note}
                        </p>

                        {/* Specs */}
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
                          <span className={`text-[10px] flex items-center gap-1 ${isLoaded ? 'text-slate-500' : 'text-slate-700'}`}>
                            <MemoryStick className="w-2.5 h-2.5" />{hw.ramBadge}
                          </span>
                          <span className={`text-[10px] flex items-center gap-1 ${isLoaded ? 'text-slate-500' : 'text-slate-700'}`}>
                            <Cpu className="w-2.5 h-2.5" />{hw.minSpec}
                          </span>
                          <span className={`text-[10px] ${isLoaded ? 'text-slate-500' : 'text-slate-700'}`}>{hw.speed}</span>
                          <span className={`text-[10px] ${isLoaded ? 'text-slate-500' : 'text-slate-700'}`}>{hw.accuracy}</span>
                        </div>
                      </div>

                      {/* Right: status + download */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {/* Status label */}
                        <span className={`flex items-center gap-1 text-[10px] font-semibold ${
                          isLoaded    ? 'text-emerald-400'
                          : hasError  ? 'text-red-400'
                          : 'text-slate-600'
                        }`}>
                          {isLoaded   ? <><CheckCircle2 className="w-3 h-3" />Sẵn sàng</>
                          : hasError  ? <><AlertTriangle className="w-3 h-3" />Lỗi tải</>
                          :             <>Chưa tải</>}
                        </span>

                        {/* Download button */}
                        <button
                          type="button"
                          onClick={() => !isLoaded && !isDownloading && handleDownload(modelId)}
                          disabled={isLoaded || isDownloading}
                          title={isLoaded ? 'Đã tải sẵn sàng' : 'Tải model về máy'}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                            isLoaded
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 cursor-default'
                              : isDownloading
                              ? 'bg-slate-800 text-slate-400 border-slate-700 cursor-wait'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-cyan-500/10 hover:text-cyan-300 hover:border-cyan-500/40'
                          }`}
                        >
                          {isDownloading ? (
                            <><div className="w-2.5 h-2.5 border-2 border-slate-500/30 border-t-slate-300 rounded-full animate-spin" />Đang tải...</>
                          ) : isLoaded ? (
                            <><CheckCircle2 className="w-2.5 h-2.5" />Đã tải</>
                          ) : (
                            <><Download className="w-2.5 h-2.5" />Tải về</>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Ensemble row — chỉ hiện khi model đã tải VÀ có primary khác */}
                    {canBeSecondary && (
                      <div className="px-3 pb-2.5 flex items-center gap-2 border-t border-slate-800/50 pt-2">
                        <button
                          type="button"
                          onClick={() => toggleSecondary(modelId)}
                          className={`flex items-center gap-1.5 text-[10px] font-semibold transition-colors ${
                            isSecondary
                              ? 'text-purple-400 hover:text-purple-300'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {isSecondary
                            ? <><MinusCircle className="w-3.5 h-3.5" />Bỏ ensemble</>
                            : <><PlusCircle  className="w-3.5 h-3.5" />Thêm làm Ensemble (model phụ)</>
                          }
                        </button>
                        {isSecondary && (
                          <span className="text-[9px] text-slate-500 ml-1">
                            Score = 60%&nbsp;{visionPrimaryModel}&nbsp;+&nbsp;40%&nbsp;{modelId}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-slate-500 mt-3 leading-relaxed">
              💡 Model cache tại{' '}
              <span className="font-mono text-slate-400">~/.cache/huggingface/</span> —
              chỉ tải lần đầu. Không cần tải trước, hệ thống tự tải khi bắt đầu tìm kiếm.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
