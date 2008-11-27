/* <?php echo '*','/';

	$this->requires('clientcide/FormValidator.js');

echo '/*';?> */

$extend(FormValidator.resources.enUS, {
	noSpace: 'There can be no spaces in this input.',
	reqChkByNode: 'No items are selected.',
	requiredChk: 'This field is required.',
	reqChkByName: 'Please select a {label}.',
	match: 'This field needs to match the {matchName} field',
	startDate: 'the start date',
	endDate: 'the end date',
	currendDate: 'the current date',
	afterDate: 'The date should be the same or after {label}.',
	beforeDate: 'The date should be the same or before {label}.',
	startMonth: 'Please select a start month',
	sameMonth: 'These two dates must be in the same month - you must change one or the other.'
});

FormValidator.addAllThese([
    ['validate-enforce-oncheck', {
        test: function(element, props) {
            if (element.checked) {
                (props.toEnforce || $(props.enforceChildrenOf).getElements('input, select, textarea')).map(function(item) {
                    FV.enforceField(item);
                });
            }
            return true;
        }
    }],
    ['validate-ignore-oncheck', {
        test: function(element, props) {
            if (element.checked) {
                (props.toIgnore || $(props.ignoreChildrenOf).getElements('input, select, textarea')).each(function(item) {
                    FV.ignoreField(item);
                    FV.resetField(item);
                });
            }
            return true;
        }
    }],
    ['validate-nospace', {
        errorMsg: function(){
			return FormValidator.getMsg('noSpace');
		},
        test: function(element, props) {
            return !element.get('value').test(/\s/);
        }
    }],
    ['validate-toggle-oncheck', {
        test: function(element, props) {
            var parentForm = element.getParent('form').retrieve('validator');
            var eleArr = props.toToggle || $(props.toToggleChildrenOf).getElements('input, select, textarea');
            if (!element.checked) {
                eleArr.each(function(item) {
                    parentForm.ignoreField(item);
                    parentForm.resetField(item);
                });
            } else {
				eleArr.each(function(item) {
					parentForm.enforceField(item);
				});
			}
            return true;
        }
    }],
    ['validate-reqchk-bynode', {
        errorMsg: function(){
			return FormValidator.getMsg('reqChkByNode');
		},
        test: function(element, props) {
            return ($(props.nodeId).getElements(props.selector || 'input[type=checkbox], input[type=radio]')).some(function(item){
                return item.checked;
            });
        }
    }],
    ['validate-required-check', {
        errorMsg: function(element, props) {
            return props.useTitle ? element.get('title') : FormValidator.getMsg('requiredChk');
        },
        test: function(element, props) {
            return !!element.checked;
        }
    }],
    ['validate-reqchk-byname', {
        errorMsg: function(element, props) {
            return FormValidator.getMsg('reqChkByName').substitute({label: props.label || element.get('type')});
        },
        test: function(element, props) {
            var grpName = props.groupName || element.get('name');
            var oneCheckedItem = $$(document.getElementsByName(grpName)).some(function(item, index){
                return item.checked;
            });
            var fv = element.getParent('form').retrieve('validator');
            if (oneCheckedItem && fv) fv.resetField(element);
            return oneCheckedItem;
        }
    }],
    ['validate-validate-match', {
        errorMsg: function(element, props) {
			return FormValidator.getMsg('match').substitute({matchName: props.matchName || $(props.matchInput).get('name')});
        }, 
        test: function(element, props){
            var eleVal = element.get('value');
            var matchVal = $(props.matchInput) && $(props.matchInput).get('value');
            return eleVal && matchVal ? eleVal == matchVal : true;
        }
    }],
    ['validate-after-date', {
        errorMsg: function(element, props) {
			return FormValidator.getMsg('afterDate').substitute({
				label: props.afterLabel || (props.afterElement ? FormValidator.getMsg('startDate') : FormValidator.getMsg('currentDate'))
			});
		},
        test: function(element, props) {
            var start = $(props.afterElement) ? Date.parse($(props.afterElement).get('value')) : new Date();
            var end = Date.parse(element.get('value'));
			return end && start ? end >= start : true;
        }
    }],
    ['validate-before-date', {
        errorMsg: function(element, props) {
			return FormValidator.getMsg('beforeDate').substitute({
				label: props.beforeLabel || (props.beforeElement ? FormValidator.getMsg('endDate') : FormValidator.getMsg('currentDate'))
			});
		},
        test: function(element, props) {
            var start = Date.parse(element.get('value'));
            var end = $(props.beforeElement) ? Date.parse($(props.beforeElement).get('value')) : new Date();
			return end && start ? end >= start : true;
        }
    }],
    ['validate-custom-required', {
        errorMsg: function(){
			return FormValidator.getMsg('required');
		},
        test: function(element, props) {
            return element.get('value') != props.emptyValue;
        }
    }],
    ['validate-same-month', {
        errorMsg: function(element, props) {
            var startMo = $(props.sameMonthAs) && $(props.sameMonthAs).get('value');
            var eleVal = element.get('value');
            if (eleVal != '') {
                if (!startMo) { return FormValidator.getMsg('startMonth');}
                else {
                    return FormValidator.getMsg('sameMonth');
                }
            }
        },
        test: function(element, props) {
            var d1 = Date.parse(element.get('value'));
            var d2 = Date.parse($(props.sameMonthAs) && $(props.sameMonthAs).get('value'));
            return d1 && d2 ? d1.format("%B") == d2.format("%B") : true;
        }
    }]
]);
