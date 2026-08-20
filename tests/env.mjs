const store = new Map();

globalThis.localStorage = {
  getItem(key) {
    return store.has(key) ? store.get(key) : null;
  },
  setItem(key, value) {
    store.set(String(key), String(value));
  },
  removeItem(key) {
    store.delete(String(key));
  },
  clear() {
    store.clear();
  },
};

function attrMap() {
  const attrs = new Map();
  return {
    setAttribute(name, value) { attrs.set(name, String(value)); },
    getAttribute(name) { return attrs.has(name) ? attrs.get(name) : null; },
    removeAttribute(name) { attrs.delete(name); },
  };
}

const htmlEl = attrMap();
const bodyEl = {
  ...attrMap(),
  appendChild() {},
  classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
};

globalThis.document = {
  documentElement: htmlEl,
  body: bodyEl,
  querySelector() { return null; },
  querySelectorAll() { return []; },
  getElementById() { return null; },
};

globalThis.getComputedStyle = () => ({ getPropertyValue() { return ''; } });
globalThis.window = globalThis;
globalThis.location = { protocol: 'http:', origin: 'http://localhost' };
globalThis.sessionStorage = globalThis.localStorage;
Object.defineProperty(globalThis, 'navigator', {
  configurable: true,
  value: {
    share: async () => {},
    clipboard: { writeText: async () => {} },
  },
});

export function resetStorage() {
  store.clear();
}
