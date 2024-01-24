import {addNewWordHandler} from "../handlers/wordHandler";
import {setServerError, setSuccess} from "../../utility/responseUtility";
import router from "./word.routes";
import {Router} from "express";
import {addNewRoomHandler} from "../handlers/roomHandler";

const route = Router();

router.route('/create-room').post(async (req, res) => {
    try {
        if(req.body && req.body.room) {
            if(req.body.room?.roomId !== "") {
                let result = addNewRoomHandler(req.body.room);
                setSuccess(res, {
                    data: result,
                    message: 'Room created'
                })
            }
        } else {
            setServerError(res, {
                message: 'Please provide a body'
            })
        }
    } catch (e) {
        setServerError(res, {
            message: e
        });
    }
})

export default router;
