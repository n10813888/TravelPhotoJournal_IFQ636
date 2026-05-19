const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const { connect, disconnect, clearDb } = require('./helpers/setup');
const User = require('../models/User');
const Trip = require('../models/Trip');
const app = require('../server');

chai.use(chaiHttp);
const { expect } = chai;

const tokenFor = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });

describe('GET /api/trips (integration)', () => {
  before(async () => {
    await connect();
  });

  after(async () => {
    await disconnect();
  });

  beforeEach(async () => {
    await clearDb();
  });

  it('returns 401 when no token is provided', async () => {
    const res = await chai.request(app).get('/api/trips');
    expect(res).to.have.status(401);
  });

  it('returns only the logged-in user\'s trips, sorted by startDate desc', async () => {
    const me = await User.create({
      name: 'Joe',
      email: 'joe@test.com',
      password: 'pass1234',
    });
    const other = await User.create({
      name: 'Other',
      email: 'other@test.com',
      password: 'pass1234',
    });

    await Trip.create({
      userId: me._id,
      title: 'Older',
      destination: 'Paris',
      startDate: new Date('2025-01-01'),
    });
    await Trip.create({
      userId: me._id,
      title: 'Newer',
      destination: 'Tokyo',
      startDate: new Date('2026-06-01'),
    });
    await Trip.create({
      userId: other._id,
      title: 'Not mine',
      destination: 'Rome',
      startDate: new Date('2026-07-01'),
    });

    const res = await chai
      .request(app)
      .get('/api/trips')
      .set('Authorization', `Bearer ${tokenFor(me._id)}`);

    expect(res).to.have.status(200);
    expect(res.body).to.have.length(2);
    expect(res.body[0].title).to.equal('Newer');
    expect(res.body[1].title).to.equal('Older');
    expect(res.body.map((t) => t.title)).to.not.include('Not mine');
  });

  it('returns an empty array when the user has no trips', async () => {
    const me = await User.create({
      name: 'Joe',
      email: 'joe@test.com',
      password: 'pass1234',
    });

    const res = await chai
      .request(app)
      .get('/api/trips')
      .set('Authorization', `Bearer ${tokenFor(me._id)}`);

    expect(res).to.have.status(200);
    expect(res.body).to.deep.equal([]);
  });
});
