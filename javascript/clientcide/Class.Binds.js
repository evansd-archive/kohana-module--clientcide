/* <?php echo '*','/';

	$this->requires('mootools/Class.js');
	$this->requires('clientcide/Clientcide.js');

echo '/*';?> */

/*
Script: Class.Binds.js
	Automatically binds specified methods in a class to the instance of the class.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
(function(){
	var binder = function(self, binds){
		var oldInit = self.initialize;
		self.initialize = function() {
			Array.flatten(binds).each(function(binder) {
				var original = this[binder];
				this[binder] = function(){
					return original.apply(this, arguments);
				}.bind(this);
				this[binder].parent = original.parent;
			}, this);
			return oldInit.apply(this,arguments);
		};
		return self;
	};
	Class.Mutators.Binds = function(self, binds) {
		if (!self.Binds) return self;
		delete self.Binds;
		return binder(self, binds);
	};
	Class.Mutators.binds = function(self, binds) {
		if (!self.binds) return self;
		delete self['binds'];
		return binder(self, binds);
	};
})();