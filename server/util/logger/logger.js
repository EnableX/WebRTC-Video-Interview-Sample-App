const log4js = require('log4js');
const config = require('../../config').logger;
log4js.configure(config);
const logger = log4js.getLogger('app');

var module = module || {};
module.exports = logger;