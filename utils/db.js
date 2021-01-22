import { MongoClient } from 'mongodb';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${DB_HOST}:${DB_PORT}`;

class DBClient {
  constructor() {
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
      if (!err) {
        // console.log('Connected successfully to server');
        this.db = client.db(DB_DATABASE);
      } else {
        console.log(err.message);
        this.db = false;
      }
    });
  }

  isAlive() {
    return !!this.db;
  }

  async nbUsers() {
    const usersCollection = this.db.collection('users');
    const numberOfUsers = usersCollection.countDocuments();
    return numberOfUsers;
  }

  async nbFiles() {
    const filesCollection = this.db.collection('files');
    const numberOfFiles = filesCollection.countDocuments();
    return numberOfFiles;
  }
}

const dbClient = new DBClient();

export default dbClient;
