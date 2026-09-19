import React from 'react';
import { Clock, Zap } from 'lucide-react';

/**
 * Loading stages cho AI pipeline.
 */
export const LOADING_STAGES = [
  { time: 0, text: '🔍 Đang tìm kiếm video ứng viên trên YouTube...' },
  { time: 8, text: '📥 Đang tải video mẫu và trích xuất keyframes...' },
  { time: 20, text: '🤖 Đang tải mô hình AI (lần đầu sẽ lâu hơn)...' },
  { time: 40, text: '🧠 Đang chấm điểm Text Similarity (NLP)...' },
  { time: 55, text: '👁️ Đang chấm điểm Vision Similarity (Computer Vision)...' },
  { time: 90, text: '📊 Đang xếp hạng và chọn video tốt nhất...' },
  { time: 150, text: '⏳ Vẫn đang xử lý, AI cần thêm thời gian...' },
];

/**
 * Format seconds → "Xs" hoặc "M:SS"
 */
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
}

export default function LoadingOverlay({ loadingStage, loadingTimer }) {
  return (
    <div className="max-w-lg mx-auto my-12 text-center p-8 bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-md">
      <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-5" />
      <h3 className="text-base font-bold text-slate-100 mb-2">AI Pipeline Đang Xử Lý</h3>
      <p className="text-sm text-purple-300 animate-pulse mb-4">{loadingStage}</p>

      <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          Đã chạy: {formatTime(loadingTimer)}
        </span>
        <span className="flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Lần đầu cần ~2-5 phút tải model
        </span>
      </div>
    </div>
  );
}
