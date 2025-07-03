export interface Stock {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  change: number;
  changePercent: number;
  sector?: string;
}

export interface Portfolio {
  stocks: Stock[];
  totalValue: number;
  totalGain: number;
  totalGainPercent: number;
}

// Mock data for popular Indian stocks across various sectors
const MOCK_STOCKS: Omit<Stock, 'quantity' | 'avgPrice'>[] = [
  // Large Cap
  { 
    symbol: 'RELIANCE', 
    name: 'Reliance Industries', 
    currentPrice: 2750.50, 
    change: 25.75, 
    changePercent: 0.95,
    sector: 'Oil & Gas'
  },
  { 
    symbol: 'TCS', 
    name: 'Tata Consultancy Services', 
    currentPrice: 3456.25, 
    change: -32.10, 
    changePercent: -0.92,
    sector: 'IT'
  },
  { 
    symbol: 'HDFCBANK', 
    name: 'HDFC Bank', 
    currentPrice: 1450.75, 
    change: 15.25, 
    changePercent: 1.06,
    sector: 'Banking'
  },
  { 
    symbol: 'INFY', 
    name: 'Infosys', 
    currentPrice: 1520.40, 
    change: 8.90, 
    changePercent: 0.59,
    sector: 'IT'
  },
  { 
    symbol: 'HINDUNILVR', 
    name: 'Hindustan Unilever', 
    currentPrice: 2350.20, 
    change: -12.30, 
    changePercent: -0.52,
    sector: 'FMCG'
  },
  { 
    symbol: 'ICICIBANK', 
    name: 'ICICI Bank', 
    currentPrice: 890.60, 
    change: 5.40, 
    changePercent: 0.61,
    sector: 'Banking'
  },
  { 
    symbol: 'BHARTIARTL', 
    name: 'Bharti Airtel', 
    currentPrice: 1025.30, 
    change: 18.90, 
    changePercent: 1.88,
    sector: 'Telecom'
  },
  { 
    symbol: 'ITC', 
    name: 'ITC Limited', 
    currentPrice: 420.75, 
    change: 3.25, 
    changePercent: 0.78,
    sector: 'FMCG'
  },
  {
    symbol: 'SBIN',
    name: 'State Bank of India',
    currentPrice: 580.25,
    change: 7.80,
    changePercent: 1.36,
    sector: 'Banking'
  },
  {
    symbol: 'HDFC',
    name: 'HDFC Limited',
    currentPrice: 2650.80,
    change: 32.45,
    changePercent: 1.24,
    sector: 'Finance'
  },
  
  // Mid Cap
  {
    symbol: 'ADANIPORTS',
    name: 'Adani Ports',
    currentPrice: 745.60,
    change: -8.90,
    changePercent: -1.18,
    sector: 'Infrastructure'
  },
  {
    symbol: 'BAJFINANCE',
    name: 'Bajaj Finance',
    currentPrice: 6850.75,
    change: 125.50,
    changePercent: 1.87,
    sector: 'Finance'
  },
  {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors',
    currentPrice: 450.30,
    change: 5.20,
    changePercent: 1.17,
    sector: 'Automobile'
  },
  {
    symbol: 'SUNPHARMA',
    name: 'Sun Pharmaceutical',
    currentPrice: 980.45,
    change: -12.30,
    changePercent: -1.24,
    sector: 'Pharma'
  },
  {
    symbol: 'TITAN',
    name: 'Titan Company',
    currentPrice: 2450.60,
    change: 45.80,
    changePercent: 1.90,
    sector: 'Consumer Goods'
  },
  
  // Small Cap & Others
  {
    symbol: 'IRCTC',
    name: 'Indian Railway Catering',
    currentPrice: 680.25,
    change: 15.40,
    changePercent: 2.32,
    sector: 'Travel'
  },
  {
    symbol: 'NAUKRI',
    name: 'Info Edge',
    currentPrice: 4250.80,
    change: -75.60,
    changePercent: -1.75,
    sector: 'Internet'
  },
  {
    symbol: 'AUBANK',
    name: 'AU Small Finance Bank',
    currentPrice: 1250.40,
    change: 32.80,
    changePercent: 2.70,
    sector: 'Banking'
  },
  {
    symbol: 'DIVISLAB',
    name: 'Divi\'s Laboratories',
    currentPrice: 3850.75,
    change: -42.30,
    changePercent: -1.09,
    sector: 'Pharma'
  },
  {
    symbol: 'PAGEIND',
    name: 'Page Industries',
    currentPrice: 32500.80,
    change: 450.60,
    changePercent: 1.41,
    sector: 'Textiles'
  },
  
  // New Age & Tech
  {
    symbol: 'ZOMATO',
    name: 'Zomato Limited',
    currentPrice: 85.40,
    change: 2.10,
    changePercent: 2.52,
    sector: 'Internet'
  },
  {
    symbol: 'PAYTM',
    name: 'One 97 Communications',
    currentPrice: 650.25,
    change: -8.75,
    changePercent: -1.33,
    sector: 'Fintech'
  },
  {
    symbol: 'NAZARA',
    name: 'Nazara Technologies',
    currentPrice: 580.60,
    change: 12.40,
    changePercent: 2.18,
    sector: 'Gaming'
  },
  {
    symbol: 'TATAPOWER',
    name: 'Tata Power',
    currentPrice: 230.45,
    change: 3.20,
    changePercent: 1.41,
    sector: 'Power'
  },
  {
    symbol: 'ADANIENT',
    name: 'Adani Enterprises',
    currentPrice: 1850.75,
    change: -22.40,
    changePercent: -1.20,
    sector: 'Conglomerate'
  }
];

// Generate a random portfolio with 3-6 random stocks
const generateMockPortfolio = (): Portfolio => {
  const numStocks = Math.floor(Math.random() * 4) + 3; // 3-6 stocks
  const shuffled = [...MOCK_STOCKS].sort(() => 0.5 - Math.random());
  const selectedStocks = shuffled.slice(0, numStocks).map(stock => ({
    ...stock,
    quantity: Math.floor(Math.random() * 50) + 5, // 5-55 shares
    avgPrice: stock.currentPrice * (0.9 + Math.random() * 0.2) // Random price within ±10% of current
  }));

  const stocksWithValues = selectedStocks.map(stock => ({
    ...stock,
    investment: stock.quantity * stock.avgPrice,
    currentValue: stock.quantity * stock.currentPrice,
    gain: (stock.currentPrice - stock.avgPrice) * stock.quantity,
    gainPercent: ((stock.currentPrice - stock.avgPrice) / stock.avgPrice) * 100
  }));

  const totalValue = stocksWithValues.reduce((sum, stock) => sum + (stock.quantity * stock.currentPrice), 0);
  const totalInvestment = stocksWithValues.reduce((sum, stock) => sum + (stock.quantity * stock.avgPrice), 0);
  const totalGain = totalValue - totalInvestment;
  const totalGainPercent = (totalGain / totalInvestment) * 100;

  return {
    stocks: stocksWithValues,
    totalValue,
    totalGain,
    totalGainPercent
  };
};

// Simulate API call to get portfolio
export const fetchPortfolio = async (): Promise<Portfolio> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // In a real app, this would be an API call
  return generateMockPortfolio();
};

// Add a stock to portfolio (mock implementation)
export const addStockToPortfolio = async (symbol: string, quantity: number): Promise<{ success: boolean; message: string }> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const stock = MOCK_STOCKS.find(s => s.symbol === symbol);
  if (!stock) {
    return { success: false, message: 'Stock not found' };
  }
  
  // In a real app, this would update the backend
  return { 
    success: true, 
    message: `${quantity} shares of ${stock.name} added to your portfolio` 
  };
};

// Remove a stock from portfolio (mock implementation)
export const removeStockFromPortfolio = async (symbol: string): Promise<{ success: boolean; message: string }> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const stock = MOCK_STOCKS.find(s => s.symbol === symbol);
  if (!stock) {
    return { success: false, message: 'Stock not found' };
  }
  
  // In a real app, this would update the backend
  return { 
    success: true, 
    message: `${stock.name} removed from your portfolio` 
  };
};

// Get all available stocks (for search/autocomplete)
export const searchStocks = async (query: string): Promise<Array<{ symbol: string; name: string; sector?: string }>> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (!query) return [];
  
  const lowerQuery = query.toLowerCase();
  return MOCK_STOCKS
    .filter(stock => 
      stock.symbol.toLowerCase().includes(lowerQuery) || 
      stock.name.toLowerCase().includes(lowerQuery) ||
      stock.sector?.toLowerCase().includes(lowerQuery)
    )
    .map(({ symbol, name, sector }) => ({ symbol, name, sector }));
};
