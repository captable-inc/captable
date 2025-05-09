import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

// Usage examples:
// logger.info('This is an informational message');
// logger.debug('This is a debug message with data:', { userId: 123, action: 'login' });
// logger.warn('Warning: resource nearly depleted');
// logger.error('Error occurred', new Error('Something went wrong'));

export default logger;
