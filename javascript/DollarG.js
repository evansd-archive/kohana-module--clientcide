/* <?php echo '*','/';

	$this->requires('mootools/Element.js');

echo '/*';?> */

//returns a collection given an id or a selector
$G = function(elements) {
	return $splat($(elements)||$$(elements));
};