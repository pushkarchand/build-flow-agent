import { Node, Edge } from 'reactflow';

export type NodeType = 'agent' | 'tool' | 'trigger' | 'action';

export interface WorkflowNodeData {
  label: string;
  type: NodeType;
  description?: string;
  parameters?: Record<string, any>;
  isEditing?: boolean;
}

export type WorkflowNode = Node<WorkflowNodeData>;

export interface NodeTemplate {
  id: string;
  type: NodeType;
  label: string;
  description: string;
  icon: string;
  defaultParameters?: Record<string, any>;
}

export interface WorkflowState {
  nodes: WorkflowNode[];
  edges: Edge[];
}