import React from 'react';

export default function HeroSection() {
  return (
    <div className="text-center max-w-2xl mx-auto mb-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight mb-3">
        Tìm Video Sản Phẩm TikTok <br />
        <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-rose-400 bg-clip-text text-transparent">
          Bằng AI Đa Phương Thức
        </span>
      </h1>
      <p className="text-sm text-slate-400 leading-relaxed">
        Dán link video mẫu + tên sản phẩm Amazon. AI sẽ tự động: quét chỉ mục đa kênh →
        trích xuất keyframes → chấm điểm bằng Text NLP + Computer Vision → xếp hạng
        và trả về <b className="text-cyan-300">100% video TikTok</b> tương tự chuẩn xác nhất.
      </p>

      {/* Pipeline badges */}
      <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
        {[
          { icon: '🎵', label: '100% TikTok Links' },
          { icon: '🔍', label: 'Multi-Engine Index' },
          { icon: '🖼️', label: 'OpenCV Keyframes' },
          { icon: '🧠', label: 'MiniLM Text AI' },
          { icon: '👁️', label: 'SigLIP Vision AI' },
        ].map((step) => (
          <span
            key={step.label}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60 shadow-sm"
          >
            {step.icon} {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}
