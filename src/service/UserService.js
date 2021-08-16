const bcrypt = require('bcrypt');
const userModel = require('../models/User');
const TowerTypeService = require('../service/TowerTypeService')();

function UserService() {
    return {
        getAll: async function() {
            try {
                const users = await userModel.find().exec();

                return users;
            } catch (error) {
                console.log(error)

                return []
            }
        },

        getById: async function(id) {
            try {
                const user = await userModel.findById(id);

                return user;
            } catch (error) {
                console.log(error)

                return null
            }
        },

        update: async function(user) {
            try {
                await userModel.findByIdAndUpdate(user._id, user);
                return true;
            } catch (error) {
                console.log(error);
                return null;
            }
        },

        login: async function(username, password) 
        {
            try {
                const user = (await userModel.findOne({ username })).toObject();

                if (!user || !bcrypt.compareSync(password, user.password)) {
                    return null;
                }

                const unlockedTowerTypes = await TowerTypeService.getByArrayIds(user.unlockedTowerTypes);
                const selectedTowerTypes = await TowerTypeService.getByArrayIds(user.selectedTowerTypes);

                user.unlockedTowerTypes = [];
                user.selectedTowerTypes = [];

                unlockedTowerTypes.forEach(towerType => {
                    user.unlockedTowerTypes.push(towerType.toObject());
                });

                selectedTowerTypes.forEach(towerType => {
                    user.selectedTowerTypes.push(towerType.toObject());
                });

                return user;
            } catch (error) {
                console.log(error);

                return null;
            }
        },
    
        signup: async function(data) 
        {
            try {
                const defaultTowerTypes = await TowerTypeService.getDefaults();

                data.password = bcrypt.hashSync(data.password, 8);
                data.unlockedTowerTypes = []
                data.selectedTowerTypes = []

                defaultTowerTypes.forEach(towerType => {
                    data.unlockedTowerTypes.push(towerType.id);
                    data.selectedTowerTypes.push(towerType.id);
                });

                const user = await userModel.create(data);
    
                return user;
            } catch (error) {
                console.log(error);

                return null;
            }
        }

    }
}

module.exports = UserService;