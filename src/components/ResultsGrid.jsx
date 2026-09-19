import React from 'react';
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
  Sparkles
} from 'lucide-react';
import VideoCard from './VideoCard';

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
}) {
  const isAllSelected = results.length > 0 && selectedVideos.length === results.length;
  const refCount = results.filter((v) => v.is_reference).length;
  const discoveredCount = results.length - refCount;

  // Lấy link sản phẩm hiển thị
  const displayProductUrl = productUrl || (asin ? `https://www.amazon.com/dp/${asin}` : '');

  return (
    <div className="space-y-6">
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

      {/* ── Thanh Điều Khiển Chọn Video ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Video className="w-4 h-4 text-purple-400" />
            Danh Sách Video Đã So Khớp
          </h3>
          <span className="text-xs text-slate-500">
            (Bảo toàn toàn bộ {refCount} video đầu vào + sắp xếp theo AI Confidence Score)
          </span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Nút chọn tất cả / bỏ chọn */}
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

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
            <Brain className="w-3.5 h-3.5" />
            <span>AI Ranked</span>
          </div>
        </div>
      </div>

      {/* Video Cards Grid (Chuẩn tỉ lệ dọc 9:16) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {results.map((video, index) => {
          const isSelected = selectedVideos.some((v) => v.video_url === video.video_url);
          return (
            <VideoCard
              key={`${video.video_url}-${index}`}
              video={video}
              isSelected={isSelected}
              onToggleSelect={onToggleSelect}
            />
          );
        })}
      </div>
    </div>
  );
}
