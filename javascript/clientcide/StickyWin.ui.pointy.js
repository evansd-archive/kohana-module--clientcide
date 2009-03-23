/* <?php echo '*','/';

	$this->requires('clientcide/Element.Shortcuts.js');
	$this->requires('clientcide/Element.Position.js');
	$this->requires('clientcide/StickyWin.ui.js');

echo '/*';?> */

/*
Script: StickyWin.ui.pointy.js

Creates an html holder for in-page popups using a default style - this one including a pointer in the specified direction.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
StickyWin.UI.Pointy = new Class({
	Extends: StickyWin.UI,
	options: {
		theme: 'dark',
		themes: {
			dark: {
				bgColor: '#333',
				fgColor: '#ddd',
				imgset: 'dark'
			},
			light: {
				bgColor: '#ccc',
				fgColor: '#333',
				imgset: 'light'
			}
		},
		css: "div.DefaultPointyTip {position: relative}"+
		"div.DefaultPointyTip div.body{background: {%bgColor%}; color: {%fgColor%}; right: 0px !important;padding:  0px 10px !important;margin-left: 0px !important;font-family: verdana;font-size: 11px;line-height: 13px;position: relative;}"+
		"div.DefaultPointyTip div.top {position: relative;height: 25px; overflow: visible}"+
		"div.DefaultPointyTip div.top_ul{background: url({%baseHref%}{%imgset%}_back.png) top left no-repeat;width: 8px;height: 25px; position: absolute; left: 0px;}"+
		"div.DefaultPointyTip div.top_ur{background: url({%baseHref%}{%imgset%}_back.png) top right !important;margin: 0 0 0 8px !important;height: 25px;position: relative;left: 0px !important;padding: 0;}"+
		"div.DefaultPointyTip h1.caption{color: {%fgColor%};left: 0px !important;top: 4px !important;clear: none !important;overflow: hidden;font-weight: 700;font-size: 12px !important;position: relative;float: left;height: 22px !important;margin: 0 !important;padding: 0 !important;}"+
		"div.DefaultPointyTip div.middle,div.DefaultPointyTip div.closeBody{background:  {%bgColor%};margin: 0 0px 0 0 !important;position: relative;top: 0 !important;}"+
		"div.DefaultPointyTip div.bottom {clear: both;} "+
		"div.DefaultPointyTip div.bottom_ll{font-size:1; background: url({%baseHref%}{%imgset%}_back.png) bottom left no-repeat;width: 6px;height: 6px;position: absolute; left: 0px;}"+
		"div.DefaultPointyTip div.bottom_lr{font-size:1; background: url({%baseHref%}{%imgset%}_back.png) bottom right;height: 6px;margin: 0 0 0 6px !important;position: relative;left: 0 !important;}"+
		"div.DefaultPointyTip div.noCaption{height: 6px; overflow: hidden}"+
		"div.DefaultPointyTip div.closeButton{width:13px; height:13px; background:url({%baseHref%}{%imgset%}_x.png) no-repeat; position: absolute; right: 0px; margin:4px 0px 0px !important; cursor:pointer; z-index: 1; top: 0px;}",
		baseHref: 'http://cnetjavascript.googlecode.com/svn/trunk/Assets/PointyTip/',
		divot: '{%baseHref%}{%imgset%}_divot.png',
		divotSize: 22,
		direction: 12,
		cssId: 'defaultPointyTipStyle',
		cssClassName: 'DefaultPointyTip'
	},
	initialize: function() {
		var args = this.getArgs(arguments);
		this.setOptions(args.options);
		$extend(this.options, this.options.themes[this.options.theme]);
		this.options.css = this.options.css.substitute(this.options, /\\?\{%([^}]+)%\}/g);
		if (args.options && args.options.theme) {
			while (!this.id) {
				var id = $random(0, 999999999);
				if (!StickyWin.UI.Pointy[id]) {
					StickyWin.UI.Pointy[id] = this;
					this.id = id;
				}
			}
			this.options.css = this.options.css.replace(/div\.DefaultPointyTip/g, "div#pointy_"+this.id);
			this.options.cssId = "pointyTipStyle_" + this.id;
		}
		if ($type(this.options.direction) == 'string') {
			var map = {
				left: 9,
				right: 3,
				up: 12,
				down: 6
			};
			this.options.direction = map[this.options.direction];
		}
		
		this.options.divot = this.options.divot.substitute(this.options, /\\?\{%([^}]+)%\}/g);
		if (Browser.Engine.trident4) this.options.divot = this.options.divot.replace(/png/g, 'gif');
		
		this.parent(args.caption, args.body, this.options);
		if (this.id) $(this).set('id', "pointy_"+this.id);
	},
	build: function(){
		this.parent();
		var opt = this.options;
		this.pointyWrapper = new Element('div', {
			'class': 'pointyWrapper'
		}).inject($(this));
		$(this).getChildren().each(function(el){
			if (el != this.pointyWrapper) this.pointyWrapper.grab(el);
		}, this);

		var w = opt.divotSize;
		var h = w;
		var left = (opt.width - opt.divotSize)/2;
		var orient = function(){
			switch(opt.direction) {
				case 12: case 1: case 11:
					return {
						height: h/2
					};
				case 5: case 6: case 7:
					return {
						height: h/2,
						backgroundPosition: '0 -'+h/2+'px'
					};
				case 8: case 9: case 10:
					return {
						width: w/2
					};
				case 2: case 3: case 4:
					return {
						width: w/2,
						backgroundPosition: '100%'
					};
			};
		};
		this.pointer = new Element('div', {
			styles: $extend({
				background: "url("+opt.divot+") no-repeat",
				width: w,
				height: h,
				overflow: 'hidden'
			}, orient()),
			'class': 'pointyDivot pointy_'+opt.direction
		}).inject(this.pointyWrapper);
		this.positionPointer();
	},
	expose: function(){
		if ($(this).getStyle('display') != 'none' && $(document.body).hasChild($(this))) return $empty;
		$(this).setStyles({
			visibility: 'hidden',
			position: 'absolute'
		});
		var dispose;
		if (!document.body.hasChild($(this))) {
			$(this).inject(document.body);
			dispose = true;
		}
		return (function(){
			if (dispose) $(this).dispose();
			$(this).setStyles({
				visibility: 'visible',
				position: 'relative'
			});
		}).bind(this);
	},
	positionPointer: function(options){
		if (!this.pointer) return;

		var opt = this.options;
		var pos;
		var d = opt.direction;
		switch (d){
			case 12: case 1: case 11:
				pos = {
					edge: {x: 'center', y: 'bottom'},
					position: {
						x: d==12?'center':d==1?'right':'left', 
						y: 'top'
					},
					offset: {
						x: (d==12?0:d==1?-1:1)*opt.divotSize,
						y: 1
					}
				};
				break;
			case 2: case 3: case 4:
				pos = {
					edge: {x: 'left', y: 'center'},
					position: {
						x: 'right', 
						y: d==3?'center':d==2?'top':'bottom'
					},
					offset: {
						x: -1,
						y: (d==3?0:d==4?-1:1)*opt.divotSize
					}
				};
				break;
			case 5: case 6: case 7:
				pos = {
					edge: {x: 'center', y: 'top'},
					position: {
						x: d==6?'center':d==5?'right':'left', 
						y: 'bottom'
					},
					offset: {
						x: (d==6?0:d==5?-1:1)*opt.divotSize,
						y: -1
					}
				};
				break;
			case 8: case 9: case 10:
				pos = {
					edge: {x: 'right', y: 'center'},
					position: {
						x: 'left', 
						y: d==9?'center':d==10?'top':'bottom'
					},
					offset: {
						x: 1,
						y: (d==9?0:d==8?-1:1)*opt.divotSize
					}
				};
				break;
		};
		var putItBack = this.expose();
		this.pointer.setPosition($extend({
			relativeTo: this.pointyWrapper
		}, pos, options));
		putItBack();
	},
	setContent: function(){
		this.parent.apply(this, arguments);
		this.top[this.h1?'removeClass':'addClass']('noCaption');
		if (Browser.Engine.trident4) $(this).getElements('.bottom_ll, .bottom_lr').setStyle('font-size', 1); //IE6 bullshit
		this.positionPointer();
		return this;
	},
	makeCaption: function(){
		this.parent.apply(this, arguments);
		if (this.options.width && this.h1) this.h1.setStyle('width', (this.options.width-(this.options.closeButton?25:15)));
	}
});

StickyWin.ui.pointy = function(caption, body, options){
	return $(new StickyWin.UI.Pointy(caption, body, options));
};