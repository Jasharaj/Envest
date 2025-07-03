const API_KEY = 'pub_50399fe8e22241caa1ef2776a36dbef2';
const BASE_URL = 'https://newsdata.io/api/1/news';

// Cache to store API responses
const newsCache: Record<string, { data: NewsResponse; timestamp: number }> = {};
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes cache duration

export interface NewsArticle {
  article_id: string;
  title: string;
  link: string;
  description: string | null;
  pubDate: string;
  image_url: string | null;
  source_name: string;
  category: string[];
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  results: NewsArticle[];
  nextPage?: string;
}

const makeApiCall = async (params: URLSearchParams): Promise<NewsResponse> => {
  const url = `${BASE_URL}?${params.toString()}`;
  
  // Check cache first
  const cacheKey = params.toString();
  const cached = newsCache[cacheKey];
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the response
    newsCache[cacheKey] = {
      data,
      timestamp: Date.now()
    };
    
    return data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

export const fetchNews = async (page?: string): Promise<NewsResponse> => {
  const params = new URLSearchParams({
    apikey: API_KEY,
    country: 'in',
    category: 'business',
    ...(page && { page })
  });
  
  return makeApiCall(params);
};

export const fetchNewsForStocks = async (stockSymbols: string[]): Promise<{ [key: string]: NewsResponse }> => {
  try {
    // Fetch news for each stock in parallel
    const newsPromises = stockSymbols.map(async (symbol) => {
      const params = new URLSearchParams({
        apikey: API_KEY,
        q: symbol,
        country: 'in',
        category: 'business',
        language: 'en'
      });
      
      try {
        const data = await makeApiCall(params);
        return { symbol, data };
      } catch (error) {
        console.error(`Error fetching news for ${symbol}:`, error);
        return { symbol, data: { status: 'error', results: [], totalResults: 0 } };
      }
    });
    
    const results = await Promise.all(newsPromises);
    
    // Convert array of results to object with symbols as keys
    return results.reduce((acc, { symbol, data }) => {
      acc[symbol] = data;
      return acc;
    }, {} as { [key: string]: NewsResponse });
    
  } catch (error) {
    console.error('Error in fetchNewsForStocks:', error);
    return {};
  }
};
