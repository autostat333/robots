module.exports = function PhoneMask($timeout)
	{
	
	return {
		require:'^ngModel',
		link:function($scope,elem, attr,ngModel)
			{
			
			var PHONE_TO_INPUT = /(\+38)|[^\d]/;
			var INPUT_TO_MODEL = /[^\d]/;
			var shiftFromRightCursor = 0; //shifting cursor from right (detail in remember cursor)
			var shiftFromLeftCursor = 0; //shifting cursor from left 
			var nonDigit = [' ','(',')']; //this symbols increase cursor when cursor before them and user types
			
			ngModel.$parsers.push(formatToModel);
			ngModel.$formatters.push(formatToInput);


			
			
			//to remember cursor where it had been before phone changed
			elem[0].addEventListener('keydown',rememberCursor,true);

			function formatToInput(val)
				{
				if (!val) return '';
				
				var r = new RegExp(PHONE_TO_INPUT,'g');

				//if (shiftCursor)
					setTimeout(setCursor,0);
				
				return formatPhone(val.replace(r,''));
				
				}


			function formatToModel(val)
				{
				var r = new RegExp(INPUT_TO_MODEL,'g');
				
				var clearPhone = val.replace(r,'');
				
				var new_val = formatPhone(clearPhone);
				if (new_val!=val)
					$timeout(function(){ngModel.$modelValue = ''},0);
				
				return '+38'+clearPhone.substr(0,10);
				}
				
				
			function formatPhone(phone)
				{
				if (!phone) return;
				phone = typeof phone=='string'?phone:phone.toString();
				
				var res = '';
				var symb = '';
				for (var i=0;letter=phone[i];i++)
					{
					switch (i)
						{
						case 0:
							symb = '(';
							break;
						case 2:
							symb = ')';
							break;
						case 5:
						case 7:
							symb = ' ';
							break;
						default:
							symb='';
							break;
						}
					if (i<10)
						res += (i==0?(symb+letter):(letter+symb));
					}
				
				return res.trim(); 
				}
				
			function rememberCursor(e)
				{
				var cursorPos = elem[0].selectionStart;
				var cursorEnd = elem[0].selectionEnd
				var val = elem.val();
				var valLen = val.length;

				
				var deleteBtn = e.keyCode==46?true:false;
				var backspaceBtn = e.keyCode==8?true:false;
				
				//cursorPos = cursorPos!=cursorEnd?cursorEnd:cursorPos;
				
				var range = cursorPos!=cursorEnd?true:false;
				
				//separation on shiftToLeft & shiftToRight must be to grant correct position of cursor
				//after cursor last string may be transformated (by adding spaces or dashes etc),
				//that is why sometimes left side to cursor more stable, but sometime right side
				
				
				//if range - set cursor depends on delete, backspace or typing
				if (range)
					{
					if (backspaceBtn||deleteBtn) //remain cursor position
						{	
						shiftFromRightCursor = -1; //shift on zero from right
						shiftFromLeftCursor = cursorPos>cursorEnd?cursorEnd:cursorPos;
						return false;
						}
						
						
					var nextSymb = val.substr((cursorPos>cursorEnd?cursorPos:cursorEnd),1);
					if (nextSymb=='') //means end of string
						{
						shiftFromRightCursor = 0; //set to the end of string
						shiftFromLeftCursor = -1;
						return false;
						}
					else
						{
						shiftFromRightCursor = -1; //shift on zero from right
						//shiftFromLeftCursor = cursorPos+(nonDigit.indexOf(nextSymb)!=-1?2:1);
						shiftFromLeftCursor = cursorPos+1;
						return false;							
						}
					
					}
				
				
				//if type not digit - remain cursor
				if (e.key.replace(/[^\d]/g,'')==''&&!backspaceBtn&&!deleteBtn)
					{
					shiftFromRightCursor = -1; //shift on zero from right
					shiftFromLeftCursor = cursorPos; 
					return false;
					
					}
				
				
				//if TYPING and cursor at the end (not important BACKSPACE or DELETE)
				if (cursorPos==valLen)
					{
					shiftFromRightCursor = 0; //shift on zero from right
					shiftFromLeftCursor = -1; 
					return false;
					}
					
					
				//if TYPING and cursor not at the END (middle of phone)
				if (cursorPos!=valLen)
					{
					//determine nextSymb
					var nextSymb = val.substr(cursorPos,1);
						
						
					//if BACKSPACE - shift to left
					if (backspaceBtn)
						{
						shiftFromRightCursor = -1;
						shiftFromLeftCursor = cursorPos-1;
						//console.log(cursorPos,shiftFromLeftCursor,val);
						return false;
						}
					//if delete button - remain cursor
					if (deleteBtn)
						{
						shiftFromRightCursor = -1;
						shiftFromLeftCursor = cursorPos;							
						return false;
						}
					//the rest buttons - means typing, so +1 symbol to left
					shiftFromRightCursor = -1;
					shiftFromLeftCursor = cursorPos+(nonDigit.indexOf(nextSymb)!=-1?2:1);
					return false;						
						
					}
					
				shiftFromRightCursor = 0;
				shiftFromLeftCursor = 0;
				
			
				}
		
				
			function setCursor()
				{
				var cur_val = elem.val();
				var len = cur_val.length;
				//console.log('set',len+shiftCursor);
				if (shiftFromLeftCursor==-1)
					elem[0].setSelectionRange(len,len);
				else
					elem[0].setSelectionRange(shiftFromLeftCursor,shiftFromLeftCursor,);
				}
				
				
			}
		
	}
		
		
		
	}
	
module.exports.$inject = ['$timeout'];