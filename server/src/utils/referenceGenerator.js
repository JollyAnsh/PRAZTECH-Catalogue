const Counter = require('../models/Counter');
const Enquiry = require('../models/Enquiry');
const { getDBStatus } = require('../config/db');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const localCounterFile = path.join(__dirname, '../../data/counter.json');
const localEnquiriesDir = path.join(__dirname, '../../data/enquiries_backup');

/**
 * Generates an Enquiry Reference Number in Format A:
 * ENQ-YYYYMMDD-HHMM (Year-Month-Day-HourMinute)
 * e.g., ENQ-20261122-1849
 *
 * If multiple enquiries occur within the same minute, appends a sequential suffix
 * e.g., ENQ-20261122-1849-2
 */
const getNextSequence = async () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  const baseRef = `ENQ-${year}${month}${day}-${hours}${minutes}`;
  const counterId = `enquiry_${year}${month}${day}_${hours}${minutes}`;

  const isDbConnected = Boolean(getDBStatus() || mongoose.connection.readyState === 1);

  // Helper to check if a reference number is already used in DB or local backup
  const isRefTaken = async (ref) => {
    if (isDbConnected) {
      try {
        const existsInDb = await Enquiry.exists({ referenceNumber: ref });
        if (existsInDb) return true;
      } catch (e) {
        // Ignore DB read error, fall through to check local file
      }
    }
    const localFile = path.join(localEnquiriesDir, `${ref}.json`);
    return fs.existsSync(localFile);
  };

  if (isDbConnected) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        counterId,
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      let seq = counter.seq;
      let ref = seq === 1 ? baseRef : `${baseRef}-${seq}`;

      // Collision safety check: ensure the ref is completely unique
      while (await isRefTaken(ref)) {
        seq += 1;
        ref = `${baseRef}-${seq}`;
        await Counter.findByIdAndUpdate(counterId, { $set: { seq } });
      }

      return ref;
    } catch (error) {
      console.warn('Counter findByIdAndUpdate failed, using local counter fallback:', error.message);
    }
  }

  // Local JSON fallback if MongoDB is not connected
  let seq = 1;
  try {
    let raw = {};
    if (fs.existsSync(localCounterFile)) {
      raw = JSON.parse(fs.readFileSync(localCounterFile, 'utf8'));
      seq = (raw[counterId] || 0) + 1;
    }
    raw[counterId] = seq;
    fs.writeFileSync(localCounterFile, JSON.stringify(raw, null, 2));
  } catch (e) {
    seq = 1;
  }

  let ref = seq === 1 ? baseRef : `${baseRef}-${seq}`;
  while (await isRefTaken(ref)) {
    seq += 1;
    ref = `${baseRef}-${seq}`;
  }

  return ref;
};

module.exports = { getNextSequence };
