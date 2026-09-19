import React from 'react';

export default function HeroSection() {
  return (
    <div className="text-center max-w-2xl mx-auto mb-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight mb-3">
        Tìm Video Sản Phẩm <br />
        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
          Bằng AI Đa Phương Thức
        </span>
      </h1>
      <p className="text-sm text-slate-400 leading-relaxed">
        Dán link video mẫu + tên sản phẩm Amazon. AI sẽ tự động: tìm ứng viên trên YouTube →
        trích xuất keyframes → chấm điểm bằng Text NLP + Computer Vision → xếp hạng
        và trả về video phù hợp nhất.
      </p>

      {/* Pipeline badges */}
      <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
        {[
          { icon: '🔍', label: 'yt-dlp Search' },
          { icon: '🖼️', label: 'OpenCV Keyframes' },
          { icon: '🧠', label: 'MiniLM Text' },
          { icon: '👁️', label: 'SigLIP Vision' },
        ].map((step) => (
          <span
            key={step.label}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700/60"
          >
            {step.icon} {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}
