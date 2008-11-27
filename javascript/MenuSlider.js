/* <?php echo '*','/';

	$this->requires('clientcide/HoverGroup.js');
	$this->requires('mootools/Fx.Slide.js');

echo '/*';?> */

/*
Script: MenuSlider.js
	Slides open a menu when the user mouses over a dom element. leaves it open while the mouse is over that element or the menu.

License:
	http://clientside.cnet.com/wiki/cnet-libraries#license
*/
var MenuSlider = new Class({
	Implements: [Options, Events, Class.Binds],
	options: {
	/*	onIn: $empty,
		onInStart: $empty,
		onOut: $empty,
		hoverGroupOptions: {}, */
		fxOptions: {
			duration: 400,
			transition: 'expo:out',
			link: 'cancel'
		},
		useIframeShim: true
	},
	binds: ['slideIn', 'slideOut'],
	initialize: function(menu, subMenu, options) {
		this.menu = $(menu);
		this.subMenu = $(subMenu);
		this.makeSlider();
		this.setOptions(options);
		this.hoverGroup = new HoverGroup($merge(this.options.hoverGroupOptions, {
			elements: [this.menu, this.subMenu],
			onEnter: this.slideIn,
			onLeave: this.slideOut
		}));
	},
	makeSlider: function(){
		this.slider = new Fx.Slide(this.subMenu, this.options.fxOptions).hide();
		if (this.options.useIframeShim && window.IframeShim) this.shim = new IframeShim(this.subMenu);
	},
	slideIn: function(){
		this.fireEvent('onInStart');
		this.slider.slideIn().chain(function(){
			if (this.shim) this.shim.show();
			this.fireEvent('onIn');
		}.bind(this));
		return this;
	},
	slideOut: function(){
		this.hide();
		this.fireEvent('onOut');
		if (this.shim) this.shim.hide();
		return this;
	},
	hide: function(){
		$clear(this.hoverGroup.assertion);
		this.hoverGroup.active = false;
		this.slider.cancel();
		this.slider.hide();
		if (this.shim) this.shim.hide();
		return this;
	}
});