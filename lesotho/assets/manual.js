// === TAB SWITCHING ===
function switchTab(event, tabId) {
    const group = event.target.closest('.tab-group');
    group.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    group.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
        panel.style.display = 'none';
    });
    event.target.classList.add('active');
    const panel = document.getElementById(tabId);
    panel.classList.add('active');
    panel.style.display = 'block';
}

// === PASSWORD GATE ===
function initPasswordGate() {
    const gate = document.getElementById('processing-gate');
    if (!gate) return;
    const config = window.MANUAL_CONFIG || {};
    const password = (config.processingPassword || '').toLowerCase();
    gate.querySelector('.gate-submit').addEventListener('click', function() {
        const input = gate.querySelector('.gate-input').value.toLowerCase().trim();
        const error = gate.querySelector('.error');
        if (input === password) {
            gate.style.display = 'none';
            document.getElementById('processing-content').style.display = 'block';
            const tocItem = document.querySelector('.toc-processing');
            if (tocItem) tocItem.style.display = 'flex';
        } else {
            error.textContent = 'Incorrect password. Please try again.';
            error.style.display = 'block';
        }
    });
    gate.querySelector('.gate-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') gate.querySelector('.gate-submit').click();
    });
}

// === SMOOTH SCROLL TOC ===
function initTOC() {
    document.querySelectorAll('.toc-item').forEach(item => {
        item.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// === INIT ===
document.addEventListener('DOMContentLoaded', function() {
    initPasswordGate();
    initTOC();
});
