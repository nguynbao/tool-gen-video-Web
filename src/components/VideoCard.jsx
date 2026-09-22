import React, { useState } from 'react';
import { ExternalLink, Download, Copy, Check, Eye, Brain, BarChart3, Video as VideoIcon, Play } from 'lucide-react';
import { downloadVideo } from '../services/api';

export default function VideoCard({ video, isSelected = false, onToggleSelect }) {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Trích xuất username tác giả từ TikTok URL nếu có
  const getTikTokAuthor = (url) => {
    try {
      const match = url.match(/tiktok\.com\/@([a-zA-Z0-9_.-]+)/i);
      if (match && match[1]) {
        return `@${match[1]}`;
      }
    } catch {}
    return null;
  };

  const authorHandle = getTikTokAuthor(video.video_url);

  // Lấy thumbnail từ video URL (nếu có)
  const getThumbnail = (url) => {
    try {
      const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (ytMatch) {
        return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
      }
    } catch {}
    return null;
  };

  const thumbnail = getThumbnail(video.video_url);

  // Confidence score color
  const getScoreColor = (score) => {
    if (score >= 0.7) return { text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40' };
    if (score >= 0.4) return { text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40' };
    return { text: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/40' };
  };

  const scoreStyle = getScoreColor(video.confidence_score);
  const scorePercent = Math.round(video.confidence_score * 100);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(video.video_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const data = await downloadVideo(video.video_url);
      if (data.success && data.filename) {
        setDownloadSuccess(true);
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
        window.open(`${apiBase}/api/downloads/${encodeURIComponent(data.filename)}`, '_blank');
        setTimeout(() => setDownloadSuccess(false), 4000);
      } else {
        alert(data.error || 'Không thể tải video này về');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối khi tải video');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className={`group bg-slate-900 border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col relative ${
        isSelected
          ? 'border-cyan-400 ring-2 ring-cyan-500/50 shadow-xl shadow-cyan-500/20 bg-slate-900/95'
          : 'border-slate-800/90 hover:border-cyan-500/40 hover:shadow-lg'
      }`}
    >
      {/* Thumbnail / TikTok Preview Container (Tỉ lệ chuẩn 9:16) */}
      <div className="relative aspect-[9/16] w-full bg-slate-950 overflow-hidden select-none">
        {!imageError && thumbnail ? (
          <img
            src={thumbnail}
            alt={video.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          /* TikTok Stylized Card Backdrop */
          <div className="w-full h-full flex flex-col items-center justify-between p-4 text-center bg-gradient-to-b from-slate-900 via-slate-950 to-black relative">
            {/* Background Glow */}
            <div className="absolute top-1/4 -left-10 w-28 h-28 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-1/4 -right-10 w-28 h-28 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />

            {/* Author Handle Header */}
            <div className="pt-8 w-full z-10">
              {authorHandle ? (
                <span className="inline-block px-2.5 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-[11px] font-bold text-cyan-300 shadow-sm truncate max-w-[90%]">
                  {authorHandle}
                </span>
              ) : (
                <span className="inline-block px-2 py-0.5 rounded-full bg-slate-800/80 text-[10px] font-medium text-slate-400">
                  TikTok Video
                </span>
              )}
            </div>

            {/* Center Play Icon & Pulse */}
            <div className="relative my-auto z-10 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-rose-500 p-[2px] shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                </div>
              </div>
            </div>

            {/* Title Snippet */}
            <div className="pb-8 w-full z-10">
              <p className="text-[11px] text-slate-300 font-medium line-clamp-3 leading-relaxed px-1">
                {video.title}
              </p>
            </div>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

        {/* Checkbox Select Overlay (Top Left) */}
        {onToggleSelect && (
          <div className="absolute top-2.5 left-2.5 z-20">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(video);
              }}
              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all border shadow-lg ${
                isSelected
                  ? 'bg-cyan-500 border-cyan-300 text-slate-950 scale-110'
                  : 'bg-black/60 border-slate-600 text-transparent hover:border-cyan-400 hover:scale-105 backdrop-blur-md'
              }`}
              title={isSelected ? 'Bỏ chọn video này' : 'Chọn video này để tạo Sheet'}
            >
              <Check className={`w-3.5 h-3.5 ${isSelected ? 'stroke-[3]' : 'opacity-0'}`} />
            </button>
          </div>
        )}

        {/* AI Confidence Score Badge */}
        <div className="absolute top-2.5 left-10 z-10">
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md border shadow-md ${scoreStyle.bg} ${scoreStyle.text} ${scoreStyle.border}`}>
            <Brain className="w-2.5 h-2.5" />
            {scorePercent}%
          </span>
        </div>

        {/* Platform Badge & Reference Badge */}
        <div className="absolute top-2.5 right-2.5 z-10 flex flex-col items-end gap-1">
          {video.is_reference && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-[9px] px-2 py-0.5 rounded-md shadow-md border border-amber-300 flex items-center gap-1">
              ⭐ Video Mẫu
            </span>
          )}
          <div className="bg-slate-900/90 text-cyan-300 backdrop-blur-md text-[10px] font-bold px-2 py-0.5 rounded-md border border-cyan-500/40 shadow-sm flex items-center gap-1">
            <span>🎵 TikTok</span>
          </div>
        </div>

        {/* Overlay hover action: Quick Open */}
        <a
          href={video.video_url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300"
        >
          <span className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-rose-500 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-full shadow-xl hover:scale-105 transition-transform">
            <ExternalLink className="w-3.5 h-3.5" />
            Xem Trên TikTok
          </span>
        </a>

        {/* Score bar at bottom */}
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <div className="flex items-center gap-2 bg-black/70 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-slate-800">
            <BarChart3 className="w-3 h-3 text-cyan-400 shrink-0" />
            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  scorePercent >= 70 ? 'bg-cyan-400' : scorePercent >= 40 ? 'bg-amber-400' : 'bg-rose-400'
                }`}
                style={{ width: `${scorePercent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-300 font-mono font-medium">{video.confidence_score.toFixed(3)}</span>
          </div>
        </div>
      </div>

      {/* Info & Actions */}
      <div className="p-3.5 flex flex-col flex-1 justify-between bg-slate-900/90">
        <h3 className="text-xs font-semibold text-slate-200 line-clamp-2 leading-relaxed mb-3 group-hover:text-cyan-300 transition-colors" title={video.title}>
          {video.title}
        </h3>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
          <a
            href={video.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 hover:border-cyan-500/50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mở TikTok</span>
          </a>

          <button
            onClick={handleDownload}
            disabled={downloading}
            title="Tải video này về máy"
            className={`flex items-center justify-center p-2 rounded-xl text-xs font-medium border transition-colors ${
              downloadSuccess
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-300 border-cyan-500/30 hover:border-cyan-500/50'
            }`}
          >
            {downloading ? (
              <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
            ) : downloadSuccess ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={handleCopyLink}
            title="Sao chép liên kết TikTok"
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-400 hover:text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
