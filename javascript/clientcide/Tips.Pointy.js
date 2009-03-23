/* <?php echo '*','/';

	$this->requires('mootools/Tips.js');
	$this->requires('clientcide/StickyWin.PointyTip.js');

echo '/*';?> */

/*
Script: Tips.Pointy.js
	Defines Tips.Pointy, An extension to Tips that adds a pointy style to the tip.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/

Tips.Pointy = new Class({
	Extends: Tips,
	options: {
		onShow: function(tip){
			tip.show();
		},
		onHide: function(tip){
			tip.hide();
		},
		pointyTipOptions: {
			point: 11,
			width: 150,
			pointyOptions: {
				closeButton: false
			}
		}
	},
	initialize: function(){
		var params = Array.link(arguments, {options: Object.type, elements: $defined});
		this.setOptions(params.options);
		this.element = new StickyWin.PointyTip($extend(this.options.pointyTipOptions, {
			showNow: false
		}));
		if (this.options.className) $(this.element).addClass(this.options.className);
		if (params.elements) this.attach(params.elements);
	},
	toElement: function(){
		return $(this.element);
	},
	elementEnter: function(event, element){

		var title = element.retrieve('tip:title');
		var text = element.retrieve('tip:text');
		
		this.element.setContent(title, text);

		this.timer = $clear(this.timer);
		this.timer = this.show.delay(this.options.showDelay, this);

		this.position(element);
	},

	elementLeave: function(event){
		$clear(this.timer);
		this.timer = this.hide.delay(this.options.hideDelay, this);
	},

	elementMove: function(event){
		return; //always fixed
	},

	position: function(element){
		this.element.setOptions({
			relativeTo: element
		});
		this.element.position();
	},

	show: function(){
		this.fireEvent('show', $(this.element));
		this.element.show();
	},

	hide: function(){
		this.fireEvent('hide', $(this.element));
		this.element.hide();
	}

});