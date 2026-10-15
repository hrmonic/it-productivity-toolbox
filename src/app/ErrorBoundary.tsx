import { t } from '../shared/i18n';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorNotice } from '../shared/ui/primitives';

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: string }> {
  state = { error: '' };
  static getDerivedStateFromError(error: unknown) {
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred.' };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application boundary', error, info.componentStack);
  }
  render() {
    return this.state.error ? (
      <main className="fatal-error">
        <h1>{t('The workspace could not be opened.')}</h1>
        <p>
          {t(
            'Browser storage may be unavailable, or the application encountered an error. Your stored data has not been reset. Try reloading or opening this site in a browser with IndexedDB enabled.',
          )}
        </p>
        <ErrorNotice>{this.state.error}</ErrorNotice>
        <button className="button primary" onClick={() => location.reload()}>
          {t('Reload application')}
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
