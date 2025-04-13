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
  dependencies = [],
  onCreateTask,
  onCreateDependency,
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

  //console.log("Full dependency objects:", dependencies);
  const edgesFromDependencies = useMemo(() => {
    const normalizeId = (obj) => {
      if (!obj) return undefined;
      if (typeof obj === "string") return obj;
      if (obj.$oid) return obj.$oid;
      return obj;
    };
  
    return dependencies.map((dep) => {
      const source = normalizeId(dep.depended_on_task);
      const target = normalizeId(dep.dependent_task);
  
      console.log("Resolved edge:", source, "->", target);
  
      return {
        id: `e-${source}-${target}`,
        source,
        target,
        animated: true,
        style: { stroke: "#555" },
        markerEnd: {
          type: 'arrowclosed',
          color: '#555',
        },
      };
    });
  }, [dependencies]);
  
  
  
  
  


  const layouted = useMemo(() => getLayoutedElements(nodesFromTasks, edgesFromDependencies), [nodesFromTasks, edgesFromDependencies]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(edgesFromDependencies);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(layouted);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const updated = getLayoutedElements(nodesFromTasks, edgesFromDependencies);
  
    setNodes(updated);
  
    setEdges([]);
    setTimeout(() => {
      setEdges(edgesFromDependencies);
    }, 0);
  }, [nodesFromTasks, edgesFromDependencies]);
  
  

  const onNodeDragStop = useCallback(async (_, node) => {
    try {
      const draggedTask = tasks.find((t) => t.id === node.id || t._id?.$oid === node.id);
      if (!draggedTask) return;

      console.log("(!DRAG!) Updating task with payload:", {
        id: node.id,
        name: draggedTask.title,
        description: draggedTask.description || "",
        tags: draggedTask.tags || [],
        due_date: draggedTask.due_date || "",
        workspace_id: draggedTask.workspace_id,
        x_location: String(node.position.x),
        y_location: String(node.position.y),
      });
      
      await onUpdateTask({
        id: node.id,
        name: draggedTask.title,
        description: draggedTask.description || "",
        tags: draggedTask.tags || [],
        due_date: draggedTask.due_date || "",
        workspace_id: workspace?.id || workspace?._id?.$oid || draggedTask.workspace_id,
        x_location: String(node.position.x),
        y_location: String(node.position.y),
      });
    } catch (err) {
      console.error("Error saving node position:", err);
    }
  }, [tasks, onUpdateTask]);

  const onConnect = useCallback(async ({ source, target }) => {
    try {
      const targetTask = tasks.find((t) => t.id === target || t._id?.$oid === target);
      if (!targetTask) return;

      await onCreateDependency({
        source,
        target,
        workspace_id: workspace?.id,
      });
      

    } catch (err) {
      console.error("Failed to update task dependency:", err);
    }
  }, [tasks, onUpdateTask]);

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
  console.log("Node IDs:", nodes.map(n => n.id));
console.log("Edge source-target pairs:", edges.map(e => `${e.source} -> ${e.target}`));



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
                null,
                false,
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
