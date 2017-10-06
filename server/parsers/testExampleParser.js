var fs = require('fs');
var parser = require('./exampleRobotParser.js');

fs.readFile('../../ExampleRobot/a','utf-8',function(err,res)
	{
	console.log(parser(res));
	})

