'use client';

import { useState, useEffect } from 'react';
import { fetchNews, NewsArticle } from '@/services/newsService';
import { format } from 'date-fns';

export default function NewsList() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPage, setNextPage] = useState<string | undefined>();

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async (page?: string) => {
    try {
      const isInitialLoad = !page;
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const data = await fetchNews(page);
      setArticles(prev => isInitialLoad ? data.results : [...prev, ...data.results]);
      setNextPage(data.nextPage);
      setError(null);
    } catch (err) {
      console.error('Failed to load news:', err);
      setError('Failed to load news. Please try again later.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (nextPage && !loadingMore) {
      loadNews(nextPage);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy • h:mm a');
    } catch {
      return '';
    }
  };

  if (loading && articles.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Fetching the latest news...</p>
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Latest Financial News</h1>
        <p className="text-lg text-gray-600">Stay updated with the latest business and market news from India</p>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <article key={article.article_id} className="flex flex-col h-full bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
            {article.image_url && (
              <div className="h-48 bg-gray-100 overflow-hidden">
                <img 
                  src={article.image_url} 
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement?.classList.add('hidden');
                  }}
                />
              </div>
            )}
            <div className="p-6 flex flex-col flex-1">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {article.category?.[0]?.toUpperCase() || 'BUSINESS'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                  <a 
                    href={article.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors"
                  >
                    {article.title}
                  </a>
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {article.description || 'No description available.'}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{article.source_name}</span>
                  <time className="text-sm text-gray-500" dateTime={article.pubDate}>
                    {formatDate(article.pubDate)}
                  </time>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {nextPage && (
        <div className="mt-12 text-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${loadingMore ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {loadingMore ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              'Load More Articles'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
