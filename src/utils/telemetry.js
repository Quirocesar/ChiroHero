import AsyncStorage from '@react-native-async-storage/async-storage';

const TELEMETRY_KEY = '@chirohero_telemetry_v1';
const MAX_EVENTS = 500;

class Telemetry {
  constructor() {
    this.enabled = true;
  }

  setEnabled(enabled) {
    this.enabled = !!enabled;
  }

  async logEvent(type, payload = {}) {
    if (!this.enabled || !type) return;

    const event = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    try {
      const raw = await AsyncStorage.getItem(TELEMETRY_KEY);
      const list = raw ? JSON.parse(raw) : [];
      list.push(event);
      const trimmed = list.slice(-MAX_EVENTS);
      await AsyncStorage.setItem(TELEMETRY_KEY, JSON.stringify(trimmed));
    } catch {
      // Telemetry is non-blocking by design.
    }
  }

  async getEvents(limit = 200) {
    try {
      const raw = await AsyncStorage.getItem(TELEMETRY_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return list.slice(-Math.max(1, limit));
    } catch {
      return [];
    }
  }

  async clear() {
    try {
      await AsyncStorage.removeItem(TELEMETRY_KEY);
    } catch {
      // no-op
    }
  }
}

const telemetry = new Telemetry();
export default telemetry;
