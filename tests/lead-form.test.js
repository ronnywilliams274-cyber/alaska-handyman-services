const test = require('node:test');
const assert = require('node:assert/strict');
const {
  RECIPIENT, ENDPOINT, FIELD_NAMES, buildPayload, readAcceptance, sendLead, bindLeadForm
} = require('../lead-form.js');

function sampleData(extra = {}) {
  return new Map(Object.entries({
    first_name: ' Test ', last_name: ' Customer ', phone: '907-555-0100',
    email: 'customer@example.com', service: 'Roof Repair', location: 'Anchorage',
    message: 'Please repair the flashing.', timeline: 'Flexible', ...extra
  }));
}

function response(data, ok = true) {
  return { ok, json: async () => data };
}

function fakeElement() {
  return {
    hidden: false, style: {}, textContent: '', disabled: false, attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    removeAttribute(name) { delete this.attributes[name]; },
    focus() { this.focused = true; }
  };
}

function fixture(fetchImpl, extraOptions = {}) {
  const fields = [fakeElement(), fakeElement(), fakeElement()];
  const contactFields = ['first_name', 'last_name', 'phone'].map(name => ({
    name, value: sampleData().get(name), validityMessage: '', listeners: {},
    setCustomValidity(message) { this.validityMessage = message; },
    addEventListener(type, handler) { this.listeners[type] = handler; }
  }));
  fields[1].disabled = true;
  const button = fields[2];
  button.textContent = 'Request free estimate';
  const ui = {
    success: fakeElement(), error: fakeElement(), errorMessage: fakeElement(), status: fakeElement()
  };
  ui.success.hidden = true;
  ui.error.hidden = true;
  const form = Object.assign(fakeElement(), {
    values: sampleData(), valid: true, resets: 0, listeners: [],
    reportValidity() { return this.valid && contactFields.every(field => !field.validityMessage); },
    querySelector() { return button; },
    querySelectorAll(selector) { return selector.startsWith('[name=') ? contactFields : fields; },
    reset() { this.resets++; this.values = new Map(); },
    addEventListener(type, handler) { this.listeners.push({ type, handler }); }
  });
  class FakeFormData {
    constructor(target) { this.values = new Map(target.values); }
    get(name) { return this.values.get(name) || null; }
  }
  const options = { fetchImpl, FormDataImpl: FakeFormData, ...extraOptions };
  const binding = bindLeadForm(form, ui, options);
  return { form, ui, fields, contactFields, button, options, binding, submit: () => binding.handleSubmit({ preventDefault() {} }) };
}

test('whitespace names and invalid phones are rejected before sending, and corrections can retry', async () => {
  let calls = 0;
  const f = fixture(async () => { calls++; return response({success:true}); });
  f.contactFields[0].value = '   ';
  await f.submit();
  assert.equal(calls, 0);
  assert.match(f.contactFields[0].validityMessage, /first name/);
  f.contactFields[0].value = 'Test';
  f.contactFields[2].value = 'abcdefg';
  await f.submit();
  assert.equal(calls, 0);
  assert.match(f.contactFields[2].validityMessage, /phone number/);
  f.contactFields[2].value = '+1 (907) 555-0100 ext. 12';
  await f.submit();
  assert.equal(calls, 1);
});

test('payload keeps only the eight text fields and fixed provider controls', () => {
  const payload = buildPayload(sampleData({
    _cc: 'unwanted@example.com', _webhook: 'https://unwanted.example/',
    _autoresponse: 'Do not send', _subject: 'Tampered', _replyto: 'unwanted@example.com',
    attachment: new Blob(['fake image']), recipient: 'unwanted@example.com'
  }));
  assert.deepEqual(Object.keys(payload), [...FIELD_NAMES, '_subject', '_template', '_captcha']);
  assert.equal(payload.first_name, 'Test');
  assert.equal(payload.email, 'customer@example.com');
  assert.equal(payload._subject, 'New Free Estimate Request — Alaska Handyman Services');
  assert.equal(buildPayload(sampleData({ message: new Blob(['not text']) })).message, '');
});

test('request uses the sole recipient, JSON, and no cookies or alternative destinations', async () => {
  let call;
  const result = await sendLead(sampleData(), {
    fetchImpl: async (url, options) => { call = { url, options }; return response({ success: 'true' }); }
  });
  assert.equal(RECIPIENT, 'alaskahandymanservices907@gmail.com');
  assert.equal(call.url, 'https://formsubmit.co/ajax/alaskahandymanservices907@gmail.com');
  assert.equal(call.url, ENDPOINT);
  assert.equal(call.options.method, 'POST');
  assert.equal(call.options.headers['Content-Type'], 'application/json');
  assert.equal(call.options.credentials, 'omit');
  assert.equal(JSON.parse(call.options.body).email, 'customer@example.com');
  assert.deepEqual(result, { accepted: true });
});

test('only literal true or string true indicate provider acceptance', async () => {
  for (const success of [true, 'true']) assert.deepEqual(await readAcceptance(response({ success })), { accepted: true });
  for (const success of [false, 'false', 1, '1', undefined, 'TRUE']) {
    await assert.rejects(readAcceptance(response({ success })), { code: 'rejected' });
  }
});

test('HTTP failures, invalid JSON and unexpected response shapes never become success', async () => {
  await assert.rejects(readAcceptance(response({ success: true }, false)), { code: 'http' });
  await assert.rejects(readAcceptance({ ok: true, json: async () => { throw new SyntaxError(); } }), { code: 'invalid-response' });
  for (const body of [null, [], 'Thank you', 42]) {
    await assert.rejects(readAcceptance(response(body)), { code: 'invalid-response' });
  }
});

test('activation and check-email messages never claim lead acceptance', async () => {
  for (const message of [
    'This form needs Activation.', 'Please check your email.',
    'Your form will be actived once you click the link.', 'Confirm your email to continue.'
  ]) {
    for (const success of [true, 'true', false]) {
      await assert.rejects(readAcceptance(response({ success, message })), { code: 'activation' });
    }
  }
});

test('network rejection remains a failure and honeypot does not send', async () => {
  await assert.rejects(sendLead(sampleData(), { fetchImpl: async () => { throw new TypeError('offline'); } }), { code: 'network' });
  let calls = 0;
  await assert.rejects(sendLead(sampleData({ _honey: 'bot' }), { fetchImpl: async () => { calls++; } }), { code: 'validation' });
  assert.equal(calls, 0);
});

test('deadline aborts a stalled request and also covers a stalled response body', async () => {
  let signal;
  await assert.rejects(sendLead(sampleData(), {
    timeoutMs: 5,
    fetchImpl: async (_, options) => { signal = options.signal; return new Promise(() => {}); }
  }), { code: 'timeout' });
  assert.equal(signal.aborted, true);
  await assert.rejects(sendLead(sampleData(), {
    timeoutMs: 5, fetchImpl: async () => ({ ok: true, json: () => new Promise(() => {}) })
  }), { code: 'timeout' });
});

test('invalid form does not submit, reset, or reveal success', async () => {
  let calls = 0;
  const f = fixture(async () => { calls++; return response({ success: true }); });
  f.form.valid = false;
  await f.submit();
  assert.equal(calls, 0);
  assert.equal(f.form.resets, 0);
  assert.equal(f.ui.success.hidden, true);
});

test('one request at a time; confirmed acceptance resets and focuses success exactly once', async () => {
  let resolveRequest;
  let calls = 0;
  const f = fixture(() => { calls++; return new Promise(resolve => { resolveRequest = resolve; }); });
  const first = f.submit();
  await Promise.resolve();
  assert.equal(f.button.disabled, true);
  assert.equal(f.form.attributes['aria-busy'], 'true');
  await f.submit();
  assert.equal(calls, 1);
  resolveRequest(response({ success: 'true', message: 'The form was submitted successfully.' }));
  await first;
  assert.equal(f.form.resets, 1);
  assert.equal(f.form.hidden, true);
  assert.equal(f.ui.success.hidden, false);
  assert.equal(f.ui.success.focused, true);
  assert.equal(f.ui.error.hidden, true);
  assert.equal(f.fields[0].disabled, false);
  assert.equal(f.fields[1].disabled, true);
  assert.equal(f.button.disabled, false);
  assert.equal(f.button.textContent, 'Request free estimate');
  await f.submit();
  assert.equal(calls, 1);
});

test('failure preserves all input and enables a manual retry; success follows only acceptance', async () => {
  let calls = 0;
  const f = fixture(async () => ++calls === 1 ? response({ success: 'false' }) : response({ success: true }));
  const before = new Map(f.form.values);
  await f.submit();
  assert.deepEqual(f.form.values, before);
  assert.equal(f.form.resets, 0);
  assert.equal(f.form.hidden, false);
  assert.equal(f.ui.success.hidden, true);
  assert.equal(f.ui.error.hidden, false);
  assert.equal(f.ui.error.focused, true);
  assert.match(f.ui.errorMessage.textContent, /could not confirm/);
  assert.equal(f.button.disabled, false);
  assert.equal(f.ui.status.textContent, '');
  assert.equal(f.form.attributes['aria-busy'], undefined);
  await f.submit();
  assert.equal(calls, 2);
  assert.equal(f.form.resets, 1);
  assert.equal(f.ui.error.hidden, true);
  assert.equal(f.ui.success.hidden, false);
});

test('activation and timeout expose recovery without erasing the request', async () => {
  const activation = fixture(async () => response({ success: true, message: 'Activate your form.' }));
  await activation.submit();
  assert.match(activation.ui.errorMessage.textContent, /temporarily unavailable/);
  assert.equal(activation.form.resets, 0);
  assert.equal(activation.ui.success.hidden, true);
  const timeout = fixture(async () => new Promise(() => {}), { timeoutMs: 5 });
  await timeout.submit();
  assert.match(timeout.ui.errorMessage.textContent, /cannot tell whether/);
  assert.equal(timeout.form.resets, 0);
  assert.equal(timeout.button.disabled, false);
});

test('binding the same form twice does not attach duplicate submit handlers', () => {
  const f = fixture(async () => response({ success: true }));
  assert.equal(bindLeadForm(f.form, f.ui, f.options), f.binding);
  assert.equal(f.form.listeners.length, 1);
});
