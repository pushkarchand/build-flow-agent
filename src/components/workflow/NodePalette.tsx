import React from 'react';
import { NodeTemplate } from '@/types/workflow';
import { Card } from '@/components/ui/card';
import { Bot, Wrench, Zap, Play } from 'lucide-react';

const nodeTemplates: NodeTemplate[] = [
  {
    id: 'agent-template',
    type: 'agent',
    label: 'AI Agent',
    description: 'Intelligent agent that can reason and act',
    icon: 'Bot',
  },
  {
    id: 'tool-template',
    type: 'tool',
    label: 'Tool',
    description: 'External tool or API integration',
    icon: 'Wrench',
  },
  {
    id: 'trigger-template',
    type: 'trigger',
    label: 'Trigger',
    description: 'Event or condition that starts the workflow',
    icon: 'Zap',
  },
  {
    id: 'action-template',
    type: 'action',
    label: 'Action',
    description: 'Execute a specific task or operation',
    icon: 'Play',
  },
];

const iconMap = {
  Bot,
  Wrench,
  Zap,
  Play,
};

interface NodePaletteProps {
  onDragStart: (event: React.DragEvent, nodeType: NodeTemplate) => void;
}

export const NodePalette: React.FC<NodePaletteProps> = ({ onDragStart }) => {
  return (
    <div className="p-4">
      <h3 className="font-semibold mb-4 text-foreground">Node Library</h3>
      <div className="space-y-2">
        {nodeTemplates.map((template) => {
          const Icon = iconMap[template.icon as keyof typeof iconMap];
          return (
            <Card
              key={template.id}
              className="p-3 cursor-grab hover:shadow-md transition-shadow bg-card border-border"
              draggable
              onDragStart={(event) => onDragStart(event, template)}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded workflow-node node-${template.type}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-card-foreground">
                    {template.label}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {template.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};