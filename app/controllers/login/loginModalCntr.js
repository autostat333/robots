module.exports = function loginModalCntr($scope,$mdDialog,$backend)
	{
	$scope.init = init;
	$scope.checkError = checkError;
	$scope.inputChange = inputChange; //from ng-change to hide message error card
	$scope.formEmpty = formEmpty;
	$scope._encode = _encode; //encode user name and password to base 64

	$scope.submitBtn = submitBtn;

	
	$scope.init();
	
	function init()
		{
		$scope.account = {'email':'','password':''};
		$scope.showError = false;
		}


	function checkError(fieldName,formName)
		{
		fieldName = fieldName||'all';
		
		
		if (fieldName=='all')
			{
			for (var each in $scope[formName])
				{
				if (each.indexOf('$')!=0)
					{
					if ($scope.checkError(each,formName))
						return true;
					}
				}
			return false;
			}
			
		return !Object.keys($scope[formName][fieldName].$error).length?false:true;
		}
		
		
	//hide error message after continue typing
	function inputChange()
		{
		$scope.showError = false;
		}
		

	function submitBtn()
		{
		if ($scope.checkError('all','loginForm')||$scope.formEmpty()) return false;
		
		
		$scope.spinner = true;
		var b64 = _encode($scope.account);
		$backend.login({'data':b64}).then(function(response)
			{
			$scope.spinner = false;
			if (response.Error||response.userError)
				{
				//for user Errors
				if (response.userError)
					$scope.showError = response.userError;
				return false;
				}
			$mdDialog.hide('success');
			})
			
		}

	function _encode(obj)
		{
		if (typeof obj=='object')
			obj = JSON.stringify(obj);

		var encoded = btoa(obj);
		var position = parseInt(encoded.length/2);
		encoded = encoded.substr(0,position)+'a'+encoded.substr(position);
		return encoded;
		}

	function formEmpty()
		{
		if (!$scope.account['email']&&!$scope.account['password']) return true;
		return false;
		}

	}

module.exports.$inject = ['$scope','$mdDialog','$backend'];

	
