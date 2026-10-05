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
  Music2,
} from 'lucide-react';
import VideoCard from './VideoCard';

const SORT_OPTIONS = [
  { key: 'confidence', label: 'AI Score', icon: Brain, color: 'text-purple-400' },
  { key: 'views',      label: 'Views',    icon: Eye,     color: 'text-slate-300' },
  { key: 'likes',      label: 'Likes',    icon: Heart,   color: 'text-rose-400' },
  { key: 'comments',   label: 'Comments', icon: MessageCircle, color: 'text-sky-400' },
  { key: 'shares',     label: 'Shares',   icon: Share2,  color: 'text-emerald-400' },
  { key: 'date',       label: 'Mới nhất', icon: Calendar, color: 'text-amber-400' },
];

function sortItems(items, sortBy) {
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case 'views':    return (b.view_count    || 0) - (a.view_count    || 0);
      case 'likes':    return (b.like_count    || 0) - (a.like_count    || 0);
      case 'comments': return (b.comment_count || 0) - (a.comment_count || 0);
      case 'shares':   return (b.share_count   || 0) - (a.share_count   || 0);
      case 'date':     return (b.upload_date   || '').localeCompare(a.upload_date || '');
      default:         return (b.confidence_score || 0) - (a.confidence_score || 0);
    }
  });
}

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
  const [activeTab, setActiveTab] = useState('ai'); // 'ai' | 'audio'

  // Phân chia video theo loại
  const refVideos   = useMemo(() => results.filter(v => v.is_reference),                              [results]);
  const aiVideos    = useMemo(() => results.filter(v => !v.is_reference && v.source_type !== 'same_audio'), [results]);
  const audioVideos = useMemo(() => results.filter(v => v.source_type === 'same_audio'),               [results]);
  const hasAudio    = audioVideos.length > 0;

  // Sorted lists
  const sortedAi    = useMemo(() => [...refVideos, ...sortItems(aiVideos, sortBy)],    [refVideos, aiVideos, sortBy]);
  const sortedAudio = useMemo(() => sortItems(audioVideos, sortBy),                    [audioVideos, sortBy]);
  const activeList  = activeTab === 'audio' ? sortedAudio : sortedAi;

  const isAllSelected = results.length > 0 && selectedVideos.length === results.length;
  const displayProductUrl = productUrl || (asin ? `https://www.amazon.com/dp/${asin}` : '');

  return (
    <div className="space-y-4">

      {/* ── Banner sản phẩm (compact) ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          {/* Tags row */}
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="text-[10px] font-bold text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-500/25 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> AI Match
            </span>
            {brand && (
              <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <Building2 className="w-2.5 h-2.5" /> {brand}
              </span>
            )}
            {asin && (
              <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" /> {asin}
              </span>
            )}
            {category && (
              <span className="text-[10px] font-semibold text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 flex items-center gap-1">
                <FolderOpen className="w-2.5 h-2.5" /> {category}
              </span>
            )}
          </div>
          {/* Product name */}
          <p className="text-sm font-bold text-slate-100 truncate" title={productName}>{productName}</p>
        </div>

        {/* Link + stats */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {displayProductUrl && (
            <a
              href={displayProductUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 transition-all"
            >
              <ExternalLink className="w-3 h-3" />
              Trang Sản Phẩm
            </a>
          )}
          <div className="text-right border-l border-slate-700 pl-3">
            <span className="text-xl font-black text-slate-100">{results.length}</span>
            <span className="text-[10px] text-slate-400 block">Video</span>
          </div>
        </div>
      </div>

      {/* ── Toolbar: Tabs + Sort + Select (1 row) ── */}
      <div className="flex items-center gap-2 flex-wrap">

        {/* Tabs */}
        <div className="flex items-center bg-slate-800/80 border border-slate-700/60 rounded-xl p-1 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
              activeTab === 'ai'
                ? 'bg-cyan-500/20 text-cyan-200 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🎯 Sản Phẩm
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${
              activeTab === 'ai' ? 'bg-cyan-500/30 text-cyan-200' : 'bg-slate-700 text-slate-400'
            }`}>
              {sortedAi.length}
            </span>
          </button>

          {hasAudio && (
            <button
              type="button"
              onClick={() => setActiveTab('audio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                activeTab === 'audio'
                  ? 'bg-fuchsia-500/20 text-fuchsia-200 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Music2 className="w-3 h-3" />
              Same Audio
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${
                activeTab === 'audio' ? 'bg-fuchsia-500/30 text-fuchsia-200' : 'bg-slate-700 text-slate-400'
              }`}>
                {audioVideos.length}
              </span>
            </button>
          )}
        </div>

        {/* Separator */}
        <div className="w-px h-5 bg-slate-700 hidden sm:block" />

        {/* Sort */}
        <div className="flex items-center gap-1 flex-wrap">
          <ArrowDownWideNarrow className="w-3.5 h-3.5 text-slate-500" />
          {SORT_OPTIONS.map(opt => {
            const Icon = opt.icon;
            const isActive = sortBy === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSortBy(opt.key)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                  isActive
                    ? 'bg-slate-700 text-slate-100 border-slate-600'
                    : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-2.5 h-2.5 ${isActive ? opt.color : ''}`} />
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Push right: Select controls */}
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={isAllSelected ? onDeselectAll : onSelectAll}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
          >
            {isAllSelected
              ? <><CheckSquare className="w-3 h-3 text-purple-400" /> Bỏ chọn</>
              : <><Square className="w-3 h-3 text-slate-500" /> Chọn tất cả</>
            }
          </button>
          {selectedVideos.length > 0 && (
            <span className="text-[11px] text-purple-300 font-semibold bg-purple-500/10 px-2 py-1 rounded-lg border border-purple-500/20">
              ✓ {selectedVideos.length}
            </span>
          )}
        </div>
      </div>

      {/* ── Audio tab: music info strip ── */}
      {activeTab === 'audio' && viralAudioInfo && (
        <div className="flex items-center gap-3 bg-fuchsia-950/40 border border-fuchsia-500/20 rounded-xl px-3 py-2">
          {viralAudioInfo.music_cover_url && (
            <img
              src={viralAudioInfo.music_cover_url}
              alt="cover"
              className="w-8 h-8 rounded-lg object-cover shrink-0 border border-fuchsia-500/30"
              onError={e => { e.target.style.display = 'none'; }}
            />
          )}
          <Music2 className={`w-4 h-4 text-fuchsia-400 shrink-0 ${viralAudioInfo.music_cover_url ? 'hidden' : ''}`} />
          <div className="min-w-0">
            <p className="text-xs font-bold text-fuchsia-200 truncate">
              {viralAudioInfo.music_title || 'Original Sound'}
            </p>
            <p className="text-[10px] text-slate-400">
              {viralAudioInfo.music_author && `by ${viralAudioInfo.music_author}`}
              {viralAudioInfo.music_duration && ` · ${viralAudioInfo.music_duration}s`}
              {' · '}Các video đang dùng cùng âm thanh này
            </p>
          </div>
        </div>
      )}

      {/* ── Video Grid ── */}
      {activeList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {activeList.map((video, index) => {
            const isSelected = selectedVideos.some(v => v.video_url === video.video_url);
            return (
              <VideoCard
                key={`${activeTab}-${video.video_url}-${index}`}
                video={video}
                isSelected={isSelected}
                onToggleSelect={onToggleSelect}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Music2 className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">Không có video nào trong mục này</p>
        </div>
      )}

    </div>
  );
}
