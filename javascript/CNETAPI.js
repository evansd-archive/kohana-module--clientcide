/* <?php echo '*','/';

	$this->requires('clientcide/JsonP.js');
	$this->requires('clientcide/dbug.js');

echo '/*';?> */

/*
Script: CNETAPI.js
	Defines CNETAPI and associated classes and methods.

License:
	http://clientside.cnet.com/wiki/cnet-libraries#license
*/
var CNETAPI = new Hash({
	register: function(applicationName, options) {
		CNETAPI.apps[applicationName] = $merge({
			//requestUrl: ...,
			//partTag: ....,
			//partKey: ....,
			apiUrl: 'http://api.cnet.com/restApi/v1.0',
			applicationName: applicationName
		}, options);
		var key = CNETAPI.apps[applicationName].partKey;
		if (key) CNETAPI.apps[applicationName].partKey = key.toString();
	},
	retrieve: function(applicationName) {
		return CNETAPI.apps[applicationName];
	},
	apps: {},
	Utils: {}
});
CNETAPI.register('default');

CNETAPI.Utils.Base = new Class({
	Implements: [Options, Events],
	options: {
		applicationName: 'default',
		jsonpOptions: {
			data: {
				viewType : 'json'
			}
		},
/*	onComplete: $empty,
		onSuccess: $empty,
		onError: $empty, */
		instantiateResults: false,
		resultClass: null,
		errorPath: 'CNETResponse.Error.ErrorMessage.$'
	},
	//easyToUseObjectBuilder : null,
	//apiObjectBuilder : null,
	//packageResults : null,

	initialize : function(options){
		var data = {};
		this.app = (options && options.applicationName)
							 ?CNETAPI.retrieve(options.applicationName)
							 :CNETAPI.retrieve(this.options.applicationName);
		if (this.app.partKey) data.partKey = this.app.partKey;
		if (this.app.partTag) data.partTag = this.app.partTag;
		this.setOptions($merge({
			jsonpOptions: {
				data: data
			}
		}, options));
	},
	//internal
	//gets the query class; defaults to JSONP
	//url - url to hit for data
	//data - key/value options to pass in the query
	getQuery: function(url, options){
		options.data = options.data||{};
		$each(options.data, function(val, key) { 
			options.data[key] = $type(val)=="string"?unescape(val):val; 
		});
		if (this.app.requestUrl) {
			var qs = Hash.toQueryString(options.data);
			options.data = { cnetApiRequest: escape(url+"?"+qs) };
			url = this.app.requestUrl;
		}
		var j = new JsonP(url||"", options);
		return j;
	},
	//internal
	//attempts to return the title of an object
	//data - the object to inspect for the title
	//key - the key or object to look for the $ property
/*		checkDefined : function (returnObject, data, key){
			if(data[key] && data[key].$) return data[key].$ || "";
			return key.$ || "";
	},	*/
	//internal
	//packages up results into a shallow array of results
	//results - the results from the CNET API
	packer : function(results){
		if($type(results) == "array") results = results.filter(function(result){return result});
		else if (results) results = [results];
		else results = [];
		if(this.options.instantiateResults && this.options.resultClass) {
			return results.map(function(obj){
				return new this.options.resultClass(obj);
			}, this);
		} else {
			return results;
		}
	},
	//internal
	//allows you to get food.fruit.apples.red if you have the string "fruit.apples.red"
	//getMemberByPath(food, "fruit.apples.red")
	getMemberByPath: function(obj, path){
		if (path === "" || path == "top" || !path) return obj;
		var member = obj;
		path.split(".").each(function(p){
			if (p === "") return;
			if (member[p]) member = member[p];
			else member = obj;
		}, this);
		return (member == obj)?false:member;	
	},
	//internal
	//handles returned results from the CNET API
	//obj - the json object returned
	handleApiResults : function(obj, path){
		//deal with server error
		var error = this.getMemberByPath(obj, this.options.errorPath);
		return (error) ? error : this.getMemberByPath(obj, path);
		//if the container is specified
	},
	//internal
	//executes a request to the API service
	//jsonData - object passed to jsonp, merged with the data in this.options.jsonpOptions (view & partner key by default)
	//urlSuffix - suffix added to the api url defined in the options
	//path - path to the desired data in the object returned; ex: CNETResponse.TechProducts.TechProduct
	request: function(jsonData, urlSuffix, path){
		var jsonpOptions = $merge(this.options.jsonpOptions, {
				data : jsonData
		});
		var query = this.getQuery(this.app.apiUrl + urlSuffix, jsonpOptions);
		query.addEvent('onComplete',  function(results){
			results = this.handleApiResults(results, path);
			if ($type(results) == "string") {
				dbug.log('CNET API Error: ', results);
				this.fireEvent('onError', [results, query, this]);
			} else {
				this.fireEvent('onSuccess', [this.packer(results), query, this]);
			}
			this.fireEvent('onComplete', [this.packer(results), query, this]);
		}.bind(this));
		query.request();
		return this;
	},
/*	internal
		Throws a javascript error.
		
		Arguments:
		msg - (string) the message for the user
*/
	throwErr: function(msg){
		// Create an object type UserException
		function err (message)
		{
		  this.message=message;
		  this.name="CNETAPI.Utils Exception:";
		};
		
		// Make the exception convert to a pretty string when used as
		// a string (e.g. by the error console)
		err.prototype.toString = function ()
		{
		  return this.name + ': "' + this.message + '"';
		};
		
		// Create an instance of the object type and throw it
		throw new err(msg);
	}
});


CNETAPI.Object = new Class({
	Implements: [Options, Events, Chain],
	options: {
		applicationName: 'default',
		extraLookupData: {},
		type: ""
/*	onSuccess: $empty,
		onError: $empty, */
	},
	ready: false,
	initialize: function(item, options) {
		this.setOptions(options);
		this.app = CNETAPI.retrieve(this.options.applicationName);
		this.type = this.options.type;
		item = ($type(item) == "array" && item.length == 1)?item[0]:item;
		if (!item) return;
		if($type(item) == "object") this.parseData(item);
		else if ($type(item) == "number") this.get(item);
		return;
	},
/*	Property: get
		Gets an item from the CNETAPI.
		
		Arguments
		id - (integer) the object id of the object	*/
	get: function(id){
		try {
			this.makeLookup().get(id);
		} catch(e){
			var msg = 'Error: error on GET: ';
			dbug.log(msg, e);
			this.fireEvent('onError', msg + e.message);
		}
		return this;
	},
	process: function(obj){
		var data = {};
		$H(obj).each(function(value, key) {
			key = this.cleanKey(key);
			switch ($type(value)) {
				case "array":
					data[key] = value.map(function(v) {
						return this.clean(v, key, key);
					}, this);
					break;
				default:
					data[key] = this.clean(value, key, key);
			};
		}, this);
		return data;
	},
	cleanKey: function(key){
		return ($type(key) == "string" && key.test("^@"))?key.substring(1):key;
	},
	clean: function(value, name, path) {
		switch($type(value)) {
			case "string":
				if(value == "false") value = false;
				if(value == "true") value = true;
				if($chk(Number(value))) value = Number(value);
				return value;
			case "function":
				return value;
			case "array":
				return value.map(function(v, i) {
					return this.clean(v, i, path+'.'+name);
				}, this);
				break;
			default:
				var vhash = $H(value);
				if(value.$ && vhash.length == 1) {
					return value.$;
				} else {
					var cleaned = {};
					vhash.each(function(value, key){
						key = this.cleanKey(key);
						if($type(value) == "object" && value.$ && key.test("url", "i") && value.$.test("restApi")) {
							cleaned.walk = cleaned.walk || {};
							//TODO: implement a follow method
							//cleaned.walk[key] = this.follow.pass([value.$, key, path], this);
						}
						cleaned[key] = this.clean(value, key, path+'.'+name);
					}, this);
					return cleaned;
				}
			}
		return this;
	},
	makeLookup: function(){
		return new CNETAPI.Utils[this.options.type]($merge(this.options.extraLookupData, {
			instantiateResults: false,
			onError: this.handleError.bind(this),
			onSuccess: this.parseData.bind(this),
			applicationName: this.app.applicationName
		}));
	},
	handleError: function(msg){
		this.fireEvent('onError', msg);
	},
	parseData: function(data){
		data = ($type(data) == "array" && data.length == 1)?data[0]:data;
		this.json = data;
		this.data = this.process(data);
		this.ready = true;
		this.callChain();
		this.fireEvent('onSuccess', [this, this.data, this.json]);
	}
});

CNETAPI.TechProduct = new Class({
	Extends: CNETAPI.Object,
	options: {
		type: "TechProduct"
	}
});

CNETAPI.SoftwareProduct = new Class({
	Extends: CNETAPI.Object,
	options: {
		type: "SoftwareProduct"
	},
	getSet: function(id) {
		try {
			this.makeLookup().getSet(id);
		} catch(e){
			var msg = 'Error: error on getSet: ';
			dbug.log(msg, e);
			this.fireEvent('onError', msg + e.message);
		}
		return this;
	}
});

CNETAPI.Category = new Class({
	Extends: CNETAPI.Object,
	options: {
		type: "Category",
		siteId: null
	},
	initialize: function(item, options) {
		this.children = [];
		if (options) this.setSiteId(options.siteId);
		this.parent(item, options);
	},
	setSiteId: function(id) {
		this.setOptions({
			extraLookupData: {
				siteId: $chk(id)?id:this.options.siteId
			}
		});
		return this.options.extraLookupData.siteId;
	},
	getChildren: function(options, data){
		var onSuccess = function(data) {
			this.children = data.map(function(d){
				d.options.siteId = siteId;
				return d;
			});
			this.callChain();
		}.bind(this);
		if (this.data.isLeaf) {
			onSuccess([]);
			return this;
		}
		options = options || {};
		var siteId = this.setSiteId(options.siteId);
		if(!$chk(siteId)) {
			var msg = 'Error: you must supply a site id for category lookups.';
			dbug.log(msg);
			this.fireEvent('onError', msg);
			return null;
		} else if(this.data.id) {
			var util = new CNETAPI.Utils[this.options.type]($merge({
					instantiateResults: true,
					resultClass: CNETAPI.Category,
					applicationName: this.app.applicationName
				}, options)).addEvent('onSuccess', onSuccess);
			util.getChildren(this.data.id, $merge(this.options.extraLookupData, data||{}));
			return this;
		} else {
			return null;
		}
		return this;
	}
});

CNETAPI.NewsStory = new Class({
	Extends: CNETAPI.Object,
	options: {
		type: "NewsStory"
	}
});

CNETAPI.NewsGallery = new Class({
	Extends: CNETAPI.Object,
	options: {
		type: "NewsGallery"
	}
});

/*	Class: CNETAPI.BlogEntry
		Extends <CNETAPI.Object> for type BlogEntry	*/
CNETAPI.BlogEntry = CNETAPI.Object.extend({
	options : {
		type: "BlogEntry"
	}
});

/*	Class: CNETAPI.Video
		Extends <CNETAPI.Object> for type Video	*/
CNETAPI.Video = CNETAPI.Object.extend({
	options : {
		type: "Video"
	}
});


/*	Class: CNETAPI.ImageGallery
		Extends <CNETAPI.Object> for type ImageGallery	*/
CNETAPI.ImageGallery = CNETAPI.Object.extend({
	options : {
		type: "ImageGallery"
	}
});


CNETAPI.Utils.SearchPaths = {
	TechProduct: "/techProductSearch",
	NewsGallery: "/newsGallerySearch",
	NewsStory: "/newsStorySearch",
	SoftwareProduct: "/softwareProductSearch",
	BlogEntry : "/blogEntrySearch",
	Video: "/videoSearch",
	ImageGallery: "/imageGallerySearch"
};



// Individual Implementations for each API Request type
CNETAPI.Utils.TechProduct = new Class({
	Extends: CNETAPI.Utils.Base,
	options: {
		resultClass: CNETAPI.TechProduct,
		instantiateResults: true,
		searchPath: CNETAPI.Utils.SearchPaths['TechProduct']
	},
	search : function(queryTerm, data){
		return this.request($merge({query: queryTerm}, data), this.options.searchPath, "CNETResponse.TechProducts.TechProduct");
	},
	get : function(id, data){
		return this.request($merge({productId: id}, data), "/techProduct", "CNETResponse.TechProduct");
	},
	getMany: function(ids, data) {
		return this.request($merge({productIds: ids}, data), "/techProduct", "CNETResponse.TechProducts.TechProduct");
	}
});

CNETAPI.Utils.SoftwareProduct = new Class({
	Extends: CNETAPI.Utils.Base,
	options: {
		resultClass: CNETAPI.SoftwareProduct,
		instantiateResults: true,
		searchPath: CNETAPI.Utils.SearchPaths['SoftwareProduct']
	},
	search : function(queryTerm, data){
		return this.request($merge({query: queryTerm}, data), this.options.searchPath, "CNETResponse.SoftwareProducts.SoftwareProduct");
	},
	getSet : function(id, data){
		return this.request($merge({productSetId: id}, data), "/softwareProduct", "CNETResponse.SoftwareProduct");
	},
	get: function(id, data) {
		return this.request($merge({productId: id}, data), "/softwareProduct", "CNETResponse.SoftwareProduct");
	},
	getMany: function(ids, data) {
		return this.request($merge({productIds: ids}, data), "/softwareProduct", "CNETResponse.SoftwareProducts.SoftwareProduct");
	},
	getManySets: function(ids, data) {
		return this.request($merge({productSetIds: ids}, data), "/softwareProduct", "CNETResponse.SoftwareProducts.SoftwareProducts");
	}
});

CNETAPI.Utils.NewsStory = new Class({
	Extends: CNETAPI.Utils.Base,
	options: {
		resultClass: CNETAPI.NewsStory,
		instantiateResults: true,
		searchPath: CNETAPI.Utils.SearchPaths['NewsStory']
	},
	search : function(queryTerm, data){
		return this.request($merge({query: queryTerm}, data), this.options.searchPath, "CNETResponse.NewsStories.NewsStory");
	},
	get: function(id, data){
		return this.request($merge({storyId: id}, data), "/newsStory", "CNETResponse.NewsStory");
	},
	getMany: function(ids, data) {
		return this.request($merge({storyIds: ids}, data), "/newsStory","CNETResponse.NewsStories.NewsStory");
	}
});

CNETAPI.Utils.BlogEntry = new Class({
	Extends: CNETAPI.Utils.Base,
	options: {
		resultClass: CNETAPI.BlogEntry,
		instantiateResults: true,
		searchPath: CNETAPI.Utils.SearchPaths['BlogEntry']
	},
	search : function(queryTerm, data){
		return this.request($merge({query: queryTerm}, data), this.options.searchPath, "CNETResponse.BlogEntries.BlogEntry");
	},
	get: function(id, data){
		return this.request($merge({blogEntryId: id}, data), "/blogEntry", "CNETResponse.BlogEntries.BlogEntry");
	},
	getMany: function(ids, data) {
		return this.request($merge({blogEntryIds: ids}, data), "/blogEntry", "CNETResponse.BlogEntries.BlogEntry");
	}
});

CNETAPI.Utils.NewsGallery = new Class({
	Extends: CNETAPI.Utils.Base,
	options: {
		resultClass: CNETAPI.NewsGallery,
		instantiateResults: true,
		searchPath: CNETAPI.Utils.SearchPaths['NewsGallery']
	},
	search : function(queryTerm, data){
		return this.request($merge({query: queryTerm}, data), this.options.searchPath, "CNETResponse.NewsGalleries.NewsGallery");
	},
	get: function(id, data){
		return this.request($merge({galleryId: id}, data), "/newsGallery", "CNETResponse.NewsGallery");
	},
	getMany: function(ids, data) {
		return this.request($merge({galleryIds: ids}, data), "/newsGallery", "CNETResponse.NewsGalleries.NewsGallery");
	}
});

CNETAPI.Utils.Category = new Class({
	Extends: CNETAPI.Utils.Base,
	options: {
		resultClass: CNETAPI.Category,
		instantiateResults: true,
		siteId: null,
		searchPath: CNETAPI.Utils.SearchPaths['TechProduct']
	},
	packer: function(results){
		results = this.parent(results);
		return results.map(function(cat){
			cat.options.siteId = this.options.siteId;
			return cat;
		}, this);
	},
	get: function(id, data){
		data = data||{};
		data.siteId = data.siteId || this.options.siteId;
		if(!$chk(data.siteId)) {
			dbug.log("You must supply a site id for category lookups");
			this.throwErr("You must supply a site id for category lookups");
		}
		this.options.siteId = data.siteId;
		return this.request($merge({categoryId: id}, data), "/category", "CNETResponse.Category");
	},
	getMany: function(ids, data) {
		return this.request($merge({categoryIds: ids}, data), "/category", "CNETResponse.Categories.Category");
	},
	getChildren: function(id, data){
		data = data||{};
		data.siteId = data.siteId || this.options.siteId;
		if(!$chk(data.siteId)) {
			dbug.log("You must supply a site id for category lookups");
			this.throwErr("You must supply a site id for category lookups");
		}
		return this.request($chk(id)?$merge({categoryId: id}, data):data, "/childCategories", "CNETResponse.ChildCategories.Category");
	},
	search : function(queryTerm, type, data){
		data = $merge({
			results: 1,
			iod:'relatedCats'
		}, data);
		return this.request($merge({query: queryTerm}, data), type||this.options.searchPath, "CNETResponse.RelatedCategories");
	}
});

/*	Class: CNETAPI.Utils.Video
		Contains methods for getting video  from the CNET API.
	*/
CNETAPI.Utils.Video = CNETAPI.Utils.Base.extend({
		options: {
			resultClass: CNETAPI.Video,
			instantiateResults: true,
			searchPath: CNETAPI.Utils.SearchPaths['Video']
		},
/*	Property: search
		Retrieves a list of items based on a search string.

		Arguments:
		queryTerm - (string) required; the query to search on
		data - (object) optional data passed on to JsonP.options.data. The data object will already contain query, partKey, and view.
	*/
		search : function(queryTerm, data){
			return this.request($merge({query: queryTerm}, data), this.options.searchPath, "CNETResponse.Videos.Video");
		},
/*	Property: get
		Gets an individual video from the CNET API.

		Arguments:
		id - (integer) the video id to retrieve
		data - (object) optional data passed on to JsonP.options.data. The data object will already contain video id, partKey, and view.
	*/
		get: function(id, data){
			return this.request($merge({videoId: id}, data), "/video", "CNETResponse.Video");
		},
/*	Property: getMany
		Gets numerous videos with the ids passed in.

		Arguments:
		pids - (array of integers) a list of pids to look up.
		data - (object) optional data passed on to JsonP.options.data. The data object will already contain blogEntryIds, partKey, and view.
	*/
		getMany: function(ids, data) {
				return this.request($merge({videoIs: ids}, data), "/video", "CNETResponse.Videos.Video");
		}
});


/*	Class: CNETAPI.Utils.ImageGallery
		Contains methods for getting video  from the CNET API.
	*/
CNETAPI.Utils.ImageGallery = CNETAPI.Utils.Base.extend({
		options: {
			resultClass: CNETAPI.ImageGallery,
			instantiateResults: true,
			searchPath: CNETAPI.Utils.SearchPaths['ImageGallery']
		},
/*	Property: search
		Retrieves a list of items based on a search string.

		Arguments:
		queryTerm - (string) required; the query to search on
		data - (object) optional data passed on to JsonP.options.data. The data object will already contain query, partKey, and view.
	*/
		search : function(queryTerm, data){
			return this.request($merge({query: queryTerm}, data), this.options.searchPath, "CNETResponse.ImageGalleries.ImageGallery");
		},
/*	Property: get
		Gets an individual image gallery from the CNET API.

		Arguments:
		id - (integer) the image gallery id to retrieve
		data - (object) optional data passed on to JsonP.options.data. The data object will already contain image gallery id, partKey, and view.
	*/
		get: function(id, data){
			return this.request($merge({galleryId: id}, data), "/imageGallery", "CNETResponse.ImageGallery");
		},
/*	Property: getMany
		Gets numerous videos with the ids passed in.

		Arguments:
		pids - (array of integers) a list of pids to look up.
		data - (object) optional data passed on to JsonP.options.data. The data object will already contain blogEntryIds, partKey, and view.
	*/
		getMany: function(ids, data) {
				return this.request($merge({galleryIds: ids}, data), "/imageGallery", "CNETResponse.ImageGalleris.ImageGallery");
		}
});
