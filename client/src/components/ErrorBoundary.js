import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('ErrorBoundary caught:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{textAlign:'center',padding:'4rem',color:'#64748b'}}>
          <div style={{fontSize:'3rem',marginBottom:'1rem'}}>⚠️</div>
          <h2 style={{color:'#374151',marginBottom:'0.5rem'}}>Something went wrong</h2>
          <p style={{marginBottom:'1.5rem',fontSize:'0.9rem'}}>{this.state.error?.message}</p>
          <button className="btn btn-primary" onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
