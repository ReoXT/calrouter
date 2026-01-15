'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'success' | 'failed' | 'pending';
  details: any;
}

interface TestResponse {
  success: boolean;
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
  status: string;
  timestamp: string;
  tests: TestResult[];
}

export default function TestSupabasePage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResponse | null>(null);

  const runTests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/supabase');
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Failed to run tests:', error);
      setResults({
        success: false,
        summary: { total: 0, passed: 0, failed: 1 },
        status: '❌ Connection failed',
        timestamp: new Date().toISOString(),
        tests: [
          {
            name: 'Connection Error',
            status: 'failed',
            details: {
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Supabase Connection Test</h1>
            <p className="text-muted-foreground mt-2">
              Verify your database connection and schema
            </p>
          </div>
          <Button onClick={runTests} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Run Tests
              </>
            )}
          </Button>
        </div>

        {/* Summary Card */}
        {results && (
          <Card className="p-6 border-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">{results.status}</h2>
                <p className="text-sm text-muted-foreground">
                  {results.summary.passed} of {results.summary.total} tests passed
                </p>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-500">{results.summary.passed}</p>
                  <p className="text-xs text-muted-foreground">Passed</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-destructive">{results.summary.failed}</p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Test Results */}
        {results && (
          <div className="space-y-4">
            {results.tests.map((test, index) => (
              <Card key={index} className="p-6 border-2">
                <div className="space-y-4">
                  {/* Test Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {test.status === 'success' ? (
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : test.status === 'failed' ? (
                        <XCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
                      ) : (
                        <Loader2 className="w-6 h-6 text-muted-foreground flex-shrink-0 mt-0.5 animate-spin" />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold">{test.name}</h3>
                      </div>
                    </div>
                    <Badge
                      variant={test.status === 'success' ? 'default' : 'destructive'}
                      className={
                        test.status === 'success'
                          ? 'bg-green-500/10 text-green-500 border-green-500/20'
                          : ''
                      }
                    >
                      {test.status.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Test Details */}
                  <div className="pl-9 space-y-2">
                    {Object.entries(test.details).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2 text-sm">
                        <span className="font-medium text-muted-foreground min-w-[140px]">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span
                          className={
                            typeof value === 'string' && value.startsWith('❌')
                              ? 'text-destructive font-mono'
                              : typeof value === 'string' && value.startsWith('✅')
                              ? 'text-green-500 font-mono'
                              : 'font-mono'
                          }
                        >
                          {typeof value === 'object'
                            ? JSON.stringify(value, null, 2)
                            : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Help Text */}
        {results && !results.success && (
          <Card className="p-6 bg-muted/50 border-2">
            <h3 className="font-semibold mb-3">Troubleshooting</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span>•</span>
                <span>
                  <strong>Missing environment variables?</strong> Check your{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> file
                </span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>
                  <strong>Tables don't exist?</strong> Run the{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">schema.sql</code> in
                  Supabase SQL Editor
                </span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>
                  <strong>Connection refused?</strong> Verify your Supabase URL and keys
                  are correct
                </span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>
                  <strong>RLS errors?</strong> The admin client should bypass RLS - check
                  service role key
                </span>
              </li>
            </ul>
          </Card>
        )}

        {/* Success Next Steps */}
        {results && results.success && (
          <Card className="p-6 bg-green-500/10 border-2 border-green-500/20">
            <h3 className="font-semibold text-green-500 mb-3">✅ All Tests Passed!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your Supabase connection is working perfectly. You're ready to:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span>1.</span>
                <span>Set up Clerk webhook to sync users</span>
              </li>
              <li className="flex gap-2">
                <span>2.</span>
                <span>Build the endpoints management UI</span>
              </li>
              <li className="flex gap-2">
                <span>3.</span>
                <span>Create the webhook receiver API</span>
              </li>
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
