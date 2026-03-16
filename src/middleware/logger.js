const { createLogger, format, transports } = require('winston');
const path = require('path');

// Vercel e ambientes serverless têm sistema de arquivos read-only
const isServerless = !!process.env.VERCEL || process.env.NODE_ENV === 'production';

const loggerTransports = [
  new transports.Console({
    format: format.combine(
      format.colorize(),
      format.printf(({ timestamp, level, message, ...rest }) => {
        const extra = Object.keys(rest).length ? JSON.stringify(rest) : '';
        return `${timestamp} [${level}]: ${message} ${extra}`;
      })
    )
  })
];

// Adiciona logs em arquivo apenas em desenvolvimento local
if (!isServerless) {
  loggerTransports.push(
    new transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error'
    }),
    new transports.File({
      filename: path.join(__dirname, '../../logs/combined.log')
    })
  );
}

const logger = createLogger({
  level: isServerless ? 'warn' : 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: loggerTransports
});

module.exports = logger;
