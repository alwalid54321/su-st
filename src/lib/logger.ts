enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogOptions {
  level?: LogLevel;
  context?: string;
}

const log = (message: string, data?: any, options?: LogOptions) => {
  const { level = LogLevel.INFO, context } = options || {};
  const timestamp = new Date().toISOString();

  const logEntry = {
    timestamp,
    level,
    context: context || 'Application',
    message,
    data: data || null,
  };

  switch (level) {
    case LogLevel.INFO:
      console.log(`[${timestamp}] [${logEntry.context}] ${message}`, data);
      break;
    case LogLevel.WARN:
      console.warn(`[${timestamp}] [${logEntry.context}] ${message}`, data);
      break;
    case LogLevel.ERROR:
      console.error(`[${timestamp}] [${logEntry.context}] ${message}`, data);
      break;
    default:
      console.log(`[${timestamp}] [${logEntry.context}] ${message}`, data);
  }

  // In a real application, you would send this logEntry to a remote logging service
  // For example: sendToLoggingService(logEntry);
};

export const logger = {
  info: (message: string, data?: any, context?: string) => log(message, data, { level: LogLevel.INFO, context }),
  warn: (message: string, data?: any, context?: string) => log(message, data, { level: LogLevel.WARN, context }),
  error: (message: string, data?: any, context?: string) => log(message, data, { level: LogLevel.ERROR, context }),
};
