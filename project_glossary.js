(function() {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================
  const CONFIG = {
    itemsPerPage: 8,
    zIndex: 10000
  };

  // ============================================
  // STATE
  // ============================================
  let GLOSSARY = {};
  let currentPage = 1;
  let filteredTerms = [];
  let allTerms = [];

  // ============================================
  // STYLES
  // ============================================
  const STYLES = `
    .glossary-trigger {
      position: fixed;
      bottom: 1.5rem;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgb(0, 123, 255);
      background-image: none;
      color: rgb(255, 255, 255);
      border: 0.625px solid rgba(0, 0, 0, 0);
      border-radius: 5.25px;
      padding: 0 17.5px;
      height: 46px;
      font-family: -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
      font-size: 15.75px;
      font-weight: 500;
      font-feature-settings: "tnum";
      line-height: 24.5px;
      text-align: center;
      text-decoration: none;
      text-transform: none;
      white-space: nowrap;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      vertical-align: top;
      user-select: none;
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      box-sizing: border-box;
      appearance: button;
      z-index: ${CONFIG.zIndex};
    }
    .glossary-trigger:hover {
      background-color: rgb(0, 105, 217);
    }
    .glossary-trigger svg {
      width: 16px;
      height: 16px;
    }

    .glossary-overlay {
      position: fixed;
      inset: 0;
      background: rgba(170, 170, 170, 0.3);
      backdrop-filter: blur(4px);
      z-index: ${CONFIG.zIndex + 1};
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }
    .glossary-overlay.active {
      opacity: 1;
      visibility: visible;
    }

    .glossary-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.95);
      width: min(90vw, 700px);
      max-height: 85vh;
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 3px;
      z-index: ${CONFIG.zIndex + 2};
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 0 5px #666;
      font-family: Arial, Helvetica, sans-serif;
    }
    .glossary-modal.active {
      opacity: 1;
      visibility: visible;
      transform: translate(-50%, -50%) scale(1);
    }

    .glossary-header {
      padding: 0.4em 1em;
      border-bottom: 1px solid #ddd;
      background: #e9e9e9;
      flex-shrink: 0;
    }
    .glossary-header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .glossary-header h2 {
      font-size: 1.25rem;
      font-weight: bold;
      color: #333;
      margin: 0;
    }
    .glossary-close {
      background: #f6f6f6;
      border: 1px solid #c5c5c5;
      color: #454545;
      cursor: pointer;
      padding: 0.4rem;
      border-radius: 3px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .glossary-close:hover {
      background: #ededed;
      border-color: #ccc;
      color: #2b2b2b;
    }
    .glossary-close svg {
      width: 18px;
      height: 18px;
    }

    .glossary-search {
      position: relative;
    }
    .glossary-search input {
      width: 100%;
      padding: 0.5em 1em 0.5em 2.25rem;
      background: #fff;
      border: 1px solid #c5c5c5;
      border-radius: 3px;
      color: #333;
      font-family: inherit;
      font-size: 1em;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }
    .glossary-search input::placeholder {
      color: #777;
    }
    .glossary-search input:focus {
      outline: none;
      border-color: #003eff;
      box-shadow: 0 0 3px 1px #5e9ed6;
    }
    .glossary-search-icon {
      position: absolute;
      left: 0.6rem;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      color: #777;
    }
    .glossary-search-count {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.75rem;
      color: #777;
    }

    .glossary-content {
      flex: 1;
      overflow-y: auto;
      padding: 0.5em 1em;
      background: #fff;
    }
    .glossary-content::-webkit-scrollbar {
      width: 8px;
    }
    .glossary-content::-webkit-scrollbar-track {
      background: #f6f6f6;
    }
    .glossary-content::-webkit-scrollbar-thumb {
      background: #c5c5c5;
      border-radius: 3px;
    }
    .glossary-content::-webkit-scrollbar-thumb:hover {
      background: #777;
    }

    .glossary-entry {
      padding: 1rem 0;
      border-bottom: 1px solid #ddd;
      animation: glossaryFadeIn 0.2s ease;
    }
    .glossary-entry:last-child {
      border-bottom: none;
    }
    @keyframes glossaryFadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .glossary-term {
      font-size: 1.1rem;
      color: #007fff;
      margin-bottom: 0.4rem;
      font-weight: bold;
    }
    .glossary-definition {
      color: #333;
      font-size: 0.875rem;
      line-height: 1.5715;
    }
    .glossary-definition strong {
      color: #2b2b2b;
      font-weight: bold;
    }
    .glossary-see-also {
      margin-top: 0.6rem;
      font-size: 0.8rem;
      color: #777;
      font-style: italic;
    }
    .glossary-see-also span {
      color: #007fff;
      cursor: pointer;
      transition: color 0.2s ease;
    }
    .glossary-see-also span:hover {
      color: #003eff;
      text-decoration: underline;
    }

    .glossary-no-results {
      text-align: center;
      padding: 2.5rem 1rem;
      color: #777;
    }
    .glossary-no-results svg {
      width: 40px;
      height: 40px;
      margin-bottom: 0.75rem;
      opacity: 0.5;
    }

    .glossary-footer {
      padding: 0.5em 1em;
      border-top: 1px solid #ddd;
      background: #e9e9e9;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    }
    .glossary-page-info {
      font-size: 0.8rem;
      color: #454545;
    }
    .glossary-pagination {
      display: flex;
      gap: 0.4rem;
    }
    .glossary-btn {
      background: #f6f6f6;
      border: 1px solid #c5c5c5;
      color: #454545;
      padding: 0.4em 1em;
      font-family: inherit;
      font-size: 0.8rem;
      cursor: pointer;
      border-radius: 3px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .glossary-btn:hover:not(:disabled) {
      background: #ededed;
      border-color: #ccc;
      color: #2b2b2b;
    }
    .glossary-btn:active:not(:disabled) {
      background: #007fff;
      border-color: #003eff;
      color: #fff;
    }
    .glossary-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
    .glossary-btn svg {
      width: 14px;
      height: 14px;
    }

    .glossary-highlight {
      background: #fffa90;
      color: #777620;
      padding: 0.1em 0.2em;
      border-radius: 2px;
      border: 1px solid #dad55e;
    }

    .glossary-error {
      text-align: center;
      padding: 2.5rem 1rem;
      color: #cc0000;
    }
  `;

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  function loadGlossaryData() {
    const el = document.getElementById('glossary');
    if (!el) {
      console.error('Glossary: No element with id="glossary" found');
      return false;
    }

    const data = el.dataset.glossary;
    if (!data) {
      console.error('Glossary: No data-glossary attribute found');
      return false;
    }

    try {
      GLOSSARY = JSON.parse(data);
      return true;
    } catch (e) {
      console.error('Glossary: Failed to parse glossary JSON', e);
      return false;
    }
  }

  function injectStyles() {
    const styleEl = document.createElement('style');
    styleEl.id = 'glossary-styles';
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);
  }

  function createTriggerButton() {
    const btn = document.createElement('button');
    btn.className = 'glossary-trigger';
    btn.id = 'glossary-trigger';
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
      Glossary
    `;
    document.body.appendChild(btn);
    return btn;
  }

  function createModal() {
    const overlay = document.createElement('div');
    overlay.className = 'glossary-overlay';
    overlay.id = 'glossary-overlay';

    const modal = document.createElement('div');
    modal.className = 'glossary-modal';
    modal.id = 'glossary-modal';
    modal.innerHTML = `
      <div class="glossary-header">
        <div class="glossary-header-top">
          <h2>Glossary</h2>
          <button class="glossary-close" id="glossary-close" aria-label="Close glossary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="glossary-search">
          <svg class="glossary-search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" id="glossary-search-input" placeholder="Search terms..." autocomplete="off">
          <span class="glossary-search-count" id="glossary-search-count"></span>
        </div>
      </div>
      <div class="glossary-content" id="glossary-content"></div>
      <div class="glossary-footer">
        <span class="glossary-page-info" id="glossary-page-info"></span>
        <div class="glossary-pagination">
          <button class="glossary-btn" id="glossary-prev">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Prev
          </button>
          <button class="glossary-btn" id="glossary-next">
            Next
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(modal);
    return { overlay, modal };
  }

  function formatDefinition(entry) {
    let definition = entry.definition || '';
    let seeAlso = entry.see_also || [];

    // Escape HTML
    let formatted = definition
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Convert bullet points
    formatted = formatted.replace(/^• /gm, '<br>• ');
    formatted = formatted.replace(/^\d+\. /gm, '<br>$&');
    
    // Bold quoted terms
    formatted = formatted.replace(/"([^"]+)"/g, '<strong>"$1"</strong>');

    // Clean up line breaks
    formatted = formatted.replace(/\n{2,}/g, '<br><br>');
    formatted = formatted.replace(/\n/g, ' ');

    // Add see also section if present
    if (seeAlso.length > 0) {
      const terms = seeAlso.map(term =>
        `<span data-term="${term}">${term}</span>`
      ).join(', ');
      formatted += `<div class="glossary-see-also">See also: ${terms}</div>`;
    }

    return formatted;
  }

  function highlightTerm(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="glossary-highlight">$1</span>');
  }

  function renderPage(query = '') {
    const content = document.getElementById('glossary-content');
    const pageInfo = document.getElementById('glossary-page-info');
    const prevBtn = document.getElementById('glossary-prev');
    const nextBtn = document.getElementById('glossary-next');
    const searchCount = document.getElementById('glossary-search-count');

    const totalPages = Math.ceil(filteredTerms.length / CONFIG.itemsPerPage);
    const start = (currentPage - 1) * CONFIG.itemsPerPage;
    const end = start + CONFIG.itemsPerPage;
    const pageTerms = filteredTerms.slice(start, end);

    searchCount.textContent = query
      ? `${filteredTerms.length} found`
      : `${allTerms.length} terms`;

    if (pageTerms.length === 0) {
      content.innerHTML = `
        <div class="glossary-no-results">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>No terms found matching "${query}"</p>
        </div>
      `;
    } else {
      content.innerHTML = pageTerms.map(term => `
        <div class="glossary-entry">
          <div class="glossary-term">${highlightTerm(term, query)}</div>
          <div class="glossary-definition">${formatDefinition(GLOSSARY[term])}</div>
        </div>
      `).join('');
    }

    pageInfo.textContent = totalPages > 0
      ? `Page ${currentPage} of ${totalPages}`
      : 'No results';
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;

    // Add click handlers for "See also" terms
    content.querySelectorAll('.glossary-see-also span[data-term]').forEach(span => {
      span.addEventListener('click', () => {
        const input = document.getElementById('glossary-search-input');
        input.value = span.dataset.term;
        handleSearch(span.dataset.term);
      });
    });
  }

  function handleSearch(query) {
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
      filteredTerms = [...allTerms];
    } else {
      filteredTerms = allTerms.filter(term =>
        term.toLowerCase().includes(normalizedQuery)
      );
    }

    currentPage = 1;
    renderPage(query);
  }

  function openModal() {
    const overlay = document.getElementById('glossary-overlay');
    const modal = document.getElementById('glossary-modal');
    const input = document.getElementById('glossary-search-input');

    overlay.classList.add('active');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    input.value = '';
    filteredTerms = [...allTerms];
    currentPage = 1;
    renderPage();

    setTimeout(() => input.focus(), 100);
  }

  function closeModal() {
    const overlay = document.getElementById('glossary-overlay');
    const modal = document.getElementById('glossary-modal');

    overlay.classList.remove('active');
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  function init() {
    // Load glossary data from DOM
    if (!loadGlossaryData()) {
      console.warn('Glossary: Widget not initialized - no data found');
      return;
    }

    // Initialize terms
    allTerms = Object.keys(GLOSSARY).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
    filteredTerms = [...allTerms];

    // Inject styles and create elements
    injectStyles();
    createTriggerButton();
    createModal();

    // Event listeners
    document.getElementById('glossary-trigger').addEventListener('click', openModal);
    document.getElementById('glossary-close').addEventListener('click', closeModal);
    document.getElementById('glossary-overlay').addEventListener('click', closeModal);

    document.getElementById('glossary-search-input').addEventListener('input', (e) => {
      handleSearch(e.target.value);
    });

    document.getElementById('glossary-prev').addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderPage(document.getElementById('glossary-search-input').value);
        document.getElementById('glossary-content').scrollTop = 0;
      }
    });

    document.getElementById('glossary-next').addEventListener('click', () => {
      const totalPages = Math.ceil(filteredTerms.length / CONFIG.itemsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        renderPage(document.getElementById('glossary-search-input').value);
        document.getElementById('glossary-content').scrollTop = 0;
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    document.getElementById('glossary-modal').addEventListener('click', (e) => {
      e.stopPropagation();
    });

    console.log(`Glossary: Loaded ${allTerms.length} terms`);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();