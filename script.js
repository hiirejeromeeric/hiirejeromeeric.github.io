/* ============ CONFIG ============ */
const CONFIG = {
    surveyUrl: 'https://ee.kobotoolbox.org/x/TGmYaz72',
    shareText: 'Purple Skills Klinic students: here is a short survey about your learning experience (approximately 2–3 minutes, voluntary, no name required):'
};
/* ================================== */

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
    $$('[data-survey]').forEach(a => { a.href = CONFIG.surveyUrl; });
    const y = $('#currentYear'); if (y) y.textContent = new Date().getFullYear();
    initTheme(); initReveal(); initShare(); initBackground();
});

/* Light / dark theme */
function initTheme() {
    const btn = $('#themeToggle'); if (!btn) return;
    const set = dark => {
        document.body.classList.toggle('dark-theme', dark);
        btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
        window.dispatchEvent(new Event('themechange'));
    };
    let saved = null;
    try { saved = localStorage.getItem('sv-theme'); } catch (e) {}
    set(saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);
    btn.addEventListener('click', () => {
        const dark = !document.body.classList.contains('dark-theme');
        set(dark);
        try { localStorage.setItem('sv-theme', dark ? 'dark' : 'light'); } catch (e) {}
    });
}

/* Gentle fade-in on scroll */
function initReveal() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window) || reduceMotion) { items.forEach(el => el.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: .1 });
    items.forEach(el => io.observe(el));
}

/* Share on WhatsApp + copy link */
function initShare() {
    const url = location.href.split('#')[0];
    const share = $('#shareBtn'), copy = $('#copyBtn'), label = $('#copyLabel');
    if (share) share.addEventListener('click', () => {
        window.open('https://wa.me/?text=' + encodeURIComponent(CONFIG.shareText + ' ' + url), '_blank', 'noopener');
    });
    if (copy) copy.addEventListener('click', async () => {
        let ok = false;
        try { await navigator.clipboard.writeText(url); ok = true; }
        catch (e) {
            const t = document.createElement('textarea');
            t.value = url; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
            document.body.appendChild(t); t.select();
            try { ok = document.execCommand('copy'); } catch (err) {}
            t.remove();
        }
        label.textContent = ok ? 'Link copied' : 'Copy not supported';
        setTimeout(() => { label.textContent = 'Copy link'; }, 2000);
    });
}

/* Light background: slow-drifting dots. Pauses when the tab is hidden. */
function initBackground() {
    const cv = $('#bg'); if (!cv) return;
    const ctx = cv.getContext('2d');
    let W, H, pts = [], raf = null;
    const rgb = () => getComputedStyle(document.body).getPropertyValue('--dot').trim();
    let col = rgb();
    const build = () => {
        W = cv.width = innerWidth; H = cv.height = innerHeight;
        const n = Math.min(40, Math.floor(W * H / 24000));
        pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3, r: 1.5 + Math.random() * 1.5 }));
    };
    const draw = () => {
        ctx.clearRect(0, 0, W, H);
        pts.forEach((p, i) => {
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fillStyle = `rgba(${col},.45)`; ctx.fill();
            for (let j = i + 1; j < pts.length; j++) {
                const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
                if (d < 120) { ctx.strokeStyle = `rgba(${col},${.2 * (1 - d / 120)})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
            }
        });
    };
    const tick = () => {
        pts.forEach(p => { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; });
        draw(); raf = requestAnimationFrame(tick);
    };
    const start = () => { if (!reduceMotion && !raf) raf = requestAnimationFrame(tick); };
    const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = null; } };
    build(); draw(); start();
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { build(); draw(); }, 200); });
    addEventListener('themechange', () => { col = rgb(); draw(); });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
}
