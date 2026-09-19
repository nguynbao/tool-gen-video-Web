import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
 
 /**
  * Tự động trích xuất mã ASIN (10 ký tự) từ đường dẫn sản phẩm Amazon
  */
export function extractAsinFromUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const clean = url.trim();
  const patterns = [
    /(?:\/dp\/|\/gp\/product\/|\/gp\/aw\/d\/|\/product\/|\/ASIN\/|\/o\/ASIN\/|\/d\/)([A-Za-z0-9]{10})(?:[/?&#]|$)/i,
    /[?&](?:asin|ASIN)=([A-Za-z0-9]{10})(?:[&#]|$)/i,
    /\/([A-Za-z0-9]{10})(?:[/?&#]|$)/,
  ];
  for (const regex of patterns) {
    const match = clean.match(regex);
    if (match && match[1]) {
      const code = match[1].toUpperCase();
      // ASIN Amazon chuẩn thường có 10 ký tự (bắt đầu bằng B hoặc số đối với sách)
      if (/^[B0-9][A-Z0-9]{9}$/.test(code)) {
        return code;
      }
    }
  }
  return '';
}

/**
 * Gọi API tìm kiếm video sản phẩm bằng AI (Hỗ trợ Google Gemini & Local AI).
 */
export async function searchVideos({
  videoUrls,
  productUrl,
  productName,
  asin,
  brand,
  category,
  maxResults,
  aiProvider = 'gemini',
  geminiApiKey = '',
  geminiModel = 'gemini-3.6-flash',
}) {
  const validUrls = videoUrls.filter((u) => u && u.trim());
  const res = await axios.post(
    `${API_BASE}/api/v1/product-video-retrieval`,
    {
      video_urls: validUrls,
      product_url: (productUrl || '').trim(),
      product_name: productName.trim(),
      asin: (asin || '').trim(),
      brand: (brand || '').trim(),
      category: (category || '').trim(),
      max_results: Number(maxResults),
      ai_provider: aiProvider || 'gemini',
      gemini_api_key: (geminiApiKey || '').trim(),
      gemini_model: geminiModel || 'gemini-3.6-flash',
    },
    { timeout: 600000 } // 10 phút timeout cho AI pipeline
  );
  return res.data;
}

/**
 * Kiểm tra kết nối server backend.
 */
export async function checkHealth() {
  const res = await axios.get(`${API_BASE}/api/health`, { timeout: 3000 });
  return res.data;
}

/**
 * Lấy danh sách AI models.
 */
export async function getAiModels() {
  const res = await axios.get(`${API_BASE}/api/v1/ai/models`, { timeout: 5000 });
  return res.data;
}

/**
 * Tải video về máy qua backend.
 */
export async function downloadVideo(url) {
  const res = await axios.post(`${API_BASE}/api/download`, { url });
  return res.data;
}

/**
 * Bọc link sản phẩm qua Geniuslink API
 */
export async function shortenAffiliateLink({ url, apiKey, apiSecret, groupId }) {
  const res = await axios.post(`${API_BASE}/api/v1/affiliate/shorten`, {
    url,
    api_key: apiKey,
    api_secret: apiSecret,
    group_id: groupId,
  });
  return res.data;
}

/**
 * Sinh nội dung (caption/hook/review) bằng AI (Google Gemini Ultra/Pro/Flash hoặc Hugging Face Local)
 */
export async function generateSocialCaptions({
  productName,
  brand,
  category,
  count = 5,
  aiProvider = 'gemini',
  geminiApiKey = '',
  geminiModel = 'gemini-3.6-flash',
}) {
  const res = await axios.post(
    `${API_BASE}/api/v1/content/generate`,
    {
      product_name: productName,
      brand: brand || '',
      category: category || '',
      count: Number(count) || 5,
      ai_provider: aiProvider || 'gemini',
      gemini_api_key: (geminiApiKey || '').trim(),
      gemini_model: geminiModel || 'gemini-3.6-flash',
    },
    { timeout: 45000 }
  );
  return res.data;
}
