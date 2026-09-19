import React, { useState, useEffect, useCallback } from 'react';

// Services
import { searchVideos, checkHealth } from './services/api';

// Components
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import SearchForm from './components/SearchForm';
import LoadingOverlay, { LOADING_STAGES } from './components/LoadingOverlay';
import ErrorAlert from './components/ErrorAlert';
import ResultsGrid from './components/ResultsGrid';
import SheetGenerator from './components/SheetGenerator';
import EmptyState from './components/EmptyState';

export default function App() {
  // ── Form State ──
  const [videoUrls, setVideoUrls] = useState(['']);
  const [productUrl, setProductUrl] = useState('');
  const [productName, setProductName] = useState('');
  const [asin, setAsin] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [maxResults, setMaxResults] = useState(10);

  // ── AI Model Provider State (Google Gemini Ultra/Pro & Local) ──
  const [aiProvider, setAiProvider] = useState('gemini'); // 'gemini' | 'local'
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-3.6-flash');

  // ── Vision Model State (Computer Vision Scoring) ──
  const [visionMode, setVisionMode] = useState('balanced');
  const [visionPrimaryModel, setVisionPrimaryModel] = useState(null);
  const [visionSecondaryModel, setVisionSecondaryModel] = useState(null);

  // ── UI State ──
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [loadingTimer, setLoadingTimer] = useState(0);
  const [error, setError] = useState(null);

  // ── Results State ──
  const [results, setResults] = useState([]);
  const [totalFound, setTotalFound] = useState(0);
  const [selectedVideos, setSelectedVideos] = useState([]);

  // ── Server Status ──
  const [serverStatus, setServerStatus] = useState('checking');
  const [serverDevice, setServerDevice] = useState('');

  // ── Server Health Check ──
  const checkServerConnection = useCallback(async () => {
    setServerStatus('checking');
    try {
      const data = await checkHealth();
      if (data?.status === 'ok') {
        setServerStatus('connected');
        setServerDevice(data.device || '');
      } else {
        setServerStatus('disconnected');
      }
    } catch {
      setServerStatus('disconnected');
    }
  }, []);

  useEffect(() => {
    checkServerConnection();
    const interval = setInterval(checkServerConnection, 15000);
    return () => clearInterval(interval);
  }, [checkServerConnection]);

  // ── Loading Timer + Stage Animation ──
  useEffect(() => {
    if (!loading) return;
    setLoadingTimer(0);
    const interval = setInterval(() => setLoadingTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (!loading) return;
    const stage = [...LOADING_STAGES].reverse().find((s) => loadingTimer >= s.time);
    if (stage) setLoadingStage(stage.text);
  }, [loadingTimer, loading]);

  // ── Selection Handlers ──
  const handleToggleSelect = (video) => {
    setSelectedVideos((prev) => {
      const exists = prev.some((v) => v.video_url === video.video_url);
      if (exists) {
        return prev.filter((v) => v.video_url !== video.video_url);
      } else {
        return [...prev, video];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedVideos(results);
  };

  const handleDeselectAll = () => {
    setSelectedVideos([]);
  };

  // ── Search Handler ──
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!productName.trim() || !videoUrls.some((u) => u && u.trim())) return;

    setError(null);
    setLoading(true);
    setResults([]);
    setSelectedVideos([]);
    setTotalFound(0);

    try {
      const data = await searchVideos({
        videoUrls,
        productUrl,
        productName,
        asin,
        brand,
        category,
        maxResults,
        aiProvider,
        geminiApiKey,
        geminiModel,
        visionMode,
        visionPrimaryModel,
        visionSecondaryModel,
      });

      if (data.status === 'success') {
        const found = data.results || [];
        setResults(found);
        
        // Cập nhật mã ASIN nếu server tự động bóc tách được
        if (data.asin && (!asin || asin !== data.asin)) {
          setAsin(data.asin);
        }

        // Mặc định chọn tất cả video mẫu đầu vào (hoặc ít nhất Top 1)
        const initialSelected = found.filter(v => v.is_reference);
        if (initialSelected.length > 0) {
          setSelectedVideos(initialSelected);
        } else if (found.length > 0) {
          setSelectedVideos([found[0]]);
        }

        setTotalFound(data.total_found || 0);

        if (data.total_found === 0) {
          setError('AI không tìm được video nào phù hợp. Thử thay đổi tên sản phẩm hoặc video mẫu.');
        }
      } else {
        setError('Phản hồi từ server không hợp lệ.');
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'ECONNABORTED') {
        setError('Quá thời gian chờ (timeout). Pipeline AI cần nhiều thời gian hơn dự kiến.');
      } else {
        setError(
          err.response?.data?.detail ||
          'Không thể kết nối đến Backend. Hãy chắc chắn Backend đang chạy trên cổng 8000!'
        );
      }
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  };

  // ── Render ──
  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col font-sans">
      <Header
        serverStatus={serverStatus}
        serverDevice={serverDevice}
        onRetryConnection={checkServerConnection}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HeroSection />

        <div className="max-w-4xl mx-auto mb-10">
          <SearchForm
            videoUrls={videoUrls}
            setVideoUrls={setVideoUrls}
            productUrl={productUrl}
            setProductUrl={setProductUrl}
            productName={productName}
            setProductName={setProductName}
            asin={asin}
            setAsin={setAsin}
            brand={brand}
            setBrand={setBrand}
            category={category}
            setCategory={setCategory}
            maxResults={maxResults}
            setMaxResults={setMaxResults}
            aiProvider={aiProvider}
            setAiProvider={setAiProvider}
            geminiApiKey={geminiApiKey}
            setGeminiApiKey={setGeminiApiKey}
            geminiModel={geminiModel}
            setGeminiModel={setGeminiModel}
            visionMode={visionMode}
            setVisionMode={setVisionMode}
            visionPrimaryModel={visionPrimaryModel}
            setVisionPrimaryModel={setVisionPrimaryModel}
            visionSecondaryModel={visionSecondaryModel}
            setVisionSecondaryModel={setVisionSecondaryModel}
            loading={loading}
            onSubmit={handleSearch}
          />
        </div>

        {loading && (
          <LoadingOverlay loadingStage={loadingStage} loadingTimer={loadingTimer} />
        )}

        <ErrorAlert message={error} />

        {!loading && results.length > 0 && (
          <div className="space-y-8">
            {/* Grid kết quả video + Banner hiển thị Link Sản Phẩm */}
            <ResultsGrid
              results={results}
              totalFound={totalFound}
              productName={productName}
              productUrl={productUrl}
              asin={asin}
              brand={brand}
              category={category}
              selectedVideos={selectedVideos}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
            />

            {/* Bảng cấu hình & Xem trước Google Sheets */}
            <SheetGenerator
              selectedVideos={selectedVideos}
              productUrl={productUrl}
              productName={productName}
              asin={asin}
              brand={brand}
              category={category}
              aiProvider={aiProvider}
              geminiApiKey={geminiApiKey}
              geminiModel={geminiModel}
            />
          </div>
        )}

        {!loading && results.length === 0 && !error && <EmptyState />}
      </main>

      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500 bg-slate-950/40">
        <p>Shorts Hunter v3.0 · AI-Powered Video Retrieval with Google Gemini Ultra/Pro + Hugging Face</p>
      </footer>
    </div>
  );
}
