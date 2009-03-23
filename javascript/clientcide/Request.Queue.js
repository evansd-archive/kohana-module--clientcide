/* <?php echo '*','/';

	$this->requires('mootools/Request.js');
	$this->requires('clientcide/Clientcide.js');

echo '/*';?> */

/*
Script: Request.Queue.js
	Controls several instances of Request and its variants to run only one request at a time.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
 */
Request.Queue = new Class({
	Implements: [Options, Events],
	Binds: ['attach', 'onRequest', 'onComplete', 'onCancel', 'onSuccess', 'onFailure', 'onException'],
	reqBinders: {},
	queue: [],
	options: {
/*	onRequestStart: $empty,
		onRequestEnd: $empty,
		onRequestSuccess: $empty,
		onRequestComplete: $empty,
		onRequestCancel: $empty,
		onRequestException: $empty,
		onRequestFailure: $empty, */
		stopOnFailure: true,
		autoAdvance: true,
		concurrent: 1,
		requests: {}
	},
	initialize: function(options){
		this.setOptions(options);
		this.requests = new Hash();
		this.addRequests(this.options.requests);
	},
	addRequest: function(name, request){
		this.requests.set(name, request);
		this.attach(name, request);
		return this;
	},
	addRequests: function(reqs){
		$each(reqs, function(v, k){
			this.addRequest(k, v);
		}, this);
		return this;
	},
	getName: function(req) {
		return this.requests.keyOf(req);
	},
	attach: function(name, req){
		if (req._groupSend) return this;
		['onRequest', 'onComplete', 'onCancel', 'onSuccess', 'onFailure', 'onException'].each(function(evt){
			this.reqBinders[name] = this.reqBinders[name] || {};
			this.reqBinders[name][evt] = function(){
				this[evt].apply(this, [name, req].extend(arguments));
			}.bind(this);
			req.addEvent(evt, this.reqBinders[name][evt]);
		}, this);
		req._groupSend = req.send;
		req.send = function(options){
			this.send(name, options);
			return req;
		}.bind(this);
		return this;
	},
	removeRequest: function(req) {
		var name = $type(req) == 'object' ? this.getName(req) : req;
		if (!name && $type(name) != 'string') return false;
		req = this.requests.get(name);
		if (!req) return false;
		['onRequest', 'onComplete', 'onCancel', 'onSuccess', 'onFailure', 'onException'].each(function(evt) {
			req.removeEvent(evt, this.reqBinders[name][evt]);
		}, this);
		req.send = req._groupSend;
		delete req._groupSend;
		return this;
	},
	getRunning: function(){
		var running = [];
		this.requests.each(function(req) {
			if (req.running) running.include(req);
		});
		return running;
	},
	isRunning: function(){ 
		return !!this.getRunning().length 
	},
	send: function(name, options) {
		var q;
		q = function(){
			this.requests.get(name)._groupSend(options);
			this.queue.erase(q);
		}.bind(this);
		q.name = name;
		if (this.getRunning().length >= this.options.concurrent || (this.error && this.options.stopOnFailure)) this.queue.push(q);
		else q();
		return this;
	},
	hasNext: function(name){
		if (!name) return !!this.queue.length;
		return !!this.queue.filter(function(q) { return q.name == name; }).length;
	},
	resume: function(){
		this.error = false;
		(this.options.concurrent - this.getRunning().length).times(this.runNext.bind(this));
		return this;
	},
	runNext: function(name){
		if (this.queue.length) {
			if (!name) {
				this.queue[0]();
			} else {
				var found;
				this.queue.each(function(q){
					if (!found && q.name == name) {
						found = true;
						q();
					}
				});
			}
		}
		return this;
	},
	clear: function(name){
		if (!name) {
			this.queue.empty();
		} else {
			this.queue = this.queue.map(function(q){
				if (q.name != name) return q;
				else return false;
			}).filter(function(q){ return q; });
		}
	},
	cancel: function(name) {
		this.requests.get(name).cancel();
		return this;
	},
	onRequest: function(){
		this.fireEvent('onRequest', arguments);
	},
	onComplete: function(){
		this.fireEvent('onComplete', arguments);		
	},
	onCancel: function(){
		if (this.options.autoAdvance && !this.error) this.runNext();
		this.fireEvent('onCancel', arguments);
	},
	onSuccess: function(){
		if (this.options.autoAdvance && !this.error) this.runNext();
		this.fireEvent('onSuccess', arguments);
	},
	onFailure: function(){
		this.error = true;
		if (!this.options.stopOnFailure && this.options.autoAdvance) this.runNext();
		this.fireEvent('onFailure', arguments);
	},
	onException: function(){
		this.error = true;
		if (!this.options.stopOnFailure && this.options.autoAdvance) this.runNext();
		this.fireEvent('onException', arguments);
	}
	
});