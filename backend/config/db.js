const { MongoClient } = require('mongodb');

const URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_SERVER}/`;

class dbClient {
    constructor() {
        this.client = new MongoClient(URI);
        this.connectDB();
    }
    async connectDB() {
        try {
            await this.client.connect()
            this.db = this.client.db('TemporaryJobs');
            console.log('Conexión exitosa')
        } catch (error) {
            console.log(error)
        }
        
    }
}
module.exports = new dbClient();