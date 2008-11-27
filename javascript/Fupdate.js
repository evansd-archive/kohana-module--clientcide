/* <?php echo '*','/';

	$this->requires('mootools/Element.Event.js');
	$this->requires('clientcide/String.Extras.js');
	$this->requires('mootools/Request.HTML.js');
	$this->requires('clientcide/Waiter.js');

echo '/*';?> */

/*
Script: Fupdate.js
	Handles the basic functionality of submitting a form and updating a dom element with the result.

License:
	http://clientside.cnet.com/wiki/cnet-libraries#license
*/

var Fupdate = new Class({
	Implements: [Options, Events],
	options: {
		//onFailure: $empty,
		//onSuccess: #empty,
		requestOptions: {
			evalScripts: true,
			useWaiter: true
		},
		extraData: {},
		resetForm: true
	},
	initialize: function(form, update, options) {
		this.form = $(form);
		if (this.form.retrieve('fupdate')) return this.form.retrieve('fupdate');
		this.update = $(update);
		this.setOptions(options);
		this.makeRequest();
		if (this.options.resetForm) {
			this.request.addEvent('success', function(){
				$try(function(){ this.form.reset(); }.bind(this));
				if (window.OverText) OverText.update();
			}.bind(this));
		}
		this.addFormEvent();
		this.form.store('fupdate', this.form);
	},
	toElement: function(){
		return this.form;
	},
	makeRequest: function(){
		this.request = new Request.HTML($merge({
				url: this.form.get('action'),
				update: this.update,
				emulation: false,
				waiterTarget: this.form
		}, this.options.requestOptions)).addEvents({
			success: function(text, xml){
				this.fireEvent('success', [this.update, text, xml]);
			}.bind(this),
			failure: function(xhr){
				this.fireEvent('failure', xhr);
			}.bind(this)
		});
	},
	addFormEvent: function(){
		this.form.addEvent('submit', function(e){
			e.stop();
			var formData = unescape(this.form.toQueryString()).dedupeQs().parseQuery(false, false);
			var data = $H(this.options.extraData).combine(formData);
			this.request.send(unescape(data.toQueryString()));
		}.bind(this));
	}
});

String.implement({
	dedupeQs: function(){
		var result = $H({});
		this.split("&").each(function(pair){
			result.include(pair.split("=")[0], pair.split("=")[1]);
		});
		return result.toQueryString();
	}
});