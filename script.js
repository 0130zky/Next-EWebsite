/* ========================================
   Next-E 战队 — 交互脚本
   滚动动画 / 计数器 / 表单
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initTheme();
  initScrollReveal();
  initSmoothScroll();
  initContactForm();
  initMobileNav();
  initTechCarousel();
});

/* ===== 导航栏滚动效果 ===== */
function initNavbar() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const updateNav = () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
    nav.classList.toggle('nav-transparent', window.scrollY <= 50);
  };

  updateNav(); // 页面加载时先应用一次状态
  window.addEventListener('scroll', updateNav, { passive: true });
}

/* ===== 主题切换 ===== */
function initTheme() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  const apply = (dark) => {
    if (dark) document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
  };

  // 读取本地记忆
  if (localStorage.getItem('nexte-theme') === 'dark') apply(true);

  btn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    apply(!isDark);
    localStorage.setItem('nexte-theme', isDark ? 'light' : 'dark');
  });
}

/* ===== 移动端导航 ===== */
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.querySelector('.nav-links');
  const linkItems = document.querySelectorAll('.nav-links a');

  if (!toggle || !links) return;

  // 菜单遮罩
  let backdrop = document.querySelector('.nav-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);
  }

  const setMenu = (open) => {
    toggle.classList.toggle('active', open);
    links.classList.toggle('active', open);
    backdrop.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  toggle.addEventListener('click', () => setMenu(!links.classList.contains('active')));
  backdrop.addEventListener('click', () => setMenu(false));
  linkItems.forEach(link => link.addEventListener('click', () => setMenu(false)));
}

/* ===== 滚动渐入动画 ===== */
function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.robot-card, .member-card, .news-card, .sponsor-item, .about-text, .about-card, .value-item'
  );

  targets.forEach(el => el.classList.add('reveal'));
  document.querySelectorAll('.section-header').forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ===== 滚动时导航高亮 ===== */
function initSmoothScroll() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.style.color = '';
            if (link.getAttribute('href') === `#${entry.target.id}`) {
              link.style.color = 'var(--accent)';
            }
          });
        }
      });
    },
    { threshold: 0.3, rootMargin: '-72px 0px -30% 0px' }
  );

  sections.forEach(s => observer.observe(s));
}

/* ===== 联系表单 ===== */
function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('#name');
    const contact = form.querySelector('#contact');
    const message = form.querySelector('#message');

    if (!name.value.trim() || !contact.value.trim()) {
      showToast('请填写姓名和联系方式', 'error');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.textContent = '发送中...';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = orig;
      btn.disabled = false;
      form.reset();
      showToast('问卷已提交！我们会尽快联系你');
    }, 1500);
  });

}

/* ===== Toast 提示 ===== */
function showToast(msg, type) {
  document.querySelectorAll('.toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = 'toast' + (type === 'error' ? ' error' : '');
  toast.textContent = msg;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

/* ===== 技术组轮播 ===== */
function initTechCarousel() {
  const stage = document.getElementById('techStage');
  if (!stage) return;
  const cards = Array.from(stage.querySelectorAll('.tech-card'));
  if (cards.length < 2) return;

  let current = 0;

  const render = () => {
    cards.forEach((card, i) => {
      let off = i - current;
      if (off > 2) off -= cards.length;
      if (off < -2) off += cards.length;
      card.dataset.offset = off;
    });

  };

  const prevBtn = document.getElementById('techPrev');
  const nextBtn = document.getElementById('techNext');

  /* 自动轮播：进入视口启动，点击箭头后永久停止（刷新页面后重新开始） */
  let autoTimer = null;
  let autoStopped = false;

  const startAuto = () => {
    if (autoStopped || autoTimer) return;
    autoTimer = setInterval(() => {
      current = (current + 1) % cards.length;
      render();
    }, 4000);
  };

  const stopAuto = () => {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  };

  const stopAutoForever = () => {
    stopAuto();
    autoStopped = true;
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startAuto();
          } else {
            stopAuto();
          }
        });
      },
      { threshold: 0.35 }
    );
    io.observe(stage);
  }

  prevBtn.addEventListener('click', () => {
    stopAutoForever();
    current = (current - 1 + cards.length) % cards.length;
    render();
  });

  nextBtn.addEventListener('click', () => {
    stopAutoForever();
    current = (current + 1) % cards.length;
    render();
  });

  render();
}
