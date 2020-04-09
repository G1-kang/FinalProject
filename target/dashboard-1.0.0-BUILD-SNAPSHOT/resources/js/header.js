/**
 * http://usejsdoc.org/
 */

// 추가

let dashItems = [];

function headerFun(){

	
	let userInfo;	
	
	xhrLoad('get', '/dashboard/userload', null, (res)=>{
		userInfo = JSON.parse(res);
		
		
		const header = document.querySelector('header');
		
		const header_div = addObject(header, 'div', '_header', true, (o)=>{
			
		});
		
		const header_ul = addObject(header_div, 'ul', '_ul', true, (o)=>{
			
		});
		
		const title_li = addObject(header_ul, 'li', 'title_li', true, (o)=>{
			o.innerHTML = '<a href="#" onclick="return false;">TASKTREE</a>';
			o.addEventListener('click', ()=>{
				location.href = '/dashboard';
			});
		});


		const nickName_li = addObject(header_ul, 'li', 'nickName_li', true, (o)=>{
			o.innerHTML = `${userInfo.mnick}`;
		});
		
		
		const profile_li = addObject(header_ul, 'li', 'profile_li', true, (o)=>{
			o.innerHTML = `<div class="header_profile_img"><img src="${userInfo.mimgpath}" onerror="this.src='https://img.icons8.com/ultraviolet/100/000000/user.png';"/></div>`
		});
		
		const letter_li = addObject(header_ul, 'li', 'letter_li', true, (o)=>{
			o.innerHTML = `<div style="
										overflow: hidden;
										background-color: #fff;
										border-radius: 3px;
										border: 1px solid #ccc;
										width: 25px;
										height: 20px;
										position: relative;
										top: 0px;">
    
										<div style="
										position: absolute;
										left: -1px;
										top: -19px;
										width: 25px;
										height: 25px;
										border: 1px solid #aaa;
										transform: rotate(45deg);"></div>
										
										<div style="
										position: absolute;
										bottom: 5px;
										left: 8.5px;
										width: 7px;
										height: 7px;
										border-radius: 50%;
										background-color: #a63232;">
										</div>
										</div>`;
			o.style.float = 'right';
			
			o.addEventListener('click', mainBoxFun);
		});
		
	}, false);
	
	console.log(userInfo);
	
	if(userInfo.mplatform !== 'home'){
		userInfo.midstate = userInfo.mplatform + '에서 연동 중...';
	}
	
	
	
	// 메세지 소켓 연결
	client.subscribe('/sub/messagealarm/'+userInfo.mno, (res)=>{
		
		const body = JSON.parse(res.body);
		
		console.log(body);
		
		const msgBox = document.querySelector('.msgBox');
		
		if(msgBox){
			const divinners = msgBox.querySelectorAll('.divinner');
			
			divinners.forEach(div=>{
				
				if(Number(div.dataset.dno) === 0 || Number(div.dataset.dno) === Number(body.dno)){
					const sum = div.querySelector('span.sum');
					if(sum){
						let num = Number(sum.innerHTML) + 1;
						sum.innerHTML = num;
					} else {
						const sumSpan = addObject(div,'span', 'sum', true, (o)=>{
							o.innerHTML = 1;
						});
					}
					
				}
				
			});

			const dnoSelect = msgBox.querySelector('.dnoSelect');

			if(dnoSelect && Number(dnoSelect.dataset.dno) === body.dno) {
				
				const msglist = msgBox.querySelector('.msglist');
				
				var listdiv = document.createElement("div");

				listdiv.setAttribute("class","msg");

				listdiv.innerHTML=`<a class='msgtitle'>${body.msgtitle}</a>
					<span class='msgfrom'>${body.msgfromnick}</span>
					<span class='msgdate'>${body.msgdate}</span>
					<input type='hidden' id='msgno' value='${body.msgno}'/>
					<input type='hidden' id='msgopened' value='${body.msgopened}'/>`;

				if (body.msgopened==='0'){

					listdiv.setAttribute("class","opened");

				}

				msglist.insertBefore(listdiv, msglist.childNodes[0]);

			}
		}
		
		let util = document.getElementById('utilDiv');
		
		if(!util) {
			util = document.createElement('div');
			util.id = 'utilDiv';
			document.querySelector('body').appendChild(util);
		}
		
		let msgAlarm = util.querySelector('.msgAlarm');
		
		if(msgAlarm) magAlarm.remove();
		
		msgAlarm = addObject(util, 'div', 'msgAlarm', true, (o)=>{
			o.innerHTML = `
				<p><span>${body.msgfromnick}</span>님이 쪽지를 보내셨습니다.</p>
				<p>${body.msgtitle}</p>
				<p>${body.msgcontent}</p>
				<p>${body.msgdate}</p>
			`;
			o.dataset.msgno = body.msgno;
			o.addEventListener('click', mainBoxFun);
		});
		
		motionOnOff(msgAlarm, 0.8, false, { onOff : 'on' }, {
			after : (o)=>{
				o.style.transitionDuration = '0.8s';
				o.style.opacity = '0';
				o.style.bottom = '-5%';
			},
			before : (o)=>{
				o.style.opacity = '1';
				o.style.bottom = '5%';
			}
		}, (o)=>{
			
			window.setTimeout(()=>{
				motionOnOff(msgAlarm, 0.8, false, { onOff : 'off', opacity : { num0 : 0 } }, {
					after : (o)=>{
						o.style.bottom = '-5%';
					}
				}, (o)=>{
					o.remove();
				});
			}, 5000);
			
		});
		
		
	});
	
	
	return userInfo;
};


function mainBoxFun(e){
	e.preventDefault();
	e.stopPropagation();
	
	e.target.setAttribute('disabled','true');
	const letterBox = document.querySelector('.letterBox');
	
	if(!letterBox) {
		const mainDiv = addObject(null, 'div', 'mainDiv', false, (o)=>{
			
			o.innerHTML=`<div class='dashlist'></div>			
						 <div class='msglist'></div>`;
			
			// 메세지 리스트 비동기 통신 가져오기
			printDashList(o);
			
		});
		
		// 쪽지 쓰기 버튼
		const bar = document.createElement('div');
		bar.classList.add('barButton');
		bar.classList.add('reply');
		bar.addEventListener('click', ()=>{
			writeMsg();
		})
		bar.innerHTML= '새글';

		
		const msgBox = boxFun('쪽지 함', true,[bar,mainDiv],false,'msgBox',(o)=>{
			
		},true );
		
		
	}
}


function printDashList (o){
	
	let dashlist;
	
	xhrLoad('get', 'mypage/dashboard', null, (res)=>{
		dashItems = JSON.parse(res);
		console.log(dashItems);
	}, false);
	
	let divinner = "";
	
	xhrLoad('get', 'msg/dashlist',null ,(res)=>{
		
		 dashlist = JSON.parse(res);
		 
			let sum = 0;
			let countSpan = ``;
			
			for (let i = 0 ; i < dashlist.length; i++){
				sum+= dashlist[i].SUM;
			}
			
			if(sum > 0){
				countSpan = `<span data-dno="0" class="sum">${sum}</span>`;
			}
			
			divinner += `<div class='divinner' data-dno="0">
							<span data-dno="0" >ALL</span> `+ countSpan +
						`</div>`;
			
			dashItems.forEach(item=>{
				
				countSpan = ``;
				
				for (let i = 0 ; i < dashlist.length ; i++){
					
					if(dashlist[i].DNO === item.dno) {
						if(dashlist[i].SUM > 0){
							countSpan = `<span data-dno="${dashlist[i].DNO}" class="sum">${dashlist[i].SUM}</span>`;
						}
					}
				}
				
				divinner += `<div class='divinner' data-dno="${item.dno}">
					<span data-dno="${item.dno}">${item.dtitle}</span>` + countSpan +
				`</div>`;
				
			
			});
			
	}, false);

	
	o.children[0].innerHTML=divinner;
	
	var selectdno = o.firstElementChild.children;
	
	for(var i = 0 ; i<selectdno.length; i++){
		
		selectdno[i].addEventListener('click', invdmsg.bind(selectdno[i]));
		
	}
}

function invdmsg (){
		
		
		var o = this.parentElement.parentElement.children[1];
		
		const dnoCheck = o.querySelector('.dnoSelect');
		
		if(dnoCheck){
			dnoCheck.classList.remove('dnoSelect');
		}
		
		while (o.firstChild) {
			o.removeChild(o.firstChild);
		}
		
		this.classList.add('dnoSelect');
		
		// 클릭했을 시 쪽지함 별 쪽지리스트 출력
		console.dir(this);
		var dno = this.dataset.dno;	// divinner의 title(dno) 속성을 가져옴
												// -> 어느 쪽지함인지 구분함
		
		xhrLoad('get', 'msg/msgList',{ 'dno':dno }, (res)=>{
			let msglist = JSON.parse(res);
			
			for (let i = 0 ; i<msglist.length; i++){
				
				var listdiv = document.createElement("div");

				listdiv.dataset.dno = dno;
				
				listdiv.setAttribute("class","msg");
				
				listdiv.innerHTML=`<a class='msgtitle'>${msglist[i].msgtitle}</a>
								<span class='msgfrom'>${msglist[i].msgfromnick}</span>
								<span class='msgdate'>${msglist[i].msgdate}</span>
								<input type='hidden' id='msgno' value='${msglist[i].msgno}'/>
								<input type='hidden' id='msgopened' value='${msglist[i].msgopened}'/>`;
				
				if (msglist[i].msgopened==='0'){
					
					listdiv.setAttribute("class","opened");
				
				}
				
				listdiv.targetDivinner = this;
				
				o.appendChild(listdiv);
				
				// 개별 쪽지
				listdiv.addEventListener("click", openMsgFunc);			
			}
			
		},false);
}

// 개별 쪽지

function openMsgFunc(e){
	
	e.preventDefault();
	e.stopPropagation();
	
	const msgBar = e.currentTarget;
	const divinner = msgBar.targetDivinner;
	
	let msgopened = e.currentTarget.querySelector('#msgopened').getAttribute('value');
	let msgno = e.currentTarget.querySelector('#msgno').getAttribute('value');
	
	// 메세지 내용 가져오기
	
	xhrLoad('get', 'msg/openMsg', { 'msgno' : msgno },(res)=>{
		
		const sum = divinner.querySelector('.sum');
		if(sum){
			const num = Number(sum.innerHTML);
			if(num - 1 === 0){
				sum.remove();
			} else {
				sum.innerHTML = num > 0 ? num - 1 : 0;
			}
		}
		
		if(msgBar.classList.contains('msg')){
			msgBar.classList.remove('msg');
			msgBar.classList.add('opened');
		}
		
		let openMsg = JSON.parse(res);
		
		console.log(openMsg);
		
		const contentDiv = document.createElement('div');
		
		contentDiv.setAttribute('class','openMsgDiv');

		contentDiv.innerHTML=`<span>* 쪽지 *</span> <div class='reply'>답장</div>
							  <div class='openMsgtitle'>${openMsg.msgtitle}</div>
							  <div class='openMsgfrom'>*from: ${openMsg.msgfromnick}</div>
							  <div class='openMsgdate'>${openMsg.msgdate}</div>
							  <div class='openMsgcontent'>${openMsg.msgcontent}</div>
							  <div class='openMsgDno' hidden>${openMsg.dno}</div>`;
		
		contentDiv.querySelector('.reply').addEventListener('click', ()=>{
			writeMsg(openMsg);
		});
		
		const indvMsgBox = boxFun(null, false, [contentDiv], false, 'indvMsgBox', (o)=>{
	

		},true);
		
		// 읽음 표시 비동기 통신
		if (msgopened==='1') xhrLoad('get', 'msg/msgopened',{ 'msgno':msgno },()=>{}, false);
		
	}, false);
	

	
	
	
	
}

// 쪽지 쓰기 박스
function writeMsg(openMsg){
	
	const msgSpan = document.createElement('span');
	
	msgSpan.setAttribute('class','msgSpan');
	
	msgSpan.innerHTML='* 쪽지 쓰기 *';
	
	let date = new Date();
	let year = date.getFullYear();
	let month = date.getMonth()+1 ;
	let day = date.getDate();
	let hours = date.getHours();
	let minutes = date.getMinutes();
	let seconds = date.getSeconds();
	
	const msgform = document.createElement('form');
	
	msgform.setAttribute('id','msgForm');
	
	if (!openMsg){
		msgSpan.innerHTML='* 쪽지 쓰기 *';
		msgform.innerHTML=`	 <div class='msgDiv'><span id='msgCaption'>Title:</span> <input type='text' class='indvMsgtitle' name='msgtitle'/></div>
						  <div class='msgDiv'><span id='msgCaption'>Dashboard:</span> <select class='indvopenDno' name='dno'></select></div>
						  <div class='msgDiv'><span id='msgCaption'>To: </span><select class='indvopenMsgto' name='msgto'></select></div>
						  <div class='msgDiv'><textarea class='indvopenMsgcontent' name='msgcontent'></textarea></div>
						  
						  <input type='hidden' class='indvopenMsgfrom'  name='msgfrom'/ value='${userInfo.mid}'/>
						  <input type='hidden' class='indvopenMsgDate' name='msgdate' value="${year}년${month}월${day}일 ${hours}시${minutes}분"/>
						 </form>
						 `;
		var options = `<option value=''>---</option>`;
		
		
		dashItems.forEach(item=>{
			options+=`<option value='${item.dno}'>${item.dtitle}</option>`;
		});
		
		msgform.querySelector('.indvopenDno').innerHTML=options;
		
		msgform.querySelector('.indvopenDno').onchange = (e)=>{
			
			xhrLoad('get', 'msg/getDashMember',{ 'dno': e.target.value },(res)=>{
				
				openMsg = JSON.parse(res);
				
				options='';
				
				for(let i = 0 ; i < openMsg.length ; i++){
					
					if(openMsg[i].mnick !== userInfo.mnick){
						options+=`<option value='${openMsg[i].mid}'>${openMsg[i].mnick}</option>`
					}
				
				}
				
				msgform.querySelector('.indvopenMsgto').innerHTML = options;
				
			}, false);
		}
	} else {
		
		msgSpan.innerHTML='* 답장 하기 *';
		msgform.innerHTML=`	 <div class='msgDiv'><span id='msgCaption'>Title:</span> <input type='text' class='indvMsgtitle' name='msgtitle'/></div>
			  <div class='msgDiv'><span id='msgCaption'>Dashboard:</span><input readonly class='indvopenDno' name='dno' value='${openMsg.dno}'/></div>
			  <div class='msgDiv'><span id='msgCaption'>To: </span>
			  	<input type="hidden" readonly class='indvopenMsgto' name='msgto' value='${openMsg.msgfrom}'/>
				<input type="text" readonly class='indvopenMsgto' name='msgtonick' value='${openMsg.msgfromnick}'/>
			  </div>
			  <div class='msgDiv'><textarea class='indvopenMsgcontent' name='msgcontent'></textarea></div>
			  
			  <input type='hidden' class='indvopenMsgfrom'  name='msgfrom'/ value='${userInfo.mid}'/>
			  <input type='hidden' class='indvopenMsgDate' name='msgdate' value="${year}년${month}월${day}일 ${hours}시${minutes}분"/>
			 </form>
			  `;
	}
	
	const sendBtn = addObject(null, 'input',null, false, (o)=>{
		o.type = 'button';
		o.value = '보내기';
		o.style.marginRight = '5px';
		o.addEventListener('click', (e)=>{
			sendForm(e.target);
		});
	});
	
	const writeBox = boxFun(null, false, [msgSpan, msgform,sendBtn], false,'writeBox',(o)=>{
		
		o.classList.add('indvMsgBox');
		
	},true);
	
	
}

function sendForm(that){
	
	var msgForm = document.querySelector('#msgForm');
	
	console.dir(msgForm.msgto);
	
	var dto = {}
	
	for(let i = 0 ; i <msgForm.length; i++){
		
		dto[msgForm[i].name] = msgForm[i].value;
		
	}

	if (msgForm['msgto'].value===''){ 
		
		boxFun('수신자를 선택해주세요 ').closeDisabledDelete(that);
		
	} else { 
		
		xhrLoad('post', 'msg/write', dto, (res)=>{
			
			if (res){
				
				const jsonObj = JSON.parse(res);
				
				document.getElementsByClassName('writeBox')[0].remove();
				
				const confirmBox = boxFun('쪽지를 성공적으로 발송했습니다. ', false,null, false, 'confirmBox',()=>{
					
					client.send('/pub/messagealarm',{}, JSON.stringify(jsonObj));
					
				},true);

			}
		
		}, false);
	}
}

