/* <?php echo '*','/';

	$this->requires('mootools/Element.Dimensions.js');
	$this->requires('clientcide/Element.Measure.js');

echo '/*';?> */

/*
Script: Element.Position.js
	Extends the Element native object to include methods useful positioning elements relative to others.

License:
	http://clientside.cnet.com/wiki/cnet-libraries#license
*/

Element.implement({

	setPosition: function(options){
		$each(options||{}, function(v, k){ if (!$defined(v)) delete options[k]; });
		options = $merge({
			relativeTo: document.body,
			position: {
				x: 'center', //left, center, right
				y: 'center' //top, center, bottom
			},
			edge: false,
			offset: {x:0,y:0},
			returnPos: false,
			relFixedPosition: false,
			ignoreMargins: false
		}, options);
		//compute the offset of the parent positioned element if this element is in one
		var parentOffset = {x: 0, y: 0};
		var parentPositioned = false;
		var putItBack = this.expose();
    /* dollar around getOffsetParent should not be necessary, but as it does not return 
     * a mootools extended element in IE, an error occurs on the call to expose. See:
		 * http://mootools.lighthouseapp.com/projects/2706/tickets/333-element-getoffsetparent-inconsistency-between-ie-and-other-browsers */
		var offsetParent = $(this.getOffsetParent());
		putItBack();
		if(offsetParent && offsetParent != this.getDocument().body) {
			var putItBack = offsetParent.expose();
			parentOffset = offsetParent.getPosition();
			putItBack();
			parentPositioned = true;
			options.offset.x = options.offset.x - parentOffset.x;
			options.offset.y = options.offset.y - parentOffset.y;
		}
		//upperRight, bottomRight, centerRight, upperLeft, bottomLeft, centerLeft
		//topRight, topLeft, centerTop, centerBottom, center
		function fixValue(option) {
			if($type(option) != "string") return option;
			option = option.toLowerCase();
			var val = {};
			if(option.test('left')) val.x = 'left';
			else if(option.test('right')) val.x = 'right';
			else val.x = 'center';

			if(option.test('upper')||option.test('top')) val.y = 'top';
			else if (option.test('bottom')) val.y = 'bottom';
			else val.y = 'center';
			return val;
		};
		options.edge = fixValue(options.edge);
		options.position = fixValue(options.position);
		if(!options.edge) {
			if(options.position.x == 'center' && options.position.y == 'center') options.edge = {x:'center',y:'center'};
			else options.edge = {x:'left',y:'top'};
		}
		
		this.setStyle('position', 'absolute');
		var rel = $(options.relativeTo) || document.body;
		var top = (rel == document.body)?window.getScroll().y:rel.getPosition().y;
		var left = (rel == document.body)?window.getScroll().x:rel.getPosition().x;
		
		if (top < 0) top = 0;
		if (left < 0) left = 0;
		var dim = this.getDimensions({computeSize: true, styles:['padding', 'border','margin']});
		if (options.ignoreMargins) {
			options.offset.x = options.offset.x - dim['margin-left'];
			options.offset.y = options.offset.y - dim['margin-top'];
		}
		var pos = {};
		var prefY = options.offset.y.toInt();
		var prefX = options.offset.x.toInt();
		switch(options.position.x) {
			case 'left':
				pos.x = left + prefX;
				break;
			case 'right':
				pos.x = left + prefX + rel.offsetWidth;
				break;
			default: //center
				pos.x = left + (((rel == document.body)?window.getSize().x:rel.offsetWidth)/2) + prefX;
				break;
		};
		switch(options.position.y) {
			case 'top':
				pos.y = top + prefY;
				break;
			case 'bottom':
				pos.y = top + prefY + rel.offsetHeight;
				break;
			default: //center
				pos.y = top + (((rel == document.body)?window.getSize().y:rel.offsetHeight)/2) + prefY;
				break;
		};
		
		if(options.edge){
			var edgeOffset = {};
			
			switch(options.edge.x) {
				case 'left':
					edgeOffset.x = 0;
					break;
				case 'right':
					edgeOffset.x = -dim.x-dim.computedRight-dim.computedLeft;
					break;
				default: //center
					edgeOffset.x = -(dim.x/2);
					break;
			};
			switch(options.edge.y) {
				case 'top':
					edgeOffset.y = 0;
					break;
				case 'bottom':
					edgeOffset.y = -dim.y-dim.computedTop-dim.computedBottom;
					break;
				default: //center
					edgeOffset.y = -(dim.y/2);
					break;
			};
			pos.x = pos.x+edgeOffset.x;
			pos.y = pos.y+edgeOffset.y;
		}
		pos = {
			left: ((pos.x >= 0 || parentPositioned)?pos.x:0).toInt(),
			top: ((pos.y >= 0 || parentPositioned)?pos.y:0).toInt()
		};
		if(rel.getStyle('position') == "fixed"||options.relFixedPosition) {
			pos.top = pos.top.toInt() + window.getScroll().y;
			pos.left = pos.left.toInt() + window.getScroll().x;
		}

		if(options.returnPos) return pos;
		else this.setStyles(pos);
		return this;
	}
});
