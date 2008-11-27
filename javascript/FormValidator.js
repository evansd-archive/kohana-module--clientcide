/* <?php echo '*','/';

	$this->requires('mootools/Class.Extras.js');
	$this->requires('clientcide/Element.Forms.js');
	$this->requires('mootools/Selectors.js');
	$this->requires('mootools/Element.Event.js');
	$this->requires('clientcide/dbug.js');
	$this->requires('mootools/Element.Style.js');
	$this->requires('mootools/JSON.js');
	$this->requires('clientcide/Date.js');

echo '/*';?> */

/*
Script: FormValidator.js
	A css-class based form validation system.

License:
	http://clientside.cnet.com/wiki/cnet-libraries#license
*/
var InputValidator = new Class({
	Implements: [Options],
	initialize: function(className, options){
		this.setOptions({
			errorMsg: 'Validation failed.',
			test: function(field){return true}
		}, options);
		this.className = className;
	},
	test: function(field){
		if($(field)) return this.options.test($(field), this.getProps(field));
		else return false;
	},
	getError: function(field){
		var err = this.options.errorMsg;
		if($type(err) == "function") err = err($(field), this.getProps(field));
		return err;
	},
	getProps: function(field){
		if($(field) && $(field).get('validatorProps')){
			try {
				return JSON.decode($(field).get('validatorProps'));
			}catch(e){ return {}}
		} else {
			return {}
		}
	}
});

var FormValidator = new Class({
	Implements:[Options, Events],
	options: {
		fieldSelectors:"input, select, textarea",
		ignoreHidden: true,
		useTitles:false,
		evaluateOnSubmit:true,
		evaluateFieldsOnBlur: true,
		evaluateFieldsOnChange: true,
		serial: true,
		warningPrefix: function(){
			return FormValidator.resources[FormValidator.language].warningPrefix || 'Warning: ';
		},
		errorPrefix: function(){
			return FormValidator.resources[FormValidator.language].errorPrefix || 'Error: ';
		}
//	onFormValidate: function(isValid, form){},
//	onElementValidate: function(isValid, field){}
	},
	initialize: function(form, options){
		this.setOptions(options);
		this.form = $(form);
		this.form.store('validator', this);
		this.warningPrefix = $lambda(this.options.warningPrefix)();
		this.errorPrefix = $lambda(this.options.errorPrefix)();

		if(this.options.evaluateOnSubmit) this.form.addEvent('submit', this.onSubmit.bind(this));
		if(this.options.evaluateFieldsOnBlur) this.watchFields();
	},
	toElement: function(){
		return this.form;
	},
	getFields: function(){
		return this.fields = this.form.getElements(this.options.fieldSelectors);
	},
	watchFields: function(){
		this.getFields().each(function(el){
				el.addEvent('blur', this.validateField.pass([el, false], this));
			if(this.options.evaluateFieldsOnChange)
				el.addEvent('change', this.validateField.pass([el, true], this));
		}, this);
	},
	onSubmit: function(event){
		if(!this.validate(event) && event) event.preventDefault();
		else this.reset();
	},
	reset: function() {
		this.getFields().each(this.resetField, this);
		return this;
	}, 
	validate: function(event) {
		var result = this.getFields().map(function(field) { 
			return this.validateField(field, true);
		}, this).every(function(v){ return v;});
		this.fireEvent('onFormValidate', [result, this.form, event]);
		return result;
	},
	validateField: function(field, force){
		if(this.paused) return true;
		field = $(field);
		var passed = !field.hasClass('validation-failed');
		var failed, warned;
		if (this.options.serial && !force) {
			failed = this.form.getElement('.validation-failed');
			warned = this.form.getElement('.warning');
		}
		if(field && (!failed || force || field.hasClass('validation-failed') || (failed && !this.options.serial))){
			var validators = field.className.split(" ").some(function(cn){
				return this.getValidator(cn);
			}, this);
			var validatorsFailed = [];
			field.className.split(" ").each(function(className){
				if (!this.test(className,field)) validatorsFailed.include(className);
			}, this);
			passed = validatorsFailed.length === 0;
			if (validators && !field.hasClass('warnOnly')){
				if(passed) {
					field.addClass('validation-passed').removeClass('validation-failed');
					this.fireEvent('onElementPass', field);
				} else {
					field.addClass('validation-failed').removeClass('validation-passed');
					this.fireEvent('onElementFail', [field, failed]);
				}
			}
			if(!warned) {
				var warnings = field.className.split(" ").some(function(cn){
					if(cn.test('^warn-') || field.hasClass('warnOnly')) 
						return this.getValidator(cn.replace(/^warn-/,""));
					else return null;
				}, this);
				field.removeClass('warning');
				var warnResult = field.className.split(" ").map(function(cn){
					if(cn.test('^warn-') || field.hasClass('warnOnly')) 
						return this.test(cn.replace(/^warn-/,""), field, true);
					else return null;
				}, this);
			}
		}
		return passed;
	},
	getPropName: function(className){
		return '__advice'+className;
	},
	test: function(className, field, warn){
		field = $(field);
		if(field.hasClass('ignoreValidation')) return true;
		warn = $pick(warn, false);
		if(field.hasClass('warnOnly')) warn = true;
		var isValid = true;
		if(field) {
			var validator = this.getValidator(className);
			if(validator && this.isVisible(field)) {
				isValid = validator.test(field);
				if(!isValid && validator.getError(field)){
					if(warn) field.addClass('warning');
					var advice = this.makeAdvice(className, field, validator.getError(field), warn);
					this.insertAdvice(advice, field);
					this.showAdvice(className, field);
				} else this.hideAdvice(className, field);
				this.fireEvent('onElementValidate', [isValid, field, className]);
			}
		}
		if(warn) return true;
		return isValid;
	},
	showAdvice: function(className, field){
		var advice = this.getAdvice(className, field);
		if(advice && !field[this.getPropName(className)] 
			 && (advice.getStyle('display') == "none" 
			 || advice.getStyle('visiblity') == "hidden" 
			 || advice.getStyle('opacity')==0)){
			field[this.getPropName(className)] = true;
			if(advice.reveal) advice.reveal();
			else advice.setStyle('display','block');
		}
	},
	hideAdvice: function(className, field){
		var advice = this.getAdvice(className, field);
		if(advice && field[this.getPropName(className)]) {
			field[this.getPropName(className)] = false;
			//if element.cnet.js is present, transition the advice out
			if(advice.dissolve) advice.dissolve();
			else advice.setStyle('display','none');
		}
	},
	isVisible : function(field) {
		if (!this.options.ignoreHidden) return true;
		while(field != document.body) {
			if($(field).getStyle('display') == "none") return false;
			field = field.getParent();
		}
		return true;
	},
	getAdvice: function(className, field) {
		return field.retrieve('advice-'+className);
	},
	makeAdvice: function(className, field, error, warn){
		var errorMsg = (warn)?this.warningPrefix:this.errorPrefix;
				errorMsg += (this.options.useTitles) ? field.title || error:error;
		var advice = this.getAdvice(className, field);
		if(!advice){
			var cssClass = (warn)?'warning-advice':'validation-advice';
			advice = new Element('div', {
				text: errorMsg,
				styles: { display: 'none' },
				id: 'advice-'+className+'-'+this.getFieldId(field)
			}).addClass(cssClass);
		} else{
			advice.set('html', errorMsg);
		}
		field.store('advice-'+className, advice);
		return advice;
	},
	insertAdvice: function(advice, field){
		//Check for error position prop
		var vProp = field.get('validatorProps');
		if (vProp) {
			var vp = JSON.decode(vProp);
			var msgPos = vp.msgPos;
		}
		//Build advice
		if (!msgPos) {
			switch (field.type.toLowerCase()) {
				case 'radio':
					var p = field.getParent().adopt(advice);
					break;
				default: 
					advice.inject($(field), 'after');
			};
		} else {
			$(msgPos).grab(advice);
		}
	},
	getFieldId : function(field) {
		return field.id ? field.id : field.id = "input_"+field.name;
	},
	resetField: function(field) {
		field = $(field);
		if(field) {
			var cn = field.className.split(" ");
			cn.each(function(className) {
				if(className.test('^warn-')) className = className.replace(/^warn-/,"");
				var prop = this.getPropName(className);
				if(field[prop]) this.hideAdvice(className, field);
				field.removeClass('validation-failed');
				field.removeClass('warning');
				field.removeClass('validation-passed');
			}, this);
		}
		return this;
	},
	stop: function(){
		this.paused = true;
		return this;
	},
	start: function(){
		this.paused = false;
		return this;
	},
	ignoreField: function(field, warn){
		field = $(field);
		if(field){
			this.enforceField(field);
			if(warn) field.addClass('warnOnly');
			else field.addClass('ignoreValidation');
		}
		return this;
	},
	enforceField: function(field){
		field = $(field);
		if(field) field.removeClass('warnOnly').removeClass('ignoreValidation');
		return this;
	}
});

FormValidator.resources = {
	enUS: {
		required:'This field is required.',
		minLength:'Please enter at least {minLength} characters (you entered {length} characters).',
		maxLength:'Please enter no more than {maxLength} characters (you entered {length} characters).',
		integer:'Please enter an integer in this field. Numbers with decimals (e.g. 1.25) are not permitted.',
		numeric:'Please enter only numeric values in this field (i.e. "1" or "1.1" or "-1" or "-1.1").',
		digits:'Please use numbers and punctuation only in this field (for example, a phone number with dashes or dots is permitted).',
		alpha:'Please use letters only (a-z) with in this field. No spaces or other characters are allowed.',
		alphanum:'Please use only letters (a-z) or numbers (0-9) only in this field. No spaces or other characters are allowed.',
		dateSuchAs:'Please enter a valid date such as {date}',
		dateInFormatMDY:'Please enter a valid date such as MM/DD/YYYY (i.e. "12/31/1999")',
		email:'Please enter a valid email address. For example "fred@domain.com".',
		url:'Please enter a valid URL such as http://www.google.com.',
		currencyDollar:'Please enter a valid $ amount. For example $100.00 .',
		oneRequired:'Please enter something for at least one of these inputs.',
		errorPrefix: 'Error: ',
		warningPrefix: 'Warning: '
	}
};
FormValidator.language = "enUS";
FormValidator.getMsg = function(key, language){
	return FormValidator.resources[language||FormValidator.language][key];
};

FormValidator.adders = {
	validators:{},
	add : function(className, options) {
		this.validators[className] = new InputValidator(className, options);
		//if this is a class
		//extend these validators into it
		if(!this.initialize){
			this.implement({
				validators: this.validators
			});
		}
	},
	addAllThese : function(validators) {
		$A(validators).each(function(validator) {
			this.add(validator[0], validator[1]);
		}, this);
	},
	getValidator: function(className){
		return this.validators[className];
	}
};
$extend(FormValidator, FormValidator.adders);
FormValidator.implement(FormValidator.adders);

FormValidator.add('IsEmpty', {
	errorMsg: false,
	test: function(element) { 
		if(element.type == "select-one"||element.type == "select")
			return !(element.selectedIndex >= 0 && element.options[element.selectedIndex].value != "");
		else
			return ((element.get('value') == null) || (element.get('value').length == 0));
	}
});

FormValidator.addAllThese([
	['required', {
		errorMsg: function(){
			return FormValidator.getMsg('required');
		},
		test: function(element) { 
			return !FormValidator.getValidator('IsEmpty').test(element); 
		}
	}],
	['minLength', {
		errorMsg: function(element, props){
			if($type(props.minLength))
				return FormValidator.getMsg('minLength').substitute({minLength:props.minLength,length:element.get('value').length });
			else return '';
		}, 
		test: function(element, props) {
			if($type(props.minLength)) return (element.get('value').length >= $pick(props.minLength, 0));
			else return true;
		}
	}],
	['maxLength', {
		errorMsg: function(element, props){
			//props is {maxLength:10}
			if($type(props.maxLength))
				return FormValidator.getMsg('maxLength').substitute({maxLength:props.maxLength,length:element.get('value').length });
			else return '';
		}, 
		test: function(element, props) {
			//if the value is <= than the maxLength value, element passes test
			return (element.get('value').length <= $pick(props.maxLength, 10000));
		}
	}],
	['validate-integer', {
		errorMsg: FormValidator.getMsg.pass('integer'),
		test: function(element) {
			return FormValidator.getValidator('IsEmpty').test(element) || /^-?[1-9]\d*$/.test(element.get('value'));
		}
	}],
	['validate-numeric', {
		errorMsg: FormValidator.getMsg.pass('numeric'), 
		test: function(element) {
			return FormValidator.getValidator('IsEmpty').test(element) || 
				/^-?(?:0$0(?=\d*\.)|[1-9]|0)\d*(\.\d+)?$/.test(element.get('value'));
		}
	}],
	['validate-digits', {
		errorMsg: FormValidator.getMsg.pass('digits'), 
		test: function(element) {
			return FormValidator.getValidator('IsEmpty').test(element) || (/^[\d() .:\-\+#]+$/.test(element.get('value')));
		}
	}],
	['validate-alpha', {
		errorMsg: FormValidator.getMsg.pass('alpha'), 
		test: function (element) {
			return FormValidator.getValidator('IsEmpty').test(element) ||  /^[a-zA-Z]+$/.test(element.get('value'))
		}
	}],
	['validate-alphanum', {
		errorMsg: FormValidator.getMsg.pass('alphanum'), 
		test: function(element) {
			return FormValidator.getValidator('IsEmpty').test(element) || !/\W/.test(element.get('value'))
		}
	}],
	['validate-date', {
		errorMsg: function(element, props) {
			if (Date.parse) {
				var format = props.dateFormat || "%x";
				return FormValidator.getMsg('dateSuchAs').substitute({date:new Date().format(format)});
			} else {
				return FormValidator.getMsg('dateInFormatMDY');
			}
		},
		test: function(element, props) {
			if(FormValidator.getValidator('IsEmpty').test(element)) return true;
			if (Date.parse) {
				var format = props.dateFormat || "%x";
				var d = Date.parse(element.get('value'));
				var formatted = d.format(format);
				if (formatted != "invalid date") element.set('value', formatted);
				return !isNaN(d);
			} else {
			var regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
			if(!regex.test(element.get('value'))) return false;
			var d = new Date(element.get('value').replace(regex, '$1/$2/$3'));
			return (parseInt(RegExp.$1, 10) == (1+d.getMonth())) && 
			(parseInt(RegExp.$2, 10) == d.getDate()) && 
			(parseInt(RegExp.$3, 10) == d.getFullYear() );
			}
		}
	}],
	['validate-email', {
		errorMsg: FormValidator.getMsg.pass('email'), 
		test: function (element) {
			return FormValidator.getValidator('IsEmpty').test(element) || /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(element.get('value'));
		}
	}],
	['validate-url', {
		errorMsg: FormValidator.getMsg.pass('url'), 
		test: function (element) {
			return FormValidator.getValidator('IsEmpty').test(element) || /^(https?|ftp|rmtp|mms):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i.test(element.get('value'));
		}
	}],
	['validate-currency-dollar', {
		errorMsg: FormValidator.getMsg.pass('currencyDollar'), 
		test: function(element) {
			// [$]1[##][,###]+[.##]
			// [$]1###+[.##]
			// [$]0.##
			// [$].##
			return FormValidator.getValidator('IsEmpty').test(element) ||  /^\$?\-?([1-9]{1}[0-9]{0,2}(\,[0-9]{3})*(\.[0-9]{0,2})?|[1-9]{1}\d*(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|(\.[0-9]{1,2})?)$/.test(element.get('value'));
		}
	}],
	['validate-one-required', {
		errorMsg: FormValidator.getMsg.pass('oneRequired'), 
		test: function (element) {
			var p = element.parentNode;
			return p.getElements('input').some(function(el) {
				if (['checkbox', 'radio'].contains(el.get('type'))) return el.get('checked');
				return el.get('value');
			});
		}
	}]
]);