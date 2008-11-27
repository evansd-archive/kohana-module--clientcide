/* <?php echo '*','/';

	$this->requires('mootools/Fx.Morph.js');
	$this->requires('clientcide/Element.Position.js');

echo '/*';?> */

/*
Script: Fx.Move.js
	Defines Fx.Move, a class that works with Element.Position.js to transition an element from one location to another.

License:
	http://clientside.cnet.com/wiki/cnet-libraries#license
*/
Fx.Move = new Class({
	Extends: Fx.Morph,
	options: {
		relativeTo: document.body,
		position: 'center',
		edge: false,
		offset: {x:0,y:0}
	},
	start: function(destination){
		return this.parent(this.element.setPosition($merge(this.options, destination, {returnPos: true})));
	}
});

Element.Properties.move = {

	set: function(options){
		var morph = this.retrieve('move');
		if (morph) morph.cancel();
		return this.eliminate('move').store('move:options', $extend({link: 'cancel'}, options));
	},

	get: function(options){
		if (options || !this.retrieve('move')){
			if (options || !this.retrieve('move:options')) this.set('move', options);
			this.store('move', new Fx.Move(this, this.retrieve('move:options')));
		}
		return this.retrieve('move');
	}

};

Element.implement({

	move: function(options){
		this.get('move').start(options);
		return this;
	}

});
