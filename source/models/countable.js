var Countable = Class.create({
  initialize: function() {
    this.unreadCount = 0
  },

  clearUnreadCount: function() {
    this.setUnreadCount(0)
  },

  setUnreadCount: function(count) {
    this.unreadCount = count

    if(this.unreadCount < 0) {
      this.unreadCount = 0
    }

    this.unreadCountDisplay = count > 9999 ? "9999+" : count
    this.unreadCountDisplay = count <= 0 ? "" : this.unreadCountDisplay
  },

  incrementUnreadCountBy: function(count) {
    this.setUnreadCount(this.getUnreadCount() + count)
  },

  decrementUnreadCountBy: function(count) {
    this.incrementUnreadCountBy(-count)
  },

  getUnreadCount: function() {
      if (!!this.unreadCount) {
        return this.unreadCount
      } else {
          return 0;
      }
  }
})
