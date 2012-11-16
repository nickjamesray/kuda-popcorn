/*Our text-friendly function to reference the real beasts.*/
function popKuda(src,target){
	hemiObj = init(src,target);
}	



/*Ajax helper function.*/
function include(page) {
	var rq = null;
	if(window.XMLHttpRequest) {
        rq = new XMLHttpRequest();
    } else if(window.ActiveXObject) {
        try { rq = new ActiveXObject("Msxml2.XMLHTTP"); } catch(o) { try { rq = new ActiveXObject("Microsoft.XMLHTTP"); } catch(e) {} }
    }
    if(rq) {
		try{
			rq.open("GET", page, false);
            rq.send(null);
            content = rq.responseText;
			return content;
		}catch(ex) {
	            /*Rats.*/
	    }
	}
}

/*Includes and filters scripts to do what we want.*/
function init(page,target) {
			/*Check if there's a relative path. Won't work for absolute currently.*/
			var dir = page.split("/");
			page = dir.pop();
			var path = '';
			if(dir.length>0){
				dir.forEach(function(val,i){
					path += val+'/';
				});
			}
			
 			/*AJAX in the expected output page from the player's "publish"*/
			var thisHemi,hemiScript,threeScript = false;
			var hemiVar = target+'hemi';
			var head = document.getElementsByTagName('head')[0];
			var root = document.createElement('div');
			root.innerHTML = include(path+page);
			
			/*Now we look for scripts in case they aren't otherwise loaded into DOM, e.g. Three.js*/
			var children = root.childNodes;
			for(var i=0;i<children.length;i++){
				if(children[i].tagName && children[i].tagName =="SCRIPT"){
					if(children[i].src){
						fullSrc = children[i].src;
						file = fullSrc.split('/');
						relSrc = file.pop();
						var scripts = document.getElementsByTagName('script');
						var newScript = true;
						for(var a=0;a<scripts.length;a++){
							if(scripts[a].src==children[i].src){
								newScript = false;
							}
						}
						/*This catches three.js from multiloading.*/
						if(newScript){
							var script = document.createElement('script');
							script.type = 'text/javascript';
							
							if(children[i].src.search("hemi")>=0){
								/*If hemi, we may want to modify it and the JSON so we aren't stuck with just "hemi" as our var. In case someday we want multiple instances.*/
								script.id = 'hemiObject';
								hemiScript = include(path+relSrc);
								hemiScript = hemiScript.replace("kuda",target);
							
							/*Drop in custom function for handling JSON in-house*/
							subLoc = hemiScript.search("hemi.loadOctane");
							subFunc = 'hemi.loadJSON=function(a){++c;if(a===null){hemi.error(c);}else if(typeof a=="string"&&(a=JSON.parse(a))){a.type||(hemi._makeRenderers(),hemi.init());var e=hemi.fromOctane(a);a.type||hemi.ready();}},';
							hemiScript = hemiScript.substr(0,subLoc)+subFunc+hemiScript.substr(subLoc);
							hemiScript = hemiScript.replace(/hemi/g,hemiVar);	
							script.appendChild(document.createTextNode(hemiScript));
								thisHemi = script;
							}else if(children[i].src.search("Three")>=0){
								/*Three.js*/
								script.src = path+relSrc;
								threeScript = script;
							}

						}
					}else{
						/*This is the internal page JS, where we know we can grab the JSON file.*/
						var regexp = /loadOctane\('(.*?)'\)/;
						kudaJSON = regexp.exec(children[i].text)[1];
						var kudaData = include(path+kudaJSON);
						kudaData = kudaData.replace("kuda",target);
						kudaData = kudaData.replace(/hemi/g,hemiVar);
						/*We'll make a function option for this later, but for now lets assume transparency is good*/
						kudaData = kudaData.replace('{"name":"_bgColor","val":16777215},{"name":"_bgAlpha","val":1}','{"name":"_bgColor","val":0},{"name":"_bgAlpha","val":0}');
						kudaData = kudaData.replace('"setFileName","arg":["','"setFileName","arg":["'+path);
						
	
					}	
				}
				
			
			}
			/*Three.js hasn't been loaded yet, let's do it here.*/
			if(threeScript){
				head.appendChild(threeScript);
				threeScript.onload = function(){
					head.appendChild(thisHemi);
					loadKuda(hemiVar,kudaData);
				}	
			}else{
				head.appendChild(thisHemi);
			}
			
       
}

/*Okay we have a custom hemi now let's get it rolling.*/
function loadKuda(hemiInstance,kudaInstance){
	window[hemiInstance].setErrorCallback(function(msg) {
		alert('An error has occurred:\n' + msg + '\nDid you forget to copy a model to the assets directory?');
	});
	window[hemiInstance].loadPath = './';
	window[hemiInstance].loadJSON(kudaInstance);
}
	
/*Multiple instances perhaps? Besides being a huge burden on the browser. Build out later if needed*/
//	popKuda('kuda1/kudapopcorn.html','page1');

