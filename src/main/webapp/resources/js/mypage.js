/**
 * http://usejsdoc.org/
 */

let userInfo;
let selectTmpMember = '';
let client;


// 자신이 속한 대시보드에 대한 객체 생성하는 함수
// dashItem : 설정 값
// loc : true 일 경우 대시보드 영역 내에 맨 뒤에 생성 / false일 경우 맨 앞에 생성
function dashItemCreate(dashItem, loc){
	
	let state;

	
	// 자신이 소유한 대시보드임을 확인
	if(dashItem.mnick === userInfo.mnick){
		state = 'owner';
	} else {
		state = 'belong';
	}

	const dashList = document.querySelector('#'+state+'_list');

	let chk = true;

	// 이미 출력된 대시보드인지 check
	dashList.childNodes.forEach((v,k)=>{
		if(v.dataset.dno == dashItem.dno){
			chk = false;
			return;
		}
	});

	if(chk){
		
		// 클래스명으로 소유한 대시보드일경우 _owner 아닐 경우 _belong 지정
		const dashItemDiv = addObject(dashList, 'div', ['dashItem', '_'+state], loc, (o)=>{

			motionOnOff(o, 0.5, false, {
				opacity : {
					num0 : 0,
					num1 : 1
				},
				property : {
					mpp : 'margin',
					y : { num0 : -6, num1 : 10 },
					x : 6
				}
			});

			// 대시보드 번호 지정
			o.dataset.dno = dashItem.dno;

			o.innerHTML = `
				<div class="d_header">
				<p class="d_title"><span>${dashItem.dtitle}</span></p>
				<p class="d_date"><span>${new Intl.DateTimeFormat('ko-KR').format(new Date(dashItem.dcreatedate))}</span></p>
				<p class="d_nick">
				<span><img src="${dashItem.mimgpath}" onerror="this.src='https://img.icons8.com/ultraviolet/80/000000/user.png';"/></span><span>
				`+
				((state === 'owner')? `본인 소유` : `${dashItem.mnick}`)
				+`
				</span>
				</p>
				</div>
				<div class="d_body">
				<p class="d_desc">${brChange(dashItem.ddesc, true)}</p>
				</div>
				`;

			o.addEventListener('click', ()=>{

				client.disconnect();
				location.href = 'board/'+o.dataset.dno;

			});
			
			
			// 대시보드 박스 내부에서 커스텀 메뉴 설정
			const menuList = {
					'newDash' : {
						'대시보드 추가' : ()=>{ addAndModifyDashBoardFun(); }
					},
					'logout' : {
						'로그아웃' : ()=>{ logout(); }
					}
			}
			
			// 자시기 소유 대시보드라면 커스텀 메뉴 추가
			if(state === 'owner'){
				menuList['dashMenu'] = {};
				menuList.dashMenu['대시보드 수정'] = ()=>{ addAndModifyDashBoardFun(o.dataset.dno); }
				menuList.dashMenu['대시보드 삭제'] = ()=>{ dashboardDelete(o.dataset.dno); };
			}
			
			// 해당 객체 영역에 커스텀 메뉴 등록
			contextMenuFun(o,menuList);

			if(!loc){
				dashList.insertBefore(o, dashList.childNodes[0]);
			}
			
		});
	}
}


// 대시보드 삭제 함수
// 첫번째 인자로 삭제할 대시보드 번호
function dashboardDelete(dno){
	
	// 삭제 확인 버튼 생성
	const submit = addObject(null, 'button', 'grayBtn', false, (o)=>{
		
		o.innerHTML = '삭제';
		o.style.width = 'max-content';
		o.style.marginRight = '5px';
		
		// 이벤트 연결
		o.addEventListener('click',(e)=>{
			xhrLoad('get', 'mypage/dashboard/delete/'+dno, null, (res)=>{
				if(res){
					
					const members = JSON.parse(res);
					
					// backend 영역에서 return으로 대시보드에 속한 member 값을 넘겨준다.
					members.forEach(member=>{
						
						// 소속되었던 member를 목록을 조회해서 소속된 모든 맴버들에게 해당 대시보드가 삭제되었음을 알림
						client.send('/pub/delDash',{}, JSON.stringify(member));
						
						motionOnOff(o.parentNode, 0.8, false, { setting : 'offDefault' }, false, (o)=>{
							o.remove();
						});
						
					});
				}
			});
		});
	});
	
	boxFun('대시보드를 삭제하시겠습니까?', false, [submit], false, 'delCheckBox', null, true);
	
}

// 대시보드 조회 함수 - 위에 dashItemCreate 함수와 연결
function dashboardLoad(dno){
	
	if(!dno){
		xhrLoad('get','mypage/dashboard', null, (res)=>{

			const dashboardList = JSON.parse(res);

			for(let dashItem of dashboardList){
				
				
				dashItemCreate(dashItem,true);
			}
			
		},false);
		
	} else {
		xhrLoad('get', 'mypage/dashboard/'+dno, null, (res)=>{
			
			const dashItem = JSON.parse(res);
			
			
			dashItemCreate(dashItem,false);
			
		},false);
	}
	
}



/*
 * 
 * 대시보드 생성 및 수정 함수
 * 
 */

// 대시 보드 만들시 맴버 검색해서 맴버 추가 할 시 생성되는 객체 생성하는 함수
// area : 해당 맴버를 가르키는 객체를 넣을 영역
// member : 해당 객체가 가르키는 맴버 정보
// rule : 해당 member에게 적용할 권한 설정
// modify : 대시보드를 수정하는 상황에서 기존에 있던 member 권한을 표시할 때 사용 ( !! true 일 경우 rule을 null 값으로 설정 해야 하고, 순수 member 정보로 객체 생성해야 함  )
// return 만들어진 맴버 객체
function memberItemCreate(area, member, rule, modify){
	
	const memberItem = addObject(area,'span', 'dashMemberItem', true, (o)=>{
		
		o.style.backgroundColor = (modify)? member.dmcolor : rule.dgcolor;
		o.style.color =  (modify)? fontColorCheck(member.dmcolor) : fontColorCheck(rule.dgcolor);
	
		o.dataset.dgalias = (modify)? member.dgalias : rule.dgalias;
		o.dataset.dggrade = (modify)? member.dggrade : rule.dggrade;
		o.dataset.dmcolor = (modify)? member.dmcolor : rule.dgcolor;
		o.dataset.mid = member.mid;
		o.dataset.mnick = member.mnick;
		o.dataset.dmno = (member.dmno) ? member.dmno : 0;
		
		o.innerHTML = `<img class="dashMemberImg" src="${member.mimgpath}" onerror="this.src='https://img.icons8.com/ultraviolet/80/000000/user.png';"/><span>${member.mnick}</span><button class="dashMemberDelteBtn">X</button>`;
	
		const dashMemberDelteBtn = o.querySelector('.dashMemberDelteBtn');
	
		dashMemberDelteBtn.addEventListener('click', (e)=>{
		
			infoBar.infoBoxRemove();
		
			const rule = e.target.parentNode;
			rule.remove();
			
		});
	
		colorPickerBtn(o, dashMemberDelteBtn, (color)=>{
		
			o.dataset.dmcolor = color;
			o.style.backgroundColor = color;
		
			o.style.color = fontColorCheck(color);
		
		});
		
		infoBar(o, `${((modify)? member.dgalias : rule.dgalias)} (우선 순위 : ${((modify)? member.dggrade : rule.dggrade)})`);

	});
	
	return memberItem;
}

// 맴버 추가 버튼 생성
function addMemberBtnAdd(){
	
	if(!document.querySelector('.addMemberBtn')){
		
		const dashRuleDiv = document.querySelector('.dashRuleList').parentNode;
		
		const addMemberBtn = addObject(dashRuleDiv, 'input', ['addMemberBtn', 'grayBtn'], true, (o)=>{
			
			o.type = 'button';
			o.value = '추가';
			o.addEventListener('click',()=>{
				
				const dashRuleSelect = document.querySelector('#dashRuleSelect');
				
				const { dgalias, dggrade, dgcolor } = dashRuleSelect.dataset;
				
				dashRuleSelect.id = '';
				
				const dashMemberList = document.querySelector('.dashMemberList');
				
				const dashMemberItems = document.querySelectorAll('.dashMemberItem');
				
				let chk = true;
				
				// 맴버 중복 여부 확인
				dashMemberItems.forEach((item)=>{
					
					if(item.dataset.mnick === selectTmpMember.mnick){
						addMemberBtn.disabled = 'true';
						boxFun('이미 등록되어 있는 맴버입니다.').closeDisabledDelete(addMemberBtn);
						chk = false;
						return;
					}
					
				});
				
				if(chk){
					
					const mnickInput = document.querySelector('input[name=mnick]');
					mnickInput.value = '';
					
					memberItemCreate(dashMemberList, selectTmpMember, { dgalias, dggrade, dgcolor });
					
					selectTmpMember = '';
					
					o.remove();
				}
			});
		});
	}
}

// 권한 선택 이벤트
function dashRuleSelectEvent(e){
	
	e.preventDefault();
	e.stopPropagation();
	
	const oldRuleSelect = document.querySelector('#dashRuleSelect');
	const ruleItem = e.target;
	
	if(oldRuleSelect && ruleItem !== oldRuleSelect){
		oldRuleSelect.removeAttribute('id');
	}
	
	if(ruleItem.id){
		ruleItem.id = '';
	} else {
		ruleItem.id = 'dashRuleSelect';
	}
	
	
	if(selectTmpMember && ruleItem.id){
		addMemberBtnAdd();
	} else {
		const dashMemberDiv = document.querySelector('.addMemberBtn');
		if(dashMemberDiv) dashMemberDiv.remove();
	}
	
}


// 권한 객체 생성 함수
// area : 권한 객체가 출력될 영역
// rule : 객체에 부여할 권한 정보
// return 생성된 권한 객체
function dashRuleItemCreate(area, rule){
	
	// 권한 객체
	const dashRuleItem = addObject(area, 'span', 'dashRuleItem', true , (o)=>{
		
		const { dgcolor, dgalias, dggrade } = rule;
		
		// 컬러 지정
		const colorArray = (!dgcolor)? randomColor() : [dgcolor, fontColorCheck(dgcolor)];
	
		o.dataset.dgcolor = colorArray[0];
		o.dataset.dgalias = dgalias;
		o.dataset.dggrade = dggrade;
		
		o.style.backgroundColor = colorArray[0];
		o.style.color = colorArray[1];
	
		// 객체 모양 지정
		o.innerHTML = `${dgalias}<button class="dashRuleDelteBtn">X</button>`;
	
		
		// 권한 삭제 버튼
		const dashRuleDeleteBtn = o.querySelector('.dashRuleDelteBtn');
	
		// 삭제 이벤트 연결
		dashRuleDeleteBtn.addEventListener('click', (e)=>{
			
			e.preventDefault();
			e.stopPropagation();
			
			infoBar.infoBoxRemove();
			
			const rule = e.target.parentNode;
			
			const dashMemberList = document.querySelector('.dashMemberList');
			
			if(dashMemberList){
				
				const targetDalias = rule.dataset.dgalias;
				const targetDggrade = rule.dataset.dggrade;
				
				const dashMemberItems = dashMemberList.querySelectorAll('.dashMemberItem');
				
				dashMemberItems.forEach(member=>{
					
					const { dgalias, dggrade } = member.dataset
					
					if(targetDalias === dgalias && targetDggrade === dggrade){
						member.remove();
					}
					
				});
				
			}
			
			rule.remove();
		});
	
		// 컬러 픽커 버튼 생성
		colorPickerBtn(o, dashRuleDeleteBtn, (color)=>{
		
			o.dataset.dgcolor = color;
			o.style.backgroundColor = color;
		
			o.style.color = fontColorCheck(color);
		
		});
	
		// 툴팁 생성
		infoBar(o, `${dgalias} (우선 순위 : ${dggrade})`);
	
	});

	return dashRuleItem;

}


// 권한 추가 버튼에 이벤트 걸기용 함수
// btn : 대상이되는 버튼
function dashRuleAdd(btn){

	btn.addEventListener('click', (e)=>{
		
		const dggrade = document.querySelector('input[name=dggrade]');
		const dgalias = document.querySelector('input[name=dgalias]');
		
		if(!dggrade.value){
			boxFun('등급을 지어주세요.').closeDisabledDelete(btn);
			return
		} else if(!dgalias.value){
			boxFun('등급 별칭을 정해주세요.').closeDisabledDelete(btn);
			return
		} 
		
		const dashRuleList = document.querySelector('.dashRuleList');
		
		const dashRuleItems = document.querySelectorAll('.dashRuleItem');
		
		// 중복 검사
		let chk = true;
		dashRuleItems.forEach((item)=>{
			const tmp = item.dataset.dgalias;
			
			if(tmp === dgalias.value){
				btn.disabled = 'true';
				boxFun('똑같은 이름의 별칭이 있습니다.').closeDisabledDelete(btn);
				chk = false;
				return;
			}
			
		});
		
		if(chk){
			
			dashRuleItemCreate(dashRuleList, { 'dggrade' : dggrade.value, 'dgalias' : dgalias.value });
			
			dgalias.value = '';
			dggrade.value = '';
			
		}
		
	});
	
}

// 닉네임 검사 버튼 이벤트 연결
// btn : 이벤트 연결 대상이 되는 버튼
function nickSearch(btn){
	
	// 이벤트 연결
	btn.addEventListener('click',(e)=>{
		
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();

		const mnickInput = document.querySelector('input[name=mnick]');
		
		
		// 자기 자신을 검색했는지 확인
		if(mnickInput.value === userInfo.mnick){
			
			boxFun('자신이 아닌 타인을 초대해주세요.').closeDisabledDelete(btn);
			
			selectTmpMember = '';
			
			return;
		}
		
		
		// 닉네임 검색
		xhrLoad('get', 'nickcheck', { mnick : mnickInput.value }, (res)=>{
			
			
			if(res){
				
				const box = boxFun('초대 가능한 유저입니다.');
				
				box.closeDisabledDelete(btn);
				
				const dashRuleSelect = document.querySelector('#dashRuleSelect');
				
				if(dashRuleSelect){
					addMemberBtnAdd()
				}
				
				const jsonObj = JSON.parse(res);
				selectTmpMember = jsonObj;
				
			} else {
				
				boxFun('존재하지 않는 유저입니다.').closeDisabledDelete(btn);
				
				const dashMemberDiv = document.querySelector('.addMemberBtn');
				
				if(dashMemberDiv) dashMemberDiv.remove();
				
				selectTmpMember = '';
				
			}
			
		}, false);
		
	});
	
}


// 대시보드 생성 혹은 수정하는 박스 생성하는 함수
// modifyDno : 수정일 경우 수정할 대시보드 번호 주입
function addAndModifyDashBoardFun(modifyDno){
	
	/*
	 * 구조 설명
	 * 1. 1p, 2p내에 들어가는 div 객체를 미리 만들어서 변수로 선언
	 * 2. 첫 1p 생성하는 boxFun 실행 ( 함수 맨 하단에 존재 ), boxFun 함수 내부적으로 변수로 선언해놨던 객체 삽입
	 * 3. next 버튼을 누를 시 1p 박스 삭제 2p 박스 생성 후
	 *    이벤트 리스너의 콜백 함수로 정의된 익명의 콜백 함수 내부 scope 안에 클로저로 의해  addAndModifyDashBoardFun 함수의 스코프 객체가 들어가져 있고
	 *    이때 해당 스코프 객체 속성으로 선언 되었던 변수들이 속성값으로 참조되어 있다.
	 *    그렇기 때문에  해당 addAndModifyDashBoardFun 함수를 통해 생성된 엘리먼트 생명주기가 이어진다.
	 * 4. prev 버튼을 누를 시 2p 박스 삭제 1p 박스 생성 후, 위와 같은 구조로 addAndModifyDashBoardFun 함수의 스코프 객체 내의 속성을 참조해
	 *	    내부가 만들어진다.
	 * 5. 생명주기가 계속 이어지고 있는 엘리먼트를 참조하고 있기 때문에, 뒤로가기 앞으로가를 버튼을 눌러도 입력하거나 변경한 값들은 계속해서 유지된다.
	 * 
	 */
	
	
	let modifyObject;
	let oldMemberCopy; 
	
	
	// 수정할 대시보드의 모든 정보 조회
	if(modifyDno){
		
		xhrLoad('get','mypage/dashboard/modify/'+modifyDno, null, (res)=>{
			if(res){
				modifyObject = JSON.parse(res)
				
				oldMemberCopy = JSON.parse(JSON.stringify(modifyObject.members));
			}
		});
		
	}
	
	// 박스 중복 확인
	const addDashBox1 = document.querySelector('.addDashBox1');
	const addDashBox2 = document.querySelector('.addDashBox2');
	const addDashBox3 = document.querySelector('.addDashBox3');
	
	if(addDashBox1) addDashBox1.remove();
	if(addDashBox2) addDashBox2.remove();
	if(addDashBox3) addDashBox3.remove();
	
	
	// 1p 객체
	
//	대시보드 기본 설정 [ 대시보드명 / 대시보드소개 ]
	const dashInfoDiv = addObject(null, 'div', 'dashInfoDiv', false, (o)=>{
		
		const { dno, dtitle, ddesc } = (modifyObject)? modifyObject.dashBoardDto : '';
		
		o.innerHTML = `
			<p>대시보드 ${(modifyDno? '수정' : '만들기')}</p>
			<fieldset>
				<div>
					<p>대시보드명</p>
					<input type="text" name="dtitle" value="${(dtitle? dtitle : '')}"/>
				</div>
				<div>
					<p>대시보드 소개</p>
					<textarea name="ddesc">${(ddesc? ddesc : '')}</textarea>
				</div>
			</fieldset>
		`;
	});
	
	
//	 대시보드 권한 설정 [ 대시보드 권한 추가 ]
	const dashRuleDiv = addObject(null, 'div', 'dashRuleDiv', false, (o)=>{
		
		o.innerHTML = `
			<fieldset>
				<div>
					<p>대시보드 권한 추가</p>
					<input type="number" name="dggrade" placeholder="등급 우선 순위"/>
					<input type="text" name="dgalias" placeholder="등급 별칭"/>
					<input class="grayBtn" type="button" name="dashRuleAddBtn" value="권한 추가"/>
				</div>
				<div>
					<p>대시보드 권한 리스트</p>
					<div class="dashRuleList"></div>
				</div>
			</fieldset>
		`;
		
		const dashRuleList = o.querySelector('.dashRuleList');

//		만약 수정일 경우 old 권한 리스트 출력
		if(modifyObject){
			modifyObject.rules.forEach(rule=>{
				dashRuleItemCreate(dashRuleList, rule).dataset.dgno = rule.dgno;
			});
		}
		
	});
	
	
	
	
	// 2p 객체
	
//	대시보드 맴버 검색 및 룰 지정
	const dashMemberDiv = addObject(null, 'div', 'dashMemberDiv', false, (o)=>{
		
		o.innerHTML = `
			<p>대시보드 ${(modifyDno? '수정' : '만들기')}</p>
			<fieldset>
				<div>
					<p>대시보드 맴버 추가</p>
					<input style="width: 66%; float: left;" type="text" name="mnick" placeholder="맴버 닉네임 검색"/>
					<input type="button" class="grayBtn" name="nickSearchBtn" value="검색"/> 
				</div>
				<div style="clear:both;display: inline-block;width: 100%;">
					<p>대시보드 권한 리스트</p>
					<div class="dashRuleList"></div>
				</div>
			</fieldset>
		`;
		
	});
	
	
//	대시보드에 추가한 맴버 리스트
	const dashMemberListDiv = addObject(null, 'div', 'dashMemberListDiv', false, (o)=>{
		
		o.innerHTML = `
			<fieldset>
				<div>
					<p>대시보드 맴버 리스트</p>
					<div class="dashMemberList"></div>
				</div>
			</fieldset>
		`;
		
		
		const dashMemberList = o.querySelector('.dashMemberList');
		
		// 수정일 old member 리스트 출력
		// ! 만약 앞에서 old member가 종속된 old 권한이 삭제되면 해당 member도 자동으로 삭제되서 출력
		if(modifyObject){
			modifyObject.members.forEach(member=>{
				
				if(member.mid !== modifyObject.dashBoardDto.mid)
				memberItemCreate(dashMemberList, member, null, true).dataset.dmno = member.dmno;
				
			});
		}
		
	});	
	
	
	
	// etc 객체
	
	
	// 1p로 이동하는 이전 버튼
	const addDashPrevBtn = addObject(null, 'input', ['addDashPrevBtn', 'grayBtn'], false, (o)=>{
		
		o.type = 'button';
		o.style.float = 'right';
		o.style.width = 'max-content';
		o.style.margin = '0';
		o.value = '이전';
		o.addEventListener('click', (e)=>{
			
			e.preventDefault();
			e.stopPropagation();
			
			const dashRuleItemArray = document.querySelectorAll('.dashRuleItem');
			
			const addDashForm = o.parentNode;
			
			motionOnOff(addDashForm, 0.8, false, { onOff : 'off',
				opacity : { 
					num0 : 0 
					},
				property : {
					mpp : 'position',
					x : {
						num0 : -5
					}
				}
			},false, (o)=>{
				o.remove();
			});
			
			const dashRuleList = dashRuleDiv.querySelector('.dashRuleList');
			
			
			// 1p 박스 생성
			boxFun(null, false, [dashInfoDiv, dashRuleDiv, addDashNextBtn, closeDashCloseBtn], true, 'addDashBox1', (o)=>{
				
				for(let item of dashRuleItemArray){
					
					item.removeEventListener('click', dashRuleSelectEvent);
					
					if(item.id) item.removeAttribute('id');
					
					dashRuleList.appendChild(item);
					
				}
				
				const dashMemberDiv = document.querySelector('.addMemberBtn');
				if(dashMemberDiv) dashMemberDiv.remove();
				
				selectTmpMember = '';
				
			}, true);
			
		});
	});
	
	// 만들기 버튼
	const addDashSubmitBtn = addObject(null, 'input', ['addDashSubmitBtn', 'grayBtn'], false, (o)=>{
		
		o.type = 'button';
		o.style.float = 'right';
		o.style.width = 'max-content';
		o.style.margin = '0 5px';
		o.value = (!modifyObject)? '만들기' : '수정';
		o.addEventListener('click', ()=>{
			
			let dashCreateInfo = {};
			
			const dtitle = dashInfoDiv.querySelector('input[name=dtitle]').value;
			const ddesc = dashInfoDiv.querySelector('textarea[name=ddesc]').value;
			
			if(!dtitle){
				o.disabled = 'true';
				boxFun('대시보드 명을 입력하지 않았습니다.').closeDisabledDelete(o);
				return
			}
			
			const rules = [];
			const members = [];
			
			dashMemberDiv.querySelectorAll('.dashRuleItem').forEach(item=>{
				
				const dggrade = item.dataset.dggrade;
				const dgalias = item.dataset.dgalias;
				const dgcolor = item.dataset.dgcolor;
				
				const ruleObject = { dggrade, dgalias, dgcolor };
				
				
				if(modifyObject){
					
					const dgno = item.dataset.dgno;
					
					ruleObject['dgno'] = dgno;
					
				}
				
				
				rules.push(ruleObject);
				
			});
			
			
			if(rules.length === 0){
				o.disabled = 'true';
				boxFun('권한이 비어 있습니다.').closeDisabledDelete(o);
				return
			}
			
			dashMemberListDiv.querySelectorAll('.dashMemberItem').forEach(item=>{
				
				const mid = item.dataset.mid;
				const mnick = item.dataset.mnick;
				const dggrade = item.dataset.dggrade;
				const dgalias = item.dataset.dgalias;
				const dmcolor = item.dataset.dmcolor;
				
				const memberObject = { mid, mnick, dggrade, dgalias, dmcolor };
				
				if(modifyObject){
					
					const dmno = item.dataset.dmno;
					
					memberObject['dmno'] = dmno;
					
				}
				
				members.push(memberObject);
				
			});
			
			
			dashCreateInfo = { dtitle, ddesc, rules, members };
			
			o.disabled = 'true';
			
			
			// 소유자가 대시보드에서 가지게될 권한 설정
			const dashMemberDivClone = dashMemberDiv.cloneNode(true);
			
			dashMemberDivClone.querySelector('div').remove();
			dashMemberDivClone.querySelector('p').remove();
			
			const dashRuleItems = dashMemberDivClone.querySelectorAll('.dashRuleItem')
			
			const addDashMyInfoCloseBtn = addObject(dashMemberDivClone, 'input', ['addDashMyInfoCloseBtn', 'grayBtn'], true, (o)=>{
						o.type = 'button';
						o.style.width = 'max-content';
						o.style.float = 'left';
						o.value = '닫기';
						o.addEventListener('click',()=>{
							motionOnOff(dashMemberDivClone.parentNode, 0.8, false, { setting : 'offDefault' }, null, (o)=>{
								addDashSubmitBtn.removeAttribute('disabled');
								o.remove();
								console.dir(document);
							});
						});
					});
			
			
			// 이벤트 및 안에 내용물 만들어주는 함수
			function myInfoFun(dashMemberDivClone, item, modify){
				
				// 중복 제거
				let addDashMyInfo = dashMemberDivClone.querySelector('.addDashMyInfo');
				let addDashMyInfoSubmitBtn = dashMemberDivClone.querySelector('.addDashMyInfoSubmitBtn');
				
				if(addDashMyInfo && addDashMyInfoSubmitBtn){
					addDashMyInfo.remove();
					addDashMyInfoSubmitBtn.remove();
				}
				
				// 자신의 권한
				addDashMyInfo = addObject(dashMemberDivClone.querySelector('div'), 'div', 'addDashMyInfo', true, (o)=>{
					
					if(modifyObject){
						o.dataset.dmno = item.dmno;
					}
					
					o.dataset.dggrade = (modify)? item.dggrade : item.dataset.dggrade;
					o.dataset.dgalias = (modify)? item.dgalias : item.dataset.dgalias;
					o.dataset.dmcolor = (modify)? item.dmcolor : item.dataset.dgcolor;
					o.style.backgroundColor = (modify)? item.dmcolor : item.dataset.dgcolor;
					o.style.color = fontColorCheck(((modify)? item.dmcolor : o.style.backgroundColor));
					o.innerHTML = `당신의 권한은 ${((modify)? item.dgalias : item.dataset.dgalias)}입니다.`;
					
					infoBar(o, `${((modify)? item.dgalias : item.dataset.dgalias)} (우선 순위 : ${((modify)? item.dggrade : item.dataset.dggrade)})`);					
					colorPickerBtn(o,null, (color)=>{
						
						o.style.backgroundColor = color;
						o.style.color = fontColorCheck(color);
						
					});
					
				});
				
				
				// 최종 확인 버튼
				addDashMyInfoSubmitBtn = addObject(dashMemberDivClone, 'input', ['addDashMyInfoSubmitBtn', 'grayBtn'], true, (o)=>{
					
					o.type = 'button';
					o.style.width = 'max-content';
					o.style.float = 'right';
					o.value = (modifyObject)? '수정' : '만들기';
					
					
					o.addEventListener('click',()=>{
						
						dashCreateInfo.downer = {
								
								dggrade : addDashMyInfo.dataset.dggrade,
								dgalias : addDashMyInfo.dataset.dgalias,
								dmcolor : addDashMyInfo.dataset.dmcolor
								
						};
						
						// 생성일 경우 수정일 경우
						if(!modifyObject){
							
							// insert에 성공하면 해당 insert한 데이터를 리턴
							xhrLoad('post', 'mypage/dashboard', dashCreateInfo, (res)=>{

								if(res){
									
									const jsonObject = JSON.parse(res);
									
									// 대시보드가 만들어지면서 해당 대시보드에 등록된 모든 맴버들에게 새로운 대시보드가 만들어졌음을 알림
									jsonObject.members.forEach(member=>{
										client.send('/pub/addDash', {}, JSON.stringify(member));
									});
									
									
									// 모든 유틸 박스 닫고
									utilBoxDelete(true);
									
									// 성공 메세지
									boxFun('성공적으로 대시보드가 만들어졌습니다.');
								}
							});
							
						} else {
							
							// 수정된 정보를 기반으로 대시보드 Info 교체
							dashCreateInfo['dashBoardDto'] = modifyObject.dashBoardDto;
							
							// update 성공 후 해당 데이터 리턴
							xhrLoad('post', 'mypage/dashboard/modify', dashCreateInfo, (res)=>{
								
								if(res){
									
									const jsonObject = JSON.parse(res);
									
									// !!! 소속된 모든 맴버, 옛날 맴버들에게 대시보드의 수정 사항에 대해 권고
									
									// 만약 현재 맴버와 과거 맴버 리스트에 존재할 경우 단순 수정 알림 ( 맴버 유지 )
									// 만약 현재 맴버가 과거 맴버 리스트에 존재하지 않을 경우 새로 추가된 맴버 대시보드 추가 알림 ( 맴버 추가 )
									jsonObject.members.forEach(member=>{
										
										// 새 유저 체크
										let chk = false;
										
										// 과거 맴버 리스트에 현재 맴버 조회
										oldMemberCopy.forEach(oldMember=>{
											
											// 과거 맴버 === 현재 맴버 일 경우 단순 수정
											if(member.mnick === oldMember.mnick){
												
												const mid = member.mid;
												const { dno, dtitle, ddesc } =  jsonObject.dashBoardDto;
												
												client.send('/pub/upDash',{},JSON.stringify({ mid, dno, dtitle, ddesc }));
												
												// 하단 알람을 안보내기 위한 true 변경
												chk = true;
												return;
											}
										});
										
										
										// 현재 맴버가 과거 맴버에 존재 하지 않을 경우 신규 유저 대시보드 추가 알림
										if(!chk){
											client.send('/pub/addDash',{},JSON.stringify({ mid : member.mid, dno : jsonObject.dashBoardDto.dno }));
										}
										
									});
									
									
									// 만약 과거 맴버가 현재 맴버 리스트에 존지 않을 경우 해당 맴버 추방된 상태 ( 맴버 추방 )
									oldMemberCopy.forEach(oldMember=>{
										
										let chk = false;
										
										// 현재 맴버 리스트 검사
										jsonObject.members.forEach(member=>{
											if(member.mnick === oldMember.mnick){
												
												// 만약 존재하면 true 변경해서 아래 send가 안 보내지도록 함
												chk = true;
												return;
											}
										});
										
										// 만약 현재 맴버 리스트에 과거 맴버가 없으면 아래 if문 실행해서 대시보드 삭제 알림
										if(!chk){
											client.send('/pub/delDash',{},JSON.stringify({ mid : oldMember.mid, dno : jsonObject.dashBoardDto.dno }));
										}
										
									});
									
									// 모든 박스 닫기
									utilBoxDelete(true);
									
									// 수정 알람
									boxFun('대시보드가 수정되었습니다..');
								}
								
							});
							
						}
						
					});
					
				});
				
			}
			
			// 수정일 경우 현재 대시보드 소유자가 대시보드 내에서의 과거 권한을 설정
			if(modifyObject){
				
				let item;
				
				modifyObject.members.forEach(member=>{
					
					if(member.mid === modifyObject.dashBoardDto.mid){
						
						dashCreateInfo.rules.forEach(rule=>{
							
							if(rule.dgalias === member.dgalias){
								
								item = member;
								return;
								
							}
							
						});
						return;
					}
					
				});
				
				if(item) myInfoFun(dashMemberDivClone, item, true);
			}
			
			dashRuleItems.forEach(item=>{
				
				item.querySelector('.colorPickerBtn').remove();
				item.querySelector('.dashRuleDelteBtn').remove();
				
				item.addEventListener('click', ()=>{
					
					myInfoFun(dashMemberDivClone, item);
					
				});
				
			});
			
			
			// 소유자 권한 박스 생성
			boxFun('대시보드 소유자의 권한을 선택해주세요.', false, [dashMemberDivClone], true, 'addDashBox3', null, true);
			
		});
		
	});
	
	
	// 2p로 가는 다음 버튼
	const addDashNextBtn = addObject(null, 'input', ['addDashNextBtn', 'grayBtn'], false, (o)=>{
		o.type = 'button';
		o.style.float = 'right';
		o.style.width = 'max-content';
		o.style.margin = '0';
		o.value = '다음';
		o.addEventListener('click', (e)=>{
			
			e.preventDefault();
			e.stopPropagation();
			
			const dashRuleItemArray = document.querySelectorAll('.dashRuleItem');
			
			const addDashForm = o.parentNode;
			
			motionOnOff(addDashForm, 0.8, false, { onOff : 'off',
				opacity : { 
					num0 : 0 
					},
				property : {
					mpp : 'position',
					x : {
						num0 : 5
					}
				}
			},false, (o)=>{
				
				o.remove();
			});
			
			
			// 2p 박스 생성
			boxFun(null, false, [dashMemberDiv, dashMemberListDiv, addDashPrevBtn, addDashSubmitBtn, closeDashCloseBtn], true, 'addDashBox2', (o)=>{
				
				const nickSearchBtn = document.querySelector('input[name=nickSearchBtn]');
				
				nickSearch(nickSearchBtn);
				
				const dashRuleList = dashMemberDiv.querySelector('.dashRuleList');
				const dashMemberItems = dashMemberListDiv.querySelectorAll('.dashMemberItem');
				
				dashMemberItems.forEach(item=>{
					
					let chk = false;
					
					const targetDalias = item.dataset.dgalias;
					const targetDggrade = Number(item.dataset.dggrade);
					
					dashRuleItemArray.forEach((item)=>{
						
						const { dgalias, dggrade } = item.dataset;
						if(targetDalias === dgalias && targetDggrade === Number(dggrade)){
							chk = true;
						}
							
					});
				
					if(!chk){
						item.remove();
					}
					
				});
				
				for(let item of dashRuleItemArray){
					
					item.addEventListener('click', dashRuleSelectEvent);
					dashRuleList.appendChild(item);
				}
				
			}, true);
			
			
		});
	});
	
	
	// 박스 닫기 버튼
	const closeDashCloseBtn = addObject(null, 'input', ['closeDashCloseBtn', 'grayBtn'], false, (o)=>{
		o.type = 'button';
		o.style.float = 'left';
		o.style.width = 'max-content';
		o.style.margin = '0';
		o.value = '닫기';
		o.addEventListener('click', (e)=>{
			
			e.preventDefault();
			e.stopPropagation();
			
			motionOnOff(o.parentNode, 0.8, false, { setting : 'offDefault' }, null, (o)=>{
				o.remove();
			});
		});
	});
	
	
	// 최초 함수 호출 시 생성되는 1p 박스
	boxFun(null, false, [dashInfoDiv, dashRuleDiv, addDashNextBtn, closeDashCloseBtn], true, 'addDashBox1', (o)=>{
		const dashRuleAddBtn = document.querySelector('input[name=dashRuleAddBtn]');
		dashRuleAdd(dashRuleAddBtn);
	}, true);
	
	
};





window.onload = ()=>{
	
	// 웹 소켓 연결
	const sock = new SockJS('broker');
	client = Stomp.over(sock);
	client.connect({},()=>{
		
		// 유저 정보 로드
		userInfo = headerFun();

		// 백그라운드 이미지 모션 적용
		backgroundMotion();

		// mypage 폼 만들기
		const content = document.querySelector('#content');

		const myBox = addObject(content, 'div', 'myPageContent', true, (o)=>{
			motionOnOff(o, 0.8, false, { setting : 'onDefault' }, {
				after : (o)=>{
					o.style.top = '20%';
					o.style.left = '50%';
					o.style.transform = 'translateX(-50%)';
				}
			});
		});


		const myProfileBox = addObject(myBox, 'div', 'myProfileBox', true, (o)=>{

			o.innerHTML = `
				<div id="myProfile">
				<div id="p_header">
				<p id="p_mnick"><span>${userInfo.mnick}</span><span>(${userInfo.midstate? userInfo.midstate : userInfo.mid})</span></p>
				</div>
				<div id="p_body">
				<p id="p_mabout">${userInfo.mabout}</p>
				</div>
				</div>
				`;

			const myImgBox = addObject(o, 'div', 'myImgBox', true, (o)=>{
				o.innerHTML = `<img src="${userInfo.mimgpath}"  onerror="this.src='https://img.icons8.com/ultraviolet/100/000000/user.png';"/>`;
			});

			const mabout = document.querySelector('#p_mabout');

			mabout.addEventListener('click', ()=>{

				const p_body = document.querySelector('#p_body');

				const text = mabout.innerHTML;

				const textarea = addObject(p_body, 'textarea', 'mabout', true, (o)=>{
					o.name = 'mabout';
					o.value = brChange(text);
					o.style.display = 'block';
					o.style.width = '90%';
					o.style.height = '70px';
					o.style.padding = '12px';
					mabout.style.display = 'none';
				});

				const maboutSubmitBtn = addObject(p_body, 'button', 'grayBtn', true, (o)=>{
					o.innerHTML = '수정';
					o.style.display = 'inline-block';
					o.addEventListener('click', ()=>{

						xhrLoad('post', 'mabout', { mno : userInfo.mno, mabout : textarea.value }, (res)=>{

							if(res === 'true'){
								mabout.innerHTML = brChange(textarea.value, true);
								userInfo['mabout'] = brChange(textarea.value, true);
								textarea.remove();
								maboutCloseBtn.remove();
								o.remove();
								mabout.style.display = 'block';
							}
						});

					});
				});

				const maboutCloseBtn = addObject(p_body, 'button', 'grayBtn', true, (o)=>{
					o.innerHTML = '취소';
					o.style.display = 'inline-block';
					o.style.margin = '0 5px';
					o.addEventListener('click', ()=>{
						textarea.remove();
						maboutSubmitBtn.remove();
						o.remove();
						mabout.style.display = 'block';
					});
				});

			});

		});

		const ownerDashBoard = addObject(myBox, 'div', 'ownerDashBoard', true, (o)=>{

			o.innerHTML = `
				<fieldset>
				<legend>내가 소유한 대시보드</legend>
				<div id="owner_list"></div>
				</fieldset>
				`;


		});

		const belongDashBoard = addObject(myBox, 'div', 'belongDashBoard', true, (o)=>{

			o.innerHTML = `
				<fieldset>
				<legend>내가 참여한 대시보드</legend>
				<div id="belong_list"></div>
				</fieldset>
				`;

		});



		const body = document.querySelector('body');
		contextMenuFun(body,{
			'newDash' : {
				'대시보드 추가' : (e)=>{
					addAndModifyDashBoardFun();
				}
			},
			'logout' : {
				'로그아웃' : ()=>{ logout(); }
			}
		});

		
		// 현재 자신이 가지고 있거나 소속된 대시보드 로드
		dashboardLoad();
		
		
		
		// 자신이 속한 대시보드가 추가되었을 때, 온 알람에 대한 대응
		client.subscribe('/sub/addDash/'+userInfo.mno, (res)=>{
			const body = JSON.parse(res.body);
			dashboardLoad(body.dno);
		});
		
		
		
		// 자신이 속했던 대시보드가 삭제되었을 때, 온 알람에 대한 대응
		client.subscribe('/sub/delDash/'+userInfo.mno, (res)=>{
			const body = JSON.parse(res.body);
			
			const dashAllItem = document.querySelectorAll('.dashItem');
			dashAllItem.forEach((item,i)=>{
				if(Number(item.dataset.dno) === body.dno){
					// 혹시나  해당 대시보드를 세션이 열어 놓은 상태였다면 해당 대시보드 제외처리
					xhrLoad('get', 'board/dashboardClose', { dno : body.dno }, (res)=>{
						motionOnOff(item, 0.8, false, { setting : 'offDefault' }, false, (o)=>{
							o.remove();
						});
					});
					return;
				}
				
			});
			
		});
		
		// 자신이 속한 대시보드가 변경되었을 때, 온 알람에 대한 대응
		client.subscribe('/sub/upDash/'+userInfo.mno, (res)=>{
		
			const body = JSON.parse(res.body);
			
			const dashAllItem = document.querySelectorAll('.dashItem');
			
			dashAllItem.forEach((item,i)=>{
				
				const dno = Number(item.dataset.dno);
				
				if(dno === body.dno){
					
					const d_title = item.querySelector('p.d_title span');
					const d_desc = item.querySelector('p.d_desc');
					
					d_title.innerHTML = body.dtitle;
					d_desc.innerHTML = body.ddesc;
					
				}
				
			});
			
			
		});
	});
};