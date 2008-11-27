/* <?php echo '*','/';

	$this->requires('mootools/Class.js');

echo '/*';?> */

/*
Script: Class.Refactor.js
	Extends a class onto itself with new property, preserving any items attached to the class's namespace.

License:
	http://clientside.cnet.com/wiki/cnet-libraries#license
*/
Class.refactor = function(orig, props) {
			$extend(props, { Extends: orig	});
			var update = new Class(props);
			$each(orig, function(v, k) {
				update[k] = update[k] || v;
			});
			return update;
};

$extend(Class.prototype, { 
	refactor: function(props){ 
		this.prototype = Class.refactor(this, props).prototype;
		return this;
	} 
});