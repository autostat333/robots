module.exports = function exampleRobotParser(data)
    {
    var htmlParser = require('node-html-parser');


    var res = htmlParser.parse(data);
    var main_el = res.querySelector('.header__content_text');
    var text = main_el.text;

    return text;
    }
