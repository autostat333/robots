//run robot
//    sc = new Scrapper() //here you can pass options
//    sc = new Scrapper(
//            {
//            'responseDir':'/home/someDir/', by default uses next path /robotName/Responses
//            'robotName':'mobileDe', name of robot and name of folder for savings responses,
//            })
//
//    //next - you need create queue, it must have format
//    sc.createQueue(some params) //this method can be rewrited acc to which urls you need
//    //this method generates queue array and save it to sc.queue


//    sc.next(callback); //simply shift queue by one element and execute request
//              //obtain either callback, or (ip, callback)
//            sc.sendRequest(callback)  //obtain either callback or (url,callback)
//            sc.writeToFile(callback)  //obtain either callback or data, filename,callback
//            sc.parse(callback)  //obtain either callback or data, callback
//    //next creates temporary sc.nextElement object to save data and operate through the callbacks


//    SOME INTERNAL PROPERIES
//    sc.startPosition = 0; position of current iteration within one round
//    sc.queue - array of objects or string for iteration throught the next() method
//        [{
//        'name':'' //filename for saving response,
//        'url':'' //url, used to send request
//        },{}]


//    sc.status


//    sc.restart(); //set startPosition to 0


//    sc.setQueue(queue) - simply sets queue to passed param
//    sc.getQueue() - simply returns current queue. Queue can be also obtained as direct accessing to

//METHOD restart() - simply set startPosition to 0;
//METHOD next(ip,callback) -
    //ip proxy ip to send request through the proxy
    //if no callback passed - noop wil be applied.
    //next creates this.nextElement with url,name and responceBody properties.
    //nextElement uses for sharing data between parse, saveFile and sendRequest methods
    //ip also can be setted from internal property this.proxyIp
    //ip from params dominated over $$.proxyIp to allow use it independently from interpretator
//METHOD writeToFile(data,fileName,callback) - writing information to file
    //if data not setted - code try getting data from nextElement.responceBody.


//object for queue must have url & name properies. Url - for sending request and name for create file
//
//this.startPosition - current position. Using during iteration with next()
//this.status - can be 'finished' if startPosition reached end of queue, or can be 'progress'
//this.robotName - using for printing some messages with robotName. If not setted - use 'General Robot';


module.exports = function ScaperCntr(opt)
    {


    var request = !request?require('request'):request;
    var fs = !fs?require('fs'):fs;

    var async = require('async');


    if (!noop)
        var noop = function(err,res){console.log(err,res)};

    var $$ = Scraper.prototype;

    $$.setQueue = setQueue;
    $$.getQueue = getQueue;
    $$.createQueue = createQueue;
    $$.restart = restart;
    $$.next = next;
    $$.sendRequest = sendRequest;
    $$.writeToFile = writeToFile;
    $$.readFromFile = readFromFile;
    $$.parse = parse;


    function Scraper(opt)
        {
        this.queue = opt&&opt.queue?opt.queue:[];
        this.startPosition = 0;

        this.robotName = opt&&opt.robotName?opt.robotName:'GeneralRobot';

        this.headers = {};
        this.headers['User-Agent'] = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

        this.headers = opt&&opt.headers?util._extend(this.headers,opt.headers):this.headers;

        //path for logs of robot and HTML files
        this.responceDir = opt&&opt.responceDir?opt.responceDir:'./'+this.robotName+'/Responses/';

        }

    function setQueue(queue)
        {
        if (!queue)
            throw new Error('Parameter queue can not be empty!');
        this.queue = queue;

        this.restart();
        }



    function getQueue()
        {
        return this.queue;
        }


    //this is customizing function
    //for some other srapers you can rewrite particular this method
    function createQueue(ids)
        {

        debugger;
        if (!ids)
            throw new Error('CreateQueue must receive ids for creating Queue!');

        var i=0;
        var queue = [];
        for (;el=ids[i++];)
            {
            var d = {};
            d['id'] = el;
            d['url'] = 'http://example.com?'+el;
            d['name'] = el;
            queue.push(d);
            }
        this.queue = queue;

        }


    function restart()
        {
        this.startPosition = 0;
        this.status = 'progress';
        }


    //ip optional, if ip - proxy will be used
    function next(ip,callback)
        {
debugger;
        if (ip)
            {
            if (typeof ip=='function')
                {
                callback = ip;
                ip = null;
                }
            }



        ip = ip||this.proxyIp;

        callback = callback||noop;

        //check whether queue finished
        if (!this.queue[this.startPosition])
            {
            this.status = 'finished';
            callback(null,'Finished');
            return false;
            }

        try
            {
            var next_el = this.queue[this.startPosition];
            if (typeof next_el=='object')
                {
                var f_name = next_el.name||_name_from_url(next_el['url']);
                var url = next_el['url'];
                }
            else if (typeof next_el=='string')
                {
                var f_name = _name_from_url(next_el);
                var url = next_el;
                }
            else
                {
                throw new Error('Check queue, error with type of values');
                }


            this.nextElement = {};

            this.nextElement.url = next_el['url'];
            this.nextElement.name = f_name;
            this.nextElement.ip = ip;


            async.series([
                this.sendRequest.bind(this),
                this.writeToFile.bind(this),
                this.parse.bind(this)
            ],function(err,res)
                {
                if (err)
                    {
                    console.log(err);
                    callback(err);
                    return false;
                    }
                console.log('Success '+this.nextElement.url);
                setTimeout(callback,0);
                this.nextElement = null;
                }.bind(this));


            this.startPosition = this.startPosition+1;
            }
        catch(err)
            {
            callback(err);
            return false;
            }

        }




    function sendRequest(url,callback)
        {
debugger;
        if (typeof url=='array')
            {
            var ip = url[1];
            url = url[0];
            }

        if (typeof url=='function')
            {
            callback = url;
            url = null;
            }

        //if callback not setted
        if (!callback)
            callback = noop;

        //url not passed to params, check internal nextElem
        if (!url&&this.nextElement)
            {
            url = this.nextElement.url;
            }
        else
            {
            callback((new Error('Can not determine url for sending request')));
            return false;
            }

        if (!ip&&this.nextElement)
            ip = this.nextElement.ip;


        //form params for request
        var params = {};
        params['headers'] = this.headers;
        params['url'] = url;
        if (ip)params['proxy'] = ip;


        request(params,function(err,res)
            {
            if (err)
                {
                err.message = err.message+'. '+this.robotName+'Error send request to '+url;
                callback(err);
                this.nextElement.responseBody = err;
                return false;
                }
            if (this.nextElement)
                this.nextElement.responseBody = res.body;
            callback(null,res.body);
            }.bind(this));
        }



    function writeToFile(data,name,callback)
        {

        try
            {

            if ((!data || typeof data == 'function') && !this.nextElement.responseBody)
                throw new Error('No data to save');

            if ((!name || typeof name == 'function') && !this.nextElement.name)
                throw new Error('Name of file not setted!');


            //check for callback
            if (!callback && typeof data == 'function')
                {
                callback = data;
                data = null;
                }

            if (!callback && typeof name == 'function')
                {
                callback = name;
                name = null;
                }

            callback = callback || noop;

            name = (!name || typeof name == 'function') ? this.nextElement.name : name;
            data = (!data || typeof data == 'function') ? this.nextElement.responseBody : data;

            fs.writeFile(this.responceDir + name, data, function (err, res)
                {
                if (err)
                    {
                    err.message = err.message+'. '+'Error write to File: ' + name;
                    callback(null, err);
                    return false;
                    }
                callback(null, res);
                });
            }
        catch(err)
            {
            callback(err);
            }
        }


    function readFromFile(fileName,callback)
        {
        if (!fileName||typeof fileName!='string')
            throw new Error('First parameter must be file name, pls - check!');


        fs.readFile(this.responceDir+fileName,callback);

        }



    function parse(data,callback)
        {
        if (!data||typeof data=='function')
            {
            callback = data;
            data = null;
            }

        if (!callback)
            callback = noop;



        callback(null,{});
        }





    function _name_from_url(url)
        {
        //url = url.replace(//)
        return url;
        }



    return new Scraper;

    }


