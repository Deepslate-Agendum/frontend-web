import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import TaskDetails from "./TaskDetails";
import "../../css/MapView.css";

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

const MapViewContent = ({
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
  setIsDragging,
  setDraggedNode,
}) => {
  const { screenToFlowPosition, fitView } = useReactFlow();
  const [selectedTask, setSelectedTask] = useState(null);

  const nodesFromTasks = useMemo(() => {
    return tasks.map((task) => {
      const id = task.id || task._id?.$oid;
      return {
        id,
        type: "default",
        data: { label: task.title || "Untitled Task" },
        position: {
          x: task.x_location !== undefined ? parseFloat(task.x_location) : Math.random() * 200,
          y: task.y_location !== undefined ? parseFloat(task.y_location) : Math.random() * 200,
        },
        sourcePosition: "right",
        targetPosition: "left",
      };
    });
  }, [tasks]);

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
      return {
        id: `e-${source}-${target}`,
        source,
        target,
        animated: true,
        style: { stroke: "#555" },
        markerEnd: { type: "arrowclosed", color: "#555" },
      };
    });
  }, [dependencies]);

  const layouted = useMemo(
    () => getLayoutedElements(nodesFromTasks, edgesFromDependencies),
    [nodesFromTasks, edgesFromDependencies]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layouted);
  const [edges, setEdges, onEdgesChange] = useEdgesState(edgesFromDependencies);

  useEffect(() => {
    const updated = getLayoutedElements(nodesFromTasks, edgesFromDependencies);
    setNodes(updated);
    setEdges([]);
    setTimeout(() => {
      setEdges(edgesFromDependencies);
      fitView();
    }, 0);
  }, [nodesFromTasks, edgesFromDependencies]);

  useEffect(() => {
      // Lock scrolling when MapView mounts
      document.body.style.overflow = "hidden";

      // Unlock when MapView unmounts
      return () => {
        document.body.style.overflow = "auto";
      };
    }, []);


  const onNodeDragStart = useCallback((_, node) => {
    setIsDragging(true);
    setDraggedNode(node);
  }, []);

  const onNodeDragStop = useCallback(async (event, node) => {
    setIsDragging(false);
    setDraggedNode(null);

    const trash = document.getElementById("trashcan");
    if (trash) {
      const trashBounds = trash.getBoundingClientRect();
      const { clientX, clientY } = event;

      if (
        clientX >= trashBounds.left &&
        clientX <= trashBounds.right &&
        clientY >= trashBounds.top &&
        clientY <= trashBounds.bottom
      ) {
        deleteTask(node.id);
        return;
      }
    }

    const draggedTask = tasks.find((t) => t.id === node.id || t._id?.$oid === node.id);
    if (!draggedTask) return;

    try {
      await onUpdateTask({
        id: node.id,
        name: draggedTask.title,
        description: draggedTask.description || "",
        tags: draggedTask.tags || [],
        due_date: draggedTask.due_date || "",
        workspace_id:
          workspace?.id || workspace?._id?.$oid || draggedTask.workspace_id,
        x_location: String(node.position.x),
        y_location: String(node.position.y),
      });
    } catch (err) {
      console.error("Error saving node position:", err);
    }
  }, [tasks, onUpdateTask]);

  const onConnect = useCallback(async ({ source, target }) => {
    const targetTask = tasks.find((t) => t.id === target || t._id?.$oid === target);
    if (!targetTask) return;

    try {
      await onCreateDependency({
        source,
        target,
        workspace_id: workspace?.id,
      });
    } catch (err) {
      console.error("Failed to update task dependency:", err);
    }
  }, [tasks, onCreateDependency]);

  const onPaneClick = useCallback((event) => {
    const flowPosition = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    setMapClickPosition(flowPosition);
    setShowTaskModal(true);
  }, [screenToFlowPosition, setMapClickPosition, setShowTaskModal]);

  const onNodeClick = (_, node) => {
    const task = tasks.find((t) => t.id === node.id || t._id?.$oid === node.id);
    if (task) setSelectedTask(task);
  };

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        onNodeClick={onNodeClick}
        fitView
      >
        <Controls position="bottom-left" style={{ zIndex: 1000 }} />
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
    </>
  );
};

const MapView = (props) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNode, setDraggedNode] = useState(null);

  return (
    <div
      style={{
        position: "fixed",
        top: "60px",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1, 
        overflow: "hidden",
      }}
    >
      <ReactFlowProvider>
        <MapViewContent
          {...props}
          setIsDragging={setIsDragging}
          setDraggedNode={setDraggedNode}
        />

        {/* Trashcan */}
        <div
          id="trashcan"
          style={{
            position: "absolute",
            bottom: 90, // slightly higher
            left: 20,
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "rgba(255, 0, 0, 0.6)",
            color: "white",
            display: isDragging ? "flex" : "none",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 18,
            zIndex: 1000,
          }}
        >
          ❌
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default MapView;
