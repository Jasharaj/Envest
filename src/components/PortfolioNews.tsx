'use client';

import { useState, useEffect } from 'react';
import { fetchNewsForStocks } from '@/services/newsService';
import { analyzeNewsSentiment } from '@/services/cohereService';
import { format } from 'date-fns';

export interface PortfolioNewsProps {
  stockSymbols: string[];
}

interface SentimentResult {
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  confidence: number;
  summary?: string;
  error?: string;
}

interface NewsArticle {
  article_id: string;
  title: string;
  link: string;
  description: string | null;
  pubDate: string;
  image_url: string | null;
  source_name: string;
  category: string[];
}

export default function PortfolioNews({ stockSymbols }: PortfolioNewsProps) {
  const [newsByStock, setNewsByStock] = useState<{ [key: string]: NewsArticle[] }>({});
  const [sentiments, setSentiments] = useState<{ [key: string]: SentimentResult }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const loadNews = async () => {
      if (stockSymbols.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const newsData = await fetchNewsForStocks(stockSymbols);
        
        // Filter out stocks with no news and map to the expected format
        const filteredNews: { [key: string]: NewsArticle[] } = {};
        
        Object.entries(newsData).forEach(([symbol, response]) => {
          if (response.status === 'success' && response.results && response.results.length > 0) {
            filteredNews[symbol] = response.results;
          }
        });
        
        setNewsByStock(filteredNews);
        
        // Set the first stock with news as active tab, or first stock if none have news
        const firstStockWithNews = Object.keys(filteredNews)[0] || (stockSymbols[0] || null);
        setActiveTab(firstStockWithNews);
        
        // Analyze sentiment for each stock's news
        const analysisPromises = Object.entries(filteredNews).map(async ([symbol, articles]) => {
          if (articles.length === 0) return;
          
          try {
            setAnalyzing(prev => ({ ...prev, [symbol]: true }));
            const headlines = articles.map(article => article.title);
            console.log(`Analyzing ${headlines.length} headlines for ${symbol}...`);
            
            const sentiment = await analyzeNewsSentiment(headlines);
            console.log(`Analysis complete for ${symbol}:`, sentiment);
            
            setSentiments(prev => ({
              ...prev,
              [symbol]: {
                ...sentiment,
                error: undefined
              }
            }));
          } catch (err) {
            console.error(`Error analyzing sentiment for ${symbol}:`, err);
            setSentiments(prev => ({
              ...prev,
              [symbol]: {
                sentiment: 'Neutral',
                confidence: 0,
                summary: 'Sentiment analysis is currently unavailable.',
                error: err instanceof Error ? err.message : 'Unknown error'
              }
            }));
          } finally {
            setAnalyzing(prev => ({ ...prev, [symbol]: false }));
          }
        });
        
        // Wait for all analyses to complete
        await Promise.all(analysisPromises);
        
      } catch (err) {
        console.error('Error loading portfolio news:', err);
        setError('Failed to load news. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [stockSymbols]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (Object.keys(newsByStock).length === 0) {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">No news found for your portfolio stocks. Try adding more stocks to see relevant news.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Portfolio News</h2>
        {activeTab && sentiments[activeTab] && (
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-500 mr-2">Sentiment:</span>
            <span 
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                sentiments[activeTab].sentiment === 'Positive' 
                  ? 'bg-green-100 text-green-800' 
                  : sentiments[activeTab].sentiment === 'Negative' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-blue-100 text-blue-800'
              }`}
            >
              {sentiments[activeTab].sentiment}{' '}
              <span className="opacity-75">
                ({(sentiments[activeTab].confidence * 100).toFixed(0)}%)
              </span>
            </span>
          </div>
        )}
      </div>
      
      {/* Stock Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {Object.keys(newsByStock).map((symbol) => {
            const sentiment = sentiments[symbol];
            const isAnalyzing = analyzing[symbol];
            
            return (
              <button
                key={symbol}
                onClick={() => setActiveTab(symbol)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === symbol
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {symbol}
                <span className="ml-2 flex items-center">
                  {isAnalyzing ? (
                    <span className="h-2 w-2 rounded-full bg-gray-300 mr-1.5"></span>
                  ) : sentiment ? (
                    <span 
                      className={`h-2 w-2 rounded-full mr-1.5 ${
                        sentiment.sentiment === 'Positive' 
                          ? 'bg-green-500' 
                          : sentiment.sentiment === 'Negative' 
                            ? 'bg-red-500' 
                            : 'bg-blue-500'
                      }`}
                    ></span>
                  ) : null}
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {newsByStock[symbol].length}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sentiment Summary */}
      {activeTab && sentiments[activeTab] && (
        <div className={`p-4 mb-6 rounded-lg ${
          sentiments[activeTab].error
            ? 'bg-yellow-50 border border-yellow-200'
            : sentiments[activeTab].sentiment === 'Positive' 
              ? 'bg-green-50 border border-green-200' 
              : sentiments[activeTab].sentiment === 'Negative' 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {sentiments[activeTab].error ? (
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-700">
                <span className="font-medium">
                  {sentiments[activeTab].error ? 'Analysis Note' : 'AI Analysis'}:
                </span>{' '}
                {sentiments[activeTab].error || sentiments[activeTab].summary}
              </p>
              {sentiments[activeTab].error && (
                <p className="mt-1 text-xs text-yellow-700">
                  Sentiment analysis is currently limited. We're working to resolve this.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* News Articles */}
      {activeTab && newsByStock[activeTab] && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {newsByStock[activeTab].slice(0, 6).map((article) => (
            <a
              key={article.article_id}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 border border-gray-200 flex flex-col h-full"
            >
              {article.image_url && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2 mb-2">
                  {article.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                  {article.description || 'No description available.'}
                </p>
                <div className="mt-auto pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{article.source_name}</span>
                    <span>
                      {article.pubDate ? format(new Date(article.pubDate), 'MMM d, yyyy') : ''}
                    </span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
      
      {activeTab && newsByStock[activeTab]?.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No news articles found for {activeTab}.
        </div>
      )}
    </div>
  );
}
