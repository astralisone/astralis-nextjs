'use client';

import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type QueryStatus = 'idle' | 'success' | 'error';

export type QueryState = {
  status: QueryStatus;
  message: string;
  rows?: Record<string, unknown>[];
};

export const QUERY_INITIAL_STATE: QueryState = {
  status: 'idle',
  message: 'Enter a read-only SQL query and run it.',
};

type DbQueryRunnerProps = {
  action: (state: QueryState, formData: FormData) => Promise<QueryState>;
  defaultQuery?: string;
  title?: string;
};

export function DbQueryRunner({ action, defaultQuery, title }: DbQueryRunnerProps) {
  const [state, formAction] = useFormState(action, QUERY_INITIAL_STATE);

  return (
    <div className="space-y-4">
      {title ? (
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <Badge variant={badgeVariantForStatus(state.status)}>{state.status.toUpperCase()}</Badge>
        </div>
      ) : null}

      <form action={formAction} className="space-y-3">
        <Textarea
          name="query"
          defaultValue={defaultQuery ?? 'SELECT NOW();'}
          rows={5}
          placeholder="SELECT * FROM users LIMIT 5;"
          className="font-mono text-sm"
        />
        <div className="flex items-center gap-2">
          <RunButton />
          <Button type="reset" variant="outline">
            Reset
          </Button>
        </div>
      </form>

      <div
        className={cn(
          'rounded-md border px-4 py-3 text-sm',
          state.status === 'success' && 'border-green-200 bg-green-50 text-green-700',
          state.status === 'error' && 'border-red-200 bg-red-50 text-red-700',
          state.status === 'idle' && 'border-slate-200 bg-slate-50 text-slate-700'
        )}
      >
        {state.message}
      </div>

      {state.rows && state.rows.length > 0 ? <ResultTable rows={state.rows} /> : null}

      {state.status === 'success' && (!state.rows || state.rows.length === 0) ? (
        <p className="text-sm text-slate-500">Query executed successfully with no rows returned.</p>
      ) : null}
    </div>
  );
}

function badgeVariantForStatus(status: QueryStatus) {
  switch (status) {
    case 'success':
      return 'success' as const;
    case 'error':
      return 'error' as const;
    default:
      return 'secondary' as const;
  }
}

function RunButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Running…' : 'Run query'}
    </Button>
  );
}

type ResultTableProps = {
  rows: Record<string, unknown>[];
};

function ResultTable({ rows }: ResultTableProps) {
  const columns = React.useMemo(() => {
    if (!rows.length) {
      return [] as string[];
    }
    const keys = new Set<string>();
    for (const row of rows) {
      Object.keys(row ?? {}).forEach((key) => keys.add(key));
    }
    return Array.from(keys);
  }, [rows]);

  return (
    <div className="overflow-auto rounded-md border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col" className="px-4 py-2 font-medium text-slate-600">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="odd:bg-white even:bg-slate-50">
              {columns.map((column) => (
                <td key={column} className="whitespace-pre-wrap px-4 py-2 font-mono text-xs text-slate-700">
                  {formatCellValue(row[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatCellValue(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value === null || value === undefined) {
    return 'NULL';
  }

  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch (error) {
      console.error('[DbQueryRunner] Failed to stringify cell value:', error);
      return String(value);
    }
  }

  return String(value);
}
