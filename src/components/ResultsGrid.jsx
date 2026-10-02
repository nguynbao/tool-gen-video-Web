import React, { useState, useMemo } from 'react';
import {
  Video,
  Brain,
  CheckSquare,
  Square,
  ExternalLink,
  Tag,
  Building2,
  FolderOpen,
  Link as LinkIcon,
  Sparkles,
  ArrowDownWideNarrow,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  TrendingUp,
  Music2,
} from 'lucide-react';
import VideoCard from './VideoCard';

const SORT_OPTIONS = [
  { key: 'confidence', label: 'AI Score', icon: Brain, color: 'text-purple-400' },
  { key: 'views', label: 'Views', icon: Eye, color: 'text-slate-300' },
  { key: 'likes', label: 'Likes', icon: Heart, color: 'text-rose-400' },
  { key: 'comments', label: 'Comments', icon: MessageCircle, color: 'text-sky-400' },
  { key: 'shares', label: 'Shares', icon: Share2, color: 'text-emerald-400' },
  { key: 'date', label: 'Mới nhất', icon: Calendar, color: 'text-amber-400' },
];

export default function ResultsGrid({
  results = [],
  totalFound = 0,
  productName = '',
  productUrl = '',
  asin = '',
  brand = '',
  category = '',
  selectedVideos = [],
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  viralAudioInfo = null,
}) {
  const [sortBy, setSortBy] = useState('confidence');

  const isAllSelected = results.length > 0 && selectedVideos.length === results.length;
  const refCount = results.filter((v) => v.is_reference).length;
  const discoveredCount = results.length - refCount;

  // Lấy link sản phẩm hiển thị
  const displayProductUrl = productUrl || (asin ? `https://www.amazon.com/dp/${asin}` : '');

  // Sắp xếp kết quả theo tiêu chí
  const sortedResults = useMemo(() => {
    // Tách video mẫu (luôn ở đầu) và video tìm thêm
    const refs = results.filter((v) => v.is_reference);
    const others = results.filter((v) => !v.is_reference);

    const sorted = [...others].sort((a, b) => {
      switch (sortBy) {
        case 'views':
          return (b.view_count || 0) - (a.view_count || 0);
        case 'likes':
          return (b.like_count || 0) - (a.like_count || 0);
        case 'comments':
          return (b.comment_count || 0) - (a.comment_count || 0);
        case 'shares':
          return (b.share_count || 0) - (a.share_count || 0);
        case 'date':
          return (b.upload_date || '').localeCompare(a.upload_date || '');
        case 'confidence':
        default:
          return (b.confidence_score || 0) - (a.confidence_score || 0);
      }
    });

    return [...refs, ...sorted];
  }, [results, sortBy]);

  return (
    <div className="space-y-6">
      {/* ── Viral Audio Info Banner (hiện khi có dữ liệu âm thanh viral) ── */}
      {viralAudioInfo && viralAudioInfo.music_id && (
        <div className="bg-gradient-to-br from-fuchsia-950/70 to-pink-950/50 border border-fuchsia-500/30 rounded-2xl p-4 shadow-xl flex items-center gap-4">
          {/* Cover nhạc */}
          {viralAudioInfo.music_cover_url ? (
            <img
              src={viralAudioInfo.music_cover_url}
              alt="music cover"
              className="w-14 h-14 rounded-xl object-cover border border-fuchsia-500/30 shrink-0 shadow-md"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center shrink-0">
              <Music2 className="w-6 h-6 text-fuchsia-400" />
            </div>
          )}

          {/* Thông tin nhạc */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-[10px] font-bold text-fuchsia-300 bg-fuchsia-500/15 px-2 py-0.5 rounded-full border border-fuchsia-500/30 flex items-center gap-1">
                <Music2 className="w-2.5 h-2.5" />
                Âm thanh viral được phát hiện
              </span>
            </div>
            <p className="text-sm font-bold text-white truncate">
              {viralAudioInfo.music_title || 'original sound'}
            </p>
            <p className="text-xs text-fuchsia-300/80">
              {viralAudioInfo.music_author ? `by ${viralAudioInfo.music_author}` : ''}
              {viralAudioInfo.music_duration ? ` · ${viralAudioInfo.music_duration}s` : ''}
            </p>
          </div>

          {/* Stats */}
          <div className="shrink-0 text-right">
            <p className="text-[10px] text-slate-400">Video cùng nhạc</p>
            <p className="text-lg font-bold text-fuchsia-300">
              {results.filter(v => v.source_type === 'same_audio').length}
            </p>
          </div>
        </div>
      )}

      {/* ── Banner Thông Tin Sản Phẩm & Link Gốc ── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Cột trái: Tên sản phẩm & Link */}
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-300" />
                Sản Phẩm Đang Phân Tích
              </span>

              {brand && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {brand}
                </span>
              )}

              {asin && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  ASIN: {asin}
                </span>
              )}

              {category && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                  <FolderOpen className="w-3 h-3" />
                  {category}
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-lg font-bold text-slate-100 truncate" title={productName}>
              {productName}
            </h2>

            {/* Link Sản Phẩm Gốc Hiển Thị Rõ Ràng */}
            {displayProductUrl ? (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-xs font-mono text-emerald-400 max-w-full truncate">
                  <LinkIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{displayProductUrl}</span>
                </div>

                <a
                  href={displayProductUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold border border-emerald-500/40 transition-all hover:scale-105"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mở Trang Sản Phẩm Gốc</span>
                </a>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                (Chưa nhập link sản phẩm gốc. Bạn có thể nhập ở bước trên để tự động bọc link geni.us)
              </p>
            )}
          </div>

          {/* Cột phải: Thống kê video */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-5">
            <div className="text-right">
              <span className="text-2xl font-black text-slate-100">{results.length}</span>
              <span className="text-xs text-slate-400 block font-medium">Video Khả Dụng</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              {refCount > 0 && (
                <span className="text-amber-400 font-semibold">{refCount} video mẫu</span>
              )}
              {refCount > 0 && discoveredCount > 0 && <span>+</span>}
              {discoveredCount > 0 && (
                <span className="text-purple-400 font-semibold">{discoveredCount} video tìm thêm</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Thanh Điều Khiển: Sort + Select ── */}
      <div className="flex flex-col gap-3 pb-2">
        {/* Row 1: Sort */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-300">
            <ArrowDownWideNarrow className="w-4 h-4 text-cyan-400" />
            <span className="text-xs">Sắp xếp:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {SORT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isActive = sortBy === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSortBy(opt.key)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                      : 'bg-slate-800/70 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-3 h-3 ${isActive ? opt.color : 'text-slate-500'}`} />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Select controls */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Video className="w-4 h-4 text-purple-400" />
              Danh Sách Video
            </h3>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {results.length > 0 && (
              <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 text-xs">
                <button
                  type="button"
                  onClick={isAllSelected ? onDeselectAll : onSelectAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-slate-750 font-medium transition-colors"
                >
                  {isAllSelected ? (
                    <>
                      <CheckSquare className="w-3.5 h-3.5 text-purple-400" />
                      <span>Bỏ chọn hết</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5 text-slate-400" />
                      <span>Chọn tất cả ({results.length})</span>
                    </>
                  )}
                </button>

                <span className="text-slate-500 font-bold px-1.5">|</span>

                <span className="text-[11px] font-semibold text-purple-300 px-2 py-0.5">
                  Đã chọn: <b className="text-white">{selectedVideos.length}</b>/{results.length}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── SECTION 1: Video Sản Phẩm (AI Match + Reference) ── */}
      {(() => {
        const aiVideos = sortedResults.filter(v => v.source_type !== 'same_audio');
        if (aiVideos.length === 0) return null;
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                🎯 Video Sản Phẩm Liên Quan
                <span className="bg-cyan-500/20 text-cyan-200 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                  {aiVideos.length}
                </span>
              </span>
              <div className="flex-1 h-px bg-cyan-500/15" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {aiVideos.map((video, index) => {
                const isSelected = selectedVideos.some((v) => v.video_url === video.video_url);
                return (
                  <VideoCard
                    key={`ai-${video.video_url}-${index}`}
                    video={video}
                    isSelected={isSelected}
                    onToggleSelect={onToggleSelect}
                  />
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── SECTION 2: Video Cùng Âm Thanh Viral ── */}
      {(() => {
        const audioVideos = results.filter(v => v.source_type === 'same_audio');
        if (audioVideos.length === 0) return null;
        return (
          <div className="space-y-3">
            {/* Divider với label */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-fuchsia-300 bg-fuchsia-500/10 border border-fuchsia-500/25 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                <Music2 className="w-3 h-3 text-fuchsia-400" />
                Video Cùng Âm Thanh Viral
                <span className="bg-fuchsia-500/20 text-fuchsia-200 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                  {audioVideos.length}
                </span>
              </span>
              <div className="flex-1 h-px bg-fuchsia-500/15" />
            </div>
            {viralAudioInfo && (
              <p className="text-[10px] text-slate-500 pl-0.5">
                Nhạc: <span className="text-fuchsia-400 font-semibold">{viralAudioInfo.music_title}</span>
                {viralAudioInfo.music_author && <span> by {viralAudioInfo.music_author}</span>}
                {' '}— Các video đang dùng cùng âm thanh với video mẫu
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {audioVideos.map((video, index) => {
                const isSelected = selectedVideos.some((v) => v.video_url === video.video_url);
                return (
                  <VideoCard
                    key={`audio-${video.video_url}-${index}`}
                    video={video}
                    isSelected={isSelected}
                    onToggleSelect={onToggleSelect}
                  />
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
