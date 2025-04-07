import React, { useCallback, useEffect, useMemo } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";

const nodeWidth = 172;
const nodeHeight = 36;

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes, edges, direction = "LR") => {
    const isHorizontal = direction === "LR";
    dagreGraph.setGraph({ rankdir: direction });
  
    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, {
        width: nodeWidth,
        height: nodeHeight,
      });
    });
  
    edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));
  
    dagre.layout(dagreGraph);
  
    return nodes.map((node) => {
      if (node.position && node.position.x !== undefined) {
        return node; 
      }
  
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - nodeWidth / 2,
          y: nodeWithPosition.y - nodeHeight / 2,
        },
        sourcePosition: isHorizontal ? "right" : "bottom",
        targetPosition: isHorizontal ? "left" : "top",
      };
    });
  };
  

const MapView = ({ tasks, onCreateTask, onUpdateTask, onTaskClick }) => {
  const nodesFromTasks = useMemo(() => {
    return tasks.map((task) => ({
      id: task.id,
      type: "default",
      data: { label: task.title || "Untitled Task" },
      position: task.position || { x: Math.random() * 200, y: Math.random() * 200 },
    }));
  }, [tasks]);

  const edgesFromTasks = useMemo(() => {
    return tasks
      .filter((task) => task.parentTaskId)
      .map((task) => ({
        id: `e-${task.parentTaskId}-${task.id}`,
        source: task.parentTaskId,
        target: task.id,
        animated: true,
        style: { stroke: "#555" },
      }));
  }, [tasks]);

  const layouted = useMemo(() => getLayoutedElements(nodesFromTasks, edgesFromTasks), [nodesFromTasks, edgesFromTasks]);
  const [nodes, setNodes, onNodesChange] = useNodesState(layouted);  
  const [edges, setEdges, onEdgesChange] = useEdgesState(edgesFromTasks);
  useEffect(() => {
    setEdges(edgesFromTasks); // 🔄 Update edges when tasks change
  }, [edgesFromTasks]);

  const onNodeDragStop = useCallback(
    async (_, node) => {
      try {
        await onUpdateTask({ id: node.id, position: node.position });
      } catch (err) {
        console.error("Error saving node position:", err);
      }
    },
    [onUpdateTask]
  );

  const onConnect = useCallback(
    async (connection) => {
      const { source, target } = connection;
      try {
        await onUpdateTask({ id: target, parentTaskId: source });
      } catch (err) {
        console.error("Failed to update task dependency:", err);
      }
    },
    [onUpdateTask]
  );

  const onPaneClick = useCallback(
    async (event) => {
      const bounds = event.target.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const title = prompt("Enter title for new task:");
      if (!title) return;

      try {
        const position = { x, y };
        const newTask = await onCreateTask(title, "", [], "", position, null, false);
        const newNode = {
            id: newTask.id,
            type: "default",
            data: { label: newTask.title },
            position,
        };
        setNodes((nds) => [...nds, newNode]);

      } catch (err) {
        console.error("Error creating task:", err);
      }
    },
    [onCreateTask, setNodes]
  );

  const onNodeClick = (_, node) => {
    const task = tasks.find((t) => t.id === node.id);
    if (task) {
      onTaskClick(task); // Always open detail view, no screen size check
    }
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
          <MiniMap />
          <Controls />
          <Background gap={12} size={1} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default MapView;
