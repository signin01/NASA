class EventBus {
  constructor() {
    this.events = new Map();
  }

  on(eventName, callback) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }

    this.events.get(eventName).add(callback);
    return () => this.off(eventName, callback);
  }

  off(eventName, callback) {
    const subscribers = this.events.get(eventName);
    if (!subscribers) return;
    subscribers.delete(callback);
  }

  emit(eventName, payload = {}) {
    const subscribers = this.events.get(eventName);
    if (!subscribers) return;

    subscribers.forEach((callback) => {
      try {
        callback(payload);
      } catch (error) {
        console.error(`Event handler failed for ${eventName}:`, error);
      }
    });
  }

  once(eventName, callback) {
    const unsubscribe = this.on(eventName, (payload) => {
      unsubscribe();
      callback(payload);
    });

    return unsubscribe;
  }

  clear(eventName = null) {
    if (eventName) {
      this.events.delete(eventName);
      return;
    }

    this.events.clear();
  }
}

export const eventBus = new EventBus();
