module.exports = function APICntr(db,roundCntr,ROBOTS)
    {

    var ObjectId = require('mongodb').ObjectId;
    var _ = require('lodash');

    var $scope = {};
    $scope.roundCurrent = roundCurrent;
    $scope.simpleFromCollection = simpleFromCollection;


    $scope._getRobotStat = _getRobotStat;
    $scope._validateCollectionNames = _validateCollectionNames;
    $scope._validateSorting = _validateSorting;
    $scope._validateField = _validateField;
    $scope._validatePagination = _validatePagination;
    $scope._validateFiltring = _validateFiltring;
    $scope._validateProjection = _validateProjection;
    $scope._validateValue = _validateValue;
    $scope._removeEmptyFields = _removeEmptyFields; //remove empty fields from filtring dictionary, not ness filter name:''


    $scope.availableCollectionsAndFields = _configRestFields();



    function roundCurrent(callback)
        {
        try
            {
            var robotStat = $scope._getRobotStat();
            roundCntr.round['ROBOTS'] = robotStat;
            callback(null,roundCntr.round);
            }
        catch(err){err.message+='; Can not get current round stat!';callback(err);}

        }



    function simpleFromCollection(params, callback)
        {
        try
            {

            if (!params['collection']) throw new Error('Collection not defined, api/:collection/:id');
            if (!params['mongoId']&&(!params['field']||!params['value']))
                throw new Error('Params not completed, should be collection, field and value');

            //simply check if params are existed whether they are correct
            $scope._validateCollectionNames(params);
            $scope._validateField(params);
            $scope._validateSorting(params);
            $scope._validatePagination(params);
            //$scope._validateProjection(params);  //forbidden, because shouldbe rewrited configRestField (split between indexed and accessibles for projection)
            $scope._validateFiltring(params);
            $scope._validateValue(params);



            //some transformtation to pass params in query to mongoDB
            if (params['field'])
                {
                var field = params['field'];
                var value = params['value'];
                //!!!this is hack to convert string int to int
                if (value&&value.isValidFor('number'))
                    value*=1;
                var find = {};find[field] = value;
                }
            else
                var find = {};

            //extend find object with additional filtring
            if (!_emptyObject(_removeEmptyFields(params['filtring'])))
                _.assignIn(find,params['filtring']);


            //determine cursor
            if (params['mongoId']&&params['mongoId']!='all') //for mongoId
                if (params['projections'])
                    var cursor = db.collection(params['collection']).find({'_id':ObjectId(params['mongoId'])},params['projection']);
                else
                    var cursor = db.collection(params['collection']).find({'_id':ObjectId(params['mongoId'])});
            else if (params['mongoId']) //for ALL documents
                if (params['projections'])
                    var cursor = db.collection(params['collection']).find(find,params['projection']);
                else
                    var cursor = db.collection(params['collection']).find(find);
            else
                if (params['projection'])
                    var cursor = db.collection(params['collection']).find(find,params['projection']);
                else
                    var cursor = db.collection(params['collection']).find(find);


            //apply sorting
            if (params['sorting'])
                cursor = cursor.sort(params['sorting']);

            //apply pagination !!!ONLY after get total number of docs
            var res = {'count':0,'docs':[]}, stop = false;
            cursor.count(function(err,count)
                {
                if (err)
                    {
                    err.message+='; Cannot get size of documents (cursor.count)!';
                    setTimeout(function(){callback(err)},0);
                    return false;
                    }
                res.count = count;
                if (params['pagination'])
                    cursor = cursor.skip(params['pagination']['skip']).limit(params['pagination']['limit']);
                cursor.each(function(err,doc)
                    {
                    try
                        {
                        if (stop) return false;
                        if (!doc)
                            {
                            setTimeout(function(){callback(null,res)},0);
                            stop = true;
                            return false;
                            }
                        res.docs.push(doc);
                        }
                        catch(err){err.message+='; Cannot get docs from DB or error when run callback!';callback(err);}
                    })

                })

            }
        catch(err){err.message+="; Cannot start db request to get data from collection "+params['collection']+'!';callback(err)}
        }



    function _validateCollectionNames(params)
        {
        if (params['collection']
            &&!$scope.availableCollectionsAndFields[params['collection']])
            throw new Error('Not valid or not allowed collection Name!');
        }


    function _validateField(params)
        {
        if (params['field']&&!params['collection'])
            throw new Error('Some mistake has happened, for field name: '+params['field']+' collection is not existed in params!');


        if (params['field']
            &&!$scope.availableCollectionsAndFields[params['collection']][params['field']])
            throw new Error('Field is not valid or not allowed. Should be field of collection '+params['collection']);
        }

    function _validateSorting(params)
        {
        //if object is empty - allow it
        if (params['sorting']&&_emptyObject(params['sorting'])) return false;

        if (params['sorting']&&
            (typeof params['sorting']!='object'
            ||!$scope.availableCollectionsAndFields[params['collection']][keys(params['sorting'])]))
            throw new Error('Sorting format is wrong or field for collection not valid or not allowed!');

        }


    function _validatePagination(params)
        {
        if (params['pagination']
            &&(typeof params['pagination']!='object'
            ||!params['pagination']['skip'].isValidFor('skipNumber')
            ||!params['pagination']['limit'].isValidFor('number')))
            throw new Error('Pagination values (skip or limit) are wrong, should be numbers');
        }

    function _validateProjection(params)
        {
        if (params['projection']
            &&(typeof params['projection']!='object'
            ||!$scope.availableCollectionsAndFields[keys(params['projection'])]
            ||params['projection'][keys(params['projection'])]!=1))
            throw new Error('Projection params are not correct. It should be projecton:{fieldName:1}')
        }


    function _validateFiltring(params)
        {
        if (params['filtring'])
            {
            for (var each in params['filtring'])
                {
                if (each=='$and')
                    for (var i=0;el=params['filtring']['$and'][i++];)
                        _validateFiltring(el);
                else
                    {
                    if (!$scope.availableCollectionsAndFields[params['collection']][each])
                        throw new Error('Filtring params are not correct. Should be filtring:{fieldName:value,fieldName2:value}');
                    }

                }
            }

        }

    function _validateValue(params)
        {
        if (params['value']&&!params['value'].isValidFor('value'))
            throw new Error('Value for select docs is not valid');

        }

    function _getRobotStat()
        {
        var stat = {};
        var robot;
        for (var i =0;robot=ROBOTS[i++];)
            {
            stat[robot['robotName']] = robot.getStat();
            }
        return stat;
        }


    function _emptyObject(obj)
        {
        if (typeof obj=='object'&&!_.size(obj))
            return true;
        return false;
        }


    function _removeEmptyFields(obj)
        {
        for (var each in obj)
            {
            if (obj[each]=='')
                delete obj[each];
            }

        }


    //indexed field, by wich is possible filtring, sorting
    function _configRestFields()
        {
        var c = {};


        c['ExampleRobot'] = {
            'ip':1, //!!!CHECK in future whether it is useful info
            'roundId':1,
            'fileName':1,
            'error':1,
            'startTime':1
            };

        c['ExampleRobotUrls'] = {
            'url':1,
            'name':1,
            };

        c['RobotDok'] = {
            'ip':1, //!!!CHECK in future whether it is useful info
            'roundId':1,
            'fileName':1,
            'error':1,
            'startTime':1
            };


        c['RobotDokUrls'] = {
            'url':1,
            'name':1,
            };


        c['rounds'] = {
            'roundId':1,
            'status':1
            };


        c['proxyRounds'] = {
            'roundId':1,
            'proxyRoundId':1
            };

        c['report'] = {
            'roundId':1,
            'fileName':1
            }

        c['errors'] = {
            'roundId':1,
            'created':1,
            'fileName':1,
            'robotName':1
        }

        return c;
        }

    //used to obtain key, from sorting:{'someField':1}
    function keys(obj)
        {
        return Object.keys(obj)[0];
        }

    return $scope;

    }