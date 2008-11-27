/* <?php echo '*','/';

	$this->requires('mootools/Fx.Tween.js');
	$this->requires('mootools/Element.Event.js');
	$this->requires('clientcide/Element.Shortcuts.js');

echo '/*';?> */

/*
Script: SimpleSlideShow.js

Makes a very, very simple slideshow gallery with a collection of dom elements and previous and next buttons.

License:
	http://clientside.cnet.com/wiki/cnet-libraries#license
*/
	var SimpleSlideShow = new Class({
		Implements: [Events, Options, Chain],
		options: {
			startIndex: 0,
			slides: [],
			currentSlideClass: 'currentSlide',
			currentIndexContainer: false,
			maxContainer: false,
			nextLink: false,
			prevLink: false,
			wrap: true,
			disabledLinkClass: 'disabled',
//			onNext: $empty,
//			onPrev: $empty,
//			onSlideClick: $empty,
			crossFadeOptions: {}
		},
		initialize: function(options){
			this.setOptions(options);
			this.slides = this.options.slides;
			this.makeSlides();
			this.setCounters();
			this.setUpNav();
			this.now = this.options.startIndex;
			if (this.slides.length > 0) this.show(this.now);
		},
		setCounters: function(){
			if ($(this.options.currentIndexContainer))$(this.options.currentIndexContainer).set('html', this.now+1);
			if ($(this.options.maxContainer))$(this.options.maxContainer).set('html', this.slides.length);
		},
		makeSlides: function(){
			//hide them all
			this.slides.each(function(slide, index){
				if (index != this.now) slide.setStyle('display', 'none');
				else slide.setStyle('display', 'block');
				this.makeSlide(slide);
			}, this);
		},
		makeSlide: function(slide){
			slide.addEvent('click', function(){ this.fireEvent('onSlideClick'); }.bind(this));
		},
		setUpNav: function(){	
			if ($(this.options.nextLink)) {
				$(this.options.nextLink).addEvent('click', function(){
					this.forward();
				}.bind(this));
			}
			if ($(this.options.prevLink)) {
				$(this.options.prevLink).addEvent('click', function(){
					this.back();
				}.bind(this));
			}
		},
		disableLinks: function(now){
			if (this.options.wrap) return;
			now = $pick(now, this.now);
			var prev = $(this.options.prevLink);
			var next = $(this.options.nextLink);
			var dlc = this.options.disabledLinkClass;
			if (now > 0) {
				if (prev) prev.removeClass(dlc);
				if (now === this.slides.length-1 && next) next.addClass(dlc);
				else if (next) next.removeClass(dlc)
			}	else { //now is zero
				if (this.slides.length > 0 && next) next.removeClass(dlc);
				if (prev) prev.addClass(dlc);
			}
		},
		forward: function(){
			var fireEvent = false;
			if ($type(this.now) && this.now < this.slides.length-1) fireEvent = this.show(this.now+1);
			else if ($type(this.now) && this.options.wrap) fireEvent = this.show(0);
			else if (!$type(this.now)) fireEvent = this.show(this.options.startIndex);
			if (fireEvent) this.fireEvent('onNext');
			return this;
		},
		back: function(){
			if (this.now > 0) {
				this.show(this.now-1);
				this.fireEvent('onPrev');
			} else if (this.options.wrap && this.slides.length > 1) {
				this.show(this.slides.length-1);
				this.fireEvent('onPrev');
			}
			return this;
		},
		show: function(index){
			if (this.showing) return this.chain(this.show.bind(this, index));
			var now = this.now;
			var s = this.slides[index]; //saving bytes
			function fadeIn(s, resetOpacity){
				s.setStyle('display','block');
				if (s.fxOpacityOk()) {
					if (resetOpacity) s.setStyle('opacity', 0);
					s.set('tween', this.options.crossFadeOptions).get('tween').start('opacity', 1).chain(function(){
						this.showing = false;
						this.disableLinks();
						this.callChain();
					}.bind(this));
				}
			};
			if (s) {
				if ($type(this.now) && this.now != index){
					if (s.fxOpacityOk()) {
						var fx = this.slides[this.now].get('tween');
						fx.setOptions(this.options.crossFadeOptions);
						this.showing = true;
						fx.start('opacity', 0).chain(function(){
							this.slides[now].setStyle('display','none');
							s.addClass(this.options.currentSlideClass);
							fadeIn.run([s, true], this);
						}.bind(this));
					} else {
						this.slides[this.now].setStyle('display','none');
						fadeIn.run(s, this);
					}
				} else fadeIn.run(s, this);
				this.now = index;
				this.setCounters();
			}
		},
		slideClick: function(){
			this.fireEvent('onSlideClick', [this.slides[this.now], this.now]);
		}
	});

	var SimpleImageSlideShow = new Class({
		Extends: SimpleSlideShow,
		options: {
			imgUrls: [],
			imgClass: 'screenshot',
			container: false
		},
		initialize: function(options){
			this.parent(options);
			this.options.imgUrls.each(function(url){
				this.addImg(url);
			}, this);
			this.show(this.options.startIndex);
		},
		addImg: function(url){
			if ($(this.options.container)) {
				var img = new Element('img', {
					'src': url,
					'id': this.options.imgClass+this.slides.length
				}).addClass(this.options.imgClass).setStyle(
					'display', 'none').inject($(this.options.container)).addEvent(
					'click', this.slideClick.bind(this));
				this.slides.push(img);
				this.makeSlide(img);
				this.setCounters();
			}
			return this;
		}
	});
