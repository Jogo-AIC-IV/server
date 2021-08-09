const bcrypt = require('bcrypt');
const User = require('../models/User');

function createUser(socket) {
    return {
        id: socket.id,
        socket,
        name: null,
        username: null,
        password: null,
        unlockedTowerTypes: [],
        selectedTowerTypes: [],

        addTowerType: function(towerType) {
            this.towerTypes.push(towerType);
        },

        encryptPassword: function(password) {
            this.password = bcrypt.hashSync(password, 8);

            return this.password;
        },

        checkPassword: function(password) {
            console.log(`Verificando ${password} com ${this.password}`);
            return bcrypt.compareSync(password, this.password);
        },

        syncDatabaseUser: async function(username) {
            try {
                const user = await User.findOne({ username });

                if (!user) {
                    return console.log("\nNenhum usuário encontrado\n");
                }

                console.log(`Usuário: ${user.username}, ${user.name}, ${user.password}`);

                this.id = user._id;
                this.name = user.name;
                this.username = user.username;
                this.password = user.password;
                this.unlockedTowerTypes = user.unlockedTowerTypes;
                this.selectedTowerTypes = user.selectedTowerTypes;
            } catch (error) {
                console.error(error);
                console.log('Falha ao pegar um usuário');
            }
        },

        login: async function(username, password) {
            await this.syncDatabaseUser(username);
 
            if (!this.username) {
                console.log("Sem username");
                return false;
            }

            return this.checkPassword(password);
        },

        signUp: async function(username, password) {
            await this.syncDatabaseUser(username);

            if (this.username) {
                return false;
            }

            this.encryptPassword(password);

            try {
                await User.create({
                    username: username,
                    password: this.password,
                });

                return true;
            } catch (error) {
                console.error(error);
                console.log('Falha ao salvar o usuário no banco');

                return false;
            }
        }
    }
}

module.exports = createUser