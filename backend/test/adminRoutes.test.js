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

describe('GET /api/admin/users (integration)', () => {
  before(async () => {
    await connect();
  });
  after(async () => {
    await disconnect();
  });
  beforeEach(async () => {
    await clearDb();
  });

  it('returns 403 for non-admins', async () => {
    const user = await User.create({
      name: 'U',
      email: 'u@test.com',
      password: 'pass1234',
    });
    const res = await chai
      .request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${tokenFor(user._id)}`);
    expect(res).to.have.status(403);
  });

  it('returns all users for admins, without passwords', async () => {
    const admin = await User.create({
      name: 'A',
      email: 'admin@test.com',
      password: 'pass1234',
      role: 'admin',
    });
    await User.create({
      name: 'U',
      email: 'u@test.com',
      password: 'pass1234',
    });

    const res = await chai
      .request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${tokenFor(admin._id)}`);

    expect(res).to.have.status(200);
    expect(res.body).to.have.length(2);
    res.body.forEach((u) => expect(u).to.not.have.property('password'));
  });
});

describe('PATCH /api/admin/users/:id/deactivate (integration)', () => {
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
      name: 'A',
      email: 'admin@test.com',
      password: 'pass1234',
      role: 'admin',
    });
    const target = await User.create({
      name: 'U',
      email: 'u@test.com',
      password: 'pass1234',
    });
    return { admin, target };
  };

  it('sets isActive=false on the target user', async () => {
    const { admin, target } = await seed();
    const res = await chai
      .request(app)
      .patch(`/api/admin/users/${target._id}/deactivate`)
      .set('Authorization', `Bearer ${tokenFor(admin._id)}`);
    expect(res).to.have.status(200);
    const after = await User.findById(target._id);
    expect(after.isActive).to.equal(false);
  });

  it('prevents an admin from deactivating themselves', async () => {
    const { admin } = await seed();
    const res = await chai
      .request(app)
      .patch(`/api/admin/users/${admin._id}/deactivate`)
      .set('Authorization', `Bearer ${tokenFor(admin._id)}`);
    expect(res).to.have.status(400);
  });

  it('blocks login for a deactivated user', async () => {
    const { admin, target } = await seed();
    await chai
      .request(app)
      .patch(`/api/admin/users/${target._id}/deactivate`)
      .set('Authorization', `Bearer ${tokenFor(admin._id)}`);

    const loginRes = await chai
      .request(app)
      .post('/api/auth/login')
      .send({ email: 'u@test.com', password: 'pass1234' });
    expect(loginRes).to.have.status(401);
  });

  it('returns 403 to non-admins', async () => {
    const { target } = await seed();
    const nonAdmin = await User.create({
      name: 'N',
      email: 'n@test.com',
      password: 'pass1234',
    });
    const res = await chai
      .request(app)
      .patch(`/api/admin/users/${target._id}/deactivate`)
      .set('Authorization', `Bearer ${tokenFor(nonAdmin._id)}`);
    expect(res).to.have.status(403);
  });

  it('returns 404 for invalid id', async () => {
    const { admin } = await seed();
    const res = await chai
      .request(app)
      .patch('/api/admin/users/not-an-id/deactivate')
      .set('Authorization', `Bearer ${tokenFor(admin._id)}`);
    expect(res).to.have.status(404);
  });
});

describe('DELETE /api/admin/users/:id (integration)', () => {
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
      name: 'A',
      email: 'admin@test.com',
      password: 'pass1234',
      role: 'admin',
    });
    const target = await User.create({
      name: 'U',
      email: 'u@test.com',
      password: 'pass1234',
    });
    const trip = await Trip.create({
      userId: target._id,
      title: 'Trip',
      destination: 'Paris',
      startDate: new Date('2026-06-01'),
    });
    await Entry.create({
      tripId: trip._id,
      userId: target._id,
      photos: ['/uploads/a.jpg'],
    });
    return { admin, target, trip };
  };

  it('deletes the user and cascades trips + entries', async () => {
    const { admin, target, trip } = await seed();
    const res = await chai
      .request(app)
      .delete(`/api/admin/users/${target._id}`)
      .set('Authorization', `Bearer ${tokenFor(admin._id)}`);
    expect(res).to.have.status(200);
    expect(await User.findById(target._id)).to.equal(null);
    expect(await Trip.find({ userId: target._id })).to.have.length(0);
    expect(await Entry.find({ tripId: trip._id })).to.have.length(0);
  });

  it('prevents an admin from deleting themselves', async () => {
    const { admin } = await seed();
    const res = await chai
      .request(app)
      .delete(`/api/admin/users/${admin._id}`)
      .set('Authorization', `Bearer ${tokenFor(admin._id)}`);
    expect(res).to.have.status(400);
    expect(await User.findById(admin._id)).to.not.equal(null);
  });

  it('returns 403 to non-admins', async () => {
    const { target } = await seed();
    const nonAdmin = await User.create({
      name: 'N',
      email: 'n@test.com',
      password: 'pass1234',
    });
    const res = await chai
      .request(app)
      .delete(`/api/admin/users/${target._id}`)
      .set('Authorization', `Bearer ${tokenFor(nonAdmin._id)}`);
    expect(res).to.have.status(403);
  });
});

describe('Admin moderation: trips (integration)', () => {
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
      name: 'A',
      email: 'admin@test.com',
      password: 'pass1234',
      role: 'admin',
    });
    const owner = await User.create({
      name: 'Bob',
      email: 'bob@test.com',
      password: 'pass1234',
    });
    const trip = await Trip.create({
      userId: owner._id,
      title: 'Trip',
      destination: 'Paris',
      startDate: new Date('2026-06-01'),
      isPublic: true,
    });
    await Entry.create({
      tripId: trip._id,
      userId: owner._id,
      photos: ['/uploads/a.jpg'],
    });
    return { admin, owner, trip };
  };

  it('GET /trips returns all trips with owner name', async () => {
    const { admin } = await seed();
    const res = await chai
      .request(app)
      .get('/api/admin/trips')
      .set('Authorization', `Bearer ${tokenFor(admin._id)}`);
    expect(res).to.have.status(200);
    expect(res.body).to.have.length(1);
    expect(res.body[0].ownerName).to.equal('Bob');
  });

  it('DELETE /trips/:id removes trip and cascades entries', async () => {
    const { admin, trip } = await seed();
    const res = await chai
      .request(app)
      .delete(`/api/admin/trips/${trip._id}`)
      .set('Authorization', `Bearer ${tokenFor(admin._id)}`);
    expect(res).to.have.status(200);
    expect(await Trip.findById(trip._id)).to.equal(null);
    expect(await Entry.find({ tripId: trip._id })).to.have.length(0);
  });

  it('DELETE /trips/:id returns 403 to non-admins', async () => {
    const { trip } = await seed();
    const nonAdmin = await User.create({
      name: 'N',
      email: 'n@test.com',
      password: 'pass1234',
    });
    const res = await chai
      .request(app)
      .delete(`/api/admin/trips/${trip._id}`)
      .set('Authorization', `Bearer ${tokenFor(nonAdmin._id)}`);
    expect(res).to.have.status(403);
  });

  it('DELETE /trips/:id returns 404 for invalid id', async () => {
    const { admin } = await seed();
    const res = await chai
      .request(app)
      .delete('/api/admin/trips/not-an-id')
      .set('Authorization', `Bearer ${tokenFor(admin._id)}`);
    expect(res).to.have.status(404);
  });
});

describe('Admin moderation: entries (integration)', () => {
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
      name: 'A',
      email: 'admin@test.com',
      password: 'pass1234',
      role: 'admin',
    });
    const owner = await User.create({
      name: 'Bob',
      email: 'bob@test.com',
      password: 'pass1234',
    });
    const trip = await Trip.create({
      userId: owner._id,
      title: 'My Trip',
      destination: 'Paris',
      startDate: new Date('2026-06-01'),
    });
    const entry = await Entry.create({
      tripId: trip._id,
      userId: owner._id,
      caption: 'A day',
      photos: ['/uploads/a.jpg'],
    });
    return { admin, owner, trip, entry };
  };

  it('GET /entries returns all entries with trip title + owner', async () => {
    const { admin } = await seed();
    const res = await chai
      .request(app)
      .get('/api/admin/entries')
      .set('Authorization', `Bearer ${tokenFor(admin._id)}`);
    expect(res).to.have.status(200);
    expect(res.body).to.have.length(1);
    expect(res.body[0].ownerName).to.equal('Bob');
    expect(res.body[0].tripTitle).to.equal('My Trip');
  });

  it('DELETE /entries/:id removes the entry', async () => {
    const { admin, entry } = await seed();
    const res = await chai
      .request(app)
      .delete(`/api/admin/entries/${entry._id}`)
      .set('Authorization', `Bearer ${tokenFor(admin._id)}`);
    expect(res).to.have.status(200);
    expect(await Entry.findById(entry._id)).to.equal(null);
  });

  it('DELETE /entries/:id returns 403 to non-admins', async () => {
    const { entry } = await seed();
    const nonAdmin = await User.create({
      name: 'N',
      email: 'n@test.com',
      password: 'pass1234',
    });
    const res = await chai
      .request(app)
      .delete(`/api/admin/entries/${entry._id}`)
      .set('Authorization', `Bearer ${tokenFor(nonAdmin._id)}`);
    expect(res).to.have.status(403);
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
