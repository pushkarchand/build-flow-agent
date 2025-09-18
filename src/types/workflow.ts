import { Node, Edge } from 'reactflow';

export type NodeType = 'agent' | 'tool' | 'trigger' | 'action';
export type NodeSubType = 
  // Triggers
  | 'http-trigger' | 'time-trigger' | 'webhook-trigger' | 'file-trigger'
  // Tools  
  | 'api-call' | 'database-query' | 'llm-agent' | 'email-tool' | 'file-processor'
  // Actions
  | 'send-email' | 'update-database' | 'webhook-call' | 'file-upload'
  // Agents
  | 'chat-agent' | 'task-agent' | 'analysis-agent';

export interface WorkflowNodeData {
  label: string;
  type: NodeType;
  subType?: NodeSubType;
  description?: string;
  parameters?: Record<string, any>;
  isEditing?: boolean;
}

export type WorkflowNode = Node<WorkflowNodeData>;

export interface NodeTemplate {
  id: string;
  type: NodeType;
  subType?: NodeSubType;
  label: string;
  description: string;
  icon: string;
  defaultParameters?: Record<string, any>;
}

export interface NodeCategory {
  id: string;
  label: string;
  icon: string;
  templates: NodeTemplate[];
}

export interface WorkflowState {
  nodes: WorkflowNode[];
  edges: Edge[];
}