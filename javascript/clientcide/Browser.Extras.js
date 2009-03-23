/* <?php echo '*','/';

	$this->requires('mootools/Browser.js');
	$this->requires('clientcide/String.Extras.js');
	$this->requires('mootools/DomReady.js');

echo '/*';?> */

/*
Script: Browser.Extras.js
	Extends the Window native object to include methods useful in managing the window location and urls.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/

$extend(Browser, {
	getHost:function(url){
		url = $pick(url, window.location.href);
		var host = url;
		if(url.test('http://')){
			url = url.substring(url.indexOf('http://')+7,url.length);
			if(url.test(':')) url = url.substring(0, url.indexOf(":"));
			if(url.test('/')) return url.substring(0,url.indexOf('/'));
			return url;
		}
		return false;
	},
	getQueryStringValue: function(key, url) {
		try { 
			return Browser.getQueryStringValues(url)[key];
		}catch(e){return null;}
	},
	getQueryStringValues: function(url){
		var qs = $pick(url, window.location.search, '').split('?')[1]; //get the query string
		if (!$chk(qs)) return {};
		if (qs.test('#')) qs = qs.substring(0, qs.indexOf('#'));
		try {
      if (qs) return qs.parseQuery();
		} catch(e){
			return null;
		}
		return {}; //if there isn't one, return null
	},
	getPort: function(url) {
		url = $pick(url, window.location.href);
		var re = new RegExp(':([0-9]{4})');
		var m = re.exec(url);
	  if (m == null) return false;
	  else {
			var port = false;
			m.each(function(val){
				if($chk(parseInt(val))) port = val;
			});
	  }
		return port;
	},
  redraw: function(element){
    var n = document.createTextNode(' ');
    this.adopt(n);
    (function(){n.dispose()}).delay(1);
    return this;
	}
});
window.addEvent('domready', function(){
	var count = 0;
	//this is in case domready fires before string.extras loads
	function setQs(){
		function retry(){
			count++;
			if (count < 20) setQs.delay(50);
		}; 
		try {
			if (!Browser.getQueryStringValues()) retry();
			else Browser.qs = Browser.getQueryStringValues();
		} catch(e){
			retry();
		}
	}
	setQs();
});