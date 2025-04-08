import React, { useCallback, useEffect, useMemo } from "react";
import { useState } from "react";
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
import TaskDetails from "./TaskDetails";

const nodeWidth = 172;
const nodeHeight = 36;

const dagreGraph = new dagre.graphlib.Graph();  //dagre helps with layout if objects dont have position arleady
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes, edges, direction = "LR") => { //we won't need this if we put positions in db
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
  

const MapView = ({ tasks, onCreateTask, onUpdateTask, onTaskClick, setShowTaskModal, setMapClickPosition, deleteTask, workspace }) => {
  const nodesFromTasks = useMemo(() => { //turn the tasks into draggable objects
    return tasks.map((task) => ({
      id: task.id,
      type: "default",
      data: { label: task.title || "Untitled Task" },
      position: task.position || { x: Math.random() * 200, y: Math.random() * 200 }, //here is where we need to get position from database instead
    }));
  }, [tasks]);

  const edgesFromTasks = useMemo(() => { //this is where i'm trying to draw edges, i think its not working because parent task stuff isnt working 
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
  const [nodes, setNodes, onNodesChange] = useNodesState(layouted);  //stores nodes in frontend
  const [edges, setEdges, onEdgesChange] = useEdgesState(edgesFromTasks); //stores edges in frontend
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    setEdges(edgesFromTasks);
  }, [edgesFromTasks]);

  useEffect(() => {
    const updatedNodes = tasks.map((task) => ({
      id: task.id,
      type: "default",
      data: { label: task.title || "Untitled Task" },
      position: task.position || { x: Math.random() * 200, y: Math.random() * 200 },
    }));
    setNodes(updatedNodes);
  }, [tasks, setNodes]);
  

  const onNodeDragStop = useCallback( //updates stuff when drag is done
    async (_, node) => {
      try {
        await onUpdateTask({ id: node.id, position: node.position });
      } catch (err) {
        console.error("Error saving node position:", err);
      }
    },
    [onUpdateTask]
  );

  const onConnect = useCallback( //this is supposed to set parents via dragging but its not working yet
    async (connection) => {
      const { source, target } = connection;
      try {
        await onUpdateTask({ id: target, parentTaskId: source });
      } catch (err) {
        console.error("Failed to update task dependency:", err); //we get this
      }
    },
    [onUpdateTask]
  );

  const onPaneClick = useCallback( //creates new task
    (event) => {
      const bounds = event.target.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      setMapClickPosition({ x, y });
      setShowTaskModal(true);
    },
    [setMapClickPosition, setShowTaskModal]
  );

  const onNodeClick = (_, node) => { //this opens the detailed view
    const task = tasks.find((t) => t.id === node.id);
    if (task) {
        setSelectedTask(task);
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
                    newSubtask.position || {}
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
