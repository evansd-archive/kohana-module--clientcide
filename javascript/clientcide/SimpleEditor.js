/* <?php echo '*','/';

	$this->requires('clientcide/Element.Forms.js');
	$this->requires('clientcide/Element.Shortcuts.js');
	$this->requires('mootools/Class.Extras.js');
	$this->requires('clientcide/Clipboard.js');
	$this->requires('clientcide/String.Extras.js');

echo '/*';?> */

/*
Script: SimpleEditor.js
	A simple html editor for wrapping text with links and whatnot.

License:
	http://clientside.cnet.com/wiki/cnet-libraries#license
*/
var SimpleEditor = new Class({
	initialize: function(input, buttons, commands){
		this.commands = new Hash($extend(SimpleEditor.commands, commands||{}));
		this.input = $(input);
		this.buttons = $$(buttons);
		this.buttons.each(function(button){
			button.addEvent('click', function() {
				this.exec(button.get('rel'));
			}.bind(this));
		}.bind(this));
		this.input.addEvent('keydown', function(e){
			if (e.control||e.meta) {
				var key = this.shortCutToKey(e.key, e.shift);
				if(key) {
					e.stop();
					this.exec(key);
				}
			}
		}.bind(this));
		this.input.store('editor', this);
	},
	toElement: function(){
		return this.input;
	},
	shortCutToKey: function(shortcut, shift){
		var returnKey = false;
		this.commands.each(function(value, key){
			var char = (value.shortcut ? value.shortcut.toLowerCase() : value.shortcut);
			if(value.shortcut == shortcut || (shift && char == shortcut)) returnKey = key;
		});
		return returnKey;
	},
	addCommand: function(key, command, shortcut){
		this.commands.set(key, {
			command: command,
			shortcut: shortcut
		});
	},
	addCommands: function(commands){
		this.commands.extend(commands);
	},
	exec: function(key){
		var currentScrollPos; 
		if (this.input.scrollTop || this.input.scrollLeft) {
			currentScrollPos = {
				scrollTop: this.input.getScroll().y,
				scrollLeft: this.input.getScroll().x
			};
		}
		if(this.commands.has(key)) this.commands.get(key).command(this.input);
		if(currentScrollPos) {
			this.input.set('scrollTop', currentScrollPos.getScroll().y);
			this.input.set('scrollLeft', currentScrollPos.getScroll().x);
		}
	}
});
$extend(SimpleEditor, {
	commands: {},
	addCommand: function(key, command, shortcut){
		SimpleEditor.commands[key] = {
			command: command,
			shortcut: shortcut
		}
	},
	addCommands: function(commands){
		$extend(SimpleEditor.commands, commands);
	}
});
SimpleEditor.addCommands({
	bold: {
		shortcut: 'b',
		command: function(input){
			input.insertAroundCursor({before:'<b>',after:'</b>'});
		}
	},
	underline: {
		shortcut: 'u',
		command: function(input){
			input.insertAroundCursor({before:'<u>',after:'</u>'});
		}
	},
	anchor: {
		shortcut: 'l',
		command: function(input){
			function simpleLinker(){
				if(window.TagMaker){
					if(!this.linkBuilder) this.linkBuilder = new TagMaker.anchor();
					this.linkBuilder.prompt(input);
				} else {
					var href = window.prompt('The URL for the link');
					var opts = {before: '<a href="'+href+'">', after:'</a>'};
					if (!input.getSelectedText()) opts.defaultMiddle = window.prompt('The link text');
					input.insertAroundCursor(opts);
				}
			}
			try {
				if(Trinket) {
					if(!this.linkBulder){
						var lb = Trinket.available.filter(function(trinket){
							return trinket.name == 'Link Builder';
						});
						this.linkBuilder = (lb.length)?lb[0]:new Trinket.LinkBuilder({
							context: 'default'
						});
						this.linkBuilder.clickPrompt(input);
					}
				} else simpleLinker();
			} catch(e){ simpleLinker(); }
		}
	},
	copy: {
		shortcut: false,
		command: function(input){
			if(Clipboard) Clipboard.copyFromElement(input);
			else simpleErrorPopup('Woops', 'Sorry, this function doesn\'t work here; use ctrl+c.');
			input.focus();
		}
	},
	cut: {
		shortcut: false,
		command: function(input){
			if(Clipboard) {
				Clipboard.copyFromElement(input);
				input.insertAtCursor('');
			} else simpleErrorPopup('Woops', 'Sorry, this function doesn\'t work here; use ctrl+x.');
		}
	},
	hr: {
		shortcut: '-',
		command: function(input){
			input.insertAtCursor('\n<hr/>\n');
		}
	},
	img: {
		shortcut: 'g',
		command: function(input){
			if(window.TagMaker) {
				if(!this.anchorBuilder) this.anchorBuilder = new TagMaker.image();
				this.anchorBuilder.prompt(input);
			} else {
				input.insertAtCursor('<img src="'+window.prompt('The url to the image')+'" />');
			}
		}
	},
	stripTags: {
		shortcut: '\\',
		command: function(input){
			input.insertAtCursor(input.getSelectedText().stripTags());
		}
	},
	sup: {
		shortcut: false,
		command: function(input){
			input.insertAroundCursor({before:'<sup>', after: '</sup>'});
		}
	},
	sub: {
		shortcut: false,
		command: function(input){
			input.insertAroundCursor({before:'<sub>', after: '</sub>'});
		}
	},
	paragraph: {
		shortcut: 'enter',
		command: function(input){
			input.insertAroundCursor({before:'\n<p>\n', after: '\n</p>\n'});
		}
	},
	strike: {
		shortcut: 'k',
		command: function(input){
			input.insertAroundCursor({before:'<strike>',after:'</strike>'});
		}
	},
	italics: {
		shortcut: 'i',
		command: function(input){
			input.insertAroundCursor({before:'<i>',after:'</i>'});
		}
	},
	bullets: {
		shortcut: '8',
		command: function(input){
			input.insertAroundCursor({before:'<ul>\n	<li>',after:'</li>\n</ul>'});
		}
	},
	numberList: {
		shortcut: '=',
		command: function(input){
			input.insertAroundCursor({before:'<ol>\n	<li>',after:'</li>\n</ol>'});
		}
	},
	clean: {
		shortcut: false,
		command: function(input){
			input.tidy();
		}
	},
	preview: {
		shortcut: false,
		command: function(input){
			try {
				if(!this.container){
					this.container = new Element('div', {
						styles: {
							border: '1px solid black',
							padding: 8,
							height: 300,
							overflow: 'auto'
						}
					});
					this.preview = new StickyWin.Modal({
						content: StickyWin.ui("preview", this.container, {
							width: 600,
							buttons: [{
								text: 'close',
								onClick: function(){
									this.container.empty();
								}.bind(this)
							}]
						}),
						showNow: false
					});
				}
				this.container.set('html', input.get('value'));
				this.preview.show();
			} catch(e){dbug.log('you need StickyWin.Modal and StickyWin.ui')}
		}
	}
});