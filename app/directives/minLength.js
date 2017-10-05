module.exports = function minLengthDirective()
	{
	return {
		require:['ngModel'],
		link:function($scope,elem,attrs,cntr)
			{
			var ngModel = cntr[0];
			
			ngModel.$validators['min-length'] = function(val)
				{	
				if (typeof val=='string'&&val.length<attrs['minLength'])
					return false;
				return true;
				}
				
			}
		
		
		
	}
		
		
		
	}