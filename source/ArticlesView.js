enyo.kind({
    name: "TouchFeeds.ArticlesView",
    kind: "FittableRows",
    classes: "enyo-bg itemLists secondaryPane enyo-unselectable",
    style: "height: 100%",
    published: {
        headerContent: "",
        articles: [],
        offlineArticles: [],
        wasFolderChild: false,
    },
    events: {
        onArticleClicked: "",
        onArticleRead: "",
        onArticleMultipleRead: "",
        onAllArticlesRead: "",
        onArticleStarred: "",
        onChangedOffline: "",
        onGrabberClicked: ""
    },
    selectedRow: -1,
    numberRendered: 0,
    articleClicked: false,
    maxTop: 0, //maximum that the user has scrolled, to track which articles to mark read
    markReadTimeout: 0,
    originCount: {},
    itemsToMarkRead: [],
    wasMarkingAllRead: false,
    itemsToHide: {},
    heights: [],
    wasOfflineSet: false,
    isGettingStarredArticles: false,
    rowsPerPage: 20,
    lastTop: 0,
    wasClicked: false,
    shouldAdjust: false,
    isMouseOver: false,
    mouseY: 0,
    didScrollToTop: false,
    didScrollToBottom: false,
    threshold: 0,
    bottom: -9e9,
    markedReadOnScroll: false,
    components: [
        {name: "header", kind: "onyx.Toolbar", components: [
            {name: "headerWrapper", classes: "tfHeaderWrapper", components: [
                {name: "headerContent", onclick: "headerClick", content: "All Articles", classes: "tfHeader"}
            ]},
            {kind: "Spinner", showing: true, className: "tfSpinner", style: "right: 6px; top: 6px; position: absolute;"}
        ]},
        {name: "emptyNotice", content: "There are no articles available.", classes: "articleTitle itemLists", style: "font-weight: bold; padding-top: 0px; padding-left: 20px; font-size: 1.1rem; margin-top: 30px;"},
        {name: "articlesScroller", kind: "enyo.Scroller", fit: true, style: "position: relative;", classes: "itemLists enyo-bg enyo-fit", horizontal: false, autoHorizontal: false, ondragstart: "dragStart", ondragfinish: "dragFinish", onScrollStop: "scrollStop", onScrollStart: "scrollStart", components: [
            //{name: "articlesList", flex: 1, kind: "ScrollingList", rowsPerScrollerPage: 20, onSetupRow: "getListArticles", className: "itemLists", onmousemove: "articleListMouseMove", onmouseout: "articleListMouseOut", onmousewheel: "articleMouseWheel", components: [
            {name: "articlesList", kind: "enyo.Repeater", onSetupItem: "getListArticles", classes: "itemLists", onmousemove: "articleListMouseMove", onmouseout: "articleListMouseOut", onmousewheel: "articleMouseWheel", components: [
                {name: "articleContainer", components: [
                    {kind: "Divider", onclick: "articleDividerClick"},
                    {name: "articleItem", classes: "enyo-swipeableitem",/*kind: "SwipeableItem", layoutKind: "VFlexLayout",*/ onConfirm: "swipedArticle", confirmRequired: false, allowLeft: true, components: [
                        {name: "title", classes: "articleTitle", allowHtml: true},
                        {name: "origin", classes: "articleOrigin"}
                    ], onclick: "articleItemClick"}
                ]}
            ]},
        ]},
        {kind: "onyx.Toolbar", components: [
            {kind: "onyx.Grabber", onclick: "grabberClicked"},
           {name: "readAllButton", kind: "onyx.IconButton", src: "images/read-footer.png", onclick: "readAllClick", style: "background-color: transparent !important; -webkit-border-image: none !important; position: relative; left: 30px;"},
            {name: "refreshButton", kind: "onyx.IconButton", src: "images/refresh.png", onclick: "refreshClick", style: "background-color: transparent !important; -webkit-border-image: none !important; position: relative; left: 50px;"},
            {name: "fontButton", kind: "onyx.IconButton", src: "images/icon_fonts.png", onclick: "fontClick", style: "background-color: transparent !important; -webkit-border-image: none !important; position: relative; left: 70px;"},
            {name: "offlineButton", kind: "onyx.IconButton", src: "images/offline-article.png", onclick: "offlineClick", style: "background-color: transparent !important; -webkit-border-image: none !important; position: relative; left: 90px;"},
        ]},
        {name: "fontsPopup", kind: "onyx.Popup", classes: "touchfeeds-popup", modal: false, showing: false, dismissWithClick: true, style: "bottom: 0px; left: 140px;", components: [
            {content: "Small", classes: "touchfeeds-menu-item", onclick: "chooseFont"},
            {content: "Medium", classes: "touchfeeds-menu-item", onclick: "chooseFont"},
            {content: "Large", classes: "touchfeeds-menu-item", onclick: "chooseFont"},
        ]},
        {name: "offlineChoicePopup", kind: "onyx.Popup", centered: true, floating: true, modal: true, classes: "touchfeeds-popup", style: "width: 14.5rem !important;", caption: "Are you sure you want to remove all articles from offline?", components: [
            {content: "Are you sure you want to remove all articles from offline?", classes: "touchfeeds-popup-caption"},
            {kind: "FittableColumns", components: [
                {kind: "onyx.Button", content: "Yes", style: "height: 2.0em !important; width: 7.0rem !important;", classes: "enyo-button-dark", onclick: "confirmClick"},
                {kind: "onyx.Button", content: "No", style: "height: 2.0em !important; width: 7.0rem !important;", classes: "enyo-button", onclick: "cancelClick"},
            ]}
        ]},
    ],
    create: function() {
        this.inherited(arguments);
        this.headerContentChanged();
        this.app = enyo.application.app;
    },
    //ready: function() {
    rendered: function() {
        this.inherited(arguments);

        this.$.articlesList.build = function() {
            this.parent.parent.parent.$.spinner.show();
            this.destroyClientControls();
            if (!!this.hasNode()) {
                //this.node.innerHTML = "";
            } else {
                this.renderNode();
            }
            if (!this.hasNode()) {
                setTimeout(this.build, 1000);
                return;
            }
            this.renderAttributes();
            this.renderStyles();
            for (var a = 0; a < this.count; a++) {
                (function(a) {
                    enyo.log("rendering item " + a);
                    var b = this.createComponent({
                        kind: "enyo.OwnerProxy",
                        index: a
                    });
                    b.createComponents(this.itemComponents);
                    this.doSetupItem({index: a, item: b});
                    var item = this.children[a];
                    if (!this.articlesListHtml) {
                        this.articlesListHtml = "";
                    }
                    this.articlesListHtml = this.articlesListHtml + item.generateHtml();
                    //this.node.innerHTML += item.generateHtml();
                    if ((!(a % 100) && a > 0) || a == (this.count - 1)) {
                        enyo.log("UPDATE LIST AT " + a);
                        this.node.innerHTML += this.articlesListHtml;
                        this.articlesListHtml = "";
                    }
                    if (a == this.count - 1) {
                        this.rendered();
                        this.parent.parent.parent.$.spinner.hide();
                    }
                }.bind(this, a)).defer();
            }
        }.bind(this.$.articlesList);

        if (!!chrome && !!chrome.tabs) {
            //this.$.articlesScroller.node.setStyle({overflowY: "scroll"});
            this.$.articlesScroller.setVertical("scroll");
        }
        /*
        if (!window.PalmSystem) {
            enyo.log("not in webos, set up alternate scrolling");
            //this.$.articlesList.$.scroller.setAccelerated(false);
            setTimeout(this.scrollList.bind(this), 60);
            this.$.articlesList.$.scroller.$.scroll.mousewheel = enyo.bind(this.$.articlesList.$.scroller.$.scroll, function(ev) {
                if (!ev.preventDefault) {
                    this.stop();
                    this.y = this.y0 = this.y0 + ev.wheelDeltaY, this.start();
                }
            });
        }
        */
    },
    componentsReady: function() {
        this.inherited(arguments);
        return;
        this.$.articlesList.$.scroller.setAccelerated(false);
    },

    headerContentChanged: function() {
        this.$.headerContent.setContent(Encoder.htmlDecode(this.headerContent));
    },

    dragStart: function(inSource, inEvent) {
        enyo.log("drag start");
        if (!window.PalmSystem) {
            return true;
        }
    },

    dragFinish: function(inSource, inEvent) {
        enyo.log("drag finish");
        inEvent.preventTap();
        if (!window.PalmSystem) {
            return true;
        }
    },

    /*
     *
     Button Callbacks
     *
     */
    readAllClick: function() {
        if (!this.offlineArticles.length) {
            this.$.spinner.show();
            this.articles.markAllRead(this.markedAllArticlesRead.bind(this, this.articles.items.length, false));
        }
        return;
    },

    refreshClick: function() {
        if (!this.offlineArticles.length) {
            this.$.spinner.show();
            this.$.spinner.applyStyle("display", "inline-block");
            this.articles.items = [];
            this.articlesChanged();
            this.articles.findArticles(this.foundArticles.bind(this), function() {enyo.log("failed to find articles");});
        } else {
            this.app.feedClicked("", {title: "Offline Articles", isOffline: true}, false);
        }
    },

    offlineClick: function() {
        if (!!this.articles.items && !!this.articles.items.length) {
            var articles = this.articles.items;
            if (articles.any(function(n) {return !n.isOffline;})) {
                // offline any articles that are not offline
                var dataToInsert = [];
                for (var i = articles.length; i--;) {
                    if (!articles[i].isOffline) {
                        dataToInsert[dataToInsert.length] = {
                            author: Encoder.htmlEncode(articles[i].author),
                            title: Encoder.htmlEncode(articles[i].title),
                            displayDate: articles[i].displayDate,
                            origin: Encoder.htmlEncode(articles[i].origin),
                            summary: Encoder.htmlEncode(articles[i].summary),
                            url: Encoder.htmlEncode(articles[i].url)
                        }
                    }
                }
                this.app.$.articlesDB.insertData({
                    table: "articles",
                    data: dataToInsert
                }, {
                    onSuccess: function(results) {
                        Feeder.notify("Saved all articles offline"); 
                        this.$.spinner.hide(); 
                        this.checkIfArticlesOffline(); 
                        this.doChangedOffline();
                    }.bind(this),
                    onFailure: function() {Feeder.notify("Failed to save articles offline"); this.$.spinner.hide();}.bind(this)
                });
            } else {
                // delete all articles that are offline
                this.$.offlineChoicePopup.show();
            }
        } else if (!!this.offlineArticles && !!this.offlineArticles.length) {
            this.$.offlineChoicePopup.show();
        }
    },

    confirmClick: function() {
        var articles;
        if (!!this.articles.items && !!this.articles.items.length) {
            articles = this.articles.items;
        } else if (!!this.offlineArticles && !!this.offlineArticles.length) {
            articles = this.offlineArticles;
        } else {
            this.$.offlineChoicePopup.hide();
            return;
        }
        var queries = [];
        for (var i = articles.length; i--;) {
            if (!!articles[i].isOffline || !!this.offlineArticles) {
                queries[queries.length] = "DELETE FROM articles WHERE articleID="+articles[i].articleID;
            }
        }
        this.app.$.articlesDB.queries(queries, {onSuccess: function() {
            Feeder.notify("Deleted all articles offline"); 
            this.$.spinner.hide(); 
            this.checkIfArticlesOffline(); 
            this.doChangedOffline();
        }.bind(this), onFailure: function() {Feeder.notify("Failed to delete articles offline"); this.$.spinner.hide();}.bind(this)});
        this.$.offlineChoicePopup.hide();
    },

    cancelClick: function() {
        this.$.offlineChoicePopup.hide();
    },

    fontClick: function(source, inEvent) {
        this.$.fontsPopup.show();
    },

    chooseFont: function(source, inEvent) {
        this.$.fontsPopup.hide();
        Preferences.setArticleListFontSize(source.content.toLowerCase());
        this.$.articlesList.removeClass("small");
        this.$.articlesList.removeClass("medium");
        this.$.articlesList.removeClass("large");
        this.$.articlesList.addClass(Preferences.getArticleListFontSize());
        this.$.articlesList.build();
    },


    /*
     *
     Load Articles
     *
     */
    offlineArticlesChanged: function() {
        this.articlesChangedHandler();
        for (var i = this.offlineArticles.length; i--;) {
            this.offlineArticles[i].sortDate = +(new Date(this.offlineArticles[i].displayDate));
            this.offlineArticles[i].sortOrigin = this.offlineArticles[i].origin.replace(/[^a-zA-Z 0-9 ]+/g,'');
        }
        this.$.spinner.hide();
        this.articles = [];
        this.heights = [];
        if (Preferences.groupFoldersByFeed()) {
            this.offlineArticles.sort(this.originSortingFunction);
            this.offlineArticles = this.sortSortedArticlesByDate(this.offlineArticles);
        } else {
            if (Preferences.isOldestFirst()) {
                this.offlineArticles.sort(function(a, b) {return a.sortDate - b.sortDate;});
            } else {
                this.offlineArticles.sort(function(a, b) {return b.sortDate - a.sortDate;});
            }
        }
        this.$.articlesList.setCount(this.offlineArticles.length);
        (function() {
            this.reflow();
        }.bind(this)).defer();
        if (this.wasOfflineSet) {
            this.selectArticle(0);
        } else {
            this.wasOfflineSet = true;
        }
        if (!!this.offlineArticles.length) {
                this.$.emptyNotice.hide();
        } else {
                this.$.emptyNotice.show();
        }
        this.wasFolderChild = false;
    },

    articlesChanged: function() {
        enyo.log("CHANGED ARTICLES");
        this.wasFolderChild = false;
        this.articlesChangedHandler();
        this.offlineArticles = [];
        this.articles.items = [];
        this.heights = [];
        if (this.articles.canMarkAllRead) {
            this.$.readAllButton.setSrc("images/read-footer.png");
        } else {
            //set disabled state for read button
        }
        this.$.spinner.show();
        this.$.spinner.applyStyle("display", "inline-block");
        this.overrodeHide = false;
        this.originalHide = Preferences.hideReadArticles();
        if (!!this.articles.query || this.articles.title == "Starred" || this.articles.title == "Shared") {
            this.overrodeHide = true;
            Preferences.setHideReadArticles(false);
        }
        //if (isGettingStarredArticles) {
            //this.isGettingStarredArticles = true;
            //this.articles.getStarredArticlesFor(this.foundArticles.bind(this), function() {enyo.log("failed to find starred articles");});
        //} else {
            this.articles.findArticles(this.foundArticles.bind(this), function() {enyo.log("failed to find articles");});
        //}
    },

    articlesChangedHandler: function() {
        if (!!chrome && !!chrome.tabs) {
            //this.$.articlesScroller.node.setStyle({overflowY: "scroll"});
        }
        this.$.articlesScroller.scrollToTop();
        this.$.articlesList.setCount(0);
        (function() {
            this.reflow();
        }.bind(this)).defer();
        this.itemsToMarkRead = [];
        this.$.articlesList.removeClass("small");
        this.$.articlesList.removeClass("medium");
        this.$.articlesList.removeClass("large");
        this.$.articlesList.addClass(Preferences.getArticleListFontSize());
        this.itemsToHide = {};
        this.originCount = {};
        this.checkAllArticlesOffline();
    },

    foundArticles: function() {
        enyo.log("FOUND ARTICLES");
        if (!this.isGettingStarredArticles) {
            if (Preferences.hideReadArticles()) {
                for (var i = this.articles.items.length; i--;) {
                    if (this.articles.items[i].isRead) {
                        this.articles.items.splice(i, 1);
                    }
                }
            }
            if (this.overrodeHide) {
                Preferences.setHideReadArticles(this.originalHide);
                this.overrodeHide = false;
            }
            if (Preferences.groupFoldersByFeed()) {
                for (var i = this.articles.items.length; i--;) {
                    if (!!this.articles.items[i].displayDateAndTime) {
                        this.articles.items[i].sortDateTime = +(new Date(this.articles.items[i].displayDateAndTime));
                    }
                    this.articles.items[i].sortDate = +(new Date(this.articles.items[i].displayDate));
                    if (!this.articles.items[i].origin) {
                        this.articles.items[i].origin = "Unsubscribed";
                    }
                    this.articles.items[i].sortOrigin = this.articles.items[i].origin.replace(/[^a-zA-Z 0-9 ]+/g,'');
                }
                if (this.articles.items.length && this.articles.showOrigin) {
                    this.articles.items.sort(this.originSortingFunction);
                    this.articles.items = this.sortSortedArticlesByDate(this.articles.items);
                }
            }
        }
        this.$.spinner.hide();
        enyo.log("TELLING ARTICLES LIST TO RENDER");
        this.$.articlesList.setCount(this.articles.items.length);
        (function() {
            this.reflow();
        }.bind(this)).defer();
        enyo.log("FINISHED TELLING ARTICLES LIST TO RENDER");
        if (this.articles.items.length) {
            this.selectArticle(0);
        }
        if (!!this.articles.items.length) {
                this.$.emptyNotice.hide();
        } else {
                this.$.emptyNotice.show();
        }
        this.checkIfArticlesOffline();
    },

    checkIfArticlesOffline: function() {
        if (!!this.articles.items) {
            var articles = this.articles.items;
            var numArticles = articles.length;
            for (var i = 0; i < numArticles; i++) {
                this.app.$.articlesDB.query('SELECT articleID FROM articles WHERE title="' + Encoder.htmlEncode(articles[i].title) + '"', {onSuccess: this.offlineCallback.bind(this, articles[i]), onFailure: function() {enyo.log("failed to check if article offline");}});
            }
        } else {
            this.checkAllArticlesOffline();
        }
    },
    offlineCallback: function(article, results) {
        if (results.length) {
            article.isOffline = true;
            article.articleID = results[0].articleID
        } else {
            article.isOffline = false;
            article.articleID = undefined;
        }
        this.checkAllArticlesOffline();
    },

    checkAllArticlesOffline: function() {
        if (!!this.articles.items) {
            var articles = this.articles.items;
            if (articles.any(function(n) {return !n.isOffline;})) {
                this.$.offlineButton.setSrc("images/offline-article.png");
            } else {
                this.$.offlineButton.setSrc("images/delete-article.png");
            }
        } else if (!!this.offlineArticles) {
            this.$.offlineButton.setSrc("images/delete-article.png");
        }
    },
    
    getListArticles: function(inSender, inEvent) {
        var inIndex = inEvent.index;
        var item = inEvent.item;
        enyo.log("get list articles for: " + inIndex);
        if (inIndex < 0) {
            return false;
        }
        var articles = [];
        var inOfflineArticles = false;
        var testDiv = document.getElementById("articleTestDiv");
        var subDiv = document.getElementById("articleSubDiv");
        testDiv.parentNode.setStyle({width: (Element.measure(this.$.articlesList.node, "width") - 28) + "px"}); //width - 16px for padding
        if (!!this.offlineArticles.length) {
            inOfflineArticles = true;
        }
        if (inOfflineArticles) {
            articles = this.offlineArticles;
        } else {
            if (!!this.articles.items) {
                articles = this.articles.items;
            }
        }
        /*
        var scroller = this.$.articlesList.$.scroller;
        var numberRendered = scroller.bottom - scroller.top;
        if (numberRendered > this.numberRendered) {
            this.numberRendered = numberRendered;
        }
        */
        if (articles.length) {
            if (inIndex > articles.length) {
                return false;
            }
            var r = articles[inIndex];
            if (!!r) {
                if (!!this.itemsToHide[r.origin]) {
                    item.$.articleItem.hide();
                    if (!!r.displayOrigin) {
                        item.$.divider.setCaption(r.displayOrigin);
                    } else {
                        item.$.divider.setCaption(r.origin);
                    }
                    item.$.divider.show();
                } else {
                    item.$.articleItem.show();
                    if (!r.isRead && !inOfflineArticles) {
                        item.$.articleItem.addClass("unread-item");
                        testDiv.parentNode.addClassName("unread-item");
                    } else {
                        item.$.articleItem.removeClass("unread-item");
                    }
                    if (r.isStarred && !inOfflineArticles) {
                        item.$.title.addClass("starred");
                        testDiv.addClassName("starred");
                    } else {
                        item.$.title.removeClass("starred");
                    }
                    if (inIndex == this.selectedRow) {
                        item.$.articleItem.addClass("itemSelected");
                        testDiv.parentNode.addClassName("itemSelected");
                    } else {
                        item.$.articleItem.removeClass("itemSelected");
                    }
                    if (this.articles.showOrigin && (Preferences.groupFoldersByFeed())) {
                        item.$.origin.setContent(!!r.displayDateAndTime ? r.displayDateAndTime : r.displayDate);
                        subDiv.innerHTML = !!r.displayDateAndTime ? r.displayDateAndTime : r.displayDate;
                    } else {
                        item.$.origin.setContent(r.origin);
                        subDiv.innerHTML = r.origin;
                    }
                    if (!r.altTitle) {
                        r.altTitle = r.title;
                    }
                    testDiv.innerHTML = Encoder.htmlDecode(r.altTitle);
                    if (inIndex == 9) {
                        enyo.log("HEIGHT MEASURES");
                        enyo.log(testDiv.scrollHeight);
                        enyo.log(testDiv.offsetHeight);
                        enyo.log(testDiv.offsetHeight * 1.20);
                        enyo.log(testDiv.scrollHeight > (+testDiv.offsetHeight * 1.20));
                    }
                    while (testDiv.scrollHeight > (+testDiv.offsetHeight * 1.20)) {
                        r.altTitle = r.altTitle.replace(/\W*\s(\S)*$/, "...");
                        testDiv.innerHTML = Encoder.htmlDecode(r.altTitle);
                        if (inIndex == 9) {
                            enyo.log("HEIGHT MEASURES");
                            enyo.log(testDiv.scrollHeight);
                            enyo.log(testDiv.offsetHeight);
                            enyo.log(testDiv.offsetHeight * 1.20);
                            enyo.log(testDiv.scrollHeight > (+testDiv.offsetHeight * 1.20));
                        }
                    }
                    this.heights[inIndex] = testDiv.parentNode.offsetHeight;
                    /*
                    if (inIndex != articles.length - 1) {
                    testDiv.removeClassName("starred");
                    testDiv.parentNode.removeClassName("unread-item");
                    testDiv.parentNode.removeClassName("itemSelected");
                    testDiv.innerHTML = "";
                    subDiv.innerHTML = "";
                    }
                    */
                    item.$.title.setContent(Encoder.htmlDecode(r.altTitle));
                    if ((inOfflineArticles || this.articles.showOrigin) && (Preferences.groupFoldersByFeed())) {
                        if (inIndex > 0 && articles[inIndex - 1].origin == r.origin) {
                            item.$.divider.setCaption("");
                            item.$.divider.hide();
                        } else {
                            if (!!r.displayOrigin) {
                                item.$.divider.setCaption(r.displayOrigin);
                            } else {
                                item.$.divider.setCaption(r.origin);
                            }
                            item.$.divider.show();
                            this.heights[inIndex] += 30; //30px height of divider
                        }
                    } else {
                        if (inIndex > 0 && articles[inIndex - 1].sortDate == r.sortDate) {
                            item.$.divider.setCaption("");
                            item.$.divider.hide();
                        } else {
                            item.$.divider.setCaption(r.displayDate);
                            if (!!r.displayDate) {
                                item.$.divider.show();
                                this.heights[inIndex] += 30;
                            } else {
                                item.$.divider.hide();
                            }
                        }
                    }
                    if (Preferences.markReadAsScroll()) {
                        //just add them to mark read queue as they are rendered
                        /*
                        if (!articles[inIndex].isRead) {
                            this.addToMarkReadQueue(articles[inIndex], inIndex);
                        }
                        */
                        /*
                            if (scroller.top > this.maxTop && !this.offlineArticles.length) {
                                for (var i = this.maxTop; i < scroller.top; i++) {
                                    if (!articles[i].isRead) {
                                    }
                                }
                                this.maxTop = scroller.top;
                            }
                            if (scroller.bottom >= articles.length - (this.$.articlesList.getLookAhead()) && !this.offlineArticles.length) {
                                var count = this.articles.getUnreadCount();
                                for (var i = this.maxTop; i < articles.length; i++) {
                                    if (!articles[i].isRead && !articles[i].keepUnread) {
                                        this.addToMarkReadQueue(articles[i], i);
                                    }
                                }
                            }
                            */
                    }
                }
                return true;
            } else {
                return false;
            }
        }
    },


    addToMarkReadQueue: function(article, index) {
        clearTimeout(this.markReadTimeout);
        if (!article.isRead) {
            if (!this.itemsToMarkRead.any(function(n) {return n.article.id == article.id;})) {
                this.itemsToMarkRead.push({article: article, index: index});
            }
        }
        this.markReadTimeout = setTimeout(function() {
            enyo.log("TRIGGERED MARK ARTICLE READ TIMEOUT");
            if (this.itemsToMarkRead.length == this.articles.items.length) {
                //var count = this.articles.getUnreadCount();
                //this.articles.markAllRead(this.markedAllArticlesRead.bind(this, count, true), function() {enyo.log("error marking all read");});
                this.markedReadOnScroll = true;
                this.readAllClick();
            } else {
                var articles = [];
                for (var i = this.itemsToMarkRead.length; i--;) {
                    var article = this.itemsToMarkRead[i].article;
                    if (!article.isRead) {
                        article.index = this.itemsToMarkRead[i].index;
                        articles.push(article);
                    }
                }
                this.articles.markMultipleArticlesRead(articles, this.markedMultipleArticlesRead.bind(this, articles), function() {enyo.log("error marking multiple articles read");});
            }
            this.itemsToMarkRead = [];
            this.markReadTimeout = 0;
            enyo.log("FINISHED MARKING ARTICLES READ");
        }.bind(this), 1500);
    },

    markedArticleRead: function(article, index) {
        this.finishArticleRead(index);
        this.doArticleRead({article: article, index: index});
        var count = this.articles.getUnreadCount();
        if (count === 0) {
            this.$.spinner.hide();
            this.app.$.slidingPane.setIndex(0);
            (function() {
                this.reflow();
            }.bind(this)).defer();
        }
    },

    markedMultipleArticlesRead: function(articles, markedAllRead) {
        if (!this.articles) {
            return;
        }
        if (!!markedAllRead) {
            this.$.spinner.hide()
            if (!this.markedReadOnScroll) {
                this.app.$.slidingPane.setIndex(0);
            } else {
                this.markedReadOnScroll = false;
            }
            enyo.log("would have punted");
            this.$.articlesList.build();
            (function() {
                this.reflow();
            }.bind(this)).defer();
            this.doAllArticlesRead({count: articles.length, id: this.articles.id, isMultiple: true, articles: articles});
        } else {
            var apiArticles = this.articles.items;
            var unreadCountObj = {};
            var count = 0;
            for (var i = articles.length; i--;) {
                var index = articles[i].index;
                var article = apiArticles[index];
                this.doArticleMultipleRead({article: article, index: index});
                enyo.log("GETTING UNREAD COUNT FOR SUBSCRIPTION FOR ARTICLE");
                if (!unreadCountObj[article.subscriptionId]) {
                    unreadCountObj[article.subscriptionId] = 0;
                }
                unreadCountObj[article.subscriptionId] = this.app.getUnreadCountForSubscription(article.subscriptionId);
                enyo.log("GOT UNREAD COUNT FOR SUBSCRIPTION IN ARTICLE");
            }
            for (var i in unreadCountObj) {
                if (unreadCountObj.hasOwnProperty(i)) {
                    count += unreadCountObj[i];
                }
            }
            //var count = this.articles.getUnreadCount();
            enyo.log("COUNT FOR MARKED MULTIPLE: " + count);
            if (count === 0) {
                this.$.spinner.hide()
                if (this.wasMarkingAllRead) {
                    this.wasMarkingAllRead = false;
                    this.app.$.slidingPane.setIndex(0);
                    enyo.log("would have punted");
                    this.$.articlesList.build();
                    (function() {
                        this.reflow();
                    }.bind(this)).defer();
                }
            } else {
            }
        }
    },

    markedAllArticlesRead: function(count, wasScrolling) {
        this.$.spinner.hide();
        if (!wasScrolling) {
            this.app.$.slidingPane.setIndex(0);
            enyo.log("would have punted");
            this.$.articlesList.build();
            (function() {
                this.reflow();
            }.bind(this)).defer();
        }
        this.doAllArticlesRead({count: count, id: this.articles.id, isMultiple: false});
    },

    articleItemClick: function(inSender, inEvent) {
        this.wasClicked = true;
        this.articleClicked = true;
        this.selectArticle(inEvent.index);
    },
    headerClick: function(inSender, inEvent) {
        if ((this.offlineArticles.length || this.articles.showOrigin) && (Preferences.groupFoldersByFeed())) {
            var isEmpty = true;
            for (var i in this.itemsToHide) {
                if (this.itemsToHide.hasOwnProperty(i)) {
                    isEmpty = false;
                }
            }
            var articles = [];
            if (this.offlineArticles.length) {
                articles = this.offlineArticles;
            } else {
                if (!!this.articles.items) {
                    articles = this.articles.items;
                }
            }
            if (isEmpty) {
                for (var l = articles.length; l--;) {
                    if (!this.itemsToHide[articles[l].origin]) {
                        var article = articles[l];
                        this.itemsToHide[article.origin] = {items: []};
                        var firstIndex = -1;
                        for (var z = 0; z < articles.length; z++) {
                            if (articles[z].origin == article.origin) {
                                if (firstIndex < 0) {
                                    firstIndex = z;
                                }
                                var temp = articles.splice(z, 1);
                                this.itemsToHide[article.origin].items.push(temp[0]);
                                z--;
                            }
                        }
                        var itemToSplice = {origin: article.origin, sortOrigin: article.origin.replace(/[^a-zA-Z 0-9 ]+/g, ''), sortDate: article.sortDate};
                        if (!!article.sortDateTime) {
                            itemToSplice.sortDateTime = article.sortDateTime;
                        }
                        articles.splice(z, 0, itemToSplice);
                        l = articles.length;
                    }
                }
                articles.sort(this.originSortingFunction);
                articles = this.sortSortedArticlesByDate(articles);
                this.$.articlesScroller.scrollToTop();
            } else {
                for (var origin in this.itemsToHide) {
                    if (this.itemsToHide.hasOwnProperty(origin)) {
                        for (var i = articles.length; i--;) {
                            if (articles[i].origin == origin) {
                                articles.splice(i, 1);
                            }
                        }
                        for (var i = 0; i < this.itemsToHide[origin].items.length; i++) {
                            articles.push(this.itemsToHide[origin].items[i]);
                        }
                        delete this.itemsToHide[origin];
                    }
                }
                articles.sort(this.originSortingFunction);
                articles = this.sortSortedArticlesByDate(articles);
            }
            enyo.log("would have refreshed");
            this.$.articlesList.setCount(articles.length);
            (function() {
                this.reflow();
            }.bind(this)).defer();
        }
    },
    articleDividerClick: function(inSender, inEvent) {
        enyo.log("article divider click");
        enyo.log(inEvent);
        var articles = [];
        if (this.offlineArticles.length) {
            articles = this.offlineArticles;
        } else {
            if (!!this.articles.items) {
                articles = this.articles.items;
            }
        }
        var article = articles[inEvent.index];
        if ((this.offlineArticles.length || this.articles.showOrigin) && (Preferences.groupFoldersByFeed())) {
            if (!!this.itemsToHide[article.origin]) {
                for (var i = articles.length; i--;) {
                    if (articles[i].origin == article.origin) {
                        articles.splice(i, 1);
                    }
                }
                for (var i = 0; i < this.itemsToHide[article.origin].items.length; i++) {
                    articles.push(this.itemsToHide[article.origin].items[i]);
                }
                articles.sort(this.originSortingFunction);
                articles = this.sortSortedArticlesByDate(articles);
                delete this.itemsToHide[article.origin];
            } else {
                this.itemsToHide[article.origin] = {items: []};
                var firstIndex = -1;
                for (var i = 0; i < articles.length; i++) {
                    if (articles[i].origin == article.origin) {
                        if (firstIndex < 0) {
                            firstIndex = i;
                        }
                        var temp = articles.splice(i, 1);
                        this.itemsToHide[article.origin].items.push(temp[0]);
                        i--;
                    }
                }
                var itemToSplice = {origin: article.origin, sortOrigin: article.origin.replace(/[^a-zA-Z 0-9 ]+/g, ''), sortDate: article.sortDate};
                if (!!article.sortDateTime) {
                    itemToSplice.sortDateTime = article.sortDateTime;
                }
                articles.splice(i, 0, itemToSplice);

                articles.sort(this.originSortingFunction);
                articles = this.sortSortedArticlesByDate(articles);
            }
            enyo.log("would have refreshed");
            this.$.articlesList.setCount(articles.length);
            (function() {
                this.reflow();
            }.bind(this)).defer();
        }
    },

    getHalfHeight: function() {
        return this.$.articlesList.node.offsetHeight * .70;
    },

    selectArticle: function(index) {
        enyo.log(index);
        this.selectedRow = index;
        var previousIndex = this.app.$.singleArticleView.getIndex();
        if (!(!this.articleClicked && previousIndex > -1 && index > -1)) {
            var info = enyo.fetchDeviceInfo();
            if (!!info) {
                var height = info.screenHeight;
                if (height == 320 || height == 400 || height == 480 || height == 800) {
                    enyo.application.app.$.slidingPane.setIndex(2);
                }
            }
        } else {
            var height = 0;
            for (var i = 0; i < index; i++) {
                height += this.heights[i];
            }
            var halfHeight = this.$.articlesScroller.node.clientHeight / 2;
            var newHeight = height - halfHeight;
            if (newHeight > 0) {
                this.$.articlesScroller.setScrollTop(height - halfHeight);
            } else {
                this.$.articlesScroller.setScrollTop(0);
            }
            //this.$.articlesScroller.scrollIntoView(this.$.articlesList.children[index]);
        }
        this.articleClicked = false;
        var article;
        var length = 0;
        if (!!this.offlineArticles && !!this.offlineArticles.length) {
            article = this.offlineArticles[index];
            length = this.offlineArticles.length;
        } else if (!!this.articles.items && !!this.articles.items.length) {
            article = this.articles.items[index];
            length = this.articles.items.length;
        } else {
            // would have refreshed
            this.$.articlesList.build();
            (function() {
                this.reflow();
            }.bind(this)).defer();
            return;
        }
        this.doArticleClicked({article: article, index: index, maxIndex: length - 1});
        this.renderRow(index);
        this.renderRow(previousIndex);
        //this.$.articlesList.renderRow(index);
        //this.$.articlesList.renderRow(previousIndex);
        //this.$.articlesList.build();
        //this.reflow();
    },
    finishArticleRead: function(index) {
        //this.$.articlesList.renderRow(index);
        this.renderRow(index);
        //this.$.articlesList.build();
        //this.reflow();
    },
    finishArticleStarred: function(index, isStarred) {
        //this.$.articlesList.renderRow(index);
        //this.$.articlesList.build();
        //this.reflow();
        this.renderRow(index);
        var article;
        if (this.offlineArticles.length) {
            article = this.offlineArticles[index];
        } else {
            article = this.articles.items[index];
        }
        this.doArticleStarred();
    },
    renderRow: function(index) {
        enyo.log("IS RENDERING ROW");
        this.$.articlesList.doSetupItem({index: index, item: this.$.articlesList.itemAtIndex(index)});
    },
    swipedArticle: function(inSender, inIndex, thing) {
        if (this.articles.items.length) {
            if (this.articles.items[inIndex]) {
                if (this.articles.items[inIndex].isStarred) {
                    this.articles.items[inIndex].turnStarOff(this.finishArticleStarred.bind(this, inIndex, false), function() {Feeder.notify("Failed to remove star");});
                } else {
                    this.articles.items[inIndex].turnStarOn(this.finishArticleStarred.bind(this, inIndex, true), function() {Feeder.notify("Failed to add star");});
                }
            }
        }
    },
    originSortingFunction: function(a, b) {
        var originA = a.sortOrigin.toLowerCase();
        var originB = b.sortOrigin.toLowerCase();
        if (originA < originB) {return -1;}
        if (originB < originA) {return 1;}
        return 0;
    },
    sortSortedArticlesByDate: function(articles) {
        var start = 0;
        var i = 0;
        while (i < articles.length) {
            var temp = [];
            var origin = articles[i].origin;
            while (!!articles[i] && articles[i].origin == origin) {
                temp[temp.length] = articles[i];
                i++;
            }
            if (!!temp[0].sortDateTime) {
                if (Preferences.isOldestFirst()) {
                    temp.sort(function(a, b) {return a.sortDateTime - b.sortDateTime;});
                } else {
                    temp.sort(function(a, b) {return b.sortDateTime - a.sortDateTime;});
                }
            } else {
                if (Preferences.isOldestFirst()) {
                    temp.sort(function(a, b) {return a.sortDate - b.sortDate;});
                } else {
                    temp.sort(function(a, b) {return b.sortDate - a.sortDate;});
                }
            }
            var numberOfArticles = temp.length;
            for (var j = 0; j < temp.length; j++) {
                articles[start + j] = temp[j];
                if (!!this.originCount[articles[start + j].origin]) {
                    articles[start + j].displayOrigin = "(" + this.originCount[articles[start + j].origin] + ") " + articles[start + j].origin;
                } else {
                    articles[start + j].displayOrigin = "(" + numberOfArticles + ") " + articles[start + j].origin;
                    this.originCount[articles[start + j].origin] = numberOfArticles;
                }
            }
            start = i;
        }
        return articles;
    },
    reloadArticles: function() {
        if (this.offlineArticles.length) {
            var articles = this.offlineArticles;
            for (var origin in this.itemsToHide) {
                if (this.itemsToHide.hasOwnProperty(origin)) {
                    for (var i = articles.length; i--;) {
                        if (articles[i].origin == origin) {
                            articles.splice(i, 1);
                        }
                    }
                    for (var i = 0; i < this.itemsToHide[origin].items.length; i++) {
                        articles.push(this.itemsToHide[origin].items[i]);
                    }
                    delete this.itemsToHide[origin];
                }
            }
            if (Preferences.isOldestFirst()) {
                articles.sort(function(a, b) {return a.sortDate - b.sortDate;});
            } else {
                articles.sort(function(a, b) {return b.sortDate - a.sortDate;});
            }
            this.offlineArticlesChanged();
        } else {
            if (this.articles.showOrigin) {
                this.articlesChanged();
            }
        }
    },

    articleListMouseMove: function(inSource, inEvent) {
        return;
        enyo.log("article mouse move");
        this.isMouseOver = true;
        var elY = this.findY(this);
        var y = inEvent.pageY - elY;
        this.mouseY = y;
        /*
        var el = this.$.articlesList.$.scroller.node.firstChild.firstChild;
        if (el.style.cssText.indexOf("important") > -1) {
            el.style.cssText = "height: 2048px; -webkit-transform: translate3d(0px, " + (-this.lastTop) + "px, 0px);";
        }
        */
    },

    findY: function() {
        var list = this.$.articlesList.node;
        var curtop = 0;
        do {
            curtop += list.offsetTop;
        } while (list = list.offsetParent);
        return curtop;
    },

    findX: function() {
        var el = enyo.$.main.$.articlesView.$.articlesList.node.offsetParent;
        var match = el.style.cssText.match(/translate3d\(-{0,1}(\d+)px/);
        var translate3dx = 0;
        if (!!match) {
            translate3dx = +match[1];
        }
        return Element.measure(el, "width") - translate3dx;
        var list = this.$.articlesList.node;
        var curtop = 0;
        do {
            curtop += list.offsetLeft;
        } while (list = list.offsetParent);
        return curtop;
    },

    articleListMouseOut: function() {
        this.isMouseOver = false;
    },

    scrollStart: function() {
        enyo.log("ARTICLE LIST SCROLL STARTED");
    },

    scrollStop: function() {
        enyo.log("ARTICLE LIST SCROLL STOPPED");
    },

    scrollList: function() {
        return;
        if (this.isMouseOver && !window.PalmSystem) {
            if (!!this.$.articlesList.node) {
                var height = this.$.articlesList.node.offsetHeight;
                var y = this.mouseY;
                //if (y < 180) {
                if (y < 60) { // decide between stuff
                    if (!this.didScrollToTop) {
                        if (y < 60) {
                            enyo.log(this.threshold);
                            this.threshold++;
                            if (this.threshold > 5) {
                                this.scrollBy(20);
                            }
                        }/* else if (y < 120) {
                            this.scrollBy(10);
                        } else {
                            this.scrollBy(5);
                        }
                        */
                        if (this.getScrollY() > this.getTopBoundary()) {
                            this.didScrollToTop = true;
                        }
                    }
                } else {
                    this.didScrollToTop = false;
                }
                //if (height - y < 180) {
                if (height - y < 180) {
                    if (!this.didScrollToBottom) {
                        var del = height - y;
                        if (del < 60) {
                            this.threshold++;
                            if (this.threshold > 5) {
                                this.scrollBy(-20);
                            }
                        }/* else if (del < 120) {
                            this.scrollBy(-10);
                        } else {
                            this.scrollBy(-5);
                        }
                        */
                        if (this.getScrollY() < this.getBottomBoundary()) {
                            this.didScrollToBottom = true;
                        }
                    }
                } else {
                    this.didScrollToBottom = false;
                }
                //if (!((y < 180) || (height - y < 180))) {
                if (!((y < 60) || (height - y < 60))) { 
                    this.threshold = 0;
                }
            }
        }
        setTimeout(this.scrollList.bind(this), 60);
    },

    articleMouseWheel: function(inSource, inEvent) {
        return true;
        var del = inEvent.wheelDeltaY;
        inEvent.stopPropagation();
        inEvent.preventDefault();
        inEvent.wheelDeltaY = 0;
        this.scrollBy(inEvent.wheelDeltaY / 3);
        return -1;
    },

    scrollBy: function(amount) {
        var scroller = this.$.articlesList.$.scroller;
        var scroll = scroller.$.scroll;
        var y = scroll.y;
        this.shouldAdjust = false;
        if (amount < 0) {
            if (y + amount < this.bottom) {
                amount = this.bottom - y - 1;
            }
        } else {
            if (y + amount > 0) {
                amount = -y;
            }
        }
        scroll.mousewheel({wheelDeltaY: amount});
        setTimeout(function() {
            var bottomBoundary = scroll.bottomBoundary;
            if (bottomBoundary == -9e9) {
                return;
            }
            if (this.bottom == -9e9) {
                this.bottom = bottomBoundary;
                return;
            }
            if (bottomBoundary < this.bottom) {
                this.bottom = bottomBoundary;
            }
        }.bind(this), 1000/15);
    },

    getTopBoundary: function() {
        return this.$.articlesList.$.scroller.$.scroll.topBoundary;
    },

    getBottomBoundary: function() { 
        return this.$.articlesList.$.scroller.$.scroll.bottomBoundary;
    },

    getScrollY: function() {
        return this.$.articlesList.$.scroller.$.scroll.y;
    },

    grabberClicked: function() {
        console.log("clicked grabber for articles");
        var arg = "articles";
        this.doGrabberClicked({source: "articles"});
    },
});
