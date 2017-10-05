module.exports = function dokRobotParser(data)
    {
    var htmlParser = require('node-html-parser');


    var res = htmlParser.parse(data);
    var main_el = res.querySelector('.main');
    var text = main_el.structuredText.split('\n');

    var name = text[0];
    var price = text[3];
    return {'name':name,'price':price};
    }