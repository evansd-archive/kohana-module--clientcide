/* <?php echo '*','/';

	$this->requires('clientcide/ToElement.js');
	$this->requires('mootools/DomReady.js');
	$this->requires('clientcide/Element.Position.js');
	$this->requires('clientcide/Element.Pin.js');
	$this->requires('clientcide/IframeShim.js');
	$this->requires('clientcide/StyleWriter.js');
	$this->requires('mootools/Selectors.js');

echo '/*';?> */

/*
Script: StickyWin.js

Creates a div within the page with the specified contents at the location relative to the element you specify; basically an in-page popup maker.

License:
	http://clientside.cnet.com/wiki/cnet-libraries#license
*/

var StickyWin = new Class({
	Implements: [Options, Events, StyleWriter, ToElement],
	options: {
//	onDisplay: $empty,
//	onClose: $empty,
		closeClassName: 'closeSticky',
		pinClassName: 'pinSticky',
		content: '',
		zIndex: 10000,
		className: '',
		//id: ... set above in initialize function
/*  these are the defaults for setPosition anyway
/************************************************
//		edge: false, //see Element.setPosition in element.cnet.js
//		position: 'center', //center, corner == upperLeft, upperRight, bottomLeft, bottomRight
//		offset: {x:0,y:0},
//	  relativeTo: document.body, */
		width: false,
		height: false,
		timeout: -1,
		allowMultipleByClass: false,
		allowMultiple: true,
		showNow: true,
		useIframeShim: true,
		iframeShimSelector: ''
	},
	css: '.SWclearfix:after {content: "."; display: block; height: 0; clear: both; visibility: hidden;}'+
			 '.SWclearfix {display: inline-table;}'+
			 '* html .SWclearfix {height: 1%;}'+
			 '.SWclearfix {display: block;}',
	initialize: function(options){
		this.options.inject = {
			target: document.body,
			where: 'bottom' 
		};
		this.setOptions(options);
		
		this.id = this.options.id || 'StickyWin_'+new Date().getTime();
		this.makeWindow();
		if(this.options.content) this.setContent(this.options.content);
		if(this.options.timeout > 0) {
			this.addEvent('onDisplay', function(){
				this.hide.delay(this.options.timeout, this)
			}.bind(this));
		}
		if(this.options.showNow) this.show();
		//add css for clearfix
		this.createStyle(this.css, 'StickyWinClearFix');
	},
	makeWindow: function(){
		this.destroyOthers();
		if(!$(this.id)) {
			this.win = new Element('div', {
				id:		this.id
			}).addClass(this.options.className).addClass('StickyWinInstance').addClass('SWclearfix').setStyles({
			 	display:'none',
				position:'absolute',
				zIndex:this.options.zIndex
			}).inject(this.options.inject.target, this.options.inject.where).store('StickyWin', this);			
		} else this.win = $(this.id);
		this.element = this.win;
		if(this.options.width && $type(this.options.width.toInt())=="number") this.win.setStyle('width', this.options.width.toInt());
		if(this.options.height && $type(this.options.height.toInt())=="number") this.win.setStyle('height', this.options.height.toInt());
		return this;
	},
	show: function(){
		this.fireEvent('onDisplay');
		this.showWin();
		if(this.options.useIframeShim) this.showIframeShim();
		this.visible = true;
		return this;
	},
	showWin: function(){
		this.win.setStyle('display','block');
		if(!this.positioned) this.position();
	},
	hide: function(suppressEvent){
		if(!suppressEvent) this.fireEvent('onClose');
		this.hideWin();
		if(this.options.useIframeShim) this.hideIframeShim();
		this.visible = false;
		return this;
	},
	hideWin: function(){
		this.win.setStyle('display','none');
	},
	destroyOthers: function() {
		if(!this.options.allowMultipleByClass || !this.options.allowMultiple) {
			$$('div.StickyWinInstance').each(function(sw) {
				if(!this.options.allowMultiple || (!this.options.allowMultipleByClass && sw.hasClass(this.options.className))) 
					sw.retrieve('StickyWin').destroy();
			}, this);
		}
	},
	setContent: function(html) {
		if(this.win.getChildren().length>0) this.win.empty();
		if($type(html) == "string") this.win.set('html', html);
		else if ($(html)) this.win.adopt(html);
		this.win.getElements('.'+this.options.closeClassName).each(function(el){
			el.addEvent('click', this.hide.bind(this));
		}, this);
		this.win.getElements('.'+this.options.pinClassName).each(function(el){
			el.addEvent('click', this.togglepin.bind(this));
		}, this);
		return this;
	},	
	position: function(options){
		this.positioned = true;
		this.setOptions(options);
		this.win.setPosition({
			relativeTo: this.options.relativeTo,
			position: this.options.position,
			offset: this.options.offset,
			edge: this.options.edge
		});
		if(this.shim) this.shim.position();
		return this;
	},
	pin: function(pin) {
		if(!this.win.pin) {
			dbug.log('you must include element.pin.js!');
			return this;
		}
		this.pinned = $pick(pin, true);
		this.win.pin(pin);
		return this;
	},
	unpin: function(){
		return this.pin(false);
	},
	togglepin: function(){
		return this.pin(!this.pinned);
	},
	makeIframeShim: function(){
		if(!this.shim){
			var el = (this.options.iframeShimSelector)?this.win.getElement(this.options.iframeShimSelector):this.win;
			this.shim = new IframeShim(el, {
				display: false,
				name: 'StickyWinShim'
			});
		}
	},
	showIframeShim: function(){
		if(this.options.useIframeShim) {
			this.makeIframeShim();
			this.shim.show();
		}
	},
	hideIframeShim: function(){
		if(this.shim) this.shim.hide();
	},
	destroy: function(){
		if (this.win) this.win.dispose();
		if(this.options.useIframeShim && this.shim) this.shim.dispose();
		if($('modalOverlay'))$('modalOverlay').dispose();
	}
});
