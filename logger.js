const SimpleNodeLogger = require('simple-node-logger');

const filename = new Date().toISOString().split('T')[0] + '-log';

const opts = {
    logFilePath: filename,
    timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS'
};

const log = SimpleNodeLogger.createSimpleLogger(opts);

module.exports = log;