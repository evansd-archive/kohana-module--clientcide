/* <?php echo '*','/';

	$this->requires('mootools/Core.js');
	$this->requires('mootools/String.js');
	$this->requires('mootools/Number.js');
	$this->requires('mootools/Hash.js');
	$this->requires('mootools/Array.js');

echo '/*';?> */

/*
Script: Date.js
	Extends the Date native object to include methods useful in managing dates.

License:
	http://www.clientcide.com/wiki/cnet-libraries#license
*/

new Native({name: 'Date', initialize: Date, protect: true});
['now','parse','UTC'].each(function(method){
	Native.genericize(Date, method, true);
});
Date.$Methods = new Hash();
["Date", "Day", "FullYear", "Hours", "Milliseconds", "Minutes", "Month", "Seconds", "Time", "TimezoneOffset", 
	"Week", "Timezone", "GMTOffset", "DayOfYear", "LastMonth", "UTCDate", "UTCDay", "UTCFullYear",
	"AMPM", "UTCHours", "UTCMilliseconds", "UTCMinutes", "UTCMonth", "UTCSeconds"].each(function(method) {
	Date.$Methods.set(method.toLowerCase(), method);
});
$each({
	ms: "Milliseconds",
	year: "FullYear",
	min: "Minutes",
	mo: "Month",
	sec: "Seconds",
	hr: "Hours"
}, function(value, key){
	Date.$Methods.set(key, value);
});


Date.implement({
	set: function(key, value) {
		key = key.toLowerCase();
		var m = Date.$Methods;
		if (m.has(key)) this['set'+m.get(key)](value);
		return this;
	},
	get: function(key) {
		key = key.toLowerCase();
		var m = Date.$Methods;
		if (m.has(key)) return this['get'+m.get(key)]();
		return null;
	},
	clone: function() {
		return new Date(this.get('time'));
	},
	increment: function(interval, times) {
		return this.multiply(interval, times);
	},
	decrement: function(interval, times) {
		return this.multiply(interval, times, false);
	},
	multiply: function(interval, times, increment){
		interval = interval || 'day';
		times = $pick(times, 1);
		increment = $pick(increment, true);
		var multiplier = increment?1:-1;
		var month = this.format("%m").toInt()-1;
		var year = this.format("%Y").toInt();
		var time = this.get('time');
		var offset = 0;
		switch (interval) {
				case 'year':
					times.times(function(val) {
						if (Date.isLeapYear(year+val) && month > 1 && multiplier > 0) val++;
						if (Date.isLeapYear(year+val) && month <= 1 && multiplier < 0) val--;
						offset += Date.$units.year(year+val);
					});
					break;
				case 'month':
					times.times(function(val){
						if (multiplier < 0) val++;
						var mo = month+(val*multiplier);
						var year = year;
						if (mo < 0) {
							year--;
							mo = 12+mo;
						}
						if (mo > 11 || mo < 0) {
							year += (mo/12).toInt()*multiplier;
							mo = mo%12;
						}
						offset += Date.$units.month(mo, year);
					});
					break;
				case 'day':
					return this.set('date', this.get('date')+(multiplier*times));
				default:
					offset = Date.$units[interval]()*times;
					break;
		}
		this.set('time', time+(offset*multiplier));
		return this;
	},
	isLeapYear: function() {
		return Date.isLeapYear(this.get('year'));
	},
	clearTime: function() {
		['hr', 'min', 'sec', 'ms'].each(function(t){
			this.set(t, 0);
		}, this);
		return this;
	},
	diff: function(d, resolution) {
		resolution = resolution || 'day';
		if($type(d) == 'string') d = Date.parse(d);
		switch (resolution) {
			case 'year':
				return d.format("%Y").toInt() - this.format("%Y").toInt();
				break;
			case 'month':
				var months = (d.format("%Y").toInt() - this.format("%Y").toInt())*12;
				return months + d.format("%m").toInt() - this.format("%m").toInt();
				break;
			default:
				var diff = d.get('time') - this.get('time');
				if (diff < 0 && Date.$units[resolution]() > (-1*(diff))) return 0;
				else if (diff >= 0 && diff < Date.$units[resolution]()) return 0;
				return ((d.get('time') - this.get('time')) / Date.$units[resolution]()).round();
		}
	},
	getWeek: function() {
		var day = (new Date(this.get('year'), 0, 1)).get('date');
		return Math.round((this.get('dayofyear') + (day > 3 ? day - 4 : day + 3)) / 7);
	},
	getTimezone: function() {
		return this.toString()
			.replace(/^.*? ([A-Z]{3}).[0-9]{4}.*$/, '$1')
			.replace(/^.*?\(([A-Z])[a-z]+ ([A-Z])[a-z]+ ([A-Z])[a-z]+\)$/, '$1$2$3');
	},
	getGMTOffset: function() {
		var off = this.get('timezoneOffset');
		return ((off > 0) ? '-' : '+')
			+ Math.floor(Math.abs(off) / 60).zeroise(2)
			+ (off % 60).zeroise(2);
	},
	parse: function(str) {
		this.set('time', Date.parse(str));
		return this;
	},
	format: function(f) {
		f = f || "%x %X";
		if (!this.valueOf()) return 'invalid date';
		//replace short-hand with actual format
		if (Date.$formats[f.toLowerCase()]) f = Date.$formats[f.toLowerCase()];
		var d = this;
		return f.replace(/\%([aAbBcdHIjmMpSUWwxXyYTZ])/g,
			function($1, $2) {
				switch ($2) {
					case 'a': return Date.$days[d.get('day')].substr(0, 3);
					case 'A': return Date.$days[d.get('day')];
					case 'b': return Date.$months[d.get('month')].substr(0, 3);
					case 'B': return Date.$months[d.get('month')];
					case 'c': return d.toString();
					case 'd': return d.get('date').zeroise(2);
					case 'H': return d.get('hr').zeroise(2);
					case 'I': return ((d.get('hr') % 12) || 12);
					case 'j': return d.get('dayofyear').zeroise(3);
					case 'm': return (d.get('mo') + 1).zeroise(2);
					case 'M': return d.get('min').zeroise(2);
					case 'p': return d.get('hr') < 12 ? 'AM' : 'PM';
					case 'S': return d.get('seconds').zeroise(2);
					case 'U': return d.get('week').zeroise(2);
					case 'W': throw new Error('%W is not supported yet');
					case 'w': return d.get('day');
					case 'x': 
						var c = Date.$cultures[Date.$culture];
						//return d.format("%{0}{3}%{1}{3}%{2}".substitute(c.map(function(s){return s.substr(0,1)}))); //grr!
						return d.format('%' + c[0].substr(0,1) +
							c[3] + '%' + c[1].substr(0,1) +
							c[3] + '%' + c[2].substr(0,1).toUpperCase());
					case 'X': return d.format('%I:%M%p');
					case 'y': return d.get('year').toString().substr(2);
					case 'Y': return d.get('year');
					case 'T': return d.get('GMTOffset');
					case 'Z': return d.get('Timezone');
					case '%': return '%';
				}
				return $2;
			}
		);
	},
	setAMPM: function(ampm){
		ampm = ampm.toUpperCase();
		if (this.format("%H").toInt() > 11 && ampm == "AM") 
			return this.decrement('hour', 12);
		else if (this.format("%H").toInt() < 12 && ampm == "PM")
			return this.increment('hour', 12);
		return this;
	}
});

Date.prototype.compare = Date.prototype.diff;
Date.prototype.strftime = Date.prototype.format;

Date.$nativeParse = Date.parse;

$extend(Date, {
	$months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	$days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
	$daysInMonth: function(monthIndex, year) {
		if (Date.isLeapYear(year.toInt()) && monthIndex === 1) return 29;
		return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][monthIndex];
	},
	$epoch: -1,
	$era: -2,
	$units: {
		ms: function(){return 1},
		second: function(){return 1000},
		minute: function(){return 60000},
		hour: function(){return 3600000},
		day: function(){return 86400000},
		week: function(){return 608400000},
		month: function(monthIndex, year) {
			var d = new Date();
			return Date.$daysInMonth($pick(monthIndex,d.format("%m").toInt()), $pick(year,d.format("%Y").toInt())) * 86400000;
		},
		year: function(year){
			year = year || new Date().format("%Y").toInt();
			return Date.isLeapYear(year.toInt())?31622400000:31536000000;
		}
	},
	$formats: {
		db: '%Y-%m-%d %H:%M:%S',
		compact: '%Y%m%dT%H%M%S',
		iso8601: '%Y-%m-%dT%H:%M:%S%T',
		rfc822: '%a, %d %b %Y %H:%M:%S %Z',
		'short': '%d %b %H:%M',
		'long': '%B %d, %Y %H:%M'
	},
	
	isLeapYear: function(yr) {
		return new Date(yr,1,29).getDate()==29;
	},

	parseUTC: function(value){
		var localDate = new Date(value);
		var utcSeconds = Date.UTC(localDate.get('year'), localDate.get('mo'),
		localDate.get('date'), localDate.get('hr'), localDate.get('min'), localDate.get('sec'));
		return new Date(utcSeconds);
	},
	
	parse: function(from) {
		var type = $type(from);
		if (type == 'number') return new Date(from);
		if (type != 'string') return from;
		if (!from.length) return null;
		for (var i = 0, j = Date.$parsePatterns.length; i < j; i++) {
			var r = Date.$parsePatterns[i].re.exec(from);
			if (r) {
				try {
					return Date.$parsePatterns[i].handler(r);
				} catch(e) {
					dbug.log('date parse error: ', e);
					return null;
				}
			}
		}
		return new Date(Date.$nativeParse(from));
	},

	parseMonth: function(month, num) {
		var ret = -1;
		switch ($type(month)) {
			case 'object':
				ret = Date.$months[month.get('mo')];
				break;
			case 'number':
				ret = Date.$months[month - 1] || false;
				if (!ret) throw new Error('Invalid month index value must be between 1 and 12:' + index);
				break;
			case 'string':
				var match = Date.$months.filter(function(name) {
					return this.test(name);
				}, new RegExp('^' + month, 'i'));
				if (!match.length) throw new Error('Invalid month string');
				if (match.length > 1) throw new Error('Ambiguous month');
				ret = match[0];
		}
		return (num) ? Date.$months.indexOf(ret) : ret;
	},

	parseDay: function(day, num) {
		var ret = -1;
		switch ($type(day)) {
			case 'number':
				ret = Date.$days[day - 1] || false;
				if (!ret) throw new Error('Invalid day index value must be between 1 and 7');
				break;
			case 'string':
				var match = Date.$days.filter(function(name) {
					return this.test(name);
				}, new RegExp('^' + day, 'i'));
				if (!match.length) throw new Error('Invalid day string');
				if (match.length > 1) throw new Error('Ambiguous day');
				ret = match[0];
		}
		return (num) ? Date.$days.indexOf(ret) : ret;
	},
	
	fixY2K: function(d){
		if (!isNaN(d)) {
			var newDate = new Date(d);
			if (newDate.get('year') < 2000 && d.toString().indexOf(newDate.get('year')) < 0) {
				newDate.increment('year', 100);
			}
			return newDate;
		} else return d;
	},

	$cultures: {
		'US': ['month', 'date', 'year', '/'],
		'GB': ['date', 'month', 'year', '/']
	},

	$culture: 'US',
	
	$language: 'enUS',
	
	$cIndex: function(unit){
		return Date.$cultures[Date.$culture].indexOf(unit)+1;
	},

	$parsePatterns: [
		{
			//"12.31.08", "12-31-08", "12/31/08", "12.31.2008", "12-31-2008", "12/31/2008"
			re: /^(\d{1,2})[\.\-\/](\d{1,2})[\.\-\/](\d{2,4})$/,
			handler: function(bits){
				var d = new Date();
				var culture = Date.$cultures[Date.$culture];
				d.set('year', bits[Date.$cIndex('year')]);
				d.set('date', bits[Date.$cIndex('date')]);
				d.set('month', bits[Date.$cIndex('month')] - 1);
				return Date.fixY2K(d);
			}
		},
		//"12.31.08", "12-31-08", "12/31/08", "12.31.2008", "12-31-2008", "12/31/2008"
		//above plus "10:45pm" ex: 12.31.08 10:45pm
		{
			re: /^(\d{1,2})[\.\-\/](\d{1,2})[\.\-\/](\d{2,4})\s(\d{1,2}):(\d{1,2})(\w{2})$/,
			handler: function(bits){
				var d = new Date();
				d.set('year', bits[Date.$cIndex('year')]);
				d.set('date', bits[Date.$cIndex('date')]);
				d.set('month', bits[Date.$cIndex('month')] - 1);
				d.set('hr', bits[4]);
				d.set('min', bits[5]);
				d.set('ampm', bits[6]);
				return Date.fixY2K(d);
			}
		},
		{
			//"12.31.08 11:59:59", "12-31-08 11:59:59", "12/31/08 11:59:59", "12.31.2008 11:59:59", "12-31-2008 11:59:59", "12/31/2008 11:59:59"
			re: /^(\d{1,2})[\.\-\/](\d{1,2})[\.\-\/](\d{2,4})\s(\d{1,2}):(\d{1,2}):(\d{1,2})/,
			handler: function(bits) {
				var d = new Date();
				var culture = Date.$cultures[Date.$culture];
				d.set('year', bits[Date.$cIndex('year')]);
				d.set('date', bits[Date.$cIndex('date')]);
				d.set('month', bits[Date.$cIndex('month')] - 1);
				d.set('hours', bits[4]);
				d.set('minutes', bits[5]);
				d.set('seconds', bits[6]);
				return Date.fixY2K(d);
			}
		}
	]
});

Number.implement({
	zeroise: function(length) {
		return String(this).zeroise(length);
	}
});

String.implement({
	repeat: function(times) {
		var ret = [];
		for (var i = 0; i < times; i++) ret.push(this);
		return ret.join('');
	},
	zeroise: function(length) {
		return '0'.repeat(length - this.length) + this;
	}

});
