import * as api from "./api";

// HACK: until back end serialization is working
export const getOid = (reference) => reference["$oid"];
export const getId = (document) => getOid(document._id);

export async function getTaskDependencies(workspace, task) {
    let dependencies = await api.getDependencies(getId(workspace), task.dependencies);
    let blocks = []; // I am the dependee of a "Blocking" dependency (= the blockee depends on me)
    let blockers = []; // I am the dependant of a "Blocking" dependency (= I depend on my blockers)
    let subtasks = []; // I am the dependee of a "Subtask" dependency (= the subtask depends on me)
    let parents = []; // I am the dependant of a "Subtask" dependency (= I depend on my parents)
    for (let dependency of dependencies) {
        // if (dependency.manner === "Blocking") {
            if (getOid(dependency.depended_on_task) === task.id) {
                blocks.push(getOid(dependency.dependent_task));
            } else {
                blockers.push(getOid(dependency.depended_on_task));
            }
        // } else if (dependency.manner === "Subtask") {
        //     if (getId(dependency.depended_on_task) === getId(task)) {
        //         subtasks.push(getId(dependency.dependent_task));
        //     } else {
        //         parents.push(getId(dependency.depended_on_task));
        //     }
        // } else {
        //     throw Error(`Unrecognized dependency manner ${dependency.manner}`)
        // }
    }

    return { blocks, blockers, subtasks, parents };
}
