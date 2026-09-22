const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function load(name) {
  const filename = path.join(__dirname, '../data', name + '.ts');
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  new Function('module', 'exports', 'require', compiled)(module, module.exports, require);
  return module.exports;
}
const schedule = load('taxiRequest');
const transport = load('transport');

test('Mexico City schedule ignores device timezone, including summer dates', () => {
  for (const date of ['2026-01-20', '2026-07-20']) {
    assert.equal(schedule.buildScheduledAt(date, '07:00'), `${date}T13:00:00.000Z`);
    assert.equal(schedule.buildScheduledAt(date, '21:00'), schedule.shiftTaxiDate(date, 1) + 'T03:00:00.000Z');
  }
});
test('24-hour boundary is inclusive and no 48-hour maximum exists', () => {
  const now = new Date('2026-09-12T13:00:00Z');
  assert.equal(schedule.taxiScheduleError('2026-09-13', '07:00', now), null);
  assert.notEqual(schedule.taxiScheduleError('2026-09-13', '07:00', new Date(now.getTime() + 1)), null);
  assert.equal(schedule.taxiScheduleError('2027-12-25', '21:00', now), null);
});
test('invalid calendar dates and unsupported times are rejected', () => {
  assert.throws(() => schedule.buildScheduledAt('2026-02-30', '07:00'));
  assert.throws(() => schedule.buildScheduledAt('2026-09-20', 'now'));
  assert.throws(() => schedule.buildScheduledAt('2026-09-20', '08:30'));
});
test('request builder preserves destination identity and validates all selections', () => {
  const destination = { id: 'test-place', label: 'Test place', category: 'tourist', coordinates: { latitude: 19.4, longitude: -99.1 }, placeId: 'test-place-id' };
  const draft = { category: 'tourist', destination, date: '2026-10-01', time: '07:00', passengers: 1, luggage: false };
  const now = new Date('2026-09-01');
  const payload = schedule.buildTaxiRequestPayload(draft, 'asl_guided', now);
  assert.equal(payload.destinationId, destination.id);
  assert.deepEqual(payload.destinationCoords, destination.coordinates);
  assert.equal(payload.scheduledAt, '2026-10-01T13:00:00.000Z');
  assert.equal(payload.sourceMode, 'asl_guided');
  assert.match(payload.summary, /1 person - no luggage/);
  for (const patch of [{ category: 'hospitals' }, { passengers: 7 }, { luggage: null }, { destination: null }]) {
    assert.throws(() => schedule.buildTaxiRequestPayload({ ...draft, ...patch }, 'text_guided', now));
  }
});
test('new revisions do not show old vehicles or acceptance as current', () => {
  const details = { transportProposals: { revision: 2, options: [] }, transportAcceptance: { revision: 1 }, transportResponse: { vehicles: [{ vehiclePlate: 'OLD', vehicleModel: 'Old model' }] } };
  assert.equal(transport.isCurrentAcceptance(details), false);
  assert.deepEqual(transport.assignedVehicles(details), []);
  assert.equal(transport.transportStage(details, 'pending'), 'NEW OPTIONS - ACCEPT AGAIN');
  assert.equal(transport.transportStage(details, 'cancelled'), 'REQUEST CANCELLED');
});
test('legacy responses render and missing details remain safe', () => {
  assert.deepEqual(transport.transportDetails(null), {});
  assert.deepEqual(transport.assignedVehicles({ transportResponse: { vehiclePlate: 'ABC', vehicleModel: 'Sedan' } }), [{ vehiclePlate: 'ABC', vehicleModel: 'Sedan' }]);
  assert.equal(transport.formatTransportPrice(12345), '$123.45 MXN');
  assert.equal(transport.formatTransportPrice(0), '$0.00 MXN');
});
