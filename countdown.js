/**
 * Real-time Countdown Engine for Fortnite Server Maintenance and Down Release Times
 */

class CountdownEngine {
  constructor() {
    this.targetDate = null;
    this.timerId = null;
    this.onTickCallbacks = [];
    this.onCompleteCallbacks = [];
    this.mode = 'idle'; // 'maintenance_end' | 'maintenance_start' | 'idle'
  }

  /**
   * Set target countdown timestamp
   * @param {string|Date|null} target - ISO date string or Date object
   * @param {string} mode - 'maintenance_end' | 'maintenance_start' | 'idle'
   */
  setTarget(target, mode = 'maintenance_end') {
    this.mode = mode;
    if (!target) {
      this.targetDate = null;
      this.stop();
      this.notifyTick({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, isFinished: true, mode });
      return;
    }

    this.targetDate = new Date(target);
    this.start();
  }

  start() {
    this.stop();
    this.tick();
    this.timerId = setInterval(() => this.tick(), 1000);
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  tick() {
    if (!this.targetDate) {
      return;
    }

    const now = new Date().getTime();
    const target = this.targetDate.getTime();
    const diff = target - now;

    if (diff <= 0) {
      const result = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalMs: 0,
        isFinished: true,
        mode: this.mode
      };
      this.notifyTick(result);
      this.notifyComplete();
      this.stop();
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const result = {
      days,
      hours,
      minutes,
      seconds,
      totalMs: diff,
      isFinished: false,
      mode: this.mode,
      formattedTime: `${String(hours + days * 24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    };

    this.notifyTick(result);
  }

  onTick(callback) {
    if (typeof callback === 'function') {
      this.onTickCallbacks.push(callback);
    }
  }

  onComplete(callback) {
    if (typeof callback === 'function') {
      this.onCompleteCallbacks.push(callback);
    }
  }

  notifyTick(data) {
    this.onTickCallbacks.forEach(cb => {
      try { cb(data); } catch (e) { console.error(e); }
    });
  }

  notifyComplete() {
    this.onCompleteCallbacks.forEach(cb => {
      try { cb(); } catch (e) { console.error(e); }
    });
  }

  /**
   * Helper to format UTC / ISO to Korean Localized String (e.g., "2026년 9월 19일 오후 6:00 (KST)")
   */
  static formatKoreanDateTime(dateInput) {
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

  /**
   * Relative time formatter in Korean (e.g., "3분 전", "방금 전")
   */
  static getRelativeTimeString(dateInput) {
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
    const diffDays = Math.floor(diffHour / 24);
    return `${diffDays}일 전`;
  }
}

window.CountdownEngine = CountdownEngine;
window.countdownEngine = new CountdownEngine();
