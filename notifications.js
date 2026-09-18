/**
 * Notification Manager for Fortnite Status Updates & Server Release Events
 */

class NotificationManager {
  constructor() {
    this.storageKey = 'fn_tracker_notifications_enabled';
    this.previousStatus = null;
    this.previousVersion = null;
  }

  isSupported() {
    return 'Notification' in window;
  }

  isEnabled() {
    if (!this.isSupported()) return false;
    return localStorage.getItem(this.storageKey) === 'true' && Notification.permission === 'granted';
  }

  async requestPermission() {
    if (!this.isSupported()) {
      alert('이 브라우저는 데스크톱 웹 알림을 지원하지 않습니다.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        localStorage.setItem(this.storageKey, 'true');
        this.sendNotification('포트나이트 실시간 알림 활성화', {
          body: '서버 점검 해제(서버 오픈) 및 신규 패치가 감지되면 즉시 알려드립니다.',
          icon: 'https://cdn2.unrealengine.com/fn-f-logo-300x300-300x300-843825997.png'
        });
        return true;
      } else {
        localStorage.setItem(this.storageKey, 'false');
        return false;
      }
    } catch (err) {
      console.error('[Notification] Permission error:', err);
      return false;
    }
  }

  disable() {
    localStorage.setItem(this.storageKey, 'false');
  }

  sendNotification(title, options = {}) {
    if (!this.isEnabled()) return;

    try {
      const defaultOptions = {
        icon: 'https://cdn2.unrealengine.com/fn-f-logo-300x300-300x300-843825997.png',
        badge: 'https://cdn2.unrealengine.com/fn-f-logo-300x300-300x300-843825997.png',
        silent: false,
        ...options
      };

      const notification = new Notification(title, defaultOptions);
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (err) {
      console.warn('[Notification] Failed to send notification:', err);
    }
  }

  /**
   * Monitor state changes and trigger notifications when server goes live or patch released
   */
  checkStateChange(currentStatus, currentVersion) {
    if (this.previousStatus !== null) {
      // Server came back online after maintenance
      if (this.previousStatus === 'maintenance' && currentStatus === 'operational') {
        this.sendNotification('포트나이트 서버 점검 완료 (서버 오픈)', {
          body: '서버 점검이 해제되었습니다. 지금 바로 게임에 접속할 수 있습니다!',
          requireInteraction: true
        });
      }

      // Server entered maintenance
      if (this.previousStatus === 'operational' && currentStatus === 'maintenance') {
        this.sendNotification('포트나이트 서버 점검 시작', {
          body: '서버 점검 및 패치 업데이트가 시작되었습니다. 점검 해제 예상 시간을 확인하세요.'
        });
      }
    }

    if (this.previousVersion !== null && currentVersion && this.previousVersion !== currentVersion) {
      this.sendNotification(`신규 패치 배포 감지 (${currentVersion})`, {
        body: `새로운 포트나이트 업데이트(${currentVersion})가 배포되었습니다. 패치노트를 확인하세요.`
      });
    }

    this.previousStatus = currentStatus;
    if (currentVersion) {
      this.previousVersion = currentVersion;
    }
  }
}

window.notificationManager = new NotificationManager();
