/* Shared lead delivery for every page. Keep this separate from visual enhancements. */
(function (root) {
  'use strict';

  const FORM_ID   = 'mqppbolp';
  const ENDPOINT  = 'https://formspree.io/f/' + FORM_ID;
  const FIELD_NAMES = Object.freeze([
    'first_name', 'last_name', 'phone', 'email',
    'service', 'location', 'message', 'timeline'
  ]);
  const boundForms = new WeakMap();

  class LeadError extends Error {
    constructor(code) {
      super(code);
      this.name = 'LeadError';
      this.code = code;
    }
  }

  function buildPayload(formData) {
    // Never forward arbitrary hidden controls, attachments, CCs, or webhooks.
    const payload = {};
    FIELD_NAMES.forEach(function (name) {
      const value = formData.get(name);
      payload[name] = typeof value === 'string' ? value.trim() : '';
    });
    payload._subject = 'New Free Estimate Request - Alaska Handyman Services';
    return payload;
  }

  async function readAcceptance(response) {
    if (!response || !response.ok) throw new LeadError('http');
    let data;
    try {
      data = await response.json();
    } catch (error) {
      throw new LeadError('invalid-response');
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new LeadError('invalid-response');
    }
    // Formspree signals acceptance with {ok: true}.
    if (data.ok !== true) {
      throw new LeadError('rejected');
    }
    return { accepted: true };
  }

  async function sendLead(formData, options) {
    options = options || {};
    if (formData.get('_honey')) throw new LeadError('validation');
    const fetchImpl       = options.fetchImpl        || root.fetch.bind(root);
    const Controller      = options.AbortControllerImpl || root.AbortController;
    const controller      = new Controller();
    // 10 s is plenty for Formspree's infrastructure while protecting the user
    // from an indefinitely stalled connection.
    const timeoutMs = options.timeoutMs === undefined ? 10000 : options.timeoutMs;
    let timer;
    const deadline = new Promise(function (_, reject) {
      timer = setTimeout(function () {
        reject(new LeadError('timeout'));
        controller.abort();
      }, timeoutMs);
    });
    try {
      const request = Promise.resolve().then(function () {
        return fetchImpl(ENDPOINT, {
          method:         'POST',
          headers:        { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          credentials:    'omit',
          referrerPolicy: 'strict-origin-when-cross-origin',
          signal:         controller.signal,
          body:           JSON.stringify(buildPayload(formData))
        });
      }).then(readAcceptance);
      return await Promise.race([request, deadline]);
    } catch (error) {
      if (error instanceof LeadError) throw error;
      throw new LeadError('network');
    } finally {
      clearTimeout(timer);
    }
  }

  function errorMessage(error) {
    if (error.code === 'timeout') {
      return 'Our server took too long to respond. Please try again — your details are still here. If this keeps happening, email us directly.';
    }
    if (error.code === 'validation') {
      return 'We could not send this request. Please email us directly using the link below.';
    }
    return 'We could not confirm your request was sent. Your details are still here. Please try again or email us directly using the link below.';
  }

  function show(element) {
    element.hidden = false;
    element.style.display = 'block';
  }

  function hide(element) {
    element.hidden = true;
    element.style.display = 'none';
  }

  function focusMessage(element) {
    element.setAttribute('tabindex', '-1');
    element.focus();
  }

  function bindLeadForm(form, ui, options) {
    if (boundForms.has(form)) return boundForms.get(form);
    options = options || {};
    const FormDataImpl = options.FormDataImpl || root.FormData;
    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
    const originalLabel = submitButton ? submitButton.textContent : '';
    let pending  = false;
    let accepted = false;

    // Native required validation accepts spaces; reject unusable contact values.
    const contactFields = Array.from(form.querySelectorAll('[name="first_name"], [name="last_name"], [name="phone"]'));
    function validateContactFields() {
      contactFields.forEach(function (field) {
        let message = '';
        if (!field.value.trim()) message = 'Please enter your ' + (field.name === 'phone' ? 'phone number.' : field.name.replace('_', ' ') + '.');
        if (field.name === 'phone' && field.value.trim()) {
          const base  = field.value.replace(/(?:ext\.?|x|#)\s*\d+\s*$/i, '');
          const count = base.replace(/\D/g, '').length;
          if (count < 7 || count > 15 || !/^[+\d\s().-]+$/.test(base)) message = 'Please enter a phone number with 7 to 15 digits.';
        }
        field.setCustomValidity(message);
      });
    }
    contactFields.forEach(function (field) { field.addEventListener('input', function () { field.setCustomValidity(''); }); });

    async function handleSubmit(event) {
      event.preventDefault();
      if (pending || accepted) return;
      validateContactFields();
      if (!form.reportValidity()) return;

      pending = true;
      hide(ui.error);
      hide(ui.success);
      if (ui.status) ui.status.textContent = 'Sending your request...';
      form.setAttribute('aria-busy', 'true');

      let controls = [];
      try {
        const formData = new FormDataImpl(form);
        controls = Array.from(form.querySelectorAll('input, select, textarea, button')).map(function (control) {
          const state = { control: control, disabled: control.disabled };
          control.disabled = true;
          return state;
        });
        if (submitButton) submitButton.textContent = 'Sending...';
        await sendLead(formData, options);
        accepted = true;
        form.reset();
        hide(form);
        show(ui.success);
        if (ui.status) ui.status.textContent = '';
        focusMessage(ui.success);
      } catch (error) {
        if (ui.errorMessage) ui.errorMessage.textContent = errorMessage(error);
        if (ui.status) ui.status.textContent = '';
        show(ui.error);
        focusMessage(ui.error);
      } finally {
        controls.forEach(function (state) { state.control.disabled = state.disabled; });
        if (submitButton) submitButton.textContent = originalLabel;
        form.removeAttribute('aria-busy');
        pending = false;
      }
    }

    form.addEventListener('submit', handleSubmit);
    const binding = { handleSubmit: handleSubmit };
    boundForms.set(form, binding);
    return binding;
  }

  function init(document) {
    // Older browsers can still use the HTML form's normal POST action.
    if (!root.fetch || !root.FormData || !root.AbortController) return;
    // NOTE: No protocol guard — Formspree's CORS policy allows submissions
    // from both https:// and http:// origins. Removing the guard ensures
    // the JS Ajax handler always attaches instead of falling through to a
    // native POST that redirects the user away to Formspree's own page.
    const form = document.getElementById('leadForm');
    if (!form) return;
    const ui = {
      success:      document.getElementById('formSuccess'),
      error:        document.getElementById('formError'),
      errorMessage: document.getElementById('formErrorMessage'),
      status:       document.getElementById('formStatus')
    };
    if (!ui.success || !ui.error || !ui.errorMessage || !ui.status) return;
    bindLeadForm(form, ui);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FORM_ID, ENDPOINT, FIELD_NAMES, LeadError, buildPayload, readAcceptance, sendLead, bindLeadForm };
  } else if (root.document) {
    if (root.document.readyState === 'loading') {
      root.document.addEventListener('DOMContentLoaded', function () { init(root.document); }, { once: true });
    } else {
      init(root.document);
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
