import roomHelper from '../helpers/roomHelper';
import _ from "lodash";
import {addNewSocketInfoHandler, checkAndAddSocketData, getSocketInfoByQueryHandler} from "./socketInfoHandler";
import {ObjectId} from "mongodb";
import mongoose from "mongoose";

export async function leaveRoomWithSocketId(socket, roomId) {
    try {
        let filters = {};
        filters.query = {
            roomId : {$eq: roomId}
        }

        let existing_room = await getRoomByQueryHandler(filters);

        let left_user;
        let updated_room = {};

        if(existing_room && !_.isEmpty(existing_room) && existing_room.users && !_.isEmpty(existing_room.users)) {
            let temp_users = [];
            existing_room.users.forEach(user => {
                if(user.socket !== socket) {
                    temp_users.push(user)
                } else {
                    left_user = user;
                }
            });

            updated_room.users = temp_users;
        }



        let res =  await roomHelper.updateObjectById(existing_room._id, updated_room);

        return {res, left_user}
    } catch (e) {
        throw e
    }
}

export async function createNewRoomHandler(input) {
    try {
        let model = {};
        model.roomId = input.roomId;
        model.users = [];
        model.users.push(input.user);
        model.totalRounds = input.totalRounds ? input.totalRounds : 3;
        model.roundInterval = input.roundInterval ? input.roundInterval : 80;
        model.hints = input.hints ? input.hints : 2;
        model.wordCategories = input.wordCategories ? input.wordCategories : [];

        await checkAndAddSocketData(input.user.socket, model.roomId);

        let res = await addNewRoomHandler(model);


        let joined_user = {};

        res.users.forEach(user => {
            if(user.socket === input.user.socket) {
                joined_user = user;
            }
        })

        return {res, joined_user}
    } catch (e) {
        throw e
    }
}

function userExistInTheRoom(roomData, user) {
    let exists = false;
    let userIndex;
    roomData?.users.length > 0 && roomData?.users?.forEach((room_user, index) => {
        if(room_user._id.toString() === user._id) {
            exists = true;
            userIndex = index;
        }
    });

    return {exists, userIndex}
}

export async function removeUserFromTheGame(input) {
    try {
        let socket = input;

    } catch (e) {
        console.log(e)
    }
}

export async function joinUserToRoomHandler(input) {
    try {
        let model = {};
        model.user = input.user;
        model.roomId = input.roomId;

        let filters = {};
        filters.query = {
            roomId: {$eq: model.roomId}
        };

        let existing_room = await getRoomByQueryHandler(filters);

        let check = userExistInTheRoom(existing_room, model.user);

        if(check?.exists) {
            existing_room.users[check?.userIndex] = model.user;
        } else if(existing_room && existing_room.users) {
            existing_room.users.push(model.user);
        }

        await checkAndAddSocketData(input.user.socket, model.roomId);

        let res = await roomHelper.updateObjectById(existing_room._id, existing_room)

        let joined_user = {};

        res.users.forEach(user => {
            if(user?.socket === model?.user?.socket || user?._id.toString() === model?.user?._id) {
                joined_user = user;
            }
        })

        return {res, joined_user}
    } catch (e) {
        throw e
    }
}
export async function addNewRoomHandler(input) {
    return await roomHelper.addObject(input);
}

export async function getRoomDetailsHandler(input) {
    return await roomHelper.getObjectById(input);
}

export async function updateRoomDetailsHandler(input) {
    return await roomHelper.updateObjectById(input.objectId, input.updateObject);
}

export async function getRoomListHandler(input) {
    const list = await roomHelper.getAllObjects(input);
    const count = await roomHelper.getAllObjectCount(input);
    return { list, count };
}

export async function deleteRoomHandler(input) {
    return await roomHelper.deleteObjectById(input);
}

export async function getRoomByQueryHandler(input) {
    return await roomHelper.getObjectByQuery(input);
}
