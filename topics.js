// ── Navigation ──────────────────────────────────────────────

function toggleDomain(header) {
  var topics = header.nextElementSibling;
  var isOpen = topics.classList.contains('open');
  topics.classList.toggle('open', !isOpen);
  header.classList.toggle('open', !isOpen);
}

function showTopic(id) {
  document.querySelectorAll('.topic-section').forEach(function(el) { el.classList.remove('active'); });
  document.querySelectorAll('.nav-link').forEach(function(el) { el.classList.remove('active'); });

  var section = document.getElementById(id);
  if (!section) return;
  section.classList.add('active');

  var link = document.querySelector('.nav-link[onclick="showTopic(\'' + id + '\')"]');
  if (link) {
    link.classList.add('active');
    var domainTopics = link.closest('.domain-topics');
    if (domainTopics && !domainTopics.classList.contains('open')) {
      domainTopics.classList.add('open');
      domainTopics.previousElementSibling.classList.add('open');
    }
    link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  // Update URL hash without triggering a scroll jump
  try { history.replaceState(null, '', '#' + id); } catch(e) {}

  // Scroll page to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── URL hash navigation ──────────────────────────────────────

function _initHashNav() {
  var id = location.hash.slice(1);
  if (id && document.getElementById(id)) {
    showTopic(id);
  }
}

// ── Sidebar search / filter ──────────────────────────────────

function _initSearch() {
  var input = document.getElementById('sidebar-search');
  if (!input) return;

  input.addEventListener('input', function() {
    var q = this.value.trim().toLowerCase();
    document.querySelectorAll('.domain-group').forEach(function(group) {
      var dh = group.querySelector('.domain-header');
      var dt = group.querySelector('.domain-topics');

      if (!q) {
        // Clear: restore everything without auto-expanding
        group.style.display = '';
        group.querySelectorAll('.nav-link').forEach(function(link) { link.style.display = ''; });
        return;
      }

      var domainMatch = dh && dh.textContent.toLowerCase().indexOf(q) !== -1;

      if (domainMatch) {
        // Entire domain matches — show all its topics
        group.style.display = '';
        group.querySelectorAll('.nav-link').forEach(function(link) { link.style.display = ''; });
        if (dt) { dt.classList.add('open'); dh.classList.add('open'); }
      } else {
        // Check individual topics
        var anyVisible = false;
        group.querySelectorAll('.nav-link').forEach(function(link) {
          var show = link.textContent.toLowerCase().indexOf(q) !== -1;
          link.style.display = show ? '' : 'none';
          if (show) anyVisible = true;
        });
        group.style.display = anyVisible ? '' : 'none';
        if (anyVisible && dt) { dt.classList.add('open'); dh.classList.add('open'); }
      }
    });
  });
}

// ── Keyboard shortcuts ───────────────────────────────────────

function _initKeyboard() {
  window.addEventListener('keydown', function(e) {
    var active = document.activeElement;
    var tag = active ? active.tagName : '';
    var editable = active && active.isContentEditable;

    // Press / to focus search (skip if already typing somewhere)
    if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey
        && tag !== 'INPUT' && tag !== 'TEXTAREA' && !editable) {
      e.preventDefault();
      e.stopPropagation();
      var s = document.getElementById('sidebar-search');
      if (s) { s.focus(); s.select(); }
      return;
    }
    // Escape to clear search
    if (e.key === 'Escape') {
      var s = document.getElementById('sidebar-search');
      if (s && document.activeElement === s) {
        s.value = '';
        s.dispatchEvent(new Event('input'));
        s.blur();
      }
    }
    // Arrow keys to navigate focused sidebar links
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') &&
        active && active.classList.contains('nav-link')) {
      e.preventDefault();
      var links = Array.from(document.querySelectorAll('.nav-link:not([style*="none"])'));
      var idx = links.indexOf(active);
      var next = e.key === 'ArrowDown' ? links[idx + 1] : links[idx - 1];
      if (next) next.focus();
    }
  }, true); // capture phase — fires before any element handlers
}

// ── Init ─────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
  _initHashNav();
  _initSearch();
  _initKeyboard();
});