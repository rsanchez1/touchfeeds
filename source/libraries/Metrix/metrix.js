/*******************************************************************************
This license governs use of the accompanying software ("Software"), and your use of the Software constitutes acceptance of this license.

Subject to the restrictions below, you may use the Software for any commercial or noncommercial purpose, including distributing derivative works.

SECTION 1: DEFINITIONS

A. "Syntactix LLC" refers to Syntactix, LLC, a limited liability corporation organized and operating under the laws of the state of Florida.

B. "Metrix" or "Metrix Library" refers to the Metrix Library WebOS Framework, which is a Syntactix LLC software product.

C. "SOFTWARE" refers to the source code, compiled binaries, installation files documentation and any other materials provided by Syntactix LLC.

SECTION 2: LICENSE

You agree that:

A. Subject to the terms of this license, the Licensor grants you a non-transferable, non-exclusive, worldwide, royalty-free copyright license to reproduce and redistribute unmodified the SOFTWARE for use within your Palm WebOS application provided that the following conditions
are met:

  (i)   All copyright notices are retained.
  (ii)  A copy of this license is retained in the header of each source file of the software.
  
B. You may NOT decompile, disassemble, reverse engineer or otherwise attempt to extract, generate or retrieve source code from any compiled binary provided in the SOFTWARE.

C. You will (a) NOT use Syntactix's name, logo, or trademarks in association with distribution of the SOFTWARE or derivative works unless otherwise permitted in writing; and (b) you WILL indemnify, hold harmless, and defend Syntactix from and against any claims or lawsuits, including attorneys fees, that arise or result from the use or distribution of your modifications to the SOFTWARE and any additional software you distribute along with the SOFTWARE.

D. The SOFTWARE comes "as is", with no warranties. None whatsoever. This means no express, implied or statutory warranty, including without limitation, warranties of merchantability or fitness for a particular purpose or any warranty of title or non-infringement.

E. Neither Syntactix LLC nor its suppliers will be liable for any of those types of damages known as indirect, special, consequential, or incidental related to the SOFTWARE or this license, to the maximum extent the law permits, no matter what legal theory its based on. Also, you must pass this limitation of liability on whenever you distribute the SOFTWARE or derivative works.

F. If you sue anyone over patents that you think may apply to the SOFTWARE for a person's use of the SOFTWARE, your license to the SOFTWARE ends automatically.

G. The patent rights, if any, granted in this license only apply to the SOFTWARE, not to any derivative works you make.

H. The SOFTWARE is subject to U.S. export jurisdiction at the time it is licensed to you, and it may be subject to additional export or import laws in other places.  You agree to comply with all such laws and regulations that may apply to the SOFTWARE after delivery of the SOFTWARE to you.

I. If you are an agency of the U.S. Government, (i) the SOFTWARE is provided pursuant to a solicitation issued on or after December 1, 1995, is provided with the commercial license rights set forth in this license, and (ii) the SOFTWARE is provided pursuant to a solicitation issued prior to December 1, 1995, is provided with Restricted Rights as set forth in FAR, 48 C.F.R. 52.227-14 (June 1987) or DFAR, 48 C.F.R. 252.227-7013 (Oct 1988), as applicable.

J. Your rights under this license end automatically if you breach it in any way.

K. This license contains the only rights associated with the SOFTWARE and Syntactix LLC reserves all rights not expressly granted to you in this license.

© 2010 Syntactix, LLC. All rights reserved.
*******************************************************************************/


enyo.kind({
	name: "Metrix",
	kind: enyo.Component,
	components: [
		{name: "sendDeviceInfo", kind: "WebService", url: "http://metrix.webosroundup.com/MetrixInterface.asmx/DeviceDataPostV2", onSuccess: "deviceInfoSuccess", onFailure: "deviceInfoFailure"},
		{name: "sendCustomCounts", kind: "WebService", url: "http://metrix.webosroundup.com/MetrixInterface.asmx/UpdateCustomCounts", onSuccess: "customCountsSuccess", onFailure: "customCountsFailure"},
		{name: "sendBulletinBoardCheck", kind: "WebService", onSuccess: "checkBulletinBoardSuccess", onFailure: "checkBulletinBoardFailure"},
		{name: "getNUID", kind: "PalmService", service: "palm://com.palm.preferences/systemProperties", method: "Get", params: {"key": "com.palm.properties.nduid" }, onSuccess: "gotNUIDsuccess", onFailure: "gotNUIDfailed"},
		{name: "bulletinBoard", kind: "Dialog", autoClose:false, dismissWithEscape: false, dismissWithClick:false, components: [
			{name: "titleBar", allowHtml: true, content: "", style: "padding-left: 12px;"},
			{name: "messageContainer", kind: "HFlexBox", components: [
				{name: "messageScroller", kind: "Scroller", flex: 1, style: "height: 350px;", components: [
					{name: "message", kind: "HtmlContent", style: "padding-left: 12px;"}
				]}
			]},
			{name: "navBar",kind: "Toolbar", components: [
				{caption: "Snooze", onclick: "snoozeDialog"},
				{kind: "Spacer"},
				{name: "goBck", kind: "ToolButton", icon: "source/libraries/Metrix/images/menu-icon-back.png", onclick: "goBckTap"},
				{name: "pages", kind: "Control", content: "0 of 0", style:"color: #FFFFFF;"},
				{name: "goFwd", kind: "ToolButton", icon: "source/libraries/Metrix/images/menu-icon-forward.png", onclick: "goFwdTap"},
				{kind: "Spacer"},
				{caption: "Close", onclick: "dialogDone"}
			]}
		]}
	],
	constructor: function ()
	{
		this.inherited(arguments);

		this.creationTimestamp = null;
		this.lastUpdateTimestamp = null;
		this.lastBulletinTime = null;
		this.bulletinVersion = 0;
		this.bulletinData = null;
		this.bulletinIndex = 0;

		this.cookieName = "metrixCookie";
		this.metrixVersion = "0.5.1";

		this.initCookie();
	},
	postDeviceData: function ()
	{
		this.$.getNUID.call();
	},
	gotNUIDsuccess: function (f, result)
	{
		var nuid = result["com.palm.properties.nduid"];
		var deviceInfo = enyo.fetchDeviceInfo();
		var appInfo = enyo.fetchAppInfo();
		var locale = enyo.g11n.currentLocale();
		var params = null; 

		if(deviceInfo === undefined || deviceInfo === null)
		{
			params = {
				deviceId: nuid,
				companyName: appInfo.vendor,
				packageId: appInfo.id,
				appVersion: appInfo.version,
				resolution: "1024 x 768",
				webOsBuildNumber: "",
				webOsVersion: "3.0.0",
				carrier: "ROW",
				deviceName: "Browser",
				locale: locale.locale
			};
		}
		else
		{
			params = {
				deviceId: nuid,
				companyName: appInfo.vendor,
				packageId: appInfo.id,
				appVersion: appInfo.version,
				resolution: deviceInfo.screenWidth + " x " + deviceInfo.screenHeight,
				webOsBuildNumber: "",
				webOsVersion: deviceInfo.platformVersion,
				carrier: deviceInfo.carrierName,
				deviceName: deviceInfo.modelName,
				locale: locale.locale
			};
		}

		this.$.sendDeviceInfo.call(params);
	},
	gotNUIDfailed: function (f, error)
	{
		enyo.warn(error);
	},
	deviceInfoSuccess: function (f, response, transport)
	{
		if(transport.xhr.status !== 200)
		{
			enyo.warn("deviceInfoSucces received error: ", transport.xhr.status);
			return;
		}

		var temp = transport.xhr.responseXML.getElementsByTagName("creationTimestamp");

		if(temp.length > 0)
		{
			this.creationTimestamp = temp.item(0).textContent;
		}
		else
		{
			return;
		}

		temp = transport.xhr.responseXML.getElementsByTagName("lastUpdateTimestamp");
		if(temp.length > 0)
		{
			this.lastUpdateTimestamp = temp.item(0).textContent;
		}
		else
		{
			return;
		}

		this.storeCookie();
	},
	deviceInfoFailure: function (f, response, transport)
	{
		enyo.warn("Metrix Response Failed", transport.xhr.status);
		enyo.warn("Metrix Error=", response);
	},
	isExpired: function (daysAllowed)
	{
		//Date.UTC(year,month,day,hours,minutes,seconds,ms)
		var currentDate = new Date();
		var currentUtcTime = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) / 10000;

		var daysUtc = daysAllowed * 86400;

		var result = false;

		if(this.creationTimestamp !== null)
		{
			if((currentUtcTime - this.creationTimestamp) > daysUtc)
			{
				result = true;
			}
		}
		else //this.creationTimestamp === null
		{
			//some reason we don't have a creationTime use the time passed in and store it. Once the post happens the real time will over write this one
			this.creationTimestamp = currentUtcTime;
			this.storeCookie();
		}

		return result;
	},
	initCookie: function ()
	{
		var cookieJar = enyo.getCookie(this.cookieName);

		if(cookieJar === undefined || cookieJar === null)
		{
			this.creationTimestamp = null;
			this.lastUpdateTimestamp = null;
			this.lastBulletinTime = null;
			this.bulletinVersion = 0;
		}
		else
		{
			var oldMetrixCookie = enyo.json.parse(cookieJar);

			if(oldMetrixCookie.metrixVersion === this.metrixVersion)
			{
				this.creationTimestamp = oldMetrixCookie.creationTimestamp;
				this.lastUpdateTimestamp = oldMetrixCookie.lastUpdateTimestamp;
				this.lastBulletinTime = oldMetrixCookie.lastBulletinTime;
				this.bulletinVersion = oldMetrixCookie.bulletinVersion;
			}
			else
			{
				this.creationTimestamp = oldMetrixCookie.creationTimestamp;
				this.lastUpdateTimestamp = oldMetrixCookie.lastUpdateTimestamp;
				this.lastBulletinTime = oldMetrixCookie.lastBulletinTime;
				this.bulletinVersion = oldMetrixCookie.bulletinVersion;
			}
		}

		this.storeCookie();
	},
	storeCookie: function ()
	{
		var cookie = {};

		cookie.creationTimestamp = this.creationTimestamp;
		cookie.lastUpdateTimestamp = this.lastUpdateTimestamp;
		cookie.lastBulletinTime = this.lastBulletinTime;
		cookie.bulletinVersion = this.bulletinVersion;
		cookie.metrixVersion = this.metrixVersion;

		enyo.setCookie(this.cookieName, enyo.json.stringify(cookie));
	},
	customCounts: function (valueGroup, valueName, valueData)
	{
		var result = 0;

		if(!valueGroup || !valueName || !valueData || isNaN(valueData))
		{
			result = -1;
		}
		else
		{
			var appInfo = enyo.fetchAppInfo();

			var params = {
				packageId: appInfo.id, 
				valueGroup: valueGroup, 
				valueName: valueName, 
				valueData: valueData
			};

			this.$.sendCustomCounts.call(params);
		}

		return result;
	},
	customCountsSuccess: function ()
	{

	},
	customCountsFailure: function ()
	{

	},
	checkBulletinBoard: function (filter, forceReview)
	{
		var d = new Date();
		var utc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(),d.getHours(),d.getMinutes()) / 10000;

		if(forceReview)
		{
			filter = 0;
		}

		//we only check the bulletin board every 12 hours
		if(utc > (this.lastBulletinTime + 43200) || forceReview)
		{
			var appInfo = enyo.fetchAppInfo();

			var url = "http://metrix.webosroundup.com/MetrixInterface.asmx/GetBulletinBoard?packageId=" + appInfo.id; 
			
			this.$.sendBulletinBoardCheck.setUrl(url); 
			this.$.sendBulletinBoardCheck.call();
		}

	},
	checkBulletinBoardSuccess: function (f, response, transport)
	{
		if(transport.xhr.status !== 200)
		{
			enyo.warn("checkBulletinBoardSuccess received error: ", transport.xhr.status);
		}
		else
		{
			var version = transport.xhr.responseXML.getElementsByTagName("version").item(0).textContent;
			var msgArray = [];

			if(version > this.bulletinVersion)
			{        
				var bulletins = transport.xhr.responseXML.getElementsByTagName("announcement");

				for(var i = 0; i < bulletins.length; i++)
				{
					msgArray.push({title: bulletins[i].getElementsByTagName("title").item(0).textContent, text: bulletins[i].getElementsByTagName("message").item(0).textContent});
				}

				if(msgArray.length > 0)
				{
					this.bulletinData = msgArray;

					this.showBulletins();
				}
			}
		}	  
	},
	checkBulletinBoardFailure: function (f, response, transport)
	{

	},
	showBulletins: function()
	{		
		this.$.bulletinBoard.open();
		this.renderBulletin();
	},
	renderBulletin: function(direction)
	{
		if(direction == "forward")
		{
			this.bulletinIndex++;
		}
		else if(direction == "backward")
		{
			this.bulletinIndex--;
		}

		if(this.bulletinIndex < 1)
		{
			this.bulletinIndex = 0;
			this.$.goBck.hide();

			if(this.bulletinData.length > 1)
			{
				this.$.goFwd.show();
			}
		}
		else if(this.bulletinIndex > (this.bulletinData.length - 2))
		{
			this.bulletinIndex = (this.bulletinData.length -1);

			this.$.goBck.show();
			this.$.goFwd.hide();
		}
		else
		{
			this.$.goBck.show();
			this.$.goFwd.show();
		}

		this.$.titleBar.setContent("<strong>" + this.bulletinData[this.bulletinIndex].title + "</strong>");
		this.$.message.setContent(this.bulletinData[this.bulletinIndex].text);
		var page = this.bulletinIndex+1 + " of " + this.bulletinData.length;
		this.$.pages.setContent(page);
	},
	goFwdTap: function ()
	{
		this.renderBulletin("forward");
	},
	goBckTap: function ()
	{
		this.renderBulletin("backward");
	},
	dialogDone: function ()
	{
		this.bulletinIndex = 0;

		var d = new Date();
		var utc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(),d.getHours(),d.getMinutes()) / 10000; 

		this.lastBulletinTime = utc;	

		this.storeCookie();
		this.$.bulletinBoard.close();
	},
	snoozeDialog: function ()
	{
		this.bulletinIndex = 0;

		var d = new Date();
		var utc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(),d.getHours(),d.getMinutes()) / 10000; 

		this.lastBulletinTime = utc - 43200;	//simply set it back 12 hours to rerun the next time.

		this.storeCookie();
		this.$.bulletinBoard.close();
	},
	getXmlContent: function (element, defaultValue) 
	{
		defaultValue = (defaultValue === null || defaultValue === undefined) ? "" : defaultValue;

		if(element.length > 0 && element.item(0).textContent.length > 0)
		{
			return element.item(0).textContent;
		}

		return defaultValue;
	}
});
