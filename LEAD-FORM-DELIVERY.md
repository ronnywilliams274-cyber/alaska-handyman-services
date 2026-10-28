# Lead form delivery

All six pages use `lead-form.js`. Its only delivery endpoint is:

`https://formsubmit.co/ajax/alaskahandymanservices907@gmail.com`

The HTML form keeps the normal `https://formsubmit.co/alaskahandymanservices907@gmail.com` POST action as a fallback when JavaScript is unavailable. FormSubmit is the email delivery service; the recipient is only **alaskahandymanservices907@gmail.com**.

## Markup contract

- Form: `id="leadForm"`, `method="POST"`, normal FormSubmit action above.
- Named text fields: `first_name`, `last_name`, `phone`, `email`, `service`, `location`, `message`, `timeline`. The lowercase `email` field supports replying to the customer.
- Optional hidden honeypot: `_honey`. A populated value is rejected before a request is sent.
- A submit button with `type="submit"`.
- `formStatus`: status announcement region.
- `formError`: initially hidden alert region containing `formErrorMessage` and a direct email link to the sole recipient.
- `formSuccess`: initially hidden, focusable confirmation region. Its wording must describe submission acceptance, not verified inbox receipt.
- Load `lead-form.js` separately from page decoration scripts, with `defer` or at the end of the body.

The handler sends only the eight text fields and fixed subject, template, and captcha settings. It ignores arbitrary extra fields, CCs, autoresponders, webhooks, and files. No attachment upload or secondary delivery service is used.

## Failure handling

The previous handlers displayed success even when the request failed. They also used the normal browser POST endpoint with `fetch` instead of the documented AJAX endpoint. Photo inputs had no `name`, so their files were never part of the submission.

The new handler requires an HTTP success and a parsed JSON response whose `success` value is exactly `true` or `"true"`. Activation/check-email responses never count as acceptance. Invalid JSON, rejected responses, network failures, and a 20-second timeout preserve the form contents and offer a manual retry or direct email. There is no automatic retry because the first request may already have reached the service. Pending and already accepted submissions are protected against double submission.

## Verification

Run `node --test tests/lead-form.test.js` and `node --check lead-form.js`.

The 12 automated tests cover recipient and payload restrictions, boolean/string responses, HTTP and malformed response failures, email activation, network failure, request/body timeouts, browser validation, duplicate submission prevention, field preservation, manual retry, and focus/state recovery. Tests use mocked responses and send no real email.

Provider acceptance is not proof of inbox receipt. Before calling production delivery verified, submit a clearly marked test from the deployed HTTPS website, confirm any FormSubmit activation email in the recipient mailbox, and check that the lead email actually arrived. Check Spam as well. Opening an HTML file directly is not a supported production submission test.

Official references: [AJAX requests](https://formsubmit.co/ajax-documentation), [field and delivery documentation](https://formsubmit.co/documentation), and [activation and missing-message help](https://formsubmit.co/help).
