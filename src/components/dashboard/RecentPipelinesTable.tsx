"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { Eye, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RecentPipeline } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import Link from "next/link";

/**
 * RecentPipelinesTable Component
 *
 * Displays the last 5 pipelines in a table format
 * Columns: Name, Stages, Items, Status, Last Updated, Actions
 * Click row to navigate to pipeline detail
 */

interface RecentPipelinesTableProps {
  pipelines: RecentPipeline[];
}

export function RecentPipelinesTable({
  pipelines,
}: RecentPipelinesTableProps) {
  return (
    <Card variant="default">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold text-astralis-navy dark:text-white">
          Recent Pipelines
        </CardTitle>
        <Link href="/pipelines">
          <Button variant="outline" size="sm">
            View all
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {pipelines.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No pipelines found. Create your first pipeline to get started.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Name
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Stages
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Items
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Last Updated
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pipelines.map((pipeline) => (
                    <tr
                      key={pipeline.id}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-astralis-navy dark:text-white">
                            {pipeline.name}
                          </div>
                          {pipeline.description && (
                            <div className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs">
                              {pipeline.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {pipeline.stageCount}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {pipeline.itemCount}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <StatusBadge isActive={pipeline.isActive} />
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {formatDistanceToNow(new Date(pipeline.updatedAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link href={`/pipelines/${pipeline.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {pipelines.map((pipeline) => (
                <Link
                  key={pipeline.id}
                  href={`/pipelines/${pipeline.id}`}
                  className="block"
                >
                  <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-astralis-blue transition-colors duration-150">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-astralis-navy dark:text-white">
                          {pipeline.name}
                        </h4>
                        {pipeline.description && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {pipeline.description}
                          </p>
                        )}
                      </div>
                      <StatusBadge isActive={pipeline.isActive} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                        <span>
                          <span className="font-medium">{pipeline.stageCount}</span> stages
                        </span>
                        <span>
                          <span className="font-medium">{pipeline.itemCount}</span> items
                        </span>
                      </div>
                      <span className="text-slate-500 dark:text-slate-400">
                        {formatDistanceToNow(new Date(pipeline.updatedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * StatusBadge Component
 * Displays pipeline status (Active/Inactive)
 */
function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        isActive
          ? "bg-success/10 text-success"
          : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

/**
 * RecentPipelinesTableSkeleton
 * Loading state for RecentPipelinesTable
 */
export function RecentPipelinesTableSkeleton() {
  return (
    <Card variant="default">
      <CardHeader>
        <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
