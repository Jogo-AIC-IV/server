const bcrypt = require('bcrypt');
const userModel = require('../models/User');
const TowerTypeModel = require('../models/TowerType')

function UserService() {
    return {
        update: async function(user) {
            try {
                return await userModel.findByIdAndUpdate(user.id, user);
            } catch (error) {
                console.log(error);
                return null;
            }
        },

        login: async function(username, password) 
        {
            try {
                const user = (await userModel.findOne({ username })).toObject();
                // const unlockedTowerTypes = await TowerTypeModel.find({ _id: user.unlockedTowerTypes });
                const selectedTowerTypes = await TowerTypeModel.find({ _id: user.unlockedTowerTypes });

                // user.unlockedTowerTypes = [];
                user.selectedTowerTypes = [];

                selectedTowerTypes.forEach(towerType => {
                    user.selectedTowerTypes.push(towerType.toObject());
                });

                if (!user || !bcrypt.compareSync(password, user.password)) {
                    return null;
                }
    
                return user;
            } catch (error) {
                console.log(error);
                return null;
            }
        },
    
        signup: async function(data) 
        {
            try {
                const defaultTowerType = await TowerTypeModel.findOne({ name: 'Gelo' }); 

                data.password = bcrypt.hashSync(data.password, 8);
                data.unlockedTowerTypes = [defaultTowerType.id];
                data.selectedTowerTypes = [defaultTowerType.id];

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