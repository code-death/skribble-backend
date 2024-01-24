import categories from '../constants/constants.json'
import {Router} from "express";
import {setServerError} from "../../utility/responseUtility";
import {addWordsFromCategoryList} from "../handlers/wordHandler";

const router = Router();

router.route('/run/word-adding-script').get(async (req, res) => {
    try {
        await Promise.all(Object.keys(categories).map(async category => {
            let result = await addWordsFromCategoryList(categories[category]);
            console.log(result);
        }))
    } catch (e) {
        console.log(e)
        setServerError(res, {
            message: e
        })
    }
})

export default router
