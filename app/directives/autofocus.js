module.exports = function AutoFocusDirective($filter)
    {
    return {

        link:function(scope,element, attrs)
            {
			//$timeout - not necessary here, I do not need apply()
            setTimeout(function(){element[0].focus()},700);
            }

        }
    };
module.exports.$inject = ['$filter'];