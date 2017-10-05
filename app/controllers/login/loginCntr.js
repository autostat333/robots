module.exports.$inject = ['$scope','$mdDialog'];
module.exports = function loginCntr($scope,$mdDialog)
    {

    $scope.init = init;
    $scope.openLoginModal = openLoginModal;

    $scope.init();


    function init()
        {
        console.log('fef');
        $scope.openLoginModal().then(function(response){window.location.reload();});
        }




    function openLoginModal()
        {
        return $mdDialog.show({
            templateUrl:'./views/login/loginModal.html',
            controller:'loginModalCntr',
            scope:$scope.$new()
            })
        }

    }