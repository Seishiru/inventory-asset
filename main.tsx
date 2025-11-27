import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"

class ErrorBoundary extends React.Component<any, { error: any }>{
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { error };
  }

  componentDidCatch(_error: any, _info: any) {
    // You can log the error to an external service here
    // console.error(_error, _info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
          <h1 style={{ color: '#b91c1c' }}>Application Error</h1>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#111' }}>{String(this.state.error)}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)






