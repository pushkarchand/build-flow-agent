import { WorkflowNode, NodeType } from '@/types/workflow';
import { Connection } from 'reactflow';

/**
 * Validates if a connection between two nodes is allowed
 */
export const isValidConnection = (
  connection: Connection,
  nodes: WorkflowNode[]
): { isValid: boolean; reason?: string } => {
  const sourceNode = nodes.find(node => node.id === connection.source);
  const targetNode = nodes.find(node => node.id === connection.target);

  if (!sourceNode || !targetNode) {
    return { isValid: false, reason: 'Source or target node not found' };
  }

  const sourceType = sourceNode.data.type;
  const targetType = targetNode.data.type;

  // Define allowed connections
  const allowedConnections: Record<NodeType, NodeType[]> = {
    trigger: ['tool', 'action', 'agent'],
    tool: ['tool', 'action', 'agent'],
    agent: ['tool', 'action', 'agent'],
    action: [], // Actions are typically end nodes
  };

  const allowedTargets = allowedConnections[sourceType];
  
  if (!allowedTargets.includes(targetType)) {
    return {
      isValid: false,
      reason: `${sourceType} nodes cannot connect to ${targetType} nodes`
    };
  }

  // Prevent self-connections
  if (connection.source === connection.target) {
    return { isValid: false, reason: 'Cannot connect node to itself' };
  }

  // Check for cycles (simple check - could be made more sophisticated)
  if (wouldCreateCycle(connection, nodes)) {
    return { isValid: false, reason: 'Connection would create a cycle' };
  }

  return { isValid: true };
};

/**
 * Simple cycle detection
 */
const wouldCreateCycle = (connection: Connection, nodes: WorkflowNode[]): boolean => {
  // This is a simplified cycle detection
  // In a production app, you'd want a more robust algorithm
  
  // For now, just prevent direct back-connections
  const existingConnections = getExistingConnections(nodes);
  
  // Check if target already connects back to source
  return existingConnections.some(
    conn => conn.source === connection.target && conn.target === connection.source
  );
};

/**
 * Get existing connections from nodes (this would typically come from edges)
 */
const getExistingConnections = (nodes: WorkflowNode[]): Connection[] => {
  // This is a placeholder - in reality, you'd get this from the edges state
  // For now, return empty array
  return [];
};

/**
 * Get connection validation rules for display
 */
export const getConnectionRules = (): Record<NodeType, { canConnectTo: NodeType[]; description: string }> => {
  return {
    trigger: {
      canConnectTo: ['tool', 'action', 'agent'],
      description: 'Triggers can start workflows by connecting to tools, actions, or agents'
    },
    tool: {
      canConnectTo: ['tool', 'action', 'agent'],
      description: 'Tools can process data and connect to other tools, actions, or agents'
    },
    agent: {
      canConnectTo: ['tool', 'action', 'agent'],
      description: 'Agents can use tools and execute actions, or delegate to other agents'
    },
    action: {
      canConnectTo: [],
      description: 'Actions are typically end nodes that execute final operations'
    }
  };
};