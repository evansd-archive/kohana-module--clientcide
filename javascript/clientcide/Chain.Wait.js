/* <?php echo '*','/';

	$this->requires('clientcide/Clientcide.js');
	$this->requires('mootools/Class.Extras.js');

echo '/*';?> */

/*
Script: Chain.Wait.js
	Adds a method to inject pauses between chained events.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/
(function(){
	var wait = {
		wait: function(duration){
			return this.chain(function(){
				this.callChain.delay($pick(duration, 500), this);
			}.bind(this));
		}
	};
	Chain.implement(wait);
	if (window.Fx) {
		Fx.implement(wait);
		['Css', 'Tween', 'Elements'].each(function(cls) {
			if (Fx[cls]) Fx[cls].implement(wait);
		});
	}

	try {
		Element.implement({
			chains: function(effects){
				$splat($pick(effects, ['tween', 'morph', 'reveal'])).each(function(effect){
					this.get(effect).setOptions({
						link:'chain'
					});
				}, this);
				return this;
			},
			pauseFx: function(duration, effect) {
				this.chains(effect).get($pick(effect, 'tween')).wait(duration);
				return this;
			}
		});
	} catch(e){}
})();