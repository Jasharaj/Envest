'use client';

import { useState, useEffect } from 'react';
import { 
  fetchPortfolio, 
  addStockToPortfolio, 
  removeStockFromPortfolio, 
  searchStocks,
  Stock,
  Portfolio as PortfolioType
} from '@/services/portfolioService';
import dynamic from 'next/dynamic';

// Import PortfolioNews with SSR disabled to avoid window undefined errors
const PortfolioNews = dynamic(
  () => import('@/components/PortfolioNews'),
  { ssr: false }
);

interface SearchResult {
  symbol: string;
  name: string;
  sector?: string;
}

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [selectedStock, setSelectedStock] = useState<SearchResult | null>(null);
  const [quantity, setQuantity] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'holdings'>('overview');

  // Load portfolio data
  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        setLoading(true);
        const data = await fetchPortfolio();
        setPortfolio(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load portfolio:', err);
        setError('Failed to load portfolio. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
  }, []);

  // Get unique stock symbols for news
  const stockSymbols = portfolio?.stocks.map(stock => stock.symbol) || [];

  // Handle search input
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const search = async () => {
      const results = await searchStocks(searchQuery);
      setSearchResults(results);
    };

    const timerId = setTimeout(search, 300);
    return () => clearTimeout(timerId);
  }, [searchQuery]);

  const handleStockSelect = (stock: SearchResult) => {
    setSelectedStock(stock);
    setSearchQuery('');
    setSearchResults([]);
    setShowAddForm(true);
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock || !quantity) return;

    try {
      setIsAdding(true);
      const qty = parseInt(quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        setError('Please enter a valid quantity');
        return;
      }

      const response = await addStockToPortfolio(selectedStock.symbol, qty);
      if (response.success) {
        // Refresh portfolio
        const updatedPortfolio = await fetchPortfolio();
        setPortfolio(updatedPortfolio);
        setShowAddForm(false);
        setSelectedStock(null);
        setQuantity('');
        setError(null);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Failed to add stock:', err);
      setError('Failed to add stock. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveStock = async (symbol: string) => {
    if (window.confirm('Are you sure you want to remove this stock from your portfolio?')) {
      try {
        const response = await removeStockFromPortfolio(symbol);
        if (response.success) {
          // Refresh portfolio
          const updatedPortfolio = await fetchPortfolio();
          setPortfolio(updatedPortfolio);
        } else {
          setError(response.message);
        }
      } catch (err) {
        console.error('Failed to remove stock:', err);
        setError('Failed to remove stock. Please try again.');
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  };

  if (loading && !portfolio) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm font-medium text-red-700 hover:text-red-900"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Portfolio Summary */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(portfolio.totalValue)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Total Gain/Loss</p>
              <div className="flex items-center">
                <p className={`text-2xl font-bold ${portfolio.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(portfolio.totalGain)}
                </p>
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${portfolio.totalGainPercent >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {portfolio.totalGainPercent >= 0 ? '↑' : '↓'} {Math.abs(portfolio.totalGainPercent).toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Total Holdings</p>
              <p className="text-2xl font-bold text-gray-900">{portfolio.stocks.length}</p>
            </div>
          </div>
          
          {/* Portfolio News Section */}
          {portfolio.stocks.length > 0 && (
            <div className="mt-8">
              <PortfolioNews stockSymbols={stockSymbols} />
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Actions */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'overview' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('holdings')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'holdings' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
          >
            My Holdings
          </button>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Stock
        </button>
      </div>

      {/* Add Stock Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add Stock to Portfolio</h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedStock(null);
                  setSearchQuery('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddStock}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="stock-search" className="block text-sm font-medium text-gray-700 mb-1">
                    Search Stock
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="stock-search"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                      placeholder="Search by symbol or company name"
                      value={selectedStock ? `${selectedStock.name} (${selectedStock.symbol})` : searchQuery}
                      onChange={(e) => {
                        if (!selectedStock) {
                          setSearchQuery(e.target.value);
                        }
                      }}
                      onFocus={() => setSearchResults(searchResults.length ? searchResults : [])}
                      required
                    />
                    {searchResults.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
                        {searchResults.map((result) => (
                          <div
                            key={result.symbol}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleStockSelect(result)}
                          >
                            <div className="font-medium text-gray-900">{result.name}</div>
                            <div className="text-sm text-gray-500">{result.symbol} • {result.sector}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {selectedStock && (
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                      placeholder="Enter quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => {
                    setShowAddForm(false);
                    setSelectedStock(null);
                    setSearchQuery('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!selectedStock || !quantity || isAdding}
                >
                  {isAdding ? 'Adding...' : 'Add to Portfolio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Holdings Table */}
      {activeTab === 'holdings' && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg. Cost
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Market Value
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gain/Loss
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {portfolio.stocks.map((stock) => (
                  <tr key={stock.symbol} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">{stock.symbol[0]}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{stock.symbol}</div>
                          <div className="text-sm text-gray-500">{stock.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {stock.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(stock.avgPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(stock.currentPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(stock.quantity * stock.currentPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className={`${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <div>{formatCurrency((stock.currentPrice - stock.avgPrice) * stock.quantity)}</div>
                        <div className="text-xs">
                          {stock.change >= 0 ? '↑' : '↓'} {Math.abs(stock.changePercent).toFixed(2)}%
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleRemoveStock(stock.symbol)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sector Allocation */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sector Allocation</h3>
            <div className="space-y-4">
              {Object.entries(
                portfolio.stocks.reduce((acc, stock) => {
                  const sector = stock.sector || 'Other';
                  acc[sector] = (acc[sector] || 0) + (stock.quantity * stock.currentPrice);
                  return acc;
                }, {} as Record<string, number>)
              )
                .sort(([, a], [, b]) => b - a)
                .map(([sector, value]) => {
                  const percentage = (value / portfolio.totalValue) * 100;
                  return (
                    <div key={sector} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{sector}</span>
                        <span className="text-gray-500">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performers</h3>
            <div className="space-y-4">
              {[...portfolio.stocks]
                .sort((a, b) => (b.currentPrice - b.avgPrice) / b.avgPrice - (a.currentPrice - a.avgPrice) / a.avgPrice)
                .slice(0, 3)
                .map((stock) => {
                  const gain = ((stock.currentPrice - stock.avgPrice) / stock.avgPrice) * 100;
                  return (
                    <div key={stock.symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">{stock.symbol[0]}</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{stock.symbol}</p>
                          <p className="text-xs text-gray-500">{stock.name}</p>
                        </div>
                      </div>
                      <div className={`text-right ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <p className="text-sm font-medium">{gain >= 0 ? '+' : ''}{gain.toFixed(2)}%</p>
                        <p className="text-xs">{formatCurrency(stock.currentPrice - stock.avgPrice)}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
