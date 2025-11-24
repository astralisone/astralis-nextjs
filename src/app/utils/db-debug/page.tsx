import * as React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { DbQueryRunner, type QueryState } from '@/components/debug/DbQueryRunner';
import { runQueryAction, resetDatabaseAction, getConnectionStatusAction, getTableCountsAction } from './actions';

export default function DbDebugPage() {
  return (
    <div className="container mx-auto max-w-6xl p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Database Debug Tools</h1>
        <p className="mt-2 text-slate-600">
          Inspect and interact with the PostgreSQL database. Use with caution in production.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Connection Status
              <ConnectionStatusBadge />
            </CardTitle>
            <CardDescription>Check database connectivity and basic info</CardDescription>
          </CardHeader>
          <CardContent>
            <ConnectionStatus />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Table Counts</CardTitle>
            <CardDescription>Quick overview of record counts per table</CardDescription>
          </CardHeader>
          <CardContent>
            <TableCounts />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Custom Query Runner</CardTitle>
          <CardDescription>
            Execute read-only SQL queries. Results are displayed in a table below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DbQueryRunner
            action={runQueryAction}
            defaultQuery="SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
            title="Run Query"
          />
        </CardContent>
      </Card>

      <Card className="mt-6 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-900">Danger Zone</CardTitle>
          <CardDescription className="text-red-700">
            These actions will permanently modify the database. Use only in development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={resetDatabaseAction} className="flex items-center gap-4">
            <Button type="submit" variant="destructive">
              Reset Database
            </Button>
            <p className="text-sm text-red-700">
              This will drop all tables and re-run migrations. All data will be lost.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function ConnectionStatusBadge() {
  return <Badge variant="secondary">Live</Badge>;
}

function ConnectionStatus() {
  const [status, setStatus] = React.useState<QueryState | null>(null);

  React.useEffect(() => {
    getConnectionStatusAction().then(setStatus);
  }, []);

  if (!status) {
    return <p className="text-sm text-slate-500">Loading...</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant={status.status === 'success' ? 'success' : 'error'}>
          {status.status.toUpperCase()}
        </Badge>
      </div>
      <p className="text-sm text-slate-700">{status.message}</p>
    </div>
  );
}

function TableCounts() {
  const [counts, setCounts] = React.useState<QueryState | null>(null);

  React.useEffect(() => {
    getTableCountsAction().then(setCounts);
  }, []);

  if (!counts) {
    return <p className="text-sm text-slate-500">Loading...</p>;
  }

  if (counts.status !== 'success' || !counts.rows) {
    return (
      <div className="space-y-2">
        <Badge variant="error">ERROR</Badge>
        <p className="text-sm text-red-700">{counts.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {counts.rows.map((row, index) => (
        <div key={index} className="flex items-center justify-between">
          <span className="font-medium text-slate-900">{String(row.table_name)}</span>
          <Badge variant="primary">{String(row.count)}</Badge>
        </div>
      ))}
    </div>
  );
}
