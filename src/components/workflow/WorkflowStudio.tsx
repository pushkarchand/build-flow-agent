import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Connection, 
  addEdge, 
  MarkerType, 
  Edge, 
  useNodesState, 
  useEdgesState,
  OnNodesChange,
  OnEdgesChange 
} from 'reactflow';
import { WorkflowCanvas } from './WorkflowCanvas';
import { WorkflowSidebar } from './WorkflowSidebar';
import { NodeConfigPanel } from './NodeConfigPanel';
import { WorkflowNode, WorkflowNodeData, NodeTemplate, NodeType } from '@/types/workflow';
import { isValidConnection } from '@/utils/connectionValidation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Play,
  Save,
  Upload,
  Download,
  Trash2,
  Settings,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

let nodeId = 0;
const getId = () => `node_${nodeId++}`;

export const WorkflowStudio: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Listen for custom events from nodes
  useEffect(() => {
    const handleDeleteNode = (event: any) => {
      const { nodeId } = event.detail;
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
      toast({
        title: "Node Deleted",
        description: "The node and its connections have been removed.",
      });
    };

    const handleDuplicateNode = (event: any) => {
      const { nodeId, position, data } = event.detail;
      const newNode = {
        id: getId(),
        type: 'custom' as const,
        position,
        data: { ...data, label: `${data.label} (Copy)` },
      };
      setNodes((nds) => [...nds, newNode]);
      toast({
        title: "Node Duplicated",
        description: "A copy of the node has been created.",
      });
    };

    window.addEventListener('delete-node', handleDeleteNode);
    window.addEventListener('duplicate-node', handleDuplicateNode);

    return () => {
      window.removeEventListener('delete-node', handleDeleteNode);
      window.removeEventListener('duplicate-node', handleDuplicateNode);
    };
  }, [toast, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      // Validate connection
      const validation = isValidConnection(params, nodes);
      
      if (!validation.isValid) {
        toast({
          title: "Invalid Connection",
          description: validation.reason,
          variant: "destructive",
        });
        return;
      }

      const newEdge = {
        ...params,
        id: `edge_${params.source}_${params.target}`,
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#8b5cf6',
        },
        style: {
          stroke: '#8b5cf6',
          strokeWidth: 2,
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
      
      toast({
        title: "Connection Added",
        description: "Nodes have been successfully connected.",
      });
    },
    [nodes, toast]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const template: NodeTemplate = JSON.parse(
        event.dataTransfer.getData('application/reactflow')
      );

      if (typeof template === 'undefined' || !template) {
        return;
      }

      const position = {
        x: event.clientX - (reactFlowBounds?.left ?? 0),
        y: event.clientY - (reactFlowBounds?.top ?? 0),
      };

      const newNode = {
        id: getId(),
        type: 'custom' as const,
        position,
        data: {
          label: template.label,
          type: template.type,
          description: template.description,
          parameters: template.defaultParameters || {},
        },
      };

      setNodes((nds) => nds.concat(newNode));
      
      toast({
        title: "Node Added",
        description: `${template.label} node has been added to the workflow.`,
      });
    },
    []
  );

  const onDragStart = (event: React.DragEvent, nodeType: NodeTemplate) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onAddNode = useCallback(
    (template: NodeTemplate) => {
      const position = {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      };

      const newNode = {
        id: getId(),
        type: 'custom' as const,
        position,
        data: {
          label: template.label,
          type: template.type,
          subType: template.subType,
          description: template.description,
          parameters: template.defaultParameters || {},
        },
      };

      setNodes((nds) => nds.concat(newNode));
      
      toast({
        title: "Node Added",
        description: `${template.label} node has been added to the workflow.`,
      });
    },
    [toast, setNodes]
  );

  const onUpdateNode = useCallback(
    (nodeId: string, updates: Partial<WorkflowNodeData>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...updates } }
            : node
        )
      );
      
      toast({
        title: "Node Updated",
        description: "Node configuration has been saved.",
      });
    },
    [setNodes, toast]
  );

  const selectedNode = selectedNodeId ? nodes.find(node => node.id === selectedNodeId) : null;

  const handleSaveWorkflow = () => {
    const workflow = { nodes, edges };
    const dataStr = JSON.stringify(workflow, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `workflow_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Workflow Saved",
      description: "Your workflow has been exported successfully.",
    });
  };

  const handleClearWorkflow = () => {
    setNodes([]);
    setEdges([]);
    toast({
      title: "Workflow Cleared",
      description: "All nodes and connections have been removed.",
    });
  };

  const handleRunWorkflow = () => {
    if (nodes.length === 0) {
      toast({
        title: "No Workflow",
        description: "Please add some nodes to run the workflow.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Workflow Started",
      description: "Your workflow execution has begun.",
    });
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Card className="w-80 rounded-none border-r border-border bg-card">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-card-foreground">
              Workflow Studio
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Build AI-powered workflows
            </p>
          </div>

          {/* Actions */}
          <div className="p-4 border-b border-border">
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleRunWorkflow}
                size="sm"
                className="bg-node-agent hover:bg-node-agent/90"
              >
                <Play className="w-4 h-4 mr-2" />
                Run
              </Button>
              <Button onClick={handleSaveWorkflow} variant="outline" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Load
              </Button>
              <Button
                onClick={handleClearWorkflow}
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>

          {/* Node Library */}
          <div className="flex-1 overflow-y-auto">
            <WorkflowSidebar 
              onDragStart={onDragStart} 
              onAddNode={onAddNode}
              selectedNodeId={selectedNodeId}
              onNodeSelect={setSelectedNodeId}
            />
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Canvas */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <WorkflowCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeSelect={setSelectedNodeId}
        />
      </div>

      {/* Configuration Panel */}
      {selectedNode && (
        <NodeConfigPanel
          node={selectedNode}
          onUpdateNode={onUpdateNode}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  );
};