const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const THEME_KEY = 'theme';

const getTheme = () => root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';

const applyTheme = (theme) => {
  if (theme === 'light') {
    root.setAttribute('data-theme', 'light');
  } else {
    root.removeAttribute('data-theme');
  }
  if (themeToggle) {
    themeToggle.setAttribute(
      'aria-label',
      theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'
    );
  }
};

if (themeToggle) {
  applyTheme(getTheme());
  themeToggle.addEventListener('click', () => {
    const next = getTheme() === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (error) {}
  });
}

// Keep tabs in sync when the theme is changed in another window
window.addEventListener('storage', (event) => {
  if (event.key === THEME_KEY) {
    applyTheme(event.newValue === 'light' ? 'light' : 'dark');
  }
});

// Contact form
// Leave CONTACT_ENDPOINT empty to fall back to opening the visitor's mail app
// with everything pre-filled. To post for real, paste an endpoint URL here, e.g.
//   'https://formspree.io/f/xxxxxxxx'  (Formspree)
//   'https://api.web3forms.com/submit' (Web3Forms — also needs an access_key in the payload)
const CONTACT_ENDPOINT = '';
const CONTACT_EMAIL = 'princekumar.iiitbh@gmail.com';

const contactForm = document.getElementById('contact-form');

if (contactForm) {
  const statusEl = document.getElementById('form-status');
  const submitBtn = document.getElementById('cf-submit');
  const honeypot = document.getElementById('cf-company');
  const fields = {
    name: document.getElementById('cf-name'),
    email: document.getElementById('cf-email'),
    message: document.getElementById('cf-message'),
  };

  const validators = {
    name(value) {
      const trimmed = value.trim();
      if (!trimmed) return 'Please enter your name.';
      if (trimmed.length < 2) return 'Please enter your full name.';
      return '';
    },
    email(value) {
      const trimmed = value.trim();
      if (!trimmed) return 'Please enter your email address.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
        return 'Please enter a valid email address.';
      }
      return '';
    },
    message(value) {
      const trimmed = value.trim();
      if (!trimmed) return 'Please add a message.';
      if (trimmed.length < 10) return 'Please add a little more detail.';
      return '';
    },
  };

  const setFieldError = (key, message) => {
    const input = fields[key];
    const slot = contactForm.querySelector(`[data-error-for="cf-${key}"]`);
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (slot) slot.textContent = message;
  };

  const validate = () => {
    let firstInvalid = null;
    Object.keys(fields).forEach((key) => {
      const message = validators[key](fields[key].value);
      setFieldError(key, message);
      if (message && !firstInvalid) firstInvalid = fields[key];
    });
    return firstInvalid;
  };

  const setStatus = (text, kind) => {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = kind ? `form-status is-${kind}` : 'form-status';
  };

  Object.keys(fields).forEach((key) => {
    const input = fields[key];
    input.addEventListener('blur', () => {
      setFieldError(key, validators[key](input.value));
    });
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') {
        setFieldError(key, validators[key](input.value));
      }
    });
  });

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Silently drop submissions that filled the hidden trap field
    if (honeypot && honeypot.value) return;

    const firstInvalid = validate();
    if (firstInvalid) {
      firstInvalid.focus();
      setStatus('Please fix the highlighted fields.', 'error');
      return;
    }

    const name = fields.name.value.trim();
    const email = fields.email.value.trim();
    const message = fields.message.value.trim();

    if (!CONTACT_ENDPOINT) {
      const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      setStatus(
        `Opening your email app so you can send this. If nothing happened, email me directly at ${CONTACT_EMAIL}.`,
        'ok'
      );
      return;
    }

    submitBtn.disabled = true;
    setStatus('Sending your message…', 'ok');

    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (!response.ok) throw new Error('Request failed with ' + response.status);

      contactForm.reset();
      Object.keys(fields).forEach((key) => setFieldError(key, ''));
      setStatus('Thanks — your message is on its way. I usually reply within a day or two.', 'ok');
    } catch (error) {
      setStatus(
        `Something went wrong and the message was not sent. Please email me directly at ${CONTACT_EMAIL}.`,
        'error'
      );
    } finally {
      submitBtn.disabled = false;
    }
  });
}

const navLinks = document.querySelectorAll('nav ul a[href^="#"]');
const sections = document.querySelectorAll('main section');
const footer = document.querySelector('footer');

// Highlight active nav item while scrolling
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const id = entry.target.getAttribute('id');
      const navLink = document.querySelector(`nav ul a[href='#${id}']`);

      if (!navLink || !entry.isIntersecting) return;

      navLinks.forEach((link) => link.classList.remove('active'));
      navLink.classList.add('active');
    });
  },
  {
    threshold: 0.5,
  }
);

sections.forEach((section) => {
  section.classList.add('reveal');
  sectionObserver.observe(section);
});

// Reveal effect for sections
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
      }
    });
  },
  {
    threshold: 0.2,
  }
);

sections.forEach((section) => revealObserver.observe(section));

// Update footer year dynamically
if (footer) {
  const year = new Date().getFullYear();
  const yearElement = document.querySelector('#footer-year');
  if (yearElement) {
    yearElement.textContent = year;
  }
}

// Smooth scroll for nav links on older browsers
navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const targetId = link.getAttribute('href');
    const target = document.querySelector(targetId);

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
