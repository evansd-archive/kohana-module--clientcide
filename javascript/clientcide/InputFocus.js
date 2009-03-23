/* <?php echo '*','/';

	$this->requires('mootools/Class.Extras.js');
	$this->requires('mootools/Element.js');
	$this->requires('clientcide/Occlude.js');
	$this->requires('clientcide/ToElement.js');

echo '/*';?> */

/*
Script: InputFocus.js
	Adds a focused css class to inputs when they have focus.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
var InputFocus = new Class({
	Implements: [Options, Occlude, ToElement],
	Binds: ['focus', 'blur'],
	options: {
		focusedClass: 'focused'
	},
	initialize: function(input, options) {
		this.element = $(input);
		if (this.occlude('focuser')) return this.occluded;
		this.setOptions(options);
		this.element.addEvents({
			focus: this.focus,
			blur: this.blur
		});
	},
	focus: function(){
		$(this).addClass(this.options.focusedClass);
	},
	blur: function(){
		$(this).removeClass(this.options.focusedClass);
	}
});