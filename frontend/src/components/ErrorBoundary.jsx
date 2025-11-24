import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Sidebar Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-4">Something went wrong with the sidebar.</div>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;