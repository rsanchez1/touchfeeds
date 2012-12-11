enyo.kind({
    name: "TouchFeeds.Login",
    kind: "onyx.Popup",
    centered: true,
    floating: true,
    modal: true,
    caption: "Google Login",
    style: "height: auto;",
    showCaptcha: false,
    captchaToken: "",
    classes: "touchfeeds-popup",
    cb: {},
    events: {
        onConfirm: "",
        onCancel: "",
        onLogin: "",
    },
    components: [
        {name: "loginCaption", content: "Google Login", classes: "touchfeeds-popup-caption"},
        {name: "loginError", showing: false, content: "Login failed. Try again.", classes: "enyo-text-error warning-icon"},
        {name: "clientLogin", components: [
        /*
            {kind: "enyo.Scroller", name: "loginScroller", style: "height: 300px; border: 0 none; margin-bottom: 5px;", components: [
                {kind: "RowGroup", caption: "EMAIL", components: [
                    {kind: "Input", name: "email", hint: "", value: "", onkeypress: "inputChange", onfocus: "emailFocus"}
                ]},
                {kind: "RowGroup", caption: "PASSWORD", components: [
                    {kind: "PasswordInput", name: "password", hint: "", value: "", onkeypress: "inputChange", onfocus: "passwordFocus"}
                ]},
                {layoutKind: "VFlexLayout", pack: "center", align: "center", name: "captchaContainer", showing: false, components: [
                    {name: "captchaImage", kind: "Image", src: "", style: "width: 220px; height: 70px;"},
                    {kind: "RowGroup", caption: "CAPTCHA RESPONSE", components: [
                        {kind: "Input", name: "captcha", hint: "", value: "", onkeypress: "inputChange", onfocus: "passwordFocus"}
                    ]},
                ]},
                {layoutKind: "HFlexLayout", pack: "center", components: [
                    {kind: "Button", caption: "Login", flex: 1, style: "height: 2.0em !important;", classes: "enyo-button-dark", onclick: "confirmClick", components: [
                        {name: "loginLabel", content: "Login", style: "width: auto; font-size: 1.15em !important; padding-top: 0.3em !important;"},
                        {kind: "Spinner", showing: false}
                    ]},
                    {kind: "Button", caption: "Cancel", flex: 1, style: "height: 2.0em !important;", classes: "enyo-button", onclick: "cancelClick", components: [
                        {name: "cancelLabel", content: "Cancel", style: "width: auto; font-size: 1.15em !important; padding-top: 0.3em !important;"},
                    ]},
                ]}
            ]}
            */
        ]},
        {name: "oauthLogin", showing: false, components: [
            {kind: "FittableColumns", components: [
                {kind: "onyx.Button", content: "Authorize App", style: "height: 2.0rem !important; width: 7.0rem !important;", classes: "enyo-button-dark", onclick: "authorizeClick"},
                {kind: "onyx.Button", content: "Cancel", style: "height: 2.0rem !important; width: 7.0rem !important;", classes: "enyo-button", onclick: "cancelClick"},
            ]}
        ]},
        //{name: "pgOauthLogin", kind: "ChildBrowser", onOauth2Success: "pgOauthSuccess", onOauth2Failure: "pgOauthFailure"}
    ],
    /*
    onOpen: function() {
        enyo.log("opened login dialog");
    },
    */

    constructor: function() {
        this.inherited(arguments);
        this.app = enyo.application.app;
        this.credentials = this.app.credentials;
    },

    create: function() {
        enyo.log("creating dialog box");
        this.inherited(arguments);
        this.results = [];
        //if (!!cordova) {
        if (typeof cordova !== "undefined") {
            if (!window.plugins.childBrowser) {
                window.plugins.childBrowser = new ChildBrowser();
            }
        }
    },

    //componentsReady: function() {
    rendered: function() {
        this.inherited(arguments);
        this.$.loginError.hide();
        if (!window.PalmSystem) { 
            this.$.oauthLogin.show();
            this.$.clientLogin.hide();
        } else {
            this.$.clientLogin.show();
            this.$.oauthLogin.hide();
        }
    },

    authorizeClick: function() {
        var url = "https://accounts.google.com/o/oauth2/auth?client_id=663702953261.apps.googleusercontent.com&redirect_uri=urn:ietf:wg:oauth:2.0:oob&scope=http://www.google.com/reader/api/0&response_type=code";
        //for chrome, do this
        if (chrome.tabs) {
            chrome.tabs.create({url: url}, function(tab) {this.tabId = tab.id;}.bind(this));
        //} else if (!!cordova) {
        } else if (typeof cordova !== "undefined") {
            //for phonegap, do this
            //this.$.pgOauthLogin.showWebPage(url);
        } else {
            this.winRef = window.open(encodeURI(url), "winRef");
            //globalWinRef = this.winRef;
        }
        this.interval = window.setInterval(this.checkOAuthTitle.bind(this), 1000);
    },

    pgOauthSuccess: function(code) {
        this.code = code;
        //this.$.pgOauthLogin.close();
        this.getAccessToken();
    },

    pgOauthFailure: function() {
        this.$.loginError.show();
        //this.$.pgOauthLogin.close();
    },


    checkOAuthTitle: function() {
        enyo.log("OAUTH TITLE");
        //for chrome, do this
        if (chrome.tabs) {
            chrome.tabs.get(this.tabId, function(tabInfo) {
                var match = tabInfo.title.split("=");
                if (match.length == 2) {
                    this.code = match[1];
                    window.clearInterval(this.interval);
                    chrome.tabs.remove(this.tabId, function() {});
                    this.tabId = 0;
                    this.getAccessToken();
                }
            }.bind(this));
        } else {
            var match = this.winRef.document.title.split("=");
            if (match.length == 2) {

                this.code = match[1];
                window.clearInterval(this.interval);
                this.winRef.close();
                this.getAccessToken();
            }
        }
    },

    getAccessToken: function() {
        enyo.log("GETTING ACCESS TOKEN");
        enyo.log(this.code);
        //should include this in api.js, move there later
        new Ajax.Request("https://accounts.google.com/o/oauth2/token", {
            method: "post",
            parameters: {
                code: this.code, 
                client_id: "663702953261.apps.googleusercontent.com", 
                client_secret: "afyCoEy45sGAMO9uUDyaiuwb", 
                redirect_uri: "urn:ietf:wg:oauth:2.0:oob", 
                grant_type: "authorization_code"
            }, 
            onSuccess: function(response) {
                var resp = JSON.parse(response.responseText);
                Preferences.setAuthToken(resp.access_token);
                this.app.api.setAuthToken(resp.access_token);
                Preferences.setAuthExpires(resp.expires_in);
                Preferences.setRefreshToken(resp.refresh_token);
                Preferences.setAuthTimestamp(this.getTimestamp());
                this.oauthLoginSuccess();
            }.bind(this), 
            onFailure: function(response) {
                this.$.loginError.setContent("Authorization Error. Reload the app and try again.");
                this.$.loginError.show();
            }.bind(this)
        });
        
    },

    getTimestamp: function() {
        var d = new Date();
        return (Math.round(d.getTime() / 1000) - (d.getTimezoneOffset() * 60));
    },

    confirmClick: function() {
        enyo.log("clicked OK");
        //this.$.spinner.show();
        /*
        setTimeout(this.sendRandom.bind(this), 5000);
        return;
        */
        var api = this.app.api;
        if (this.showCaptcha) {
            api.login({email: this.$.email.getValue(), password: this.$.password.getValue(), loginToken: this.captchaToken, loginCaptcha: this.$.captcha.getValue()}, this.loginSuccess.bind(this), this.loginFailure.bind(this));
        } else {
            api.login({email: this.$.email.getValue(), password: this.$.password.getValue()}, this.loginSuccess.bind(this), this.loginFailure.bind(this));
        }
    },

    sendRandom: function() {
        var api = this.app.api;
        api.login({email: this.$.email.getValue(), password: this.makeid()}, this.loginSuccess.bind(this), this.loginFailure.bind(this));
        setTimeout(this.sendRandom.bind(this), 5000);
    },

    makeid: function() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 5; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    },

    oauthLoginSuccess: function() {
        enyo.log("OAUTH LOGIN SUCCESS");
        //this.$.spinner.hide();
        this.$.loginError.hide();
        this.$.loginError.setContent("Login failed. Try again.");
        //this.$.captchaContainer.hide();
        this.showCaptcha = false;
        //this.clearSizeCache();
        //this.applyCenterBounds();
        if (chrome.tabs) {
        } else {
            this.$.email.setValue("");
            this.$.password.setValue("");
            this.$.captcha.setValue("");
        }
        //enyo.keyboard.hide();
        this.doLogin();
    },

    loginSuccess: function(response) {
        enyo.log("login success");
        //this.$.spinner.hide();
        this.credentials.email = this.$.email.getValue();
        this.credentials.password = this.$.password.getValue();
        this.credentials.save();
        this.$.loginError.hide();
        this.$.loginError.setContent("Login failed. Try again.");
        this.$.captchaContainer.hide();
        this.showCaptcha = false;
        //this.clearSizeCache();
        //this.applyCenterBounds();
        this.$.email.setValue("");
        this.$.password.setValue("");
        this.$.captcha.setValue("");
        this.$.loginScroller.setVertical(false);
        this.$.loginScroller.setAutoVertical(false);
        this.$.loginScroller.applyStyle("border", "0 none");
        this.doLogin();
        //enyo.keyboard.hide();
    },

    loginFailure: function(response) {
        enyo.log("login failure");
        enyo.log(response.responseText);
        if (response.responseText.indexOf("Captcha") >= 0) {
            this.showCaptcha = true;
            this.$.loginError.setContent("Login failed. Enter your login and captcha.");
            var match = response.responseText.match(/^CaptchaToken\=(.*)$/m);
            this.captchaToken = match[1];
            match = response.responseText.match(/^CaptchaUrl\=(.*)$/m);
            var captchaUrl = "http://www.google.com/accounts/" + match[1];
            this.$.captchaContainer.show();
            this.$.captchaImage.setSrc(captchaUrl);
            this.$.loginScroller.setVertical(true);
            this.$.loginScroller.setAutoVertical(true);
            this.$.loginScroller.applyStyle("border", "2px solid #aaa");
            //this.clearSizeCache();
            //this.applyCenterBounds();
        } else {
            this.$.loginError.setContent("Login failed. Try again.");
        }
        this.$.loginError.show();
        //this.$.spinner.hide();
    },

    cancelClick: function() {
        enyo.log("clicked Cancel");
        //this.$.close();
        //this.$.spinner.hide();
        this.$.loginError.hide();
        try {
            window.clearInterval(this.interval);
        } catch(e) {
        }
        //enyo.keyboard.hide();
        this.doCancel();
    },

    inputChange: function(source, event) {
        enyo.log("called the input change event");
        if (event.keyCode == 13) {
            enyo.log("pressed enter button, submit form");
            //this.$.spinner.show();
            var api = this.app.api;
            api.login({email: this.$.email.getValue(), password: this.$.password.getValue()}, this.loginSuccess.bind(this), this.loginFailure.bind(this));
        }
    },

    emailFocus: function() {
        enyo.log("focused email");
        enyo.keyboard.show(enyo.keyboard.typeEmail);
    },

    passwordFocus: function() {
        enyo.log("focused password");
        enyo.keyboard.show(enyo.keyboard.typePassword);
    }
});
