const chai = require('chai');
const sinon = require('sinon');
const Trip = require('../models/Trip');
const { createTrip } = require('../controllers/tripController');

const { expect } = chai;

const makeRes = () => {
  const res = {};
  res.status = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  return res;
};

const baseReq = (overrides = {}) => ({
  user: { id: '507f1f77bcf86cd799439011' },
  body: {
    title: 'Iceland Road Trip',
    destination: 'Reykjavik',
    startDate: '2026-06-01',
    endDate: '2026-06-10',
    description: 'A scenic drive',
    isPublic: 'false',
  },
  ...overrides,
});

describe('Trip controller - createTrip', () => {
  afterEach(() => sinon.restore());

  it('creates a trip and returns 201', async () => {
    const created = { _id: 'trip1', title: 'Iceland Road Trip' };
    sinon.stub(Trip, 'create').resolves(created);

    const req = baseReq();
    const res = makeRes();
    await createTrip(req, res);

    expect(Trip.create.calledOnce).to.equal(true);
    const arg = Trip.create.firstCall.args[0];
    expect(arg.userId).to.equal(req.user.id);
    expect(arg.title).to.equal('Iceland Road Trip');
    expect(arg.isPublic).to.equal(false);
    expect(res.status.calledWith(201)).to.equal(true);
    expect(res.json.calledWith(created)).to.equal(true);
  });

  it('returns 400 when title is missing', async () => {
    const create = sinon.stub(Trip, 'create');
    const req = baseReq({ body: { destination: 'X', startDate: '2026-06-01' } });
    const res = makeRes();
    await createTrip(req, res);
    expect(create.notCalled).to.equal(true);
    expect(res.status.calledWith(400)).to.equal(true);
  });

  it('returns 400 when destination is missing', async () => {
    const create = sinon.stub(Trip, 'create');
    const req = baseReq({ body: { title: 'X', startDate: '2026-06-01' } });
    const res = makeRes();
    await createTrip(req, res);
    expect(create.notCalled).to.equal(true);
    expect(res.status.calledWith(400)).to.equal(true);
  });

  it('returns 400 when startDate is missing', async () => {
    const create = sinon.stub(Trip, 'create');
    const req = baseReq({ body: { title: 'X', destination: 'Y' } });
    const res = makeRes();
    await createTrip(req, res);
    expect(create.notCalled).to.equal(true);
    expect(res.status.calledWith(400)).to.equal(true);
  });

  it('returns 400 when endDate is before startDate', async () => {
    const create = sinon.stub(Trip, 'create');
    const req = baseReq({
      body: {
        title: 'X',
        destination: 'Y',
        startDate: '2026-06-10',
        endDate: '2026-06-01',
      },
    });
    const res = makeRes();
    await createTrip(req, res);
    expect(create.notCalled).to.equal(true);
    expect(res.status.calledWith(400)).to.equal(true);
  });

  it('parses isPublic truthy strings as true', async () => {
    sinon.stub(Trip, 'create').resolves({ _id: 'trip2' });
    const req = baseReq({ body: { ...baseReq().body, isPublic: 'true' } });
    const res = makeRes();
    await createTrip(req, res);
    expect(Trip.create.firstCall.args[0].isPublic).to.equal(true);
  });

  it('stores cover photo URL when file is uploaded', async () => {
    sinon.stub(Trip, 'create').resolves({ _id: 'trip3' });
    const req = baseReq({ file: { filename: 'abc123.jpg' } });
    const res = makeRes();
    await createTrip(req, res);
    expect(Trip.create.firstCall.args[0].coverPhoto).to.equal('/uploads/abc123.jpg');
  });

  it('returns 500 when Trip.create throws unexpectedly', async () => {
    sinon.stub(Trip, 'create').rejects(new Error('db down'));
    const req = baseReq();
    const res = makeRes();
    await createTrip(req, res);
    expect(res.status.calledWith(500)).to.equal(true);
  });
});
