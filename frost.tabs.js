/*

OVERVIEW
========

Add tabs with a custom nav and slideshow functionality.

REQUIREMENTS
============

This plugin makes certain assumptions about the HTML that it is invoked on; the
HTML must look something like:

<div id="tabs">
	<div class="tabs">

		<div class="tab">

			<!-- Tab content... -->
			
		</div>

		<div class="tab">

			<!-- Tab content... -->

		</div>

	</div>
</div>

OPTIONS
=======

The following options are available - the values shown below are the defaults.

tabElem : '.tab' - individual tab element selector.
activeTab : 1 - the initial active tab
navSource : '.mb-tag' - the selector which contains the nav source copy
navSourceHide : true - hide the nav source copy once extracted for use in the nav
tabWidth : 225 - the tabs width
auto : false - set to true to make the tabs cycle through automatically
cycles : false - the number of times the tabs should cycle on auto. Leave as false to cycle infinitely, or enter a number.
cycleSpeed : 2000 - the automatic cycle speed in milliseconds.
animateHeight : false,
navId : 'tab-nav' - id applied to the navigation container. Change if page has multiple tab instances.
navClass : 'tab-nav' - class applied to navigation container. Change if different class name required.
navPosition : 'before' or 'after' - change placement of the navigation insertion.
grouping : 'none' - Use to group what would otherwise be individual tabs into a single tab

DEPENDENCIES
============


EXAMPLE
=======

$('#tabs').frTabs({
	tabElem : '.tab',
	activeTab : 2,
	navSource : '.tab h2',
	navSourceHide : false,
	tabWidth : 500,
	auto : true,
	cycles : 1,
	cycleSpeed : 5000
});

*/


(function ( $ ) {

	$.fn.frTabs = function( options ) {

		// Default options
		$.fn.frTabs.defaults = {
			tabElem : '.tab',
			activeTab : 1,
			navSource : undefined,
			navSourceHide : true,
			tabWidth : 'auto',
			auto : false,
			cycles : false,
			cycleSpeed : 2000,
			animateHeight : false,
			setHeight : false,
			navId : 'tab-nav',
			navClass : 'tab-nav',
			navPosition : 'before',
			grouping : 'none'
		};

		// override default options with any provided
		options = $.extend( {}, $.fn.frTabs.defaults, options );

		var container = this,
			tabs = container.find( options.tabElem ),
			heightArray = maxHeight( tabs ),
			height = Math.max.apply( Math, heightArray  ),
			tabIndex = 1,
			currentTab = options.activeTab,
			currentHeight = heightArray[ currentTab - 1 ],
			hasNav = true;

		(function init() {

			// If tabs need to be grouped, do so
			if ( options.grouping !== 'none' ) prepareGrouping();

			// Check whether a nav is needed 2 or more tabs only
			if ( tabs.length <= 1 ) hasNav = false;

			// Add general styling to containing elements
			if ( options.setHeight ) tabs.css( 'min-height', currentHeight );
			container.find( '.tabs' ).css( 'position', 'relative' );
			tabs.css({ 'width' : options.tabWidth });
			
			// Create the nav if required
			if ( hasNav ) createNav();

			// Initiate automatic tab cycling if enabled
			if ( options.auto ) autoOn();

		})();

		function createNav ( ) {

			var nav = '<div id="' + options.navId + '" class="' + options.navClass + ' tabs-' + tabs.length + '"><ul class="clearfix">';

			tabs.each(function(){

				// add an incremental class to each tab
				$( this ).addClass( 'tab-' + tabIndex );

				// retreive the content for the nav text
				var navItemValue = ( options.navSource ) ? $.trim( $( this ).find( options.navSource ).text() ) : tabIndex,
					navItemClass = '',
					activeClass = '';
					
				// hide source element content
				if ( options.navSourceHide ) $( this ).find( options.navSource ).hide();

				// add classes to the nav for first and last
				if ( tabIndex === 1 ) {
					navItemClass = 'first';
				} else if ( tabIndex === tabs.length ) {
					navItemClass = 'last';
				} else {
					navItemClass = '';
				}

				//  add a class to the nav for the tab that is initially active
				( tabIndex ===  options.activeTab ) ? activeClass = 'active' : activeClass + '';

				nav = nav + '<li class="target-' + tabIndex + ' ' + navItemClass + ' ' + activeClass + '"><a href="#">' + navItemValue + '<span>&nbsp;</span></a></li>';

				if ( tabIndex ===  options.activeTab ) $( this ).addClass( 'active-tab' );

				// hide all but the initially active tab
				if ( tabIndex !==  options.activeTab ) $( this ).hide();

				tabIndex++;
			});

			nav = nav + '</ul></div>';

			// add the generated navigation to the page
			if ( options.navPosition === 'after' ) {
				container.after( nav );
			} else {
				container.before( nav );
			}

			// force a redraw, required for ie
			setTimeout( function() {
				$( 'body' ).addClass( 'tabs-ininitiated' );
			}, 1000 );

			// Add click event to nav
			addNavEvents();
		}

		function addNavEvents () {

			$( '#' + options.navId ).delegate( 'a', 'click', function( e ) {
				e.preventDefault();

				var tgt = parseInt( this.parentNode.className.match( /target-\d/ ).toString().match( /\d/ ) );

				options.auto = false;

				container.find( '.active' ).removeClass( 'active' );

				$( this ).parent().addClass( 'active' );

				if ( currentTab !== tgt ) {
					contentControl( tgt );
				}
			});
		}

		function contentControl ( tgt ) {
			var nav = $( '#' + options.navId );

			currentheight = heightArray[ tgt - 1 ];

			currentTab = tgt;

			// animate height tab height if options is set
			if ( options.animateHeight ) {
				container.animate({ 'height': currentheight });
			}

			container.find('.active-tab').removeClass('active-tab').hide();
			container.find('.tab-' + tgt).addClass('active-tab').fadeIn();

			nav.find('.active').removeClass('active');
			nav.find('.target-' + tgt).addClass('active');
		}

		function autoOn () {
			var tgt = currentTab + 1,
				cycleCount = 1,
				cycleInterval;

			cycleInterval = setInterval( function () {

				if ( options.auto ) {

					// If a number of cycles has been set
					if ( options.cycles !== false ) {

						if ( cycleCount <= options.cycles ) {

							if ( tgt <= tabs.length ) {
								contentControl( tgt );
								tgt++;
							} else {
								tgt = 1;
								cycleCount++;						
							}
							
						} else {
							contentControl( 1 );
							clearInterval(cycleInterval);
						}

					} else {

						if ( tgt <= tabs.length ) {
							contentControl( tgt );
							tgt++;
						} else {
							tgt = 1;
						}

					}

				} else {
					clearInterval(cycleInterval);
				}
			}, options.cycleSpeed);
		}

		function prepareGrouping () {

			for ( var i = 0; i < tabs.length; i += options.grouping ) {
				tabs.slice( i, i + options.grouping ).wrapAll('<div class="tab"></div>');
			}

			tabs = container.find( '.tab' );
		}

		function maxHeight ( tabs ) {
			var heightArray = [];

			tabs.each(function(){
				heightArray.push( $(this).outerHeight() );
			});

			return heightArray;
		}
	};

})( jQuery );

