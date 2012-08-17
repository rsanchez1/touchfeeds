enyo.kind({
    name: "Spinner",
    classes: "touchfeeds-spinner"
});

enyo.kind({
    name: "Divider",
    classes: "touchfeeds-divider",
    published: {
        caption: ""
    },
    components: [
        {name: "label", classes: "touchfeeds-divider-label", content: ""},
        {classes: "touchfeeds-divider-right-cap"}
    ],
    rendered: function() {
        this.captionChanged();
    },
    captionChanged: function() {
        this.$.label.setContent(this.caption);
    }
});

enyo.kind({
    name: "RowGroup",
    classes: "touchfeeds-rowgroup",
    components: [
        {classes: "touchfeeds-rowgroup-client"}
    ]
});

enyo.kind({
    name: "ListSelector",
    classes: "onyx-button select-decorator",
    published: {
        value: "",
        items: []
    },
    events: {
        onChange: "",
        onShowPopup: "",
        onHidePopup: ""
    },
    popupShowing: false,
    components: [
        {classes: "select-decorator-inner", onclick: "clickHandler", components: [
            {name: "innerText", fit: true, classes: "select-decorator-inner-text"},
            {classes: "select-decorator-inner-arrow"}
        ]},
        {name: "optionsPopup", kind: "onyx.Popup", onclick: "clickedPopup", onHide: "popupHide", onShow: "popupShow", classes: "touchfeeds-popup", modal: true, showing: false, style: "position: absolute; z-index: 100; top: 0px; right: 0px;"}
    ],

    rendered: function() {
        this.inherited(arguments);
        this.itemsChanged();
    },

    itemsChanged: function() {
        this.$.optionsPopup.destroyClientControls();
        for (var i = 0; i < this.items.length; i++) {
            this.items[i].classes = "touchfeeds-menu-item";
            this.items[i].content = this.items[i].caption;
            this.items[i].index = i;
            this.$.optionsPopup.createComponent(this.items[i]);
        }
        this.$.optionsPopup.render();
        this.valueChanged();
    },

    valueChanged: function() {
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].value == this.value) {
                this.$.optionsPopup.controlAtIndex(i).addClass("touchfeeds-menu-item-active");
                this.$.innerText.setContent(this.items[i].caption);
            } else {
                this.$.optionsPopup.controlAtIndex(i).removeClass("touchfeeds-menu-item-active");
            }
        }
    },

    clickHandler: function() {
        var optionsPopup = this.$.optionsPopup;
        enyo.log(this.popupShowing);
        if (this.popupShowing) {
            optionsPopup.hide();
        } else {
            optionsPopup.show();
        }
    },

    clickedPopup: function(inSource, inEvent) {
        inEvent = inEvent.dispatchTarget;
        this.$.optionsPopup.hide();
        this.setValue(inEvent.value);
        this.doChange({value: inEvent.value});
    },

    popupShow: function() {
        this.popupShowing = true;
        this.doShowPopup();
    },

    popupHide: function() {
        setTimeout(enyo.bind(this, function() {
            this.popupShowing = false;
        }), 0);
        this.doHidePopup();
    }
});

enyo.kind({
    name: "TouchFeeds.Main",
    kind: "FittableRows",
    classes: "app enyo-fit",
    fit: true,
    loggedIn: false,
    sortAndFilterTimeout: false,
    keyWasDown: false,
    components: [
        {name: "slidingPane", kind: "Panels", fit: true, arrangerKind: "CollapsingArranger", animate: false, components: [
            {name: "feeds", style: "width: 384px; height: 100%;", fixedWidth: true, components: [
                {name: "feedsView", kind: "TouchFeeds.FeedsView", headerContent: "TouchFeeds", flex: 1, components: [], onFeedClicked: "feedClicked", onRefreshFeeds: "refreshFeeds", onHeaderClicked: "feedsHeaderClicked", onNotificationClicked: "notificationClicked"}
            ]},
            {name: "articles", style: "width: 384px; height: 100%;", fixedWidth: true, components: [
                {name: "articlesView", kind: "TouchFeeds.ArticlesView", headerContent: "All Items", flex: 1, components: [], onArticleClicked: "articleClicked", onArticleRead: "articleRead", onArticleMultipleRead: "articleMultipleRead", onAllArticlesRead: "markedAllRead", onArticleStarred: "articleStarred", onChangedOffline: "changeOffline", onGrabberClicked: "grabberClicked"}
            ]},
            {name: "singleArticle", style: "height: 100%;", dragAnywhere: false, dismissible: false, onHide: "hideArticle", onShow: "showArticle", onResize: "slidingResize", components: [
                {name: "singleArticleView", dragAnywhere: false, kind: "TouchFeeds.SingleArticleView", flex: 1, components: [], onSelectArticle: "selectArticle", onRead: "readArticle", onChangedOffline: "changeOffline", onStarred: "starredArticle", onGrabberClicked: "grabberClicked"},
            ]},
        ]},
        {name: "login", className: "enyo-bg", kind: "TouchFeeds.Login", onCancel: "closeDialog", onLogin: "handleLogin", onOpen: "openDialog"},
        {name: "preferences", className: "enyo-bg", kind: "TouchFeeds.Preferences", onCancel: "closePreferences", onGroupChange: "groupChange", onSortChange: "sortChange", onShowHideFeedsChange: "showHideFeedsChange", onShowHideArticlesChange: "showHideArticlesChange", onEnableAnimations: "animationsChanged", onTimerChange: "timerChanged", onCombineChange: "combineChanged"},
        //{name: "notifications", className: "enyo-bg", kind: "TouchFeeds.Notifications", onCancel: "closeNotifications", onTimerChange: "timerChanged"}
        /*
        {kind: "AppMenu", lazy: false, components: [
            {kind: "EditMenu"},
            {name: "loginLabel", caption: "Login", onclick: "showLogin"},
            {name: "preferenesLabel", caption: "Preferences", onclick: "showPreferences"},
            {name: "helpLabel", caption: "Help", onclick: "feedsHeaderClicked"}
        ]},
        */
        {/*kind: "Menu",*/kind: "onyx.Popup", style: "bottom: 0px; left: 100px;", classes: "touchfeeds-popup", name: "chromeMenu", showing: false, components: [
            {name: "loginLabelChrome", classes: "touchfeeds-menu-item", content: "Login", onclick: "showLogin"},
            {name: "preferenesLabelChrome", classes: "touchfeeds-menu-item", content: "Preferences", onclick: "showPreferences"},
            {name: "helpLabelChrome", classes: "touchfeeds-menu-item", content: "Help", onclick: "feedsHeaderClicked"}
        ]},
        {kind: "onecrayon.Database", name: "articlesDB", database: "ext:TouchFeedsArticles", version: 1, debug: false},
        //{kind: "ApplicationEvents", onWindowRotated: "windowRotated", onApplicationRelaunch: "applicationRelaunch", onUnload: "cleanup", onBack: "backSwipe", onForward: "forwardSwipe"}
    ],

    constructor: function() {
        this.inherited(arguments);
        this.api = new Api();
        this.credentials = new Credentials();
        if (!enyo.application) {
            enyo.application = {};
        }
        enyo.application.app = this;
        this.isPhone = false;
        if (!enyo.fetchDeviceInfo) {
            enyo.fetchDeviceInfo = function() {
                return window.PalmSystem ? JSON.parse(PalmSystem.deviceInfo) : undefined;
            }
        }
        var info = enyo.fetchDeviceInfo();
        if (!!info) {
            var height = info.screenHeight;
            var width = info.screenWidth;
            if ((height == 320 && width == 480) || (height == 480 && width == 320) || (height == 800 && width == 480) || (height == 480 && width == 800) || (height == 400 && width == 320) || (height == 320 && width == 400)) {
                this.isPhone = true;
            }
        }
        //enyo.dispatcher.rootHandler.addListener(this);
    },

    //ready: function() {
    rendered: function() { 
        this.inherited(arguments);
        enyo.log("rendered");
        (function() {
            var articleTestDiv = document.createElement("div");
            var articleSubDiv = document.createElement("div");
            var articleParentDiv = document.createElement("div");
            articleTestDiv.addClassName("articleTitle");
            articleTestDiv.id = "articleTestDiv";
            articleSubDiv.id = "articleSubDiv";
            articleSubDiv.addClassName("articleOrigin");
            articleParentDiv.addClassName("enyo-swipeableitem");
            articleParentDiv.addClassName("touchfeeds-test-div");
            articleParentDiv.setStyle({position: "static", top: "-1000px", left: "-1000px"});
            articleParentDiv.appendChild(articleTestDiv);
            articleParentDiv.appendChild(articleSubDiv);
            document.body.appendChild(articleParentDiv);
            var messageDiv = document.createElement("div");
            messageDiv.id = "touchfeedsBannerMessage";
            document.body.appendChild(messageDiv);
        }).defer();
        //enyo.keyboard.setManualMode(true);
       this.$.slidingPane.setAnimate(Preferences.enableAnimations());
       if (!enyo.getWindowOrientation) {
           enyo.getWindowOrientation = function() {
                if (window.PalmSystem) return PalmSystem.screenOrientation;
            }
       }
       var orientation = enyo.getWindowOrientation();
       if (orientation == "up" || orientation == "down") {
           this.$.feeds.applyStyle("width", "320px");
           this.$.articles.applyStyle("width", "320px");
       } else {
           this.$.feeds.applyStyle("width", "384px");
           this.$.articles.applyStyle("width", "384px");
       }
        //this.$.appMenu.hide();
        setTimeout(function() {
            (function() {
                enyo.log("retrieving database");
                this.$.articlesDB.setSchemaFromURL('schema.json', {
                    onSuccess: function() {
                        enyo.log("successfully set database schema");
                        this.$.articlesDB.query("SELECT * FROM articles", {
                            onSuccess: function (results) {
                                enyo.log("got results successfully");
                                this.offlineArticles = results;
                                this.$.articlesView.setHeaderContent("Offline Articles");
                                this.$.articlesView.setOfflineArticles(results);
                                }.bind(this),
                            onFailure: function() {
                                enyo.log("failed to get results");
                            }
                        });
                    }.bind(this)
                });
            }).bind(this).defer();
            enyo.log("checking login");
            if (!window.PalmSystem) {
                if (this.api.isAuthTokenValid()) {
                    enyo.log("auth token valid");
                    this.loginSuccess();
                } else {
                    //should check refresh token here
                    enyo.log("refresh auth token");
                    if (!!Preferences.getAuthTimestamp() && !!Preferences.getAuthExpires()) {
                        //this means the token expired, reauthorize
                        this.api.failureCheck(this.loginSuccess.bind(this), this.loginFailure.bind(this), {status: 401});
                    } else {
                        enyo.log("show login");
                        this.$.login.show();
                    }
                }
            } else { 
                if (this.credentials.email && this.credentials.password) {
                    enyo.log("Login API");
                    this.api.login(this.credentials, this.loginSuccess.bind(this), this.loginFailure.bind(this));
                    setTimeout(this.checkLoggedIn.bind(this), 5000);
                } else {
                    enyo.log("get login information from user");
                    setTimeout(function() {this.$.login.show();}.bind(this), 0);
                }
            }
        }.bind(this), 100);
        Element.addClassName(document.body, Preferences.getColorScheme());

        if (!window.PalmSystem) {
            //keyboard shortcuts google reader
            document.onkeyup = function(ev) {
                this.wasKeyDown = false;
            }.bind(this);
            document.onkeydown = function(ev) {
                if (this.isAnythingFocused()) {
                    return;
                }
                var key = ev.which;
                if (key == 38) {
                    this.$.articlesView.scrollBy(12);
                    ev.stopPropagation();
                    ev.preventDefault();
                    return -1;
                }
                if (key == 40) {
                    this.$.articlesView.scrollBy(-12);
                    ev.stopPropagation();
                    ev.preventDefault();
                    return -1;
                }
                if (this.wasKeyDown) {
                    return;
                }
                this.wasKeyDown = true;
                if (key == 74) {
                    //j
                    this.$.singleArticleView.nextClick();
                }
                if (key == 75) {
                    //k
                    this.$.singleArticleView.previousClick();
                }
                if (key == 83) {
                    //s
                    this.$.singleArticleView.starClick();
                }
                if (key == 77) {
                    //m
                    this.$.singleArticleView.readClick();
                }
                if (key == 86) {
                    //v
                    this.$.singleArticleView.sourceClick();
                }
                if (key == 69) {
                    //e
                }
                if (key == 82) {
                    //r
                    this.$.feedsView.refreshClick();
                    this.$.articlesView.refreshClick();
                }
                if (key == 191) {
                    ///
                    this.$.feedsView.$.searchQuery.forceFocus();
                    //this.$.slidingPane.selectViewByName('feeds', true);
                    this.$.slidingPane.setIndex(0);
                }
                if (key == 65) {
                    //a
                    this.$.feedsView.addFeedClick();
                }
                if (key == 79) {
                    //o
                    this.$.singleArticleView.offlineClick();
                }
                if (key == 70) {
                    //f
                    this.$.singleArticleView.fetchClick();
                }
            }.bind(this);
        }
        
    },

    componentsReady: function() {
        enyo.log("components ready");
    },

    isAnythingFocused: function() { 
        return false;
        if (!!this.$.feedsView.$.searchQuery && this.$.feedsView.$.searchQuery.hasFocus()) {
            return true;
        }
        if (!!this.$.feedsView.$.feedInput && this.$.feedsView.$.feedInput.hasFocus()) {
            return true;
        }
        if (!!this.$.login.$.email && this.$.login.$.email.hasFocus()) {
            return true;
        }
        if (!!this.$.login.$.password && this.$.login.$.password.hasFocus()) {
            return true;
        }
        if (!!this.$.login.$.captcha && this.$.login.$.captcha.hasFocus()) {
            return true;
        }
        return false;
    },

    measure: function(el, prop) {
        return document.defaultView.getComputedStyle(el, null).getPropertyValue(prop);
    },

    checkLoggedIn: function() {
        enyo.log("checking if logged in");
        /*
        if (!this.loggedIn) {
            this.api.login(this.credentials, this.loginSuccess.bind(this), this.loginFailure.bind(this));
            setTimeout(this.checkLoggedIn.bind(this), 5000);
        }
        */
    },

    loginSuccess: function() {
        enyo.log("logged in successfully");
        this.loggedIn = true;
        setTimeout(function() {
            this.sources = new AllSources(this.api);
            this.refreshFeeds();
        }.bind(this), 100);
        //this.$.loginLabel.setContent("Logout");
        this.$.loginLabelChrome.setContent("Logout");
        if (!!enyo.application.launcher) {
            enyo.application.launcher.$.appDashboard.setAlarm();
        }
    },

    refreshFeeds: function(callback) {
        enyo.log("refreshing feeds");
        if (!!this.sources) {
            this.$.feedsView.setShowSpinner(true);
            if (!!callback) {
                callback = function() {};
            }
            this.sources.findAll(
                function() {
                    enyo.log("Filtering and refreshing...");
                    this.allSubscriptions = this.sources.subscriptions.items.slice(0);
                    this.filterAndRefresh(callback);
                }.bind(this),

                function() {
                    enyo.log("Error fetching all feeds");
                }
            );
        }
        setTimeout(this.checkFeedsRefreshed.bind(this), 15000);
    },

    checkFeedsRefreshed: function() {
        enyo.log("CHECKING IF FEEDS SUCCESSFULLY REFRESHED");
        var numberOfItems = this.$.feedsView.getStickySourcesLength();
        if (numberOfItems < 2) {
            enyo.log("feeds not successfully refreshed, refresh again");
            this.refreshFeeds();
        } else {
            enyo.log("feeds successfully refreshed");
        }
    },

    filterAndRefresh: function(success) {
        enyo.log("Called filter and refresh");
        this.sources.sortAndFilter(
            function() {
                //enyo.log("Sticky sources: ", this.sources.stickySources.items);
                //enyo.log("Subscription sources: ", this.sources.subscriptionSources.items);
                enyo.log("success sorting and filtering");
                if (!!success) {
                    success();
                }
                var count = 0;
                for (var i = 0; i < this.sources.subscriptionSources.items.length; i++) {
                    count += this.sources.subscriptionSources.items[i].unreadCount;
                }
                this.sources.setAllUnreadCount(count);

                enyo.log("SETTING SOURCES");
                this.setStickySources(this.sources.stickySources);
                enyo.log("set sticky sources");
                this.setSubscriptionSources(this.sources.subscriptionSources);
                enyo.log("set subscription sources");
                if (!!enyo.application.launcher.messageTapped) {
                    enyo.log("MESSAGE WAS TAPPED");
                    var notification = enyo.application.launcher.$.appDashboard.$.appDashboard.pop();
                    var subscription = this.sources.subscriptionSources.items.find(function(subscription) {return subscription.title.replace(/[^0-9a-zA-Z]/g, "").toLowerCase() == notification.idTitle;});
                    if (typeof subscription == "undefined") {
                        enyo.log("failed to get subscription");
                    } else {
                        enyo.log("CLICKING A FEED");
                        this.feedClicked("", subscription);
                        enyo.application.launcher.$.appDashboard.removeDashboard();
                        enyo.log("FEED CLICKED");
                    }
                    enyo.application.launcher.messageTapped = false;
                }
            }.bind(this),

            function() {
                enyo.log("Error sorting and filtering");
            }
        );
    },

    setStickySources: function(stickySources) {
        //this.$.feedsView.setStickySources([]);
        (function() {
            this.$.feedsView.setStickySources(stickySources);
        }.bind(this)).defer();
    },

    setSubscriptionSources: function(subscriptionSources) {
        //this.$.feedsView.setSubscriptionSources([]);
        (function() {
            this.$.feedsView.setSubscriptionSources(subscriptionSources);
        }.bind(this)).defer();
    },

    sortAndFilter: function(article) {
        enyo.log("sortin and filterin");
        if (!!this.sortAndFilterTimeout) {
            clearTimeout(this.sortAndFilterTimeout);
            this.sortAndFilterTimeout = 0;
            article = null;
        }
        var timeout = 2500;
        if (!window.PalmSystem) {
            timeout = 0;
        }
        this.sortAndFilterTimeout = setTimeout(function() {
            this.sources.sortAndFilter(function() {
                this.sortAndFilterTimeout = 0;
                var count = 0;
                for (var i = 0; i < this.sources.subscriptionSources.items.length; i++) {
                    count += this.sources.subscriptionSources.items[i].unreadCount;
                }
                this.sources.setAllUnreadCount(count);
                enyo.log("finished sorting");
                /*
                if (!!article) {
                    this.feedsView.setChangeId(article.subscriptionId);
                }
                */
                this.setStickySources(this.sources.stickySources);
                this.setSubscriptionSources(this.sources.subscriptionSources);
            }.bind(this), function() {this.sortAndFilterTimeout = 0; enyo.log("error sorting and filtering");});
        }.bind(this), timeout);
    },

    getSubscriptionSources: function() {
        return this.allSubscriptions;
    },

    loginFailure: function() {
        this.$.login.show();
    },

    showArticle: function() {
        this.$.singleArticle.setShowing(true);
    },

    hideArticle: function() { 
        this.$.singleArticle.setShowing(false);
    },

    slidingSelected: function() {
    },

    slidingResize: function() {
        this.$.singleArticleView.resizedPane();
    },

    openAppMenuHandler: function() {
        this.$.appMenu.open();
    },

    closeAppMenuHandler: function() {
        this.$.appMenu.close();
    },

    showPreferences: function() {
        //this.$.preferences.openAtCenter();
        this.$.preferences.show();
        this.$.chromeMenu.hide();
    },

    closePreferences: function() {
        //this.$.preferences.close();
        this.$.preferences.hide();
    },

    closeNotifications: function() {
        this.$.notifications.close();
    },

    showLogin: function() {
        if (this.loggedIn) {
            this.sources = null;
            this.loggedIn = false;
            Preferences.setAuthToken("");
            Preferences.setRefreshToken("");
            Preferences.setAuthTimestamp(0);
            Preferences.setAuthExpires(0);
            this.credentials.password = false;
            this.credentials.save();
            //this.$.loginLabel.setContent("Login");
            this.$.loginLabelChrome.setContent("Login");
            this.$.login.show();
            this.setStickySources([]);
            this.setSubscriptionSources([]);
        } else {
            this.$.login.show();
        }
        this.$.chromeMenu.hide();
    },

    openDialog: function() {
        enyo.log("opened login");
    },

    closeDialog: function() {
        this.$.slidingPane.setIndex(1);
        this.$.login.hide();

        this.setStickySources({items: [{isOffline: true, title: "Offline Articles"}]});
    },

    handleLogin: function() {
        enyo.log("successfully logged in");
        this.$.login.hide();
        this.loginSuccess();
    },

    grabberClicked: function(a, b) {
        var source = b.source;
        var panels = this.$.slidingPane;
        var active = panels.getIndex();
        if (source == "articles") {
            if (active == 1) {
                panels.setIndex(0);
            } else {
                panels.setIndex(1);
            }
        } else if (source == "single") {
            if (active == 2) {
                panels.setIndex(1);
            } else {
                panels.setIndex(2);
            }
        }
    },

    feedClicked: function(thing, item, wasFolderChild) {
        enyo.log("received feed clicked event");
        enyo.log(thing);
        enyo.log(item);
        enyo.log(wasFolderChild);
        this.$.articlesView.setHeaderContent(item.title);
        if (item.isOffline) {
            this.$.articlesDB.query("SELECT * FROM articles", {
                onSuccess: function (results) {
                    enyo.log("************************");
                    enyo.log("got results successfully");
                    this.offlineArticles = results;
                    this.$.articlesView.setOfflineArticles(results);
               }.bind(this),
                onFailure: function() {
                    enyo.log("failed to get results");
                }
            });
        } else {
            this.$.articlesView.setArticles(item); //pushing all articles to articles view
            this.$.articlesView.setWasFolderChild(wasFolderChild);
        }
        //this.$.slidingPane.selectViewByName('articles', true);
        this.$.slidingPane.setIndex(1);
        //this.$.slidingPane.selectViewByName('ariclesView', true);
    },

    articleClicked: function(thing, inEvent) {
        var article = inEvent.article;
        var index = inEvent.index;
        var maxIndex = inEvent.maxIndex;
        //this.$.singleArticleView.$.articleScroller.scrollTo(0, 0);
        this.$.singleArticleView.$.articleScroller.scrollToTop();
        this.$.singleArticleView.setArticle(article);
        this.$.singleArticleView.setIndex(index);
        this.$.singleArticleView.setMaxIndex(maxIndex);
    },

    selectArticle: function(thing, inEvent) {
        this.$.articlesView.selectArticle(inEvent.index);
    },
    starredArticle: function(thing, inEvent) {
        this.$.articlesView.finishArticleStarred(inEvent.index, inEvent.isStarred);
    },
    readArticle: function(thing, inEvent) {
        var article = inEvent.article;
        var index = inEvent.index;
        var isRead = inEvent.isRead;
        if (isRead) {
            this.sources.articleRead(article.subscriptionId);
        } else {
            this.sources.articleNotRead(article.subscriptionId);
        }
        this.$.articlesView.finishArticleRead(index);
        //this.$.feedsView.refreshLists();
        this.sortAndFilter(article);
    },
    articleRead: function(thing, inEvent) {
        var article = inEvent.article;
        enyo.log("ARTICLE READ");
        enyo.log(article);
        enyo.log(index);
        var index = inEvent.index;
        this.sources.articleRead(article.subscriptionId);
        this.$.articlesView.finishArticleRead(index);
        this.sortAndFilter(article);
    },

    articleMultipleRead: function(thing, inEvent) {
        var article = inEvent.article;
        var index = inEvent.index;
        //this.sources.articleMultipleRead(article.subscriptionId);
        this.sources.articleRead(article.subscriptionId);
        this.$.articlesView.finishArticleRead(index);
        this.sortAndFilter(article);
    },

    getUnreadCountForSubscription: function(subscriptionId) {
        enyo.log("getting unread count for subscription from main");
        return this.sources.getUnreadCountForSubscription(subscriptionId);
    },
    articleStarred: function() {
        this.$.singleArticleView.articleStarred();
    },
    markedAllRead: function(thing, inEvent) {
        var count = inEvent.count;
        var id = inEvent.id;
        var isMultiple = inEvent.isMultiple;
        var articles = inEvent.articles;
        if (id == "user/-/state/com.google/reading-list") {
            this.sources.nukedEmAll();
        } else {
            this.sources.markedAllRead(count);
        }
        if (isMultiple === true && !!articles && !!articles.length) {
            for (var i = articles.length; i--;) {
                this.sources.articleRead(articles[i].subscriptionId);
            }
        }
        this.sortAndFilter();
        //this.refreshFeeds();
    },
	changeOffline: function() {
            this.$.articlesView.checkAllArticlesOffline();
		this.$.articlesDB.query("SELECT * FROM articles", {
			onSuccess: function (results) {
				enyo.log("got results successfully");
                                this.offlineArticles = results;
                                if (!!this.sources) {
                                    this.setStickySources(this.sources.stickySources);
                                }
				if (this.$.articlesView.offlineArticles.length) {
					this.$.articlesView.setOfflineArticles(results);
				}
		   }.bind(this),
			onFailure: function() {
				enyo.log("failed to get results");
			}
		});
   },
   windowRotated: function() {
       var orientation = enyo.getWindowOrientation();
       if (orientation == "up" || orientation == "down") {
           this.$.feeds.applyStyle("width", "320px");
           this.$.articles.applyStyle("width", "320px");
       } else {
           this.$.feeds.applyStyle("width", "384px");
           this.$.articles.applyStyle("width", "384px");
       }
   },

   applicationRelaunch: function(inSender) {
       enyo.log("***********************************");
       enyo.log("***********************************");
       enyo.log("***********************************");
       enyo.log("***********************************");
       enyo.log("relaunched application");
       var params = enyo.windowParams;
       if (params.action !== undefined) {
           return true;
       }
   },

   subscriptionSuccess: function() {
       enyo.log("***********************************");
       enyo.log("***********************************");
       enyo.log("***********************************");
       enyo.log("***********************************");
       enyo.log("set alarm");
   },

   subscriptionFailure: function() {
       enyo.log("***********************************");
       enyo.log("***********************************");
       enyo.log("***********************************");
       enyo.log("***********************************");
       enyo.log("failed to set alarm");
   },

   feedsHeaderClicked: function() {
       this.$.singleArticleView.showSummary();
        //this.$.slidingPane.selectViewByName('singleArticle', true);
        this.$.slidingPane.setIndex(2);
        this.$.chromeMenu.hide();
   },

   notificationClicked: function() {
       if (!window.PalmSystem) {
           //this.$.chromeMenu.openAtControl(this.$.feedsView.$.notificationButton, {});
           this.$.chromeMenu.show();
       } else {
            var numberOfItems = this.$.feedsView.getStickySourcesLength();
            if (numberOfItems < 2) {
                Feeder.notify("Error: subscriptions not available.");
            } else {
               this.$.notifications.openAtCenter();
            }
       }
   },

   groupChange: function() {
       this.$.articlesView.reloadArticles();
   },

   sortChange: function() {
       this.$.articlesView.reloadArticles();
       this.$.feedsView.refreshFeeds();
   },

   showHideFeedsChange: function() {
       this.$.feedsView.refreshFeeds();
   },

   showHideArticlesChange: function() {
       this.$.articlesView.articlesChanged();
   },

   animationsChanged: function() {
       this.$.slidingPane.setAnimate(Preferences.enableAnimations());
   },

   timerChanged: function() {
        enyo.application.launcher.$.appDashboard.setAlarm();
   },

   combineChanged: function() {
       this.$.feedsView.refreshFeeds();
   },

   forwardSwipe: function(inSender, inEvent) {
       var current = this.$.slidingPane.getViewName();
       switch (current) {
           case "feeds":
                this.$.slidingPane.selectViewByName('articles', true);
                break;
            case "articles":
                this.$.slidingPane.selectViewByName('singleArticle', true);
                break;
            default:
                break;
       }
       inEvent.stopPropagation();
       inEvent.preventDefault();
       return -1;
   },

   backSwipe: function(inSender, inEvent) {
       var current = this.$.slidingPane.getViewName();
       switch (current) {
           case "articles":
                this.$.slidingPane.selectViewByName('feeds', true);
                break;
            case "singleArticle":
                this.$.slidingPane.selectViewByName('articles', true);
                break;
            default:
                break;
       }
       inEvent.stopPropagation();
       inEvent.preventDefault();
       return -1;
   },

   dispatchDomEvent: function(e) {
        //this.log('on' + enyo.cap(e.type));
        if (e.type == "forward") {
            this.forwardSwipe(null, e);
        }
        if (e.type == "orientationchange") {
            this.log("ORIENTATION CHANGED");
        }
        if (e.type == "shakestart") {
            this.log("started shaking");
        }
        if (e.type == "shaking") {
            this.log("IS SHAKING");
        }
        if (e.type == "shakeend") {
            this.log("STOPPED SHAKING");
        }
        if (e.type == "acceleration") {
            this.log("ACCELERATION");
        }
   },

   cleanup: function() {
        enyo.application.launcher.$.appDashboard.setAlarm();
   }
});
