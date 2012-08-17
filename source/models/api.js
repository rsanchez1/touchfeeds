var Api = Class.create({

  login: function(credentials, success, failure) {
    var authSuccess = function(response) {
        enyo.log("LOGIN SUCCESS");
        enyo.log(response.responseText);
      var authMatch = response.responseText.match(/Auth\=(.*)/)
      this.auth = authMatch ? authMatch[1] : ''
      success(this.auth)
    }.bind(this)

    var parameters = {service: "reader", Email: credentials.email, Passwd: credentials.password}

    if (!!credentials.loginToken && !!credentials.loginCaptcha) {
        parameters.logintoken = credentials.loginToken;
        parameters.logincaptcha = credentials.loginCaptcha;
    }

    new Ajax.Request("https://www.google.com/accounts/ClientLogin", {
      method: "get",
      parameters: parameters,
      onSuccess: authSuccess,
      onFailure: failure
    })
  },


  isAuthTokenValid: function() {
      if (!this.auth) {
          this.auth = Preferences.getAuthToken();
          if (!this.auth) {
              enyo.log("NO AUTH TOKEN");
              return false;
          }
      }
      if (!Preferences.getRefreshToken()) {
          enyo.log("NO REFRESH TOKEN");
          return false;
      }
      if (!Preferences.getAuthTimestamp()) {
          enyo.log("NO AUTH TIMESTAMP");
          return false;
      }
      if ((this.getTimestamp() - Preferences.getAuthTimestamp()) > (Preferences.getAuthExpires() - 100)) {
          enyo.log("TIMESTAMP EXPIRED");
          return false;
      }
      return true;
  },

  failureCheck: function(success, failure, response) {
      //success will just be the original function bound with all original arguments, failure will be the failure callback for that function
      if (!window.PalmSystem) {
          if (response.status === 401 || !(this.isAuthTokenValid())) {
              //the auth key is possibly unauthorized, request a refresh
            new Ajax.Request("https://accounts.google.com/o/oauth2/token", {
                method: "post",
                parameters: {
                    client_id: "663702953261.apps.googleusercontent.com", 
                    client_secret: "afyCoEy45sGAMO9uUDyaiuwb", 
                    refresh_token: Preferences.getRefreshToken(), 
                    grant_type: "refresh_token"
                }, 
                onSuccess: function(response) {
                    enyo.log("SUCCESSFULLY REAUTHORIZED APP");
                    globalResp = response;
                    var resp = JSON.parse(response.responseText);
                    Preferences.setAuthToken(resp.access_token);
                    this.setAuthToken(resp.access_token);
                    Preferences.setAuthExpires(resp.expires_in);
                    //Preferences.setRefreshToken(resp.refresh_token);
                    Preferences.setAuthTimestamp(this.getTimestamp());
                    enyo.log("CALLING METHOD AGAIN AFTER REFRESHING TOKEN");
                    success();
                }.bind(this), 
                onFailure: function(response) {
                    enyo.log("FAILED TO REAUTHORIZE APP");
                    failure();
                }.bind(this)
            });
              
          } else {
              failure();
          }
      } else {
          enyo.log("FAILURE ON WEBOS");
          enyo.log(response.responseText);
      }
      return;
  },

  setAuthToken: function(auth) {
      this.auth = auth;
  },

    getTimestamp: function() {
            var d = new Date();
            return (Math.round(d.getTime() / 1000) - (d.getTimezoneOffset() * 60));
    },

  getPage: function(url, success, failure) {
    new Ajax.Request("http://text.readitlaterlist.com/v2/text?apikey=bO4T9t12g998dH78aMd964aLh6pab0VQ&mode=less&url=" + url, {
      method: "get",
      parameters: {},
      onFailure: failure,
      onSuccess: function(response) {
          success(response.responseText);
      },
      on403: function(response) {
          enyo.log("ALERT, HIT RATE LIMIT");
          enyo.log(response);
      },
    })
  },

  getTags: function(success, failure) {
      var boundFunc = this.getTags.bind(this, success, failure);
      var authFailure = this.failureCheck.bind(this, boundFunc, failure);
    new Ajax.Request(Api.BASE_URL + "tag/list", {
      method: "get",
      parameters: {output: "json"},
      requestHeaders: this._requestHeaders(),
      onFailure: authFailure,
      onSuccess: function(response) {success(response.responseText.evalJSON().tags)}
    })
  },

  getSortOrder: function(success, failure) {
      var boundFunc = this.getSortOrder.bind(this, success, failure);
      var authFailure = this.failureCheck.bind(this, boundFunc, failure);
    new Ajax.Request(Api.BASE_URL + "preference/stream/list", {
      method: "get",
      parameters: {output: "json"},
      requestHeaders: this._requestHeaders(),
      onFailure: authFailure,
      onSuccess: function(response) {
        var prefs = response.responseText.evalJSON()
        var sortOrder = {}

        if(prefs && prefs.streamprefs) {
          $H(prefs.streamprefs).each(function(pair) {
            pair.key = pair.key.gsub(/user\/\d+\//, "user/-/")

            $A(pair.value).each(function(pref) {
              if("subscription-ordering" == pref.id) {
                sortOrder[pair.key] = new SortOrder(pref.value)
              }
            })
          })
        }

        success(sortOrder)
      }
    })
  },

  setSortOrder: function(sortOrder, stream) {
    this._getEditToken(function(token) {
      var parameters = {
        T: token,
        s: stream || "user/-/state/com.google/root",
        k: "subscription-ordering",
        v: sortOrder
      }

      new Ajax.Request(Api.BASE_URL + "preference/stream/set", {
        method: "post",
        parameters: parameters,
        requestHeaders: this._requestHeaders()
      })
    }.bind(this))
  },

  unsubscribe: function(feed, success) {
    if(feed.constructor == Folder) {
      this.removeLabel(feed)
    }
    else {
      this._getEditToken(function(token) {
        var parameters = {
          T: token,
          s: feed.id,
          ac: "unsubscribe",
          t: feed.title
        }

        new Ajax.Request(Api.BASE_URL + "subscription/edit", {
          method: "post",
          parameters: parameters,
          requestHeaders: this._requestHeaders(),
          onSuccess: function() {success({id: feed.id, count: feed.unreadCount});}
        })
      }.bind(this))
    }
  },

  removeLabel: function(folder, success) {
    this._getEditToken(function(token) {
      var parameters = {
        T: token,
        s: folder.id,
        t: folder.title
      }

      new Ajax.Request(Api.BASE_URL + "disable-tag", {
        method: "post",
        parameters: parameters,
        requestHeaders: this._requestHeaders(),
        onSuccess: function() {success({id: folder.id})}
      })
    }.bind(this))
  },

  searchSubscriptions: function(query, success, failure) {
    var self = this

      var boundFunc = this.searchSubscriptions.bind(this, query, success, failure);
      var authFailure = this.failureCheck.bind(this, boundFunc, failure);
    new Ajax.Request(Api.BASE_URL + "feed-finder", {
      method: "get",
      parameters: {q: query, output: "json"},
      requestHeaders: this._requestHeaders(),
      onFailure: authFailure,
      onSuccess: function(response) {
        var subscriptions = response.responseText.evalJSON().items
        success(subscriptions)
      }
    })
  },

  addSubscription: function(url, success, failure) {
    this._getEditToken(function(token) {
      var parameters = {
        T: token,
        quickadd: url
      }

      var boundFunc = this.addSubscription.bind(this, url, success, failure);
      var authFailure = this.failureCheck.bind(this, boundFunc, failure);
      new Ajax.Request(Api.BASE_URL + "subscription/quickadd", {
        method: "post",
        parameters: parameters,
        requestHeaders: this._requestHeaders(),
        onFailure: authFailure,
        onSuccess: function(response) {
          var json = response.responseText.evalJSON()

          if(json.streamId) {
            success()
          }
          else {
            failure()
          }
        }
      })
    }.bind(this))
  },

  getAllSubscriptions: function(success, failure) {
    var self = this

      var boundFunc = this.getAllSubscriptions.bind(this, success, failure);
      var authFailure = this.failureCheck.bind(this, boundFunc, failure);
    new Ajax.Request(Api.BASE_URL + "subscription/list", {
      method: "get",
      parameters: {output: "json"},
      requestHeaders: this._requestHeaders(),
      onFailure: authFailure,
      onSuccess: function(response) {
        var subscriptions = response.responseText.evalJSON().subscriptions
        self.cacheTitles(subscriptions)
        success(subscriptions)
      }
    })
  },

  cacheTitles: function(subscriptions) {
    var self = this
    self.titles = {}

    subscriptions.each(function(subscription) {
      self.titles[subscription.id] = subscription.title
    })
  },

  titleFor: function(id) {
    return this.titles[id]
  },

  getUnreadCounts: function(success, failure) {
      var boundFunc = this.getUnreadCounts.bind(this, success, failure);
      var authFailure = this.failureCheck.bind(this, boundFunc, failure);
    new Ajax.Request(Api.BASE_URL + "unread-count", {
      method: "get",
      parameters: {output: "json"},
      requestHeaders: this._requestHeaders(),
      onFailure: authFailure,
      onSuccess: function(response) {
        var json = response.responseText.evalJSON()

        if(json.denied) {
          failure()
        }
        else {
          success(json.unreadcounts)
        }
      }
    })
  },

  getAllArticles: function(continuation, success, failure) {
    this._getArticles(
      "user/-/state/com.google/reading-list",
      Preferences.hideReadArticles() ? "user/-/state/com.google/read" : null,
      continuation,
      success,
      failure
    )
  },

  getAllStarred: function(continuation, success, failure) {
    this._getArticles(
      "user/-/state/com.google/starred",
      null,
      continuation,
      success,
      failure
    )
  },

  getAllShared: function(continuation, success, failure) {
    this._getArticles(
      "user/-/state/com.google/broadcast",
      null,
      continuation,
      success,
      failure
    )
  },

  getAllFollow: function(continuation, success, failure) {
      this._getArticles(
        "user/-/state/com.google/broadcast-friends",
        null,
        continuation,
        success,
        failure
      )
  },

  getAllArticlesFor: function(id, continuation, success, failure) {
    this._getArticles(
      id,
      Preferences.hideReadArticles() ? "user/-/state/com.google/read" : null,
      continuation,
      success,
      failure
    )
  },

  _getArticles: function(id, exclude, continuation, success, failure) {
      var boundFunc = this._getArticles.bind(this, id, exclude, continuation, success, failure);
      var authFailure = this.failureCheck.bind(this, boundFunc, failure);
    var parameters = {output: "json", n: 5000}

    if(id != "user/-/state/com.google/starred" &&
       id != "user/-/state/com.google/broadcast" &&
       Preferences.isOldestFirst()) {
      parameters.r = "o"
    }

    if(continuation) {
      parameters.c = continuation
    }

    if(exclude) {
      parameters.xt = exclude
    }

    new Ajax.Request(Api.BASE_URL + "stream/contents/" + escape(id), {
      method: "get",
      parameters: parameters,
      requestHeaders: this._requestHeaders(),
      onFailure: authFailure,
      onSuccess: function(response) {
        var articles = response.responseText.evalJSON()
        success(articles.items, articles.id, articles.continuation)
      }
    })
  },

  markAllRead: function(id, success, failure) {
    this._getEditToken(
      function(token) {
        var parameters = {
          T: token,
          s: id
        }

      var boundFunc = this.markAllRead.bind(this, id, success, failure);
      var authFailure = this.failureCheck.bind(this, boundFunc, failure);
        new Ajax.Request(Api.BASE_URL + "mark-all-as-read", {
          method: "post",
          parameters: parameters,
          requestHeaders: this._requestHeaders(),
          onSuccess: success,
          onFailure: authFailure
        })
      }.bind(this),

      failure
    )
  },

  getStarredArticlesFor: function(id, success, failure) {
      var r = "";
      if (Preferences.isOldestFirst()) {
          r = "&r=o";
      }

      var boundFunc = this.getStarredArticlesFor.bind(this, id, success, failure);
      var authFailure = this.failureCheck.bind(this, boundFunc, failure);
      new Ajax.Request(Api.BASE_URL + "stream/items/ids?s=" + escape(id) + "&s=user/-/state/com.google/starred&n=1000&merge=true&includeAllDirectStreamIds=true" + r + "&output=json", {
          method: "get",
          parameters: {},
          requestHeaders: this._requestHeaders(),
          onSuccess: this.starredItemsFound.bind(this, success, failure, id),
          onFailure: authFailure 
      });
  },

  starredItemsFound: function(success, failure, id, response) {
      var self = this;
      var items = response.responseText.evalJSON();
      if (!!items && !!items.itemRefs) {
          items = items.itemRefs;
          if (items.length) {
              self._getEditToken(
                function(token) {
                    var parameters = {
                        T: token,
                        i: items.findAll(function(n) {return n.directStreamIds.any(function(n) {return n == id;}) && true && n.directStreamIds.any(function(n) {return n.endsWith("state/com.google/starred");})}).map(function(n) {return n.id;})
                    }

                    if (parameters.i.length > 0) {

                          var boundFunc = self.starredItemsFound.bind(self, success, failure, id, response);
                          var authFailure = self.failureCheck.bind(self, boundFunc, failure);
                        new Ajax.Request(Api.BASE_URL + "stream/items/contents", {
                            method: "post",
                            parameters: parameters,
                            requestHeaders: self._requestHeaders(),
                            onFailure: authFailure,
                            onSuccess: function(response) {
                                var articles = response.responseText.evalJSON();
                                success(articles.items, articles.id, !!articles.continuation ? articles.continuation : null);
                            }
                        });
                    } else {
                        success([], "", false)
                    }
                });
          } else {
              success([], "", false)
          }
      } else {
          success([], "", false)
      }
  },

  search: function(query, id, success, failure) {
    var parameters = {
      q: query,
      num: 1000,
      output: "json"
    }

    if(id) {
      parameters.s = id
    }

      var boundFunc = this.search.bind(this, query, id, success, failure);
      var authFailure = this.failureCheck.bind(this, boundFunc, failure);
    new Ajax.Request(Api.BASE_URL + "search/items/ids", {
      method: "get",
      parameters: parameters,
      requestHeaders: this._requestHeaders(),
      onSuccess: this.searchItemsFound.bind(this, success, failure),
      onFailure: authFailure 
    })
  },

  searchItemsFound: function(success, failure, response) {
    var self = this
    var ids = response.responseText.evalJSON().results

    if(ids.length) {
      self._getEditToken(
        function(token) {
          var parameters = {
            T: token,
            i: ids.map(function(n) {return n.id})
          }

          var boundFunc = self.searchItemsFound.bind(self, success, failure, response);
          var authFailure = self.failureCheck.bind(self, boundFunc, failure);
          new Ajax.Request(Api.BASE_URL + "stream/items/contents", {
            method: "post",
            parameters: parameters,
            requestHeaders: self._requestHeaders(),
            onFailure: authFailure,
            onSuccess: function(response) {
              var articles = response.responseText.evalJSON()
              success(articles.items, articles.id, articles.continuation)
            }
          })
        }
      )
    }
    else {
      success([], "", false)
    }
  },

  mapSearchResults: function(response) {
    //console.log(response.responseText)
  },

  setArticleRead: function(articleId, subscriptionId, success, failure) {
    enyo.log("setting article read");
    this._editTag(
      articleId,
      subscriptionId,
      "user/-/state/com.google/read",
      "user/-/state/com.google/kept-unread",
      success,
      failure
    )
  },

  setArticleNotRead: function(articleId, subscriptionId, success, failure, sticky) {
    this._editTag(
      articleId,
      subscriptionId,
      sticky ? "user/-/state/com.google/kept-unread" : null,
      "user/-/state/com.google/read",
      success,
      failure
    )
  },

  setArticleShared: function(articleId, subscriptionId, success, failure) {
    this._editTag(
      articleId,
      subscriptionId,
      "user/-/state/com.google/broadcast",
      null,
      success,
      failure
    )
  },

  setArticleNotShared: function(articleId, subscriptionId, success, failure) {
    this._editTag(
      articleId,
      subscriptionId,
      null,
      "user/-/state/com.google/broadcast",
      success,
      failure
    )
  },

  setArticleStarred: function(articleId, subscriptionId, success, failure) {
    this._editTag(
      articleId,
      subscriptionId,
      "user/-/state/com.google/starred",
      null,
      success,
      failure
    )
  },

  setArticleNotStarred: function(articleId, subscriptionId, success, failure) {
    this._editTag(
      articleId,
      subscriptionId,
      null,
      "user/-/state/com.google/starred",
      success,
      failure
    )
  },

  _editTag: function(articleId, subscriptionId, addTag, removeTag, success, failure) {
    enyo.log("editing tag for article id = " + articleId + " and subscription id = " + subscriptionId)

    this._getEditToken(
      function(token) {
        var parameters = {
          T: token,
          i: articleId,
          s: subscriptionId
        }

        if(addTag) parameters.a = addTag
        if(removeTag) parameters.r = removeTag

          var boundFunc = this._editTag.bind(this, articleId, subscriptionId, addTag, removeTag, success, failure);
          var authFailure = this.failureCheck.bind(this, boundFunc, failure);
        new Ajax.Request(Api.BASE_URL + "edit-tag", {
          method: "post",
          parameters:  parameters,
          requestHeaders: this._requestHeaders(),
          onSuccess: success,
          onFailure: authFailure 
        })
      }.bind(this),

      failure
    )
  },

  markMultipleArticlesRead: function(articles, success, failure) {
      var boundFunc = this.markMultipleArticlesRead.bind(this, articles, success, failure);
      var authFailure = this.failureCheck.bind(this, boundFunc, failure);
      /*
      var processArticles = articles.splice(0, 49); // it seems that if you mark less than 50 articles read at the same time, you won't accidentally mark all read
      var checkSuccess = function() {
          if (articles.length) {
              this.markMultipleArticlesRead(articles, success, failure);
          } else {
              success();
          }
      }.bind(this);
      */
      this._getEditToken(
        function(token) {
            var params = ["T="+escape(token)];
            for (var i = articles.length; i--;) {
                params.push("i=" + escape(articles[i].id));
                params.push("s=" + escape(articles[i].subscriptionId));
                params.push("a=user/-/state/com.google/read");
                params.push("r=user/-/state/com.google/kept-unread");
            }

            var postParams = params.join("&");

            new Ajax.Request(Api.BASE_URL + "edit-tag", {
                method: "post",
                parameters: postParams,
                requestHeaders: this._requestHeaders(),
                onSuccess: success,
                onFailure: authFailure
            })
        }.bind(this),

        failure
    )
  },

  _requestHeaders: function() {
      //if (!!Preferences.getAuthToken()) {
      if (!window.PalmSystem) {
          return {Authorization: "Bearer " + this.auth};
      } else {
        return {Authorization:"GoogleLogin auth=" + this.auth}
      }
  },

  _getEditToken: function(success, failure) {
    if(this.editToken && (new Date().getTime() - this.editTokenTime < 120000)) {
      enyo.log("using last edit token - " + this.editToken)
      success(this.editToken)
    }
    else {
      var boundFunc = this._getEditToken.bind(this, success, failure);
      var authFailure = this.failureCheck.bind(this, boundFunc, failure);
      new Ajax.Request(Api.BASE_URL + "token", {
        method: "get",
        requestHeaders: this._requestHeaders(),
        onFailure: authFailure,
        onSuccess: function(response) {
          this.editToken = response.responseText
          this.editTokenTime = new Date().getTime()
          enyo.log("retrieved edit token - " + this.editToken)
          success(this.editToken)
        }.bind(this)
      })
    }
  }
})

Api.BASE_URL = "http://www.google.com/reader/api/0/"
