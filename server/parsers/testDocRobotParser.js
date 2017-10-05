var dokParser = require('./dokRobotParser.js');

var fs = require('fs');

setTimeout(function()
    {
    fs.readFile('dok.html','utf-8',function(err,res)
        {
        console.log(dokParser(res));
        })
    },10000)
