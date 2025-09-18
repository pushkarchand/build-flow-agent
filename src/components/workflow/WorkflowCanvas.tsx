import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  useReactFlow,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { CustomNode } from './CustomNode';
import { WorkflowNode, NodeTemplate } from '@/types/workflow';

const nodeTypes = {
  custom: CustomNode,
};

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  edges: Edge[];
  onNodesChange: (nodes: WorkflowNode[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  onConnect: (connection: Connection) => void;
  onDrop: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
}

const WorkflowCanvasInner: React.FC<WorkflowCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onDrop,
  onDragOver,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project } = useReactFlow();

  const onNodesChangeHandler = useCallback(
    (changes: any[]) => {
      // Handle nodes state changes and propagate to parent
      const updatedNodes = changes.reduce((acc, change) => {
        if (change.type === 'remove') {
          return acc.filter((node: WorkflowNode) => node.id !== change.id);
        }
        if (change.type === 'position') {
          return acc.map((node: WorkflowNode) =>
            node.id === change.id ? { ...node, position: change.position } : node
          );
        }
        if (change.type === 'select') {
          return acc.map((node: WorkflowNode) =>
            node.id === change.id ? { ...node, selected: change.selected } : node
          );
        }
        return acc;
      }, nodes);
      onNodesChange(updatedNodes);
    },
    [nodes, onNodesChange]
  );

  const onEdgesChangeHandler = useCallback(
    (changes: any[]) => {
      const updatedEdges = changes.reduce((acc, change) => {
        if (change.type === 'remove') {
          return acc.filter((edge: Edge) => edge.id !== change.id);
        }
        return acc;
      }, edges);
      onEdgesChange(updatedEdges);
    },
    [edges, onEdgesChange]
  );

  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={onEdgesChangeHandler}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        className="workflow-canvas"
      >
        <Controls className="bg-card border border-border" />
        <MiniMap
          className="bg-card border border-border"
          nodeColor={(node) => {
            const nodeType = (node as WorkflowNode).data.type;
            const colors = {
              agent: '#8b5cf6',
              tool: '#22c55e',
              trigger: '#f59e0b',
              action: '#06b6d4',
            };
            return colors[nodeType] || '#6b7280';
          }}
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          className="opacity-50"
        />
      </ReactFlow>
    </div>
  );
};

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
};