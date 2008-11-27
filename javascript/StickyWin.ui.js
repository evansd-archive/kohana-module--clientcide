/* <?php echo '*','/';

	$this->requires('mootools/Element.js');
	$this->requires('clientcide/String.Extras.js');
	$this->requires('clientcide/StickyWin.js');

echo '/*';?> */

/*
Script: StickyWin.ui.js

Creates an html holder for in-page popups using a default style.

License:
	http://clientside.cnet.com/wiki/cnet-libraries#license
*/

StickyWin.ui = function(caption, body, options){
	options = $extend({
		width: 300,
		css: "div.DefaultStickyWin div.body{font-family:verdana; font-size:11px; line-height: 13px;}"+
			"div.DefaultStickyWin div.top_ul{background:url({%baseHref%}full.png) top left no-repeat; height:30px; width:15px; float:left}"+
			"div.DefaultStickyWin div.top_ur{position:relative; left:0px !important; left:-4px; background:url({%baseHref%}full.png) top right !important; height:30px; margin:0px 0px 0px 15px !important; margin-right:-4px; padding:0px}"+
			"div.DefaultStickyWin h1.caption{clear: none !important; margin:0px 5px 0px 0px !important; overflow: hidden; padding:0 !important; font-weight:bold; color:#555; font-size:14px !important; position:relative; top:8px !important; left:5px !important; float: left; height: 22px !important;}"+
			"div.DefaultStickyWin div.middle, div.DefaultStickyWin div.closeBody {background:url({%baseHref%}body.png) top left repeat-y; margin:0px 20px 0px 0px !important;	margin-bottom: -3px; position: relative;	top: 0px !important; top: -3px;}"+
			"div.DefaultStickyWin div.body{background:url({%baseHref%}body.png) top right repeat-y; padding:8px 30px 8px 0px !important; margin-left:5px !important; position:relative; right:-20px !important;}"+
			"div.DefaultStickyWin div.bottom{clear:both}"+
			"div.DefaultStickyWin div.bottom_ll{background:url({%baseHref%}full.png) bottom left no-repeat; width:15px; height:15px; float:left}"+
			"div.DefaultStickyWin div.bottom_lr{background:url({%baseHref%}full.png) bottom right; position:relative; left:0px !important; left:-4px; margin:0px 0px 0px 15px !important; margin-right:-4px; height:15px}"+
			"div.DefaultStickyWin div.closeButtons{text-align: center; background:url({%baseHref%}body.png) top right repeat-y; padding: 0px 30px 8px 0px; margin-left:5px; position:relative; right:-20px}"+
			"div.DefaultStickyWin a.button:hover{background:url({%baseHref%}big_button_over.gif) repeat-x}"+
			"div.DefaultStickyWin a.button {background:url({%baseHref%}big_button.gif) repeat-x; margin: 2px 8px 2px 8px; padding: 2px 12px; cursor:pointer; border: 1px solid #999 !important; text-decoration:none; color: #000 !important;}"+
			"div.DefaultStickyWin div.closeButton{width:13px; height:13px; background:url({%baseHref%}closebtn.gif) no-repeat; position: absolute; right: 0px; margin:10px 15px 0px 0px !important; cursor:pointer}"+
			"div.DefaultStickyWin div.dragHandle {	width: 11px;	height: 25px;	position: relative;	top: 5px;	left: -3px;	cursor: move;	background: url({%baseHref%}drag_corner.gif); float: left;}",
		cornerHandle: false,
		cssClass: '',
		baseHref: 'http://www.cnet.com/html/rb/assets/global/stickyWinHTML/',
		buttons: []
/*	These options are deprecated:		
		closeTxt: false,
		onClose: $empty,
		confirmTxt: false,
		onConfirm: $empty	*/
	}, options);
	//legacy support
	if(options.confirmTxt) options.buttons.push({text: options.confirmTxt, onClick: options.onConfirm || $empty});
	if(options.closeTxt) options.buttons.push({text: options.closeTxt, onClick: options.onClose || $empty});
	
	var css = options.css.substitute({baseHref: options.baseHref}, /\\?\{%([^}]+)%\}/g);
	
	if (Browser.Engine.trident4) css = css.replace(/png/g, 'gif');

	new StyleWriter().createStyle(css, 'defaultStickyWinStyle');
	caption = $pick(caption, '%caption%');
	body = $pick(body, '%body%');
	var container = new Element('div').setStyle('width', options.width).addClass('DefaultStickyWin');
	if(options.cssClass) container.addClass(options.cssClass);
	//header
	var h1Caption = new Element('h1').addClass('caption').setStyle('width', (options.width.toInt()-(options.cornerHandle?70:60)));

	if($(caption)) h1Caption.adopt(caption);
	else h1Caption.set('html', caption);
	
	var bodyDiv = new Element('div').addClass('body');
	if($(body)) bodyDiv.adopt(body);
	else bodyDiv.set('html', body);
	
	var top_ur = new Element('div').addClass('top_ur').adopt(
			new Element('div').addClass('closeButton').addClass('closeSticky')
		).adopt(h1Caption);
	if(options.cornerHandle) new Element('div').addClass('dragHandle').inject(top_ur, 'top');
	else h1Caption.addClass('dragHandle');
	container.adopt(
		new Element('div').addClass('top').adopt(
				new Element('div').addClass('top_ul')
			).adopt(top_ur)
	);
	//body
	container.adopt(new Element('div').addClass('middle').adopt(bodyDiv));
	//close buttons
	if(options.buttons.length > 0){
		var closeButtons = new Element('div').addClass('closeButtons');
		options.buttons.each(function(button){
			if(button.properties && button.properties.className){
				button.properties['class'] = button.properties.className;
				delete button.properties.className;
			}
			var properties = $merge({'class': 'closeSticky'}, button.properties);
			new Element('a').addEvent('click',
				button.onClick || $empty).appendText(
				button.text).inject(closeButtons).setProperties(properties).addClass('button');
		});
		container.adopt(new Element('div').addClass('closeBody').adopt(closeButtons));
	}
	//footer
	container.adopt(
		new Element('div').addClass('bottom').adopt(
				new Element('div').addClass('bottom_ll')
			).adopt(
				new Element('div').addClass('bottom_lr')
		)
	);
	return container;
};
