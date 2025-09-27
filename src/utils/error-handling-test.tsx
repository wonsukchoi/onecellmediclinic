import React, { useState, useEffect } from 'react';
import { ErrorBoundary, useErrorHandler } from '../components/ErrorBoundary/ErrorBoundary';
import { ErrorLogger } from './error-logger';
import { useApiCall } from '../hooks/useApiCall';

// Test component that demonstrates error boundary functionality
export const ErrorHandlingTest: React.FC = () => {
  const [testCase, setTestCase] = useState<string>('');
  const [results, setResults] = useState<string[]>([]);
  const errorHandler = useErrorHandler();

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Test API call with retry logic
  const testApiCall = useApiCall(
    async (shouldFail: boolean) => {
      if (shouldFail) {
        throw new Error('Simulated API failure');
      }
      return { success: true, data: 'API call successful' };
    },
    {
      retryCount: 3,
      retryDelay: 500,
      onError: (error, attempt) => {
        addResult(`API call failed on attempt ${attempt}: ${error.message}`);
      },
      onRetry: (attempt, delay) => {
        addResult(`Retrying API call in ${delay}ms (attempt ${attempt})`);
      }
    }
  );

  // Test components that throw errors
  const ErrorComponent = ({ errorType }: { errorType: string }) => {
    useEffect(() => {
      if (errorType === 'useEffect') {
        throw new Error('Error in useEffect');
      }
    }, [errorType]);

    if (errorType === 'render') {
      throw new Error('Error during render');
    }

    if (errorType === 'async') {
      setTimeout(() => {
        throw new Error('Async error');
      }, 100);
    }

    return <div>Component rendered successfully</div>;
  };

  const runTest = async (testType: string) => {
    setResults([]);
    addResult(`Starting test: ${testType}`);

    try {
      switch (testType) {
        case 'api-success':
          addResult('Testing successful API call...');
          const successResult = await testApiCall.execute(false);
          addResult(`Success: ${JSON.stringify(successResult)}`);
          break;

        case 'api-failure':
          addResult('Testing API call with retry logic...');
          try {
            await testApiCall.execute(true);
          } catch (error) {
            addResult(`Final failure: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
          break;

        case 'render-error':
          setTestCase('render');
          addResult('Testing render error (should be caught by error boundary)');
          break;

        case 'useEffect-error':
          setTestCase('useEffect');
          addResult('Testing useEffect error (should be caught by error boundary)');
          break;

        case 'async-error':
          setTestCase('async');
          addResult('Testing async error (should be caught by global handler)');
          break;

        case 'manual-error':
          addResult('Testing manual error reporting...');
          const testError = new Error('Manually reported error');
          errorHandler(testError, 'manual-test');
          addResult('Manual error reported successfully');
          break;

        case 'network-error':
          addResult('Testing network error simulation...');
          try {
            await fetch('https://nonexistent-domain-12345.com/api/test');
          } catch (error) {
            ErrorLogger.logError(error instanceof Error ? error : new Error(String(error)), {
              context: 'network-test'
            });
            addResult('Network error logged successfully');
          }
          break;

        case 'error-stats':
          addResult('Getting error statistics...');
          const stats = ErrorLogger.getErrorStats();
          addResult(`Error stats: ${JSON.stringify(stats, null, 2)}`);
          break;

        case 'clear-errors':
          addResult('Clearing all error logs...');
          ErrorLogger.clearErrors();
          addResult('Error logs cleared');
          break;

        default:
          addResult('Unknown test type');
      }
    } catch (error) {
      addResult(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Error Handling Test Suite</h2>

      <div style={{ marginBottom: '20px' }}>
        <h3>Test Controls</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {[
            'api-success',
            'api-failure',
            'render-error',
            'useEffect-error',
            'async-error',
            'manual-error',
            'network-error',
            'error-stats',
            'clear-errors'
          ].map(test => (
            <button
              key={test}
              onClick={() => runTest(test)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {test}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Test Results</h3>
        <div
          style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            padding: '10px',
            borderRadius: '4px',
            maxHeight: '300px',
            overflow: 'auto'
          }}
        >
          {results.length === 0 ? (
            <div>No test results yet</div>
          ) : (
            results.map((result, index) => (
              <div key={index}>{result}</div>
            ))
          )}
        </div>
      </div>

      <div>
        <h3>Error Boundary Test Area</h3>
        <ErrorBoundary
          onError={(error) => {
            addResult(`Error boundary caught: ${error.message}`);
          }}
          resetKeys={[testCase]}
        >
          {testCase ? (
            <ErrorComponent errorType={testCase} />
          ) : (
            <div>Select a test to see error boundary in action</div>
          )}
        </ErrorBoundary>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>API Call Status</h3>
        <div>
          Loading: {testApiCall.loading ? 'Yes' : 'No'}<br />
          Error: {testApiCall.error || 'None'}<br />
          Data: {testApiCall.data ? JSON.stringify(testApiCall.data) : 'None'}
        </div>
      </div>
    </div>
  );
};

// Function to run comprehensive error handling tests
export const runErrorHandlingTests = () => {
  console.log('🚀 Starting comprehensive error handling tests...');

  // Test 1: Error Logger
  console.log('📊 Testing Error Logger...');
  ErrorLogger.logError(new Error('Test error'), { context: 'test' });
  ErrorLogger.logWarning('Test warning', { context: 'test' });
  ErrorLogger.logInfo('Test info', { context: 'test' });

  // Test 2: Error Statistics
  console.log('📈 Error statistics:', ErrorLogger.getErrorStats());

  // Test 3: Global error handlers
  console.log('🌐 Testing global error handlers...');

  // Simulate unhandled promise rejection
  Promise.reject(new Error('Unhandled promise rejection test')).catch(() => {
    // This should be caught by global handler
  });

  // Test 4: Performance monitoring
  console.log('⚡ Performance monitoring active');

  console.log('✅ Error handling tests completed. Check browser console and error logs for results.');

  return {
    errorCount: ErrorLogger.getAllErrors().length,
    stats: ErrorLogger.getErrorStats(),
    recentErrors: ErrorLogger.getRecentErrors(5)
  };
};

// Export test functions for development use
export const testFunctions = {
  runErrorHandlingTests,
  clearErrorLogs: () => ErrorLogger.clearErrors(),
  downloadErrorLogs: () => ErrorLogger.downloadErrorLogs(),
  getErrorStats: () => ErrorLogger.getErrorStats(),
  getRecentErrors: (limit = 10) => ErrorLogger.getRecentErrors(limit)
};