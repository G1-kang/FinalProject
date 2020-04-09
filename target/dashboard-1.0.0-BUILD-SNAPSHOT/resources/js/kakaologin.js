/**
 * http://usejsdoc.org/
 */


  //<![CDATA[
    // 사용할 앱의 JavaScript 키를 설정해 주세요.
    Kakao.init('fea212ccfdfdea229404673b58166748');
    // 카카오 로그인 버튼을 생성합니다.
    Kakao.Auth.createLoginButton({
      container: '#kakao-login-btn',
      success: function(authObj) {
        
    	console.log(authObj);
    	
        xhrLoad('get', 'kakaologin', authObj, (data)=>{
        	
        	const info = JSON.parse(data);
        	console.log(data);
        	
        	if(info['signcheck'] === 'true'){
        		
        		xhrLoad('post', 'login', { mid : info['info']['id']+'_kakao' }, (data)=>{
        			
        			if(data === 'true'){
        				location.reload();
        			}
        			
        		});
        	} else {
        		const profileImg = addObject(null,'div','welcomeDiv', false, t=>{
					t.innerHTML = `
						<p style="text-align:center;"><a class="signUpImg"><img class="proImg signUpImg" src="${info['info']['properties']['profile_image']}" style="position: relative;"/></a></p>
					`;
					t.style.display = 'block';
				});
        		
        		const platformSignUpBox = addObject(false, 'div', '_platformSignUp', false, (o)=>{
        			o.innerHTML = `<fieldset style="">
						<legend>정보 입력</legend>
						<p><input type="text" name="mnick" placeholder="닉네임" style="width: 75%;"/><span class="noneCheck"></span></p>
        				<p><input type="text" name="mname" placeholder="이름" style="width: 75%;"/><span class="noneCheck"></span></p>
						<div style="display: block;">
        					<input type="email" name="memail" placeholder="E-mail" style="width: 140px;display: inline-block;margin: 0; margin-bottom: 0.7em;"/>
        					<input type="button" name="memail_chk" class="grayBtn" style="width:max-content;padding:6px 5px;margin: 0; background-color:#ccc;" value="메일 인증" disabled/>
        				</div>
        				<p><textarea style="width:90%; height:85px; padding: 10px;" name="mabout" placeholder="자신을 소개해주세요!"></textarea><p>
						<input type="button" class="grayBtn" name="signUp" value="가입"/>
				   </fieldset>`;
        		});
        		
        		boxFun('사이트에  오신 것을 환영합니다! <br> <span style="color:#3d3d3d; font-size:9pt;">사이트 이용에 있어서 사용하실</span><br><span style="color:#3d3d3d; font-size:9pt;">닉네임과 성함 및 이메일을 작성해주세요.</span>', true, [profileImg, platformSignUpBox], false, 'platformSignUpBox', (o, child, selector)=>{
        			
        			const inputNodes = document.querySelectorAll('div._platformSignUp input');
        			
        			inputNodes.forEach((input)=>{
        				
        				
        				if(input.name === 'memail'){
            				
        					emailCheckFun(input);
            				
            			} else if(input.name === 'mnick'){
            				
            				nickCheckFun(input);
            			
            			} else if (input.name === 'mname'){
           					valueCheck(input, /^[a-zA-Z가-힣]{2,8}$/,(i)=>{
           						inputCheck(i,true,null);
            				}, (i)=>{
            					inputCheck(i,false,'한글 혹은 영문 대소문자 2자 이상 8자 이하여야 합니다.');
            				});
           				} else if (input.name === 'signUp'){
           					
           					input.addEventListener('click', ()=>{
           						
           						inputNodes.forEach((i)=>{
           							i.focus();
           							i.blur();
           						});
           						
           						if(signUpCheck) {
           							if(mailCheck) {
           								
           								const memberInfo = {
           										'mid' : info['info']['id']+'_kakao',
           										'mname' : document.querySelector('input[name="mname"]').value,
           										'mnick' : document.querySelector('input[name="mnick"]').value,
           										'memail' : document.querySelector('input[name="memail"]').value,
           										'mimgpath' : info['info']['properties']['profile_image'],
           										'mabout' : document.querySelector('textarea[name="mabout"]').value,
           										'mplatform' : 'kakao'
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
           										boxFun('카카오 로그인 실패!', false, false, false, 'failSign', (o,n,s)=>{
           											
           											const btn = document.querySelector('._close_'+s);
           											btn.addEventListener('click', ()=>{
           												xhrLoad('get', 'kakaoout', null, (data)=>{});
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
        				xhrLoad('get', 'kakaoout', null, (data)=>{});
        			});
        			
        		}, true);
        		
        	}
        });
        
      },
      
      fail: function(err) {
         alert(JSON.stringify(err));
      }
    });
  //]]>
