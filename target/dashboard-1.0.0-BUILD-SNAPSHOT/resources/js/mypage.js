/**
 * http://usejsdoc.org/
 */

let userInfo;
let selectTmpMember = '';
let client;


function logout(){
		
	xhrLoad('get','logout', null, (res)=>{
		if(res === 'true'){
			location.reload();
		}
	});
		
}

function dashItemCreate(dashItem,loc){
	
	let state;

	if(dashItem.mnick === userInfo.mnick){
		state = 'owner';
	} else {
		state = 'belong';
	}

	const dashList = document.querySelector('#'+state+'_list');

	let chk = true;

	dashList.childNodes.forEach((v,k)=>{
		if(v.dataset.dno == dashItem.dno){
			chk = false;
			return;
		}
	});

	if(chk){
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

			const menuList = {
					'newDash' : {
						'대시보드 추가' : ()=>{ addAndModifyDashBoardFun(); }
					},
					'logout' : {
						'로그아웃' : ()=>{ logout(); }
					}
			}
			
			if(state === 'owner'){
				menuList['dashMenu'] = {};
				menuList.dashMenu['대시보드 수정'] = ()=>{ addAndModifyDashBoardFun(o.dataset.dno); }
				menuList.dashMenu['대시보드 삭제'] = ()=>{ dashboardDelete(o.dataset.dno); };
			}
			
			contextMenuFun(o,menuList);

			if(!loc){

				dashList.insertBefore(o, dashList.childNodes[0]);

			}
		});
	}
}

function dashboardDelete(dno){
	
	const submit = addObject(null, 'button', 'grayBtn', false, (o)=>{
		o.innerHTML = '삭제';
		o.style.width = 'max-content';
		o.style.marginRight = '5px';
		o.addEventListener('click',(e)=>{
			xhrLoad('get', 'mypage/dashboard/delete/'+dno, null, (res)=>{
				if(res){
					const members = JSON.parse(res);
					members.forEach(member=>{
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
	
	console.log(dashItems);
}


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


function dashRuleItemCreate(area, dgalias, dggrade, dgcolor){
	
	const dashRuleItem = addObject(area, 'span', 'dashRuleItem', true , (o)=>{
		
		const colorArray = (!dgcolor)? randomColor() : [dgcolor, fontColorCheck(dgcolor)];
	
		o.dataset.dgcolor = colorArray[0];
		o.dataset.dgalias = dgalias;
		o.dataset.dggrade = dggrade;
		
		o.style.backgroundColor = colorArray[0];
		o.style.color = colorArray[1];
	
		o.innerHTML = `${dgalias}<button class="dashRuleDelteBtn">X</button>`;
	
		const dashRuleDeleteBtn = o.querySelector('.dashRuleDelteBtn');
	
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
	
		colorPickerBtn(o, dashRuleDeleteBtn, (color)=>{
		
			o.dataset.dgcolor = color;
			o.style.backgroundColor = color;
		
			o.style.color = fontColorCheck(color);
		
		});
	
		infoBar(o, `${dgalias} (우선 순위 : ${dggrade})`);
	
	});

	return dashRuleItem;

}


function dashRuleAdd(btn){
	
	if(btn['oneStart']){
		return;
	}
	
	btn.addEventListener('click', ()=>{
		
		
		const dggrade = document.querySelector('input[name=dggrade]');
		const dgalias = document.querySelector('input[name=dgalias]');
		
		if(!dggrade.value){
			boxFun('등급을 지어주세요.');
			return
		} else if(!dgalias.value){
			boxFun('등급 별칭을 정해주세요.');
			return
		} 
		
		const dashRuleList = document.querySelector('.dashRuleList');
		
		const dashRuleItems = document.querySelectorAll('.dashRuleItem');
		
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
			
			dashRuleItemCreate(dashRuleList, dgalias.value, dggrade.value);
			
			dgalias.value = '';
			dggrade.value = '';
			
		}
		
	});
	
	btn['oneStart'] = true;
	
}


function nickSearch(btn){
	
	if(btn['oneStart']){
		return
	}
	
	btn.addEventListener('click',(e)=>{
		
		e.preventDefault();
		e.stopPropagation();

		btn.disabled = 'true';
		
		const mnickInput = document.querySelector('input[name=mnick]');
		
		if(mnickInput.value === userInfo.mnick){
			
			boxFun('자신이 아닌 타인을 초대해주세요.').closeDisabledDelete(btn);
			
			selectTmpMember = '';
			
			return;
		}
		
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
	
	btn['oneStart'] = true;
}

function addAndModifyDashBoardFun(modifyDno){
	
	let modifyObject;
	let oldMemberCopy; 
	
	
	if(modifyDno){
		
		xhrLoad('get','mypage/dashboard/modify/'+modifyDno, null, (res)=>{
			if(res){
				modifyObject = JSON.parse(res)
				console.log(modifyObject);
				
				oldMemberCopy = JSON.parse(JSON.stringify(modifyObject.members));
			}
		});
		
	}
	
	
	const addDashBox1 = document.querySelector('.addDashBox1');
	const addDashBox2 = document.querySelector('.addDashBox2');
	const addDashBox3 = document.querySelector('.addDashBox3');
	
	if(addDashBox1) addDashBox1.remove();
	if(addDashBox2) addDashBox2.remove();
	if(addDashBox3) addDashBox3.remove();
	
	// 1p
	const dashInfoDiv = addObject(null, 'div', 'dashInfoDiv', false, (o)=>{
		
		const { dno, dtitle, ddesc } = (modifyObject)? modifyObject.dashBoardDto : '';
		
		o.innerHTML = `
			<p>대시보드 만들기</p>
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
		
		if(modifyObject){
			modifyObject.rules.forEach(rule=>{
				dashRuleItemCreate(dashRuleList, rule.dgalias, rule.dggrade, rule.dgcolor).dataset.dgno = rule.dgno;
			});
		}
		
	});
	
	// 2p
	const dashMemberDiv = addObject(null, 'div', 'dashMemberDiv', false, (o)=>{
		
		o.innerHTML = `
			<p>대시보드 만들기</p>
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
		
		if(modifyObject){
			modifyObject.members.forEach(member=>{
				
				if(member.mid !== modifyObject.dashBoardDto.mid)
				memberItemCreate(dashMemberList, member, null, true).dataset.dmno = member.dmno;
				
			});
		}
		
	});	
	
	
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
							});
						});
					});
			
			
			function myInfoFun(dashMemberDivClone, item, modify){
				
				let addDashMyInfo = dashMemberDivClone.querySelector('.addDashMyInfo');
				let addDashMyInfoSubmitBtn = dashMemberDivClone.querySelector('.addDashMyInfoSubmitBtn');
				
				if(addDashMyInfo && addDashMyInfoSubmitBtn){
					addDashMyInfo.remove();
					addDashMyInfoSubmitBtn.remove();
				}
				
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
						
						
						if(!modifyObject){
							xhrLoad('post', 'mypage/dashboard', dashCreateInfo, (res)=>{

								if(res){
									const jsonObject = JSON.parse(res);
									console.log(jsonObject);
									jsonObject.members.forEach(member=>{
										client.send('/pub/addDash', {}, JSON.stringify(member));
									});
									utilBoxDelete(true);
									boxFun('성공적으로 대시보드가 만들어졌습니다.');
//									dashboardLoad(jsonObject.dashBoardDto.dno);
								}
							});
						} else {
							
							dashCreateInfo['dashBoardDto'] = modifyObject.dashBoardDto;
							
							xhrLoad('post', 'mypage/dashboard/modify', dashCreateInfo, (res)=>{
								
								if(res){
									const jsonObject = JSON.parse(res);
									
									jsonObject.members.forEach(member=>{
										
										let chk = false;
										
										oldMemberCopy.forEach(oldMember=>{
											if(member.mnick === oldMember.mnick){
												
												const mid = member.mid;
												const { dno, dtitle, ddesc } =  jsonObject.dashBoardDto;
												
												client.send('/pub/upDash',{},JSON.stringify({ mid, dno, dtitle, ddesc }));
												chk = true;
												return;
											}
										});
										
										if(!chk){
											client.send('/pub/addDash',{},JSON.stringify({ mid : member.mid, dno : jsonObject.dashBoardDto.dno }));
										}
										
									});
									
									oldMemberCopy.forEach(oldMember=>{
										
										let chk = false;
										
										jsonObject.members.forEach(member=>{
											if(member.mnick === oldMember.mnick){
												chk = true;
												return;
											}
										});
										
										if(!chk){
											client.send('/pub/delDash',{},JSON.stringify({ mid : oldMember.mid, dno : jsonObject.dashBoardDto.dno }));
										}
										
									});
									utilBoxDelete(true);
									boxFun('대시보드가 수정되었습니다..');
								}
								
							});
							
						}
						
					});
					
				});
				
			}
			
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
			
			boxFun('대시보드 소유자의 권한을 선택해주세요.', false, [dashMemberDivClone], true, 'addDashBox3', null, true);
			
		});
		
	});
	
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
			
			boxFun(null, false, [dashMemberDiv, dashMemberListDiv, addDashPrevBtn, addDashSubmitBtn, closeDashCloseBtn], true, 'addDashBox2', (o)=>{
				
				const nickSearchBtn = document.querySelector('input[name=nickSearchBtn]');
				
				nickSearch(nickSearchBtn);
				
				const dashRuleList = dashMemberDiv.querySelector('.dashRuleList');
				const dashMemberItems = dashMemberListDiv.querySelectorAll('.dashMemberItem');
				
				console.log(dashMemberItems)
				
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
	
	boxFun(null, false, [dashInfoDiv, dashRuleDiv, addDashNextBtn, closeDashCloseBtn], true, 'addDashBox1', (o)=>{
		const dashRuleAddBtn = document.querySelector('input[name=dashRuleAddBtn]');
		dashRuleAdd(dashRuleAddBtn);
	}, true);
	
};





window.onload = ()=>{
	
	const sock = new SockJS('broker');
	client = Stomp.over(sock);
	client.connect({},()=>{
		
		userInfo = headerFun();

		backgroundMotion();

		// mypage 만들기
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

		dashboardLoad();
		
		
		client.subscribe('/sub/addDash/'+userInfo.mno, (res)=>{
			const body = JSON.parse(res.body);
			dashboardLoad(body.dno);
		});
		
		
		client.subscribe('/sub/delDash/'+userInfo.mno, (res)=>{
			const body = JSON.parse(res.body);
			
			const dashAllItem = document.querySelectorAll('.dashItem');
			dashAllItem.forEach((item,i)=>{
				if(Number(item.dataset.dno) === body.dno){
					
					xhrLoad('get', 'board/dashboardClose', { dno : body.dno }, (res)=>{
						motionOnOff(item, 0.8, false, { setting : 'offDefault' }, false, (o)=>{
							o.remove();
						});
					});
				}
				
			});
			
		});
		
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