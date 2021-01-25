import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../server';
import dbClient from '../utils/db';

chai.use(chaiHttp);
chai.should();

// User Endpoints ==============================================

describe('testing user Endpoints', () => {
  const credentials = 'Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=';

  describe('/users', () => {
    it('returns the id and email of created user', async () => {
      const user = {
        email: 'bob@dylan.com',
        password: 'toto1234!',
      };
      const response = await chai.request(app).post('/users').send(user);
      const body = JSON.parse(response.text);
      chai.expect(body.email).to.equal(user.email);
      chai.expect(response.statusCode).to.equal(201);
    });

    it('fails to create user because password is missing', async () => {
      const user = {
        email: 'bob@dylan.com',
      };
      const response = await chai.request(app).post('/users').send(user);
      const body = JSON.parse(response.text);
      chai.expect(body).to.eql({ error: 'Missing password' });
      chai.expect(response.statusCode).to.equal(400);
    });

    it('fails to create user because email is missing', async () => {
      const user = {
        password: 'toto1234!',
      };
      const response = await chai.request(app).post('/users').send(user);
      const body = JSON.parse(response.text);
      chai.expect(body).to.eql({ error: 'Missing email' });
      chai.expect(response.statusCode).to.equal(400);
    });

    it('fails to create user because it already exists', async () => {
      const user = {
        email: 'bob@dylan.com',
        password: 'toto1234!',
      };
      const response = await chai.request(app).post('/users').send(user);
      const body = JSON.parse(response.text);
      chai.expect(body).to.eql({ error: 'Already exist' });
      chai.expect(response.statusCode).to.equal(400);
    });
  });
});
