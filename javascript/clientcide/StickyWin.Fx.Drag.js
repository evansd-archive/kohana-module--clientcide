/* <?php echo '*','/';

	$this->requires('mootools/Drag.Move.js');
	$this->requires('clientcide/StickyWin.Fx.js');

echo '/*';?> */

/*
Script: StickyWin.Fx.Drag.js

Implements drag and resize functionaity into StickyWin.Fx. See StickyWin.Fx for the options.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/

if(typeof Drag != "undefined"){
	StickyWin.Fx.implement({
		makeDraggable: function(){
			var toggled = this.toggleVisible(true);
			if(this.options.useIframeShim) {
				this.makeIframeShim();
				var onComplete = (this.options.dragOptions.onComplete || $empty);
				this.options.dragOptions.onComplete = function(){
					onComplete();
					this.shim.position();
				}.bind(this);
			}
			if(this.options.dragHandleSelector) {
				var handle = this.win.getElement(this.options.dragHandleSelector);
				if (handle) {
					handle.setStyle('cursor','move');
					this.options.dragOptions.handle = handle;
				}
			}
			this.win.makeDraggable(this.options.dragOptions);
			if (toggled) this.toggleVisible(false);
		}, 
		makeResizable: function(){
			var toggled = this.toggleVisible(true);
			if(this.options.useIframeShim) {
				this.makeIframeShim();
				var onComplete = (this.options.resizeOptions.onComplete || $empty);
				this.options.resizeOptions.onComplete = function(){
					onComplete();
					this.shim.position();
				}.bind(this);
			}
			if(this.options.resizeHandleSelector) {
				var handle = this.win.getElement(this.options.resizeHandleSelector);
				if(handle) this.options.resizeOptions.handle = this.win.getElement(this.options.resizeHandleSelector);
			}
			this.win.makeResizable(this.options.resizeOptions);
			if (toggled) this.toggleVisible(false);
		},
		toggleVisible: function(show){
			if(!this.visible && Browser.Engine.webkit && $pick(show, true)) {
				this.win.setStyles({
					display: 'block',
					opacity: 0
				});
				return true;
			} else if(!$pick(show, false)){
				this.win.setStyles({
					display: 'none',
					opacity: 1
				});
				return false;
			}
			return false;
		}
	});
}
