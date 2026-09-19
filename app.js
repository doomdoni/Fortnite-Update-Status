/**
 * Main Application Controller for Fortnite Status & Patch Tracker
 * Works reliably on GitHub Pages, Custom Domains, and Local files
 */

function formatKoreanDateTime(dateInput) {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Seoul'
  }).format(date) + ' (KST)';
}

function getRelativeTimeString(dateInput) {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 30) return '방금 전';
  if (diffSec < 60) return `${diffSec}초 전`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  return `${Math.floor(diffHour / 24)}일 전`;
}

class AppController {
  constructor() {
    this.activeTab = 'br';
    this.nextRefreshIn = 30;
    this.isRefreshing = false;
    this.countdownTarget = null;
    this.countdownTimer = null;
    this.allNews = { br: window.VERIFIED_INITIAL_DATA?.news || [], stw: [], creative: [] };
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.renderInitialUI();
    this.startAutoRefresh();
    this.loadLiveData();
  }

  bindEvents() {
    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        if (!this.isRefreshing) this.loadLiveData(true);
      });
    }

    // Notification Toggle
    const notifyBtn = document.getElementById('notify-toggle-btn');
    if (notifyBtn) {
      notifyBtn.addEventListener('click', () => this.toggleNotification());
    }

    // Tabs
    document.getElementById('tab-br')?.addEventListener('click', () => this.switchTab('br'));
    document.getElementById('tab-stw')?.addEventListener('click', () => this.switchTab('stw'));
    document.getElementById('tab-creative')?.addEventListener('click', () => this.switchTab('creative'));

    // Map Fullscreen
    document.getElementById('map-container')?.addEventListener('click', () => this.openMapModal());
    document.getElementById('map-fullscreen-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openMapModal();
    });
    document.getElementById('map-modal-close-btn')?.addEventListener('click', () => this.closeMapModal());
    document.getElementById('map-modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'map-modal-overlay') this.closeMapModal();
    });

    // News Modal Close
    document.getElementById('modal-close-btn')?.addEventListener('click', () => this.closeModal());
    document.getElementById('news-modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'news-modal-overlay') this.closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
        this.closeMapModal();
      }
    });
  }

  renderInitialUI() {
    const initialData = window.VERIFIED_INITIAL_DATA || {};
    if (initialData.news) this.renderNews(initialData.news);
    if (initialData.components) this.renderComponents(initialData.components);
    if (initialData.version) {
      this.renderPatch({
        version: initialData.version,
        buildString: initialData.buildString,
        updated: initialData.updated
      });
    }
    this.refreshIcons();
  }

  startAutoRefresh() {
    setInterval(() => {
      if (this.isRefreshing) return;
      this.nextRefreshIn -= 1;
      if (this.nextRefreshIn <= 0) {
        this.nextRefreshIn = 30;
        this.loadLiveData(false);
      }
      const cd = document.getElementById('auto-refresh-countdown');
      if (cd) cd.textContent = `${this.nextRefreshIn}s`;
    }, 1000);
  }

  async loadLiveData(showToast = false) {
    if (!window.fortniteAPI) return;
    this.isRefreshing = true;
    this.setSpinner(true);

    try {
      const [serverData, patchData, allNewsData, mapData] = await Promise.allSettled([
        window.fortniteAPI.getServerStatus(),
        window.fortniteAPI.getPatchVersion(),
        window.fortniteAPI.getAllNews(),
        window.fortniteAPI.getMapData()
      ]);

      if (serverData.status === 'fulfilled') this.renderServerStatus(serverData.value);
      if (patchData.status === 'fulfilled') this.renderPatch(patchData.value);
      if (allNewsData.status === 'fulfilled') {
        this.allNews = allNewsData.value;
        this.renderNews(this.allNews[this.activeTab] || this.allNews.br);
      }
      if (mapData.status === 'fulfilled') {
        const mapImg = mapData.value?.pois || mapData.value?.blank || 'https://fortnite-api.com/images/map_en.png';
        const m1 = document.getElementById('map-image');
        const m2 = document.getElementById('map-modal-image');
        if (m1) m1.src = mapImg;
        if (m2) m2.src = mapImg;
      }

      this.nextRefreshIn = 30;
      if (showToast) this.showToast('동기화 완료', '에픽게임즈 공식 실시간 데이터가 갱신되었습니다.', 'success');
    } catch (e) {
      console.warn('[Live Sync]', e);
    } finally {
      this.isRefreshing = false;
      this.setSpinner(false);
      this.refreshIcons();
    }
  }

  renderServerStatus(data) {
    if (!data) return;
    const hero = document.getElementById('status-hero-card');
    const badge = document.getElementById('status-badge');
    const title = document.getElementById('status-title');
    const desc = document.getElementById('status-description');
    const headerInd = document.getElementById('header-status-indicator');
    const headerTxt = document.getElementById('header-status-text');
    const pingDisp = document.getElementById('ping-display');

    if (pingDisp) pingDisp.textContent = `${data.ping || 28}ms`;

    if (data.overallStatus === 'operational') {
      if (hero) {
        hero.className = 'lg:col-span-6 glass-panel rounded-2xl p-6 sm:p-8 border border-emerald-500/40 relative overflow-hidden flex flex-col justify-between shadow-2xl transition-all duration-300';
      }
      if (badge) {
        badge.className = 'inline-flex items-center px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30';
        badge.innerHTML = '<span class="flex h-2 w-2 rounded-full bg-emerald-400 mr-2"></span><span class="text-xs font-bold text-emerald-400 uppercase tracking-wider">ALL SERVERS ONLINE</span>';
      }
      if (title) title.textContent = '포트나이트 서버가 원활하게 가동 중입니다';
      if (desc) desc.textContent = '현재 진행 중이거나 보고된 서버 장애가 없으며 모든 매치메이킹 및 게임 서비스가 정상 작동하고 있습니다.';

      if (headerInd) {
        headerInd.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]';
      }
      if (headerTxt) {
        headerTxt.className = 'font-semibold text-emerald-400';
        headerTxt.textContent = '서버 정상';
      }

      this.setCountdown(null);
    } else if (data.overallStatus === 'maintenance') {
      if (hero) {
        hero.className = 'lg:col-span-6 glass-panel rounded-2xl p-6 sm:p-8 border border-yellow-500/50 relative overflow-hidden flex flex-col justify-between shadow-2xl transition-all duration-300';
      }
      if (badge) {
        badge.className = 'inline-flex items-center px-3 py-1 rounded-full bg-yellow-950/60 border border-yellow-500/40';
        badge.innerHTML = '<span class="flex h-2 w-2 rounded-full bg-yellow-400 mr-2 animate-ping"></span><span class="text-xs font-bold text-yellow-300 uppercase tracking-wider">UNDER MAINTENANCE</span>';
      }
      if (title) title.textContent = data.statusMessage || '포트나이트 서버 점검 진행 중';
      if (desc) desc.textContent = '현재 포트나이트 패치 적용 및 서버 점검이 진행 중입니다. 점검이 완료되면 즉시 게임 접속이 가능합니다.';

      if (headerInd) {
        headerInd.className = 'w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_#facc15] animate-pulse';
      }
      if (headerTxt) {
        headerTxt.className = 'font-semibold text-yellow-400';
        headerTxt.textContent = '서버 점검 중';
      }

      this.setCountdown(data.estimatedEndTime);
    }

    if (data.components) this.renderComponents(data.components);
  }

  setCountdown(targetIso) {
    if (this.countdownTimer) clearInterval(this.countdownTimer);

    const th = document.getElementById('timer-hours');
    const tm = document.getElementById('timer-minutes');
    const ts = document.getElementById('timer-seconds');
    const label = document.getElementById('countdown-label');
    const startInfo = document.getElementById('time-info-start');
    const endInfo = document.getElementById('time-info-end');

    if (!targetIso) {
      if (th) th.textContent = '--';
      if (tm) tm.textContent = '--';
      if (ts) ts.textContent = '--';
      if (label) label.textContent = '서버 상태 정상 (가동 중)';
      if (startInfo) startInfo.textContent = `최근 확인: ${formatKoreanDateTime(new Date())}`;
      if (endInfo) endInfo.textContent = '예정된 서버 점검 일정이 없습니다.';
      return;
    }

    const targetTime = new Date(targetIso).getTime();
    if (label) label.textContent = '서버 다운 해제(오픈) 예상 시간까지';
    if (endInfo) endInfo.textContent = `해제 예상: ${formatKoreanDateTime(targetIso)}`;

    const tick = () => {
      const now = Date.now();
      const diff = targetTime - now;
      if (diff <= 0) {
        if (th) th.textContent = '00';
        if (tm) tm.textContent = '00';
        if (ts) ts.textContent = '00';
        clearInterval(this.countdownTimer);
        this.loadLiveData();
        return;
      }
      const totalHours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (th) th.textContent = String(totalHours).padStart(2, '0');
      if (tm) tm.textContent = String(minutes).padStart(2, '0');
      if (ts) ts.textContent = String(seconds).padStart(2, '0');
    };

    tick();
    this.countdownTimer = setInterval(tick, 1000);
  }

  renderPatch(data) {
    if (!data) return;
    const b = document.getElementById('current-version-badge');
    const bs = document.getElementById('build-string-text');
    const pd = document.getElementById('patch-date-text');
    if (b) b.textContent = data.version || 'v32.00';
    if (bs) bs.textContent = data.buildString || '++Fortnite+Release-32.00-CL-37989301-Windows';
    if (pd) pd.textContent = formatKoreanDateTime(data.updated);
  }

  renderNews(items) {
    const grid = document.getElementById('news-grid');
    const empty = document.getElementById('news-empty-state');
    if (!grid) return;
    grid.innerHTML = '';

    if (!items || items.length === 0) {
      if (empty) empty.classList.remove('hidden');
      return;
    }
    if (empty) empty.classList.add('hidden');

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'glass-panel glass-panel-hover rounded-xl overflow-hidden border border-slate-800 flex flex-col cursor-pointer transition-all duration-300 hover:border-blue-500/50 group';
      
      const title = item.title || item.tabTitle || '포트나이트 업데이트 뉴스';
      const body = item.body || item.message || '상세 내용을 확인하려면 클릭하세요.';
      const imageUrl = item.tileImage || item.image || 'https://cdn-live.prm.ol.epicgames.com/prod/5b1d76d3450c47639eaf560ca950014c.jpeg?width=720&height=400&aspect=fill';
      const sourceUrl = item.sourceUrl || (window.resolveArticleUrl ? window.resolveArticleUrl(title, body, this.activeTab) : 'https://www.fortnite.com/news');

      card.innerHTML = `
        <div class="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
          <img src="${imageUrl}" alt="${title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
          <div class="absolute top-3 left-3">
            <span class="px-2.5 py-1 text-xs font-semibold rounded bg-blue-600/90 text-white backdrop-blur-md uppercase">
              ${this.activeTab}
            </span>
          </div>
        </div>
        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 class="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1 mb-2">${title}</h3>
            <p class="text-sm text-slate-400 line-clamp-3 leading-relaxed">${body}</p>
          </div>
          <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span class="flex items-center gap-1 font-semibold text-blue-400 group-hover:underline">
              자세히 보기
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </span>
            <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();" class="inline-flex items-center gap-1 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2 py-1 rounded transition-colors" title="이 소식의 공식 원문 페이지로 이동">
              <span>해당 소식 원문</span>
              <i data-lucide="external-link" class="w-3 h-3 text-slate-400"></i>
            </a>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.openModal(title, body, imageUrl, sourceUrl);
      });

      grid.appendChild(card);
    });

    this.refreshIcons();
  }

  renderComponents(components) {
    const grid = document.getElementById('components-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const nameMap = {
      'Fortnite': '포트나이트 게임 코어',
      'Website': '포트나이트 공식 웹사이트',
      'Game Services': '게임 세션 & 서버 서비스',
      'Login': '계정 로그인 & 인증',
      'Parties, Friends, and Messaging': '파티, 친구 및 메시징',
      'Voice Chat': '인게임 음성 채팅',
      'Matchmaking': '배틀로얄 매치메이킹',
      'Stats and Leaderboards': '전적 및 리더보드',
      'Item Shop': '인게임 아이템 상점',
      'Fortnite Crew': '포트나이트 크루 구독'
    };

    components.forEach(comp => {
      const item = document.createElement('div');
      item.className = 'p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-sm';
      const badge = comp.status === 'operational'
        ? '<span class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/20 px-2.5 py-1 rounded-md"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>정상</span>'
        : '<span class="inline-flex items-center gap-1.5 text-xs font-semibold text-yellow-400 bg-yellow-950/80 border border-yellow-500/20 px-2.5 py-1 rounded-md"><span class="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>점검 중</span>';
      
      item.innerHTML = `
        <div class="flex items-center gap-2.5">
          <i data-lucide="server" class="w-4 h-4 text-blue-400/70"></i>
          <span class="font-medium text-slate-200 text-xs sm:text-sm">${nameMap[comp.name] || comp.name}</span>
        </div>
        ${badge}
      `;
      grid.appendChild(item);
    });

    this.refreshIcons();
  }

  switchTab(tab) {
    this.activeTab = tab;
    const tabs = [
      { id: 'br', el: document.getElementById('tab-br') },
      { id: 'stw', el: document.getElementById('tab-stw') },
      { id: 'creative', el: document.getElementById('tab-creative') }
    ];

    tabs.forEach(t => {
      if (!t.el) return;
      if (t.id === tab) {
        t.el.className = 'px-3 py-1.5 rounded-lg font-semibold bg-blue-600 text-white shadow-md transition-all';
      } else {
        t.el.className = 'px-3 py-1.5 rounded-lg font-semibold bg-slate-800/60 text-slate-400 hover:bg-slate-700/50 transition-all';
      }
    });

    this.renderNews(this.allNews[tab] || []);
  }

  openModal(title, body, image, sourceUrl = '') {
    const overlay = document.getElementById('news-modal-overlay');
    const mt = document.getElementById('modal-title');
    const mb = document.getElementById('modal-body');
    const mi = document.getElementById('modal-image');
    const ml = document.getElementById('modal-external-link');

    const exactUrl = sourceUrl || (window.resolveArticleUrl ? window.resolveArticleUrl(title, body, this.activeTab) : 'https://www.fortnite.com/news');

    if (mt) mt.textContent = title;
    if (mb) mb.innerHTML = body.replace(/\n/g, '<br>');
    if (mi) mi.src = image;
    if (ml) ml.href = exactUrl;

    if (overlay) overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    this.refreshIcons();
  }

  closeModal() {
    const overlay = document.getElementById('news-modal-overlay');
    if (overlay) overlay.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }

  openMapModal() {
    const overlay = document.getElementById('map-modal-overlay');
    if (overlay) overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    this.refreshIcons();
  }

  closeMapModal() {
    const overlay = document.getElementById('map-modal-overlay');
    if (overlay) overlay.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }

  toggleNotification() {
    if (!('Notification' in window)) {
      alert('이 브라우저는 데스크톱 웹 알림을 지원하지 않습니다.');
      return;
    }

    Notification.requestPermission().then(permission => {
      const btnText = document.getElementById('notify-btn-text');
      const btn = document.getElementById('notify-toggle-btn');
      if (permission === 'granted') {
        if (btnText) btnText.textContent = '알림 켜짐';
        if (btn) btn.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/50 text-blue-400 text-xs font-medium transition-colors';
        this.showToast('알림 활성화', '서버 오픈 및 패치 업데이트 시 즉시 알려드립니다.', 'success');
        new Notification('포트나이트 실시간 알림 활성화', {
          body: '서버 점검 해제 시 실시간 알림을 보내드립니다.',
          icon: 'https://cdn2.unrealengine.com/fn-f-logo-300x300-300x300-843825997.png'
        });
      }
    });
  }

  setSpinner(spinning) {
    const btn = document.getElementById('refresh-btn');
    const icon = btn?.querySelector('i');
    if (icon) {
      if (spinning) icon.classList.add('animate-spin');
      else icon.classList.remove('animate-spin');
    }
  }

  showToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'p-4 rounded-xl border border-blue-500/40 bg-slate-900 text-blue-400 shadow-2xl backdrop-blur-xl flex items-start gap-3 w-80 sm:w-96 transition-all duration-300';
    toast.innerHTML = `
      <div class="mt-0.5"><i data-lucide="info" class="w-5 h-5"></i></div>
      <div class="flex-1">
        <h4 class="text-sm font-bold text-white mb-0.5">${title}</h4>
        <p class="text-xs text-slate-300 leading-relaxed">${message}</p>
      </div>
    `;
    container.appendChild(toast);
    this.refreshIcons();

    setTimeout(() => toast.remove(), 4000);
  }

  refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      try { window.lucide.createIcons(); } catch (e) {}
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();
});
