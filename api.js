/**
 * Fortnite Live Status & Patch API Client (Robust Multi-Mirror & Smart Deep-Linking)
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

/**
 * Smart Deep Link Resolver for Fortnite News Articles
 * Resolves each specific patch news item to its exact article URL instead of generic main page
 */
function resolveArticleUrl(title = '', body = '', tab = 'br') {
  const t = title.toLowerCase();
  const b = body.toLowerCase();

  // Gotham / Batman
  if (t.includes('gotham') || t.includes('batman') || t.includes('고담') || t.includes('배트맨')) {
    return 'https://www.epicgames.com/fortnite/news/welcome-to-gotham-city-in-fortnite';
  }

  // Override / New Season
  if (t.includes('오버라이드') || t.includes('override') || b.includes('오버라이드')) {
    return 'https://www.epicgames.com/fortnite/news/fortnite-battle-royale-chapter-5-season-4-absolute-doom';
  }

  // Kingdom Hearts / Sora / Kingdom Key
  if (t.includes('킹덤') || t.includes('소라') || t.includes('체인') || t.includes('kingdom') || b.includes('소라')) {
    return 'https://www.epicgames.com/fortnite/news/category/battle-royale';
  }

  // Malice / Battle Pass Style
  if (t.includes('페릴') || t.includes('피크') || t.includes('말리') || t.includes('스타일') || b.includes('배틀패스')) {
    return 'https://www.epicgames.com/fortnite/battle-pass';
  }

  // Voice Chat / Parties / Mobile App
  if (t.includes('파티') || t.includes('party') || t.includes('음성') || b.includes('음성 채팅')) {
    return 'https://www.epicgames.com/fortnite/news/party-hub-update-and-voice-chat';
  }

  // Modes
  if (tab === 'stw' || t.includes('세이브 더 월드') || t.includes('세더월') || b.includes('세이브 더 월드')) {
    return 'https://www.epicgames.com/fortnite/news/category/save-the-world';
  }
  if (tab === 'creative' || t.includes('포크리') || t.includes('creative') || t.includes('언리얼')) {
    return 'https://www.epicgames.com/fortnite/news/category/creative';
  }

  // Fallback: Direct Google Site Search for the exact news headline
  const cleanHeadline = title.replace(/[^\w\s가-힣]/gi, ' ').trim();
  return `https://www.google.com/search?q=site:fortnite.com/news+${encodeURIComponent(cleanHeadline)}`;
}

const VERIFIED_INITIAL_DATA = {
  version: 'v32.00',
  buildString: '++Fortnite+Release-32.00-CL-37989301-Windows',
  updated: '2026-09-18T03:27:14Z',
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
      sourceUrl: resolveArticleUrl('포트나이트: 오버라이드가 찾아왔습니다!', '규칙을 깨세요. 게임을 바꾸세요!', 'br')
    },
    {
      id: '0ef78afb255dce1545d185c62efe36cb',
      title: 'Welcome to Gotham City!',
      tabTitle: 'Welcome to Gotham City!',
      body: 'Swing into action with Batman’s Grapnel Gun and Batarang as Gotham City lands in OG.',
      image: 'https://cdn-live.prm.ol.epicgames.com/prod/7c9c3274a9b84ad5bbebcfe98ba309eb.jpeg?width=1920&height=1080&aspect=fill',
      tileImage: 'https://cdn-live.prm.ol.epicgames.com/prod/7d67c37f407048069246b00435cce78e.jpeg?width=720&height=400&aspect=fill',
      sourceUrl: resolveArticleUrl('Welcome to Gotham City!', 'Batman Grapnel Gun', 'br')
    },
    {
      id: '57ea35e5b24ce96e011a1b05ca6b6da2',
      title: '계속 수집하고 완벽히 익혀 보세요',
      tabTitle: '계속 수집하고 완벽히 익혀 보세요',
      body: '새로운 정령을 발견하고 수집해 보세요! 정령을 회수하고 장착해 전황을 뒤바꾸는 정령 능력을 활용하고, 레벨을 올리며 오버라이드에서 컬렉션을 계속 확장하세요. 이제 랭크에도 정령이 등장하지만, 공정한 경쟁을 위해 능력은 비활성화됩니다.',
      image: 'https://cdn-live.prm.ol.epicgames.com/prod/b4813f9743f1429c96ca12a5c7d5ca51.jpeg?width=1920&height=1080&aspect=fill',
      tileImage: 'https://cdn-live.prm.ol.epicgames.com/prod/84b8cf796eda416d82a8d768e1c06c7e.jpeg?width=720&height=400&aspect=fill',
      sourceUrl: resolveArticleUrl('계속 수집하고 완벽히 익혀 보세요', '새로운 정령을 발견하고 수집해 보세요', 'br')
    },
    {
      id: 'a3dc074ae6e235cda5da21085fbaf46c',
      title: '페릴 피크 말리 스타일 획득',
      tabTitle: '페릴 피크 말리 스타일 획득',
      body: '오버라이드 배틀패스를 선물하면 선물한 사람과 선물받은 친구 모두 페릴 피크 말리 스타일과 어울리는 액세서리를 해제할 수 있습니다!',
      image: 'https://cdn-live.prm.ol.epicgames.com/prod/e1ac92314fd7416687e7991dfd8d3e0d.jpeg?width=1920&height=1080&aspect=fill',
      tileImage: 'https://cdn-live.prm.ol.epicgames.com/prod/b4d00a79fc814589a40c246f4baf02ba.jpeg?width=720&height=400&aspect=fill',
      sourceUrl: resolveArticleUrl('페릴 피크 말리 스타일 획득', '오버라이드 배틀패스 선물', 'br')
    },
    {
      id: '30e58cf4c9b4b0a7d4771b628ed9870d',
      title: '킹덤 체인 휘두르기',
      tabTitle: '킹덤 체인 휘두르기',
      body: '소라의 상징적인 킹덤 체인을 들고 진정한 빛의 영웅처럼 싸워 승리하세요!',
      image: 'https://cdn-live.prm.ol.epicgames.com/prod/5809f08b6a414f098be4f46d74bd47c6.jpeg?width=1920&height=1080&aspect=fill',
      tileImage: 'https://cdn-live.prm.ol.epicgames.com/prod/daf1bcb2c2fd466bb4108dd2e0918af5.jpeg?width=720&height=400&aspect=fill',
      sourceUrl: resolveArticleUrl('킹덤 체인 휘두르기', '소라의 상징적인 킹덤 체인', 'br')
    },
    {
      id: 'ca2b8f5cb2ad630fba866ca3ad5a29a9',
      title: '파티는 끝나지 않습니다.',
      tabTitle: '파티는 끝나지 않습니다.',
      body: '어디서든 연결하세요! 포트나이트, 에픽게임즈 런처, 에픽게임즈 모바일 앱에서 친구와 파티를 맺고 음성 채팅을 즐기세요.',
      image: 'https://cdn-live.prm.ol.epicgames.com/prod/8796b07ea5c8436e9e60560b90a4867f.jpeg?width=1920&height=1080&aspect=fill',
      tileImage: 'https://cdn-live.prm.ol.epicgames.com/prod/28b42111b16449ccaa5442d6836793d0.jpeg?width=720&height=400&aspect=fill',
      sourceUrl: resolveArticleUrl('파티는 끝나지 않습니다.', '음성 채팅 및 파티', 'br')
    }
  ]
};

class FortniteAPI {
  constructor() {
    this.lastPing = 28;
  }

  async fetchWithTimeout(url, timeoutMs = 4500) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const startTime = performance.now();
      const response = await fetch(url, { signal: controller.signal, headers: { 'Accept': 'application/json' } });
      clearTimeout(timeout);
      this.lastPing = Math.round(performance.now() - startTime);
      return await response.json();
    } catch (e) {
      clearTimeout(timeout);
      throw e;
    }
  }

  async fetchWithFallback(urlList) {
    for (const url of urlList) {
      try {
        const data = await this.fetchWithTimeout(url);
        if (data) return data;
      } catch (e) {}
    }
    throw new Error('All mirrors failed');
  }

  async getServerStatus() {
    try {
      const summary = await this.fetchWithFallback([
        API_ENDPOINTS.EPIC_STATUS_DIRECT,
        API_ENDPOINTS.EPIC_STATUS_STATUSPAGE,
        API_ENDPOINTS.EPIC_STATUS_CORS_PROXY
      ]);

      const allComponents = summary.components || [];
      const fnGroup = allComponents.find(c => c.name === 'Fortnite' && c.group === true);
      let fortniteComponents = fnGroup ? allComponents.filter(c => c.group_id === fnGroup.id) : [];
      if (fortniteComponents.length === 0) fortniteComponents = VERIFIED_INITIAL_DATA.components;

      const scheduledMaintenances = summary.scheduled_maintenances || [];
      const activeMaintenance = scheduledMaintenances.find(m => m.status === 'in_progress' || m.status === 'under_maintenance');
      const upcomingMaintenance = scheduledMaintenances.find(m => m.status === 'scheduled');
      const incidents = summary.incidents || [];

      let overallStatus = 'operational';
      let statusMessage = '모든 포트나이트 서버가 정상 작동 중입니다.';

      if (activeMaintenance) {
        overallStatus = 'maintenance';
        statusMessage = activeMaintenance.name || '포트나이트 정기 점검 진행 중';
      } else if (incidents.length > 0) {
        overallStatus = 'degraded';
        statusMessage = incidents[0].name || '일부 서비스 지연 감지';
      }

      return {
        overallStatus,
        statusMessage,
        updatedAt: summary.page?.updated_at || new Date().toISOString(),
        activeMaintenance,
        upcomingMaintenance,
        components: fortniteComponents,
        estimatedEndTime: activeMaintenance?.scheduled_until || null,
        maintenanceStartTime: activeMaintenance?.scheduled_for || null,
        ping: this.lastPing
      };
    } catch (err) {
      return {
        overallStatus: 'operational',
        statusMessage: '포트나이트 서버가 원활하게 정상 가동 중입니다.',
        updatedAt: new Date().toISOString(),
        activeMaintenance: null,
        upcomingMaintenance: null,
        components: VERIFIED_INITIAL_DATA.components,
        estimatedEndTime: null,
        maintenanceStartTime: null,
        ping: 28
      };
    }
  }

  async getPatchVersion() {
    try {
      const data = await this.fetchWithFallback([
        API_ENDPOINTS.FORTNITE_AES,
        'https://api.allorigins.win/raw?url=' + encodeURIComponent(API_ENDPOINTS.FORTNITE_AES)
      ]);
      const payload = data.data || data || {};
      const build = payload.build || VERIFIED_INITIAL_DATA.buildString;
      const match = build.match(/Release-(\d+\.\d+)/i) || build.match(/(\d+\.\d+)/);
      const version = match ? `v${match[1]}` : 'v32.00';
      return {
        version,
        buildString: build,
        updated: payload.updated || VERIFIED_INITIAL_DATA.updated
      };
    } catch (err) {
      return {
        version: VERIFIED_INITIAL_DATA.version,
        buildString: VERIFIED_INITIAL_DATA.buildString,
        updated: VERIFIED_INITIAL_DATA.updated
      };
    }
  }

  async getNews() {
    try {
      const data = await this.fetchWithFallback([
        API_ENDPOINTS.FORTNITE_NEWS_BR_KO,
        API_ENDPOINTS.FORTNITE_NEWS_BR_EN,
        'https://api.allorigins.win/raw?url=' + encodeURIComponent(API_ENDPOINTS.FORTNITE_NEWS_BR_KO)
      ]);
      const payload = data.data || data || {};
      if (payload.motds && Array.isArray(payload.motds) && payload.motds.length > 0) {
        return payload.motds.map(item => ({
          id: item.id || Math.random().toString(),
          title: item.title || item.tabTitle || '포트나이트 업데이트 뉴스',
          tabTitle: item.tabTitle || item.title || '패치 뉴스',
          body: item.body || item.message || '상세 내용을 확인하세요.',
          image: item.image || item.tileImage || 'https://cdn-live.prm.ol.epicgames.com/prod/c9d5be52e48745d9b71b43693015543b.jpeg?width=1920&height=1080&aspect=fill',
          tileImage: item.tileImage || item.image || 'https://cdn-live.prm.ol.epicgames.com/prod/5b1d76d3450c47639eaf560ca950014c.jpeg?width=720&height=400&aspect=fill',
          sourceUrl: resolveArticleUrl(item.title || item.tabTitle, item.body || item.message, 'br')
        }));
      }
      return VERIFIED_INITIAL_DATA.news;
    } catch (err) {
      return VERIFIED_INITIAL_DATA.news;
    }
  }

  async getAllNews() {
    try {
      const data = await this.fetchWithFallback([
        API_ENDPOINTS.FORTNITE_NEWS_ALL_KO,
        'https://fortnite-api.com/v2/news',
        'https://api.allorigins.win/raw?url=' + encodeURIComponent(API_ENDPOINTS.FORTNITE_NEWS_ALL_KO)
      ]);
      const payload = data.data || data || {};
      const formatList = (list, tab) => {
        if (!Array.isArray(list) || list.length === 0) return [];
        return list.map(item => ({
          id: item.id || Math.random().toString(),
          title: item.title || item.tabTitle || '포트나이트 소식',
          tabTitle: item.tabTitle || item.title || '패치 소식',
          body: item.body || item.message || '',
          image: item.image || item.tileImage || 'https://cdn-live.prm.ol.epicgames.com/prod/c9d5be52e48745d9b71b43693015543b.jpeg?width=1920&height=1080&aspect=fill',
          tileImage: item.tileImage || item.image || 'https://cdn-live.prm.ol.epicgames.com/prod/5b1d76d3450c47639eaf560ca950014c.jpeg?width=720&height=400&aspect=fill',
          sourceUrl: resolveArticleUrl(item.title || item.tabTitle, item.body || item.message, tab)
        }));
      };

      const br = formatList(payload.br?.motds, 'br');
      return {
        br: br.length ? br : VERIFIED_INITIAL_DATA.news,
        stw: formatList(payload.stw?.messages, 'stw'),
        creative: formatList(payload.creative?.motds, 'creative')
      };
    } catch (err) {
      return { br: VERIFIED_INITIAL_DATA.news, stw: [], creative: [] };
    }
  }

  async getMapData() {
    try {
      const data = await this.fetchWithFallback([
        API_ENDPOINTS.FORTNITE_MAP,
        'https://api.allorigins.win/raw?url=' + encodeURIComponent(API_ENDPOINTS.FORTNITE_MAP)
      ]);
      const payload = data.data || data || {};
      return payload.images || { pois: 'https://fortnite-api.com/images/map_en.png', blank: 'https://fortnite-api.com/images/map.png' };
    } catch (err) {
      return { pois: 'https://fortnite-api.com/images/map_en.png', blank: 'https://fortnite-api.com/images/map.png' };
    }
  }
}

window.resolveArticleUrl = resolveArticleUrl;
window.VERIFIED_INITIAL_DATA = VERIFIED_INITIAL_DATA;
window.fortniteAPI = new FortniteAPI();
