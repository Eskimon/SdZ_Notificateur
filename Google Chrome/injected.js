var url = document.URL;
url = url.slice(0,url.indexOf("?")) + "/" + url.slice(url.lastIndexOf("-")+1);
var els = document.getElementsByTagName("a");
var len = els.length;
var target = false;
for (var i = 0; i < len; i++) {
    var el = els[i];
    if (el.href === url) {
        target = els[i+1];
        break;
    }
}
target && target.click();

// Update du nombre de notifs
var elem = document.getElementById("notifications");
elem.click();
elem.click();