import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            
            <div>
              <h1 className="text-2xl font-light text-white mb-2">Something went wrong</h1>
              <p className="text-neutral-400">
                We encountered an unexpected error. Please try refreshing the page.
              </p>
            </div>

            {this.state.error && (
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-left">
                <p className="text-xs text-red-500 font-mono">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <Button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}