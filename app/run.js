module.exports = function run($rootScope,$state)
    {

    var token = window.localStorage.getItem('token');
    if (token)
        $rootScope.USER = jwtDecode(token);
    else
        $rootScope.USER = false;

    $rootScope.$on('$stateChangeStart',function(e,toState, toParams, fromState, fromParams, options)
        {
        if (!$rootScope.USER&&toState.name!='login')
            {
            $state.go('login');
            e.preventDefault();
            return false;
            }
        if ($rootScope.USER&&toState.name=='login')
            {
            if (fromState.name=='login'||fromState.name=='')
                {
                $state.go('main.rounds');
                e.preventDefault()
                }
            else
                e.preventDefault();
            }

        })

    }
module.exports.$inject = ['$rootScope','$state'];

