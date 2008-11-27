/* <?php echo '*','/';

	$this->requires('clientcide/Element.Position.js');
	$this->requires('mootools/Class.Extras.js');
	$this->requires('mootools/Element.Event.js');
	$this->requires('mootools/Element.Style.js');

echo '/*';?> */

/*
Script: IframeShim.js
	Defines IframeShim, a class for obscuring select lists and flash objects in IE.

License:
	http://clientside.cnet.com/wiki/cnet-libraries#license
*/	
var IframeShim = new Class({
	Implements: [Options, Events],
	options: {
		name: '',
		className:'iframeShim',
		display:false,
		zindex: null,
		margin: 0,
		offset: {
			x: 0,
			y: 0
		},
		browsers: (Browser.Engine.trident4 || (Browser.Engine.gecko && !Browser.Engine.gecko19 && Browser.Platform.mac))
	},
	initialize: function (element, options){
		this.setOptions(options);
		//legacy
		if(this.options.offset && this.options.offset.top) this.options.offset.y = this.options.offset.top;
		if(this.options.offset && this.options.offset.left) this.options.offset.x = this.options.offset.left;
		this.element = $(element);
		this.makeShim();
		return;
	},
	makeShim: function(){
		this.shim = new Element('iframe');
		this.id = this.options.name || new Date().getTime() + "_shim";
		if(!this.options.browsers) return;
		if(this.element.getStyle('z-Index').toInt()<1 || isNaN(this.element.getStyle('z-Index').toInt()))
			this.element.setStyle('z-Index',5);
		var z = this.element.getStyle('z-Index')-1;
		
		if($chk(this.options.zindex) && 
			 this.element.getStyle('z-Index').toInt() > this.options.zindex)
			 z = this.options.zindex;
			
 		this.shim.setStyles({
			'position': 'absolute',
			'zIndex': z,
			'border': 'none',
			'filter': 'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)'
		}).setProperties({
			'src':'javascript:void(0);',
			'frameborder':'0',
			'scrolling':'no',
			'id':this.id
		}).addClass(this.options.className);
		
		this.element.store('shim', this);

		var inject = function(){
			this.shim.inject(this.element, 'after');
			if(this.options.display) this.show();
			else this.hide();
			this.fireEvent('onInject');
		};
		if(this.options.browsers){
			if(Browser.Engine.trident && !IframeShim.ready) {
				window.addEvent('load', inject.bind(this));
			} else {
				inject.run(null, this);
			}
		}
	},
	position: function(shim){
		if(!this.options.browsers || !IframeShim.ready) return this;
		var putItBack = this.element.expose();
		var size = this.element.getSize();
		putItBack();
		if($type(this.options.margin)){
			size.x = size.x-(this.options.margin*2);
			size.y = size.y-(this.options.margin*2);
			this.options.offset.x += this.options.margin; 
			this.options.offset.y += this.options.margin;
		}
 		this.shim.setStyles({
			'width': size.x,
			'height': size.y
		}).setPosition({
			relativeTo: this.element,
			offset: this.options.offset
		});
		return this;
	},
	hide: function(){
		if(this.options.browsers) this.shim.setStyle('display','none');
		return this;
	},
	show: function(){
		if(!this.options.browsers) return this;
		this.shim.setStyle('display','block');
		return this.position();
	},
	dispose: function(){
		if(this.options.browsers) this.shim.dispose();
		return this;
	}
});
window.addEvent('load', function(){
	IframeShim.ready = true;
});
