
import socketInfoHelper from '../helpers/socketInfoHelper';
import _ from "lodash";
import socketInfo from "../models/socketInfo";

export async function getRoomsToLeaveForaSocket(socket) {
    let filters = {};
    filters.query = {
        socket: {$eq: socket}
    }

    let existing_socket = await socketInfoHelper.getObjectByQuery(filters);


    if(existing_socket && !_.isEmpty(existing_socket)) {
        await socketInfoHelper.deleteObjectById(existing_socket._id);
        return existing_socket.rooms;
    } else {
        return [];
    }
}

export async function checkAndAddSocketData(socket, roomId) {
    let socketCheck = await socketExist(socket);


    if(socketCheck && !_.isEmpty(socketCheck)) {
        if (socketCheck?.rooms?.includes(roomId)) {

        } else {
            let updateObj = {...socketCheck, rooms: [...socketCheck.rooms, roomId]}
            await socketInfoHelper.updateObjectById(socketCheck._id, updateObj);
        }
    } else {
        let socketModel = {};

        socketModel.socket = socket;
        socketModel.rooms = [];
        socketModel.rooms.push(roomId);

        let res = await addNewSocketInfoHandler(socketModel);
    }
}

async function socketExist(socket) {
    let filters = {};
    filters.query = {
        socket: {$eq: socket}
    }

    let previous_socket = await getSocketInfoByQueryHandler(filters);

    if(previous_socket) {
        return previous_socket
    } else {
        return false
    }
}

export async function addNewSocketInfoHandler(input) {
    return await socketInfoHelper.addObject(input);
}

export async function getSocketInfoDetailsHandler(input) {
    return await socketInfoHelper.getObjectById(input);
}

export async function updateSocketInfoDetailsHandler(input) {
    return await socketInfoHelper.updateObjectById(input.objectId, input.updateObject);
}

export async function getSocketInfoListHandler(input) {
    const list = await socketInfoHelper.getAllObjects(input);
    const count = await socketInfoHelper.getAllObjectCount(input);
    return { list, count };
}

export async function deleteSocketInfoHandler(input) {
    return await socketInfoHelper.deleteObjectById(input);
}

export async function getSocketInfoByQueryHandler(input) {
    return await socketInfoHelper.getObjectByQuery(input);
}
