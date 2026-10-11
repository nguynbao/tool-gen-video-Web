import React, { useState, useEffect } from 'react';
import {
  Flame,
  Globe,
  TrendingUp,
  Tag,
  Sparkles,
  ExternalLink,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ShoppingBag,
  Star,
  Zap,
  Award,
} from 'lucide-react';
import { getAmazonTrendOptions, getAmazonTrendingProducts } from '../services/api';

const DEFAULT_MARKETPLACES = [
  { code: 'US', name: 'Hoa Kỳ (US)', flag: '🇺🇸', domain: 'amazon.com' },
  { code: 'UK', name: 'Vương Quốc Anh (UK)', flag: '🇬🇧', domain: 'amazon.co.uk' },
  { code: 'CA', name: 'Canada (CA)', flag: '🇨🇦', domain: 'amazon.ca' },
  { code: 'DE', name: 'Đức (DE)', flag: '🇩🇪', domain: 'amazon.de' },
  { code: 'FR', name: 'Pháp (FR)', flag: '🇫🇷', domain: 'amazon.fr' },
  { code: 'JP', name: 'Nhật Bản (JP)', flag: '🇯🇵', domain: 'amazon.co.jp' },
  { code: 'AU', name: 'Úc (AU)', flag: '🇦🇺', domain: 'amazon.com.au' },
  { code: 'IT', name: 'Ý (IT)', flag: '🇮🇹', domain: 'amazon.it' },
  { code: 'ES', name: 'Tây Ban Nha (ES)', flag: '🇪🇸', domain: 'amazon.es' },
];

const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'Tất cả ngành hàng hot (Top Chung)', icon: '🔥' },
  { id: 'beauty', name: 'Làm đẹp & Chăm sóc da (Beauty)', icon: '💄' },
  { id: 'home-garden', name: 'Nhà cửa & Đời sống (Home)', icon: '🏠' },
  { id: 'kitchen', name: 'Nhà bếp & Nấu nướng (Kitchen)', icon: '🍳' },
  { id: 'electronics', name: 'Công nghệ & Điện tử (Gadgets)', icon: '📱' },
  { id: 'toys-and-games', name: 'Đồ chơi & Trẻ em (Toys)', icon: '🎮' },
  { id: 'pet-supplies', name: 'Thú cưng (Pet Supplies)', icon: '🐾' },
  { id: 'sporting-goods', name: 'Thể thao & Dã ngoại (Sports)', icon: '⚡' },
  { id: 'fashion', name: 'Thời trang & Phụ kiện (Fashion)', icon: '👗' },
  { id: 'hpc', name: 'Sức khỏe & Gia dụng (Health/HPC)', icon: '🌿' },
  { id: 'appliances', name: 'Gia dụng thông minh (Appliances)', icon: '🔌' },
  { id: 'baby-products', name: 'Mẹ & Bé (Baby)', icon: '🍼' },
];

const DEFAULT_RANK_TYPES = [
  { id: 'bestsellers', name: 'Top Bán Chạy Nhất (Best Sellers)', icon: '🏆' },
  { id: 'new-releases', name: 'Hàng Mới Hot Nhất (New Releases)', icon: '✨' },
  { id: 'movers-and-shakers', name: 'Đột Biến Doanh Số 24h (Movers & Shakers)', icon: '🚀' },
];

export default function AmazonTrendFinder({ onSelectProduct, geminiApiKey = '' }) {
  const [isOpen, setIsOpen] = useState(true);
  const [marketplaces, setMarketplaces] = useState(DEFAULT_MARKETPLACES);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [rankTypes, setRankTypes] = useState(DEFAULT_RANK_TYPES);

  const [selectedCountry, setSelectedCountry] = useState('US');
  const [selectedCategory, setSelectedCategory] = useState('beauty');
  const [selectedRankType, setSelectedRankType] = useState('bestsellers');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAsin, setSelectedAsin] = useState(null);

  // Tải danh sách options từ backend khi khởi động
  useEffect(() => {
    let isMounted = true;
    getAmazonTrendOptions()
      .then((data) => {
        if (!isMounted) return;
        if (data?.marketplaces?.length) setMarketplaces(data.marketplaces);
        if (data?.categories?.length) setCategories(data.categories);
        if (data?.rank_types?.length) setRankTypes(data.rank_types);
      })
      .catch(() => {
        // Sử dụng default nếu offline hoặc lỗi mạng
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Hàm quét sản phẩm trending
  const handleFetchTrends = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAmazonTrendingProducts({
        country: selectedCountry,
        category: selectedCategory,
        rankType: selectedRankType,
        limit: 20,
        geminiApiKey,
      });

      if (res && res.products && res.products.length > 0) {
        setProducts(res.products);
      } else {
        setProducts([]);
        setError(res?.message || 'Không tìm thấy sản phẩm nào trong danh mục này. Vui lòng thử lại hoặc chọn danh mục khác.');
      }
    } catch (err) {
      console.error('Lỗi quét sản phẩm Amazon:', err);
      setError('Không thể kết nối đến Amazon. Vui lòng kiểm tra lại đường truyền hoặc thử lại sau vài giây.');
    } finally {
      setLoading(false);
    }
  };

  // Tự động quét 1 lần khi người dùng mở lần đầu
  useEffect(() => {
    handleFetchTrends();
  }, []);

  // Xử lý khi người dùng chọn 1 sản phẩm
  const handlePickProduct = (item) => {
    setSelectedAsin(item.asin);
    if (onSelectProduct) {
      onSelectProduct({
        productName: item.clean_title || item.title,
        productUrl: item.url,
        asin: item.asin,
        brand: '',
        category: item.category_name || item.category,
      });
    }

    // Reset trạng thái highlight sau 3 giây
    setTimeout(() => {
      setSelectedAsin(null);
    }, 3000);
  };

  return (
    <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md relative overflow-hidden transition-all duration-300">
      {/* Background glow effect */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar with toggle */}
      <div className="flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 text-white">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                Khám phá Sản phẩm Hot & Bán Chạy Amazon
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Auto-Detect
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Tự động quét sản phẩm theo Quốc gia & tự điền Link + Tên sản phẩm chỉ với 1 click!
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1 text-xs"
          title={isOpen ? 'Thu gọn' : 'Mở rộng'}
        >
          {isOpen ? (
            <>
              <span className="hidden sm:inline">Thu gọn</span>
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Khám phá</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Main Body */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-800 relative z-10 space-y-4">
          {/* Controls: Country + Rank Type + Category + Scan Button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Quốc gia / Thị trường */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                Thị trường (Quốc gia):
              </label>
              <div className="relative">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full h-10 bg-slate-800 border border-slate-700 rounded-xl px-3 pr-8 text-xs text-slate-100 font-medium focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all cursor-pointer appearance-none"
                >
                  {marketplaces.map((m) => (
                    <option key={m.code} value={m.code}>
                      {m.flag} {m.name} ({m.domain})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* 2. Tiêu chí xếp hạng */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
                Tiêu chí Hot:
              </label>
              <div className="relative">
                <select
                  value={selectedRankType}
                  onChange={(e) => setSelectedRankType(e.target.value)}
                  className="w-full h-10 bg-slate-800 border border-slate-700 rounded-xl px-3 pr-8 text-xs text-slate-100 font-medium focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all cursor-pointer appearance-none"
                >
                  {rankTypes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.icon} {r.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* 3. Ngành hàng */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                Ngành hàng:
              </label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-10 bg-slate-800 border border-slate-700 rounded-xl px-3 pr-8 text-xs text-slate-100 font-medium focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all cursor-pointer appearance-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* 4. Nút bấm Quét Trends */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleFetchTrends}
                disabled={loading}
                className="w-full h-10 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang quét Amazon...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Quét Sản Phẩm Hot</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Feedback & Error */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <span className="font-semibold">Lưu ý:</span> {error}
            </div>
          )}

          {/* Products List Carousel / Grid */}
          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
              <p className="text-xs font-medium animate-pulse">
                Đang cào dữ liệu thời gian thực từ Amazon {selectedCountry} ({selectedCategory})...
              </p>
            </div>
          ) : products.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>
                  🔥 Đang hiển thị <strong className="text-amber-400">{products.length}</strong> sản phẩm bán chạy nhất:
                </span>
                <span className="text-[11px] text-slate-500 italic">
                  *Click "Chọn sản phẩm" để tự động điền Tên & Link Amazon
                </span>
              </div>

              {/* Horizontal Scroll List */}
              <div className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900 snap-x">
                {products.map((item, idx) => {
                  const isChosen = selectedAsin === item.asin;
                  const isTop3 = idx < 3;

                  return (
                    <div
                      key={item.asin || idx}
                      className={`flex-shrink-0 w-56 sm:w-64 bg-slate-800/90 border rounded-xl p-3 flex flex-col justify-between transition-all duration-200 snap-start relative group ${
                        isChosen
                          ? 'border-emerald-500 ring-2 ring-emerald-500/50 shadow-emerald-500/20'
                          : 'border-slate-700/80 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10'
                      }`}
                    >
                      {/* Rank Badge */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            idx === 0
                              ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/40'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-900 font-bold'
                              : idx === 2
                              ? 'bg-amber-700/80 text-amber-100 font-bold'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {isTop3 && <Award className="w-3 h-3" />}
                          {item.rank || `#${idx + 1}`}
                        </span>

                        {item.price && (
                          <span className="text-xs font-bold text-emerald-400 font-mono">
                            {item.price}
                          </span>
                        )}
                      </div>

                      {/* Image Thumbnail */}
                      <div className="w-full h-32 bg-slate-900/60 rounded-lg flex items-center justify-center p-2 mb-2 overflow-hidden relative">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <ShoppingBag className="w-10 h-10 text-slate-600" />
                        )}

                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-1.5 right-1.5 p-1 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Xem trên Amazon"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {/* Product Title */}
                      <div className="flex-1 mb-2">
                        <h4
                          className="text-xs font-medium text-slate-200 line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors"
                          title={item.title}
                        >
                          {item.clean_title || item.title}
                        </h4>

                        {/* Rating */}
                        {item.rating && (
                          <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span>{item.rating.split(' ')[0]}</span>
                            {item.reviews_count && (
                              <span className="text-slate-500">({item.reviews_count})</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Button: Auto Fill */}
                      <button
                        type="button"
                        onClick={() => handlePickProduct(item)}
                        className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          isChosen
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                            : 'bg-slate-700/80 hover:bg-amber-500 text-slate-200 hover:text-slate-950 active:scale-[0.98]'
                        }`}
                      >
                        {isChosen ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>Đã Điền Vào Form!</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5 text-amber-400 group-hover:text-slate-950 transition-colors" />
                            <span>Chọn Sản Phẩm Này</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
