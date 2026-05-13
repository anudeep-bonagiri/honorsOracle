/* ===== ICONS ===== */
function initIcons(){ if (window.lucide) lucide.createIcons(); }

/* ===== STARS CANVAS ===== */
function initStars(){
  const c = document.getElementById('stars');
  if (!c) return;
  const ctx = c.getContext('2d');
  function resize(){ c.width = innerWidth; c.height = innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  const N = 160;
  const stars = Array.from({length:N}, () => ({
    x: Math.random()*c.width, y: Math.random()*c.height,
    r: Math.random()*1.4+0.3, a: Math.random(), da: (Math.random()-.5)*.004,
    vx: (Math.random()-.5)*.12, vy: (Math.random()-.5)*.12
  }));
  function draw(){
    ctx.clearRect(0,0,c.width,c.height);
    stars.forEach(s => {
      s.x += s.vx; s.y += s.vy; s.a += s.da;
      if (s.x < 0) s.x = c.width;  if (s.x > c.width)  s.x = 0;
      if (s.y < 0) s.y = c.height; if (s.y > c.height) s.y = 0;
      if (s.a < 0.1 || s.a > 0.9) s.da *= -1;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(240,171,0,${s.a*0.55})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ===== REVEAL ON SCROLL ===== */
function initReveal(){
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

/* ===== CHAT VIEW SWITCHING ===== */
function openChat(){
  const v = document.getElementById('chat-view');
  if (!v) return;
  v.classList.add('active');
  document.body.style.overflow = 'hidden';
  const inp = document.getElementById('inp');
  if (inp) inp.focus();
}
function closeChat(){
  const v = document.getElementById('chat-view');
  if (!v) return;
  v.classList.remove('active');
  document.body.style.overflow = '';
}
window.openChat = openChat;
window.closeChat = closeChat;

/* ===== PROFILE (year + major) ===== */
const PROFILE_KEY = 'oracle:profile';
const PROFILE_YEARS = [
  { value: 'freshman',  label: 'Freshman' },
  { value: 'sophomore', label: 'Sophomore' },
  { value: 'junior',    label: 'Junior' },
  { value: 'senior',    label: 'Senior' },
  { value: 'grad',      label: 'Grad student' },
];
const VALID_YEARS = new Set(PROFILE_YEARS.map(y => y.value));

function loadProfile(){
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    const year  = VALID_YEARS.has(p.year) ? p.year : '';
    const major = (typeof p.major === 'string') ? p.major.slice(0, 80) : '';
    if (!year && !major) return null;
    return { year, major };
  } catch { return null; }
}
function saveProfile(p){
  if (!p || (!p.year && !p.major)) {
    localStorage.removeItem(PROFILE_KEY);
    return;
  }
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}
function getProfileLabel(p){
  if (!p) return '';
  const yr = PROFILE_YEARS.find(y => y.value === p.year);
  const yrLabel = yr ? yr.label : '';
  if (yrLabel && p.major) return `${yrLabel} · ${p.major}`;
  return yrLabel || p.major || '';
}
function getCurrentProfile(){ return loadProfile(); }
window.getCurrentProfile = getCurrentProfile;

function refreshProfileButton(){
  const btn = document.getElementById('profile-btn');
  if (!btn) return;
  const p = loadProfile();
  const label = getProfileLabel(p);
  if (label) {
    btn.classList.add('is-set');
    btn.innerHTML = `<span class="pb-icon">👤</span><span>${escapeHtml(label)}</span>`;
    btn.title = 'Edit your year and major';
  } else {
    btn.classList.remove('is-set');
    btn.innerHTML = `<span class="pb-icon">👤</span><span>Set year &amp; major</span>`;
    btn.title = 'Tell the Oracle your year and major for better answers';
  }
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function ensureProfileModal(){
  if (document.getElementById('profile-modal')) return;
  const yearOptions = ['<option value="">Prefer not to say</option>']
    .concat(PROFILE_YEARS.map(y => `<option value="${y.value}">${y.label}</option>`))
    .join('');
  const wrap = document.createElement('div');
  wrap.id = 'profile-modal';
  wrap.className = 'modal-backdrop';
  wrap.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
      <h3 id="profile-modal-title">Personalize the Oracle</h3>
      <p class="modal-sub">Tell the chat your year and major and answers get sharper — scholarships you can still apply to, REUs that match your level, deadlines that aren't past yet. Stored only in this browser.</p>
      <div class="modal-field">
        <label for="pm-year">Year</label>
        <select id="pm-year">${yearOptions}</select>
      </div>
      <div class="modal-field">
        <label for="pm-major">Major or field of interest</label>
        <input id="pm-major" type="text" maxlength="80" placeholder="e.g. Computer Science, Biology, Psychology, Policy" />
      </div>
      <div class="modal-actions">
        <button class="modal-btn danger"   type="button" id="pm-clear">Clear</button>
        <button class="modal-btn secondary" type="button" id="pm-cancel">Cancel</button>
        <button class="modal-btn primary"   type="button" id="pm-save">Save</button>
      </div>
      <p class="modal-footnote">Lives in your browser (localStorage). Sent only on chat requests to make answers more relevant. Clear it anytime.</p>
    </div>
  `;
  document.body.appendChild(wrap);

  // dismiss handlers
  wrap.addEventListener('click', (e) => { if (e.target === wrap) closeProfileModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && wrap.classList.contains('active')) closeProfileModal();
  });
  document.getElementById('pm-cancel').addEventListener('click', closeProfileModal);
  document.getElementById('pm-clear').addEventListener('click', () => {
    saveProfile(null);
    refreshProfileButton();
    closeProfileModal();
  });
  document.getElementById('pm-save').addEventListener('click', () => {
    const year = document.getElementById('pm-year').value;
    const major = document.getElementById('pm-major').value.trim().slice(0, 80);
    saveProfile({ year: VALID_YEARS.has(year) ? year : '', major });
    refreshProfileButton();
    closeProfileModal();
  });
}

function openProfileModal(){
  ensureProfileModal();
  const p = loadProfile() || { year: '', major: '' };
  document.getElementById('pm-year').value  = p.year || '';
  document.getElementById('pm-major').value = p.major || '';
  document.getElementById('profile-modal').classList.add('active');
  setTimeout(() => { document.getElementById('pm-year').focus(); }, 50);
}
function closeProfileModal(){
  const m = document.getElementById('profile-modal');
  if (m) m.classList.remove('active');
}
window.openProfileModal = openProfileModal;

function injectProfileUI(){
  const header = document.querySelector('.chat-header');
  if (!header) return;
  if (document.getElementById('profile-btn')) { refreshProfileButton(); return; }
  const btn = document.createElement('button');
  btn.id = 'profile-btn';
  btn.type = 'button';
  btn.className = 'profile-btn';
  btn.onclick = openProfileModal;
  const liveDot = header.querySelector('.live-dot');
  if (liveDot) header.insertBefore(btn, liveDot);
  else header.appendChild(btn);
  refreshProfileButton();

  // welcome-panel hint
  const welcome = document.getElementById('chat-welcome');
  if (welcome && !welcome.querySelector('.personalize-hint')) {
    const hint = document.createElement('button');
    hint.type = 'button';
    hint.className = 'personalize-hint';
    hint.textContent = '👤 Personalize for your year and major →';
    hint.onclick = openProfileModal;
    welcome.appendChild(hint);
  }
}

/* ===== CHAT LOGIC ===== */
const oracle = (() => {
  let history = [];
  let busy = false;

  function msgsEl(){ return document.getElementById('messages'); }

  function resize(el){ el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 88) + 'px'; }
  function onKey(e){ if (e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); send(); } }
  function quick(t){ openChat(); const inp = document.getElementById('inp'); if (inp){ inp.value = t; send(); } }

  function removeWelcome(){ const w = document.getElementById('chat-welcome'); if (w) w.remove(); }

  function addMsg(role, html){
    removeWelcome();
    const msgs = msgsEl(); if (!msgs) return null;
    const wrap = document.createElement('div'); wrap.className = 'msg ' + role;
    const av = document.createElement('div'); av.className = 'av ' + role; av.textContent = role === 'bot' ? '🦉' : '👤';
    const bub = document.createElement('div'); bub.className = 'bubble'; bub.innerHTML = html;
    wrap.appendChild(av); wrap.appendChild(bub);
    msgs.appendChild(wrap); msgs.scrollTop = msgs.scrollHeight;
    return bub;
  }

  function showTyping(){
    removeWelcome();
    const msgs = msgsEl(); if (!msgs) return;
    const wrap = document.createElement('div'); wrap.className = 'msg bot'; wrap.id = 'typing';
    const av = document.createElement('div'); av.className = 'av bot'; av.textContent = '🦉';
    const bub = document.createElement('div'); bub.className = 'bubble';
    bub.innerHTML = '<div class="typing"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>';
    wrap.appendChild(av); wrap.appendChild(bub); msgs.appendChild(wrap); msgs.scrollTop = msgs.scrollHeight;
  }
  function removeTyping(){ const t = document.getElementById('typing'); if (t) t.remove(); }

  function addFollowups(qs){
    const msgs = msgsEl(); if (!msgs) return;
    const row = document.createElement('div'); row.className = 'fu-row';
    qs.forEach(q => {
      const b = document.createElement('button'); b.className = 'fu-btn';
      b.textContent = q; b.onclick = () => quick(q);
      row.appendChild(b);
    });
    msgs.appendChild(row); msgs.scrollTop = msgs.scrollHeight;
  }

  function fmt(raw){
    const fuMatch = raw.match(/FOLLOWUPS:\s*(.+)/i);
    let text = raw.replace(/FOLLOWUPS:.*/i, '').trim();
    text = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^#{1,3} (.+)/gm, '<strong>$1</strong>')
      .replace(/^[-•] (.+)/gm, '<li>$1</li>')
      .replace(/(<li>[\s\S]*<\/li>)/, '<ul>$1</ul>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
    text += ' <span class="src-tag">↗ honors.utsa.edu</span>';
    const fus = fuMatch ? fuMatch[1].split('|').map(s => s.trim()).filter(Boolean) : [];
    return { html: text, fus };
  }

  function esc(s){ return s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

  async function send(){
    const inp = document.getElementById('inp');
    if (!inp) return;
    const text = inp.value.trim();
    if (!text || busy) return;
    inp.value = ''; inp.style.height = 'auto';
    busy = true;
    const goBtn = document.getElementById('go');
    if (goBtn) goBtn.disabled = true;
    addMsg('user', esc(text));
    history.push({ role: 'user', content: text });
    showTyping();

    let bub = null;
    try {
      const profile = (typeof getCurrentProfile === 'function') ? getCurrentProfile() : null;
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, profile })
      });
      removeTyping();
      if (!res.ok) {
        let detail = '';
        try { detail = ' — ' + (await res.text()).slice(0, 240); } catch {}
        throw new Error('HTTP ' + res.status + detail);
      }
      if (!res.body) throw new Error('Browser does not support streaming responses');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      let buffer = '';
      bub = addMsg('bot', '');

      const flushLine = (raw) => {
        if (!raw.startsWith('data: ')) return false;
        const d = raw.slice(6).trim();
        if (d === '' || d === '[DONE]') return d === '[DONE]';
        try {
          const j = JSON.parse(d);
          const delta = j.choices?.[0]?.delta?.content;
          if (delta) {
            full += delta;
            const { html } = fmt(full + '▌');
            bub.innerHTML = html;
            const msgs = msgsEl(); if (msgs) msgs.scrollTop = msgs.scrollHeight;
          }
        } catch (e) {
          console.warn('[oracle] SSE parse skipped:', d.slice(0, 100));
        }
        return false;
      };

      streaming: while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const raw of lines) {
          if (flushLine(raw)) { break streaming; }
        }
      }
      if (buffer.length) flushLine(buffer);

      const { html, fus } = fmt(full);
      bub.innerHTML = html;
      const clean = full.replace(/FOLLOWUPS:.*/is, '').trim();
      history.push({ role: 'assistant', content: clean });
      if (fus.length) addFollowups(fus);
    } catch (err) {
      removeTyping();
      console.error('[oracle] chat error:', err);
      const msg = '⚠️ ' + esc(err.message || String(err)) + ' <span class="src-tag">↗ honors.utsa.edu</span>';
      if (bub) bub.innerHTML = msg; else addMsg('bot', msg);
      history.pop();
    }
    busy = false;
    const goBtn2 = document.getElementById('go');
    if (goBtn2) goBtn2.disabled = false;
    const m = msgsEl(); if (m) m.scrollTop = m.scrollHeight;
  }

  return { send, quick, resize, onKey };
})();

/* expose chat handlers to inline onclick/onkeydown attributes */
window.send = oracle.send;
window.quick = oracle.quick;
window.resize = oracle.resize;
window.onKey = oracle.onKey;

/* ===== INIT ===== */
function init(){
  initIcons();
  initStars();
  initReveal();
  injectProfileUI();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
