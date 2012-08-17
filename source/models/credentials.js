var Credentials = Class.create({
  initialize: function() {
    //this.email = this.emailCookie().get()
    this.email = this.getEmail();
    //this.password = this.passwordCookie().get()
    this.password = this.getPassword();
  },

  save: function() {
    //this.emailCookie().put(this.email)
    enyo.setCookie("readerEmail", this.email);
    //this.passwordCookie().put(this.password)
    enyo.setCookie("readerPassword", this.password);
  },

  getEmail: function() {
      var email = enyo.getCookie("readerEmail");
      if (!email) {
          enyo.setCookie("readerEmail", "");
          email = "";
      }
      return email;
  },

  getPassword: function() {
      var password = enyo.getCookie("readerPassword");
      if (!password) {
          enyo.setCookie("readerPassword", "");
          password = "";
      }
      return password;
  },

  emailCookie: function() {
    //return this.getCookie("email")
  },

  passwordCookie: function() {
    //return this.getCookie("password")
  },

  getCookie: function(name) {
    //return new Mojo.Model.Cookie(name)
  }
})
