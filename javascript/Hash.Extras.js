/* <?php echo '*','/';

	$this->requires('mootools/Core.js');

echo '/*';?> */

/*
Script: Hash.Extras.js
	Extends the Hash native object to include getFromPath which allows a path notation to child elements.

License:
	http://clientside.cnet.com/wiki/cnet-libraries#license
*/

Hash.implement({
	getFromPath: function(notation) {
		var source = this.getClean();
		notation.replace(/\[([^\]]+)\]|\.([^.[]+)|[^[.]+/g, function(match) {
			if (!source) return;
			var prop = arguments[2] || arguments[1] || arguments[0];
			source = (prop in source) ? source[prop] : null;
			return match;
		});
		return source;
	},
	cleanValues: function(method){
		method = method||$defined;
		this.each(function(v, k){
			if (!method(v)) this.erase(k);
		}, this);
		return this;
	},
	run: function(){
		var args = $arguments;
		this.each(function(v, k){
			if ($type(v) == "function") v.run(args);
		});
	}
});