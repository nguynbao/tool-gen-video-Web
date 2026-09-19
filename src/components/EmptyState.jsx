import React from 'react';
import { Sparkles } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="max-w-xl mx-auto my-8 text-center border border-dashed border-slate-800/80 rounded-2xl p-8 bg-slate-900/30">
      <div className="w-12 h-12 rounded-full bg-slate-800/80 text-purple-400 flex items-center justify-center mx-auto mb-3">
        <Sparkles className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-200 mb-1">
        Chưa có kết quả nào
      </h3>
      <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto mb-4">
        Dán link video sản phẩm mẫu và nhập tên sản phẩm để AI bắt đầu tìm kiếm và chấm điểm video phù hợp.
      </p>
      <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500">
        <span>📌 Cần cả Video URL + Tên SP</span>
        <span>·</span>
        <span>⏱️ Mỗi lần chạy ~1-5 phút</span>
        <span>·</span>
        <span>🆓 100% miễn phí</span>
      </div>
    </div>
  );
}
