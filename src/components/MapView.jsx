import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import TaskDetails from "./TaskDetails";
import '../../css/MapView.css';

const nodeWidth = 172;
const nodeHeight = 36;

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes, edges, direction = "LR") => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));
  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const dagrePos = dagreGraph.node(node.id);
    return {
      ...node,
      position: node.position?.x !== undefined
        ? node.position
        : {
            x: dagrePos.x - nodeWidth / 2,
            y: dagrePos.y - nodeHeight / 2,
          },
      sourcePosition: "right",
      targetPosition: "left",
    };
  });
};

const MapView = ({
  tasks,
  onCreateTask,
  onUpdateTask,
  onTaskClick,
  setShowTaskModal,
  setMapClickPosition,
  deleteTask,
  workspace,
}) => {
  const nodesFromTasks = useMemo(() => {
    return tasks.map((task) => {
      const id = task.id || task._id?.$oid;
      return {
        id,
        type: "default",
        data: { label: task.title || "Untitled Task" },
        position: {
          x: parseFloat(task.x_location) || Math.random() * 200,
          y: parseFloat(task.y_location) || Math.random() * 200,
        },
        sourcePosition: "right",
        targetPosition: "left",
      };
    });
  }, [tasks]);

  const edgesFromTasks = useMemo(() => {
    return tasks.flatMap((task) => {
      const targetId = task.id || task._id?.$oid;
      return (task.dependencies || []).map((sourceId) => ({
        id: `e-${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        animated: true,
        style: { stroke: "#555" },
        markerEnd: {
          type: 'arrowclosed',
          color: '#555',
        },
      }));
    });
  }, [tasks]);

  const layouted = useMemo(() => getLayoutedElements(nodesFromTasks, edgesFromTasks), [nodesFromTasks, edgesFromTasks]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layouted);
  const [edges, setEdges, onEdgesChange] = useEdgesState(edgesFromTasks);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    setEdges(edgesFromTasks);
  }, [edgesFromTasks]);

  useEffect(() => {
    setNodes(layouted);
  }, [layouted, setNodes]);

  const onNodeDragStop = useCallback(async (_, node) => {
    try {
      await onUpdateTask({
        id: node.id,
        x_location: String(node.position.x),
        y_location: String(node.position.y),
      });
    } catch (err) {
      console.error("Error saving node position:", err);
    }
  }, [onUpdateTask]);

  const onConnect = useCallback(async (connection) => {
    const { source, target } = connection;
    try {
      await onUpdateTask({ id: target, parentTaskId: source });
    } catch (err) {
      console.error("Failed to update task dependency:", err);
    }
  }, [onUpdateTask]);

  const onPaneClick = useCallback((event) => {
    const bounds = event.target.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    setMapClickPosition({ x, y });
    setShowTaskModal(true);
  }, [setMapClickPosition, setShowTaskModal]);

  const onNodeClick = (_, node) => {
    const task = tasks.find((t) => t.id === node.id || t._id?.$oid === node.id);
    if (task) setSelectedTask(task);
  };

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={onNodeDragStop}
          onConnect={onConnect}
          onPaneClick={onPaneClick}
          onNodeClick={onNodeClick}
          fitView
        >
          <Controls />
          <Background gap={12} size={1} />
        </ReactFlow>
        {selectedTask && (
          <TaskDetails
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={(updatedData) => {
              onUpdateTask(updatedData);
              setSelectedTask(null);
            }}
            onDelete={(taskId) => {
              deleteTask(taskId);
              setSelectedTask(null);
            }}
            onCreateSubtask={(parentId, newSubtask) => {
              onCreateTask(
                newSubtask.title,
                newSubtask.description,
                newSubtask.tags,
                newSubtask.due_date,
                workspace?.id,
                parentId,
                newSubtask.dependent,
                {
                  x: String(newSubtask.position?.x || 0),
                  y: String(newSubtask.position?.y || 0),
                }
              );
            }}
            workspace={workspace}
          />
        )}
      </ReactFlowProvider>
    </div>
  );
};

export default MapView;
