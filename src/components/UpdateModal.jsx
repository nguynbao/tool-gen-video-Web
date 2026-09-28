import React, { useState } from 'react';
import { Sparkles, Download, CheckCircle, AlertCircle, X, RefreshCw, ExternalLink, ArrowRight } from 'lucide-react';
import { applyInAppUpdate } from '../services/api';

export default function UpdateModal({ isOpen, onClose, updateInfo, onUpdateSuccess }) {
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'downloading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  if (!isOpen || !updateInfo) return null;

  const handleApplyUpdate = async () => {
    setUpdating(true);
    setStatus('downloading');
    setMessage('Đang tải và cập nhật các gói mới nhất từ GitHub...');

    try {
      const res = await applyInAppUpdate();
      if (res.status === 'success') {
        setStatus('success');
        setMessage(res.message || 'Cập nhật thành công!');
        if (onUpdateSuccess) onUpdateSuccess();
      } else if (res.status === 'already_latest') {
        setStatus('success');
        setMessage(res.message);
      } else {
        setStatus('error');
        setMessage(res.message || 'Có lỗi xảy ra khi cập nhật.');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage(err.response?.data?.detail || 'Không thể kết nối đến máy chủ cập nhật.');
    } finally {
      setUpdating(false);
    }
  };

  const handleReloadApp = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-purple-950/40 overflow-hidden text-slate-100">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-slate-900 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {updateInfo.has_update ? 'Bản Cập Nhật Mới Có Sẵn' : 'Thông Tin Phiên Bản'}
              </h3>
              <p className="text-xs text-slate-400">
                Phiên bản hiện tại: <span className="text-slate-300 font-mono">v{updateInfo.current_version}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={updating}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {/* Version Badge Comparison */}
          {updateInfo.has_update ? (
            <div className="flex items-center justify-between bg-slate-800/60 border border-purple-500/30 rounded-xl p-3.5">
              <div className="text-center flex-1">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">Đang dùng</span>
                <span className="text-sm font-bold text-slate-300 font-mono">v{updateInfo.current_version}</span>
              </div>
              <div className="px-2 text-purple-400">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div className="text-center flex-1">
                <span className="text-[11px] text-emerald-400 uppercase font-bold block">Bản mới nhất</span>
                <span className="text-sm font-extrabold text-emerald-300 font-mono">v{updateInfo.latest_version}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 text-emerald-300 text-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>Bạn đang sử dụng phiên bản mới nhất (v{updateInfo.current_version}).</span>
            </div>
          )}

          {/* Release Notes */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Nội dung cập nhật:
            </h4>
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed max-h-40 overflow-y-auto font-sans">
              {updateInfo.release_notes || 'Cải tiến hiệu năng và cập nhật các tính năng AI mới.'}
            </div>
          </div>

          {/* Status Message */}
          {status !== 'idle' && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                status === 'downloading'
                  ? 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-300'
                  : status === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}
            >
              {status === 'downloading' && <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" />}
              {status === 'success' && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
              {status === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              <span>{message}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950/80 px-6 py-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
          {updateInfo.download_url && (
            <a
              href={updateInfo.download_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <span>Xem trên GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {status === 'success' ? (
              <button
                onClick={handleReloadApp}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Khởi Động Lại Ứng Dụng</span>
              </button>
            ) : updateInfo.has_update ? (
              <button
                onClick={handleApplyUpdate}
                disabled={updating}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {updating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang Cập Nhật...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Cập Nhật Ngay (1-Click)</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Đóng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
