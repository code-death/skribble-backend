import roomHelper from '../helpers/roomHelper';
import _ from "lodash";
import {checkAndAddSocketData} from "./socketInfoHandler";
import dayjs from "dayjs";
import {MAX_POINTS} from "../constants/constant";
import {getRandomWords} from "./wordHandler";


export async function handleEndRound(roomData, roomId) {
    try {
        let updated_room = {};
        let previous_room = {};

        if(roomData.currentRound < roomData.totalRounds) {
            updated_room.roundGoingOn = false;
            updated_room.currentRound = roomData.currentRound + 1;
            updated_room.users = roomData.users.map((user, index) => {
                let tempUser = {...user};
                tempUser.turnScore = 0;
                tempUser.isDrawer = index === roomData.users.length - 1; // makes the last user the drawer of the game
                return tempUser;
            })
        } else {
            updated_room.roundGoingOn = false;
            updated_room.gameEnded = true;
        }

        if(!(roomData._id && roomData._id.toString() !== "")) {
            let filters = {};
            filters.query = {
                roomId: {$eq: roomId}
            }

            previous_room = await roomHelper.getObjectByQuery(filters);

            return await roomHelper.updateObjectById(previous_room._id.toString(), updated_room)
        } else {
            return await roomHelper.updateObjectById(updated_room._id.toString(), updated_room)
        }
    } catch (e) {
        console.log(e);
        throw e;
    }
}

export async function updateTurnNumber(roomData) {
    try {
        let model = {};

        if(roomData._id.toString() !== "") {
            model.turnNumber = roomData.turnNumber + 1;

            await roomHelper.updateObjectById(roomData._id.toString(), model);
        } else if (roomData.roomId !== "") {
            let filters = {};
            filters.query = {
                roomId: {$eq: roomData.roomId}
            };

            let prev_room = await roomHelper.getObjectByQuery(filters);
            model.turnNumber = prev_room.turnNumber + 1;

            await roomHelper.updateObjectById(prev_room._id.toString(), model);
        }

        return model.turnNumber;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

export function getDrawerFromRoomData(input) {
    try {
        let roomData = {...input};
        if(!_.isEmpty(roomData.users)) {
            return roomData.users.filter(user => user.isDrawer)[0];
        }
    } catch (e) {
        console.log(e);
        throw e;
    }
}

function calculateRoundScore(turnStartTime, roundInterval) {
    let current_time = dayjs().unix();
    let time_diff = Math.abs(current_time - turnStartTime)
    let score = 0;
    if (time_diff < 5) {
        score = MAX_POINTS
    } else {
        score = Math.trunc(Math.round((MAX_POINTS - (Math.pow(time_diff, 2) / 16))))
    }

    if (score < 0) {
        return 0
    } else {
        return score
    }
}

export async function updateRoomDataOnRoundEnd(previousRoom, roomId) {
    let roomData = {...previousRoom};

    try {
        let model = {};
        model.users = previousRoom.users.map((user, index) => {
            if(index === previousRoom.users.length - 1) {
                return {
                    ...user,
                    isDrawer: true,
                    turnScore: 0,
                }
            } else {
                return {
                    ...user,
                    turnScore: 0
                }
            }
        })

        model.roundGoingOn = false;
        model.currentRound = previousRoom.currentRound + 1;

        let res = await roomHelper.updateObjectById(previousRoom._id.toString(), model);

        return res;
    } catch (e) {
        console.log(e);
        throw e
    }
}

export async function handleTurnEnd(previous_room) {
    try {
        let updated_room = {};
        let previousDrawerIndex;

        updated_room.numberOfPeopleGuessed = [];
        updated_room.turnGoingOn = false;

        const userWithHighestRoundScore = previous_room.users.reduce((prevUser, currentUser) => {
            return (prevUser.turnScore > currentUser.turnScore) ? prevUser : currentUser;
        }, updated_room.users[0]);

        updated_room.users = updated_room.users.map((user, index) => {
            let tempUser = {...user}

            if (user.isDrawer) {
                previousDrawerIndex = index;
                tempUser.turnScore = userWithHighestRoundScore.turnScore;
                tempUser.isDrawer = false;
            } else {
                    tempUser.score = user.score + user.turnScore;
                    tempUser.turnScore = 0;
            }

            return tempUser;
        })

        if (!_.isEmpty(updated_room?.users?.[previousDrawerIndex])) {
            updated_room.users[previousDrawerIndex].isDrawer = true;
        }

        return await roomHelper.updateObjectById(previous_room._id, updated_room);
    } catch (e) {
        console.log(e)
        throw e
    }
}

export async function handleGuessWordOfTheRound(chat, roomId) {
    try {
        let filters = {};
        filters.query = {
            roomId: {$eq: roomId}
        }

        let newChat = {};

        let updated_room = {};
        updated_room.numberOfPeopleGuessed = [];

        let previous_room = await roomHelper.getObjectByQuery(filters);

        if (previous_room.roundGoingOn && !(previous_room.numberOfPeopleGuessed.includes(chat.userId) || previous_room.numberOfPeopleGuessed.includes(chat.userSocket))) {
            newChat.userName = chat.userName;

            if (previous_room.wordOfTheRound === chat.text) {
                newChat.text = "guessed the word"
                newChat.color = "#176c00"
                updated_room.numberOfPeopleGuessed.push(chat?.userId || chat?.userSocket);
            } else {
                newChat.text = `guessed ${chat.text}`
                newChat.color = "#20ad00"
            }


            updated_room.users = previous_room.users.map(user => {
                let updatedUser = {...user};
                if (updated_room.numberOfPeopleGuessed.includes(user._id.toString()) || updated_room.numberOfPeopleGuessed.includes(user.socket)) {
                    updatedUser.turnScore = calculateRoundScore(previous_room.turnStartTime, previous_room.roundInterval);
                }

                return updatedUser;
            })

            if (updated_room.numberOfPeopleGuessed.length === updated_room.users.length - 1) {
                let data = await handleTurnEnd(updated_room);
                updated_room = {...updated_room, ...data};
            }

            return {res: updated_room, chat: newChat}
        } else {
            return {res: undefined, chat}
        }
    } catch (e) {
        console.log(e);
        throw e;
    }
}

export async function handleUpdateWordOfTheRound(word, roomId) {
    try {
        let model = {};
        model.wordOfTheRound = word;
        model.turnGoingOn = true;
        model.numberOfPeopleGuessed = [];
        model.turnStartTime = dayjs().unix();

        let filters = {};
        filters.query = {
            roomId: {$eq: roomId}
        }

        return await roomHelper.updateObjectByQuery(filters, model);
    } catch (e) {
        console.log(e)
        throw e
    }
}

export async function changeRoomDataForRoundStart(roomInfo, roomId) {
    try {
        let model = {};
        model.roundGoingOn = true;

        let filters = {};
        filters.query = {
            roomId: {$eq: roomId}
        };

        let previous_room_data = await roomHelper.getObjectByQuery(filters);

        model.users = previous_room_data?.users.map((user, index) => {
            if (index === previous_room_data?.users.length - 1) {
                model.drawer = user;
                return {
                    ...user,
                    isDrawer: true
                }
            } else {
                return {
                    ...user,
                    isDrawer: false,
                }
            }
        })

        let res = await roomHelper.updateObjectById(previous_room_data._id, model);

        return {res, drawer: model.drawer}

    } catch (e) {
        console.log(e);
        throw e;
    }
}

export async function changeRoomDataForGameStart(roomInfo, roomId) {
    try {
        let model = {};
        model.currentRound = roomInfo?.currentRound ? roomInfo.currentRound : 1;
        model.totalRounds = roomInfo?.totalRounds ? roomInfo.totalRounds : 3;
        model.roundInterval = roomInfo?.roundInterval ? roomInfo.roundInterval : 80;
        model.hints = roomInfo?.hints ? roomInfo.hints : 2;
        model.wordCategories = roomInfo?.wordCategories ? roomInfo.wordCategories : ['movies/tv_shows', 'color', 'mythology'];
        model.turnNumber = 1;
        model.turnGoingOn = false;
        model.roundGoingOn = false;
        model.gameStarted = true;

        let filters = {};
        filters.query = {
            roomId: {$eq: roomId}
        };

        let previous_room_data = await roomHelper.getObjectByQuery(filters);

        model.users = previous_room_data.users.map(user => ({
            ...user,
            isDrawer: false,
            turnScore: 0,
            score: 0
        }))

        let res = await roomHelper.updateObjectById(previous_room_data._id, model);

        return {res}


    } catch (e) {
        console.log(e);
        throw e
    }
}

export async function leaveRoomWithSocketId(socket, roomId) {
    try {
        let filters = {};
        filters.query = {
            roomId: {$eq: roomId}
        }

        let existing_room = await getRoomByQueryHandler(filters);

        let left_user;
        let updated_room = {};

        if (existing_room && !_.isEmpty(existing_room) && existing_room.users && !_.isEmpty(existing_room.users)) {
            let temp_users = [];
            existing_room.users.forEach(user => {
                if (user.socket !== socket) {
                    temp_users.push(user)
                } else {
                    left_user = user;
                }
            });

            updated_room.users = temp_users;
        }


        let res = await roomHelper.updateObjectById(existing_room._id, updated_room);

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
            if (user.socket === input.user.socket) {
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
        if (room_user._id.toString() === user._id) {
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

        if (check?.exists) {
            existing_room.users[check?.userIndex] = model.user;
        } else if (existing_room && existing_room.users) {
            existing_room.users.push(model.user);
        }

        await checkAndAddSocketData(input.user.socket, model.roomId);

        let res = await roomHelper.updateObjectById(existing_room._id, existing_room)

        let joined_user = {};

        res.users.forEach(user => {
            if (user?.socket === model?.user?.socket || user?._id.toString() === model?.user?._id) {
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
    return {list, count};
}

export async function deleteRoomHandler(input) {
    return await roomHelper.deleteObjectById(input);
}

export async function getRoomByQueryHandler(input) {
    return await roomHelper.getObjectByQuery(input);
}
