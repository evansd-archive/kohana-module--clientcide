/* <?php echo '*','/';

	$this->requires('clientcide/Autocompleter.js');

echo '/*';?> */

/*
Script: AutoCompleter.CNET.js
	Adds CNET css assets to autocompleter automatically.

License:
	http://clientside.cnet.com/wiki/cnet-libraries#license
*/
(function(){
	var AcCNET = {
		options: {
			baseHref: 'http://www.cnet.com/html/rb/assets/global/autocompleter/'
		},
		initialize: function() {
			this.parent.apply(this,arguments);
			this.writeStyle();
		},
		writeStyle: function(){
			window.addEvent('domready', function(){
				if($('AutocompleterCss')) return;
				new Element('link', {
					rel: 'stylesheet', 
					media: 'screen', 
					type: 'text/css', 
					href: this.options.baseHref+'Autocompleter.css', 
					id: 'AutocompleterCss'
				}).inject(document.head);
			}.bind(this));
		}
	};
	Autocompleter.Base.refactor(AcCNET);
	if (Autocompleter.Ajax) {
		["Base", "Xhtml", "Json"].each(function(c){
			if(Autocompleter.Ajax[c]) Autocompleter.Ajax[c] = Autocompleter.Ajax[c].refactor(AcCNET);
		});
	}
	if (Autocompleter.Local) Autocompleter.Local.refactor(AcCNET);
	if (Autocompleter.JsonP) Autocompleter.JsonP.refactor(AcCNET);
})();
