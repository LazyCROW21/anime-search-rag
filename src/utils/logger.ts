enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
}

const LogLevelMap: Record<string, LogLevel> = {
    'debug': LogLevel.DEBUG,
    'info': LogLevel.INFO,
    'warn': LogLevel.WARN,
    'error': LogLevel.ERROR,
};

class Logger {
    private logLevel: LogLevel = LogLevel.INFO;

    constructor() {
        const envLevel = process.env.LOG_LEVEL?.toLowerCase() || 'info';
        this.logLevel = LogLevelMap[envLevel] ?? LogLevel.INFO;
    }

    private formatMessage(level: string, message: string, ...args: any[]): string {
        const timestamp = new Date().toISOString();
        const color = this.getColor(level);
        const reset = '\x1b[0m';
        return `${color}[${timestamp}] [${level.toUpperCase()}]${reset} ${message}`;
    }

    private getColor(level: string): string {
        switch (level.toLowerCase()) {
            case 'debug': return '\x1b[36m'; // Cyan
            case 'info': return '\x1b[32m';  // Green
            case 'warn': return '\x1b[33m';  // Yellow
            case 'error': return '\x1b[31m'; // Red
            default: return '\x1b[0m';
        }
    }

    public debug(message: string, ...args: any[]) {
        if (this.logLevel <= LogLevel.DEBUG) {
            console.debug(this.formatMessage('debug', message), ...args);
        }
    }

    public info(message: string, ...args: any[]) {
        if (this.logLevel <= LogLevel.INFO) {
            console.info(this.formatMessage('info', message), ...args);
        }
    }

    public warn(message: string, ...args: any[]) {
        if (this.logLevel <= LogLevel.WARN) {
            console.warn(this.formatMessage('warn', message), ...args);
        }
    }

    public error(message: string, ...args: any[]) {
        if (this.logLevel <= LogLevel.ERROR) {
            console.error(this.formatMessage('error', message), ...args);
        }
    }
}

export const logger = new Logger();
