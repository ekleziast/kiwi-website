// i18n.js - Internationalization for Kiwi Voice website
// Manages bilingual EN/RU language switching with localStorage persistence

const i18n = {
  currentLang: 'en',

  init() {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('kiwi-lang');
    if (saved && (saved === 'en' || saved === 'ru')) {
      this.currentLang = saved;
    }
    this.apply();
    this.setupToggle();
  },

  setLang(lang) {
    this.currentLang = lang;
    localStorage.setItem('kiwi-lang', lang);
    this.apply();
  },

  apply() {
    // Handle elements with data-en and data-ru attributes
    document.querySelectorAll('[data-en][data-ru]').forEach(el => {
      el.textContent = el.getAttribute(`data-${this.currentLang}`);
    });

    // Handle lang-en / lang-ru visibility blocks
    document.querySelectorAll('.lang-en').forEach(el => {
      el.classList.toggle('hidden', this.currentLang !== 'en');
    });
    document.querySelectorAll('.lang-ru').forEach(el => {
      el.classList.toggle('hidden', this.currentLang !== 'ru');
    });

    // Update toggle buttons to reflect active language
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
    });

    // Update html lang attribute
    document.documentElement.lang = this.currentLang;
  },

  setupToggle() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setLang(btn.dataset.lang);
      });
    });
  }
};
