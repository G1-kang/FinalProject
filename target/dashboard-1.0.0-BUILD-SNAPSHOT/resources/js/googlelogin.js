/**
 * http://usejsdoc.org/
 */



function loginSignIn() {
  
  gapi.load('auth2', function() {
	    /* Ready. Make a call to gapi.auth2.init or some other API */
	  
  const auth = gapi.auth2.init({
		client_id: '869095672733-06a9k0ou1vkd2lakls4ibmba3vu5psot.apps.googleusercontent.com',
		client_secret : 'firmx8X0IVXczpi2yUTJ7MT8',
		scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/plus.me'
  });
  
  gapi.auth2.getAuthInstance().signIn().then((success)=>{

	  
	  const profile = success.getBasicProfile();
  
	  let memberInfo = {
			  'mid' : profile.getName()+'_google'
	  };
	  
	  xhrLoad('post', 'login', memberInfo, (res)=>{
		 
		  if(res === 'true'){
			  
			  location.reload();
		  
		  } else {
			  
			const profileImg = addObject(null,'div','welcomeDiv', false, t=>{
					t.innerHTML = `
						<p style="text-align:center;"><a class="signUpImg"><img class="proImg signUpImg" src="${profile.getImageUrl()}" style="position: relative;"/></a></p>
					`;
					t.style.display = 'block';
			});
      		
      		const platformSignUpBox = addObject(false, 'div', '_platformSignUp', false, (o)=>{
      			o.innerHTML = `<fieldset style="">
						<legend>정보 입력</legend>
						<p><input type="text" name="mnick" placeholder="닉네임" style="width: 75%;"/><span class="noneCheck"></span></p>`
      				+ ((profile.getEmail())? `` :
						`<div style="display: block;">
      					<input type="email" name="memail" placeholder="E-mail" style="width: 140px;display: inline-block;margin: 0; margin-bottom: 0.7em;"/>
      					<input type="button" name="memail_chk" class="grayBtn" style="width:max-content;padding:6px 5px;margin: 0; background-color:#ccc;" value="메일 인증" disabled/>
      				</div>`)+
      				`<p><textarea style="width:90%; height:85px; padding: 10px;" name="mabout" placeholder="자신을 소개해주세요!"></textarea><p>
						<input type="button" class="grayBtn" name="signUp" value="가입"/>
				   </fieldset>`;
      		});
      		
      		boxFun(`${profile.getName()}님, TASKTREE에 <br>오신 것을  환영합니다!<br> <span style="color:#3d3d3d; font-size:9pt;">사이트 이용에 있어서 사용하실</span><br><span style="color:#3d3d3d; font-size:9pt;">닉네임을 작성해주세요.</span>`, true, [profileImg, platformSignUpBox], false, 'platformSignUpBox', (o, child, selector)=>{
      			
      			const inputNodes = document.querySelectorAll('div._platformSignUp input');
      			
      			inputNodes.forEach((input)=>{
      				
      				
      				if(input.name === 'memail'){
          				
      					emailCheckFun(input);
          				
          			} else if(input.name === 'mnick'){
          				
          				nickCheckFun(input);
          			
          			} else if (input.name === 'signUp'){
         					
         					input.addEventListener('click', ()=>{
         						
         						inputNodes.forEach((i)=>{
         							i.focus();
         							i.blur();
         						});
         						
         						if(profile.getEmail()) mailCheck = true;
         						
         						if(signUpCheck) {
         							
         							if(mailCheck) {
         								
         								memberInfo = {
         										'mid' : profile.getName()+'_google',
         										'mname' : profile.getName(),
         										'mnick' : document.querySelector('input[name="mnick"]').value,
         										'memail' : ((profile.getEmail())? profile.getEmail() : document.querySelector('input[name="memail"]').value),
         										'mimgpath' : profile.getImageUrl(),
         										'mabout' : document.querySelector('textarea[name="mabout"]').value,
         										'mplatform' : 'google'
         								}
         								
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
         										boxFun('구글 로그인 실패!', false, false, false, 'failSign', (o,n,s)=>{
         											
         											let auth2 = gapi.auth2.getAuthInstance();
         						      			    auth2.signOut().then(function () {
         						      			      console.log('User signed out.');
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
      				let auth2 = gapi.auth2.getAuthInstance();
      			    auth2.signOut().then(function () {
      			      console.log('User signed out.');
      			    });
      			});
      			
      		}, true);
			  
		  }
		  
	  });
	  
  });
  },(err)=>{
	  boxFun('구글 접근에 실패했습니다.', false, false, false, 'failSign', false, true);
  });
}

document.querySelector('#google-login-btn').addEventListener('click', ()=>{
	
	loginSignIn();
	
});
