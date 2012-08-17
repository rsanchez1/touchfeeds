var ArticleContainer = Class.create(Countable, {
  initialize: function($super, api) {
    $super()
    this.api = api
    this.continuation = false
    this.items = []
  },

  reset: function() {
    this.items.clear()
    this.continuation = false
  },

  findArticles: function(success, failure) {
    var onSuccess = function(articles, id, continuation) {
      enyo.log("continuation token is " + continuation)

      this.continuation = continuation

      if(this.items.length && this.items[this.items.length - 1].load_more) {
        this.items.pop()
      }

      $A(articles).each(function(articleData) {
        this.items.push(new Article(articleData, this))
      }.bind(this))

      if(this.continuation) {
        //this.items.push(new LoadMore())
      }

      enyo.log("calling success callback");

      success()
    }.bind(this)

    this.makeApiCall(this.continuation, onSuccess, failure)
  },

  getStarredArticlesFor: function(success, failure) {
      var onSuccess = function(articles, id, continuation) {
          enyo.log("successfully found starred articles");
          if (!!continuation) {
              this.continuation = continuation;
          }

          if(this.items.length && this.items[this.items.length - 1].load_more) {
              this.items.pop();
          }

          $A(articles).each(function(articleData) {
              this.items.push(new Article(articleData, this));
          }.bind(this));

          success();

      }.bind(this);

      this.api.getStarredArticlesFor(this.id, onSuccess, failure);
  },

  highlight: function(node) {
  }
})
