import React, { useState } from 'react';
import { NodeCategory, NodeTemplate } from '@/types/workflow';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronRight,
  Plus,
  Zap,
  Wrench,
  Play,
  Bot,
  Clock,
  Globe,
  Database,
  Brain,
  Mail,
  FileText,
  Send,
  Upload,
  MessageSquare,
  CheckSquare,
  BarChart3
} from 'lucide-react';

const iconMap = {
  // Category icons
  Zap, Wrench, Play, Bot,
  // Node icons
  Clock, Globe, Database, Brain, Mail, FileText, Send, Upload, MessageSquare, CheckSquare, BarChart3
};

const nodeCategories: NodeCategory[] = [
  {
    id: 'triggers',
    label: 'Triggers',
    icon: 'Zap',
    templates: [
      {
        id: 'http-trigger-template',
        type: 'trigger',
        subType: 'http-trigger',
        label: 'HTTP Trigger',
        description: 'Trigger workflow via HTTP request',
        icon: 'Globe',
        defaultParameters: { method: 'POST', endpoint: '/webhook' }
      },
      {
        id: 'time-trigger-template',
        type: 'trigger',
        subType: 'time-trigger',
        label: 'Time Trigger',
        description: 'Schedule workflow execution',
        icon: 'Clock',
        defaultParameters: { schedule: '0 0 * * *', timezone: 'UTC' }
      },
      {
        id: 'webhook-trigger-template',
        type: 'trigger',
        subType: 'webhook-trigger',
        label: 'Webhook Trigger',
        description: 'Listen for incoming webhooks',
        icon: 'Globe',
        defaultParameters: { url: '', secret: '' }
      },
      {
        id: 'file-trigger-template',
        type: 'trigger',
        subType: 'file-trigger',
        label: 'File Trigger',
        description: 'Trigger on file upload/change',
        icon: 'FileText',
        defaultParameters: { path: '/uploads', extensions: ['*'] }
      }
    ]
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: 'Wrench',
    templates: [
      {
        id: 'api-call-template',
        type: 'tool',
        subType: 'api-call',
        label: 'API Call',
        description: 'Make HTTP API requests',
        icon: 'Globe',
        defaultParameters: { method: 'GET', url: '', headers: {} }
      },
      {
        id: 'database-query-template',
        type: 'tool',
        subType: 'database-query',
        label: 'Database Query',
        description: 'Execute database operations',
        icon: 'Database',
        defaultParameters: { query: 'SELECT * FROM table', connection: '' }
      },
      {
        id: 'llm-agent-template',
        type: 'tool',
        subType: 'llm-agent',
        label: 'LLM Agent',
        description: 'AI-powered language processing',
        icon: 'Brain',
        defaultParameters: { model: 'gpt-4', prompt: '', temperature: 0.7 }
      },
      {
        id: 'email-tool-template',
        type: 'tool',
        subType: 'email-tool',
        label: 'Email Tool',
        description: 'Send and receive emails',
        icon: 'Mail',
        defaultParameters: { to: '', subject: '', body: '' }
      },
      {
        id: 'file-processor-template',
        type: 'tool',
        subType: 'file-processor',
        label: 'File Processor',
        description: 'Process and transform files',
        icon: 'FileText',
        defaultParameters: { operation: 'read', format: 'text' }
      }
    ]
  },
  {
    id: 'actions',
    label: 'Actions',
    icon: 'Play',
    templates: [
      {
        id: 'send-email-template',
        type: 'action',
        subType: 'send-email',
        label: 'Send Email',
        description: 'Send email notifications',
        icon: 'Send',
        defaultParameters: { to: '', subject: '', template: '' }
      },
      {
        id: 'update-database-template',
        type: 'action',
        subType: 'update-database',
        label: 'Update Database',
        description: 'Modify database records',
        icon: 'Database',
        defaultParameters: { table: '', operation: 'update', data: {} }
      },
      {
        id: 'webhook-call-template',
        type: 'action',
        subType: 'webhook-call',
        label: 'Webhook Call',
        description: 'Send webhook notifications',
        icon: 'Globe',
        defaultParameters: { url: '', method: 'POST', payload: {} }
      },
      {
        id: 'file-upload-template',
        type: 'action',
        subType: 'file-upload',
        label: 'File Upload',
        description: 'Upload files to storage',
        icon: 'Upload',
        defaultParameters: { destination: '', overwrite: false }
      }
    ]
  },
  {
    id: 'agents',
    label: 'Agents',
    icon: 'Bot',
    templates: [
      {
        id: 'chat-agent-template',
        type: 'agent',
        subType: 'chat-agent',
        label: 'Chat Agent',
        description: 'Conversational AI assistant',
        icon: 'MessageSquare',
        defaultParameters: { personality: 'helpful', memory: true }
      },
      {
        id: 'task-agent-template',
        type: 'agent',
        subType: 'task-agent',
        label: 'Task Agent',
        description: 'Autonomous task executor',
        icon: 'CheckSquare',
        defaultParameters: { goals: [], tools: [] }
      },
      {
        id: 'analysis-agent-template',
        type: 'agent',
        subType: 'analysis-agent',
        label: 'Analysis Agent',
        description: 'Data analysis and insights',
        icon: 'BarChart3',
        defaultParameters: { dataSource: '', analysisType: 'summary' }
      }
    ]
  }
];

interface WorkflowSidebarProps {
  onDragStart: (event: React.DragEvent, nodeType: NodeTemplate) => void;
  onAddNode: (template: NodeTemplate) => void;
  selectedNodeId?: string;
  onNodeSelect?: (nodeId: string | null) => void;
}

export const WorkflowSidebar: React.FC<WorkflowSidebarProps> = ({ 
  onDragStart, 
  onAddNode,
  selectedNodeId,
  onNodeSelect 
}) => {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    triggers: true,
    tools: true,
    actions: false,
    agents: false,
  });

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleAddNode = (template: NodeTemplate) => {
    onAddNode(template);
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-semibold mb-4 text-foreground">Node Library</h3>
        <div className="space-y-2">
          {nodeCategories.map((category) => {
            const CategoryIcon = iconMap[category.icon as keyof typeof iconMap];
            const isOpen = openCategories[category.id];
            
            return (
              <Collapsible 
                key={category.id} 
                open={isOpen} 
                onOpenChange={() => toggleCategory(category.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-3 h-auto hover:bg-accent"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded workflow-node node-${category.id.slice(0, -1)}`}>
                        <CategoryIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <span className="font-medium text-sm">{category.label}</span>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {category.templates.length}
                        </Badge>
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="space-y-1 mt-1 ml-4">
                  {category.templates.map((template) => {
                    const TemplateIcon = iconMap[template.icon as keyof typeof iconMap];
                    
                    return (
                      <Card
                        key={template.id}
                        className="p-2 cursor-grab hover:shadow-md transition-shadow bg-card border-border group"
                        draggable
                        onDragStart={(event) => onDragStart(event, template)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className={`p-1.5 rounded workflow-node node-${template.type} flex-shrink-0`}>
                              <TemplateIcon className="w-3 h-3 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-xs text-card-foreground truncate">
                                {template.label}
                              </h4>
                              <p className="text-xs text-muted-foreground truncate">
                                {template.description}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddNode(template);
                            }}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </div>
    </div>
  );
};