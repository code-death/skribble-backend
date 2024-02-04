import {
    changeRoomDataForGameStart,
    changeRoomDataForRoundStart,
    createNewRoomHandler,
    getDrawerFromRoomData,
    handleEndRound,
    handleGuessWordOfTheRound,
    handleTurnEnd,
    handleUpdateWordOfTheRound,
    joinUserToRoomHandler,
    leaveRoomWithSocketId,
    removeUserFromTheGame,
    updateRoomDataOnRoundEnd,
    updateTurnNumber
} from "./common/handlers/roomHandler";
import {getRoomsToLeaveForaSocket, getSocketInfoByQueryHandler} from "./common/handlers/socketInfoHandler";
import _ from "lodash";
import {getRandomWords, getRandomWordsForCategories} from "./common/handlers/wordHandler";
import room from "./common/models/room";
import {aws4} from "mongodb/src/deps";

export default function handleSocketEvents(socket, io) {
    socket.on('create-room', async (data, roomId) => {
        if (roomId !== '') {
            socket.join(roomId);
            try {
                let {res, joined_user} = await createNewRoomHandler({user: {...data, socket: socket.id}, roomId});
                let chat = {
                    text: `joined the game`,
                    color: '#20ad00',
                    userName: joined_user.name,
                };
                io.to(roomId).emit('receive_message', chat);
                io.to(roomId).emit('joined-room', res, joined_user);
            } catch (e) {
                console.log(e);
            }
        }
    })

    socket.on('join-room', async (data, roomId) => {
        if (roomId !== '') {
            socket.join(roomId);
            try {
                let {res, joined_user} = await joinUserToRoomHandler({user: {...data, socket: socket.id}, roomId});
                let chat = {
                    text: `joined the game`,
                    color: '#20ad00',
                    userName: joined_user.name,
                };
                io.to(roomId).emit('receive_message', chat);
                io.to(roomId).emit('joined-room', res, joined_user);
            } catch (e) {
                console.log(e)
            }
        }
    });

    socket.on('start-game', async (data, roomId) => {
        if (roomId !== '') {
            let {res} = await changeRoomDataForGameStart(data, roomId);
            io.to(roomId).emit('game-started', res);
        }
    })

    socket.on('round-start', async (data, roomId) => {
        if(roomId !== '') {
            let {res, drawer} = await changeRoomDataForRoundStart(data, roomId);
            let word_options = await getRandomWordsForCategories(res);
            io.to(drawer.socket).emit('choose-word', word_options);
        }
    })

    socket.on('turn-start', async (data, roomId) => {
        if (roomId !== '') {
            let roomInfo = await handleUpdateWordOfTheRound(data, roomId)
            io.to(roomId).emit('turn-started', data, roomInfo);
        }
    })

    socket.on('send-message', async (chatInput, roomId) => {
        if (roomId !== '') {
            io.to(roomId).emit('receive_message', chatInput);
        }
    });

    socket.on('guess-word', async (chatInput, roomId) => {
        if (roomId !== '') {
            let {res, chat} = await handleGuessWordOfTheRound(chatInput, roomId);
            if(res && !res.turnGoingOn) {
                io.to(roomId).emit('turn-ended', res);
            }
            io.to(roomId).emit('guessed-word', chat);
        }
    });

    socket.on('end-turn', async (data, roomId) => {
        if (roomId !== '') {
            let res = await handleTurnEnd(data);
            if(res && !res.turnGoingOn) {
                io.to(roomId).emit('turn-ended', res);
            }
        }
    })

    socket.on('next-turn', async (data, roomId) => {
        if (roomId !== '') {
            let turnNumber = await updateTurnNumber(data);

            if(!(turnNumber >= data.users.length)) {
                let drawer = getDrawerFromRoomData(data);
                let word_options = await getRandomWordsForCategories(data);
                io.to(drawer.socket).emit('choose-word', word_options);
            } else {
                // let res = await updateRoomDataOnRoundEnd(data, roomId);
                // io.to(roomId).emit('round-ended', res);
            }
        }
    })

    socket.on('end-round', async (data, roomId) => {
        if (roomId !== '') {
            let res = await handleEndRound(data, roomId);
            if(res.gameEnded) {
                io.to(roomId).emit('game-ended', res);
            } else {
                io.to(roomId).emit('round-ended', res);
            }
        }
    })

    socket.on('disconnect', async () => {
        let left_socket = socket.id;
        if(left_socket && left_socket !== "") {
            let rooms_to_leave = await getRoomsToLeaveForaSocket(left_socket);

            if(rooms_to_leave && !_.isEmpty(rooms_to_leave)) {
                await Promise.all(rooms_to_leave.map(async roomId => {
                    let {res, left_user} = await leaveRoomWithSocketId(left_socket, roomId);
                    if(left_user && !_.isEmpty(left_user)) {
                        let chat = {
                            text: `left the game`,
                            color: '#e00000',
                            userName: left_user.name,
                        };
                        io.to(roomId).emit('receive_message', chat);
                        io.to(roomId).emit('left-room', res, left_user);
                    }
                }))
            }
        }
    });

    socket.on('draw-shape', (elements, roomId) => {
        if (roomId !== '') {
            socket.broadcast.to(roomId).emit('shape-drawn', elements, elements?.[elements.length - 1]?.path?.length);
        }
    })
}
