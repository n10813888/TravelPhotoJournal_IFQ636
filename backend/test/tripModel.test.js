const chai = require('chai');
const Trip = require('../models/Trip');

const { expect } = chai;

describe('Trip model', () => {
  const validAttrs = () => ({
    userId: '507f1f77bcf86cd799439011',
    title: 'Iceland Road Trip',
    destination: 'Reykjavik',
    startDate: new Date('2026-06-01'),
    endDate: new Date('2026-06-10'),
  });

  it('validates a well-formed trip', async () => {
    const trip = new Trip(validAttrs());
    await trip.validate();
  });

  it('requires title', async () => {
    const trip = new Trip({ ...validAttrs(), title: undefined });
    try {
      await trip.validate();
      throw new Error('expected validation to fail');
    } catch (err) {
      expect(err.errors).to.have.property('title');
    }
  });

  it('requires destination', async () => {
    const trip = new Trip({ ...validAttrs(), destination: undefined });
    try {
      await trip.validate();
      throw new Error('expected validation to fail');
    } catch (err) {
      expect(err.errors).to.have.property('destination');
    }
  });

  it('requires startDate', async () => {
    const trip = new Trip({ ...validAttrs(), startDate: undefined });
    try {
      await trip.validate();
      throw new Error('expected validation to fail');
    } catch (err) {
      expect(err.errors).to.have.property('startDate');
    }
  });

  it('requires userId', async () => {
    const trip = new Trip({ ...validAttrs(), userId: undefined });
    try {
      await trip.validate();
      throw new Error('expected validation to fail');
    } catch (err) {
      expect(err.errors).to.have.property('userId');
    }
  });

  it('rejects endDate before startDate', async () => {
    const trip = new Trip({
      ...validAttrs(),
      startDate: new Date('2026-06-10'),
      endDate: new Date('2026-06-01'),
    });
    try {
      await trip.validate();
      throw new Error('expected validation to fail');
    } catch (err) {
      expect(err.errors).to.have.property('endDate');
    }
  });

  it('allows endDate equal to startDate', async () => {
    const trip = new Trip({
      ...validAttrs(),
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-01'),
    });
    await trip.validate();
  });

  it('allows omitting endDate', async () => {
    const trip = new Trip({ ...validAttrs(), endDate: undefined });
    await trip.validate();
  });

  it('defaults isPublic to false', () => {
    const trip = new Trip(validAttrs());
    expect(trip.isPublic).to.equal(false);
  });
});
