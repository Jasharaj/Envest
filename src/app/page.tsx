'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Import components with no SSR to avoid hydration issues
const NewsList = dynamic(() => import('@/components/NewsList'), { ssr: false });
const Portfolio = dynamic(() => import('@/components/Portfolio'), { ssr: false });

export default function Home() {
  const [activeTab, setActiveTab] = useState('news');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  Envest
                </span>
              </div>
              <nav className="hidden md:ml-10 md:flex space-x-8">
                <button 
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'all' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  News
                </button>
                <button 
                  onClick={() => setActiveTab('portfolio')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'portfolio' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Portfolio
                </button>
                <button 
                  onClick={() => setActiveTab('trending')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'trending' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Trending
                </button>
              </nav>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <span className="sr-only">View notifications</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                <div className="ml-3 relative">
                  <div>
                    <button type="button" className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" id="user-menu-button" aria-expanded="false" aria-haspopup="true">
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                        U
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden border-t border-gray-200 pt-2 pb-3">
          <div className="px-2 space-y-1">
            <button 
              onClick={() => setActiveTab('all')}
              className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${activeTab === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
            >
              All News
            </button>
            <button 
              onClick={() => setActiveTab('portfolio')}
              className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${activeTab === 'portfolio' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
            >
              My Portfolio
            </button>
            <button 
              onClick={() => setActiveTab('trending')}
              className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${activeTab === 'trending' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
            >
              Trending
            </button>
          </div>
        </div>
      </header>
      
      <main className="min-h-[calc(100vh-4rem)] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Navigation */}
          <div className="mb-8 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('news')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'news'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Market News
              </button>
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'portfolio'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Portfolio
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'news' ? <NewsList /> : <Portfolio />}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center space-x-6 md:order-2">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            <div className="mt-8 md:mt-0 md:order-1">
              <p className="text-center text-base text-gray-500">
                &copy; {new Date().getFullYear()} Envest. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
