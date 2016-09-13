!function(global, factory) {
	if ( typeof module === "object" && typeof module.exports === "object" ) {
		module.export = (['jquery'], factory);
	} else {
		factory(global.jQuery);
	}
}(this, function($) {
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
		navId: 'tab-nav',
		navClass: 'tab-nav',
		navPosition: 'before',
		grouping: 'none'
	};

	var Tabs = function(element, options) {
		this.container = element;
		this.options = options;

		this.tabs = this.container.find(this.options.tabElem);
		this.heightArray = this.maxHeight(tabs);
		this.height = Math.max.apply(Math, this.heightArray);
		this.currentTab = this.options.activeTab;
		this.currentHeight = this.heightArray[this.currentTab - 1];
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
		var that = this;
		var nav = '<div id="' + this.options.navId + '" class="' + this.options.navClass + ' tabs-' + this.tabs.length + '"><ul class="clearfix">';

		this.tabs.each(function(index, tab) {
			// Start index from 1 not 0. Used to number tabs
			var index = index + 1;

			// add an incremental class to each tab
			$(tab).addClass('tab-' + index);

			// retreive the content for the nav text
			var navItemValue = (that.options.navSource) ? $.trim($(this).find(that.options.navSource ).text()) : index,
				navItemClass = '',
				activeClass = '';

			// hide source element content
			if (that.options.navSourceHide) {
				$(this).find(that.options.navSource).hide();
			}

			// add classes to the nav for first and last
			if (index === 1) {
				navItemClass = 'first';
			} else if ( index === that.tabs.length ) {
				navItemClass = 'last';
			} else {
				navItemClass = '';
			}

			//  add a class to the nav for the tab that is initially active
			if (index ===  that.options.activeTab) {
				activeClass = 'active';
			} else {
				activeClass = '';
			}

			nav = nav + '<li class="target-' + index + ' ' + navItemClass + ' ' + activeClass + '"><a href="#">' + navItemValue + '<span>&nbsp;</span></a></li>';

			if (index ===  that.options.activeTab) {
				$(this).addClass('active-tab');
			}

			// hide all but the initially active tab
			if (index !==  that.options.activeTab) {
				$( this ).hide();
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
		var that = this;

		$('#' + this.options.navId).delegate('a', 'click', function(event) {
			event.preventDefault();

			var tgt = parseInt(this.parentNode.className.match(/target-\d/).toString().match(/\d/));

			that.options.auto = false;

			that.container.find('.active').removeClass('active');

			$(this).parent().addClass('active');

			if (that.currentTab !== tgt) {
				that.contentControl(tgt);
			}
		});
	};

	Tabs.prototype.contentControl = function (tgt) {
		var nav = $('#' + this.options.navId);

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
	},

	Tabs.prototype.autoOn = function() {
		var that = this,
			tgt = this.currentTab + 1,
			cycleCount = 1,
			cycleInterval;

		cycleInterval = setInterval(function() {

			if (that.options.auto) {

				// If a number of cycles has been set
				if (that.options.cycles !== false) {

					if (cycleCount <= that.options.cycles) {

						if (tgt <= that.tabs.length) {
							that.contentControl(tgt);
							tgt++;
						} else {
							tgt = 1;
							cycleCount++;
						}

					} else {
						that.contentControl(1);
						clearInterval(cycleInterval);
					}

				} else {

					if (tgt <= that.tabs.length) {
						that.contentControl(tgt);
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
			this.tabs.slice(i, i + this.options.grouping ).wrapAll('<div class="tab"></div>');
		}
	}

	Tabs.prototype.maxHeight = function(tabs) {
		var heightArray = [];

		this.tabs.each(function() {
			heightArray.push($(this).outerHeight());
		});

		return heightArray;
	}

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