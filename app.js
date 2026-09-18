/**
 * Main Application Controller for Fortnite Status & Patch Tracker (Production Ready)
 */

document.addEventListener('DOMContentLoaded', () => {
  const app = {
    state: {
      serverData: null,
      patchData: null,
      newsData: [],
      allNewsData: { br: [], stw: [], creative: [] },
      mapData: null,
      activeTab: 'br',
      isRefreshing: false,
      lastUpdated: null,
      nextRefreshIn: 30,
    },

    elements: {
      // Live Badge & Ping
      headerStatusIndicator: document.getElementById('header-status-indicator'),
      headerStatusText: document.getElementById('header-status-text'),
      pingDisplay: document.getElementById('ping-display'),
      lastUpdateDisplay: document.getElementById('last-update-display'),
      autoRefreshCountdown: document.getElementById('auto-refresh-countdown'),
      refreshBtn: document.getElementById('refresh-btn'),
      notifyToggleBtn: document.getElementById('notify-toggle-btn'),
      notifyBtnText: document.getElementById('notify-btn-text'),

      // Version & Patch Info (Top Header Section)
      currentVersionBadge: document.getElementById('current-version-badge'),
      buildStringText: document.getElementById('build-string-text'),
      patchDateText: document.getElementById('patch-date-text'),

      // Hero Server Status Section
      statusHeroCard: document.getElementById('status-hero-card'),
      statusBadge: document.getElementById('status-badge'),
      statusTitle: document.getElementById('status-title'),
      statusDescription: document.getElementById('status-description'),
      
      // Countdown Timer Box
      countdownBox: document.getElementById('countdown-box'),
      countdownLabel: document.getElementById('countdown-label'),
      timerHours: document.getElementById('timer-hours'),
      timerMinutes: document.getElementById('timer-minutes'),
      timerSeconds: document.getElementById('timer-seconds'),
      timeInfoStart: document.getElementById('time-info-start'),
      timeInfoEnd: document.getElementById('time-info-end'),

      // Maintenance Scale & Details List
      maintenanceScaleBadge: document.getElementById('maintenance-scale-badge'),
      maintenanceTypeTitle: document.getElementById('maintenance-type-title'),
      maintenanceImpactText: document.getElementById('maintenance-impact-text'),
      maintenanceDetailsList: document.getElementById('maintenance-details-list'),

      // News & Feed Section
      newsTabBr: document.getElementById('tab-br'),
      newsTabStw: document.getElementById('tab-stw'),
      newsTabCreative: document.getElementById('tab-creative'),
      newsGrid: document.getElementById('news-grid'),
      newsEmptyState: document.getElementById('news-empty-state'),

      // Server Component Grid
      componentsGrid: document.getElementById('components-grid'),

      // Map View
      mapContainer: document.getElementById('map-container'),
      mapImage: document.getElementById('map-image'),
      mapFullscreenBtn: document.getElementById('map-fullscreen-btn'),
      mapModalOverlay: document.getElementById('map-modal-overlay'),
      mapModalImage: document.getElementById('map-modal-image'),
      mapModalCloseBtn: document.getElementById('map-modal-close-btn'),

      // News Modal
      modalOverlay: document.getElementById('news-modal-overlay'),
      modalContent: document.getElementById('news-modal-content'),
      modalCloseBtn: document.getElementById('modal-close-btn'),
      modalImage: document.getElementById('modal-image'),
      modalTitle: document.getElementById('modal-title'),
      modalBody: document.getElementById('modal-body'),
      modalExternalLink: document.getElementById('modal-external-link'),

      toastContainer: document.getElementById('toast-container'),
    },

    init() {
      this.bindEvents();
      this.setupCountdownListener();
      this.setupAutoRefresh();
      this.updateNotificationUI();
      this.loadAllData();
    },

    bindEvents() {
      // Manual refresh
      this.elements.refreshBtn.addEventListener('click', () => {
        if (!this.state.isRefreshing) {
          this.loadAllData(true);
        }
      });

      // Notification toggle
      this.elements.notifyToggleBtn.addEventListener('click', async () => {
        if (window.notificationManager.isEnabled()) {
          window.notificationManager.disable();
          this.showToast('알림 해제', '데스크톱 알림이 비활성화되었습니다.', 'info');
        } else {
          const granted = await window.notificationManager.requestPermission();
          if (granted) {
            this.showToast('알림 설정 완료', '서버 점검 해제 시 실시간 알림을 보내드립니다.', 'success');
          }
        }
        this.updateNotificationUI();
      });

      // Tabs
      this.elements.newsTabBr.addEventListener('click', () => this.switchTab('br'));
      this.elements.newsTabStw.addEventListener('click', () => this.switchTab('stw'));
      this.elements.newsTabCreative.addEventListener('click', () => this.switchTab('creative'));

      // Map Fullscreen Modal
      if (this.elements.mapContainer) {
        this.elements.mapContainer.addEventListener('click', () => this.openMapModal());
      }
      if (this.elements.mapFullscreenBtn) {
        this.elements.mapFullscreenBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openMapModal();
        });
      }
      if (this.elements.mapModalCloseBtn) {
        this.elements.mapModalCloseBtn.addEventListener('click', () => this.closeMapModal());
      }
      if (this.elements.mapModalOverlay) {
        this.elements.mapModalOverlay.addEventListener('click', (e) => {
          if (e.target === this.elements.mapModalOverlay || e.target.tagName === 'DIV') {
            this.closeMapModal();
          }
        });
      }

      // News Modal Close
      this.elements.modalCloseBtn.addEventListener('click', () => this.closeModal());
      this.elements.modalOverlay.addEventListener('click', (e) => {
        if (e.target === this.elements.modalOverlay) {
          this.closeModal();
        }
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeModal();
          this.closeMapModal();
        }
      });
    },

    setupCountdownListener() {
      window.countdownEngine.onTick((tick) => {
        this.renderCountdownDisplay(tick);
      });

      window.countdownEngine.onComplete(() => {
        this.showToast('점검 상태 갱신', '예정된 시간이 도달했습니다. 최신 서버 상태를 확인합니다.', 'success');
        setTimeout(() => this.loadAllData(), 2000);
      });
    },

    setupAutoRefresh() {
      setInterval(() => {
        if (this.state.isRefreshing) return;
        this.state.nextRefreshIn -= 1;
        if (this.state.nextRefreshIn <= 0) {
          this.state.nextRefreshIn = 30;
          this.loadAllData(false);
        }
        if (this.elements.autoRefreshCountdown) {
          this.elements.autoRefreshCountdown.textContent = `${this.state.nextRefreshIn}s`;
        }
      }, 1000);
    },

    async loadAllData(showToastFeedback = false) {
      this.state.isRefreshing = true;
      this.setRefreshSpinner(true);

      try {
        const [serverData, patchData, newsData, allNewsData, mapData] = await Promise.all([
          window.fortniteAPI.getServerStatus(),
          window.fortniteAPI.getPatchVersion(),
          window.fortniteAPI.getPatchNews(),
          window.fortniteAPI.getAllNews(),
          window.fortniteAPI.getMapData()
        ]);

        this.state.serverData = serverData;
        this.state.patchData = patchData;
        this.state.newsData = newsData;
        this.state.allNewsData = allNewsData;
        this.state.mapData = mapData;
        this.state.lastUpdated = new Date();
        this.state.nextRefreshIn = 30;

        this.renderPatchInfo(patchData);
        this.renderServerStatus(serverData);
        this.renderNewsGrid();
        this.renderComponents(serverData.components);
        this.renderMap(mapData);

        // State changes check
        window.notificationManager.checkStateChange(serverData.overallStatus, patchData.version);

        this.updateHeaderMeta(serverData.ping);

        if (showToastFeedback) {
          this.showToast('실시간 동기화 완료', '에픽게임즈 공식 서버 및 패치 데이터가 최신으로 갱신되었습니다.', 'success');
        }
      } catch (err) {
        console.error('[App] Load error:', err);
        if (showToastFeedback) {
          this.showToast('갱신 오류', '데이터를 불러오는 중 문제가 발생했습니다.', 'error');
        }
      } finally {
        this.state.isRefreshing = false;
        this.setRefreshSpinner(false);
        if (window.lucide) {
          window.lucide.createIcons();
        }
      }
    },

    renderServerStatus(serverData) {
      const { overallStatus, statusMessage, activeMaintenance, upcomingMaintenance, estimatedEndTime, maintenanceStartTime, maintenanceScaleInfo } = serverData;

      const headerIndicator = this.elements.headerStatusIndicator;
      const headerText = this.elements.headerStatusText;

      headerIndicator.className = 'w-2.5 h-2.5 rounded-full';
      if (overallStatus === 'operational') {
        headerIndicator.classList.add('bg-emerald-500', 'shadow-[0_0_8px_#10b981]');
        headerText.textContent = '서버 정상 가동 중';
        headerText.className = 'text-xs font-semibold text-emerald-400';
      } else if (overallStatus === 'maintenance') {
        headerIndicator.classList.add('bg-yellow-500', 'shadow-[0_0_8px_#facc15]', 'animate-pulse');
        headerText.textContent = '서버 점검 진행 중';
        headerText.className = 'text-xs font-semibold text-yellow-400';
      } else {
        headerIndicator.classList.add('bg-rose-500', 'shadow-[0_0_8px_#ef4444]', 'animate-pulse');
        headerText.textContent = '서비스 지연 / 장애';
        headerText.className = 'text-xs font-semibold text-rose-400';
      }

      const heroCard = this.elements.statusHeroCard;
      const statusBadge = this.elements.statusBadge;
      const statusTitle = this.elements.statusTitle;
      const statusDesc = this.elements.statusDescription;

      heroCard.classList.remove('border-emerald-500/40', 'border-yellow-500/40', 'border-rose-500/40');

      // Render Maintenance Scale & Detailed Work Items
      if (this.elements.maintenanceScaleBadge && this.elements.maintenanceTypeTitle && this.elements.maintenanceImpactText) {
        if (overallStatus === 'maintenance' && maintenanceScaleInfo) {
          const badgeClass = maintenanceScaleInfo.scale === 'MAJOR' 
            ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
            : maintenanceScaleInfo.scale === 'REGULAR'
            ? 'bg-blue-950/80 text-blue-300 border-blue-500/40'
            : 'bg-yellow-950/80 text-yellow-300 border-yellow-500/40';

          this.elements.maintenanceScaleBadge.className = `px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeClass}`;
          this.elements.maintenanceScaleBadge.textContent = maintenanceScaleInfo.badgeText;
          this.elements.maintenanceTypeTitle.textContent = maintenanceScaleInfo.summary;
          this.elements.maintenanceImpactText.textContent = `${maintenanceScaleInfo.durationEstimate} • ${maintenanceScaleInfo.impact}`;
        } else if (upcomingMaintenance && maintenanceScaleInfo) {
          this.elements.maintenanceScaleBadge.className = 'px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-blue-950/80 text-blue-300 border-blue-500/40';
          this.elements.maintenanceScaleBadge.textContent = '예정된 점검';
          this.elements.maintenanceTypeTitle.textContent = upcomingMaintenance.name || '정기 점검 예정';
          this.elements.maintenanceImpactText.textContent = `${CountdownEngine.formatKoreanDateTime(upcomingMaintenance.scheduled_for)} 시작 예정`;
        } else {
          this.elements.maintenanceScaleBadge.className = 'px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
          this.elements.maintenanceScaleBadge.textContent = '점검 없음 (정상 가동)';
          this.elements.maintenanceTypeTitle.textContent = '현재 모든 서비스가 온라인 상태입니다';
          this.elements.maintenanceImpactText.textContent = '포트나이트 정기 점검은 통상 화요일/목요일 오후 5시(KST) 전후 진행되며 보통 2~3시간 소요됩니다.';
        }

        // Render work detail bullet items
        if (this.elements.maintenanceDetailsList && maintenanceScaleInfo?.details) {
          this.elements.maintenanceDetailsList.innerHTML = maintenanceScaleInfo.details.map(item => `
            <li class="flex items-start gap-2 text-[11px] text-slate-300">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></span>
              <span>${item}</span>
            </li>
          `).join('');
        }
      }

      if (overallStatus === 'operational') {
        heroCard.classList.add('border-emerald-500/40');
        statusBadge.innerHTML = `<span class="flex h-2 w-2 rounded-full bg-emerald-400 mr-2"></span><span class="text-xs font-bold text-emerald-400 uppercase tracking-wider">ALL SERVERS ONLINE</span>`;
        statusBadge.className = 'inline-flex items-center px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30';
        statusTitle.textContent = '포트나이트 서버가 원활하게 가동 중입니다';
        statusDesc.textContent = upcomingMaintenance 
          ? `다음 예정된 점검: ${CountdownEngine.formatKoreanDateTime(upcomingMaintenance.scheduled_for)}` 
          : '현재 진행 중이거나 보고된 서버 장애가 없으며 모든 매치메이킹 및 게임 서비스가 정상 작동하고 있습니다.';

        if (upcomingMaintenance && upcomingMaintenance.scheduled_for) {
          this.elements.countdownLabel.textContent = '다음 점검 시작까지 남은 시간';
          this.elements.timeInfoStart.textContent = `점검 예정: ${CountdownEngine.formatKoreanDateTime(upcomingMaintenance.scheduled_for)}`;
          this.elements.timeInfoEnd.textContent = `종료 예상: ${CountdownEngine.formatKoreanDateTime(upcomingMaintenance.scheduled_until)}`;
          window.countdownEngine.setTarget(upcomingMaintenance.scheduled_for, 'maintenance_start');
        } else {
          this.elements.countdownLabel.textContent = '서버 상태 정상 (가동 중)';
          this.elements.timeInfoStart.textContent = `최근 상태 확인: ${CountdownEngine.formatKoreanDateTime(serverData.updatedAt)}`;
          this.elements.timeInfoEnd.textContent = '예정된 서버 점검 일정이 없습니다.';
          window.countdownEngine.setTarget(null, 'idle');
        }
      } else if (overallStatus === 'maintenance') {
        heroCard.classList.add('border-yellow-500/50');
        statusBadge.innerHTML = `<span class="flex h-2 w-2 rounded-full bg-yellow-400 mr-2 animate-ping"></span><span class="text-xs font-bold text-yellow-300 uppercase tracking-wider">UNDER MAINTENANCE</span>`;
        statusBadge.className = 'inline-flex items-center px-3 py-1 rounded-full bg-yellow-950/60 border border-yellow-500/40';
        statusTitle.textContent = statusMessage;
        statusDesc.textContent = '현재 포트나이트 패치 적용 및 서버 점검이 진행 중입니다. 점검이 완료되면 즉시 게임 접속이 가능합니다.';

        this.elements.countdownLabel.textContent = '서버 다운 해제(오픈) 예상 시간까지';
        this.elements.timeInfoStart.textContent = `점검 시작: ${CountdownEngine.formatKoreanDateTime(maintenanceStartTime)}`;
        this.elements.timeInfoEnd.textContent = `해제 예상: ${CountdownEngine.formatKoreanDateTime(estimatedEndTime) || '미정 (진행 상황에 따라 변동)'}`;

        window.countdownEngine.setTarget(estimatedEndTime, 'maintenance_end');
      } else {
        heroCard.classList.add('border-rose-500/50');
        statusBadge.innerHTML = `<span class="flex h-2 w-2 rounded-full bg-rose-400 mr-2"></span><span class="text-xs font-bold text-rose-300 uppercase tracking-wider">SERVICE DISRUPTION</span>`;
        statusBadge.className = 'inline-flex items-center px-3 py-1 rounded-full bg-rose-950/60 border border-rose-500/40';
        statusTitle.textContent = statusMessage;
        statusDesc.textContent = '일부 게임 서비스 또는 로그인에 지연이 감지되어 복구 작업이 진행 중입니다.';

        this.elements.countdownLabel.textContent = '서비스 정상화 복구 진행 중';
        this.elements.timeInfoStart.textContent = `감지 일시: ${CountdownEngine.formatKoreanDateTime(serverData.updatedAt)}`;
        this.elements.timeInfoEnd.textContent = '복구 완료 시 즉시 상태가 반영됩니다.';
        window.countdownEngine.setTarget(null, 'idle');
      }
    },

    renderCountdownDisplay(tick) {
      if (!this.elements.timerHours) return;

      if (tick.mode === 'idle' || tick.isFinished) {
        this.elements.timerHours.textContent = '--';
        this.elements.timerMinutes.textContent = '--';
        this.elements.timerSeconds.textContent = '--';
        return;
      }

      const totalHours = tick.hours + (tick.days * 24);
      this.elements.timerHours.textContent = String(totalHours).padStart(2, '0');
      this.elements.timerMinutes.textContent = String(tick.minutes).padStart(2, '0');
      this.elements.timerSeconds.textContent = String(tick.seconds).padStart(2, '0');
    },

    renderPatchInfo(patchData) {
      if (!patchData) return;
      this.elements.currentVersionBadge.textContent = patchData.version || 'v32.00';
      this.elements.buildStringText.textContent = patchData.buildString || '++Fortnite+Release-Live';
      this.elements.patchDateText.textContent = CountdownEngine.formatKoreanDateTime(patchData.updated);
    },

    switchTab(tab) {
      this.state.activeTab = tab;
      const tabs = [
        { id: 'br', el: this.elements.newsTabBr },
        { id: 'stw', el: this.elements.newsTabStw },
        { id: 'creative', el: this.elements.newsTabCreative }
      ];

      tabs.forEach(t => {
        if (t.id === tab) {
          t.el.classList.add('bg-blue-600', 'text-white', 'shadow-md');
          t.el.classList.remove('bg-slate-800/60', 'text-slate-400', 'hover:bg-slate-700/50');
        } else {
          t.el.classList.remove('bg-blue-600', 'text-white', 'shadow-md');
          t.el.classList.add('bg-slate-800/60', 'text-slate-400', 'hover:bg-slate-700/50');
        }
      });

      this.renderNewsGrid();
    },

    renderNewsGrid() {
      const grid = this.elements.newsGrid;
      grid.innerHTML = '';

      let items = [];
      if (this.state.activeTab === 'br') {
        items = (this.state.allNewsData.br && this.state.allNewsData.br.length) ? this.state.allNewsData.br : this.state.newsData;
      } else if (this.state.activeTab === 'stw') {
        items = this.state.allNewsData.stw;
      } else if (this.state.activeTab === 'creative') {
        items = this.state.allNewsData.creative;
      }

      if (!items || items.length === 0) {
        this.elements.newsEmptyState.classList.remove('hidden');
        return;
      }
      this.elements.newsEmptyState.classList.add('hidden');

      items.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'glass-panel glass-panel-hover rounded-xl overflow-hidden border border-slate-800 flex flex-col cursor-pointer transition-all duration-300 hover:border-blue-500/50 group';
        
        const title = item.title || item.tabTitle || '포트나이트 업데이트 뉴스';
        const body = item.body || item.message || '상세 내용을 확인하려면 클릭하세요.';
        const imageUrl = item.tileImage || item.image || 'https://cdn-live.prm.ol.epicgames.com/prod/5b1d76d3450c47639eaf560ca950014c.jpeg?width=720&height=400&aspect=fill';
        const sourceUrl = item.sourceUrl || 'https://www.fortnite.com/news';

        card.innerHTML = `
          <div class="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
            <img src="${imageUrl}" alt="${title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
            <div class="absolute top-3 left-3">
              <span class="px-2.5 py-1 text-xs font-semibold rounded bg-blue-600/90 text-white backdrop-blur-md">
                ${this.state.activeTab.toUpperCase()}
              </span>
            </div>
          </div>
          <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
              <h3 class="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1 mb-2">
                ${title}
              </h3>
              <p class="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                ${body}
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span class="flex items-center gap-1 font-semibold text-blue-400 group-hover:underline">
                자세히 보기
                <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
              </span>
              <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();" class="inline-flex items-center gap-1 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-2 py-1 rounded transition-colors" title="포트나이트 공식 사이트에서 보기">
                <span>공식 출처</span>
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
    },

    renderComponents(components) {
      const grid = this.elements.componentsGrid;
      if (!grid) return;
      grid.innerHTML = '';

      if (!components || components.length === 0) {
        grid.innerHTML = '<div class="text-slate-500 text-sm py-4 col-span-full text-center">컴포넌트 상태 정보를 불러오는 중입니다.</div>';
        return;
      }

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
        
        let statusBadge = '';
        if (comp.status === 'operational') {
          statusBadge = '<span class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/20 px-2.5 py-1 rounded-md"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>정상</span>';
        } else if (comp.status === 'under_maintenance') {
          statusBadge = '<span class="inline-flex items-center gap-1.5 text-xs font-semibold text-yellow-400 bg-yellow-950/80 border border-yellow-500/20 px-2.5 py-1 rounded-md"><span class="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>점검 중</span>';
        } else {
          statusBadge = '<span class="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 bg-rose-950/80 border border-rose-500/20 px-2.5 py-1 rounded-md"><span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>장애/지연</span>';
        }

        const displayName = nameMap[comp.name] || comp.name;

        item.innerHTML = `
          <div class="flex items-center gap-2.5">
            <i data-lucide="server" class="w-4 h-4 text-blue-400/70"></i>
            <span class="font-medium text-slate-200 text-xs sm:text-sm">${displayName}</span>
          </div>
          ${statusBadge}
        `;
        grid.appendChild(item);
      });
    },

    renderMap(mapData) {
      if (!mapData || !mapData.images) return;
      const mapImg = mapData.images.pois || mapData.images.blank || 'https://fortnite-api.com/images/map_en.png';
      if (this.elements.mapImage) {
        this.elements.mapImage.src = mapImg;
        this.elements.mapImage.classList.remove('hidden');
      }
      if (this.elements.mapModalImage) {
        this.elements.mapModalImage.src = mapImg;
      }
    },

    openMapModal() {
      if (!this.elements.mapModalOverlay) return;
      this.elements.mapModalOverlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      if (window.lucide) window.lucide.createIcons();
    },

    closeMapModal() {
      if (!this.elements.mapModalOverlay) return;
      this.elements.mapModalOverlay.classList.add('hidden');
      document.body.style.overflow = 'auto';
    },

    openModal(title, body, image, sourceUrl = 'https://www.fortnite.com/news') {
      this.elements.modalTitle.textContent = title;
      this.elements.modalBody.innerHTML = body.replace(/\n/g, '<br>');
      this.elements.modalImage.src = image;
      
      if (this.elements.modalExternalLink) {
        this.elements.modalExternalLink.href = sourceUrl;
      }

      this.elements.modalOverlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      if (window.lucide) window.lucide.createIcons();
    },

    closeModal() {
      this.elements.modalOverlay.classList.add('hidden');
      document.body.style.overflow = 'auto';
    },

    updateHeaderMeta(ping) {
      if (this.elements.pingDisplay) {
        this.elements.pingDisplay.textContent = ping ? `${ping}ms` : '< 50ms';
      }
      if (this.elements.lastUpdateDisplay && this.state.lastUpdated) {
        this.elements.lastUpdateDisplay.textContent = CountdownEngine.getRelativeTimeString(this.state.lastUpdated);
      }
    },

    updateNotificationUI() {
      const enabled = window.notificationManager.isEnabled();
      if (enabled) {
        this.elements.notifyBtnText.textContent = '알림 켜짐';
        this.elements.notifyToggleBtn.classList.add('bg-blue-600/20', 'border-blue-500/50', 'text-blue-400');
        this.elements.notifyToggleBtn.classList.remove('bg-slate-800/60', 'border-slate-700', 'text-slate-300');
      } else {
        this.elements.notifyBtnText.textContent = '서버 오픈 알림 받기';
        this.elements.notifyToggleBtn.classList.remove('bg-blue-600/20', 'border-blue-500/50', 'text-blue-400');
        this.elements.notifyToggleBtn.classList.add('bg-slate-800/60', 'border-slate-700', 'text-slate-300');
      }
    },

    setRefreshSpinner(isSpinning) {
      const icon = this.elements.refreshBtn.querySelector('i');
      if (!icon) return;
      if (isSpinning) {
        icon.classList.add('animate-spin');
      } else {
        icon.classList.remove('animate-spin');
      }
    },

    showToast(title, message, type = 'info') {
      const container = this.elements.toastContainer;
      if (!container) return;

      const toast = document.createElement('div');
      const colors = {
        success: 'border-emerald-500/40 bg-slate-900 text-emerald-400',
        warning: 'border-yellow-500/40 bg-slate-900 text-yellow-400',
        error: 'border-rose-500/40 bg-slate-900 text-rose-400',
        info: 'border-blue-500/40 bg-slate-900 text-blue-400',
      };

      toast.className = `p-4 rounded-xl border shadow-2xl backdrop-blur-xl transition-all duration-300 transform translate-y-2 opacity-0 flex items-start gap-3 w-80 sm:w-96 ${colors[type] || colors.info}`;
      toast.innerHTML = `
        <div class="mt-0.5">
          <i data-lucide="${type === 'success' ? 'check-circle' : type === 'warning' ? 'alert-triangle' : type === 'error' ? 'alert-octagon' : 'info'}" class="w-5 h-5"></i>
        </div>
        <div class="flex-1">
          <h4 class="text-sm font-bold text-white mb-0.5">${title}</h4>
          <p class="text-xs text-slate-300 leading-relaxed">${message}</p>
        </div>
      `;

      container.appendChild(toast);
      if (window.lucide) window.lucide.createIcons();

      setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
      }, 10);

      setTimeout(() => {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
      }, 4500);
    }
  };

  window.app = app;
  app.init();
});
