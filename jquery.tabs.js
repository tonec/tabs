(function(global, factory) {
	'use strict';

	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['jquery'], factory);
	} else if (typeof module === 'object' && module.exports) {
		// Node/CommonJS
		module.exports = function(global, jQuery) {
			if (jQuery === undefined) {
				if (typeof window !== 'undefined') {
					jQuery = require('jquery');
				} else {
					jQuery = require('jquery')(global);
				}
			}
			factory(jQuery);
			return jQuery;
		};
	} else {
		// Browser globals
		factory(jQuery);
	}
})(this, function($) {
	'use strict';

	// Default options
	var defaults = {
		tabElem: '.tab',
		activeTab: 1,
		navSource: undefined,
		navSourceHide: true,
		tabWidth: 'auto',
		auto: false,
		cycles: false,
		cycleSpeed: 2000,
		animateHeight: false,
		setHeight: false,
		navClass: 'tab-nav',
		navPosition: 'before',
		grouping: 'none'
	};

	var Tabs = function(element, options) {
		this.container = element;
		this.options = options;

		this.tabs = this.container.find(this.options.tabElem);
		this.heightArray = this.maxHeight(this.tabs);
		this.height = Math.max.apply(Math, this.heightArray);
		this.currentTab = this.options.activeTab;
		this.currentHeight = this.heightArray[this.currentTab - 1];
		this.navId = this.container.attr('id') + '-nav';
		this.hasNav = true;
	};

	Tabs.prototype = {

		constructor: Tabs,

		init: function() {

			// If tabs need to be grouped, do so
			if (this.options.grouping !== 'none') {
				this.prepareGrouping();
			}

			// Check whether a nav is needed 2 or more tabs only
			if (this.tabs.length <= 1) {
				this.hasNav = false;
			}

			// Add general styling to containing elements
			if (this.options.setHeight) {
				this.tabs.css('min-height', this.currentHeight);
			}
			this.container.find('.tabs').css('position', 'relative');
			this.tabs.css({'width': this.options.tabWidth});

			// Create the nav if required
			if (this.hasNav) {
				this.createNav();
			}

			// Initiate automatic tab cycling if enabled
			if (this.options.auto) {
				this.autoOn();
			}
		}
	};

	Tabs.prototype.createNav = function() {
		var _this = this;
		var nav = '';

		nav += '<div id="' + this.navId + '" class="' + this.options.navClass + ' tabs-' + this.tabs.length + '">';
		nav += '<ul class="clearfix">';

		this.tabs.each(function(index, tab) {
			// Start index from 1 not 0. Used to number tabs
			var tabIndex = index + 1;

			// add an incremental class to each tab
			$(tab).addClass('tab-' + tabIndex);

			// retreive the content for the nav text
			var navItemValue = (_this.options.navSource) ? $.trim($(this).find(_this.options.navSource).text()) : tabIndex;
			var navItemClass = '';
			var activeClass = '';

			// hide source element content
			if (_this.options.navSourceHide) {
				$(this).find(_this.options.navSource).hide();
			}

			// add classes to the nav for first and last
			if (tabIndex === 1) {
				navItemClass = 'first';
			} else if (tabIndex === _this.tabs.length) {
				navItemClass = 'last';
			} else {
				navItemClass = '';
			}

			//  add a class to the nav for the tab _this is initially active
			if (tabIndex ===  _this.options.activeTab) {
				activeClass = 'active';
			} else {
				activeClass = '';
			}

			nav += '<li class="target-' + tabIndex + ' ' + navItemClass + ' ' + activeClass + '">';
			nav += '<a href="#">' + navItemValue + '<span>&nbsp;</span></a>';
			nav += '</li>';

			if (tabIndex ===  _this.options.activeTab) {
				$(this).addClass('active-tab');
			}

			// hide all but the initially active tab
			if (tabIndex !==  _this.options.activeTab) {
				$(this).hide();
			}
		});

		nav = nav + '</ul></div>';

		// add the generated navigation to the page
		if (this.options.navPosition === 'after') {
			this.container.after(nav);
		} else {
			this.container.before(nav);
		}

		// force a redraw, required for ie
		setTimeout(function() {
			$('body').addClass('tabs-ininitiated');
		}, 1000);

		// Add click event to nav
		this.addNavEvents();
	};

	Tabs.prototype.addNavEvents = function() {
		var _this = this;

		$('#' + this.navId).delegate('a', 'click', function(event) {
			event.preventDefault();

			var tgt = parseInt(this.parentNode.className.match(/target-\d/).toString().match(/\d/));

			_this.options.auto = false;

			_this.container.find('.active').removeClass('active');

			$(this).parent().addClass('active');

			if (_this.currentTab !== tgt) {
				_this.contentControl(tgt);
			}
		});
	};

	Tabs.prototype.contentControl = function(tgt) {
		var nav = $('#' + this.navId);

		this.currentheight = this.heightArray[tgt - 1];

		this.currentTab = tgt;

		// animate height tab height if options is set
		if (this.options.animateHeight) {
			this.container.animate({'height': this.currentheight});
		}

		this.container.find('.active-tab').removeClass('active-tab').hide();
		this.container.find('.tab-' + tgt).addClass('active-tab').fadeIn();

		nav.find('.active').removeClass('active');
		nav.find('.target-' + tgt).addClass('active');
	};

	Tabs.prototype.autoOn = function() {
		var _this = this;
		var tgt = this.currentTab + 1;
		var cycleCount = 1;
		var cycleInterval;

		cycleInterval = setInterval(function() {

			if (_this.options.auto) {

				// If a number of cycles has been set
				if (_this.options.cycles !== false) {

					if (cycleCount <= _this.options.cycles) {

						if (tgt <= _this.tabs.length) {
							_this.contentControl(tgt);
							tgt++;
						} else {
							tgt = 1;
							cycleCount++;
						}

					} else {
						_this.contentControl(1);
						clearInterval(cycleInterval);
					}

				} else {

					if (tgt <= _this.tabs.length) {
						_this.contentControl(tgt);
						tgt++;
					} else {
						tgt = 1;
					}

				}

			} else {
				clearInterval(cycleInterval);
			}
		}, this.options.cycleSpeed);
	};

	Tabs.prototype.prepareGrouping = function() {

		for (var i = 0; i < this.tabs.length; i += this.options.grouping) {
			this.tabs.slice(i, i + this.options.grouping).wrapAll('<div class="tab"></div>');
		}

		this.tabs = this.container.find('.tab');
	};

	Tabs.prototype.maxHeight = function(tabs) {
		var heightArray = [];

		tabs.each(function() {
			heightArray.push($(this).outerHeight());
		});

		return heightArray;
	};

	// Create the jQuery plugin
	$.fn.tabs = function(options) {

		options = $.extend(true, {}, defaults, options);

		return this.each(function() {
			var $this = $(this);

			$this.data('tabs', new Tabs($this, options));
			$this.data().tabs.init();
		});
	};

	// Expose defaults and Constructor (allowing overriding of prototype methods for example)
	$.fn.tabs.defaults = defaults;
	$.fn.tabs.Plugin = Tabs;
});