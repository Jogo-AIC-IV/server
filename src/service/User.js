const bcrypt = require('bcrypt');
const userModel = require('../models/User');
const TowerTypeModel = require('../models/TowerType')

function UserService() {
    return {
        login: async function(username, password) 
        {
            try {
                const user = (await userModel.findOne({ username })).toObject();
                const towerTypes = await TowerTypeModel.find({ _id: user.towerTypes });

                user.towerTypes = [];

                towerTypes.forEach(towerType => {
                    user.towerTypes.push(towerType.toObject());
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
                data.towerTypes = [defaultTowerType.id];

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