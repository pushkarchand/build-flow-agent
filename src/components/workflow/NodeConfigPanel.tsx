import React, { useState, useEffect } from 'react';
import { WorkflowNode } from '@/types/workflow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { X, Save, Settings } from 'lucide-react';

interface NodeConfigPanelProps {
  node: WorkflowNode | null;
  onUpdateNode: (nodeId: string, updates: Partial<WorkflowNode['data']>) => void;
  onClose: () => void;
}

export const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({
  node,
  onUpdateNode,
  onClose,
}) => {
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [parameters, setParameters] = useState<Record<string, any>>({});

  useEffect(() => {
    if (node) {
      setLabel(node.data.label);
      setDescription(node.data.description || '');
      setParameters(node.data.parameters || {});
    }
  }, [node]);

  const handleSave = () => {
    if (!node) return;
    
    onUpdateNode(node.id, {
      label,
      description,
      parameters,
    });
    
    onClose();
  };

  const handleParameterChange = (key: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderParameterInput = (key: string, value: any) => {
    if (typeof value === 'boolean') {
      return (
        <div key={key} className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={key}
            checked={value}
            onChange={(e) => handleParameterChange(key, e.target.checked)}
            className="rounded border-gray-300"
          />
          <Label htmlFor={key} className="text-sm capitalize">
            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
          </Label>
        </div>
      );
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <div key={key} className="space-y-2">
          <Label className="text-sm font-medium capitalize">
            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
          </Label>
          <Textarea
            value={JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleParameterChange(key, parsed);
              } catch {
                // Invalid JSON, keep as string for now
              }
            }}
            className="font-mono text-xs"
            rows={3}
          />
        </div>
      );
    }

    if (key.toLowerCase().includes('description') || key.toLowerCase().includes('prompt')) {
      return (
        <div key={key} className="space-y-2">
          <Label htmlFor={key} className="text-sm font-medium capitalize">
            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
          </Label>
          <Textarea
            id={key}
            value={value?.toString() || ''}
            onChange={(e) => handleParameterChange(key, e.target.value)}
            rows={3}
          />
        </div>
      );
    }

    return (
      <div key={key} className="space-y-2">
        <Label htmlFor={key} className="text-sm font-medium capitalize">
          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
        </Label>
        <Input
          id={key}
          value={value?.toString() || ''}
          onChange={(e) => handleParameterChange(key, e.target.value)}
        />
      </div>
    );
  };

  if (!node) {
    return (
      <Card className="w-80 h-full rounded-none border-l border-border">
        <CardContent className="p-6 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select a node to configure</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-80 h-full rounded-none border-l border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Node Configuration</CardTitle>
            <Badge variant="secondary" className="mt-1 text-xs">
              {node.data.type} {node.data.subType ? `• ${node.data.subType}` : ''}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="node-label" className="text-sm font-medium">
              Label
            </Label>
            <Input
              id="node-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Enter node label"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="node-description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="node-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter node description"
              rows={2}
            />
          </div>
        </div>

        <Separator />

        {/* Parameters */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Parameters</h4>
          {Object.keys(parameters).length === 0 ? (
            <p className="text-sm text-muted-foreground">No parameters available</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(parameters).map(([key, value]) =>
                renderParameterInput(key, value)
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
