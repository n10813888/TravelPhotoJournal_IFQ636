const chai = require('chai');
const Entry = require('../models/Entry');

const { expect } = chai;

describe('Entry model', () => {
  const validAttrs = () => ({
    tripId: '507f1f77bcf86cd799439011',
    userId: '507f1f77bcf86cd799439012',
    caption: 'A good day',
    photos: ['/uploads/x.jpg'],
  });

  it('validates a well-formed entry', async () => {
    const entry = new Entry(validAttrs());
    await entry.validate();
  });

  it('requires tripId', async () => {
    const entry = new Entry({ ...validAttrs(), tripId: undefined });
    try {
      await entry.validate();
      throw new Error('expected validation to fail');
    } catch (err) {
      expect(err.errors).to.have.property('tripId');
    }
  });

  it('requires userId', async () => {
    const entry = new Entry({ ...validAttrs(), userId: undefined });
    try {
      await entry.validate();
      throw new Error('expected validation to fail');
    } catch (err) {
      expect(err.errors).to.have.property('userId');
    }
  });

  it('requires at least one photo', async () => {
    const entry = new Entry({ ...validAttrs(), photos: [] });
    try {
      await entry.validate();
      throw new Error('expected validation to fail');
    } catch (err) {
      expect(err.errors).to.have.property('photos');
    }
  });

  it('defaults entryDate to now when not provided', () => {
    const before = Date.now();
    const entry = new Entry(validAttrs());
    expect(entry.entryDate).to.be.instanceOf(Date);
    expect(entry.entryDate.getTime()).to.be.at.least(before);
  });
});
