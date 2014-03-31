
# Tabs with auto rotate

Add tabs with a custom nav and slideshow functionality.

### Requirements

This plugin makes certain assumptions about the HTML that it is invoked on; the HTML must look something like:

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

### Options

The following options are available - the values shown below are the defaults.

- tabElem : '.tab' - individual tab element selector.
-  activeTab : 1 - the initial active tab
- navSource : '.mb-tag' - the selector which contains the nav source copy
- navSourceHide : true - hide the nav source copy once extracted for use in the nav
- tabWidth : 225 - the tabs width
- auto : false - set to true to make the tabs cycle through automatically
- cycles : false - the number of times the tabs should cycle on auto. Leave as false to cycle infinitely, or enter a number.
- cycleSpeed : 2000 - the automatic cycle speed in milliseconds.
- animateHeight : false,
- navId : 'tab-nav' - id applied to the navigation container. Change if page has multiple tab instances.
- navClass : 'tab-nav' - class applied to navigation container. Change if different class name required.
- navPosition : 'before' or 'after' - change placement of the navigation insertion.
- grouping : 'none' - Use to group what would otherwise be individual tabs into a single tab


### Example

    $('#tabs').tabs({
        tabElem : '.tab',
        activeTab : 2,
        navSource : '.tab h2',
        navSourceHide : false,
        tabWidth : 500,
        auto : true,
        cycles : 1,
        cycleSpeed : 5000
    });