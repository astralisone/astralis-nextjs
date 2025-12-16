import React, { useState } from 'react';
import { N8nNodeDefinition, NodeType } from '../../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ScrollArea } from './ui/ScrollArea';
import { Badge } from './ui/Badge';
import { Search, Filter } from 'lucide-react';

interface NodePaletteProps {
  availableNodes: N8nNodeDefinition[];
  onNodeAdd: (type: NodeType, position: { x: number; y: number }) => void;
  readOnly?: boolean;
}

export function NodePalette({ availableNodes, onNodeAdd, readOnly = false }: NodePaletteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Group nodes by category
  const categorizedNodes = availableNodes.reduce((acc, node) => {
    const category = node.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(node);
    return acc;
  }, {} as Record<string, N8nNodeDefinition[]>);

  // Filter nodes based on search and category
  const filteredNodes = availableNodes.filter(node => {
    const matchesSearch = node.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || node.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['all', ...Object.keys(categorizedNodes)];

  const handleDragStart = (event: React.DragEvent, node: N8nNodeDefinition) => {
    if (readOnly) return;

    // Convert n8n node to our node type
    const nodeType = getNodeTypeFromCategory(node.category);
    event.dataTransfer.setData('application/json', JSON.stringify({
      type: nodeType,
      n8nDefinition: node,
    }));
  };

  const getNodeTypeFromCategory = (category: string): NodeType => {
    switch (category.toLowerCase()) {
      case 'trigger':
      case 'webhook':
        return 'trigger';
      case 'action':
      case 'transform':
        return 'action';
      case 'logic':
      case 'flow':
        return 'logic';
      case 'data':
      case 'database':
        return 'data';
      case 'integration':
      case 'api':
        return 'integration';
      case 'output':
      case 'notification':
        return 'output';
      default:
        return 'action';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Node Palette
        </h2>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs capitalize"
            >
              {category === 'all' ? 'All' : category}
            </Button>
          ))}
        </div>
      </div>

      {/* Node List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {filteredNodes.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No nodes found matching your criteria
            </div>
          ) : (
            filteredNodes.map(node => (
              <div
                key={node.name}
                className={`
                  p-3 rounded-lg border border-slate-200 dark:border-slate-600
                  bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600
                  transition-colors cursor-move
                  ${readOnly ? 'cursor-not-allowed opacity-50' : ''}
                `}
                draggable={!readOnly}
                onDragStart={(e) => handleDragStart(e, node)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {node.icon || node.displayName.charAt(0)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-slate-900 dark:text-white truncate">
                      {node.displayName}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                      {node.description}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {node.category || 'other'}
                      </Badge>
                      {node.properties && (
                        <span className="text-xs text-slate-500">
                          {node.properties.length} properties
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}