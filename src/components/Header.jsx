import React from 'react';
import { Film, Wifi, WifiOff, RefreshCw, Brain, Sparkles, ArrowUpCircle } from 'lucide-react';

export default function Header({
  serverStatus,
  serverDevice,
  onRetryConnection,
  appVersion = '3.0.0',
  hasUpdate = false,
  onOpenUpdateModal,
}) {
  return (
    <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-300 bg-clip-text text-transparent">
              Shorts Hunter
            </span>
            <button
              onClick={onOpenUpdateModal}
              title="Click để kiểm tra cập nhật"
              className="text-[10px] uppercase font-bold tracking-widest text-purple-400 hover:text-purple-300 flex items-center gap-1 -mt-1 transition-colors group cursor-pointer"
            >
              <span>AI-Powered · v{appVersion}</span>
              {hasUpdate && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
              )}
            </button>
          </div>
        </div>

        {/* Right Side Badges */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Nút Cập Nhật Nhanh nếu có bản mới */}
          {hasUpdate ? (
            <button
              onClick={onOpenUpdateModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10 transition-all cursor-pointer animate-pulse"
            >
              <ArrowUpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Có Bản Mới</span>
            </button>
          ) : (
            <button
              onClick={onOpenUpdateModal}
              title="Kiểm tra phiên bản mới"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Cập nhật</span>
            </button>
          )}

          {serverStatus === 'connected' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Wifi className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {serverDevice ? `${serverDevice.toUpperCase()} · ` : ''}Đã kết nối
              </span>
            </div>
          )}
          {serverStatus === 'disconnected' && (
            <button
              onClick={onRetryConnection}
              title="Bấm để thử kết nối lại"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span>Chưa kết nối</span>
              <RefreshCw className="w-3 h-3 ml-1" />
            </button>
          )}
          {serverStatus === 'checking' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Đang kiểm tra...</span>
            </div>
          )}

          <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
            <Brain className="w-3.5 h-3.5" />
            AI Vision + NLP
          </div>
        </div>
      </div>
    </header>
  );
}
