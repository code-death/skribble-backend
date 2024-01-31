
import wordHelper from '../helpers/wordHelper';

const getRandomWords = async (categories) => {
    try {
        const pipeline = [
            {
                $match: {
                    category: { $in: categories }
                }
            },
            {
                $sample: { size: 3 }
            }
        ];

        const result = await wordHelper.aggregate(pipeline);

        return result;
    } catch (error) {
        console.error("Error fetching random words:", error);
        throw error;
    }
};

export async function getRandomWordsForCategories(input) {
    try {
        let wordCategories = input?.wordCategories;
        let randomWords = await getRandomWords(wordCategories);

        return randomWords;
    } catch (e) {
        console.log(e);
        throw e
    }
}

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
