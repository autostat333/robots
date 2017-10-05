module.exports = function EnterPress($parse, $timeout, $filter)
    {
    return {
        link:function(scope,elem,attr)
            {

            var disable_fn = attr['enterDisable']!=undefined?$parse(attr['enterDisable']):false;
            //target is not obligated param, if it is not - use cur elem
            //target used to catch keyup from all blocks within this target
            //focus event not bubbling, but keyup yes
            //for div possible to set keyup handler if it has tabindex (tabindex switch on this availability because it is switching entirely focusing).
            //when input field is focused and generate keyup event - it is bubbling UP and meet parent with handler
			//!!! but I prevent bubling because some parents may have their own enter-press declarations
			//but in modal it is usefull set for button enter-target equal to modal
			//because enter from any input fields will be catched
            var target = attr['enterTarget']!==undefined?attr['enterTarget']:elem; //it must be class name
            var action_fn = attr['enterPress']!==undefined?$parse(attr['enterPress']):false;
			var attempts = 0; //attempts to get target attribute when it is not rendered in DOM (33 row for details)
			
			var autofocusDisabled = !attr['autofocusDisabled']?false:true;
			
			
            if (!action_fn){return false} //break directive if some params are away

            set_handler();

            function set_handler()
                {
					
				//in angular-material directives execute when elem is not inserted in DOM
				//that is why getting the target may returns length=0
				//set delay till modal will be opened
				var el =$(target);
				if (el.length==0)
					{
					if (attempts++>10) return false;
					$timeout(set_handler,0);
					return false;
					}
                

                //set tabindex for target element to make possible tabulating (focus it)
                if (el.attr('tabindex')===undefined)
                    el.attr({'tabindex':'0'});

                //set tabindex for current element to make possible tabulating (focus it)
                //because if target has been setted - current element (button) maybe not tabulatable
				/*
                if (elem.attr('tabindex')===undefined)
                    elem.attr({'tabindex':'0'});
				*/

                el.on('keyup',execute);
                el.css({'outline-width':'0px'});

                //without timeout focus not working
                //focus helps catch enter press without additional click on div (i.e. without focusing)
                //this rows lead to autofocus
                //it is necessary for buttons, to make possible catch enter press just after loading the page
				//e.g. for confirm modals or simple modals with messages
				//with forms more usefull disable autofocus because for some input fields will fire my-autofocus
                //!!! be careful of using several enter-press on one page
                //because in this case autofucus of one element break autofocus of previous element
                //if input - it will be skipped
                if (!$(elem).is('input'))
                    {
					if (!autofocusDisabled)
						{
						setTimeout(function()
							{
							el[0].focus();
							},500);								
						}
                    }

                }

            function execute(e)
                {
                if (!e){e = window.e}
                //for safe case, because maybe some parents may have also keyp "Enter" handlers (several opened modals maybe)
                e.stopPropagation();
                if (e.keyCode==13)
                    {
                    if (disable_fn)
                        var res = disable_fn(scope);

                    if (!res)
                        {
                        action_fn(scope);
                        if (this!=target) //because sometime necc blur event, password field when save spinner working
                            $(e.target).trigger('blur');
                        else
                            $(this).trigger('blur');
                        $timeout(scope.$apply(),0);
                        }
                    }
                }


            }

		}

    }

module.exports.$inject = ['$parse','$timeout','$filter'];