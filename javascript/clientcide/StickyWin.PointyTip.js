/* <?php echo '*','/';

	$this->requires('clientcide/StickyWin.ui.pointy.js');

echo '/*';?> */

/*
Script: StickyWin.PointyTip.js
	Positions a pointy tip relative to the element you specify.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
StickyWin.PointyTip = new Class({
	Extends: StickyWin,
	options: {
		point: "left",
		pointyOptions: {}
	},
	initialize: function(){
		var args = this.getArgs(arguments);
		this.setOptions(args.options);
		var popts = this.options.pointyOptions;
		var d = popts.direction;
		if (!d) {
			var map = {
				left: 9,
				right: 3,
				up: 12,
				down: 6
			};
			d = map[this.options.point];
			if (!d) d = this.options.point;
			popts.direction = d;
		}
		if (!popts.width) popts.width = this.options.width;
		this.pointy = new StickyWin.UI.Pointy(args.caption, args.body, popts);
		this.options.content = null;
		
		this.setOptions(this.getPositionSettings(), args.options);
		this.parent(this.options);
		this.win.empty().adopt(this.pointy);
		this.attachHandlers(this.win);
		this.position();
	},
	getArgs: function(){
		return StickyWin.UI.getArgs.apply(this, arguments);
	},
	getPositionSettings: function(){
		var s = this.pointy.options.divotSize;
		var d = this.options.point;
		switch(d) {
			case "left": case 8: case 9: case 10:
				return {
					edge: {
						x: 'left', 
						y: d==10?'top':d==8?'bottom':'center'
					},
					position: {x: 'right', y: 'center'},
					offset: {
						x: s
					}
				};
			case "right": case 2:  case 3: case 4:
				return {
					edge: {
						x: 'right', 
						y: d==2?'top':d==4?'bottom':'center'
					},
					position: {x: 'left', y: 'center'},
					offset: {x: -s}
				};
			case "up": case 11: case 12: case 1:
				return {
					edge: { 
						x: d==11?'left':d==1?'right':'center', 
						y: 'top' 
					},
					position: {	x: 'center', y: 'bottom' },
					offset: {
						y: s,
						x: d==11?-s:d==1?s:0
					}
				};
			case "down": case 5: case 6: case 7:
				return {
					edge: {
						x: d==7?'left':d==5?'right':'center', 
						y: 'bottom'
					},
					position: {x: 'center', y: 'top'},
					offset: {y: -s}
				};
		};
	},
	setContent: function() {
		var args = this.getArgs(arguments);
		this.pointy.setContent(args.caption, args.body);
		[this.pointy.h1, this.pointy.body].each(this.attachHandlers, this);
		if (this.visible) this.position();
		return this;
	},
	showWin: function(){
		this.parent.apply(this, arguments);
		this.pointy.positionPointer();
	},
	position: function(){
		this.parent.apply(this, arguments);
		this.pointy.positionPointer();
	},
	attachHandlers: function(content) {
		if (!content) return;
		content.getElements('.'+this.options.closeClassName).addEvent('click', function(){ this.hide(); }.bind(this));
		content.getElements('.'+this.options.pinClassName).addEvent('click', function(){ this.togglepin(); }.bind(this));
	}
});