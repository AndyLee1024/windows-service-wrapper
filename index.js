const Service = require('./src/service');

if (require('os').platform().indexOf('win32') < 0){
    throw 'node-windows is only supported on Windows.';
}
module.exports = Service;
module.exports.Service = Service;

