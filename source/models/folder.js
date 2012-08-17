var Folder = Class.create(ArticleContainer, {
  initialize: function($super, api, title, id) {
    $super(api)
    this.id = id
    this.title = title
    this.icon = "folder"
    this.divideBy = "Subscriptions"
    this.stickySubscriptions = [this]
    this.subscriptions = new FolderSubscriptions(api, this.id)
    this.setUnreadCount(0)
    this.showOrigin = true
    this.canMarkAllRead = true
    this.isFolder = true
  },

  makeApiCall: function(continuation, success, failure) {
    this.api.getAllArticlesFor(this.id, continuation, success, failure)
  },

  markAllRead: function(success) {
    var self = this
    if (!self.subscriptions) {
        self = self.folderParent;
    }

    self.api.markAllRead(self.id, function() {
        var subscriptionItems;
        if (!self.subscriptions) {
            subscriptionItems = self.folderParent.subscriptions.items;
        } else {
            subscriptionItems = self.subscriptions.items;
        }
      subscriptionItems.each(function(subscription) {
        subscription.clearUnreadCount()
      })

      self.clearUnreadCount()
      self.items.each(function(item) {item.isRead = true})
      self.recalculateUnreadCounts()
      success()
    })
  },

  markMultipleArticlesRead: function(articles, success, error) {
      var self = this;
      if (!self.subscriptions) {
          self = self.folderParent;
      }
      this.api.markMultipleArticlesRead(articles, function() {
          articles.each(function(item) {item.isRead = true});
          success()
      }.bind(this), error);
  },
  
  addUnreadCount: function(count) {
    var subscriptionItems;
    if (!this.subscriptions) {
        subscriptionItems = this.folderParent.subscriptions.items;
    } else {
        subscriptionItems = this.subscriptions.items;
    }
    subscriptionItems.each(function(subscription) {
      if(subscription.id == count.id) {
        subscription.setUnreadCount(count.count)
      }
    })

    this.recalculateUnreadCounts()
  },

  articleRead: function(subscriptionId) {
    var subscriptionItems;
    if (!this.subscriptions) {
        subscriptionItems = this.folderParent.subscriptions.items;
    } else {
        subscriptionItems = this.subscriptions.items;
    }
    subscriptionItems.each(function(subscription){
        if (subscriptionId == subscription.id) {
        }
      subscription.articleRead(subscriptionId)
    })

    this.recalculateUnreadCounts()
  },

  articleMultipleRead: function(subscriptionId) {
    var subscriptionItems;
    if (!this.subscriptions) {
        subscriptionItems = this.folderParent.subscriptions.items;
    } else {
        kubscriptionItems = this.subscriptions.items;
    }
    subscriptionItems.each(function(subscription){
      subscription.articleMultipleRead(subscriptionId)
    })

    this.recalculateUnreadCounts()
  },

  articleNotRead: function(subscriptionId) {
    var subscriptionItems;
    if (!this.subscriptions) {
        subscriptionItems = this.folderParent.subscriptions.items;
    } else {
        subscriptionItems = this.subscriptions.items;
    }
    subscriptionItems.each(function(subscription){
      subscription.articleNotRead(subscriptionId)
    })

    this.recalculateUnreadCounts()
  },

  recalculateUnreadCounts: function() {
    this.setUnreadCount(0)

    var subscriptionItems;
    if (!this.subscriptions) {
        subscriptionItems = this.folderParent.subscriptions.items;
    } else {
        subscriptionItems = this.subscriptions.items;
    }
    subscriptionItems.each(function(subscription) {
      this.incrementUnreadCountBy(subscription.getUnreadCount())
    }.bind(this))
  },

  sortAlphabetically: function() {
    this.sortBy(function(subscription) {
      return subscription.title.toUpperCase()
    })
  },

  sortManually: function(sortOrder, error) {
    if(!sortOrder) {return}

    var subscriptionItems;
    if (!this.subscriptions) {
        subscriptionItems = this.folderParent.subscriptions.items;
    } else {
        subscriptionItems = this.subscriptions.items;
    }
    subscriptionItems.each(function(subscription, index) {
      subscription.sortNumber = sortOrder.getSortNumberFor(subscription.sortId)
    }.bind(this))

    this.sortBy(function(subscription) {return subscription.sortNumber})
  },

  sortBy: function(f) {
    var subscriptionItems;
    if (!this.subscriptions) {
        subscriptionItems = this.folderParent.subscriptions.items;
    } else {
        subscriptionItems = this.subscriptions.items;
    }
    var sortedItems = subscriptionItems.sortBy(f)
    subscriptionItems.clear()
    subscriptionItems.push.apply(subscriptionItems, sortedItems)
  }
})
