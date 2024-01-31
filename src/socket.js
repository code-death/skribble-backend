import {
    changeRoomDataForGameStart,
    createNewRoomHandler, handleGuessWordOfTheRound, handleUpdateWordOfTheRound,
    joinUserToRoomHandler,
    leaveRoomWithSocketId,
    removeUserFromTheGame
} from "./common/handlers/roomHandler";
import {getRoomsToLeaveForaSocket, getSocketInfoByQueryHandler} from "./common/handlers/socketInfoHandler";
import _ from "lodash";
import {getRandomWordsForCategories} from "./common/handlers/wordHandler";

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


    socket.on('guess-word', async (chatInput, roomId) => {
        if (roomId !== '') {
            let {res, chat} = await handleGuessWordOfTheRound(chatInput, roomId);
            if(res && !res.roundGoingOn) {
                io.to(roomId).emit('round-ended', res);
            }
            io.to(roomId).emit('receive_message', chat);
        }
    });

    socket.on('start-game', async (data, roomId) => {
        if (roomId !== '') {
            let {res, drawer} = await changeRoomDataForGameStart(data, roomId);
            let word_options = await getRandomWordsForCategories(res)
            io.to(roomId).emit('game-started', res);
            io.to(drawer.socket).emit('choose-word', word_options);
        }
    })

    socket.on('end-game', (data, roomId) => {
        if (roomId !== '') {

        }
    })

    socket.on('round-start', async (data, roomId) => {
        if (roomId !== '') {
            let roomInfo = await handleUpdateWordOfTheRound(data, roomId)
            io.to(roomId).emit('round-started', data, roomInfo);
        }
    })

    socket.on('end-round', (data, roomId) => {
        if (roomId !== '') {

        }
    })

    socket.on('draw-shape', (elements, roomId) => {
        if (roomId !== '') {
            socket.broadcast.to(roomId).emit('shape-drawn', elements, elements?.[elements.length - 1]?.path?.length);
        }
    })
}
