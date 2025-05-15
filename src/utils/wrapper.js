import * as api from "./api";

// HACK: until back end serialization is working
export const getOid = (reference) => reference["$oid"];
export const getId = (document) => getOid(document._id);

export async function getTaskDependencies(workspace, task) {
    let dependencies = await api.getDependencies(getId(workspace), task.dependencies);
    /*
     * Quick note to make sense of all this:
     *  - In a subtask relationship, supertasks tasks depend on their subtasks. Equivalently, supertasks are dependents and subtasks are dependees.
     *  - In a blocking relationship, blockees depend on their blockers. Equivalently, blockees are dependents and blockers are dependees.
     */
    let blockees = [];
    let blockers = [];
    let supertasks = [];
    let subtasks = [];
    for (let dependency of dependencies) {
        if (dependency.manner === "Blocking") {
            if (dependency.dependee === task.id) {
                blockees.push(dependency.dependent); // I am the dependee => I am the blocker => You are my blockee
            } else {
                blockers.push(dependency.dependee); // I am the dependent => I am the blockee => You are my blocker
            }
        } else if (dependency.manner === "Subtask") {
            if (dependency.dependee === task.id) {
                supertasks.push(dependency.dependent); // I am the dependee => I am the subtask => You are my supertask
            } else {
                subtasks.push(dependency.dependee); // I am the dependent => I am the supertask => You are my subtask
            }
        } else {
            throw Error(`Unrecognized dependency manner ${dependency.manner}`)
        }
    }

    return { blockees, blockers, subtasks, supertasks };
}
