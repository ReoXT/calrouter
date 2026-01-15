import { supabase, supabaseAdmin } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [] as any[],
  };

  // Test 1: Check environment variables
  const envTest = {
    name: 'Environment Variables',
    status: 'pending' as 'success' | 'failed' | 'pending',
    details: {} as any,
  };

  try {
    envTest.details = {
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
      SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
    };

    const allSet =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    envTest.status = allSet ? 'success' : 'failed';
  } catch (error) {
    envTest.status = 'failed';
    envTest.details.error = error instanceof Error ? error.message : 'Unknown error';
  }

  results.tests.push(envTest);

  // Test 2: Client connection
  const clientTest = {
    name: 'Client Connection (RLS)',
    status: 'pending' as 'success' | 'failed' | 'pending',
    details: {} as any,
  };

  try {
    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      clientTest.status = 'failed';
      clientTest.details = {
        error: error.message,
        code: error.code,
        hint: error.hint,
      };
    } else {
      clientTest.status = 'success';
      clientTest.details = {
        message: 'Connection successful',
        userCount: count,
      };
    }
  } catch (error) {
    clientTest.status = 'failed';
    clientTest.details.error = error instanceof Error ? error.message : 'Unknown error';
  }

  results.tests.push(clientTest);

  // Test 3: Admin connection
  const adminTest = {
    name: 'Admin Connection (Bypass RLS)',
    status: 'pending' as 'success' | 'failed' | 'pending',
    details: {} as any,
  };

  try {
    if (!supabaseAdmin) {
      adminTest.status = 'failed';
      adminTest.details = {
        error: 'Admin client not initialized',
        hint: 'Check SUPABASE_SERVICE_ROLE_KEY',
      };
    } else {
      const { data, error, count } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (error) {
        adminTest.status = 'failed';
        adminTest.details = {
          error: error.message,
          code: error.code,
          hint: error.hint,
        };
      } else {
        adminTest.status = 'success';
        adminTest.details = {
          message: 'Admin connection successful',
          userCount: count,
        };
      }
    }
  } catch (error) {
    adminTest.status = 'failed';
    adminTest.details.error = error instanceof Error ? error.message : 'Unknown error';
  }

  results.tests.push(adminTest);

  // Test 4: Check tables exist
  const tablesTest = {
    name: 'Database Schema',
    status: 'pending' as 'success' | 'failed' | 'pending',
    details: {} as any,
  };

  try {
    if (!supabaseAdmin) {
      tablesTest.status = 'failed';
      tablesTest.details.error = 'Admin client required';
    } else {
      const tables = ['users', 'webhook_endpoints', 'webhook_logs'];
      const tableChecks: any = {};

      for (const table of tables) {
        try {
          const { error } = await supabaseAdmin
            .from(table)
            .select('*', { count: 'exact', head: true });

          tableChecks[table] = error ? `❌ ${error.message}` : '✅ Exists';
        } catch (e) {
          tableChecks[table] = `❌ ${e instanceof Error ? e.message : 'Error'}`;
        }
      }

      tablesTest.details = tableChecks;

      const allExist = Object.values(tableChecks).every(
        (status) => typeof status === 'string' && status.startsWith('✅')
      );
      tablesTest.status = allExist ? 'success' : 'failed';
    }
  } catch (error) {
    tablesTest.status = 'failed';
    tablesTest.details.error = error instanceof Error ? error.message : 'Unknown error';
  }

  results.tests.push(tablesTest);

  // Test 5: Check helper function
  const functionTest = {
    name: 'Database Function (get_user_stats)',
    status: 'pending' as 'success' | 'failed' | 'pending',
    details: {} as any,
  };

  try {
    if (!supabaseAdmin) {
      functionTest.status = 'failed';
      functionTest.details.error = 'Admin client required';
    } else {
      // Use a dummy UUID for testing
      const testUserId = '00000000-0000-0000-0000-000000000000';
      const { data, error } = await supabaseAdmin.rpc('get_user_stats', {
        p_user_id: testUserId,
      });

      if (error) {
        functionTest.status = 'failed';
        functionTest.details = {
          error: error.message,
          hint: 'Function may not exist. Run schema.sql',
        };
      } else {
        functionTest.status = 'success';
        functionTest.details = {
          message: 'Function exists and callable',
          result: data,
        };
      }
    }
  } catch (error) {
    functionTest.status = 'failed';
    functionTest.details.error = error instanceof Error ? error.message : 'Unknown error';
  }

  results.tests.push(functionTest);

  // Calculate overall status
  const allPassed = results.tests.every((test) => test.status === 'success');
  const someFailed = results.tests.some((test) => test.status === 'failed');

  return NextResponse.json(
    {
      success: allPassed,
      summary: {
        total: results.tests.length,
        passed: results.tests.filter((t) => t.status === 'success').length,
        failed: results.tests.filter((t) => t.status === 'failed').length,
      },
      status: allPassed ? '✅ All tests passed!' : someFailed ? '❌ Some tests failed' : '⚠️ Tests incomplete',
      ...results,
    },
    {
      status: allPassed ? 200 : 500,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
