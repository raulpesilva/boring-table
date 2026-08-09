import { afterEach, describe, expect, test, vi } from 'vitest';
import { BoringEvents } from '../src/core/BoringEvents';
import { Observer } from '../src/core/observer';

afterEach(() => {
  vi.useRealTimers();
});

describe('Observer', () => {
  test('notifies active subscribers and supports unsubscribe', () => {
    const observer = new Observer();
    const first = vi.fn();
    const second = vi.fn();
    const unsubscribe = observer.subscribe(first);

    observer.subscribe(second);
    observer.notify();
    unsubscribe();
    observer.notify();

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(2);
  });
});

describe('BoringEvents', () => {
  test('coalesces scheduled work and clears processed events', async () => {
    vi.useFakeTimers();
    const process = vi.fn();
    const events = new BoringEvents({ process });

    events.dispatch('update:body-row', { rowIndex: 0 });
    events.dispatch('update:body-row', { rowIndex: 1 });

    expect(events.hasScheduledUpdate).toBe(true);
    expect(events.get('update:body-row')).toEqual([{ rowIndex: 0 }, { rowIndex: 1 }]);

    await vi.runAllTimersAsync();

    expect(process).toHaveBeenCalledTimes(1);
    expect(events.hasScheduledUpdate).toBe(false);
    expect(events.events.size).toBe(0);
  });

  test('broader events replace narrower pending events', () => {
    vi.useFakeTimers();
    const events = new BoringEvents({ process: vi.fn() });

    events.upsetEvent('update:data-item', { dataIndex: 0 });
    events.upsetEvent('update:data');

    expect(events.has('update:data')).toBe(true);
    expect(events.has('update:data-item')).toBe(false);
  });
});
