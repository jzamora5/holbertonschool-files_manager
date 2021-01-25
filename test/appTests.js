import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../server';
import dbClient from '../utils/db';

chai.use(chaiHttp);
chai.should();

// General APP Endpoints ==============================================

describe('testing App Status Endpoints', () => {
  describe('/status', () => {
    it('returns the status of redis and mongo connection', async () => {
      const response = await chai.request(app).get('/status').send();
      const body = JSON.parse(response.text);

      chai.expect(body).to.eql({ redis: true, db: true });
      chai.expect(response.statusCode).to.equal(200);
    });
  });

  describe('/stats', () => {
    before(async () => {
      await dbClient.usersCollection.deleteMany({});
      await dbClient.filesCollection.deleteMany({});
    });

    after(async () => {
      await dbClient.usersCollection.deleteMany({});
      await dbClient.filesCollection.deleteMany({});
    });

    it('returns number of users and files in db 0 for this one', async () => {
      const response = await chai.request(app).get('/stats').send();
      const body = JSON.parse(response.text);

      chai.expect(body).to.eql({ users: 0, files: 0 });
      chai.expect(response.statusCode).to.equal(200);
    });

    it('returns number of users and files in db 1 and 2 for this one', async () => {
      await dbClient.usersCollection.insertOne({ name: 'Larry' });
      await dbClient.filesCollection.insertOne({ name: 'image.png' });
      await dbClient.filesCollection.insertOne({ name: 'file.txt' });

      const response = await chai.request(app).get('/stats').send();
      const body = JSON.parse(response.text);

      chai.expect(body).to.eql({ users: 1, files: 2 });
      chai.expect(response.statusCode).to.equal(200);
    });
  });
});
