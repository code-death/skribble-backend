
import wordHelper from '../helpers/wordHelper';

export async function addWordsFromCategoryList(input) {
    try {
        if(input && input.length !== 0) {
            let count = 0;
            await Promise.all(input.map(word => {
                addNewWordHandler(word);
                count++;
            }))

            return count;
        } else {
            return []
        }
    } catch (e) {
        throw e
    }
}

export async function addNewWordHandler(input) {
    return await wordHelper.addObject(input);
}

export async function getWordDetailsHandler(input) {
    return await wordHelper.getObjectById(input);
}

export async function updateWordDetailsHandler(input) {
    return await wordHelper.updateObjectById(input.objectId, input.updateObject);
}

export async function getWordListHandler(input) {
    const list = await wordHelper.getAllObjects(input);
    const count = await wordHelper.getAllObjectCount(input);
    return { list, count };
}

export async function deleteWordHandler(input) {
    return await wordHelper.deleteObjectById(input);
}

export async function getWordByQueryHandler(input) {
    return await wordHelper.getObjectByQuery(input);
}
