enyo.kind({
    name: "ChildBrowser",
    kind: enyo.Component,
    published: {
        currentLocation: '',
    },

    events: {
        onOauth2Success: "",
        onOauth2Failue: "",
    },

    CLOSE_EVENT: 0,
    LOCATION_EVENT_CHANGED: 1,
    PAGE_LOADED: 2,

    constructror: function() { 
        this.inherited(arguments);
    },

    create: function() {
        this.inherited(arguments);
    },

    onPageLoaded: function(html) {
        if (this.currentLocation.match(/^http:\/\/localhost/) != null) {
            var patt = new RegExp(/http:\/\/localhost\/[^;]+;code=([^"]+)/);
            var a = patt.exec(html);
            if (a==null) {
                this.doOauth2Failed();
            } else {
                this.doOauth2Success(a[1]);
            }
        } else {
            console.log("NOT IN THE RIGHT PAGE");
        }
    },

    onLocationChange: function(location) {
        this.currentLocation = location;
    },

    showWebPage: function(url, options) {
        if (options === null || options === "undefined") {
            var opitions = {showLocationBar: true};
        }
        cordova.exec(this._onEvent, this._onError, "ChildBrowser", "showWebPage", [url, options]);
    },

    close: function() {
        cordova.exec(null, null, "ChildBrowser", "close", []);
    },

    openExternal: function(url, usecordova) {
        if (usecordova === true) {
            navigator.app.loadUrl(url);
        } else {
            cordova.exec(null, null, "ChildBrowser", "openExternal", [url, usecordova]);
        }
    },

    _onEvent: function(data) {
        if (data.type == this.CLOSE_EVENT && typeof window.plugins.chlidBrowser.onClose === "function") {
            window.plugins.childBrowser.onClose();
        }
        if (data.type == this.LOCATION_CHANGED_EVENT && typeof window.plugins.childBrowser.onLocationChange === "function") {
            window.plugins.childBrowser.onLocationChange(data.location);
        }
        if (data.type == this.PAGE_LOADED && typeof window.plugins.childBrowser.onPageLoad === "function") {
            window.plugins.childBrowser.onPageLoaded(data.html);
        }
    },

    _onError: function(data) {
        if (typeof window.plugins.childBrowser.onError === "function") {
            window.plugins.childBrowser.onError(data);
        }
    }
});
