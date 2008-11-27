/* <?php echo '*','/';

	$this->requires('mootools/Class.Extras.js');
	$this->requires('clientcide/Class.Binds.js');
	$this->requires('clientcide/DollarG.js');

echo '/*';?> */

/*
Script: HoverGroup.js
	Manages mousing in and out of multiple objects (think drop-down menus).

License:
	http://clientside.cnet.com/wiki/cnet-libraries#license
*/
var HoverGroup = new Class({
	Implements: [Options, Events, Class.Binds],
	options: {
		//onEnter: $empty,
		//onLeave: $empty,
		elements: [],
		delay: 300,
		start: ['mouseenter'],
		remain: [],
		end: ['mouseleave']
	},
	binds: ['enter', 'leave', 'remain'],
	initialize: function(options) {
		this.setOptions(options);
		this.attachTo(this.options.elements);
		this.addEvents({
			leave: function(){
				this.active = false;
			},
			enter: function(){
				this.active = true;
			}
		});
	},
	elements: [],
	attachTo: function(elements, detach){
		var actions = {};
		elements = $G(elements);
		this.options.start.each(function(start) {
			actions[start] = this.enter;
		}, this);
		this.options.end.each(function(end) {
			actions[end] = this.leave;
		}, this);
		this.options.remain.each(function(remain){
			actions[remain] = this.remain;
		}, this);
		if (detach) {
			elements.each(function(el) {
				el.removeEvents(actions);
				this.elements.erase(el);
			});
		} else {
			elements.addEvents(actions);
			this.elements.combine(elements);
		}
		return this;
	},
	detachFrom: function(elements){
		this.attachTo(elements, true);
	},
	enter: function(){
		this.isMoused = true;
		this.assert();
	},
	leave: function(){
		this.isMoused = false;
		this.assert();
	},
	remain: function(){
		if (this.active) this.enter();
	},
	assert: function(){
		$clear(this.assertion);
		this.assertion = (function(){
			if (!this.isMoused && this.active) this.fireEvent('leave');
			else if (this.isMoused && !this.active) this.fireEvent('enter');
		}).delay(this.options.delay, this);
	}
});