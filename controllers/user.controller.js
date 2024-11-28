const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

class UserController {
    async getToken(req, res) {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                return res.status(400).json({ error: 'Authorization header not found' })
            }

            const [basic, credentials] = authHeader.split(' ');

            if (basic !== 'Basic' || !credentials) {
                return res.status(400).json({ error: 'Invalid auth format' });
            }

            const decodedCredentials = Buffer.from(credentials, 'base64').toString();

            const [nickname, password] = decodedCredentials.split(':');

            if (!nickname || !password) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }


            const user = await userModel.getUserByNickname(nickname);

            if (!user) {
                return res.status(404).json({ error: `User with nickname: ${nickname} not found` });
            }

            const validPassword = await bcrypt.compare(password, user.password);

            if (!validPassword) {
                return res.status(400).json({ error: "Incorrect password" });
            }

            const token = jwt.sign({
                sub: user.id,
                nickname: user.nickname,
                isAdmin: user.isAdmin,
                email: user.email,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 30000
            }, JWT_SECRET)
            return res.json({ token });

        } catch (err) {
            return res.status(500).json({ error: err })
        }
    }
    async createUser(req, res) {
        try {
            const { nickname, email, password } = req.body;

            if (!nickname || !email || !password) {
                return res.status(400).json({ error: 'Missing mandatory fields' });
            }
            
            if(password.length < 9){
                return res.status(400).json({ msg: 'The password has to have at least 9 characters '})
            }

            const newUser = await userModel.createUser(nickname, email, password);

            return res.status(201).json(newUser);
        } catch (error) {
            res.status(500).json({ error: 'Could not create user' });
        }
    }
    async getUsers(req, res) {
        try {
            const name = req.query.name;
            
            if(name){
                const user = await userModel.getUserByNickname(name);
                return res.json(user);
            }
            const users = await userModel.getUsers();

            if (!users) {
                return res.json({ msg: 'No users found' });
            }
    
            return res.json(users);
        } catch (error) {
            return res.status(500).json({ msg: 'Could not get users', error: error })
        }
     
    }

    async getProfile(req, res) {
        try {
            const user = await userModel.getUserByID(req.user.sub);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            return res.json(user);
        } catch (error) {
            return res.status(500).json({ error: error });
        }
    }

    async getUser(req, res) {
        try {
          

            const user = await userModel.getUserByID(req.params.userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            return res.json(user);

        } catch (error) {
            return res.status(500).json({ error: error });
        }
    }

    async promoteToAdmin(req, res) {
        try {
            const userId = req.params.userId; // ID del usuario autenticado

            // Promover al usuario a administrador
            const result = await userModel.promoteToAdmin(userId);

            if (!result.success) {
                return res.status(404).json({ error: result.message });
            }

            // Responder con el usuario actualizado y mensaje de éxito
            return res.json({
                message: "User successfully promoted to admin.",
                user: result.user,
                rowsAffected: result.rowsAffected
            });
        } catch (error) {
            console.error("Error promoting user to admin:", error);
            return res.status(500).json({
                error: "An unexpected error occurred while promoting the user.",
            });
        }
    }


    async deleteAccount(req, res) {
        try {
            const user_id = req.user.sub;

            const user = await userModel.getUserByID(user_id);

            if (!user) {
                return res.status(404).json({ error: `The user with id: ${user_id} doesn't exist` });
            }

            const affectedRows = await userModel.deleteAccount(user_id);

            return res.json({
                msg: "Account deleted succesfully",
                rowsAffected: affectedRows
            })
        } catch (error) {
            return res.status(500).json({ error: `Could not delete the account ${error}` });
        }
    }

    async updateProfile(req, res) {
        try {
            const { nickname, email } = req.body;
            const id_user = req.user.sub;

            const user = await userModel.getUserByID(id_user);

            if (!user) {
                return res.status(404).json({ error: 'User to update not found' })
            }

            if (!nickname || !email) {
                return res.status(400).json('Missing fields');
            }

            const updatedUser = await userModel.updateProfile(id_user, nickname, email);

            return res.json(updatedUser);
        } catch (error) {
            return res.status(500).json({ error: error });
        }
    }
}

module.exports = new UserController();