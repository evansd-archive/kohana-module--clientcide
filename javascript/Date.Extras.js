/* <?php echo '*','/';

	$this->requires('clientcide/Date.js');

echo '/*';?> */

/*
Script: Date.Extras.js
	Extends the Date native object to include extra methods (on top of those in Date.js).

License:
	http://clientside.cnet.com/wiki/cnet-libraries#license
*/

["LastDayOfMonth", "Ordinal"].each(function(method) {
	Date.$Methods.set(method.toLowerCase(), method);
});

Date.implement({
	timeDiffInWords: function(){
		var relative_to = (arguments.length > 0) ? arguments[1] : new Date();
		return Date.distanceOfTimeInWords(this, relative_to);
	},
	getOrdinal: function() {
		var test = this.get('date');
		return (test > 3 && test < 21) ? 'th' : ['th', 'st', 'nd', 'rd', 'th'][Math.min(test % 10, 4)];
	},
	getDayOfYear: function() {
		return ((Date.UTC(this.getFullYear(), this.getMonth(), this.getDate() + 1, 0, 0, 0)
			- Date.UTC(this.getFullYear(), 0, 1, 0, 0, 0) ) / Date.$units.day());
	},
	getLastDayOfMonth: function() {
		var ret = this.clone();
		ret.setMonth(ret.getMonth() + 1, 0);
		return ret.getDate();
	}
});

Date.alias('timeDiffInWords', 'timeAgoInWords');

$extend(Date, {
	distanceOfTimeInWords: function(fromTime, toTime) {
		return Date.getTimePhrase(((toTime.getTime() - fromTime.getTime()) / 1000).toInt(), fromTime, toTime);
	},
	getTimePhrase: function(delta, fromTime, toTime) {
		var res = Date.$resources[Date.$language]; //saving bytes
		var getPhrase = function(){
			if (delta >= 0) {
				if (delta < 60) {
					return res.ago.lessThanMinute;
				} else if (delta < 120) {
					return res.ago.minute;
				} else if (delta < (45*60)) {
					delta = (delta / 60).round();
					return res.ago.minutes;
				} else if (delta < (90*60)) {
					return res.ago.hour;
				} else if (delta < (24*60*60)) {
					delta = (delta / 3600).round();
					return res.ago.hours;
				} else if (delta < (48*60*60)) {
					return res.ago.day;
				} else {
					delta = (delta / 86400).round();
					return res.ago.days;
				}
			}
			if (delta < 0) {
				delta = delta * -1;
				if (delta < 60) {
					return res.until.lessThanMinute;
				} else if (delta < 120) {
					return res.until.minute;
				} else if (delta < (45*60)) {
					delta = (delta / 60).round();
					return res.until.minutes;
				} else if (delta < (90*60)) {
					return res.until.hour;
				} else if (delta < (24*60*60)) {
					delta = (delta / 3600).round();
					return res.until.hours;
				} else if (delta < (48*60*60)) {
					return res.until.day;
				} else  {
					delta = (delta / 86400).round();
					return res.until.days;
				}
			}
		};
		return getPhrase().substitute({delta: delta});
	}
});

Date.$resources = {
	enUS: {
		ago: {
			lessThanMinute: 'less than a minute ago',
			minute: 'about a minute ago',
			minutes: '{delta} minutes ago',
			hour: 'about an hour ago',
			hours: 'about {delta} hours ago',
			day: '1 day ago',
			days: '{delta} days ago'
		},
		until: {
			lessThanMinute: 'less than a minute from now',
			minute: 'about a minute from now',
			minutes: '{delta} minutes from now',
			hour: 'about an hour from now',
			hours: 'about {delta} hours from now',
			day: '1 day from now',
			days: '{delta} days from now'
		}
	}
};

Date.$parsePatterns.extend([
	{
		// yyyy-mm-ddTHH:MM:SS-0500 (ISO8601) i.e.2007-04-17T23:15:22Z
		// inspired by: http://delete.me.uk/2005/03/iso8601.html
		re: /^(\d{4})(?:-?(\d{2})(?:-?(\d{2})(?:[T ](\d{2})(?::?(\d{2})(?::?(\d{2})(?:\.(\d+))?)?)?(?:Z|(?:([-+])(\d{2})(?::?(\d{2}))?)?)?)?)?)?$/,
		handler: function(bits) {
			var offset = 0;
			var d = new Date(bits[1], 0, 1);
			if (bits[2]) d.setMonth(bits[2] - 1);
			if (bits[3]) d.setDate(bits[3]);
			if (bits[4]) d.setHours(bits[4]);
			if (bits[5]) d.setMinutes(bits[5]);
			if (bits[6]) d.setSeconds(bits[6]);
			if (bits[7]) d.setMilliseconds(('0.' + bits[7]).toInt() * 1000);
			if (bits[9]) {
				offset = (bits[9].toInt() * 60) + bits[10].toInt();
				offset *= ((bits[8] == '-') ? 1 : -1);
			}
			//offset -= d.getTimezoneOffset();
			d.setTime((d * 1) + (offset * 60 * 1000).toInt());
			return d;
		}
	}, {
		//"today"
		re: /^tod/i,
		handler: function() {
			return new Date();
		}
	}, {
		//"tomorow"
		re: /^tom/i,
		handler: function() {
			return new Date().increment();
		}
	}, {
		//"yesterday"
		re: /^yes/i,
		handler: function() {
			return new Date().decrement();
		}
	}, {
		//4th, 23rd
		re: /^(\d{1,2})(st|nd|rd|th)?$/i,
		handler: function(bits) {
			var d = new Date();
			d.setDate(bits[1].toInt());
			return d;
		}
	}, {
		//4th Jan, 23rd May
		re: /^(\d{1,2})(?:st|nd|rd|th)? (\w+)$/i,
		handler: function(bits) {
			var d = new Date();
			d.setMonth(Date.parseMonth(bits[2], true), bits[1].toInt());
			return d;
		}
	}, {
		//4th Jan 2000, 23rd May 2004
		re: /^(\d{1,2})(?:st|nd|rd|th)? (\w+),? (\d{4})$/i,
		handler: function(bits) {
			var d = new Date();
			d.setMonth(Date.parseMonth(bits[2], true), bits[1].toInt());
			d.setYear(bits[3]);
			return d;
		}
	}, {
		//Jan 4th
		re: /^(\w+) (\d{1,2})(?:st|nd|rd|th)?,? (\d{4})$/i,
		handler: function(bits) {
			var d = new Date();
			d.setMonth(Date.parseMonth(bits[1], true), bits[2].toInt());
			d.setYear(bits[3]);
			return d;
		}
	}, {
		//Jan 4th 2003
		re: /^next (\w+)$/i,
		handler: function(bits) {
			var d = new Date();
			var day = d.getDay();
			var newDay = Date.parseDay(bits[1], true);
			var addDays = newDay - day;
			if (newDay <= day) {
				addDays += 7;
			}
			d.setDate(d.getDate() + addDays);
			return d;
		}
	}, {
		//4 May 08:12
		re: /^\d+\s[a-zA-z]..\s\d.\:\d.$/,
		handler: function(bits){
			var d = new Date();
			bits = bits[0].split(" ");
			d.setDate(bits[0]);
			var m;
			Date.$months.each(function(mo, i){
				if (new RegExp("^"+bits[1]).test(mo)) m = i;
			});
			d.setMonth(m);
			d.setHours(bits[2].split(":")[0]);
			d.setMinutes(bits[2].split(":")[1]);
			d.setMilliseconds(0);
			return d;
		}
	},
	{
		re: /^last (\w+)$/i,
		handler: function(bits) {
			return Date.parse('next ' + bits[0]).decrement('day', 7);
		}
	}
]);
