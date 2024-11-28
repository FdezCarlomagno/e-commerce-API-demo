const db = require('../db');
const bcrypt = require('bcrypt');

class UserModel {


    async createUser(nickname, email, password){
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const query = "INSERT INTO users (nickname, email, password, isAdmin) VALUES(?,?,?,?)";

        const values = [nickname, email, hashedPassword, 0];

        const [result] = await db.execute(query, values);
        
        return { id: result.insertId, nickname, isAdmin: false};
    }
    async getUsers(){
        const [users] = await db.execute("SELECT * FROM users");
        return users;
    }

    async getUserByNickname(nickname){

        const [result] = await db.execute("SELECT * FROM users WHERE nickname = ?", [nickname]);

        return result[0];
    }

    async getUserByID(user_id){
        const query = "SELECT * FROM users WHERE id = ?";
        const [result] = await db.execute(query, [user_id]);

        return result[0];
    }

    async updateProfile(user_id, nickname, email){
        const query = "UPDATE users SET nickname = ?, email = ? WHERE id = ?";
        const [result] = await db.execute(query, [nickname, email, user_id]);

        if(result.affectedRows > 0){
            return this.getUserByID(user_id);
        }

        return null;
    }

    async promoteToAdmin(userId) {
        try {
            const query = "UPDATE users SET isAdmin = 1 WHERE id = ?";
            const [result] = await db.execute(query, [userId]);
    
            if (result.affectedRows > 0) {
                // Obtén el usuario actualizado después de la promoción
                const user = await this.getUserByID(userId);
                return {
                    success: true,
                    user,
                    message: "User successfully promoted to admin.",
                    rowsAffected: result.affectedRows
                };
            }
    
            // Si no se afectaron filas, el usuario no existe
            return {
                success: false,
                message: "User not found or already an admin.",
            };
        } catch (error) {
            console.error("Error promoting user to admin:", error);
            return {
                success: false,
                message: "An error occurred during the promotion.",
                error: error.message,
            };
        }
    }
    async isAdmin(id){
        const user = await this.getUserByID(id)
        return user.isAdmin;
    }
    

    async deleteAccount(userId){
        const query = "DELETE FROM users WHERE id = ?";
        const [result] = await db.execute(query, [userId]);

        return result.affectedRows;
    }
}

module.exports = new UserModel();