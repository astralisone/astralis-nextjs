import React, { useState } from 'react';
import { WorkflowNode, ValidationResult } from '../../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { ScrollArea } from './ui/ScrollArea';
import { Save, Play, CheckCircle, AlertTriangle, Settings } from 'lucide-react';

interface PropertyPanelProps {
  selectedNode: WorkflowNode | null;
  onNodeUpdate: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  onValidate: () => Promise<void>;
  onSave: () => Promise<void>;
  onDeploy: () => Promise<void>;
  validationResult: ValidationResult | null;
  isValidating: boolean;
  readOnly?: boolean;
}

export function PropertyPanel({
  selectedNode,
  onNodeUpdate,
  onValidate,
  onSave,
  onDeploy,
  validationResult,
  isValidating,
  readOnly = false,
}: PropertyPanelProps) {
  const [isValidatingLocal, setIsValidatingLocal] = useState(false);

  const handleValidate = async () => {
    setIsValidatingLocal(true);
    try {
      await onValidate();
    } finally {
      setIsValidatingLocal(false);
    }
  };

  const handlePropertyChange = (propertyName: string, value: any) => {
    if (!selectedNode || readOnly) return;

    const updatedProperties = {
      ...selectedNode.data.properties,
      [propertyName]: value,
    };

    // Check if node is now configured
    const isConfigured = checkIfConfigured(selectedNode.data.n8nDefinition, updatedProperties);

    onNodeUpdate(selectedNode.id, {
      data: {
        ...selectedNode.data,
        properties: updatedProperties,
        isConfigured,
      },
    });
  };

  const checkIfConfigured = (definition: any, properties: any): boolean => {
    if (!definition?.properties) return false;

    return definition.properties
      .filter((prop: any) => prop.required)
      .every((prop: any) => {
        const value = properties[prop.name];
        return value !== undefined && value !== null && value !== '';
      });
  };

  const renderPropertyInput = (property: any) => {
    const value = selectedNode?.data.properties[property.name] || property.default || '';

    switch (property.type) {
      case 'string':
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handlePropertyChange(property.name, e.target.value)}
            placeholder={property.description || `Enter ${property.displayName}`}
            disabled={readOnly}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handlePropertyChange(property.name, parseFloat(e.target.value))}
            placeholder={property.description || `Enter ${property.displayName}`}
            disabled={readOnly}
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handlePropertyChange(property.name, e.target.checked)}
              disabled={readOnly}
              className="rounded border-slate-300"
            />
            <span className="text-sm">{property.displayName}</span>
          </label>
        );

      case 'options':
        return (
          <select
            value={value}
            onChange={(e) => handlePropertyChange(property.name, e.target.value)}
            disabled={readOnly}
            className="w-full p-2 border border-slate-300 rounded-md bg-white disabled:opacity-50"
          >
            <option value="">Select {property.displayName}</option>
            {property.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handlePropertyChange(property.name, e.target.value)}
            placeholder={`Enter ${property.displayName}`}
            disabled={readOnly}
          />
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Properties
        </h2>
        {selectedNode ? (
          <div className="text-sm text-slate-600 dark:text-slate-300">
            {selectedNode.data.n8nDefinition?.displayName || 'Selected Node'}
          </div>
        ) : (
          <div className="text-sm text-slate-500">
            Select a node to edit its properties
          </div>
        )}
      </div>

      {/* Properties */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {selectedNode ? (
            <div className="space-y-6">
              {/* Node Status */}
              <div className="flex items-center gap-2">
                <Badge variant={selectedNode.data.isConfigured ? 'default' : 'secondary'}>
                  {selectedNode.data.isConfigured ? 'Configured' : 'Not Configured'}
                </Badge>
                {selectedNode.data.isConfigured && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>

              {/* Node Properties */}
              {selectedNode.data.n8nDefinition?.properties && (
                <div className="space-y-4">
                  <h3 className="font-medium text-slate-900 dark:text-white">Properties</h3>
                  {selectedNode.data.n8nDefinition.properties.map((property: any) => (
                    <div key={property.name} className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        {property.displayName}
                        {property.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {renderPropertyInput(property)}
                      {property.description && (
                        <p className="text-xs text-slate-500">{property.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Validation Errors */}
              {validationResult && !validationResult.isValid && (
                <div className="space-y-2">
                  <h3 className="font-medium text-red-700 dark:text-red-400">Validation Errors</h3>
                  {validationResult.errors.map((error, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{error.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a node to view and edit its properties</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Action Buttons */}
      {selectedNode && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
          <Button
            onClick={handleValidate}
            disabled={isValidating || isValidatingLocal || readOnly}
            className="w-full"
            variant="outline"
          >
            <Play className="w-4 h-4 mr-2" />
            {isValidating || isValidatingLocal ? 'Validating...' : 'Validate'}
          </Button>

          <Button
            onClick={onSave}
            disabled={readOnly}
            className="w-full"
            variant="outline"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>

          <Button
            onClick={onDeploy}
            disabled={readOnly}
            className="w-full"
          >
            Deploy Workflow
          </Button>
        </div>
      )}
    </div>
  );
}