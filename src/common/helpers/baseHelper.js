import _ from "lodash";

class BaseHelper {
    constructor(model) {
        this.model = model;
    }

    async addObject(obj) {
        try {
            const objectModel = new this.model(obj);
            let saved = await objectModel.save();
            return saved.toJSON();
        } catch (error) {
            throw error;
        }
    }

    async getObjectById(filters) {
        try {
            if (filters.populatedQuery) {
                return await this.model
                    .findById(filters.id)
                    .populate(filters.populatedQuery)
                    .select(!_.isEmpty(filters.selectFrom) ? filters.selectFrom : {})
                    .exec();
            } else {
                return await this.model
                    .findById(filters.id)
                    .select(!_.isEmpty(filters.selectFrom) ? filters.selectFrom : {})
                    .exec();
            }
        } catch (error) {
            throw error;
        }
    }

    async getObjectByQuery(filters) {
        try {
            if (filters.populatedQuery) {
                return await this.model
                    .findOne(filters.query)
                    .populate(filters.populatedQuery)
                    .select(_.isEmpty(filters.selectFrom) ? {} : filters.selectFrom)
                    .lean()
                    .exec()
            }
            else{
                return await this.model
                    .findOne(filters.query)
                    .select(_.isEmpty(filters.selectFrom) ? {} : filters.selectFrom)
                    .lean()
                    .exec();
            }
        } catch (error) {
            throw error;
        }
    }

    async updateObjectById(objectId, updateObject) {
        try {
            return await this.model.findByIdAndUpdate(objectId, updateObject, {
                new: true
            })
        } catch (error) {
            throw error;
        }
    }

    async updateObjectByQuery(query, updateObject) {
        try {
            const object = await this.model.findOne(query);
            if (!object) {
                throw `query oject not found`;
            }
            for (let prop in updateObject) {
                object[prop] = updateObject[prop];
            }
            return await object.save();
        } catch (error) {
            throw error;
        }
    }

    async deleteObjectById(objectId) {
        try {
            return await this.model.findOneAndDelete({_id: objectId});
        } catch (error) {
            throw error;
        }
    }

    async getAllObjects(filters) {
        try {
            const query = filters.query ? filters.query : {};
            const selectFrom = filters.selectFrom ? filters.selectFrom : {};
            const sortBy = filters.sortBy ? filters.sortBy : { _id: -1 };
            const pageNum = filters.pageNum ? filters.pageNum : 1;
            const pageSize = filters.pageSize ? filters.pageSize : 50;
            const populatedQuery = filters.populatedQuery ? filters.populatedQuery : null;
            if (populatedQuery) {
                return await this.model
                    .find(query)
                    .select(selectFrom)
                    .sort(sortBy)
                    .skip((pageNum - 1) * pageSize)
                    .limit(parseInt(pageSize))
                    .populate(populatedQuery)
                    .lean()
                    .exec();
            } else {
                return await this.model
                    .find(query)
                    .select(selectFrom)
                    .sort(sortBy)
                    .skip((pageNum - 1) * pageSize)
                    .limit(parseInt(pageSize))
                    .lean()
                    .exec();
            }
        } catch (error) {
            throw error;
        }
    }

    async getAllObjectCount(filters) {
        try {
            const query = filters.query ? filters.query : {};
            return await this.model.countDocuments(query);
        } catch (error) {
            throw error;
        }
    }

    async updateManyByQuery(query, updateObject) {
        try {
            return await this.model.updateMany(query, updateObject);
        } catch (error) {
            throw error;
        }
    }

    async deleteMany(query) {
        try {
            return await this.model.deleteMany(query);
        } catch (error) {
            throw error;
        }
    }

    async aggregate(steps) {
        try {
            return await this.model.aggregate(steps).exec();
        } catch (error) {
            console.log(error)
            throw error;
        }
    }
}

export default BaseHelper;
