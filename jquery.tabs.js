
(function ( $ ) {

	$.fn.tabs = function( options ) {

		// Default options
		$.fn.tabs.defaults = {
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
		options = $.extend( {}, $.fn.tabs.defaults, options );

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
				if ( tabIndex ===  options.activeTab ) {
					activeClass = 'active';
				} else {
					activeClass = '';
				}

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

