module.exports.$inject = [];
module.exports = function socketIo()
    {

    var socket = '';

    this.start = function()
        {
        socket = io.connect('http://localhost:3001');
        }


    this.getSocket = function()
        {
        return socket
        }

    }