const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const { connect, disconnect, clearDb } = require('./helpers/setup');
const User = require('../models/User');
const Trip = require('../models/Trip');
const Entry = require('../models/Entry');
const app = require('../server');

chai.use(chaiHttp);
const { expect } = chai;

const tokenFor = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });

describe('GET /api/admin/stats (integration)', () => {
  before(async () => {
    await connect();
  });
  after(async () => {
    await disconnect();
  });
  beforeEach(async () => {
    await clearDb();
  });

  const seed = async () => {
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: 'pass1234',
      role: 'admin',
    });
    const user = await User.create({
      name: 'User',
      email: 'user@test.com',
      password: 'pass1234',
    });
    const publicTrip = await Trip.create({
      userId: user._id,
      title: 'Public',
      destination: 'Paris',
      startDate: new Date('2026-01-01'),
      isPublic: true,
    });
    await Trip.create({
      userId: user._id,
      title: 'Private',
      destination: 'Rome',
      startDate: new Date('2026-02-01'),
      isPublic: false,
    });
    await Entry.create({
      tripId: publicTrip._id,
      userId: user._id,
      photos: ['/uploads/a.jpg'],
    });
    return { admin, user };
  };

  it('returns 401 without a token', async () => {
    const res = await chai.request(app).get('/api/admin/stats');
    expect(res).to.have.status(401);
  });

  it('returns 403 for non-admin users', async () => {
    const { user } = await seed();
    const res = await chai
      .request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${tokenFor(user._id)}`);
    expect(res).to.have.status(403);
  });

  it('returns counts for admin users', async () => {
    const { admin } = await seed();
    const res = await chai
      .request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${tokenFor(admin._id)}`);
    expect(res).to.have.status(200);
    expect(res.body).to.deep.equal({
      users: 2,
      trips: 2,
      entries: 1,
      publicTrips: 1,
    });
  });
});

describe('Auth responses include role', () => {
  before(async () => {
    await connect();
  });
  after(async () => {
    await disconnect();
  });
  beforeEach(async () => {
    await clearDb();
  });

  it('register response includes role=user by default', async () => {
    const res = await chai
      .request(app)
      .post('/api/auth/register')
      .send({ name: 'A', email: 'a@test.com', password: 'pass1234' });
    expect(res).to.have.status(201);
    expect(res.body.role).to.equal('user');
  });

  it('login response includes role=admin for admin users', async () => {
    await User.create({
      name: 'A',
      email: 'admin@test.com',
      password: 'pass1234',
      role: 'admin',
    });
    const res = await chai
      .request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'pass1234' });
    expect(res).to.have.status(200);
    expect(res.body.role).to.equal('admin');
  });
});
