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
import { getId } from "../utils/wrapper";

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
  onDeleteDependency,
  onUpdateTask,
  onTaskClick,
  setShowTaskModal,
  setMapClickPosition,
  deleteTask,
  workspace,
  setIsDragging,
  setDraggedNode,
  toggleTaskCompletion = () => {},
}) => {
  const { screenToFlowPosition } = useReactFlow();
  const [selectedTask, setSelectedTask] = useState(null);

  const nodesFromTasks = useMemo(() => {
    return tasks.map((task) => {
      const id = String(task.id || task._id?.$oid);
      return {
        id,
        type: "default",
        className: task.status === "Complete" ? "completed-node" : "",
        data: {
          label: task.title || "Untitled Task",
          completed: task.status === "Complete",
        },
        position: {
          x: task.x_location !== undefined ? parseFloat(task.x_location) : Math.random() * 200,
          y: task.y_location !== undefined ? parseFloat(task.y_location) : Math.random() * 200,
        },
        sourcePosition: "right",
        targetPosition: "left",
      };
    });
  }, [tasks]);
  

  const nodeIds = useMemo(
    () => new Set(tasks.map((task) => String(task.id || task._id?.$oid))),
    [tasks]
  );

  const edgesFromDependencies = useMemo(() => {
    const normalizeId = (obj) =>
      typeof obj === "string"
        ? obj
        : obj?.id || obj?._id?.$oid || obj?.$oid || "";

    return dependencies
      .map((dep) => {
        const source = String(normalizeId(dep.dependee));
        const target = String(normalizeId(dep.dependent));
        return {
          id: `e-${source}-${target}`,
          source,
          target,
          type: "default",
          animated: true,
          style: { stroke: "#555" },
          markerEnd: {
            type: "arrowclosed",
            width: 20,
            height: 20,
            color: "#555",
          },
        };
        
      })
      .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));
  }, [dependencies, nodeIds]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  useEffect(() => {
    if (!tasks || tasks.length === 0) return;
  
    const updatedNodes = tasks.map((task) => {
      const id = String(task.id || task._id?.$oid);
      const completed = task.status === "Complete";
      return {
        id,
        type: "default",
        className: completed ? "completed-node" : "",
        data: {
          label: (
            <div>
              <strong style={{ textDecoration: completed ? "line-through" : "none" }}>
                {task.title || "Untitled Task"}
              </strong>
            </div>
          )
        },
        position: {
          x: task.x_location !== undefined ? parseFloat(task.x_location) : Math.random() * 200,
          y: task.y_location !== undefined ? parseFloat(task.y_location) : Math.random() * 200,
        },
        sourcePosition: "right",
        targetPosition: "left",
      };
    });
  
    const layouted = getLayoutedElements(updatedNodes, edgesFromDependencies);
    setNodes(layouted);
    setEdges(edgesFromDependencies);
  }, [tasks, dependencies]);
  

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
    const sourceTask = tasks.find((t) => t.id === source || t._id?.$oid === source);
    const targetTask = tasks.find((t) => t.id === target || t._id?.$oid === target);
    if (!sourceTask || !targetTask) return;
  
    try {
      await onCreateDependency({
        workspace_id: getId(workspace),
        dependeeId: target,
        dependentId: source,
        manner: "Blocking",
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
    if (!task) return;

    if (window.innerWidth <= 768) {
      setSelectedTask(task);
    } else {
      onTaskClick(task);
    }
  };
  
  
  const handleEdgeClick = useCallback((event, edge) => {
    event.stopPropagation();
    if (window.confirm("Delete this dependency?")) {
      const [, dependeeId, dependentId] = edge.id.split("-");
      onDeleteDependency({
        workspace_id: getId(workspace),
        dependeeId,
        dependentId,
      });
    }
  }, [workspace, onDeleteDependency]);
  

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
        onEdgeClick={handleEdgeClick}
        onNodeDoubleClick={(_, node) => {
          toggleTaskCompletion(node.id);
        }}
        
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
          toggleTaskCompletion={toggleTaskCompletion}        
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
          toggleTaskCompletion={props.toggleTaskCompletion}
        />

        <div
          id="trashcan"
          style={{
            position: "absolute",
            bottom: 90,
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
