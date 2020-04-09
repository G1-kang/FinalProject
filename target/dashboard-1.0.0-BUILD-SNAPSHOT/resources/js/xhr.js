/**
 * http://usejsdoc.org/
 */


function xhrLoad(method, url, reqeustObjet,callBack, async){
    const xhr = new XMLHttpRequest();
    
    if(method === 'get'){
    	
    	let params = '';
    	
    	if(reqeustObjet){
    		Object.keys(reqeustObjet).forEach((k)=>{
    			params += k +"=" + reqeustObjet[k] + "&";
    		});
    	}
    	
    	if(async !== null){
    		console.log(1);
    		xhr.open(method, url + "?"+params, async);
    		
    	} else {
    		console.log(2);
    		xhr.open(method, url + "?"+params);
    		
    	}
    	
    } else {
    	
    	if(async !== null){
    		console.log(3);
    		xhr.open(method, url, async);
    	} else {
    		console.log(4);
    		xhr.open(method, url);
    	}
    
    }
    
    if(callBack){
    	xhr.onreadystatechange = function(){
        	let {readyState, status, responseText} = xhr;
        	if(readyState === xhr.DONE){
            	if(status === 200){
            		callBack(responseText);
            	}
        	}
    	};
    }
    
    xhr.setRequestHeader('Content-Type', 'application/json');
    //xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    //xhr.setRequestHeader('X-HTTP-Method-Override', method);
    if(method !== 'get'){
    	if(reqeustObjet) { 
    		xhr.send(JSON.stringify(reqeustObjet)); 
    	}
    	else { 
    		xhr.send(); 
    	}
    } else { 
    	xhr.send(); 
    }
  
    
}