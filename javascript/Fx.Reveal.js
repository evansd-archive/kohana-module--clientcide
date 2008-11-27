/* <?php echo '*','/';

	$this->requires('mootools/Fx.Morph.js');
	$this->requires('clientcide/Element.Shortcuts.js');
	$this->requires('clientcide/Element.Measure.js');

echo '/*';?> */

/*
Script: Fx.Reveal.js
	Defines Fx.Reveal, a class that shows and hides elements with a transition.

License:
	http://clientside.cnet.com/wiki/cnet-libraries#license
*/
Fx.Reveal = new Class({
	Extends: Fx.Morph,
	options: {
		styles: ['padding','border','margin'],
		transitionOpacity: true,
		mode:'vertical',
		heightOverride: null,
		widthOverride: null
/*	onShow: $empty,
		onHide: $empty */
	},
	dissolve: function(){
		try {
			if(!this.hiding && !this.showing) {
				if(this.element.getStyle('display') != 'none'){
					this.hiding = true;
					this.showing = false;
					this.hidden = true;
					var startStyles = this.element.getComputedSize({
						styles: this.options.styles,
						mode: this.options.mode
					});
					var setToAuto = this.element.style.height === ""||this.element.style.height=="auto";
					this.element.setStyle('display', 'block');
					if (this.element.fxOpacityOk() && this.options.transitionOpacity) startStyles.opacity = 1;
					var zero = {};
					$each(startStyles, function(style, name){
						zero[name] = [style, 0]; 
					}, this);
					var overflowBefore = this.element.getStyle('overflow');
					this.element.setStyle('overflow', 'hidden');
					//put the final fx method at the front of the chain
					this.$chain = this.$chain || [];
					this.$chain.unshift(function(){
						if(this.hidden) {
							this.hiding = false;
							$each(startStyles, function(style, name) {
								startStyles[name] = style;
							}, this);
							this.element.setStyles($merge({display: 'none', overflow: overflowBefore}, startStyles));
							if (setToAuto) this.element.setStyle('height', 'auto');
						}
						this.fireEvent('onHide', this.element);
						this.callChain();
					}.bind(this));
					this.start(zero);
				} else {
					this.callChain.delay(10, this);
					this.fireEvent('onComplete', this.element);
					this.fireEvent('onHide', this.element);
				}
			} else if (this.options.link == "chain") {
				this.chain(this.dissolve.bind(this));
			} else if (this.options.link == "cancel" && !this.hiding) {
				this.cancel();
				this.dissolve();
			}
		} catch(e) {
			this.hiding = false;
			this.element.hide();
			this.callChain.delay(10, this);
			this.fireEvent('onComplete', this.element);
			this.fireEvent('onHide', this.element);
		}
		return this;
	},
	reveal: function(){
		try {
			if(!this.showing && !this.hiding) {
				if(this.element.getStyle('display') == "none" || 
					 this.element.getStyle('visiblity') == "hidden" || 
					 this.element.getStyle('opacity')==0){
					this.showing = true;
					this.hiding = false;
					this.hidden = false;
					//toggle display, but hide it
					var before = this.element.getStyles('visibility', 'display', 'position');
					this.element.setStyles({
						visibility: 'hidden',
						display: 'block',
						position:'absolute'
					});
					var setToAuto = this.element.style.height === ""||this.element.style.height=="auto";
					//enable opacity effects
					if(this.element.fxOpacityOk() && this.options.transitionOpacity) this.element.setStyle('opacity',0);
					//create the styles for the opened/visible state
					var startStyles = this.element.getComputedSize({
						styles: this.options.styles,
						mode: this.options.mode
					});
					//reset the styles back to hidden now
					this.element.setStyles(before);
					$each(startStyles, function(style, name) {
						startStyles[name] = style;
					}, this);
					//if we're overridding height/width
					if($chk(this.options.heightOverride)) startStyles['height'] = this.options.heightOverride.toInt();
					if($chk(this.options.widthOverride)) startStyles['width'] = this.options.widthOverride.toInt();
					if(this.element.fxOpacityOk() && this.options.transitionOpacity) startStyles.opacity = 1;
					//create the zero state for the beginning of the transition
					var zero = { 
						height: 0,
						display: 'block'
					};
					$each(startStyles, function(style, name){ zero[name] = 0 }, this);
					var overflowBefore = this.element.getStyle('overflow');
					//set to zero
					this.element.setStyles($merge(zero, {overflow: 'hidden'}));
					//start the effect
					this.start(startStyles);
					if (!this.$chain) this.$chain = [];
					this.$chain.unshift(function(){
						if (!this.options.heightOverride && setToAuto) {
							if (["vertical", "both"].contains(this.options.mode)) this.element.setStyle('height', 'auto');
							if (["width", "both"].contains(this.options.mode)) this.element.setStyle('width', 'auto');
						}
						if(!this.hidden) this.showing = false;
						this.element.setStyle('overflow', overflowBefore);
						this.callChain();
						this.fireEvent('onShow', this.element);
					}.bind(this));
				} else {
					this.callChain();
					this.fireEvent('onComplete', this.element);
					this.fireEvent('onShow', this.element);
				}
			} else if (this.options.link == "chain") {
				this.chain(this.reveal.bind(this));
			} else if (this.options.link == "cancel" && !this.showing) {
				this.cancel();
				this.reveal();
			}
		} catch(e) {
			this.element.setStyles({
				display: 'block',
				visiblity: 'visible',
				opacity: 1
			});
			this.showing = false;
			this.callChain.delay(10, this);
			this.fireEvent('onComplete', this.element);
			this.fireEvent('onShow', this.element);
		}
		return this;
	},
	toggle: function(){
		try {
			if(this.element.getStyle('display') == "none" || 
				 this.element.getStyle('visiblity') == "hidden" || 
				 this.element.getStyle('opacity')==0){
				this.reveal();
		 	} else {
				this.dissolve();
			}
		} catch(e) { this.show(); }
	 return this;
	}
});

Element.Properties.reveal = {

	set: function(options){
		var reveal = this.retrieve('reveal');
		if (reveal) reveal.cancel();
		return this.eliminate('reveal').store('reveal:options', $extend({link: 'cancel'}, options));
	},

	get: function(options){
		if (options || !this.retrieve('reveal')){
			if (options || !this.retrieve('reveal:options')) this.set('reveal', options);
			this.store('reveal', new Fx.Reveal(this, this.retrieve('reveal:options')));
		}
		return this.retrieve('reveal');
	}

};

Element.Properties.dissolve = Element.Properties.reveal;

Element.implement({

	reveal: function(options){
		this.get('reveal', options).reveal();
		return this;
	},
	
	dissolve: function(options){
		this.get('reveal', options).dissolve();
		return this;
	}

});

Element.implement({
	nix: function() {
		var  params = Array.link(arguments, {destroy: Boolean.type, options: Object.type});
		this.get('reveal', params.options).dissolve().chain(function(){
			this[params.destroy?'destroy':'erase']();
		}.bind(this));
		return this;
	}
});
