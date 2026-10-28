# Lead form delivery

All six pages use `lead-form.js`. Its only delivery endpoint is:

`https://formspree.io/f/mqppbolp`

The HTML form keeps `https://formspree.io/f/mqppbolp` as the native `action` fallback for when JavaScript is unavailable or the page is served over a non-HTTPS origin. Formspree is the email delivery service; the form was configured in the Formspree dashboard.

## Markup contract

- Form: `id="leadForm"`, `method="POST"`, native Formspree action above.
- Named text fields: `first_name`, `last_name`, `phone`, `email`, `service`, `location`, `message`, `timeline`. The lowercase `email` field supports replying to the customer.
- Hidden field: `_subject` — sets the email subject line (Formspree supports this).
- Optional hidden honeypot: `_honey`. A populated value is rejected before a request is sent.
- A submit button with `type="submit"`.
- `formStatus`: status announcement region.
- `formError`: initially hidden alert region containing `formErrorMessage` and a direct email link.
- `formSuccess`: initially hidden, focusable confirmation region. Its wording must describe submission acceptance, not verified inbox receipt.
- Load `lead-form.js` separately from page decoration scripts, with `defer` or at the end of the body.

The handler sends only the eight text fields and a fixed subject. It ignores arbitrary extra fields, CCs, autoresponders, webhooks, and files. No attachment upload or secondary delivery service is used.

## Formspree API

The AJAX handler POSTs JSON to `https://formspree.io/f/mqppbolp` with `Content-Type: application/json` and `Accept: application/json`. Formspree signals acceptance with `{"ok": true}`. Any other value — including `{"ok": false}` with an errors array — is treated as a rejection. There is no activation step; the endpoint is live immediately after the form is configured in the Formspree dashboard.

## Failure handling

The handler requires an HTTP success and a parsed JSON response whose `ok` value is exactly `true`. Invalid JSON, rejected responses, network failures, and a 45-second timeout preserve the form contents and offer a manual retry or direct email. There is no automatic retry because the first request may already have reached the service.

## Verification

Run `node --test tests/lead-form.test.js` and `node --check lead-form.js`.

The 12 automated tests cover payload restrictions, Formspree acceptance signal, HTTP and malformed response failures, network failure, request/body timeouts, browser validation, duplicate submission prevention, field preservation, manual retry, and focus/state recovery. Tests use mocked responses and send no real email.

Provider acceptance is not proof of inbox receipt. Before calling production delivery verified, submit a clearly marked test from the deployed HTTPS website and confirm that the lead email arrived in the Formspree-configured inbox. Check Spam as well. Opening an HTML file directly is not a supported production submission test.

Official reference: [Formspree AJAX / JSON API](https://help.formspree.io/hc/en-us/articles/360013470814-Ajax-JSON-submissions)
