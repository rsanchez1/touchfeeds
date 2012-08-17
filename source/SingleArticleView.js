enyo.kind({
    name: "TouchFeeds.SingleArticleView",
    kind: "FittableRows",
    style: "height: 100%;",
    dragAnywhere: false,
    gestureY: 0,
    fetchedOffline: false,
    classes: "enyo-bg secondaryPane",
    published: {
        article: {},
        subscriptions: {},
        index: 0,
        maxIndex: 0,
    },
    events: {
        onSelectArticle: "",
        onRead: "",
        onStarred: "",
        onChangedOffline: "",
        onGrabberClicked: ""
    },
    onSlideComplete: "resizedPane",
    components: [
        {name: "headerButtons", kind: "onyx.Toolbar", style: "height: 54px;", classes: "headerButtons", components: [
            {name: "readButton", kind: "onyx.IconButton", classes: "leftmostButton", src: "images/read-footer.png", onclick: "readClick", style: "background-color: transparent !important; -webkit-border-image: none !important; position: relative; margin-left: 40px;"},
            {name: "fontButton", kind: "onyx.IconButton", classes: "leftmiddleButton", src: "images/icon_fonts.png", onclick: "fontClick", style: "background-color: transparent !important; -webkit-border-image: none !important; position: relative;"},
            {name: "offlineButton", kind: "onyx.IconButton", classes: "rightmiddleButton", src: "images/offline-article.png", onclick: "offlineClick", style: "background-color: transparent !important; -webkit-border-image: none !important; position: relative;"},
            {name: "fetchButton", kind: "onyx.IconButton", classes: "rightmostButton", src: "images/fetch-text.png", onclick: "fetchClick", style: "background-color: transparent !important; -webkit-border-image: none !important; position: relative;"},
            {kind: "Spinner", showing: false, classes: "articleSpinner", style: "position: absolute;"},
        ]},
        {name: "articleScroller", classes: "enyo-fit", style: "position: relative;", horizontal: "hidden", vertical: "scroll", kind: "enyo.Scroller", fit: true, touch: false, ondragstart: "scrollerDragStart", ondragfinish: "scrollerDragFinish", onScrollStop: "articleScrollStop", components: [
            {name: "aboutContainer", classes: "articleContainer", components: [
                {name: "articleTitle", allowHtml: true, style: "font-size: 1.6rem; font-weight: 700; color: #555; padding-bottom: 10px; word-spacing: 0.1rem; line-height: 2rem;", onclick: "sourceClick", classes: "singleArticleTitle"},
                {name: "postDate", allowHtml: true},
                {name: "source", allowHtml: true}
            ]},
            {name: "summary", classes: "articleSummary", allowHtml: true,/*kind: "HtmlContent",*/ onLinkClick: "articleLinkClicked", ondragstart: "summaryDragStart", ondrag: "summaryDrag", ondragfinish: "summaryDragFinish", ongesturestart: "summaryGestureStart", ongestureend: "summaryGestureEnd"},
        ]},
        {kind: "onyx.Toolbar", name: "footerButtons", classes: "footerButtons", components: [
            {kind: "onyx.Grabber", slidingHandler: true, onclick: "grabberClicked"},
            {name: "shareButton", kind: "onyx.IconButton", classes: "leftmostButton", src: "images/sendto-footer.png", onclick: "shareClick", style: "background-color: transparent !important; -webkit-border-image: none !important; position: relative; top: 1px;"},
            {name: "starButton", kind: "onyx.IconButton", classes: "leftmiddleButton", src: "images/starred-footer.png", onclick: "starClick", style: "background-color: transparent !important; -webkit-border-image: none !important; position: relative; top: 1px;"},
            {name: "previousButton", kind: "onyx.IconButton", classes: "rightmiddleButton", src: "images/previous-article.png", onclick: "previousClick", style: "background-color: transparent !important; -webkit-border-image: none !important; position: relative; top: 1px;"},
            {name: "nextButton", kind: "onyx.IconButton", classes: "rightmostButton", src: "images/next-article.png", onclick: "nextClick", style: "background-color: transparent !important; -webkit-border-image: none !important; position: relative; top: 1px;"}
        ]},
        {name: "fontsPopup", style: "top: 0px; left: 30%; margin-left: 70px; cursor: default;", kind: "onyx.Popup", classes: "touchfeeds-popup", showing: false, modal: false, dismissWithClick: true, components: [
            {content: "Small", classes: "touchfeeds-menu-item", onclick: "chooseFont"},
            {content: "Medium", classes: "touchfeeds-menu-item", onclick: "chooseFont"},
            {content: "Large", classes: "touchfeeds-menu-item", onclick: "chooseFont"}
        ]},
        {name: "sharePopup", kind: "onyx.Popup", modal: false, dismissWithClick: true, components: [
            {name: "googleShare", caption: "Share with Google", shareValue: "google", onclick: "chooseShare"},
            {caption: "Share with Twitter", shareValue: "twitter", onclick: "chooseShare"},
            {caption: "Share with Facebook", shareValue: "facebook", onclick: "chooseShare"},
            {caption: "Share with Read it Later", shareValue: "readitlater", onclick: "chooseShare"},
            {caption: "Share with Paper Mache", shareValue: "paper", onclick: "chooseShare"},
            {caption: "Share via Email", shareValue: "email", onclick: "chooseShare"},
            {caption: "Share via SMS", shareValue: "sms", onclick: "chooseShare"},
        ]},
        {name: "googleSharePopup", kind: "onyx.Popup", modal: false, dismissWithClick: true, style: "bottom: 0px; left: 15%; cursor: default;", classes: "touchfeeds-popup", components: [
            {name: "googleChromeShare", content: "Share with Google", shareValue: "google", onclick: "chooseShare", classes: "touchfeeds-menu-item"},
            {content: "Share with Twitter", shareValue: "twitter", onclick: "chooseShare", classes: "touchfeeds-menu-item"},
            {content: "Share with Facebook", shareValue: "facebook", onclick: "chooseShare", classes: "touchfeeds-menu-item"},
        ]},
        /*
        {name: "openAppService", kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "launch"}
        */
    ],
    create: function() {
        this.inherited(arguments);
        this.$.articleTitle.setContent("Welcome to TouchFeeds");
        this.$.summary.setContent(this.introText);
        this.$.postDate.hide();
        this.$.source.hide();
        this.app = enyo.application.app
        this.fontHandler();
    },
    //ready: function() {
    rendered: function() {
        this.inherited(arguments);
        this.$.fontsPopup.doHide = function() {};
        this.$.googleSharePopup.doHide = function() {};
        this.$.sharePopup.doHide = function() {};
        /*
        if (enyo.application.app.isPhone) {
            //fix to prevent app from sliding off the screen if a link is cilcked on certain webOS phones
            enyo.dispatcher.dispatch = function(a) {
                if (a.type == "mousedown" && !!a.target.href) { //only links should have href
                    a.stopPropagation();
                    a.preventDefault();
                    return -1;
                }
                var b = this.findDispatchTarget(a.target) || this.findDefaultTarget(a);
                a.dispatchTarget = b;
                var c;
                for (var d = 0, e; c = this.features[d]; d++) if (c.call(this, a)) return !0;
                b = a.filterTarget || b;
                if (b) {
                    if (!a.filterTarget || a.forward) if (this.dispatchCapture(a, b) === !0) return !0;
                    var f = this.dispatchBubble(a, b);
                    a.forward && (f = this.forward(a));
                }
            }.bind(enyo.dispatcher);
        }


        if (!window.PalmSystem) {
            //make single article scroller have a scrollbar instead
            this.$.articleScroller.setVertical(false);
            this.$.articleScroller.setAutoVertical(false);
            (function() {
                var client = this.$.articleScroller.node.firstChild.firstChild;
                client.style.overflowY = "scroll";
                client.style.height = "100%";
                this.$.spinner.addClass("chromeWeb");
                this.$.summary.addClass("chromeWeb");
            }.bind(this)).defer();

            //next two are fixes to allow text to be selected
            enyo.gesture.mousedown = function(a) {
                if (this._isFocusing) return a.target != this.targetEvent.target, !0;
                if (!a.synthetic && a.dispatchTarget) {
                    this.target = a.target, this.dispatchTarget = a.dispatchTarget, this.targetEvent = a;
                    var b = !this.requiresDomMousedown(a);
                    return b && this.sendCustomMousedown(a), this.startTracking(a), this.startMousehold(a), b;
                }
            }.bind(enyo.gesture);
            
            enyo.gesture.sendCustomMousedown = function(a) {
                a.preventDefault = function() {
                    a.prevented = !0;
                }, a.synthetic = !0, enyo.dispatch(a);
            };


        } else {
            */
            /*
            (function() {
                var client = this.$.articleScroller.node.firstChild.firstChild;
                //client.style.overflowY = "scroll";
                client.style.overflow = "-webkit-palm-overflow";
                client.style.height = "100%";
            }.bind(this)).defer();
            */
        //}
    },
    articleChanged: function() {
        var time = new Date;
        var scrollTo = 0;
        /*
        if (this.$.articleScroller.getScrollTop() > 200) {
            scrollTo = -200;
        }
        */
        if (!window.PalmSystem) {
            this.$.articleScroller.node.firstChild.firstChild.scrollTop = 0;
        }
        this.$.articleScroller.setScrollTop(scrollTo);
        this.fontHandler();
        this.fetchedOffline = false;
        if (this.article.isStarred) {
            this.$.starButton.setSrc("images/starred-footer-on.png");
        } else {
            this.$.starButton.setSrc("images/starred-footer.png");
        }
        if (!this.article.isRead) {
            enyo.log("article not read, mark it read");
            if (this.article.turnReadOn) {
                //setTimeout(function() {
                (function() {
                    this.article.turnReadOn(this.markedArticleRead.bind(this), function() {});
                }.bind(this)).defer();
                //}.bind(this), 500);
            }
            this.$.readButton.setSrc("images/read-footer.png");
        } else {
            this.$.readButton.setSrc("images/read-footer-on.png");
        }
        this.$.articleTitle.setContent(Encoder.htmlDecode(Encoder.htmlEncode(this.article.title)));
        this.$.summary.setContent("<div id='myTouchFeedsSummary' class='summaryWrapper'></div>");
        document.getElementById("myTouchFeedsSummary").innerHTML = Encoder.htmlDecode(this.article.summary);
        //this.$.summary.setContent("<div class='summaryWrapper'>" + Encoder.htmlDecode(this.article.summary) + "</div>");
        var publishAuthor = "";
        if (!!this.article.displayDateAndTime) {
            publishAuthor = "Published <span style='font-weight: 700'>" + this.article.displayDateAndTime + "</span>";
        }
        publishAuthor += (!!this.article.author ? " by <span style='font-weight: 700'>" + Encoder.htmlDecode(this.article.author) + "</span>" : "");
        this.$.postDate.setContent(publishAuthor);
        this.$.postDate.show();
        this.$.source.setContent("<span style='font-weight: 700'>" + Encoder.htmlDecode(this.article.origin) + "</span>");
        this.$.source.show();
        setTimeout(function() {
            this.offlineQuery();
            //set author/feed, everything else in article-assistant.js
            if (!window.PalmSystem) {
            } else {
                var aboutHeight = (this.$.articleTitle.node.scrollHeight) + (this.$.postDate.node.scrollHeight) + (this.$.source.node.scrollHeight);
                this.$.summary.applyStyle("min-height", (this.$.articleScroller.node.clientHeight - aboutHeight - 50) + "px !important");
            }
            this.processArticle();
        }.bind(this), 1000);/*.defer();*/
        enyo.log("SINGLE ARTICLE CHANGE BENCHMARK");
        enyo.log(new Date - time);
    },

    fontHandler: function() {
        this.$.summary.removeClass("small");
        this.$.summary.removeClass("medium");
        this.$.summary.removeClass("large");
        this.$.summary.addClass(Preferences.getArticleFontSize());
        this.$.articleTitle.removeClass("small");
        this.$.articleTitle.removeClass("medium");
        this.$.articleTitle.removeClass("large");
        this.$.articleTitle.addClass(Preferences.getArticleFontSize());
        var info = enyo.fetchDeviceInfo();
        if (!!info) {
            var height = info.screenHeight;
            if (height == 320 || height == 400 || height == 480 || height == 800) {
                this.$.articleTitle.removeClass("phone");
                this.$.headerButtons.removeClass("phone");
                this.$.footerButtons.removeClass("phone");
                this.$.aboutContainer.removeClass("phone");
                this.$.spinner.removeClass("phone");
                this.$.articleTitle.addClass("phone");
                this.$.aboutContainer.addClass("phone");
                this.$.headerButtons.addClass("phone");
                this.$.footerButtons.addClass("phone");
                this.$.spinner.addClass("phone");
            }
        }
    },

    processArticle: function() {
        var linkClickEvent = this.linkClickEvent;
        var anchorOnFocus = this.anchorOnFocus;
        $A(this.$.summary.node.getElementsByTagName("a")).each(function(anchor) {
            enyo.log("found anchor");
            /*
            if ((anchor.href.indexOf("ads") >= 0 && (anchor.href.indexOf("ads") - anchor.href.indexOf("uploads") !== 4)) || anchor.href.indexOf("auslieferung") >= 0 || anchor.href.indexOf("da.feedsportal.com") >= 0) {
                enyo.log(anchor.href);
                enyo.log("found advertisement link, remove");
                Element.remove(anchor);
            } else {
                */
                anchor.onfocus = anchorOnFocus.bind(anchor);
            //}
        });
        var imageClickEvent = this.imageClickEvent;
        var imageOnload = this.imageOnload;
        $A(this.$.summary.node.getElementsByTagName("img")).each(function(image) {
            image.onload = imageOnload.bind(image);
            if (!window.PalmSystem) {
            } else {
                enyo.log("attaching click end event to image");
                image.onclick = imageClickEvent.bind(image);
                //image.setStyle({border: "0 none"});
                if (image.title !== "") {
                    var insertAfter = image;
                    if (Element.match(Element.up(image), "a")) {
                        insertAfter = Element.up(image);
                    }
                    var minWidth = 0;
                    if (Element.measure(image, "width") <= 0) {
                        minWidth = 320;
                    }
                    Element.insert(insertAfter, {after: "<span class='imageCaption' style='width: " + Element.measure(image, "width") + "px; max-width: 100% !important; min-width: " + minWidth + "px !important;'>" + image.title + "</span>"});
                }
            }
        });
    },

    linkClickEvent: function(url) {
        enyo.log("CALLED CLICK EVENT FOR AN ANCHOR TAG");
        window.open(url, "_newtab");
        event.stopPropagation();
        event.preventDefault();
        return -1;
    },

    imageClickEvent: function(event) {
        enyo.log("CALLED CLICK EVENT FOR IMAGE");
        var image = event.target;
        var storage = image.getStorage();
        if (!!storage.get("href")) {
            window.open(storage.get("href"));
        }
        event.stopPropagation();
        event.preventDefault();
        return -1;
    },

    imageOnload: function() {
        enyo.log("image loaded");
        var image = this;
        var dimensions = Element.measure(image, "width") * Element.measure(image, "height");
        if (dimensions == 1) {
            enyo.log(dimensions);
            enyo.log("found tracking pixel, remove");
            Element.remove(image);
        } else {
            if (!window.PalmSystem) {
            } else {
                var caption = Element.next(image);
                if (!!caption && caption.hasClassName("imageCaption")) {
                    enyo.log("CAPTION THIS");
                    caption.setStyle({width: Element.measure(image, "width") + "px", minWidth: "0px"});
                } else {
                    if (Element.match(Element.up(image), "a")) {
                        caption = Element.next(Element.up(image));
                        if (!!caption && caption.hasClassName("imageCaption")) {
                            enyo.log("CAPTION OTHER");
                            caption.setStyle({width: Element.measure(image, "width") + "px", minWidth: "0px"});
                        }
                    }
                }
            }
        }
    },

    anchorOnFocus: function(ev) {
        ev.target.blur();
        ev.stopPropagation();
        ev.preventDefault();
        return -1;
    },

    markedArticleRead: function() {
        if (!this.article.isRead) {
            enyo.log("marked an article read");
            this.$.readButton.setSrc("images/read-footer.png");
        } else {
            enyo.log("marked an article not read");
            this.$.readButton.setSrc("images/read-footer-on.png");
        }
        enyo.log("sending read event");
        this.doRead({article: this.article, index: this.index, isRead: this.article.isRead});
    },
    indexChanged: function() {
        this.handleIndexChange();
    },
    maxIndexChanged: function() {
        this.handleIndexChange();
    },
    handleIndexChange: function() {
        if (this.index == 0) {
            this.$.previousButton.setSrc("images/previous-article-disabled.png");
        } else {
            this.$.previousButton.setSrc("images/previous-article.png");
        }
        if (this.index >= this.maxIndex) {
            this.$.nextButton.setSrc("images/next-article-disabled.png");
        } else {
            this.$.nextButton.setSrc("images/next-article.png");
        }
    },
    subscriptionsChanged: function() {
    },
    sourceClick: function() {
        enyo.log("clicked link for source");
        //window.open(this.article.url, "_newtab");
        window.open(this.article.url, "_blank");
    },
    fetchClick: function() {
        if (!!this.article.altSummary) { 
            var temp = this.article.summary;
            this.article.summary = this.article.altSummary;
            this.article.altSummary = temp;
            this.$.summary.setContent("<div id='myTouchFeedsSummary' class='summaryWrapper'></div>");
            document.getElementById("myTouchFeedsSummary").innerHTML = Encoder.htmlDecode(this.article.summary);
            this.processArticle();
        } else {
            if (!!this.article.url) {
                if (!this.fetchedOffline) {
                    this.$.spinner.show();
                    this.fetchedOffline = true;
                    var scrollTo = 0;
                    /*
                    if (this.$.articleScroller.getScrollTop() > 200) {
                        scrollTo = -200;
                    }
                    */
                    this.$.articleScroller.setScrollTop(scrollTo);
                    this.app.api.getPage(this.article.url, this.gotPage.bind(this), function() {Feeder.notify("Could not fetch article fulltext"); this.$.spinner.hide();}.bind(this));
                }
            }
        }
    },
    gotPage: function(page) {
        enyo.log("got page");
        var summary = page;
        this.article.altSummary = this.article.summary;
        this.article.summary = summary;
        this.$.summary.setContent("<div id='myTouchFeedsSummary' class='summaryWrapper'></div>");
        document.getElementById("myTouchFeedsSummary").innerHTML = Encoder.htmlDecode(this.article.summary);
        this.$.spinner.hide();
        if (this.article.isOffline) {
			enyo.log("preparing to save fulltext to offline database");
            this.app.$.articlesDB.query(this.app.$.articlesDB.getUpdate('articles', {summary: summary}, {articleID: this.article.articleID}), {
                onSuccess: function() {enyo.log("updated article summary");},
                onFailure: function() {enyo.log("failed to update article summary");}
            });
        }
    },
    starClick: function() {
        if (!!this.article.title) {
            if (this.article.isStarred) {
                enyo.log("removing star");
				if (this.article.turnStarOff) {
					this.article.turnStarOff(function() {enyo.log("successfully removed star");}, function() {enyo.log("failed to remove star");});
                    this.doStarred({index: this.index, isStarred: this.article.isStarred});
				}
                this.$.starButton.setSrc("images/starred-footer.png");
            } else {
                enyo.log("starring article");
				if (this.article.turnStarOn) {
					this.article.turnStarOn(function() {enyo.log("successfully starred article");}, function() {enyo.log("failed to star article");});
                    this.doStarred({index: this.index, isStarred: this.article.isStarred});
				}
                this.$.starButton.setSrc("images/starred-footer-on.png");
            }
        }
    },
    readClick: function() {
        if (!!this.article.title) {
            if (this.article.isRead) {
                if (this.article.turnReadOff) {
                    this.article.turnReadOff(this.markedArticleRead.bind(this), function() {});
                }
            } else {
                if (this.article.turnReadOn) {
                    this.article.turnReadOn(this.markedArticleRead.bind(this), function() {enyo.log("FAILED TO TURN READ ON")});
                }
            }
        }
    },
    previousClick: function() {
        if (this.index > 0) {
            this.doSelectArticle({index: this.index - 1});
        } else {
            //this.app.$.slidingPane.selectViewByName('feeds', true);
            this.app.$.slidingPane.setIndex(0);
        }
    },
    nextClick: function() {
        if (this.index < this.maxIndex) {
            this.doSelectArticle({index: this.index + 1});
        } else {
            //this.app.$.slidingPane.selectViewByName('feeds', true);
            this.app.$.slidingPane.setIndex(0);
        }
    },
    fontClick: function(source, inEvent) {
        //font popup here
        this.$.fontsPopup.show();
    },
    chooseFont: function(source, inEvent) {
        this.$.fontsPopup.hide();
        Preferences.setArticleFontSize(source.content.toLowerCase());
        this.fontHandler();
    },
    shareClick: function(source, inEvent) {
        if (!!this.article.title) {
            if (!!this.article.isShared) {
                this.$.googleChromeShare.shareValue = "ungoogle";
                this.$.googleChromeShare.setContent("Unshare with Google");
                this.$.googleShare.setContent("Unshare with Google");
            } else {
                this.$.googleChromeShare.shareValue = "google";
                this.$.googleChromeShare.setContent("Share with Google");
                this.$.googleShare.setContent("Share with Google");
            }
            if (!window.PalmSystem) {
                this.$.googleSharePopup.show();
            } else {
                this.$.sharePopup.show();
            }
        }
    },
    chooseShare: function(source, inEvent) {
        enyo.log(source.shareValue);
        this.$.sharePopup.hide();
        this.$.googleSharePopup.hide();
        if (source.shareValue == "google") {
            if (!!this.article.turnShareOn) {
                this.article.turnShareOn(function() {
                  Feeder.notify("Article shared");
                });
            } else {
                Feeder.notify("Cannot share offline");
            }
        }
        if (source.shareValue == "ungoogle") {
            if (!!this.article.turnShareOff) {
                this.article.turnShareOff(function() {
                  Feeder.notify("Article unshared");
                });
            } else {
                Feeder.notify("Cannot unshare offline");
            }
        }
        if (source.shareValue == "readitlater") {
            window.open("https://readitlaterlist.com/save?url=" + Encoder.htmlEncode(this.article.url) + "&title=" + Encoder.htmlEncode(this.article.title));
        }
        if (source.shareValue == "twitter") {
            enyo.log(Preferences.twitterSharingOption());
            if (Preferences.twitterSharingOption() == "spaz") {
                this.$.openAppService.call({
                    id: "com.funkatron.app.spaz-hd",
                    params: {
                        action: "post",
                        msg: Encoder.htmlEncode(this.article.title) + " -- " + Encoder.htmlEncode(this.article.url)
                    }
                });
            } else {
                window.open("http://twitter.com/home?status=" + Encoder.htmlEncode(this.article.title) + " -- " + Encoder.htmlEncode(this.article.url), "_newtab");
            }
        }
        if (source.shareValue == "facebook") {
            if (Preferences.facebookSharingOption() == "app") {
                this.$.openAppService.call({
                    id: "com.palm.app.enyo-facebook",
                    params: {
                        type: "status",
                        statusText: Encoder.htmlEncode(this.article.title) + " -- " + Encoder.htmlEncode(this.article.url)
                    }
                });
            } else {
                window.open("http://www.facebook.com/sharer/sharer.php?u=" + Encoder.htmlEncode(this.article.url) + "&t=" + Encoder.htmlEncode(this.article.title), "_newtab");
            }
        }
        if (source.shareValue == "email") {
            this.$.openAppService.call({
                id: "com.palm.app.email",
                params: {
                    summary: this.article.title,
                    text: this.article.title + "\n\n" + this.article.url
                }
            });
        }
        if (source.shareValue == "sms") {
            this.$.openAppService.call({
                id: "com.palm.app.messaging",
                params: {
                    messageText: this.article.title + " - " + this.article.url
                }
            });
        }
        if (source.shareValue == "paper") {
            this.$.openAppService.call({
                id: "net.ryanwatkins.app.papermache",
                params: {
                    action: "add",
                    url: this.article.url,
                    title: this.article.title
                }
            });
        }
    },
    offlineClick: function() {
        if (!!this.article.title) {
            this.$.spinner.show();
            if (this.article.isOffline) {
                enyo.log("will delete article offline");
                this.app.$.articlesDB.query("DELETE FROM articles WHERE articleID="+this.article.articleID, {onSuccess: function() {
                        Feeder.notify("Deleted article offline");
                        this.$.spinner.hide();
                        this.offlineQuery();
                        this.doChangedOffline();
                    }.bind(this), onFailure: function() {
                        enyo.log("failed to delete article");
                        Feeder.notify("Failed to delete article");
                        this.$.spinner.hide();
                    }.bind(this)
                });
            } else {
                enyo.log("clicked the offline button");
                this.app.$.articlesDB.insertData({
                    table: "articles",
                    data: [{
                        author: Encoder.htmlEncode(this.article.author),
                        title: Encoder.htmlEncode(this.article.title),
                        displayDate: this.article.displayDate,
                        origin: Encoder.htmlEncode(this.article.origin),
                        summary: Encoder.htmlEncode(this.article.summary),
                        url: Encoder.htmlEncode(this.article.url)
                    }]
                }, {
                    onSuccess: function(results) {Feeder.notify("Saved article offline"); this.$.spinner.hide(); this.offlineQuery(); this.doChangedOffline();}.bind(this),
                    onFailure: function() {Feeder.notify("Failed to save article offline"); this.$.spinner.hide();}.bind(this)
                });
            }
        }
    },
    checkIfOffline: function(results) {
        if (results.length) {
            this.article.isOffline = true;
            this.article.articleID = results[0].articleID;
            this.$.offlineButton.setSrc("images/delete-article.png");
        } else {
            this.article.isOffline = false;
            this.$.offlineButton.setSrc("images/offline-article.png");
        }
    },
    offlineQuery: function() {
        enyo.log("getting number of offline articles");
        this.app.$.articlesDB.query('SELECT * FROM articles WHERE title="' + Encoder.htmlEncode(this.article.title) + '"', {onSuccess: this.checkIfOffline.bind(this), onFailure: function() {enyo.log("failed to check if article offline");}});
	},
    resizedPane: function() {
        //enyo.log("resizing article");
        //this.$.headerScroller.setScrollLeft(0);
        /*
        if (!!document.getElementById("myTouchFeedsSummary")) {
            var maxWidth = Element.measure(document.getElementById("myTouchFeedsSummary"), "width");
            this.resizeAll(document.getElementById("myTouchFeedsSummary"), maxWidth);
        }
        */
    },

    resizeAll: function(myElement, maxWidth) {
        /*
        var children = Element.childElements(myElement);
        while (children.length) {
            current = children.pop();
            this.resizeAll(current, maxWidth);
        }
        if (Element.measure(myElement, "width") > maxWidth) {
            enyo.log("resizing");
            Element.setStyle(myElement, {width: maxWidth});
        }
        */
    },

    summaryDragStart: function(thing1, event) {
        enyo.log("summary drag start");
    },
    summaryDrag: function() {
    },
    summaryDragFinish: function(thing1, event) {
        if (!window.PalmSystem) {
            return;
        }
        if (+event.dx > 100) {
            enyo.log("dragged to the right");
            if (this.index > 0) {
                if (Preferences.enableAnimations()) {
                    this.$.summary.applyStyle("margin-left", "130px !important");
                    setTimeout(this.restoreLeft.bind(this, 15), 16);
                }
                this.doSelectArticle({index: this.index - 1});
            } else {
                //this.app.$.slidingPane.selectViewByName('feeds', true);
                this.app.$.slidingPane.setIndex(0);
            }
        }
        if (+event.dx < -100) {
            enyo.log("dragged to the left");
            if (this.index < this.maxIndex) {
                if (Preferences.enableAnimations()) {
                    this.$.summary.applyStyle("margin-left", "-110px !important");
                    setTimeout(this.restoreRight.bind(this, 15), 8);
                }
                this.doSelectArticle({index: this.index + 1});
            } else {
                //this.app.$.slidingPane.selectViewByName('feeds', true);
                this.app.$.slidingPane.setIndex(0);
            }
        }
    },
    summaryGestureStart: function(thing1, event) {
        enyo.log("gesture dragging start");
        this.gestureY = +event.centerY;
        this.gestureX = +event.centerX;
    },
    summaryGestureEnd: function(thing1, event) {
        if (!window.PalmSystem) {
            return;
        }
        var diffY = +(event.centerY - this.gestureY);
        var diffX = +(event.centerX - this.gestureX);
        if (diffY > 100) {
            //dragged up
            this.starClick.bind(this)();
        } else if (diffY < -100) {
            //dragged down
            this.offlineClick.bind(this)();
        } else if (diffX > 100) {
            //dragged to the left
            enyo.log("diffx greater than 100");
            //this.app.$.slidingPane.selectViewByName('feeds', true);
            this.app.$.slidingPane.setIndex(0);
        } else if (diffX < -100) {
            enyo.log("diffx less than -100");
            //dragged to the right
            this.readClick.bind(this)();
        }
        event.stopPropagation();
        event.preventDefault();
        return -1;
    },
    restoreLeft: function(adjust) {
        var position = 120 - (15.5 * (15 - adjust)) + (((15 - adjust) * (15 - adjust)) / 2)
        this.$.summary.applyStyle("margin-left", (Math.floor(position) + 10) + "px !important");
        if (position > 0) {
            setTimeout(this.restoreLeft.bind(this, adjust - 1), 16);
        }
    },
    restoreRight: function(adjust) {
        var position = -120 + (15.5 * (15 - adjust)) - (((15 - adjust) * (15 - adjust)) / 2)
        this.$.summary.applyStyle("margin-left", (Math.floor(position) + 10) + "px !important");
        if (adjust > 0) {
            setTimeout(this.restoreRight.bind(this, adjust - 1), 8);
        }
    },
    scrollerDragStart: function(thing, event) {
        return true;
        event.stopPropagation();
        event.preventDefault();
        return -1;
    },
    scrollerDragFinish: function(thing, event) {
    },
    articleScrollStop: function(thing, event) {
    },
    articleLinkClicked: function(thing, url, event) {
        enyo.log("clicked link in article");
        window.open(url, "_newtab");
    },
    articleStarred: function(article, wasStarred) {
        if (this.article.isStarred) {
            this.$.starButton.setSrc("images/starred-footer-on.png");
        } else {
            this.$.starButton.setSrc("images/starred-footer.png");
        }
    },
    grabberClicked: function() {
        this.doGrabberClicked({source: "single"});
    },

    showSummary: function() {
        this.$.articleTitle.setContent("Welcome to TouchFeeds");
        this.$.summary.setContent(this.introText);
        this.$.postDate.hide();
        this.$.source.hide();
        var scrollTo = 0;
        /*
        if (this.$.articleScroller.getScrollTop() > 200) {
            scrollTo = -200;
        }
        */
        this.$.articleScroller.setScrollTop(scrollTo);
    },
	introText: "<div class='touchFeedsSummary'>" +
        "<p>TouchFeeds is a Google Reader app that connects you with the websites you love. Easily navigate your feeds and articles with sliding panels. Read articles the way you want to with customizable font sizes, color schemes, the ability to fetch the full text for articles, and an offline mode that lets you read anywhere.</p>" +
        "<p style='font-weight: bold;'>Important: This app is currently using Enyo 2. While every effort has been made to ensure TouchFeeds has the same functionality as  it had when it used Enyo 1, some minor functionality is still unavailable. Please contact  <a href='mailto:support@sanchezapps.com'>support@sanchezapps.com</a> with any feedback.</p>" +
        "<p>You can choose help from the options menu to show this guide again.</p>" +
        "<p>TouchFeeds is now available on your HP Touchpad, Palm Pre 2, and HP Pre 3 running webOS 2.2.4 and higher. TouchFeeds is also availalbe as a Chrome web app on the Chrome Web Store. Visit the <a href='http://www.sanchezapps.com/touchfeeds'>TouchFeeds homepage</a> for more information.</p>" +
        (!!/*enyo.application.isPhone*/false ? "<h2>Notice on Phones</h2>" +
        "<p>TouchFeeds features support for the gesture area on webOS phones. Simply swipe the gesture area to the left or to the right to navigate between the feeds view, articles view, and single article view.</p>" +
        "<p>Notifications are currently not available for TouchFeeds on the Pre 2 and Pre 3, due to compatibility issues with notifications on webOS 2.x. TouchFeeds is currently unavailable for phones running webOS versions earlier than 2.2.4, including the HP Veer and the Palm Pre, due to other compatibility issues. If a fix for these issues is developed, TouchFeeds and all its features may be made available to all webOS devices at a later date.</p>" : "") +
        "<h2>Icon Guide</h2>" +
        "<p>TouchFeeds features many buttons that allow you to quickly interact with your feeds.</p>" +
        "<ul class='iconGuide'> " +
        "<li class='addFeed'><div class='icon'></div>Add a feed to Google Reader.</li>" +
        (!window.PalmSystem ? "<li class='option'><div class='icon'></div>Bring up the options menu.</li>" : "<li class='notification'><div class='icon'></div>Bring up your notification preferences.</li>") +
        "<li class='refresh'><div class='icon'></div>Refresh your list of feeds or articles.</li>" +
        "<li class='star'><div class='icon'></div>The article is starred. Tap this icon to remove the star.</li>" +
        "<li class='noStar'><div class='icon'></div>The article is not starred. Tap this icon to add a star.</li>" +
        "<li class='markRead'><div class='icon'></div>Mark an article read, or all articles in a feed read.</li>" +
        "<li class='markUnread'><div class='icon'></div>Mark an article unread.</li>" +
        "<li class='share'><div class='icon'></div>Share an article.</li>" +
        "<li class='download'><div class='icon'></div>Download an article for offline reading.</li>" +
        "<li class='delete'><div class='icon'></div>Delete an article if it is saved offline.</li>" +
        "<li class='fetch'><div class='icon'></div>Fetch the article fulltext using <a href='http://readitlaterlist.com'>Read it Later</a>.</li>" +
        "<li class='font'><div class='icon'></div>Change the font size for more comfortable reading.</li>" +
        "<li class='next'><div class='icon'></div>Go to the next article.</li>" +
        "<li class='previous'><div class='icon'></div>Go to the previous article.</li>" +
        "</ul>" +
        (!window.PalmSystem ? "" :
        "<h2>Gesture Guide</h2>" +
        "<p>TouchFeeds features many gestures to enhance your reading experience.</p>" +
        "<ul class='gestureGuide'>" +
        "<li>When viewing an article, drag the article to the left or right to go to the next or previous article, respectively. If there is no next or previous article, the feeds pane is opened.</li>" +
        "<li>When viewing an article, drag two fingers down on the article to star an article or to remove a star.</li>" +
        "<li>When viewing an article, drag two fingers up on the article to download an article for offline reading or to delete an offline article.</li>" +
        "<li>When viewing an article, drag two fingers to the right on the article to open the feeds pane.</li>" +
        "<li>When viewing an article, drag two fingers to the left on the aritcle to mark an article read or unread.</li>" +
        "<li>In the center Articles pane, swipe an article row to star that article or to remove a star.</li>" +
        "<li>In the left-most Feeds pane, swipe a feed row to remove that feed from Google Reader.</li>" +
        "</ul>" +
        "<h2>Notifications</h2>" +
        "<p>You can set up notifications to keep up with the news as it happens. When you tap the notifications icon in the Feeds pane toolbar, the Notifications preferences menu will pop up. You can turn off notifications or select how often to check for new articles. You can tap the Toggle All Subscriptions buttons to remove or add all subscriptions for notifications. You can also toggle notificatons for individual subscriptions by tapping on them. Any subscription set up for notifications will be <span style='color: #ff4a00 !important;'>orange</span>.</p>" + 
        "<p>When you have new articles to read, a TouchFeeds notification icon will appear in the notifications area. New articles are displayed using grouped notifications. You can swipe away new article notifications until you reach the feed you want to read. You can tap the notification text for the feed you want to read to launch TouchFeeds and read that feed, or you can tap the icon to just launch TounchFeeds.</p>") +
        (!window.PalmSystem ?
        "<h2>Scrolling The Article List</h2>" +
        "<p>To scroll through the articles list in the Articles Pane, hold the mouse cursor over the top or bottom of the list and the article list will scroll until you move the mouse cursor away. You can also scroll through the article list using the scroll wheel on your mouse, or using the up and down arrow keys on your keyboard.</p>" +
        "<h2>Keyboard Shortcuts</h2>" +
        "<ul class='gestureGuide'>" +
        "<li>j/k: select the next/previous article</li>" +
        "<li>s: toggle star on current article</li>" +
        "<li>m: toggle read/unread on current article</li>" +
        "<li>v: open article in a new tab</li>" + 
        "<li>r: refresh feeds and aritcles lists</li>" +
        "<li>/: focus search input</li>" +
        "<li>a: add a subscription</li>" +
        "<li>o: toggle offline on current article</li>" +
        "<li>f: toggle article fulltext on current article</li>" +
        "</ul>" : "") +
        "<h2>Viewing Folders</h2>" +
        "<p>In the Feeds pane, feeds will have an RSS icon, and folders will have a folder icon. When you view a folder, you can choose to sort articles in the folder by feed. When the articles are sorted by feeds, you can tap the feed divider to show or hide all articles for that feed. You can also tap the folder header to show or hide all articles in every feed.</p>" +
        "<p>This also applies to All Items, Starred, and Offline Articles.</p>" +
        "<h2>Open Source</h2>" +
        "<p>This app is open source. You can find the full source and license at <a href='https://github.com/rsanchez1/feeder-webos/tree/enyo'>TouchFeeds on Github</a>.</p>" + 
        "<h2>Contact</h2>" +
        "<p>If you have any questions, contact <a href='mailto:support@sanchezapps.com'>support@sanchezapps.com</a>." +
        "<h2>Changelog</h2>" +
        "<p>Current Version: 1.3.6. You can view the full changelog history <a href='http://sanchezapps.com/touchfeeds-changelog'>here</a>.</p>" +
        "<ul class='gestureGuide'>" +
        "<li>Changed how mark all articles read works</li>" +
        "<li>Fixed removal of images/links in Single Article View</li>" +
        "</ul>"+
        "<h2>Special Thanks</h2>" +
        "<ul class='gestureGuide'>" +
        "<li>Darrin Holst - Developer of <a href='https://github.com/darrinholst/feeder-webos'>Feeder</a>, a Google Reader app on webOS phones, on which this app is based</li>" +
        "<li>Rob (speedtouch @ Precentral & webOSRoundup forums)</li>" +
        "<li><a href='http://twitter.com/confusedgeek'>@confusedgeek</a></li>" +
        "<li>baldric @ Precentral forums</li>" +
        "<li>greg @ <a href='http://www.smartphonesoft.com'>smartphonesoft</a></li>" +
        "<li><a href='http://twitter.com/jacqofspeed'>@jacqofspeed</a></li>" +
        "<li><a href='http://twitter.com/jkendrick'>@jkendrick</a> - James Kendrick of ZDNet Mobile News</li>" +
        "</ul>" +
        "</div>",
});

