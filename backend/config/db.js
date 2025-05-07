const { MongoClient } = require('mongodb');

// Reemplaza la URI de conexión con la tuya
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_SERVER}/
`;

const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        console.log('Conexión exitosa')
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}
run().catch(console.dir);