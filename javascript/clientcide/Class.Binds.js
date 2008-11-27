/* <?php echo '*','/';

	$this->requires('mootools/Class.js');

echo '/*';?> */

/*
Script: Class.Binds.js
	Automatically binds specified methods in a class to the instance of the class.

License:
	http://clientside.cnet.com/wiki/cnet-libraries#license
*/
Class.Binds = new Class({
		bindMethods: function() {
			var binders = arguments.length > 0 ? arguments : this.binds;
			Array.flatten(binders).each(function(method){
				var original = this[method];
				this[method] = function(){
					return original.apply(this, arguments);
				}.bind(this);
				this[method].parent = original.parent
			}, this);
			return this;
		}
});

if (window.Options) {
	Options = Class.refactor(Options, {
		setOptions: function(){
			this.parent.apply(this, arguments);
			return this.bindMethods ? this.bindMethods() : this;
		}
	});
}