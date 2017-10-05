module.exports = function AccountCntr(db,injector,config,jwt)
    {

    var $scope = {};

    $scope.login = login;
    $scope._handleError = _handleError;
    $scope.getUser = getUser;
    $scope._decode = _decode;


    return $scope;


    function login(params,callback)
        {
        try
            {
            params = params.data;
            if (typeof params!='string'||params.length<5) throw "Wrong parameters (email and password)!";

            params = $scope._decode(params);

            if (!params['email']||!params['password']) throw 'Some params are empty!';
            if (typeof params['email']!='string'||typeof params['password']!='string') throw "Wrong values for properties!";


            var userEmail = params['email'];
            db.collection('users').findOne({'email':userEmail},function(err,doc)
                {
                try
                    {
                    if (!doc) throw "User with this email is not registered!";

                    if (doc['password']!=params['password']) throw "Password for this user is not correct!";

                    var user = {};
                    user['email'] = doc['email'];
                    user['role'] = doc['role'];
                    var token = jwt.sign(user,config['SECRET']);
                    callback(null,{'data':'','Error':'','token':token});
                    return false;
                    }
                catch(err){$scope._handleError(err,callback)}



                });


            }
        catch(err){$scope._handleError(err,callback)}


        }


    function _decode(params)
        {
        var len = params.length;
        var position = parseInt((len-1)/2);
        var jsonStr = params.substr(0,position)+params.substr((position+1));
        jsonStr = Buffer.from(jsonStr, 'base64').toString();
        return JSON.parse(jsonStr);
        }




    function getUser(req,callback)
        {
        try
            {
            //if (req.headers&&!req.headers.authorization)
            if (req.cookies&&!req.cookies.Authentication)
                req.USER = false;
            else
                req.USER = jwt.verify(req.cookies.Authentication.replace('Bearer ','').trim(),config.SECRET);
            setTimeout(callback,0);
            }
        catch(err)
            {
            err.message_ = err.message;
            callback(err);return false};
        }




    function _handleError(err,callback)
        {
        if (typeof err=='string')  //for userError
            {
            setTimeout(function(){callback(null,{'data':'','Error':'','userError':err})},0);
            return false;
            }
        //fonr system errors
        err+="; Problems to login!";
        setTimeout(function(){callback(err)},0);
        return false;
        }


    }
