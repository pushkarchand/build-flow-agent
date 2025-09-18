import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { WorkflowNodeData, NodeType } from '@/types/workflow';
import { NodeContextMenu } from './ContextMenu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Bot,
  Wrench,
  Zap,
  Play,
  Edit3,
  Check,
  X,
} from 'lucide-react';

interface CustomNodeProps extends NodeProps {
  data: WorkflowNodeData;
}

const nodeIcons: Record<NodeType, React.ElementType> = {
  agent: Bot,
  tool: Wrench,
  trigger: Zap,
  action: Play,
};

const nodeStyles: Record<NodeType, string> = {
  agent: 'node-agent',
  tool: 'node-tool',
  trigger: 'node-trigger',
  action: 'node-action',
};

export const CustomNode: React.FC<CustomNodeProps> = ({ 
  data, 
  selected, 
  id,
  xPos,
  yPos 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempLabel, setTempLabel] = useState(data.label);
  
  const Icon = nodeIcons[data.type];
  const nodeStyle = nodeStyles[data.type];

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTempLabel(data.label);
  };

  const handleSave = () => {
    data.label = tempLabel;
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempLabel(data.label);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleDelete = () => {
    // This will be handled by the parent component
    const event = new CustomEvent('delete-node', { detail: { nodeId: id } });
    window.dispatchEvent(event);
  };

  const handleDuplicate = () => {
    const event = new CustomEvent('duplicate-node', { 
      detail: { 
        nodeId: id, 
        position: { x: xPos + 250, y: yPos + 50 },
        data 
      } 
    });
    window.dispatchEvent(event);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setTempLabel(data.label);
  };

  return (
    <NodeContextMenu
      onDelete={handleDelete}
      onDuplicate={handleDuplicate}
      onEdit={handleEdit}
    >
      <div
        className={`workflow-node ${nodeStyle} p-4 min-w-[200px] text-white group ${
          selected ? 'ring-2 ring-ring' : ''
        }`}
        onDoubleClick={handleDoubleClick}
      >
        {/* Input handles */}
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 !bg-white !border-2 !border-gray-300"
        />
        
        {/* Node content */}
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 flex-shrink-0" />
          
          {isEditing ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={tempLabel}
                onChange={(e) => setTempLabel(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 h-8 text-sm bg-white/20 border-white/30 text-white placeholder:text-white/70"
                autoFocus
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                onClick={handleSave}
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                onClick={handleCancel}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex-1">
              <h3 className="font-medium text-sm">{data.label}</h3>
              {data.description && (
                <p className="text-xs text-white/80 mt-1">{data.description}</p>
              )}
            </div>
          )}
          
          {!isEditing && (
            <Edit3 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>

        {/* Output handles */}
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 !bg-white !border-2 !border-gray-300"
        />
      </div>
    </NodeContextMenu>
  );
};