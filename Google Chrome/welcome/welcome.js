document.addEventListener('DOMContentLoaded', function () {
    //checkAvatarEskimon
    $.get("http://www.siteduzero.com/membres/eskimon-32590", function(data) {
        data = data.replace(/src=/ig, "data-src=").replace(/href=/ig, "data-href=");
        var $data = $(data);
        $('#avatarEskimon').css('background-image', "url("+$data.find("#content_profil .memberAvatar").attr('data-src')+")");
    }, "text");
	//checkAvatarSandhose (pas nécessaire)
	/*
	    SI jamais doit être mis en place, la balise img du div doit-être virée !
	*/
    /*
    $.get("http://www.siteduzero.com/membres/sandhose", function(data) {
        var xmlDoc = new DOMParser().parseFromString(data, "text/xml"), 
            $data = $(xmlDoc);
        $('#avatarSandhose').css('background-image', "url("+$data.find("img.memberAvatar").attr('src')+")");
    }, "text");
    */
});
