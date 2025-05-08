const dbClient = require('../config/db')
const SendMail = require('../utils/sendMail')

class Auth {
    static async register(user) {
      try {
            const usersCollection = dbClient.db.collection('users');
            const existingUser = await usersCollection.findOne({ email: user.email });

            if (existingUser) {
                return { 
                    status: false, 
                    message: 'Email already in use' 
                };
            }
            const sendmail = await SendMail.sendMail(user.email, 'Gloobal Jobs - Email verification', user.name, '123456789asdfghjk123456');
            console.log({
                type: 'sendMail',
                data: sendmail
            })
            return;
            const result = await usersCollection.insertOne(user);
            if (result.insertedId) {
                return { 
                   status: true,
                   message: 'User registered successfully',
                   user: {
                       id: user.id,
                       insertedId: result.insertedId,
                       name: user.name,
                       email: user.email,
                       role: user.role,
                       isAuthenticated: user.isAuthenticated,
                   }
                }
            } 

            return { status: false, message: 'Failed to register user' };
      } catch (error) {
        console.error('Error reading database:', error);
        return [];
      }
    }
    static sendMail() {

    }
}
module.exports = Auth;