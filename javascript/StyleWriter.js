/* <?php echo '*','/';

	$this->requires('mootools/Class.js');
	$this->requires('mootools/DomReady.js');
	$this->requires('mootools/Element.js');
	$this->requires('clientcide/dbug.js');

echo '/*';?> */

/*
Script: StyleWriter.js

Provides a simple method for injecting a css style element into the DOM if it's not already present.

License:
	http://clientside.cnet.com/wiki/cnet-libraries#license
*/

var StyleWriter = new Class({
	createStyle: function(css, id) {
		window.addEvent('domready', function(){
			try {
				if($(id) && id) return;
				var style = new Element('style', {id: id||''}).inject($$('head')[0]);
				if (Browser.Engine.trident) style.styleSheet.cssText = css;
				else style.set('text', css);
			}catch(e){dbug.log('error: %s',e);}
		}.bind(this));
	}
});