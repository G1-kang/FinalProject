/**
 * http://usejsdoc.org/
 */


// 글꼴 | 사이즈 | 굵기 | 이미지 업로드
function wchatBox(widget){
	
	let oldChatLogs;
	let oldChatObject = [];
	
	if(!widget.info.preview){
		
		// 과거 채팅 기록 불러오기
		xhrLoad('get', 'widget/wchat/'+ widget.info.wno, null, (res)=>{
			
			if(res){
				widget.info.wchat = JSON.parse(res);
				xhrLoad('get', 'fileread', { path : widget.info.wchat.wcpath }, (res)=>{
					oldChatLogs = res.split('\n');
				});
				
			} else {
				xhrLoad('post', 'widget/wchat', { wno : widget.info.wno }, (res)=>{
					
					if(res){
						widget.info.wchat = JSON.parse(res);
						
						xhrLoad('get', 'fileread', { path : widget.info.wchat.wcpath }, (res)=>{
							oldChatLogs = res.split('\n');
						});
						
					}
					
				});
			}
			
		});
		
		oldChatLogs.splice(0,2);
		oldChatLogs.splice(oldChatLogs.length-1,1);
		oldChatLogs.forEach(line=>{
			
			const con = line.split(':')[1].split('|');
			oldChatObject.push({
				mnick : con[0],
				msg : con[1]
			});
			
		});
		
	}
	
	
	const widgetContent = widget.querySelector('.widgetContent');
	
	const wchatDiv = addObject(widgetContent, 'div', 'wchatDiv', true, (o)=>{
		
		o.innerHTML = `
		<div class="wrChatLog"></div>
		<div class="wrSetting">
			<button class="fontBtn">글꼴</button>
			<button class="fontSizeBtn">글꼴 크기</button>
			<button class="fontBoldBtn">B</button>
			<button class="imagesUploadBtn">이미지 업로드</button>
		</div>
		<div style="height:13%; margin:5px 0 0 0 !important;">
			<div contenteditable="true" class="wrContent"></div>
			<button class="messageSubmitBtn grayBtn">전송</button>
		</div>
		<div class="pop"></div>
		`;
		
		if(!widget.info.preview){
			
			
			const wrContent = o.querySelector('.wrContent');
			const wrChatLog = o.querySelector('.wrChatLog');
			
			
			// 메세지 박스 생성 함수
			function msgBoxLoad(msg){
				
				let backColor, fontColor;
				let writer;
				let classNames = ['messageBox'];
				
				if(msg.mnick === userInfo.mnick){
					writer = 'msgMe';
					backColor = userInfo.dashmember.dmcolor;
					classNames.push('msgR');
				} else {
					dashboardInfo.dashmember.forEach(member=>{
						if(member.mnick === msg.mnick){
							backColor = member.dmcolor;
						}
					});
					writer = 'msgOther';
					classNames.push('msgL');
				}
				
				fontColor = `color: ${fontColorCheck(backColor)}dd;`;
				backColor = `background-color : ${backColor};`;
				
				const messageBox = addObject(wrChatLog, 'div', classNames, true, (o)=>{
					o.innerHTML = `
						<p class="wcMnick ${classNames[1]}">${msg.mnick}</p>
						<div class="msgCon ${writer} ${classNames[1]}" style="${fontColor} ${backColor}">${msg.msg}</div>
					`;
				});
				
				
				// 이미지 태그가 있으면 이미지 크게 보기 이벤트 연결
				const imgs = messageBox.querySelectorAll('img');
				imgs.forEach(img=>{
					img.addEventListener('mousedown', ()=>{
						imageView(img);
					});
				});
				
				wrChatLog.scroll({
					behavior: 'smooth',
		            left: 0,
		            top : messageBox.offsetTop 
		        });
			
			
			}
			
			
			// 과거 채팅 로그를 기반으로
			// 메세지 박스 생성
			if(oldChatObject){
				oldChatObject.forEach(log=>{
					msgBoxLoad(log);
				});
			}
			
			
			
			// 기능에 따른 웹 소켓 구독
			widget.websocket.chatClient = client.subscribe('/sub/wchat/'+widget.info.wno,(res)=>{
				const msg = JSON.parse(res.body);
				// 누군가 메세지 보내면 해당 메세지를 기반으로 메세지 박스 생성해서 출력
				msgBoxLoad(msg);
			});
			
			
			// 마우스 모양 버그 픽스
			o.addEventListener('mousemove',(e)=>{
				widget.style.cursor = 'default';
			});

			
			
			// 아래로는 wmemo 참조 거의 동일
			wrContent.addEventListener('keypress',(e)=>{

				if(e.keyCode === 13){
					document.execCommand('formatBlock', false, 'p');
				}

			});

			const pop = o.querySelector('.pop');

			const fontBtn = o.querySelector('.fontBtn');

			fontBtn.addEventListener('mousedown', (e)=>{

				const con = `
					<li style="font-family: 'Noto Sans KR', sans-serif;">Noto Sans KR</li>
					<li style="font-family: 'Nanum Gothic', sans-serif;">나눔 고딕</li>
					<li style="font-family: 'Nanum Myeongjo', sans-serif;">나눔 명조</li>
					`;

				btnList(pop, fontBtn, 'fontUl', con, [
					()=>{
						wrContent.focus();
						document.execCommand('fontName', false,'Noto Sans KR');
					},
					()=>{
						wrContent.focus();
						document.execCommand('fontName', false,'Nanum Gothic');
					},
					()=>{
						wrContent.focus();
						document.execCommand('fontName', false,'Nanum Myeongjo');
					}
					]);

			});


			const fontSizeBtn = o.querySelector('.fontSizeBtn');

			fontSizeBtn.addEventListener('mousedown', (e)=>{

				const con = `
					<li style = "font-size:8pt;">가나다라마</li>
					<li style = "font-size:10pt;">가나다라마</li>
					<li style = "font-size:12pt;">가나다라마</li>
					<li style = "font-size:14pt;">가나다라마</li>
					<li style = "font-size:18pt;">가나다라마</li>
					<li style = "font-size:24pt;">가나다라마</li>
					<li style = "font-size:36pt;">가나다라마</li>
					`;

				btnList(pop, fontSizeBtn, 'fontSizeUl', con, [
					()=>{
						wrContent.focus();
						document.execCommand('fontSize', false, '1');
					},
					()=>{
						wrContent.focus();
						document.execCommand('fontSize', false, '2');
					},
					()=>{
						wrContent.focus();
						document.execCommand('fontSize', false, '3');
					},
					()=>{
						wrContent.focus();
						document.execCommand('fontSize', false, '4');
					},
					()=>{
						wrContent.focus();
						document.execCommand('fontSize', false, '5');
					},
					()=>{
						wrContent.focus();
						document.execCommand('fontSize', false, '6');
					},
					()=>{
						wrContent.focus();
						document.execCommand('fontSize', false, '7');
					}
					]);

			});



			const fontBoldBtn = o.querySelector('.fontBoldBtn');

			fontBoldBtn.addEventListener('mousedown', (e)=>{

				wrContent.focus();

				const target = e.target;

				if(target.classList.contains('boldSelect')){
					target.classList.remove('boldSelect');
				} else {
					target.classList.add('boldSelect');
				}

				document.execCommand('bold');

			});

			const imagesUploadBtn = o.querySelector('.imagesUploadBtn');

			imagesUploadBtn.addEventListener('mousedown',(e)=>{

				getCusor(wrContent);

				imagesUploadBtn.disabled = 'true';

				const imageDiv = addObject(null,'div','imageDiv',false, (o)=>{

					o.innerHTML = `
						<div>
							<p>파일 업로드 </p>
							<div style = "position: relative;">
							<input type="text" class="fileUploadName" readonly="readonly" placeholder="파일 선택"/>
							<label class="fileLabel">파일 선택</label>
							<input type="file"/>
							</div>
						</div>
						<div>
							<p>이미지 링크 </p>
							<div><input style="width: 90%;margin: 10px 5px;" type="text" name="fileURL"/></div>
						</div>
						`;

					const fileUploadName = o.querySelector('.fileUploadName');
					const fileLabel = o.querySelector('.fileLabel');
					const file = o.querySelector('input[type="file"]');

					file.addEventListener('change',()=>{
						let reader = new FileReader();
						
						if(file.files){
							reader.addEventListener('load',(e)=>{

								const fileInfo = e.target.result.split(',')[0];

								const res = fileInfo.indexOf('image');

								if(res > -1){

									const resSrc = e.target.result;

									const img = `<img id="addImg" src="${resSrc}"/>`;
									
									setCusor(wrContent);

									document.execCommand('insertHTML', false, img );

									const tag = wrContent.querySelector('#addImg');

									tag.id = '';

									const imageBox = imageDiv.parentNode;

									motionOnOff(imageBox,0.8, false,{setting : 'offDefault'},null,(o)=>{
										o.remove();
									});

								} else {
									boxFun('이미지만 업로드 할 수 있습니다.', false, false, false, 'failUpload', false, true);
								}

							});

							reader.readAsDataURL(file.files[0]);
						}

					});

					fileLabel.addEventListener('mousedown', (e)=>{
						file.click();
					});

				});

				const imageInsert = addObject(null, 'input', ['grayBtn', 'imageInsert'], false, (o)=>{
					o.type='button';
					o.value='이미지 삽입';
					o.style.marginRight = '5px';
					o.style.width = 'max-content';
					o.addEventListener('mousedown',(e)=>{

						const fileURL = imageDiv.querySelector('input[name=fileURL]');

						const img = `<img id="addImg" src="${fileURL}"/>`;

						setCusor(wrContent);

						document.execCommand('insertHTML', false, img );

						const tag = wrContent.querySelector('#addImg');

						tag.id = '';

						imageScaleBoxFun(tag, wchatDiv, widget);

						const imageBox = o.parentNode;

						motionOnOff(imageBox,0.8, false,{setting : 'offDefault'},null,(o)=>{
							o.remove();
						});

					});
				});

				const imageBox = boxFun(null, false, [imageDiv, imageInsert], false, 'imageBox',false, true);

				imageBox.removeDisabledDelete(imagesUploadBtn);

			});
			
			
			const messageSubmitBtn = o.querySelector('.messageSubmitBtn');
			
			messageSubmitBtn.addEventListener('click',(e)=>{
				
				if(wrContent.innerHTML){
					
					const msgObject = {
							mnick : userInfo.mnick,
							msg : wrContent.innerHTML.replace(/\n/g, "").replace(/\r/g, ""),
							wno : widget.info.wno,
							wcpath : (widget.info.wchat? widget.info.wchat.wcpath : '')
					}
					
					xhrLoad('post', 'widget/wchat', msgObject, (res)=>{
						
						if(res){
							client.send('/pub/wchat', {}, JSON.stringify(msgObject));
							
							wrContent.innerHTML = '';
						} else {
							boxFun('잘못된 접근입니다.');
						}
						
					});
					
				}
				
			});
			
		}
		
	});
	
};