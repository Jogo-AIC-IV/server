const TowerTypeModel = require('../models/TowerType')

function TowerTypeService() {
    return {
        getAll: async function() {
            try {
                const towerTypes = await TowerTypeModel.find().exec();

                return towerTypes;
            } catch (error) {
                console.log(error)

                return []
            }
        },

        getByArrayIds: async function(arrayIds) {
            try {
                const towerTypes = await TowerTypeModel.find({ _id: arrayIds });

                return towerTypes;
            } catch (error) {
                console.log(error)

                return []
            }
        },

        getById: async function(id) {
            try {
                const towerType = await TowerTypeModel.findById(id);

                return towerType;
            } catch (error) {
                console.log(error);

                return null;
            }
        },

        getDefaults: async function() {
            try {
                const towerTypes = await TowerTypeModel.find({ isDefault: true });

                return towerTypes
            } catch (error) {
                console.log(error);

                return [];
            }
        },

        create: async function(towerType) {
            try {
                const towerType = await TowerTypeModel.create(towerType);

                return towerType; 
            } catch (error) {
                console.log(error);

                return null;
            }
        },

        update: async function(towerType) {
            try {
                await TowerTypeModel.findByIdAndUpdate(towerType.id, towerType);

                return towerType;
            } catch (error) {
                console.log(error);

                return null;
            }
        },

        delete: async function(id) {
            try {
                const towerType = await TowerTypeModel.findByIdAndDelete(id);

                return towerType;
            } catch (error) {
                console.log(error);

                return null;
            }
        }

    }
}

module.exports = TowerTypeService;