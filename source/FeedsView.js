enyo.kind({
    name: "TouchFeeds.FeedsView",
    kind: "FittableRows",
    classes: "enyo-bg itemLists enyo-fit enyo-unselectable",
    style: "height: 100%;",
    published: {
        headerContent: "",
        showSpinner: false,
        stickySources: [],
        changeId: "",
        subscriptionSources: []
    },
    events: {
        onFeedClicked: "",
        onRefreshFeeds: "",
        onHeaderClicked: "",
        onNotificationClicked: "",
    },
    openedFolders: [],
    components: [
        {name: "header", kind: "onyx.Toolbar", components: [
            {name: "headerWrapper", classes: "tfHeaderWrapper", components: [
                {name: "headerContent", content: "TouchFeeds", classes: "tfHeader", onclick: "headerClicked"}
            ]},
            {kind: "Spinner", showing: false, style: "position: absolute; right: 10px; top: 10px;"}
        ]},
        {kind: "FittableColumns", ondragstart: "dragStart", ondragfinish: "dragFinish", classes: "itemLists", style: "margin-top: 5px !important; padding-bottom: 5px !important; border-bottom: 1px solid rgba(0, 0, 0, 0.2);", components: [
            {name: "searchQuery", kind: "onyx.Input", fit: true, classes: "enyo-input touchfeeds-input", style: "padding: 6px !important; margin-left: 5px !important; margin-right: 5px !important; outline: 0; border-radius: 5px; border-color: transparent;", onfocus: "searchFocused", onblur: "searchBlurred", onkeypress: "searchKey", placeholder: "Tap Here To Search"},
            {kind: "onyx.Button", content: "Search", onclick: "searchClick", style: "padding: 6px 14px; margin-right: 8px;"}
        ]},
        {name: "feedsScroller", ondragstart: "dragStart", ondragfinish: "dragFinish", kind: "enyo.Scroller", /*flex: 1*/fit: true, style: "position: relative;", classes: "itemLists enyo-fit", horizontal: false, autoHorizontal: false, components: [
            {name: "stickySourcesList", kind: "enyo.Repeater", onSetupItem: "setupStickySources", classes: "itemLists", components: [
                {name: "stickyItem", classes: "enyo-item feed-item", components: [
                    {name: "stickyTitle", style: "width: 85%; margin-left: 5px; font-size: 0.9rem;"},
                    {name: "stickyUnreadCountDisplay", style: "width: 35px; text-align: left; position: absolute; right: 10px; font-size: 0.9rem;"}
                ], onclick: "stickyItemClick"}
            ]},
            {name: "sourcesDivider", kind: "Divider", caption: "Subscriptions", classes: "itemLists"},
            {name: "subscriptionSourcesList", kind: "enyo.Repeater", onSetupItem: "setupSubscriptionSources", classes: "itemLists", components: [
                {components: [
                    {name: "subscriptionItem", /*kind: "SwipeableItem",*/classes: "enyo-item feed-item", confirmCaption: "Remove Feed", onConfirm: "confirmedDeleteItem", layoutKind: "VFlexLayout", components: [
                        {name: "title", style: "width: 85%; margin-left: 5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 5px;"},
                        {name: "unreadCountDisplay", classes: "feed-unread", style: "width: 35px; text-align: left; position: absolute; font-weight: normal !important;"}
                        ],
                        onclick: "subscriptionItemClick"
                    }
                ]}
            ]
            }
        ]},
        {kind: "onyx.Toolbar", components: [
            {name: "addFeedButton", kind: "onyx.IconButton", src: "images/icon_rss_add.png", onclick: "addFeedClick", style: "background-color: transparent !important; -webkit-border-image: none !important; position: relative; left: 60px;"},
            {name: "refreshButton", kind: "onyx.IconButton", src: "images/refresh.png", onclick: "refreshClick", style: "background-color: transparent !important; -webkit-border-image: none !important; position: relative; left: 80px;"},
            {name: "notificationButton", kind: "onyx.IconButton", src: "images/icon_bell.png", onclick: "notificationClick", style: "background-color: transparent !important; -webkit-border-image: none !important; position: relative; left: 100px;"},
        ]},
        {name: "addFeedPopup", kind: "onyx.Popup", floating: true, centered: true, classes: "touchfeeds-popup", style: "width: 300px;", components: [
            {kind: "RowGroup", classes: "feeds-rowgroup", content: "Enter Feed URL", components: [
                {classes: "touchfeeds-rowgroup-label", content: "ENTER FEED URL"},
                {kind: "onyx.Input", name: "feedInput", hint: "", value: "", onfocus: "feedAddFocused", onblur: "feedAddBlurred", onkeypress: "feedAddKey"},
            ]},
            {kind: "FittableColumns", components: [
                {kind: "onyx.Button", content: "OK", style: "height: 2.0em !important; margin-right: 10px !important; width: 7.0rem !important;", classes: "enyo-button-dark", onclick: "confirmClick"},
                {kind: "onyx.Button", content: "Cancel", style: "height: 2.0em !important; width: 7.0rem !important;", classes: "enyo-button", onclick: "cancelClick"},
            ]}
        ]},
    ],
    create: function() {
        this.inherited(arguments);
        this.headerContentChanged();
        this._setProperty = this.setPropertyValue;
    },
    rendered: function() {
        this.inherited(arguments);
        this.app = enyo.application.app;
        this.$.sourcesDivider.hide();
        if (!window.PalmSystem) {
            this.$.notificationButton.setSrc("images/icon_options.png");
            /*
            this.$.feedsScroller.setVertical(false);
            this.$.feedsScroller.setAutoVertical(false);
            (function() {
                var client = this.$.feedsScroller.node.firstChild.firstChild;
                client.style.overflowY = "scroll";
                client.style.height = "101%";
            }.bind(this)).defer();
            */
        } else {
            if (this.app.isPhone) {
                this.$.notificationButton.hide();
            }
        }
        //this.$.addFeedPopup.
    },

    dragStart: function(inSource, inEvent) {
        enyo.log("drag start");
        if (!window.PalmSystem) {
            return true;
            //inEvent.stopPropagation();
            inEvent.preventDefault();
            this.dragging = false;
            return -1;
        }
    },

    dragFinish: function(inSource, inEvent) {
        enyo.log("drag finish");
        inEvent.preventTap();
        if (!window.PalmSystem) {
            return true;
            //inEvent.stopPropagation();
            inEvent.preventDefault();
            this.dragging = false;
            return -1;
        }
    },

    showSpinnerChanged: function() {
        if (this.showSpinner) {
            this.$.spinner.show();
            this.$.spinner.applyStyle("display", "inline-block");
        } else {
            this.$.spinner.hide();
        }
    },
    headerContentChanged: function() {
        this.$.headerContent.setContent(Encoder.htmlDecode(this.headerContent));
    },
    stickySourcesChanged: function() {
        enyo.log("sticky sources changed");
        this.$.stickySourcesList.setCount(this.getStickySourcesLength());
        this.$.stickySourcesList.build();
        this.$.stickySourcesList.render();
        enyo.log("changed sticky sources");
    },
    getStickySourcesLength: function() {
        if (!!this.stickySources && !!this.stickySources.items && !!this.stickySources.items.length) {
            if (!!this.app.offlineArticles.length && !this.stickySources.items[this.stickySources.items.length - 1].isOffline) {
                return this.stickySources.items.length + 1;
            } else {
                return this.stickySources.items.length;
            }
        } else {
            return 0;
        }
    },
    setupStickySources: function(inSender, inEvent) {
        var inIndex = inEvent.index;
        var item = inEvent.item;
        if (!!this.stickySources.items) {
            if ((inIndex == this.stickySources.items.length && (!this.stickySources.items[this.stickySources.items.length - 1].isOffline)) || (!!this.stickySources.items[inIndex] && this.stickySources.items[inIndex].isOffline)) {
                item.$.stickyTitle.setContent("Offline Articles");
                item.$.stickyUnreadCountDisplay.setContent(this.app.offlineArticles.length);
                item.$.stickyItem.applyStyle("border-bottom", "none");
                if (!this.stickySources.items[this.stickySources.items.length - 1].isOffline) {
                    this.stickySources.items[this.stickySources.items.length] = {isOffline: true, title: "Offline Articles"};
                }
                return true;
            } else {
                var r = this.stickySources.items[inIndex];
                if (r) {
                    item.$.stickyTitle.setContent(Encoder.htmlDecode(r.title));
                    item.$.stickyUnreadCountDisplay.setContent(r.unreadCountDisplay);
                    if (inIndex + 1 > this.stickySources.items.length) {
                        item.$.stickyItem.applyStyle("border-bottom", "none");
                    }
                    return true;
                }
            }
        }
    },
    subscriptionSourcesChanged: function() {
        this.showSpinner = false;
        this.$.spinner.hide();
        this.$.sourcesDivider.show();

        var numberOfItems;

        if ((!Preferences.combineFolders()) && !!this.subscriptionSources && !!this.subscriptionSources.items) {
            for (var i = this.subscriptionSources.items.length; i--;) {
                var item = this.subscriptionSources.items[i];
                if (this.openedFolders.any(function(n) {return n == item.id;})) {
                    if (!!item.subscriptions) {
                        this.closeFolder(item);
                        this.openFolder(item, i);
                    }
                }
            }
        }

        if (this.changeId !== "") {
            var index = 0;
            for (var i = this.subscriptionSources.items.length; i--;) {
                if (this.subscriptionSources.items[i].subscriptionId == this.changeId) {
                    index = i;
                }
            }
            //this.$.subscriptionSourcesList.renderRow(index);
            this.renderSubscriptionRow(index);
            //this.$.subscriptionSourcesList.build();
            this.changeId = "";
        } else {
            var length = (!!this.subscriptionSources && !!this.subscriptionSources.items) ? this.subscriptionSources.items.length : 0;
            this.$.subscriptionSourcesList.setCount(length);
            this.$.subscriptionSourcesList.build();
            this.$.subscriptionSourcesList.render();
        }
    },
    renderSubscriptionRow: function(index) {
        this.$.subscriptionSourcesList.doSetupItem({index: index, item: this.$.subscriptionSourcesList.itemAtIndex(index)});
    },

    setupSubscriptionSources: function(inSender, inEvent) {
        var inIndex = inEvent.index;
        var item = inEvent.item;
        if (!!this.subscriptionSources.items) {
            var r = this.subscriptionSources.items[inIndex];
            if (r) {
                item.$.title.setContent(Encoder.htmlDecode(r.title));
                item.$.unreadCountDisplay.setContent(r.unreadCountDisplay);
                if (r.unreadCountDisplay) {
                    item.$.title.applyStyle("font-weight", "bold !important");
                    item.$.unreadCountDisplay.applyStyle("font-weight", "bold !important");
                }
                if (inIndex + 1 >= this.subscriptionSources.items.length) {
                    item.$.subscriptionItem.applyStyle("border-bottom", "none");
                }
                if (inIndex - 1 < 0) {
                    item.$.subscriptionItem.applyStyle("border-top", "none");
                }
                item.$.subscriptionItem.removeClass("rss");
                item.$.subscriptionItem.removeClass("folder");
                item.$.subscriptionItem.removeClass("folderChild");
                item.$.subscriptionItem.addClass(r.icon);
                if (!!r.isFolderChild) {
                    item.$.subscriptionItem.addClass("folderChild");
                }
                return true;
            }
        }
    },
    stickyItemClick: function(inSender, inEvent) {
        this.doFeedClicked(this.stickySources.items[inEvent.index]);
    },
    subscriptionItemClick: function(inSender, inEvent) {
        var tappedSub = this.subscriptionSources.items[inEvent.index];
        if (!!tappedSub.subscriptions && !Preferences.combineFolders() && true) {
            if (this.openedFolders.any(function(n) {return n == tappedSub.id;})) {
                this.closeFolder(tappedSub);
                for (var i = this.openedFolders.length; i--;) {
                    if (this.openedFolders[i] == tappedSub.id) {
                        this.openedFolders.splice(i, 1);
                    }
                }
            } else {
                this.openedFolders.push(tappedSub.id);
                //this.openFolder(tappedSub, inEvent.rowIndex);
            }
            this.subscriptionSourcesChanged();
        } else {
            this.doFeedClicked(this.subscriptionSources.items[inEvent.index], !!this.subscriptionSources.items[inEvent.index].isFolderChild && this.subscriptionSources.items[inEvent.index].icon !== 'folder');
        }
    },
    openFolder: function(folder, index) {
        for (var i = folder.subscriptions.items.length; i--;) {
            var itemToAdd = Object.clone(folder.subscriptions.items[i]);
            if (!Preferences.hideReadFeeds() || (Preferences.hideReadFeeds() && itemToAdd.unreadCountDisplay)) {
                itemToAdd.isFolderChild = true;
                this.subscriptionSources.items.splice(index + 1, 0, itemToAdd);
            }
        }
        var folderToAdd = Object.clone(folder);
        folderToAdd.subscriptions = undefined;
        folderToAdd.categories = [{label: folder.title}];
        folderToAdd.title = "All Items - " + folder.title;
        folderToAdd.isFolderChild = true;
        folderToAdd.folderParent = folder;
        this.subscriptionSources.items.splice(index + 1, 0, folderToAdd);
    },
    closeFolder: function(folder) { 
        var isThisFolder;
        var checkFolder;
        var j;
        var i;
        for (i = this.subscriptionSources.items.length; i--;) {
            if (!!this.subscriptionSources.items[i].isFolderChild) {
                if (!!this.subscriptionSources.items[i].categories) {
                    if (this.subscriptionSources.items[i].categories.any(function(n) {return n.label == folder.title;})) {
                        // item would be in current folder, check to see if it would not also be in another folder
                        for (j = i; j--;) {
                            if (!!this.subscriptionSources.items[j].subscriptions) {
                                checkFolder = this.subscriptionSources.items[j];
                                if (checkFolder.title == folder.title) {
                                    isThisFolder = true;
                                    break;
                                } else {
                                    isThisFolder = false;
                                    break;
                                }
                            }
                        }
                        if (isThisFolder) {
                            this.subscriptionSources.items.splice(i, 1);
                        }
                    }
                }
            }
        }
    },
    refreshLists: function() {
        this.$.stickySourcesList.refresh();
        this.$.subscriptionSourcesList.refresh();
    },
    searchClick: function() {
        var query = this.$.searchQuery.getValue();
        if (query === "") {
            return;
        }
        this.doFeedClicked(new Search(this.app.api, query));
        this.$.searchQuery.setValue("");
        //enyo.keyboard.hide();
        this.$.searchQuery.forceBlur();
    },
    searchFocused: function(source, event) {
        Element.setStyle(this.$.searchQuery.node, {marginLeft: 0});
        //enyo.keyboard.show();
    },
    feedAddFocused: function(source, event) {
        enyo.keyboard.show(enyo.keyboard.typeURL);
    },
    searchBlurred: function() {
        Element.setStyle(this.$.searchQuery.node, {marginLeft: "-8px"});
        //enyo.keyboard.hide();
    },
    feedAddBlurred: function() {
    },
    searchKey: function(source, event) {
        if (event.keyCode == 13) {
            this.searchClick();
        }
    },
    feedAddKey: function(source, event) {
        if (event.keyCode == 13) {
            this.confirmClick();
        }
    },
    reloadFeeds: function() {
        this.$.subscriptionSourcesList.render();
        this.$.stickySourcesList.render();
    },
    addFeedClick: function(source, inEvent) {
        if (!!inEvent) {
            //this.$.addFeedPopup.openAtEvent(inEvent);
            this.$.addFeedPopup.show();
        } else {
            //this.$.addFeedPopup.openAtCenter();
            this.$.addFeedPopup.show();
        }
        this.$.feedInput.forceFocus();
    },
    confirmClick: function() {
        this.$.spinner.show();
        this.app.api.addSubscription(this.$.feedInput.getValue(), this.addFeedSuccess.bind(this), function() {Feeder.notify("Could not add feed"); this.$.spinner.hide(); this.$.addFeedPopup.hide();}.bind(this));
        //enyo.keyboard.hide();
        //check for feeds
    },
    cancelClick: function() {
        this.$.addFeedPopup.hide();
        //enyo.keyboard.hide();
    },
    addFeedSuccess: function() {
        Feeder.notify("Successfully added feed");
        this.doRefreshFeeds();
        this.$.feedInput.setValue("");
        this.$.spinner.hide();
            this.$.addFeedPopup.hide();
    },
    refreshClick: function() {
        this.doRefreshFeeds();
    },
    notificationClick: function() {
        this.doNotificationClicked();
    },
    confirmedDeleteItem: function(inSender, inIndex) {
        this.app.api.unsubscribe(this.subscriptionSources.items[inIndex], this.unsubscribedFeed.bind(this));
    },
    unsubscribedFeed: function() {
        Feeder.notify("Successfully removed feed");
        this.doRefreshFeeds();
    },
    headerClicked: function() {
        this.doHeaderClicked();
    },
    refreshFeeds: function() {
        this.doRefreshFeeds();
    }
});
