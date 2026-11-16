/* ============ CONFIG: edit these ============ */
const CONFIG = {
    surveyUrl: 'https://ee.kobotoolbox.org/x/TGmYaz72',
    groupName: 'Star Fires',
    shareText: 'Hey! Star Fires group here. 5 minutes please? Fill in this anonymous Purple Skills Klinic student survey, it really helps:',
    typedWords: ['Be heard.', 'Shape change.', 'Take 5 minutes.', 'Make it better.']
};
/* ============================================= */

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
    $('#currentYear').textContent = new Date().getFullYear();
    $('#groupName').textContent = CONFIG.groupName;
    $$('[data-survey]').forEach(a => a.href = CONFIG.surveyUrl);
    initTheme(); initTyped(); initReveal(); initCounters(); initScroll();
    initMood(); initShare(); initTilt(); initCursor(); initConfetti(); initBackground();
});

/* Theme */
function initTheme() {
    const btn = $('.theme-toggle'), icon = $('i', btn);
    const set = d => { document.body.classList.toggle('dark-theme', d); icon.className = d ? 'fas fa-sun' : 'fas fa-moon'; };
    let saved = null;
    try { saved = localStorage.getItem('sv-theme'); } catch (e) {}
    set(saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);
    btn.addEventListener('click', () => {
        const d = !document.body.classList.contains('dark-theme');
        set(d);
        try { localStorage.setItem('sv-theme', d ? 'dark' : 'light'); } catch (e) {}
        window.dispatchEvent(new Event('themechange'));
    });
}

/* Typing headline */
function initTyped() {
    const el = $('#typed'); let w = 0, i = 0, del = false;
    if (reduceMotion) { el.textContent = CONFIG.typedWords[0]; return; }
    (function tick() {
        const word = CONFIG.typedWords[w];
        el.textContent = word.slice(0, i);
        let delay = del ? 45 : 95;
        if (!del && i === word.length) { del = true; delay = 1500; }
        else if (del && i === 0) { del = false; w = (w + 1) % CONFIG.typedWords.length; delay = 350; }
        i += del ? -1 : 1;
        setTimeout(tick, delay);
    })();
}

/* Reveal on scroll */
function initReveal() {
    const io = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: .15 });
    $$('.reveal').forEach(el => io.observe(el));
}

/* Counters */
function initCounters() {
    const io = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '';
        const t0 = performance.now(), dur = 1400;
        (function step(t) {
            const p = Math.min((t - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(end * eased) + suf;
            if (p < 1) requestAnimationFrame(step);
        })(t0);
        io.unobserve(el);
    }), { threshold: .6 });
    $$('[data-count]').forEach(el => io.observe(el));
}

/* Scroll progress */
function initScroll() {
    const bar = $('#scrollProgress');
    const upd = () => {
        const h = document.documentElement.scrollHeight - innerHeight;
        bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%';
    };
    addEventListener('scroll', upd, { passive: true }); upd();
}

/* Mood warm-up */
function initMood() {
    const msgs = {
        1: 'Sorry to hear that. Your honest feedback can really help fix things.',
        2: 'Not great, got it. Tell us what could be better.',
        3: 'Okay is a start. Help us turn it into great.',
        4: 'Good to hear! Tell us what is working so we keep it.',
        5: 'Amazing! Tell us what made it great so others get the same.'
    };
    const btns = $$('.mood-btn'), res = $('#moodResult'), txt = $('#moodText');
    btns.forEach(b => b.addEventListener('click', () => {
        btns.forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        txt.textContent = msgs[b.dataset.v];
        res.classList.add('show');
        if (+b.dataset.v >= 4) burst(b.getBoundingClientRect().left + b.offsetWidth / 2, b.getBoundingClientRect().top, 40);
    }));
}

/* Share + copy */
function initShare() {
    const url = location.href.split('#')[0];
    const wa = () => window.open('https://wa.me/?text=' + encodeURIComponent(CONFIG.shareText + ' ' + url), '_blank', 'noopener');
    $('#shareBtn').addEventListener('click', wa);
    $('#shareBtnNav').addEventListener('click', wa);
    $('#copyBtn').addEventListener('click', async () => {
        const label = $('#copyBtn span');
        try { await navigator.clipboard.writeText(url); label.textContent = 'Copied!'; }
        catch (e) { label.textContent = 'Press Ctrl+C'; prompt('Copy this link:', url); }
        setTimeout(() => label.textContent = 'Copy link', 2000);
    });
}

/* 3D tilt on cards and hero blob */
function initTilt() {
    if (reduceMotion || matchMedia('(hover: none)').matches) return;
    $$('.tilt').forEach(c => {
        c.addEventListener('mousemove', e => {
            const r = c.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
            c.style.transform = `perspective(700px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-6px)`;
        });
        c.addEventListener('mouseleave', () => c.style.transform = '');
    });
    const hero = $('#tiltHero');
    addEventListener('mousemove', e => {
        const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
        hero.style.transform = `translate(${x * 18}px, ${y * 18}px)`;
    });
}

/* Cursor glow */
function initCursor() {
    if (matchMedia('(hover: none)').matches) return;
    const g = $('#cursorGlow');
    addEventListener('mousemove', e => { g.style.opacity = 1; g.style.left = e.clientX + 'px'; g.style.top = e.clientY + 'px'; });
}

/* Confetti */
let confettiPieces = [], confettiRunning = false, cctx;
function initConfetti() {
    const cv = $('#confetti'); cctx = cv.getContext('2d');
    const size = () => { cv.width = innerWidth; cv.height = innerHeight; };
    size(); addEventListener('resize', size);
    $$('[data-confetti]').forEach(b => b.addEventListener('click', e => {
        burst(e.clientX || innerWidth / 2, e.clientY || innerHeight / 2, 90);
    }));
}
function burst(x, y, n) {
    if (reduceMotion) return;
    const colors = ['#7c3aed', '#2563eb', '#ec4899', '#06b6d4', '#facc15', '#34d399'];
    for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, s = 4 + Math.random() * 8;
        confettiPieces.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 5, r: Math.random() * 6, w: 6 + Math.random() * 6, h: 4 + Math.random() * 5, c: colors[i % colors.length], life: 0 });
    }
    if (!confettiRunning) { confettiRunning = true; requestAnimationFrame(drawConfetti); }
}
function drawConfetti() {
    cctx.clearRect(0, 0, innerWidth, innerHeight);
    confettiPieces = confettiPieces.filter(p => p.life < 110);
    confettiPieces.forEach(p => {
        p.vy += .28; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += .2; p.life++;
        cctx.save(); cctx.translate(p.x, p.y); cctx.rotate(p.r);
        cctx.globalAlpha = Math.max(0, 1 - p.life / 110);
        cctx.fillStyle = p.c; cctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); cctx.restore();
    });
    if (confettiPieces.length) requestAnimationFrame(drawConfetti);
    else { confettiRunning = false; cctx.clearRect(0, 0, innerWidth, innerHeight); }
}

/* Data-network background: dots drift, connect, and react to the mouse */
function initBackground() {
    const cv = $('#bg'), ctx = cv.getContext('2d');
    let W, H, pts = [], mouse = { x: -999, y: -999 };
    const color = () => getComputedStyle(document.body).getPropertyValue('--dot').trim();
    let rgb = color();
    const init = () => {
        W = cv.width = innerWidth; H = cv.height = innerHeight;
        const n = Math.min(70, Math.floor(W * H / 20000));
        pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5, r: 1.5 + Math.random() * 2 }));
    };
    init(); addEventListener('resize', init);
    addEventListener('themechange', () => rgb = color());
    addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    addEventListener('touchmove', e => { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; }, { passive: true });
    (function frame() {
        ctx.clearRect(0, 0, W, H);
        pts.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;
            const dx = mouse.x - p.x, dy = mouse.y - p.y, d = Math.hypot(dx, dy);
            if (d < 140) { p.x -= dx / d * 1.4; p.y -= dy / d * 1.4; }
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fillStyle = `rgba(${rgb},.55)`; ctx.fill();
            for (let j = i + 1; j < pts.length; j++) {
                const q = pts[j], l = Math.hypot(p.x - q.x, p.y - q.y);
                if (l < 130) { ctx.strokeStyle = `rgba(${rgb},${.22 * (1 - l / 130)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
            }
        });
        if (!reduceMotion) requestAnimationFrame(frame);
    })();
}
