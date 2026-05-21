const path = require('path');
const fs = require('fs');
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

const FIXTURE_DIR = path.join(__dirname, 'fixtures');
const FIXTURE_PHOTO_A = path.join(FIXTURE_DIR, 'photo-a.png');
const FIXTURE_PHOTO_B = path.join(FIXTURE_DIR, 'photo-b.png');

// A 1x1 PNG (smallest valid image).
const ONE_PX_PNG = Buffer.from(
  '89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C489' +
    '0000000D49444154789C636000000000050001A5F645400000000049454E44AE426082',
  'hex'
);

before(() => {
  if (!fs.existsSync(FIXTURE_DIR)) fs.mkdirSync(FIXTURE_DIR, { recursive: true });
  if (!fs.existsSync(FIXTURE_PHOTO_A)) fs.writeFileSync(FIXTURE_PHOTO_A, ONE_PX_PNG);
  if (!fs.existsSync(FIXTURE_PHOTO_B)) fs.writeFileSync(FIXTURE_PHOTO_B, ONE_PX_PNG);
});

describe('POST /api/trips/:tripId/entries (integration)', () => {
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
    const owner = await User.create({
      name: 'Owner',
      email: 'owner@test.com',
      password: 'pass1234',
    });
    const stranger = await User.create({
      name: 'Stranger',
      email: 'stranger@test.com',
      password: 'pass1234',
    });
    const trip = await Trip.create({
      userId: owner._id,
      title: 'Trip',
      destination: 'Paris',
      startDate: new Date('2026-06-01'),
    });
    return { owner, stranger, trip };
  };

  it('creates an entry with multiple photos for the trip owner', async () => {
    const { owner, trip } = await seed();
    const res = await chai
      .request(app)
      .post(`/api/trips/${trip._id}/entries`)
      .set('Authorization', `Bearer ${tokenFor(owner._id)}`)
      .field('caption', 'Day one')
      .attach('photos', FIXTURE_PHOTO_A)
      .attach('photos', FIXTURE_PHOTO_B);

    expect(res).to.have.status(201);
    expect(res.body.caption).to.equal('Day one');
    expect(res.body.photos).to.have.length(2);
    expect(res.body.photos[0]).to.match(/^\/uploads\//);
  });

  it('returns 400 when no photos are attached', async () => {
    const { owner, trip } = await seed();
    const res = await chai
      .request(app)
      .post(`/api/trips/${trip._id}/entries`)
      .set('Authorization', `Bearer ${tokenFor(owner._id)}`)
      .field('caption', 'No photos');
    expect(res).to.have.status(400);
  });

  it('returns 404 when the trip does not belong to the user', async () => {
    const { stranger, trip } = await seed();
    const res = await chai
      .request(app)
      .post(`/api/trips/${trip._id}/entries`)
      .set('Authorization', `Bearer ${tokenFor(stranger._id)}`)
      .attach('photos', FIXTURE_PHOTO_A);
    expect(res).to.have.status(404);
  });

  it('returns 401 without a token', async () => {
    const { trip } = await seed();
    const res = await chai
      .request(app)
      .post(`/api/trips/${trip._id}/entries`)
      .send({});
    expect(res).to.have.status(401);
  });

  it('returns 404 for an invalid trip id', async () => {
    const { owner } = await seed();
    const res = await chai
      .request(app)
      .post('/api/trips/not-an-id/entries')
      .set('Authorization', `Bearer ${tokenFor(owner._id)}`)
      .attach('photos', FIXTURE_PHOTO_A);
    expect(res).to.have.status(404);
  });
});

describe('GET /api/trips/:tripId/entries (integration)', () => {
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
    const owner = await User.create({
      name: 'Owner',
      email: 'owner@test.com',
      password: 'pass1234',
    });
    const stranger = await User.create({
      name: 'Stranger',
      email: 'stranger@test.com',
      password: 'pass1234',
    });
    const privateTrip = await Trip.create({
      userId: owner._id,
      title: 'Private',
      destination: 'Paris',
      startDate: new Date('2026-06-01'),
      isPublic: false,
    });
    const publicTrip = await Trip.create({
      userId: owner._id,
      title: 'Public',
      destination: 'Tokyo',
      startDate: new Date('2026-07-01'),
      isPublic: true,
    });
    await Entry.create({
      tripId: privateTrip._id,
      userId: owner._id,
      caption: 'older',
      entryDate: new Date('2026-06-02'),
      photos: ['/uploads/a.jpg'],
    });
    await Entry.create({
      tripId: privateTrip._id,
      userId: owner._id,
      caption: 'newer',
      entryDate: new Date('2026-06-05'),
      photos: ['/uploads/b.jpg'],
    });
    await Entry.create({
      tripId: publicTrip._id,
      userId: owner._id,
      caption: 'public entry',
      photos: ['/uploads/c.jpg'],
    });
    return { owner, stranger, privateTrip, publicTrip };
  };

  it('returns the owner\'s entries sorted by entryDate ascending', async () => {
    const { owner, privateTrip } = await seed();
    const res = await chai
      .request(app)
      .get(`/api/trips/${privateTrip._id}/entries`)
      .set('Authorization', `Bearer ${tokenFor(owner._id)}`);
    expect(res).to.have.status(200);
    expect(res.body).to.have.length(2);
    expect(res.body[0].caption).to.equal('older');
    expect(res.body[1].caption).to.equal('newer');
  });

  it('returns entries for a public trip to a non-owner', async () => {
    const { stranger, publicTrip } = await seed();
    const res = await chai
      .request(app)
      .get(`/api/trips/${publicTrip._id}/entries`)
      .set('Authorization', `Bearer ${tokenFor(stranger._id)}`);
    expect(res).to.have.status(200);
    expect(res.body).to.have.length(1);
  });

  it('returns 404 for a private trip to a non-owner', async () => {
    const { stranger, privateTrip } = await seed();
    const res = await chai
      .request(app)
      .get(`/api/trips/${privateTrip._id}/entries`)
      .set('Authorization', `Bearer ${tokenFor(stranger._id)}`);
    expect(res).to.have.status(404);
  });
});
