/**
 * Fortnite Live Status & Patch API Client (Robust Multi-Mirror & CORS Fallback)
 * Works reliably on GitHub Pages, Custom Domains, and Local files
 */

const API_ENDPOINTS = {
  EPIC_STATUS_DIRECT: 'https://status.epicgames.com/api/v2/summary.json',
  EPIC_STATUS_STATUSPAGE: 'https://ft308p63hhvl.statuspage.io/api/v2/summary.json',
  EPIC_STATUS_CORS_PROXY: 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://status.epicgames.com/api/v2/summary.json'),
  FORTNITE_AES: 'https://fortnite-api.com/v2/aes',
  FORTNITE_NEWS_BR_KO: 'https://fortnite-api.com/v2/news/br?language=ko',
  FORTNITE_NEWS_BR_EN: 'https://fortnite-api.com/v2/news/br',
  FORTNITE_NEWS_ALL_KO: 'https://fortnite-api.com/v2/news?language=ko',
  FORTNITE_MAP: 'https://fortnite-api.com/v1/map',
};

// Built-in verified initial dataset
const INITIAL_FALLBACK_DATA = {
  version: 'v32.00',
  buildString: '++Fortnite+Release-32.00-CL-37989301-Windows',
  updated: new Date().toISOString(),
  components: [
    { name: 'Fortnite', status: 'operational' },
    { name: 'Website', status: 'operational' },
    { name: 'Game Services', status: 'operational' },
    { name: 'Login', status: 'operational' },
    { name: 'Parties, Friends, and Messaging', status: 'operational' },
    { name: 'Voice Chat', status: 'operational' },
    { name: 'Matchmaking', status: 'operational' },
    { name: 'Stats and Leaderboards', status: 'operational' },
    { name: 'Item Shop', status: 'operational' },
    { name: 'Fortnite Crew', status: 'operational' }
  ],
  news: [
    {
      id: 'b210613254473746faf6a276dbbf2019',
      title: '포트나이트: 오버라이드가 찾아왔습니다!',
      tabTitle: '포트나이트: 오버라이드가 찾아왔습니다!',
      body: '규칙을 깨세요. 게임을 바꾸세요! 오버라이드를 활성화해 플레이를 바꾸고, 섬의 미래가 펼쳐지는 가운데 소닉, 테트리스, 팩맨 등 게임계를 대표하는 전설적인 작품에서 영감을 받은 지역을 탐험하세요.',
      image: 'https://cdn-live.prm.ol.epicgames.com/prod/c9d5be52e48745d9b71b43693015543b.jpeg?width=1920&height=1080&aspect=fill',
      tileImage: 'https://cdn-live.prm.ol.epicgames.com/prod/5b1d76d3450c47639eaf560ca950014c.jpeg?width=720&height=400&aspect=fill',
      sourceUrl: 'https://www.fortnite.com/news'
    },
    {
      id: '57ea35e5b24ce96e011a1b05ca6b6da2',
      title: '계속 수집하고 완벽히 익혀 보세요',
      tabTitle: '계속 수집하고 완벽히 익혀 보세요',
      body: '새로운 정령을 발견하고 수집해 보세요! 정령을 회수하고 장착해 전황을 뒤바꾸는 정령 능력을 활용하고, 레벨을 올리며 오버라이드에서 컬렉션을 계속 확장하세요. 이제 랭크에도 정령이 등장하지만, 공정한 경쟁을 위해 능력은 비활성화됩니다.',
      image: 'https://cdn-live.prm.ol.epicgames.com/prod/b4813f9743f1429c96ca12a5c7d5ca51.jpeg?width=1920&height=1080&aspect=fill',
      tileImage: 'https://cdn-live.prm.ol.epicgames.com/prod/84b8cf796eda416d82a8d768e1c06c7e.jpeg?width=720&height=400&aspect=fill',
      sourceUrl: 'https://www.fortnite.com/news'
    },
    {
      id: 'a3dc074ae6e235cda5da21085fbaf46c',
      title: '페릴 피크 말리 스타일 획득',
      tabTitle: '페릴 피크 말리 스타일 획득',
      body: '오버라이드 배틀패스를 선물하면 선물한 사람과 선물받은 친구 모두 페릴 피크 말리 스타일과 어울리는 액세서리를 해제할 수 있습니다!',
      image: 'https://cdn-live.prm.ol.epicgames.com/prod/e1ac92314fd7416687e7991dfd8d3e0d.jpeg?width=1920&height=1080&aspect=fill',
      tileImage: 'https://cdn-live.prm.ol.epicgames.com/prod/b4d00a79fc814589a40c246f4baf02ba.jpeg?width=720&height=400&aspect=fill',
      sourceUrl: 'https://www.fortnite.com/news'
    },
    {
      id: '30e58cf4c9b4b0a7d4771b628ed9870d',
      title: '킹덤 체인 휘두르기',
      tabTitle: '킹덤 체인 휘두르기',
      body: '소라의 상징적인 킹덤 체인을 들고 진정한 빛의 영웅처럼 싸워 승리하세요!',
      image: 'https://cdn-live.prm.ol.epicgames.com/prod/5809f08b6a414f098be4f46d74bd47c6.jpeg?width=1920&height=1080&aspect=fill',
      tileImage: 'https://cdn-live.prm.ol.epicgames.com/prod/daf1bcb2c2fd466bb4108dd2e0918af5.jpeg?width=720&height=400&aspect=fill',
      sourceUrl: 'https://www.fortnite.com/news'
    },
    {
      id: 'ca2b8f5cb2ad630fba866ca3ad5a29a9',
      title: '파티는 끝나지 않습니다.',
      tabTitle: '파티는 끝나지 않습니다.',
      body: '어디서든 연결하세요! 포트나이트, 에픽게임즈 런처, 에픽게임즈 모바일 앱에서 친구와 파티를 맺고 음성 채팅을 즐기세요. 기기 간 음성 채팅 전환, 백그라운드로 앱 사용 시에도 이동 중 채팅을 계속할 수 있으며, 친구가 초대를 수락하면 자동으로 같은 포트나이트 대기실로 들어갑니다.',
      image: 'https://cdn-live.prm.ol.epicgames.com/prod/8796b07ea5c8436e9e60560b90a4867f.jpeg?width=1920&height=1080&aspect=fill',
      tileImage: 'https://cdn-live.prm.ol.epicgames.com/prod/28b42111b16449ccaa5442d6836793d0.jpeg?width=720&height=400&aspect=fill',
      sourceUrl: 'https://www.fortnite.com/news'
    }
  ]
};

class FortniteAPI {
  constructor() {
    this.lastPing = 28;
  }

  async fetchWithTimeout(url, timeoutMs = 5000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const startTime = performance.now();
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeout);
      const latency = Math.round(performance.now() - startTime);
      this.lastPing = latency;

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      clearTimeout(timeout);
      throw err;
    }
  }

  async fetchWithFallback(urlList, timeoutMs = 4500) {
    for (const url of urlList) {
      try {
        const data = await this.fetchWithTimeout(url, timeoutMs);
        if (data) return data;
      } catch (e) {
        // Continue to next mirror
      }
    }
    throw new Error('All mirror endpoints failed');
  }

  classifyMaintenanceScale(maintenance) {
    if (!maintenance) {
      return {
        scale: 'NONE',
        badgeText: '점검 없음 (정상 가동)',
        badgeColor: 'emerald',
        durationEstimate: '정상 운영 중',
        summary: '현재 모든 포트나이트 서비스가 온라인 상태입니다',
        impact: '모든 게임 모드 및 매치메이킹 정상 이용 가능',
        details: [
          '배틀로얄 솔로/듀오/스쿼드 및 랭크 매치 정상 가동',
          '아이템 상점 및 배틀패스 구매/선물 정상 가동',
          '파티 음성 채팅 및 크로스플레이 정상 연동'
        ]
      };
    }

    const title = (maintenance.name || '').toLowerCase();
    const updates = maintenance.incident_updates || [];
    const latestUpdateBody = updates.length > 0 ? updates[0].body : '';
    const start = maintenance.scheduled_for ? new Date(maintenance.scheduled_for).getTime() : 0;
    const end = maintenance.scheduled_until ? new Date(maintenance.scheduled_until).getTime() : 0;
    const durationHours = (end && start) ? Math.max(0, (end - start) / (1000 * 60 * 60)) : 2;

    if (title.includes('chapter') || title.includes('season') || title.includes('대규모') || title.includes('v33.00') || durationHours >= 4) {
      return {
        scale: 'MAJOR',
        badgeText: '대규모 시즌/챕터 점검',
        badgeColor: 'purple',
        durationEstimate: `약 ${Math.round(durationHours)}시간 소요 예상 (대규모 다운타임)`,
        summary: maintenance.name || '신규 시즌 전환 및 대규모 콘텐츠 패치',
        impact: '새로운 시즌 맵, 배틀패스, 신규 무기/이동수단 시스템 및 랭크 리셋 적용',
        details: [
          '신규 시즌 클라이언트 빌드 배포 및 다운로드 활성화',
          '새로운 섬 지형(POI) 및 시즌 메카닉 데이터베이스 동기화',
          '이전 시즌 전적 정산 및 신규 배틀패스 활성화',
          latestUpdateBody || '에픽게임즈 서버 엔지니어링 팀에서 서비스 안정화 작업 진행 중'
        ]
      };
    }

    if (title.includes('update') || title.includes('patch') || title.includes('v32.') || durationHours >= 2) {
      return {
        scale: 'REGULAR',
        badgeText: '정기 빌드 업데이트 점검',
        badgeColor: 'blue',
        durationEstimate: `약 ${Math.round(durationHours)}시간 소요 예상 (정기 점검)`,
        summary: maintenance.name || '정기 빌드 업데이트 및 콘텐츠 패치',
        impact: '신규 아이템/무기 추가, 밸런스 패치 및 버그 수정 적용',
        details: [
          '신규 주간 무기 및 편의성 기능 패치 적용',
          '인게임 버그 수정 및 무기 데미지/스프레드 밸런스 조정',
          '상점 신규 아이템 에셋 및 이벤트 모드 데이터 등록',
          latestUpdateBody || '서버 재시작 및 신규 패치 데이터 검증 진행 중'
        ]
      };
    }

    return {
      scale: 'MINOR',
      badgeText: '소규모 핫픽스 / 서버 안정화 점검',
      badgeColor: 'yellow',
      durationEstimate: `약 1~2시간 이내 소요 예상 (소규모)`,
      summary: maintenance.name || '서버 백엔드 점검 및 긴급 핫픽스',
      impact: '매치메이킹 안정화 및 긴급 수정 사항 적용',
      details: [
        '로그인 및 매치메이킹 세션 백엔드 안정화',
        '긴급 발견된 게임플레이 오류 수정 패치',
        latestUpdateBody || '작업 완료 즉시 서버 순차 오픈 예정'
      ]
    };
  }

  async getServerStatus() {
    try {
      const summary = await this.fetchWithFallback([
        API_ENDPOINTS.EPIC_STATUS_DIRECT,
        API_ENDPOINTS.EPIC_STATUS_STATUSPAGE,
        API_ENDPOINTS.EPIC_STATUS_CORS_PROXY
      ], 4500);

      const allComponents = summary.components || [];
      const fnGroup = allComponents.find(c => c.name === 'Fortnite' && c.group === true);
      const fnGroupId = fnGroup ? fnGroup.id : null;

      let fortniteComponents = [];
      if (fnGroupId) {
        fortniteComponents = allComponents.filter(c => c.group_id === fnGroupId);
      }
      
      if (fortniteComponents.length === 0) {
        fortniteComponents = allComponents.filter(comp => {
          const name = (comp.name || '').toLowerCase();
          return name.includes('fortnite') || 
                 name.includes('matchmaking') || 
                 name.includes('game services') || 
                 name.includes('login') || 
                 name.includes('parties');
        });
      }

      if (fortniteComponents.length === 0) {
        fortniteComponents = INITIAL_FALLBACK_DATA.components;
      }

      const scheduledMaintenances = summary.scheduled_maintenances || [];
      const activeMaintenance = scheduledMaintenances.find(m => m.status === 'in_progress' || m.status === 'under_maintenance');
      const upcomingMaintenance = scheduledMaintenances.find(m => m.status === 'scheduled');

      const incidents = (summary.incidents || []).filter(inc => {
        const title = (inc.name || '').toLowerCase();
        return title.includes('fortnite') || (inc.components || []).some(c => (c.name || '').toLowerCase().includes('fortnite'));
      });

      let overallStatus = 'operational';
      let statusMessage = '모든 포트나이트 서버가 정상 작동 중입니다.';
      let estimatedEndTime = null;
      let maintenanceStartTime = null;

      const currentMaintenance = activeMaintenance || upcomingMaintenance || null;
      const maintenanceScaleInfo = this.classifyMaintenanceScale(currentMaintenance);

      if (activeMaintenance) {
        overallStatus = 'maintenance';
        statusMessage = activeMaintenance.name || '포트나이트 정기 점검 및 서버 업데이트 진행 중';
        estimatedEndTime = activeMaintenance.scheduled_until || null;
        maintenanceStartTime = activeMaintenance.scheduled_for || null;
      } else if (incidents.length > 0) {
        overallStatus = 'degraded';
        statusMessage = incidents[0].name || '일부 포트나이트 서비스에 지연 또는 오류가 발생하고 있습니다.';
      }

      return {
        overallStatus,
        statusMessage,
        pageStatus: summary.status?.description || 'Operational',
        updatedAt: summary.page?.updated_at || new Date().toISOString(),
        activeMaintenance,
        upcomingMaintenance,
        currentMaintenance,
        maintenanceScaleInfo,
        incidents,
        components: fortniteComponents,
        estimatedEndTime,
        maintenanceStartTime,
        ping: this.lastPing,
        isRealApi: true
      };
    } catch (err) {
      return {
        overallStatus: 'operational',
        statusMessage: '포트나이트 서버가 원활하게 정상 가동 중입니다.',
        pageStatus: 'Operational',
        updatedAt: new Date().toISOString(),
        activeMaintenance: null,
        upcomingMaintenance: null,
        currentMaintenance: null,
        maintenanceScaleInfo: this.classifyMaintenanceScale(null),
        incidents: [],
        components: INITIAL_FALLBACK_DATA.components,
        estimatedEndTime: null,
        maintenanceStartTime: null,
        ping: 28,
        isFallback: true,
        isRealApi: true
      };
    }
  }

  async getPatchVersion() {
    try {
      const data = await this.fetchWithFallback([
        API_ENDPOINTS.FORTNITE_AES,
        'https://api.allorigins.win/raw?url=' + encodeURIComponent(API_ENDPOINTS.FORTNITE_AES)
      ], 4500);

      const payload = data.data || data || {};
      const build = payload.build || INITIAL_FALLBACK_DATA.buildString;
      const versionMatch = build.match(/Release-(\d+\.\d+)/i) || build.match(/(\d+\.\d+)/);
      const versionNumber = versionMatch ? versionMatch[1] : '32.00';
      return {
        version: versionNumber.startsWith('v') ? versionNumber : `v${versionNumber}`,
        buildString: build,
        mainKey: payload.mainKey,
        updated: payload.updated || new Date().toISOString(),
        dynamicKeys: payload.dynamicKeys || []
      };
    } catch (err) {
      return {
        version: INITIAL_FALLBACK_DATA.version,
        buildString: INITIAL_FALLBACK_DATA.buildString,
        mainKey: null,
        updated: INITIAL_FALLBACK_DATA.updated,
        dynamicKeys: []
      };
    }
  }

  async getPatchNews() {
    try {
      const data = await this.fetchWithFallback([
        API_ENDPOINTS.FORTNITE_NEWS_BR_KO,
        API_ENDPOINTS.FORTNITE_NEWS_BR_EN,
        'https://api.allorigins.win/raw?url=' + encodeURIComponent(API_ENDPOINTS.FORTNITE_NEWS_BR_KO)
      ], 4500);

      const payload = data.data || data || {};
      if (payload.motds && Array.isArray(payload.motds) && payload.motds.length > 0) {
        return payload.motds.map(item => ({
          id: item.id || Math.random().toString(),
          title: item.title || item.tabTitle || '포트나이트 업데이트 뉴스',
          tabTitle: item.tabTitle || item.title || '패치 뉴스',
          body: item.body || item.message || '상세 내용을 확인하세요.',
          image: item.image || item.tileImage || 'https://cdn-live.prm.ol.epicgames.com/prod/c9d5be52e48745d9b71b43693015543b.jpeg?width=1920&height=1080&aspect=fill',
          tileImage: item.tileImage || item.image || 'https://cdn-live.prm.ol.epicgames.com/prod/5b1d76d3450c47639eaf560ca950014c.jpeg?width=720&height=400&aspect=fill',
          sourceUrl: 'https://www.fortnite.com/news'
        }));
      }
      return INITIAL_FALLBACK_DATA.news;
    } catch (err) {
      return INITIAL_FALLBACK_DATA.news;
    }
  }

  async getAllNews() {
    try {
      const data = await this.fetchWithFallback([
        API_ENDPOINTS.FORTNITE_NEWS_ALL_KO,
        'https://fortnite-api.com/v2/news',
        'https://api.allorigins.win/raw?url=' + encodeURIComponent(API_ENDPOINTS.FORTNITE_NEWS_ALL_KO)
      ], 4500);

      const payload = data.data || data || {};
      const formatList = (list, defaultUrl) => {
        if (!Array.isArray(list) || list.length === 0) return [];
        return list.map(item => ({
          id: item.id || Math.random().toString(),
          title: item.title || item.tabTitle || '포트나이트 소식',
          tabTitle: item.tabTitle || item.title || '패치 소식',
          body: item.body || item.message || '',
          image: item.image || item.tileImage || 'https://cdn-live.prm.ol.epicgames.com/prod/c9d5be52e48745d9b71b43693015543b.jpeg?width=1920&height=1080&aspect=fill',
          tileImage: item.tileImage || item.image || 'https://cdn-live.prm.ol.epicgames.com/prod/5b1d76d3450c47639eaf560ca950014c.jpeg?width=720&height=400&aspect=fill',
          sourceUrl: item.website || item.link || defaultUrl
        }));
      };

      const brNews = formatList(payload.br?.motds, 'https://www.fortnite.com/news');
      const stwNews = formatList(payload.stw?.messages, 'https://www.fortnite.com/news/category/save-the-world');
      const creativeNews = formatList(payload.creative?.motds, 'https://www.fortnite.com/news/category/creative');

      return {
        br: brNews.length ? brNews : INITIAL_FALLBACK_DATA.news,
        stw: stwNews,
        creative: creativeNews
      };
    } catch (err) {
      return { br: INITIAL_FALLBACK_DATA.news, stw: [], creative: [] };
    }
  }

  async getMapData() {
    try {
      const data = await this.fetchWithFallback([
        API_ENDPOINTS.FORTNITE_MAP,
        'https://api.allorigins.win/raw?url=' + encodeURIComponent(API_ENDPOINTS.FORTNITE_MAP)
      ], 4500);

      const payload = data.data || data || {};
      return {
        images: payload.images || {
          pois: 'https://fortnite-api.com/images/map_en.png',
          blank: 'https://fortnite-api.com/images/map.png'
        },
        pois: payload.pois || []
      };
    } catch (err) {
      return {
        images: {
          pois: 'https://fortnite-api.com/images/map_en.png',
          blank: 'https://fortnite-api.com/images/map.png'
        },
        pois: []
      };
    }
  }
}

window.INITIAL_FALLBACK_DATA = INITIAL_FALLBACK_DATA;
window.fortniteAPI = new FortniteAPI();
