//define property is using to make possible set params like enumerable (iteration)
module.exports = function prototype()
    {
    Object.defineProperty(Object.prototype,'isValidFor',
        {
        'enumerable':false,
        'value':function(kind)
            {
            if (this.constructor.name!='Number'&&this.constructor.name!='String')
                return this.valueOf();

            if (kind===undefined)
                return this.valueOf();

            var fns = {};

            var REG_NUMBER = new RegExp(/^\d+$/);

            fns['roundId'] = function()
                {

                var val = this.valueOf();
                if (!val) return false;
                return REG_NUMBER.test(val.toString());

                }.bind(this);


            fns['number'] = function()
                {

                var val = this.valueOf();
                if (!val) return false;
                return REG_NUMBER.test(val.toString());

                }.bind(this);



            fns['skipNumber'] = function()
                {

                var val = this.valueOf();
                val = parseInt(val);
                if (val==undefined||isNaN(val)||val==null) return false;
                return val>=0?true:false;

                }.bind(this);




            fns['value'] = function()
                {

                var val = this.valueOf();
                if (!val) return false;
                val = val.toString();

                if (val.length>50) return false; //permit long text (possible queries)
                return true;

                }.bind(this);


            return fns[kind]();
            }


        })


    };

