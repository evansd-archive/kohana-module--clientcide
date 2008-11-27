/* <?php echo '*','/';

	$this->requires('clientcide/CNET.assets.js');

echo '/*';?> */

function setCNETAssetBaseHref(baseHref) {
	if (window.StickyWin && StickyWin.ui) {
		var CGFstickyWinHTML = StickyWin.ui.bind(window);
		StickyWin.ui = function(caption, body, options){
		    return CGFstickyWinHTML(caption, body, $merge({
		        baseHref: baseHref + '/stickyWinHTML/'
		    }, options));
		};
		if (StickyWin.alert) {
			var CGFsimpleErrorPopup = StickyWin.alert.bind(window);
			StickyWin.alert = function(msghdr, msg, base) {
			    return CGFsimpleErrorPopup(msghdr, msg, base||baseHref + "/simple.error.popup");
			};
		}
	}
	if (window.TagMaker) {
		TagMaker = TagMaker.refactor({
		    options: {
		        baseHref: baseHref + '/tips/'
		    }
		});
	}
	if (window.ProductPicker) {
		ProductPicker.refactor({
		    options:{
		        baseHref: baseHref + '/Picker'
		    }
		});
	}
	
	if (window.Autocompleter) {
		var AcCNET = {
				options: {
					baseHref: baseHref + '/autocompleter/'
				}
		};
		Autocompleter.Base.refactor(AcCNET);
		if (Autocompleter.Ajax) {
			["Base", "Xhtml", "Json"].each(function(c){
				if(Autocompleter.Ajax[c]) Autocompleter.Ajax[c].refactor(AcCNET);
			});
		}
		if (Autocompleter.Local) Autocompleter.Local.refactor(AcCNET);
		if (Autocompleter.JsonP) Autocompleter.JsonP.refactor(AcCNET);
	}
	
	if (window.Lightbox) {
		Lightbox.refactor({
		    options: {
		        assetBaseUrl: baseHref + '/slimbox/'
		    }
		});
	}
	
	if (window.Waiter) {
		Waiter.refactor({
			options: {
				baseHref: baseHref + '/waiter/'
			}
		});
	}
};