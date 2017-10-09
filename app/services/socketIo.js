module.exports = function socketIo()
    {

    var config = require('../../config.js');

    var socket = '';

    this.start = function()
        {
        socket = io.connect('http://'+config['SOCKET_URL']);
        }


    this.getSocket = function()
        {
        return socket
        }

    }
module.exports.$inject = [];

