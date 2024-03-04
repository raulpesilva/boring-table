export interface BoringEvent {
  'event:mount': void;
  'event:unmount': void;

  'create:all': void;

  'create:head-rows': void;
  'create:head-row': void;
  'create:head-cell': void;

  'create:body-rows': void;
  'create:body-row': void;
  'create:body-cell': void;

  'create:footer-rows': void;
  'create:footer-row': void;
  'create:footer-cell': void;

  'update:plugins': void;
  'update:config': void;
  'update:extensions': void;
  'update:all': void;
  'update:rows': void;
  'update:events': void;

  'update:data': void;
  'update:data-item': { position: number };

  'update:columns': void;
  'update:column': { position: number };

  'update:head-rows': void;
  'update:head-row': { position: number };
  'update:head-cell': { column: number; row: number };

  'update:body-rows': void;
  'update:body-row': { position: number };
  'update:body-cell': { column: number; row: number };

  'update:footer-rows': void;
  'update:footer-row': { position: number };
  'update:footer-cell': { column: number; row: number };
}
type MapEvents<T extends Record<string, any>> = Map<keyof T, T[keyof T][] | undefined>;

const CancelEvents: Record<keyof BoringEvent, Partial<keyof BoringEvent>[]> = {
  'event:mount': [],
  'event:unmount': [],

  'create:all': [
    'create:head-rows',
    'create:head-row',
    'create:head-cell',
    'create:body-rows',
    'create:body-row',
    'create:body-cell',
    'create:footer-rows',
    'create:footer-row',
    'create:footer-cell',
    'update:columns',
    'update:column',
    'update:head-rows',
    'update:head-row',
    'update:head-cell',
    'update:body-rows',
    'update:body-row',
    'update:body-cell',
    'update:footer-rows',
    'update:footer-row',
    'update:footer-cell',
  ],

  'create:head-rows': ['create:head-row', 'create:head-cell'],
  'create:head-row': [],
  'create:head-cell': [],

  'create:body-rows': ['create:body-row', 'create:body-cell'],
  'create:body-row': [],
  'create:body-cell': [],

  'create:footer-rows': ['create:footer-row', 'create:footer-cell'],
  'create:footer-row': [],
  'create:footer-cell': [],

  'update:all': [
    'update:plugins',
    'update:config',
    'update:extensions',
    'update:events',
    'update:data',
    'update:data-item',
    'update:columns',
    'update:column',
    'update:head-rows',
    'update:head-row',
    'update:head-cell',
    'update:body-rows',
    'update:body-row',
    'update:body-cell',
    'update:footer-rows',
    'update:footer-row',
    'update:footer-cell',
  ],

  'update:plugins': [],
  'update:config': [],
  'update:extensions': [],
  'update:events': [],

  'update:rows': [
    'update:head-rows',
    'update:head-row',
    'update:head-cell',
    'update:body-rows',
    'update:body-row',
    'update:body-cell',
    'update:footer-rows',
    'update:footer-row',
    'update:footer-cell',
  ],

  'update:data': ['update:data-item'],
  'update:data-item': [],
  'update:columns': ['update:column'],
  'update:column': [],
  'update:head-rows': ['update:head-row', 'update:head-cell'],
  'update:head-row': [],
  'update:head-cell': [],
  'update:body-rows': ['update:body-row', 'update:body-cell'],
  'update:body-row': [],
  'update:body-cell': [],
  'update:footer-rows': ['update:footer-row', 'update:footer-cell'],
  'update:footer-row': [],
  'update:footer-cell': [],
};

interface BoringEventsOptions {
  process: () => void;
}

export class BoringEvents {
  events: MapEvents<BoringEvent> = new Map();
  hasScheduledUpdate = false;
  process: () => void;

  constructor(options: BoringEventsOptions) {
    this.process = options.process;
  }

  upsetEvent<T extends keyof BoringEvent>(event: T, payload?: BoringEvent[T]) {
    const cancel = CancelEvents[event];
    if (cancel) for (const e of cancel) this.events.delete(e);
    if (this.events.has(event)) {
      this.events.get(event)?.push(payload);
      return;
    }
    this.events.set(event, [payload]);
  }

  dispatch<T extends keyof BoringEvent>(event: T, payload?: BoringEvent[T]) {
    console.log('>--------------------------------->>');
    this.upsetEvent(event, payload);
    if (this.hasScheduledUpdate) return;
    this.hasScheduledUpdate = true;
    queueMicrotask(() => {
      this.process();
      this.hasScheduledUpdate = false;
      this.events.clear();
      console.log('<<---------------------------------<');
    });
  }

  has(event: keyof BoringEvent) {
    return this.events.has(event);
  }

  clear() {
    this.events.clear();
  }
}
