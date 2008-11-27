/* <?php echo '*','/';

	$this->requires('clientcide/Class.Refactor.js');
	$this->requires('mootools/Request.js');
	$this->requires('mootools/Request.HTML.js');

echo '/*';?> */

/*
Script: Request.NoCache.js
	Extends Request and Request.HTML to automatically include a unique noCache value to prevent request caching.

License:
	http://clientside.cnet.com/wiki/cnet-libraries#license
*/
(function(){
	var rqst = function(cls) {
		return Class.refactor(cls, {
/*		options: {
				noCache: false
			}, */
			send: function(options){
				if (this.options.noCache) {
					var type = $type(options);
					if (type == 'string' || type == 'element') options = {data: options};

					var old = this.options;
					options = $extend({data: old.data, url: old.url, method: old.method}, options);
					options.url = options.url+(options.url.contains("?")?"&":"?")+"noCache=" + new Date().getTime();
				}
				this.parent(options);
			}
		});
	};
	Request = rqst(Request);
	Request.HTML = rqst(Request);
})();