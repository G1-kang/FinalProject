window.fbAsyncInit = function() {
	FB.init({
		appId : '525589051478490',
		cookie : true, // Enable cookies to allow the server to access the
						// session.
		xfbml : true, // Parse social plugins on this webpage.
		version : 'v6.0' // Use this Graph API version for this call.
	});

};

(function(d, s, id) { // Load the SDK asynchronously
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id))
		return;
	js = d.createElement(s);
	js.id = id;
	js.src = "https://connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));



function facebookLoginFun(){
	
	FB.login((res)=>{
		
		if(res.status === 'connected'){
			FB.api('/me',(data)=>{
				
				let memberInfo = {
							'mid' : data.id+'_facebook',
				}
				
				xhrLoad('post', 'login', memberInfo, (res)=>{
					
					if(res === 'false'){
						
						const profileImg = addObject(false, 'div', 'signUpImgDiv', false, (o)=>{
							o.innerHTML = `<a class="signUpImg"><img class="proImg signUpImg"><span class="ImgText">프로필 사진을 넣어주세요.</span><input type="file" accept="image/*" name="mimgpath" title/></a>`
						});
						
						const platformSignUpBox = addObject(false, 'div', '_platformSignUp', false, (o)=>{
		        			o.innerHTML = `<fieldset style="">
								<legend>정보 입력</legend>
								<p><input type="text" name="mnick" placeholder="닉네임" style="width: 75%;"/><span class="noneCheck"></span></p>
								<div style="display: block;">
		        					<input type="email" name="memail" placeholder="E-mail" style="width: 140px;display: inline-block;margin: 0; margin-bottom: 0.7em;"/>
		        					<input type="button" name="memail_chk" class="grayBtn" style="width:max-content;padding:6px 5px;margin: 0; background-color:#ccc;" value="메일 인증" disabled/>
		        				</div>
		        				<p><textarea style="width:90%; height:85px; padding: 10px;" name="mabout" placeholder="자신을 소개해주세요!"></textarea><p>
								<input type="button" class="grayBtn" name="signUp" value="가입"/>
						   </fieldset>`;
		        		});
		        		
		        		boxFun(`${data.name}님, TASKTREE에 <br>오신 것을  환영합니다!<br> <span style="color:#3d3d3d; font-size:9pt;">사이트 이용에 있어서 사용하실</span><br><span style="color:#3d3d3d; font-size:9pt;">닉네임과 이메일을 작성해주세요.</span>`, true, [profileImg, platformSignUpBox], false, 'platformSignUpBox', (o, child, selector)=>{
		        			
		        			let mimgpathBtn = document.querySelector('input[name="mimgpath"]');
		    	    		imgFun(mimgpathBtn);
		        			
		        			const inputNodes = document.querySelectorAll('div._platformSignUp input');
		        			
		        			inputNodes.forEach((input)=>{
		        				
		        				
		        				if(input.name === 'memail'){
		            				
		        					emailCheckFun(input);
		            				
		            			} else if(input.name === 'mnick'){
		            				
		            				nickCheckFun(input);
		            			
		            			} else if (input.name === 'signUp'){
		           					
		           					input.addEventListener('click', ()=>{
		           						inputNodes.forEach((i)=>{
		           							if(input.type !== 'file'){
		           								i.focus();
		               							i.blur();
		           							}
		           						});
		           						
		           						if(signUpCheck) {
		           							if(mailCheck) {
		           								
		           								memberInfo = {
		           										'mid' : data.id+'_facebook',
		           										'mname' : data.name,
		           										'mnick' : document.querySelector('input[name="mnick"]').value,
		           										'memail' : document.querySelector('input[name="memail"]').value,
		           										'mabout' : document.querySelector('textarea[name="mabout"]').value,
		           										'mimgpath' : document.querySelector('.proImg').src,
		           										'mplatform' : 'facebook'
		           								}
		           								
		           								console.log(memberInfo);
		           								
		           								xhrLoad('post', 'signup', memberInfo, (data)=>{
		           									
		           									if(data){
		           										boxFun('환영합니다!', false, false, false, 'successSign', (o,n,s)=>{
		           											
		           											const btn = document.querySelector('._close_'+s);
		           											btn.addEventListener('click', ()=>{
		           												signUpCheck = false;
		           												mailCheck = false;
		           												utilBoxDelete(true);
		           												
		           											});
		           											
		           										}, false);
		           									} else {
		           										boxFun('페이스북 로그인 실패!', false, false, false, 'failSign', (o,n,s)=>{
		           											FB.logout(function(response) {
		           				        					   // Person is now logged out
		           											});
		           											
		           										}, true);
		           									}
		           									
		           								});
		           							} else {
		           								boxFun('메일 인증을 해주세요.', false, false, false, 'failSign', false, true);
		           							}
		           						} else {
		           							boxFun('정보를 정확하게 입력해주십시오', false, false, false, 'failSign', false, true);
		           						}
		           					});
		           				}
		        			});
		        			
		        			const defaultCloseBtn = document.querySelector('._close_platformSignUpBox');
		        			
		        			defaultCloseBtn.addEventListener('click',()=>{
		        				
		        				FB.logout(function(response) {
		        					   // Person is now logged out
		        				});
		        				
		        			});
		        			
		        		}, true);
					} else {
						location.reload();
					}
				});
				
			});
		}
	}, {scope: 'email,user_likes', return_scopes: true});
	
	
}

document.querySelector('#facebook-login-btn').addEventListener('click', facebookLoginFun);

