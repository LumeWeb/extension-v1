import EventEmitter from "events";

interface Options {
  retryCount?: number;
  reconnectInterval?: number;
}

/*
 Ported from https://github.com/ofirattia/ws-reconnect
 */
export default class WSReconnect extends EventEmitter {
  private url: string;
  private options: Options;
  private retryCount: number;
  private _retryCount: number;
  private reconnectInterval: number;
  private shouldAttemptReconnect: boolean;
  private isConnected = false;
  private socket: WebSocket | undefined;
  private reconnectTimeoutId: NodeJS.Timeout | undefined;

  constructor(url: string, options: Options = {}) {
    super();
    this.url = url;
    this.options = options;
    this.retryCount = this.options.retryCount || -1;
    this._retryCount = this.retryCount;
    this.reconnectInterval = this.options?.reconnectInterval ?? 5;
    this.shouldAttemptReconnect = !!this.reconnectInterval;
  }

  start() {
    this.shouldAttemptReconnect = !!this.reconnectInterval;
    this.isConnected = false;
    this.socket = new WebSocket(this.url);
    this.socket.onmessage = this.onMessage.bind(this);
    this.socket.onopen = this.onOpen.bind(this);
    this.socket.onclose = this.onClose.bind(this);
  }

  destroy() {
    clearTimeout(this.reconnectTimeoutId as NodeJS.Timeout);
    this.shouldAttemptReconnect = false;
    this.socket?.close();
  }

  onOpen() {
    this.isConnected = true;
    this.emit("connect");
    // set again the retry count
    this.retryCount = this._retryCount;
  }

  onClose() {
    if (
      this.shouldAttemptReconnect &&
      (this.retryCount > 0 || this.retryCount == -1)
    ) {
      if (this.retryCount !== -1) this.retryCount--;
      clearTimeout(this.reconnectTimeoutId as NodeJS.Timeout);
      this.reconnectTimeoutId = setTimeout(() => {
        this.emit("reconnect");
        this.start();
      }, this.reconnectInterval * 1000);
    } else {
      this.emit("destroyed");
    }
  }

  onMessage(message: MessageEvent) {
    this.emit("message", message.data);
  }

  send(message: string | ArrayBufferLike | Blob | ArrayBufferView) {
    this.socket?.send(message);
  }
}
