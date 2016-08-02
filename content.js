var FACEBOOK_LINK_URL = 'http://l.facebook.com';

function fireEvent(node, eventName) {
    var doc;
    if (node.ownerDocument) {
        doc = node.ownerDocument;
    } else if (node.nodeType == 9){
        doc = node;
    } else {
        throw new Error("Invalid node passed to fireEvent: " + node.id);
    }

     if (node.dispatchEvent) {
        var eventClass = "";
        switch (eventName) {
            case "click":
            case "mousedown":
            case "mouseup":
                eventClass = "MouseEvents";
                break;

            case "focus":
            case "change":
            case "blur":
            case "select":
                eventClass = "HTMLEvents";
                break;

            default:
                throw "fireEvent: Couldn't find an event class for event '" + eventName + "'.";
                break;
        }
        var event = doc.createEvent(eventClass);
        event.initEvent(eventName, true, true);

        event.synthetic = true;
        node.dispatchEvent(event, true);
    } else  if (node.fireEvent) {
        var event = doc.createEventObject();
        event.synthetic = true;
        node.fireEvent("on" + eventName, event);
    }
};


function createXPathFromElement(elm) {
    var allNodes = document.getElementsByTagName('*');
    for (var segs = []; elm && elm.nodeType == 1; elm = elm.parentNode)
    {
        if (elm.hasAttribute('id')) {
                var uniqueIdCount = 0;
                for (var n=0;n < allNodes.length;n++) {
                    if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++;
                    if (uniqueIdCount > 1) break;
                };
                if ( uniqueIdCount == 1) {
                    segs.unshift('id("' + elm.getAttribute('id') + '")');
                    return segs.join('/');
                } else {
                    segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]');
                }
        } else if (elm.hasAttribute('class')) {
            segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]');
        } else {
            for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) {
                if (sib.localName == elm.localName)  i++; };
                segs.unshift(elm.localName.toLowerCase() + '[' + i + ']');
        };
    };
    return segs.length ? '/' + segs.join('/') : null;
};


function lookupElementByXPath(path) {
    var evaluator = new XPathEvaluator();
    var result = evaluator.evaluate(path, document.documentElement, null,XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    return  result.singleNodeValue;
}


function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


function getUrl(sendResponse) {
    var urls = [],
        containers = document.getElementsByClassName('_5wvh'),
        data = [];

    for(var i = 0; i < containers.length; i++) {
        var container = containers[i],
            linkAnchor = getAnchor(container, '_5yjp'),
            archiveAnchor =  getAnchor(container, '_4bl8');

        if (!linkAnchor || !archiveAnchor) continue;

        var url = linkAnchor.href;
        if (url.includes(FACEBOOK_LINK_URL)) {
            url = getParameterByName('u', url);
        }

        data.push({
            url: url,
            xpath: createXPathFromElement(archiveAnchor),
        })
    }

    sendResponse(data);
}


function archive(xpath) {
    fireEvent(lookupElementByXPath(xpath), 'click');
}


function getAnchor(parent, className) {
    var div = parent.getElementsByClassName(className);
    if (div.length == 0) return;

    var links = div[0].getElementsByTagName('a');
    if (links.length == 0) return;

    return links[0];
}


chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    console.log(msg, sender, sendResponse);

    switch (msg.message) {
        case 'getUrl':
            getUrl(sendResponse);
            break;

        case 'archive':
            archive(msg.xpath);
            break;
    }
});