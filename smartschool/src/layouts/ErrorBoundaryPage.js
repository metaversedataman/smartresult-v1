import {ErrorBoundary} from 'react-error-boundary'

const ErrorPage = function ErrorFallback({error, resetErrorBoundary}) {
  return (    
    <div className="grid-container gradient-background">
    <div className="grid-header section-horizontal-padding">
        <Header />
        <Navigation />
    </div>
    <main className="grid-body section-horizontal-padding section-vertical-padding section-horizontal-margin section-vertical-margin glass-morph">
        <div>
        <p>Something went wrong:</p>
          <pre>{error.message}</pre>
          <button onClick={resetErrorBoundary}>Try again</button>
        </div>
    </main>
    <div className="grid-footer section-horizontal-padding">
        <Footer />
    </div>
    </div>
  )
}

export default ErrorPage;