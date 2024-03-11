export interface BoringEvent {
  'event:mount': void;
  'event:unmount': void;

  'create:all': void;

  'create:head-rows': void;
  'create:head-row': { rowIndex: number };
  'create:head-cell': { rowIndex: number; columnIndex: number };

  'create:body-rows': void;
  'create:body-row': { rowIndex: number };
  'create:body-cell': { rowIndex: number; columnIndex: number };

  'create:footer-rows': void;
  'create:footer-row': { rowIndex: number };
  'create:footer-cell': { rowIndex: number; columnIndex: number };

  'update:plugins': void;
  'update:config': void;
  'update:extensions': void;
  'update:all': void;
  'update:rows': void;
  'update:events': void;

  'update:custom-body': void;

  'update:data': void;
  'update:data-item': { dataIndex: number };

  'update:columns': void;
  'update:column': { columnIndex: number };

  'update:head-rows': void;
  'update:head-row': { rowIndex: number };
  'update:head-cell': { rowIndex: number; columnIndex: number };

  'update:body-rows': void;
  'update:body-row': { rowIndex: number };
  'update:body-cell': { rowIndex: number; columnIndex: number };

  'update:footer-rows': void;
  'update:footer-row': { rowIndex: number };
  'update:footer-cell': { rowIndex: number; columnIndex: number };
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

  'update:custom-body': [],
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
  initialEvents?: [keyof BoringEvent, BoringEvent[keyof BoringEvent]][];
}

export class BoringEvents {
  events: MapEvents<BoringEvent> = new Map();
  hasScheduledUpdate = false;
  process: () => void;
  timeoutId: number | undefined;

  constructor(options: BoringEventsOptions) {
    this.process = options.process;
    if (options.initialEvents) for (const [event, payload] of options.initialEvents) this.upsetEvent(event, payload);
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
    // TODO: melhorar os eventos para quando um evento for disparado, nao adicionar um evento que ja é atendido por outro evento
    // nao apenas cancelar os eventos anteriores

    console.log('\x1B[34m>--------------------------------->>', '\x1b[0m');
    this.upsetEvent(event, payload);
    if (this.hasScheduledUpdate) return;
    this.hasScheduledUpdate = true;
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.process();
      this.hasScheduledUpdate = false;
      this.events.clear();
      console.log('\x1B[31m<<---------------------------------<', '\x1b[0m');
    }, 0);
  }

  cancelNextProcess() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }

  has(event: keyof BoringEvent) {
    return this.events.has(event);
  }

  get<T extends keyof BoringEvent>(event: T) {
    return this.events.get(event) as BoringEvent[T][];
  }

  clear() {
    this.events.clear();
  }
}
