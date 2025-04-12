import * as api from "./utils/api";

// HACK: until back end serialization is working
const getId = (document) => document._id["$oid"];

async function getTaskDependencies(task) {
    let dependencies = await api.getDependencies(task.dependencies);
    let blocks = []; // I am the dependee of a "Blocking" dependency (= the blockee depends on me)
    let blockers = []; // I am the dependant of a "Blocking" dependency (= I depend on my blockers)
    let subtasks = []; // I am the dependee of a "Subtask" dependency (= the subtask depends on me)
    let parents = []; // I am the dependant of a "Subtask" dependency (= I depend on my parents)
    for (let dependency of dependencies) {
        if (dependency.manner === "Blocking") {
            if (getId(dependency.dependee) === getId(task)) {
                blocks.push(getId(dependency.dependent));
            } else {
                blockers.push(getId(dependency.dependee));
            }
        } else if (dependency.manner === "Subtask") {
            if (getId(dependency.dependee) === getId(task)) {
                subtasks.push(getId(dependency.dependent));
            } else {
                parents.push(getId(dependency.dependee));
            }
        } else {
            throw Error(`Unrecognized dependency manner ${dependency.manner}`)
        }
    }

    return { blocks, blockers, subtasks, parents };
}

export const getDependentTasks = async (parentTaskId) => {
};

export const getSubtasks = async (parentTaskId) => {
};

export const getParentTask = async (subtaskId) => {
};
