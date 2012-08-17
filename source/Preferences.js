enyo.kind({
    name: "TouchFeeds.Preferences",
    kind: "onyx.Popup",
    caption: "Preferences",
    centered: true,
    floating: true,
    //modal: true,
    style: "height: auto; width: 320px;",
    classes: "touchfeeds-popup",
    events: {
        onCancel: "",
        onGroupChange: "",
        onShowHideFeedsChange: "",
        onShowHideArticlesChange: "",
        onEnableAnimations: "",
        onSortChange: "",
        onCombineChange: "",
    },
    components: [
        {name: "preferencesCaption", content: "Preferences", classes: "touchfeeds-popup-caption"},
        {kind: "Scroller", name: "preferencesScroller", style: "height: 300px; border: 2px solid #aaa; margin-bottom: 5px; overflow-x: hidden; padding-right: 20px;", horizontal: false, autoHorizontal: false, flex: 1, components: [
            {style: "padding: 15px 5px 5px 5px; z-index: 0; position: relative;", kind: "FittableColumns", components: [
                {content: "Color Scheme:", style: "padding-top: 10px; padding-right: 15px; font-size: .9rem;"},
                {kind: "ListSelector", fit: true, name: "colorSchemeSelector", onChange: "colorChanged", onShowPopup: "showPopup", onHidePopup: "hidePopup", items: [
                    {caption: "Standard", value: ""},
                    {caption: "Light", value: "light"},
                    {caption: "Dark", value: "dark"}
                ]}
            ]},
            {style: "padding: 15px 5px 5px 5px; z-index: 0; position: relative;", kind: "FittableColumns", components: [
                {content: "Sort Feeds:", style: "padding-top: 10px; padding-right: 15px; font-size: .9rem;"},
                {kind: "ListSelector", fit: true, name: "sortFeedsSelector", onChange: "sortChanged", onShowPopup: "showPopup", onHidePopup: "hidePopup", items: [
                    {caption: "Alphabetically", value: false},
                    {caption: "Manually", value: true},
                ]}
            ]},
            {style: "padding: 15px 5px 5px 5px; z-index: 0; position: relative;", kind: "FittableColumns", components: [
                {content: "Sort articles by date:", style: "padding-top: 10px; padding-right: 15px; font-size: .9rem;"},
                {kind: "ListSelector", fit: true, name: "sortDateSelector", onChange: "dateChanged", onShowPopup: "showPopup", onHidePopup: "hidePopup",  items: [
                    {caption: "Newest First", value: false},
                    {caption: "Oldest First", value: true}
                ]}
            ]},
            {style: "padding: 15px 5px 5px 5px; z-index: 0; position: relative;", kind: "FittableColumns", components: [
                {content: "Group folder articles by:", style: "padding-top: 10px; padding-right: 15px; font-size: .9rem;"},
                {kind: "ListSelector", fit: true, name: "groupToggle", onChange: "groupToggle", onShowPopup: "showPopup", onHidePopup: "hidePopup",  items: [
                    {caption: "Feed", value: true},
                    {caption: "Date", value: false}
                ]}
            ]},
            {name: "twitterToggleContainer", style: "padding: 15px 5px 5px 5px; z-index: 0; position: relative;", kind: "FittableColumns", components: [
                {content: "Share to Twitter using:", style: "padding-top: 10px; padding-right: 15px; font-size: .9rem;"},
                {kind: "ListSelector", fit: true, name: "twitterToggle", onChange: "twitterToggle", onShowPopup: "showPopup", onHidePopup: "hidePopup",  items: [
                    {caption: "Web", value: "web"},
                    {caption: "Spaz HD", value: "spaz"}
                ]}
            ]},
            {name: "facebookToggleContainer", style: "padding: 15px 5px 5px 5px; z-index: 0; position: relative;", kind: "FittableColumns", components: [
                {content: "Share to Facebook using:", style: "padding-top: 10px; padding-right: 15px; font-size: .9rem;"},
                {kind: "ListSelector", fit: true, name: "facebookToggle", onChange: "facebookToggle", onShowPopup: "showPopup", onHidePopup: "hidePopup",  items: [
                    {caption: "Web", value: "web"},
                    {caption: "App", value: "app"}
                ]}
            ]},
            {name: "scrollToggleContainer", style: "padding: 15px 5px 5px 5px; z-index: 0; position: relative;", kind: "FittableColumns", components: [
                {className: "preferencesLabel", content: "Mark read as you scroll:", style: "font-size: .9rem;", fit: true},
                {className: "preferencesToggle", name: "scrollToggle", kind: "onyx.ToggleButton", onContent: "Yes", offContent: "No", onChange: "scrollToggle"}
            ]},
            {style: "padding: 15px 5px 5px 5px; z-index: 0; position: relative;", kind: "FittableColumns", components: [
                {className: "preferencesLabel", content: "Hide read feeds:", fit: true, style: "font-size: .9rem;"},
                {className: "preferencesToggle", name: "feedsToggle", kind: "onyx.ToggleButton", onContent: "Yes", offContent: "No", onChange: "feedsToggle"}
            ]},
            {style: "padding: 15px 5px 5px 5px; z-index: 0; position: relative;", kind: "FittableColumns", components: [
                {className: "preferencesLabel", content: "Hide read articles:", style: "font-size: .9rem;", fit: true},
                {className: "preferencesToggle", name: "articlesToggle", kind: "onyx.ToggleButton", onContent: "Yes", offContent: "No", onChange: "articlesToggle"}
            ]},
            {style: "padding: 15px 5px 5px 5px; z-index: 0; position: relative;", kind: "FittableColumns", components: [
                {className: "preferencesLabel", content: "Enable Animations:", fit: true, style: "font-size: .9rem;"},
                {className: "preferencesToggle", name: "animationsToggle", kind: "onyx.ToggleButton", onContent: "Yes", offContent: "No", onChange: "animationsToggle", className: "groupToggle"}
            ]},
            {style: "padding: 15px 5px 5px 5px; z-index: 0; position: relative;", kind: "FittableColumns", components: [
                {className: "combineLabel", content: "Combine Folders:", fit: true, style: "font-size: .9rem;"},
                {className: "combineToggle", name: "combineToggle", kind: "onyx.ToggleButton", onContent: "Yes", offContent: "No", onChange: "combineToggle", className: "groupToggle"}
            ]},
        ]},
        {kind: "onyx.Button", content: "OK", style: "height: 2.0rem !important; width: 100% !important;", classes: "enyo-button-dark", onclick: "okClick"}
    ],

    constructor: function() {
        this.inherited(arguments);
    },

    create: function() {
        this.inherited(arguments);
    },

    ready: function() {
        this.inherited(arguments);
    },

    //componentsReady: function() {
    rendered: function() {
        this.inherited(arguments);
        if (!window.PalmSystem) {
            this.$.twitterToggleContainer.hide();
            this.$.facebookToggleContainer.hide();
            this.$.scrollToggleContainer.hide();
        }
        this.$.colorSchemeSelector.setValue(Preferences.getColorScheme());
        this.$.sortFeedsSelector.setValue(Preferences.isManualFeedSort());
        this.$.sortDateSelector.setValue(Preferences.isOldestFirst());
        this.$.groupToggle.setValue(Preferences.groupFoldersByFeed());
        this.$.twitterToggle.setValue(Preferences.twitterSharingOption());
        this.$.facebookToggle.setValue(Preferences.facebookSharingOption());
        this.$.scrollToggle.setValue(Preferences.markReadAsScroll());
        this.$.feedsToggle.setValue(Preferences.hideReadFeeds());
        this.$.articlesToggle.setValue(Preferences.hideReadArticles());
        this.$.combineToggle.setValue(Preferences.combineFolders());
        this.$.animationsToggle.setValue(Preferences.enableAnimations());
        //this.$.articlesFolderToggle.setValue(Preferences.hideReadFolderArticles());
        var info = enyo.fetchDeviceInfo();
        if (!!info) {
            var height = info.screenHeight;
            if (height == 320 || height == 400 || height == 480 || height == 800) {
                this.$.preferencesScroller.applyStyle("height", "200px");
            }
        }
    },

    colorChanged: function(inSender, inEvent) {
        var body = document.body;
        var inValue = inEvent.value;
        Element.removeClassName(body, "light");
        Element.removeClassName(body, "dark");
        Element.addClassName(body, inValue);
        Preferences.setColorScheme(inValue);
    },

    dateChanged: function(inSender, inEvent) {
        Preferences.setOldestFirst(inEvent.value);
        this.doSortChange();
    },
    
    sortChanged: function(inSender, inEvent) {
        Preferences.setManualFeedSort(inEvent.value);
        this.doSortChange();
    },

    groupToggle: function(inSender, inEvent) {
        Preferences.setGroupFoldersByFeed(inEvent.value);
        this.doGroupChange();
    },

    combineToggle: function(inSender, inEvent) {
        Preferences.setCombineFolders(inEvent.value);
        this.doCombineChange();
    },

    twitterToggle: function(inSender, inEvent) {
        Preferences.setTwitterSharingOption(inEvent.value);
    },

    facebookToggle: function(inSender, inEvent) {
        Preferences.setFacebookSharingOption(inEvent.value);
    },

    scrollToggle: function(inSender, inEvent) {
        Preferences.setMarkReadAsScroll(inEvent.value);
    },

    feedsToggle: function(inSender, inEvent) {
        Preferences.setHideReadFeeds(inEvent.value);
        this.doShowHideFeedsChange();
    },

    articlesToggle: function(inSender, inEvent) {
        Preferences.setHideReadArticles(inEvent.value);
        this.doShowHideArticlesChange();
    },

    articlesFolderToggle: function(inSender, inEvent) {
        Preferences.setHideReadFolderArticles(inEvent.value);
        this.doShowHideArticlesChange();
    },

    animationsToggle: function(inSender, inEvent) {
        Preferences.setEnableAnimations(inEvent.value);
        this.doEnableAnimations();
    },

    showPopup: function(inSender, inEvent) {
        inSender.parent.addStyles("z-index: 10;");
    },

    hidePopup: function(inSender, inEvent) {
        inSender.parent.addStyles("z-index: 0;");
    },

    okClick: function() {
        this.doCancel();
    }
});
