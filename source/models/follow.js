var Follow = Class.create(ArticleContainer, {
    initialize: function($super, api) {
        $super(api)
        this.id = "user/-/state/com.google/broadcast"
        this.title = "People You Follow"
        this.icon = "people"
        this.sticky = true
        this.divideBy = "Home"
        this.hideDivider = "hide-divider"
        this.showOrigin = false
        this.canMarkAllRead = false
        //this.getUnreadCounts();
        this.setUnreadCount(0);
    },

    makeApiCall: function(continuation, success, failure) {
        this.api.getAllFollow(continuation, success, failure)
    },

    articleRead: function(subscriptionId) {
        //this.incrementUnreadCountBy(-1);
    },

    articleNotRead: function(subscriptionId) {
        //this.incrementUnreadCountBy(1);
    },

    getUnreadCounts: function(success) {
        var self = this;
        this.api.getUnreadCounts(
            function(counts) {
                var unreadWasSet = false;
                counts.each(function(count)  {
                    if (count.id.startsWith("user") && count.id.endsWith("friends")) {
                        unreadWasSet = true;
                        self.setUnreadCount(count.count);
                    }
                })
                if (!unreadWasSet) {
                    self.setUnreadCount(0);
                }
                success()
            },
            function() {}
        )
    }
})
