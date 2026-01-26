import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    handleHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full p-8 text-center border border-gray-100 dark:border-gray-700">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Oups ! Une erreur est survenue.
                        </h2>

                        <p className="text-gray-500 dark:text-gray-400 mb-8">
                            L'application a rencontré un problème inattendu. Nous avons été notifiés.
                            Essayez de rafraîchir la page.
                        </p>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={this.handleHome}
                                className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Accueil
                            </button>
                            <button
                                onClick={this.handleReset}
                                className="flex items-center px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Rafraîchir
                            </button>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                                className="text-xs text-gray-400 hover:text-gray-600 underline"
                            >
                                {this.state.showDetails ? "Masquer les détails" : "Détails techniques"}
                            </button>
                        </div>

                        {this.state.showDetails && this.state.error && (
                            <div className="mt-4 text-left bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto max-h-64 text-xs font-mono text-red-600 border border-gray-200 dark:border-gray-700">
                                <p className="font-bold mb-2 break-words">{this.state.error.toString()}</p>
                                <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
