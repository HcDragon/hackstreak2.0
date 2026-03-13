import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f1f35] to-[#1a2332] flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 max-w-2xl">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h1>
            <p className="text-white/70 mb-4">The application encountered an error:</p>
            <pre className="bg-black/30 p-4 rounded-lg text-red-300 text-sm overflow-auto">
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 bg-gradient-to-r from-[#00d4ff] to-blue-600 text-white px-6 py-2 rounded-lg hover:from-[#00b8e6] hover:to-blue-700 transition-all"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
