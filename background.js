var FACEBOOK_SAVE_URL = 'https://www.facebook.com/saved';
var currentTab;


function bookmarklet(data) {
	for (var i = 0; i < data.length; i++) {
		save(data[i].url, data[i].xpath);
	}
}


function save(url, xpath) {
	$.ajax({
	 	url: 'https://www.instapaper.com/bookmarklet/post_v5',
	 	method: 'POST',
	 	async: false,
	 	data: {
	 		u: url,
	 	}
	})
	.done(function( msg ) {
		console.log('done', msg, xpath);
		chrome.tabs.sendMessage(currentTab.id, { message: 'archive', xpath: xpath });
  	});
}


chrome.windows.onCreated.addListener(function(windows) {
 	chrome.tabs.create({ url: FACEBOOK_SAVE_URL, active: false }, function(tab) {
 		currentTab = tab;

	  	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	  		if (tab.id != currentTab.id) {
	  			return;
	  		}

			if (changeInfo.status != 'complete') {
				return;
			}

			console.log('complete');
			chrome.tabs.sendMessage(tab.id, { message: 'getUrl' }, bookmarklet);
		});
 	});
});

