import categories from '../constants/constants.json'
import {Router} from "express";
import _ from "lodash";
import {setServerError, setSuccess} from "../../utility/responseUtility";
import {addNewWordHandler} from "../handlers/wordHandler";

const router = new Router();

router.route('/add-word').post(async (req, res) => {
    try {
        if(req.body && req.body.word) {
            if(req.body.word?.text !== '' && req.body.word?.category !== "") {
                let result = await addNewWordHandler(req.body.word);

                setSuccess(res, {
                    data: result,
                    message: 'word added'
                })
            } else {
                setServerError(res, {
                    message: 'Please provide non empty text and category field in word object'
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
