module.exports = function phoneValidatorDirective()
	{
	return {
		require:['ngModel'],
		link:function($scope,elem,attrs,cntr)
			{
			var ngModel = cntr[0];
			
			ngModel.$validators['phone-validator'] = function(val)
				{
				if (!val) return false;
				var phonePattern = /^\+380\d{9}$/;
				var r = new RegExp(phonePattern);
				
				if (typeof val=='string'&&!r.test(val))
					return false;
				return true;
				}
				
			}
		
		
		
	}
		
		
		
	}