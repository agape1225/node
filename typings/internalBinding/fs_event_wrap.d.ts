import { owner_symbol } from './symbols';

declare class FSEvent {
  constructor();
  [owner_symbol]?: object;
  onchange: (status: number, eventType: string, filename: string | Buffer | null) => void;
  readonly initialized: boolean;
  start(filename: string, persistent: boolean, recursive: boolean, encoding: string): number;
  close(callback?: () => void): void;
  ref(): void;
  unref(): void;
  getAsyncId(): number;
}

export interface FsEventWrapBinding {
  FSEvent: typeof FSEvent;
}
