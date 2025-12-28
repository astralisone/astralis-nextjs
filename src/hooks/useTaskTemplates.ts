import useSWR from 'swr';
import { fetcher } from '@/lib/utils';

export interface TaskTemplate {
    id: string;
    label: string;
    category: string;
    department?: string;
    description?: string;
    stats?: {
        totalTasks: number;
        totalDecisions: number;
    };
}

interface TaskTemplatesResponse {
    templates: TaskTemplate[];
    total: number;
}

export function useTaskTemplates() {
    const { data, error, isLoading } = useSWR<TaskTemplatesResponse>(
        '/api/task-templates',
        fetcher
    );

    return {
        templates: data?.templates || [],
        isLoading,
        isError: error,
    };
}
