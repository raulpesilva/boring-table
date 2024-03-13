export const LOG_LEVEL = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  FATAL: 'FATAL',
} as const;

export type LogLevel = keyof typeof LOG_LEVEL;

const LOG_COLORS: Record<LogLevel, string> = {
  [LOG_LEVEL.DEBUG]: '#cc99ff',
  [LOG_LEVEL.INFO]: '#0099ff',
  [LOG_LEVEL.WARN]: '#ffcc00',
  [LOG_LEVEL.ERROR]: '#ff3355',
  [LOG_LEVEL.FATAL]: '#ff3355',
} as const;

export class Logger {
  private static count = 0;
  private static _instance: Logger;
  private static showLogs = false;
  private defaultLogLevel = LOG_LEVEL.INFO;

  public static showLogsOn() {
    Logger.showLogs = true;
  }

  constructor() {
    if (Logger._instance) return Logger._instance;
    Logger._instance = this;
    Logger.count++;
    return Logger._instance;
  }

  static get instance() {
    if (Logger._instance) return Logger._instance;
    Logger._instance = new Logger();
    Logger.count++;
    return Logger._instance;
  }

  private log(level: LogLevel, messages: any[]) {
    if (!Logger.showLogs) return;
    level = LOG_LEVEL[level] ?? this.defaultLogLevel;
    const color = `color: ${LOG_COLORS[level]}`;
    if (level === 'DEBUG') console.debug(`%c[${level}]`, `${color}`, ...messages);
    if (level === 'INFO') console.info(`%c[${level}]`, `${color}`, ...messages);
    if (level === 'WARN') console.warn(`%c[${level}]`, `${color}`, ...messages);
    if (level === 'ERROR') console.error(`%c[${level}]`, `${color}`, ...messages);
    if (level === 'FATAL') console.error(`%c[${level}] ${messages.map(() => '%s').join(' ')}`, `${color}`, ...messages);
  }

  public debug = (...messages: any[]) => this.log(LOG_LEVEL.DEBUG, messages);
  public info = (...messages: any[]) => this.log(LOG_LEVEL.INFO, messages);
  public warn = (...messages: any[]) => this.log(LOG_LEVEL.WARN, messages);
  public error = (...messages: any[]) => this.log(LOG_LEVEL.ERROR, messages);
  public fatal = (...messages: any[]) => this.log(LOG_LEVEL.FATAL, messages);
  public time = (name: string) => Logger.showLogs && console.time(`\x1B[34m[${LOG_LEVEL.DEBUG}] [${name}]`);
  public timeEnd = (name: string) => Logger.showLogs && console.timeEnd(`\x1B[34m[${LOG_LEVEL.DEBUG}] [${name}]`);

  private logWithName(level: LogLevel, name: any, messages: any[]) {
    if (!Logger.showLogs) return;
    level = LOG_LEVEL[level] ?? this.defaultLogLevel;
    const color = `color: ${LOG_COLORS[level]}`;
    if (level === 'DEBUG') console.debug(`%c[${level}] %c[${name}]`, `${color}`, `${color}`, ...messages);
    if (level === 'INFO') console.info(`%c[${level}] %c[${name}]`, `${color}`, `${color}`, ...messages);
    if (level === 'WARN') console.warn(`%c[${level}] %c[${name}]`, `${color}`, `${color}`, ...messages);
    if (level === 'ERROR') console.error(`%c[${level}] %c[${name}]`, `${color}`, `${color}`, ...messages);
    if (level === 'FATAL')
      console.error(`%c[${level}] ${[name, ...messages].map(() => '%s').join(' ')}`, `${color}`, ...messages);
  }

  public debugWithName = (name: any, ...messages: any[]) => this.logWithName(LOG_LEVEL.DEBUG, name, messages);
  public infoWithName = (name: any, ...messages: any[]) => this.logWithName(LOG_LEVEL.INFO, name, messages);
  public warnWithName = (name: any, ...messages: any[]) => this.logWithName(LOG_LEVEL.WARN, name, messages);
  public errorWithName = (name: any, ...messages: any[]) => this.logWithName(LOG_LEVEL.ERROR, name, messages);
  public fatalWithName = (name: any, ...messages: any[]) => this.logWithName(LOG_LEVEL.FATAL, name, messages);
}
