const bcrypt = require('bcryptjs/dist/bcrypt');
const dbClient = require('../config/db')
const SendMail = require('../utils/sendMail')
const jwt = require('jsonwebtoken')

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
            const sendmail = await SendMail.sendMail(user.email, 'Gloobal Jobs - Email verification', user.name);
            console.log({
                archive: 'Auth.js',
                data: sendmail,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isAuthenticated: user.isAuthenticated,
                }
            })
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
    static async login(user) {
        try {
            const usersCollection = dbClient.db.collection('users');
            const existingUser = await usersCollection.findOne({ email: user.email });

            if (!existingUser) {
                return { status: false, message: 'User not found.' };
            }

            const passwordIsValid = bcrypt.compareSync(user.password, existingUser.password);
            if (!passwordIsValid) {
                return { status: false, message: 'Invalid password' }
            }

            if (!existingUser.isAuthenticated) {
                return { status: false, message: 'Unauthenticated user, please check your inbox.' };
            }

            const token = jwt.sign({ id: existingUser.id }, process.env.JWT_SECRET, {
                expiresIn: '24h'
            });

            return {
                status: true,
                message: 'Log in successfully!',
                data: {
                    user: {
                        id: existingUser.id,
                        name: existingUser.name,
                        email: existingUser.email,
                        role: existingUser.role
                    },
                    token
                }
            }

        } catch (error) {
            throw `Error/Auth.js: ${ error }`
        }
    }
}
module.exports = Auth;