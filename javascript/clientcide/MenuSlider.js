/* <?php echo '*','/';

	$this->requires('mootools/Fx.Slide.js');
	$this->requires('clientcide/HoverGroup.js');

echo '/*';?> */

/*
Script: MenuSlider.js
	Slides open a menu when the user mouses over a dom element. leaves it open while the mouse is over that element or the menu.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
var MenuSlider = new Class({
	Implements: [Options, Events],
	Binds: ['slideIn', 'slideOut'],
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
		useIframeShim: true,
		slideOut: false
	},
	initialize: function(menu, subMenu, options) {
		this.menu = $(menu);
		this.subMenu = $(subMenu);
		this.setOptions(options);
		this.makeSlider();
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
		if (this.options.slideOut) this.slider.slideOut();
		else this.slider.hide();
		if (this.shim) this.shim.hide();
		return this;
	}
});