/* <?php echo '*','/';

	$this->requires('mootools/Element.Dimensions.js');
	$this->requires('clientcide/Element.Shortcuts.js');
	$this->requires('mootools/Element.Event.js');
	$this->requires('mootools/Selectors.js');
	$this->requires('clientcide/Element.Forms.js');
	$this->requires('mootools/Fx.Tween.js');
	$this->requires('mootools/Fx.Morph.js');
	$this->requires('mootools/Tips.js');
	$this->requires('clientcide/FormValidator.js');
	$this->requires('clientcide/StickyWin.Fx.js');
	$this->requires('clientcide/StickyWin.ui.js');
	$this->requires('clientcide/HtmlTable.js');
	$this->requires('mootools/Drag.js');
	$this->requires('clientcide/StyleWriter.js');

echo '/*';?> */

/*
Script: TagMaker.js
	Prompts the user to fill in the gaps to create an html tag output.

License:
	http://clientside.cnet.com/wiki/cnet-libraries#license
*/
var TagMaker = new Class({
	Implements: [Options, Events, StyleWriter],
	options: {
		name: "Tag Builder",
		output: '',
		picklets: {},
		help: {},
		example: {},
		'class': {},
		selectLists: {},
		width: 400,
		maxHeight: 500,
		clearOnPrompt: true,
		baseHref: "http://www.cnet.com/html/rb/assets/global/tips", 
		css: "table.trinket {	width: 98%;	margin: 0px auto;	font-size: 10px; }"+
					"table.trinket td {	vertical-align: top;	padding: 4px;}"+
					"table.trinket td a.button {	position: relative;	top: -2px;}"+
					"table.trinket td.example {	font-size: 9px;	color: #666;	text-align: right;	border-bottom: 1px solid #ddd;"+
						"padding-bottom: 6px;}"+
					"table.trinket div.validation-advice {	background-color: #a36565;	font-weight: bold;	color: #fff;	padding: 4px;"+
						"margin-top: 3px;}"+
					"table.trinket input.text {width: 100%;}"+
					".tagMakerTipElement { 	cursor: help; }"+
					".tagMaker .tip {	color: #fff;	width: 172px;	z-index: 13000; }"+
					".tagMaker .tip-title {	font-weight: bold;	font-size: 11px;	margin: 0;	padding: 8px 8px 4px;"+
							"background: url(%baseHref%/bubble.png) top left;}"+
					".tagMaker .tip-text { font-size: 11px; 	padding: 4px 8px 8px; "+
							"background: url(%baseHref%/bubble.png) bottom right; }"+
					".tagMaker { z-index:10001 }"
//	onPrompt: $empty,
//	onChoose: $empty
	},
	initialize: function(options){
		this.setOptions(options);
		this.buttons = [
			{
				text: 'Copy',
				onClick: this.copyToClipboard.bind(this),
				properties: {
					'class': 'closeSticky tip',
					title: 'Copy::Copy the html to your OS clipboard (like hitting Ctrl+C)'
				}
			},
			{
				text: 'Paste',
				onClick: function(){
					if(this.validator.validate()) this.insert();
				}.bind(this),
				properties: {
					'class': 'tip',
					title: 'Paste::Insert the html into the field you are editing'
				}
			},
			{
				text: 'Close',
				properties: {
					'class': 'closeSticky tip',
					title: 'Close::Close this popup'
				}
			}
		];
		this.createStyle(this.options.css.replace("%baseHref%", this.options.baseHref, "g"), 'defaultTagBuilderStyle');
	},
	prompt: function(target){
		this.target = $(target);
		var content = this.getContent();
		if (this.options.clearOnPrompt) this.clear();
		if(content) {
				var relativeTo = (document.compatMode == "BackCompat" && this.target)?this.target:document.body;
				if(!this.win) {
					this.win = new StickyWin.Fx({
						content: content,
						draggable: true,
						relativeTo: relativeTo,
						onClose: function(){
							$$('.tagMaker-tip').hide();
						}
					});
				}
				if(!this.win.visible) this.win.show();
		}
		var innerText = this.getInnerTextInput();
		this.range = target.getSelectedRange();
		if(innerText) innerText.set('value', target.getTextInRange(this.range.start, this.range.end)||"");
		return this.fireEvent('onPrompt');
	},
	clear: function(){
		this.body.getElements('input').each(function(input){
			input.erase('value');
		});
	},
	getKeys: function(text) {
		return text.split('%').filter(function(inputKey, index){
				return index%2;
		});
	},
	getInnerTextInput: function(){
		return this.body.getElement('input[name=Inner-Text]');
	},
	getContent: function(){
		var opt = this.options; //save some bytes
		if(!this.form) { //if the body hasn't been created, create it
			this.form = new Element('form');
				var table = new HtmlTable({properties: {'class':'trinket'}});
				this.getKeys(opt.output).each(function(inputKey) {
					if(this.options.selectLists[inputKey]){
						var input = new Element('select').setProperties({
							name: inputKey.replace(' ', '-', 'g')
						}).addEvent('change', this.createOutput.bind(this));
						this.options.selectLists[inputKey].each(function(opt){
							var option = new Element('option').inject(input);
							if(opt.selected) option.set('selected', true);
							option.set('value', opt.value);
							option.set('text', opt.key);
						}, this);
						table.push([inputKey, input]);
					} else {
						var input = new Element('input', {
							type: 'text',
							name: inputKey.replace(/ /g, '-'),
							title: inputKey+'::'+opt.help[inputKey],
							'class': 'text tip ' + ((opt['class'])?opt['class'][inputKey]||'':''),
							events: {
								keyup: this.createOutput.bind(this),
								focus: function(){this.select()},
								change: this.createOutput.bind(this)
							}
						});
						if(opt.picklets[inputKey]) {
							var a = new Element('a').addClass('button').set('html', 'choose');
							var div = new Element('div').adopt(input.setStyle('width',160)).adopt(a);
							var picklets = ($type(opt.picklets[inputKey]) == "array")?opt.picklets[inputKey]:[opt.picklets[inputKey]];
							new ProductPicker(input, picklets, {
								showOnFocus: false, 
								additionalShowLinks: [a],
								onPick: function(input, data, picker){
									try {
										var ltInput = this.getInnerTextInput();
										if(ltInput && !ltInput.get('value')) {
											try {
												ltInput.set('value', picker.currentPicklet.options.listItemName(data));
											}catch (e){dbug.log('set value error: ', e);}
										}
										var val = input.value;
										if(inputKey == "Full Path" && val.test(/^http:/))
												input.set('value', val.substring(val.indexOf('/', 7), val.length));
										this.createOutput();
									} catch(e){dbug.log(e)}
								}.bind(this)
							});
							table.push([inputKey, div]);
						} else table.push([inputKey, input]);
					}
					//[{content: <content>, properties: {colspan: 2, rowspan: 3, 'class': "cssClass", style: "border: 1px solid blue"}]
					if(this.options.example[inputKey]) 
						table.push([{content: 'eg. '+this.options.example[inputKey], properties: {colspan: 2, 'class': 'example'}}]);
				}, this);
				this.resultInput = new Element('input', {
						type: 'text',
						title: 'HTML::This is the resulting tag html.',
						'class': 'text result tip'
					}).addEvent('focus', function(){this.select()});
				table.push(['HTML', this.resultInput]).tr;

			this.form = table.table;
			this.body = new Element('div', {
				styles: {
					overflow:'auto',
					maxHeight: this.options.maxHeight
				}
			}).adopt(this.form);
			this.validator = new FormValidator(this.form);
			this.validator.insertAdvice = function(advice, field){
				var p = $(field.parentNode);
				if(p) p.adopt(advice);
			};
		}

		if(!this.content) {
			this.content = StickyWin.ui(this.options.name, this.body, {
				buttons: this.buttons,
				width: this.options.width.toInt()
			});
			new Tips(this.content.getElements('.tip'), {
				showDelay: 700,
				maxTitleChars: 50, 
				maxOpacity: .9,
				className: 'tagMaker'
			});
		}
		return this.content;

	},
	createOutput: function(){
		var inputs = this.form.getElements('input, select');
		var html = this.options.output;
		inputs.each(function(input) {
			if(!input.hasClass('result')) {
				html = html.replace(new RegExp('%'+input.get('name').replace('-', ' ', 'g').toLowerCase()+'%', 'ig'),
					(input.get('tag')=='select'?input.getSelected()[0]:input).get('value'));
				html = html.replace(/\s\w+\=""/g, "");
			}
		});
		return this.resultInput.value = html;
	},
	copyToClipboard: function(){
		var inputs = this.form.getElements('input');
		var result = inputs[inputs.length-1];
		result.select();
		Clipboard.copyFromElement(result);
		$$('.tagMaker-tip').hide();
		this.win.hide();
		this.fireEvent('onChoose');
	},
	insert: function(){
		if(!this.target) {
			simpleErrorPopup('Cannot Paste','This tag builder was not launched with a target input specified; you\'ll have to copy the tag yourself. Sorry!');
			return;
		}
		var value = (this.target)?this.target.value:this.target;
		var output = this.body.getElement("input.result");
		
		var currentScrollPos; 
		if (this.target.scrollTop || this.target.scrollLeft) {
			currentScrollPos = {
				scrollTop: this.target.getScroll().y,
				scrollLeft: this.target.getScroll().x
			};
		}
		this.target.value = value.substring(0, this.range.start) + output.value + value.substring((this.range.end-this.range.start) + this.range.start, value.length);
		if(currentScrollPos) {
			this.target.scrollTop = currentScrollPos.getScroll().y;
			this.target.scrollLeft = currentScrollPos.getScroll().x;
		}

		this.target.selectRange(this.range.start, output.value.length + this.range.start);
		this.fireEvent('onChoose');
		$$('.tagMaker-tip').hide();
		this.win.hide();
		return;
	}
});


TagMaker.image = new Class({
	Extends: TagMaker,
	options: {
		name: "Image Builder",
		output: '<img src="%Full Url%" width="%Width%" height="%Height%" alt="%Alt Text%" style="%Alignment%"/>',
		help: {
			'Full Url':'Enter the external URL (http://...) to the image',
			'Width':'Enter the width in pixels.',
			'Height':'Enter the height in pixels.',
			'Alt Text':'Enter the alternate text for the image.',
			'Alignment':'Choose how to float the image.'
		},
		example: {
			'Full Url':'http://i.i.com.com/cnwk.1d/i/hdft/redball.gif'
		},
		'class': {
			'Full Url':'validate-url required',
			'Width':'validate-digits',
			'Height':'validate-digits',
			'Alt Text':''
		},
		selectLists: {
			Alignment: [
				{
					key: 'left',
					value: 'float: left'
				},
				{
					key: 'right',
					value: 'float: right'
				},
				{
					key: 'none',
					value: 'float: none',
					selected: true
				},
				{
					key: 'center',
					value: 'margin-left: auto; margin-right: auto;'
				}
			]		
		}
	}
});

var TMPicklets = [];
if(typeof CNETProductPicker_ReviewPath != "undefined") TMPicklets.push(CNETProductPicker_ReviewPath);
if(typeof CNETProductPicker_PricePath != "undefined") TMPicklets.push(CNETProductPicker_PricePath);
if(typeof NewsStoryPicker_Path != "undefined") TMPicklets.push(NewsStoryPicker_Path);
TagMaker.anchor = new Class({
	Extends: TagMaker,
	options: {
		name: "Anchor Builder",
		output: '<a href="%Full Url%">%Inner Text%</a>',
		picklets: {
			'Full Url': (TMPicklets.length)?TMPicklets:false
		},
		help: {
			'Full Url':'Enter the external URL (http://...)',
			'Inner Text':'Enter the text for the link body'
		},
		example: {
			'Full Url':'http://www.microsoft.com',
			'Inner Text':'Microsoft'
		},
		'class': {
			'Full Url':'validate-url'
		}
	}
});

TagMaker.cnetVideo = new Class({
	Extends: TagMaker,
	options: {
		name: "CNET Video Embed Tag",
		output: '<cnet:video ssaVideoId="%Video Id%" float="%Alignment%"/>',
		help: {
			'Video Id':'The id of the video to embed'
		},
		'class':{
			'Video Id':'validate-digits required'
		},
		selectLists: {
			Alignment: [
				{
					key: 'left',
					value: 'left'
				},
				{
					key: 'right',
					value: 'right'
				},
				{
					key: 'none',
					value: '',
					selected: true
				}
			]		
		}
	}
});