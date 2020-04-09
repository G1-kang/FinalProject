/**
 * http://usejsdoc.org/
 */

// 룰 등록 버튼

function ruleUlCreate(rule, widgetRuleList){
		
		const ul = addObject(widgetRuleList,'ul', null, true,(o)=>{
			
			o.dataset.wrcategory = rule.wrcategory;
			
			if(rule.wrcategory === 'group'){
				o.dataset.wrmin = rule.wrmin;
				o.dataset.wrmax = rule.wrmax;
			} else if(rule.wrcategory === 'individual') {
				o.dataset.dmcolor = rule.dmcolor;
				o.dataset.mimgpath = rule.imgpath;
				o.dataset.mnick = rule.mnick;
				o.dataset.mid = (function(mnick){
					let mid = '-';
					dashboardInfo.dashmember.forEach(member=>{
						if(member.mnick === mnick){
							mid = member.mid;
							return;
						}
					});
					return mid;
				})(rule.mnick);
			}
			
			o.dataset.wrrwd = rule.wrrwd;
			
			
			o.innerHTML = `
				<li>${rule.wrcategory === 'individual'? '개인' : '그룹'}</li>
				<li>${rule.mnick? rule.mnick : '-'}</li>
				<li>${rule.wrmin? rule.wrmin: '-'}</li>
				<li>${rule.wrmax? rule.wrmax : '-'}</li>
				<li>${Number(rule.wrrwd) === 6? '모든 권한' : '읽기'}</li>
			`;
			
			contextMenuFun(o, {
				'delete' : {
					'권한 삭제' : ()=>{
						o.remove();
					}
				}
			});
		});
}	

function ruleAddBtn(that){
	
	const ruleSetting = document.querySelector('.widgetRuleSetting');
	
	const wrcategory = ruleSetting.querySelector('.wrcategory .selectRule').dataset.wrcategory;
	const wrrwd = ruleSetting.querySelector('.wrrwd .selectRule').dataset.wrrwd;
	const targetBox = ruleSetting.querySelector('.targetBox');
	
	const widgetRuleList = document.querySelector('.widgetRuleSetting .widgetRuleList');
	
	const rules = [];
	
	let tmpArray = [];
	
	console.log(rules);
	
	if(wrcategory === 'group') {
		
		const wrmin = targetBox.querySelector('input[name=wrmin]').value;
		const wrmax = targetBox.querySelector('input[name=wrmax]').value;
		
		rules.push({ wrcategory, wrrwd, wrmin, wrmax });
		
	} else {
		
		const mnick = targetBox.querySelector('input[name=mnick]').value;
		
		if(mnick){
			
			const mnickArray = mnick.split(',');
			
			
			let memberNick = [];
			
			mnickArray.forEach(mnick=>{
				
				let chk = false;
				let trimMnick;
				let mimgpath,dmcolor;
				const chkLen = mnick.indexOf(',');
				if(chkLen !== -1){
					trimMnick = mnick.substring(chkLen, mnick.length).trim();
				} else {
					trimMnick = mnick.trim();
				}
				
				dashboardInfo.dashmember.forEach(member=>{
					if(trimMnick === member.mnick){
						mimgpath = member.mimgpath;
						dmcolor = member.dmcolor;
						chk = true;
					}
				});
				
				if(!chk){
					tmpArray.push(trimMnick + '님은 소속 맴버가 아닙니다.<br/>');
				} else {
					memberNick.push({'mnick' : trimMnick, mimgpath, dmcolor} );
				}
				
			});
			
			if(memberNick.length > 0){
				memberNick.forEach(value=>{
					rules.push({ wrcategory, wrrwd, 'mnick' : value.mnick, 'mimgpath' : value.mimgpath, 'dmcolor' : value.dmcolor });
				});
			}
			
		}
		
	}
	
	
	rules.forEach(rule=>{
		
		let chk = true;
		
		widgetRuleList.querySelectorAll('ul').forEach((ul,i)=>{
			
			if(i !== 0){
				const {wrcategory, mnick, wrmin, wrmax, wrrwd} = ul.dataset;
				if(wrcategory === 'group'){
					if(rule.wrmax <= wrmax && rule.wrmax >= wrmin ){
						tmpArray.push('권한 적용 범위에 중복되는 부분이 있습니다.<br/>');
						chk = false;
					} else if(rule.wrmin <= wrmax && rule.wrmin >= wrmin ){
						tmpArray.push('권한 적용 범위에 중복되는 부분이 있습니다.<br/>');
						chk = false;
					}
					
				} else {
					if(mnick === rule.mnick){
						chk = false;
						tmpArray.push(rule.mnick + '님은 이미 권한이 등록되어 있습니다.<br/>');
					}
				}
			}
		});
		
		if(chk){
			if(rule.wrcategory === 'group'){
				tmpArray.push('그룹 권한이 등록되었습니다.<br/>');
			} else {
				tmpArray.push(rule.mnick + '님의 권한이 등록되었습니다.<br/>');
			}
			
			ruleUlCreate(rule, widgetRuleList);
		}
		
	});
	
	boxFun(tmpArray.toString().replace(/,/g,''), false, null, false, 'fail', false, true).closeDisabledDelete(that);
	
}

// 모든 맴버 보기
function memberListOpen(e){
	
	const memberListDiv = addObject(null, 'div', 'memberListDiv', false, (o)=>{
		
		addObject(o, 'p', 'memberItem', true, (o)=>{
			o.innerHTML = `<span>맴버 닉네임</span><span>등급</span><span>등급</span>`;
		});
		
		const dashmember = dashboardInfo.dashmember;
		
		dashmember.forEach(member=>{
			
			
			addObject(o, 'p', 'memberItem', true, (o)=>{
				
				o.innerHTML = `<span><img style="border: 2px solid ${member.dmcolor}" src="${member.mimgpath}" onerror="this.src='https://img.icons8.com/ultraviolet/80/000000/user.png';"/>${member.mnick}</span><span>${member.dgalias}</span><span>${member.dggrade}</span>`;
				
				o.dataset.mnick = member.mnick;
				o.dataset.dgalias = member.dgalias;
				o.dataset.dggrade = member.dggrade;
				
				o.addEventListener('click', (e)=>{
					
					if(o.classList.contains('select')){
						o.classList.remove('select');
						return;
					}
					
					o.classList.add('select');

				});
			});
			
		});
		
	});
	
	const memberListSubmitBtn = addObject(null, 'input', ['memberListSubmitBtn', 'grayBtn'], false, (o)=>{
		
		o.type = 'button';
		o.value = '선택';
		o.style.width = 'max-content';
		o.style.marginRight = '5px';
		o.addEventListener('click', ()=>{
			
			const selectArray = memberListDiv.querySelectorAll('.select');
			
			if(selectArray){
			
				const mnickInput = document.querySelector('input[name=mnick]');
			
				let tmp = [];
			
				selectArray.forEach(select=>{
					tmp.push(select.dataset.mnick);
				});
			
				mnickInput.value = tmp.toString();
				
				const memberList = o.parentNode;
				
				motionOnOff(memberList, 0.8, false, {setting : 'offDefault'}, null, (o)=>{
					o.removeDisabledDelete(e.target);
					o.remove();
				});
				
			}
		});
		
	});
	
	boxFun('현재 보드의 모든 맴버 리스트',false, [memberListDiv,memberListSubmitBtn], false, 'memberList', null, true).closeDisabledDelete(e.target);

	return false;
	

}
// 모든 룰리스트 보기
function ruleListOpen(e){
	
	const ruleListDiv = addObject(null, 'div', 'ruleListDiv', false, (o)=>{
		
		addObject(o, 'p', 'ruleItem', true, (o)=>{
			o.innerHTML = `<span>등급명</span><span>등급</span>`;
		});
		
		const dashgrade = dashboardInfo.dashgrade;
		
		dashgrade.forEach(rule=>{
			
			addObject(o, 'p', 'ruleItem', true, (o)=>{
				
				o.dataset.dggrade = rule.dggrade;
				o.dataset.dgalias = rule.dgalias;
				
				o.innerHTML = `<span><svg style="position: relative;top: 3px;margin-right: 5px;" width="20" height="20"><rect width="20" height="20" x="0" y="0" rx="20" ry="20" style="fill:${rule.dgcolor}"></rect></svg>${rule.dgalias}</span><span>${rule.dggrade}</span>`;
				o.addEventListener('click', ()=>{
					
					if(o.classList.contains('select')){
						o.classList.remove('select');
						return;
					}
					
					o.classList.add('select');
					
				});
			});
			
		});
		
	});
	
	const ruleListSubmitBtn = addObject(null, 'input', ['ruleListSubmitBtn', 'grayBtn'], false, (o)=>{
		
		o.type = 'button';
		o.value = '선택';
		o.style.width = 'max-content';
		o.style.marginRight = '5px';
		o.addEventListener('click', ()=>{
			
			const selectArray = ruleListDiv.querySelectorAll('.select');
			
			if(selectArray){
			
				const wrmin = document.querySelector('input[name=wrmin]');
				const wrmax = document.querySelector('input[name=wrmax]');
				
				let tmpArray = [];
				
				selectArray.forEach(select=>{
					const dggrade = select.dataset.dggrade;
					tmpArray.push(dggrade);
				});
				
				tmpArray = arrSort(tmpArray);
				
				wrmin.value = tmpArray[0];
				wrmax.value = tmpArray[tmpArray.length-1];
				
				const ruleList = o.parentNode;
				
				motionOnOff(ruleList, 0.8, false, {setting : 'offDefault'}, null, (o)=>{
					o.removeDisabledDelete(e.target);
					o.remove();
				});
				
			}
		});
		
	});
	
	boxFun('현재 보드의 모든 룰 리스트',false, [ruleListDiv, ruleListSubmitBtn], false, 'ruleList', null, true).closeDisabledDelete(e.target);

	return false;
}

function widgetAddAndModify(){
	
	let widget;
	
	let paramWidget = arguments[0] || null;
	
	console.dir(paramWidget);
	
	// 1p 본문
	const widgetSetting = addObject(null, 'div', 'widgetSetting', false, (o)=>{
		o.style.textAlign = 'left';
		o.innerHTML = `
			<p style="display:block;">${paramWidget? '위젯 수정' : '위젯 만들기'}</p>
			<fieldset>
				<div>
					<p>위젯 이름</p>
					<input type="text" name="wtitle" value="${paramWidget? paramWidget.info.wtitle : '제목입니다.'}"/>
				</div>
				`+ ((paramWidget)? `<input type="hidden" class="wcategory" name="wcategory" value="${paramWidget.info.wcategory}"/>` : 
				`
				<div>
					<p>위젯 종류</p>
					<select name="wcategory" class="wcategory">
						<option name="MEMO" value="MEMO">메모</option>
						<option name="CHAT" value="CHAT">채팅</option>
						<option name="SNS" value="SNS">SNS</option>
						<option name="PLAN" value="PLAN">계획</option>
						<option name="CODE" value="CODE">코드 에디터</option>
						<option name="MAP" value="MAP">지도</option>
					</select>
				</div>
				`) +`
				<div>
					<p>위젯 가로</p>
					<input type="number" name="wwidth" value="${paramWidget? paramWidget.info.wwidth : 180}" placeholder="가로"/>
				</div>
				<div>
					<p>위젯 세로</p>
					<input type="number" name="wheight" value="${paramWidget? paramWidget.info.wheight : 220}" placeholder="세로"/>
				</div>
				<div>
					<p>위젯 제목 배경색</p>
				</div>
				<div>
					<p>위젯 본문 배경색</p>
				</div>
			</fieldset>
			<fieldset style="height: 339.333px;">
				<div style="height: 100%;">
					<p style="display:block;">위젯 미리보기</p>
					<div class="widgetPreview">
						<div class="widgetPreviewScaleBtn">
							<div class="widgetPreviewScaleMinus">
								<svg width="20" height="20">
									<line x1="0%" y1="50%" x2="100%" y2="50%" stroke="#3d3d3d" stroke-width="3"></line>
								</svg>
							</div>
							<div class="widgetPreviewScalePlus">
								<svg width="20" height="20">
									<line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#3d3d3d" stroke-width="3" style="position:absolute;"></line>
									<line x1="0%" y1="50%" x2="100%" y2="50%" stroke="#3d3d3d" stroke-width="3" style="position:absolute;"></line>
								</svg>
							</div>
						</div>
						<div class="line1"></div>
						<div class="line2"></div>
					</div>
				</div>
			</fieldset>
		`;
		
		
		
		
		const colorDiv1 = o.querySelector('.widgetSetting > fieldset > div:nth-last-child(2)');
		const colorTitle = colorPickerBtn(colorDiv1, false, (color,btn)=>{
			btn.style.backgroundColor = color;
			const widgetHeader = widgetSetting.querySelector('.widget .widgetHeader');
			widgetHeader.style.backgroundColor = color;
			widgetHeader.style.color = fontColorCheck(color);
		});
		
		colorTitle.style.backgroundColor = paramWidget ? paramWidget.info.wtitlecolor : '';
		
		colorTitle.style.width = '25px';
		colorTitle.style.height = '25px';
		colorTitle.style.position = 'relative';
		colorTitle.style.top = '7px';
		
		const colorDiv2 = o.querySelector('.widgetSetting > fieldset > div:nth-last-child(1)');
		const colorContent = colorPickerBtn(colorDiv2, false, (color,btn)=>{
			btn.style.backgroundColor = color;
			const widget = widgetSetting.querySelector('.widget');
			widget.style.backgroundColor = color;
		});
		
		colorContent.style.backgroundColor = paramWidget ? paramWidget.info.wcontentcolor : '';
		
		colorContent.style.width = '25px';
		colorContent.style.height = '25px';
		colorContent.style.position = 'relative';
		colorContent.style.top = '7px';
		
		
		const wtitle = o.querySelector('input[name=wtitle]');
		const wcategory = o.querySelector('.wcategory');
		const wwidth = o.querySelector('input[name=wwidth]');
		const wheight = o.querySelector('input[name=wheight]');
		const wzindex = document.querySelector('#widgetArea').childNodes.length + 1 ;
		const wtitlecolor = o.querySelectorAll('.colorPickerBtn')[0];
		const wcontentcolor = o.querySelectorAll('.colorPickerBtn')[1];
		
		widget = widgetFun({
			'wtitle' : wtitle.value,
			'wcategory' : wcategory.value,
			'wwidth' : wwidth.value,
			'wheight' : wheight.value,
			wzindex,
			'wtitlecolor' : wtitlecolor.style.backgroundColor,
			'wcontentcolor' : wcontentcolor.style.backgroundColor,
			'wposition' : 'absolute',
			'preview' : true
		});
		
		widget['info'] = {
			'wcategory' : wcategory.value,
			'preview' : true
		};
		
		if(paramWidget){
			widget.info['w'+paramWidget.info.wcategory.toLowerCase()] = paramWidget.info['w'+paramWidget.info.wcategory.toLowerCase()];
		}
		
		middlePositionFun(widget);
		
		const widgetPreview = o.querySelector('.widgetPreview');
		widgetPreview.insertBefore(widget, widgetPreview.childNodes[0]);
		
		wtitle.addEventListener('keyup',(e)=>{
			e.preventDefault();
			e.stopPropagation();
			const title = widget.querySelector('.widgetHeader p span:nth-child(2)');
			title.innerHTML = e.target.value;
		});
		
		wheight.addEventListener('change', (e)=>{
			
			e.preventDefault();
			e.stopPropagation();
			
			widget.style.height = e.target.value + 'px';
			
			if(widget.info.wcategory === 'MAP'){
				resizeMap(widget);
			}
			
//			middlePositionFun(widget);
			
		});
		
		wwidth.addEventListener('change', (e)=>{
			
			e.preventDefault();
			e.stopPropagation();
			
			widget.style.width = e.target.value + 'px';
			
			const wcategory = o.querySelector('.wcategory');
			
			if(widget.info.wcategory === 'MAP'){
				resizeMap(widget);
			}
			
//			middlePositionFun(widget);
			
		});
		
		wcategory.addEventListener('change',(e)=>{
			
			widget.querySelector('.widgetHeader p span:nth-child(1)').innerHTML = e.target.value;
			widget.info.wcategory = e.target.value;
			widget.cateFun();
			
		});
		
		
		const widgetPreviewScaleMinus = o.querySelector('.widgetPreviewScaleMinus');
		
		widgetPreviewScaleMinus.addEventListener('click',(e)=>{
			
			const arr = widget.style.transform.split(' ');
			let str = '';
			if(arr.length === 3){
				const tmp = arr[2].split('(');
				arr[2] = 'scale(' + (Number(tmp[1].substring(0,tmp[1].indexOf(')'))) - Number(0.1)) + ')';
				console.log(arr[2])
			} else {
				arr.push('scale(0.9)');
			}
			
			str = arr.toString();
			str = str.replace(/,/g,' ');
			
			widget.style.transform = str;
			
		});
		
		const widgetPreviewScalePlus = o.querySelector('.widgetPreviewScalePlus');
		
		widgetPreviewScalePlus.addEventListener('click',(e)=>{
			
			const arr = widget.style.transform.split(' ');
			let str = '';
			if(arr.length === 3){
				const tmp = arr[2].split('(');
				arr[2] = 'scale(' + (Number(tmp[1].substring(0,tmp[1].indexOf(')'))) + Number(0.1)) + ')';
				console.log(arr[2])
			} else {
				arr.push('scale(1.1)');
			}
			
			str = arr.toString();
			str = str.replace(/,/g,' ');
			
			widget.style.transform = str;
			
		});
		
	});
	
	// 2p
	const widgetRuleSetting = addObject(null, 'div', 'widgetRuleSetting', false, (o)=>{
		
		o.style.textAlign = 'left';
		o.innerHTML = `
			<p style="display:block;">${paramWidget? '위젯 수정' : '위젯 만들기'}</p>
			<fieldset>
				<div class="wrcategory">
					<p>권한 종류</p>
					<span data-wrcategory="group">그룹</span>
					<span data-wrcategory="individual">개인</span>
				</div>
				<div class="wrrwd">
					<p>접근 권한</p>
					<span data-wrrwd="4">읽기</span>
					<span data-wrrwd="6">모든권한</span>
				</div>
			</fieldset>
			<fieldset style="height: 339.333px;">
				<div class="widgetRuleList">
					<ul>
						<li>권한 종류</li>
						<li>적용 대상</li>
						<li>적용 최소 등급</li>
						<li>적용 최대 등급</li>
						<li>적용 권한</li>
					</ul>
					<ul data-wrcategory="individual" data-mnick="${userInfo.mnick}" data-mid="${userInfo.mid}" data-wrmin="-" data-wrmax="-" data-wrrwd="6">
						<li>개인</li>
						<li>${userInfo.mnick}</li>
						<li>-</li>
						<li>-</li>
						<li>모든 권한</li>
					</ul>
				</div>
			</fieldset>
		`;
		
		
		// 수정할 룰 목록 갱신
		const widgetRuleList = o.querySelector('.widgetRuleList');
		
		const ownerUl = widgetRuleList.querySelector('ul:nth-child(2)');
		if(paramWidget){
			paramWidget.info.rules.forEach(rule=>{
				if(ownerUl.dataset.mnick !== rule.mnick){
					ruleUlCreate(rule, widgetRuleList);
				}
			});
		}
		
		
		// 개인 조회 박스
		const widgetRuleIndividualBox = addObject(null, 'div', ['widgetRuleIndividualBox','targetBox'], false, (o)=>{
			
			o.innerHTML = `
			<div>
				<p style="display:block;">맴버 조회<a href="#" style="margin: 0 10px; font-size:8pt;" onclick="return false;">모든 맴버 보기</a></p>
				<input type="text" name="mnick" style="margin: 5px 0;width: 68%;" placeholder=",으로 여러 인원 검색 가능"/>
				<input type="button" style="width:max-content;height:30px;margin: 0;" class="grayBtn memberSearch" value="유저 조회"/>
			</div>
			<input type="button" class="grayBtn" value="권한 등록"/>
			`;
			
			const a = o.querySelector('a');
			a.addEventListener('click', memberListOpen);
			
			const memberSearchBtn = o.querySelector('.memberSearch');
			
			memberSearchBtn.addEventListener('click',(e)=>{
				
				const mnick = o.querySelector('input[name=mnick]').value;
				
				
				if(mnick){
					
					const mnickArray = mnick.split(',');
					
					let tmpArray = [];
					
					mnickArray.forEach(mnick=>{
						let chk = false;
						let trimMnick
						const chkLen = mnick.indexOf(',');
						if(chkLen !== -1){
							trimMnick = mnick.substring(chkLen, mnick.length).trim();
						} else {
							trimMnick = mnick.trim();
						}
						
						dashboardInfo.dashmember.forEach(member=>{
							if(trimMnick === member.mnick){
								chk = true;
							}
						});
						
						if(!chk){
							tmpArray.push(trimMnick + '님은 소속 맴버가 아닙니다.<br/>');
						} else {
							tmpArray.push(trimMnick + '님은 소속 맴버입니다.<br/>');
						}
						
					});
					
					boxFun(tmpArray.toString().replace(/,/g,''), false, null, false, 'fail', false, true).closeDisabledDelete(e.target);
					
					
				} else {
					
					boxFun('맴버의 닉네임을 입력해주세요.', false, null, false, 'fail', false, true).closeDisabledDelete(e.target);
					
				}
				
			});
			
			const submitBtn = o.querySelector('input[type=button]:nth-child(2)');
			console.log(submitBtn);
			submitBtn.addEventListener('click',(e)=>{
				
				const wrcategory = document.querySelector('.wrcategory .selectRule');
				const wrrwd = document.querySelector('.wrrwd .selectRule');
				const mnick = document.querySelector('input[name=mnick]').value;
				if(mnick){
					ruleAddBtn(e.target);
				} else {
					boxFun('누락된 정보가 있습니다.', false, null, false, 'fail', false, true).closeDisabledDelete(e.target);
				}
				
			});
		});
		
		// 그룹 박스
		const widgetRuleGroupBox = addObject(null, 'div', ['widgetRuleGroupBox','targetBox'], false, (o)=>{
			
			let maxNum = -1, minNum = 9999;
			
			dashboardInfo.dashgrade.forEach(item=>{
				if(maxNum < item.dggrade) maxNum = item.dggrade;
				if(minNum > item.dggrade) minNum = item.dggrade;
			});
			
			o.innerHTML = `
				<div>
					<p style="display:block;">최소 & 최대 접근 등급 <a href="#" style="margin: 0 10px; font-size: 8pt;" onclick="return false;">모든 권한 보기</a></p>
					<input type="number" name="wrmin" placeholder="최소:${minNum}"/>
					<input type="number" name="wrmax" placeholder="최대:${maxNum}"/>
				</div>
				<input type="button" class="grayBtn" value="권한 등록"/>
			`;
			
			const a = o.querySelector('a');
			a.addEventListener('click', ruleListOpen);
			
			const wrmin = o.querySelector('input[name=wrmin]');
			
			wrmin.addEventListener('change',(e)=>{
				
				if(e.target.value < minNum){
					boxFun('최소 권한 값보다 아래로 내려갈 수 없습니다.', false, null, false, 'fail', false, true).closeDisabledDelete(e.target);
					e.target.value = minNum;
				}
				
				if(e.target.value > maxNum){
					boxFun('최대 권한 값보다 높을 수 없습니다.', false, null, false, 'fail', false, true).closeDisabledDelete(e.target);
					e.target.value = maxNum;
				}
			
			});
			
			const wrmax = o.querySelector('input[name=wrmax]');
			
			wrmax.addEventListener('change',(e)=>{
				if(e.target.value > maxNum){
					boxFun('최대 권한 값보다 높을 수 없습니다.', false, null, false, 'fail', false, true).closeDisabledDelete(e.target);
					e.target.value = maxNum;
				}
				
				if(e.target.value < minNum){
					boxFun('최소 권한 값보다 아래로 내려갈 수 없습니다.', false, null, false, 'fail', false, true).closeDisabledDelete(e.target);
					e.target.value = minNum;
				}
			});
			
			const submitBtn = o.querySelector('input[type=button]:nth-last-child(1)');
			
			submitBtn.addEventListener('click',(e)=>{
				
				const wrcategory = document.querySelector('.wrcategory .selectRule');
				const wrrwd = document.querySelector('.wrrwd .selectRule');
				
				if(wrcategory && wrrwd && wrmin.value && wrmax.value){
					ruleAddBtn(e.target);
				} else {
					boxFun('누락된 정보가 있습니다.', false, null, false, 'fail', false, true).closeDisabledDelete(e.target);
				}
				
			});
			
		});
		
		// 이벤트
		const wrcategory = o.querySelectorAll('.wrcategory span');
		
		wrcategory.forEach(item=>{
			
			item.addEventListener('click', (e)=>{
				
				const wrcategory = document.querySelector('.wrcategory');
				const selectRuleChk = wrcategory.querySelector('.selectRule');
				
				if(selectRuleChk) selectRuleChk.classList.remove('selectRule');
				
				const selectWidgetRuleGroupBox = document.querySelector('.widgetRuleGroupBox');
				const selectWidgetRuleIndividualBox = document.querySelector('.widgetRuleIndividualBox');
				
				if(selectWidgetRuleGroupBox) selectWidgetRuleGroupBox.remove();
				else if(selectWidgetRuleIndividualBox) selectWidgetRuleIndividualBox.remove();
				
				if(selectRuleChk === e.target){
					
					return;
				}
				
				e.target.classList.add('selectRule');
				
				const wrrwd = document.querySelector('.wrrwd');
				const wrrwdSelectRuleChk = wrrwd.querySelectorAll('.selectRule');
				
				if(wrrwdSelectRuleChk.length > 0){
					
					const field = wrrwd.parentNode;
					
					if(e.target.dataset['wrcategory'] === 'group'){
						field.appendChild(widgetRuleGroupBox);
					} else {
						field.appendChild(widgetRuleIndividualBox);
					}
					
				}
				
			});
			
		});
		
		const wrrwd = o.querySelectorAll('.wrrwd span');
		
		wrrwd.forEach(item=>{
			
			item.addEventListener('click', (e)=>{
				
				const wrrwd = document.querySelector('.wrrwd');
				const selectRuleChk = wrrwd.querySelector('.selectRule');
				
				if(selectRuleChk) selectRuleChk.classList.remove('selectRule');
				
				const selectWidgetRuleGroupBox = document.querySelector('.widgetRuleGroupBox');
				const selectWidgetRuleIndividualBox = document.querySelector('.widgetRuleIndividualBox');
				
				if(selectWidgetRuleGroupBox) selectWidgetRuleGroupBox.remove();
				else if(selectWidgetRuleIndividualBox) selectWidgetRuleIndividualBox.remove();
				
				if(selectRuleChk === e.target){
					return;
				}
				
				e.target.classList.add('selectRule');
				
				const wrcategory = document.querySelector('.wrcategory');
				const wrcategoryChk = wrcategory.querySelector('.selectRule');
				
				if(wrcategoryChk) {
					const field = wrrwd.parentNode;
					
					if(wrcategoryChk.dataset['wrcategory'] === 'group'){
						field.appendChild(widgetRuleGroupBox);
					} else {
						field.appendChild(widgetRuleIndividualBox);
					}
					
				}
				
			});
			
		});
		
	
	});
	
	// submit 버튼
	const widgetAddSubmitBtn = addObject(null, 'input', ['widgetAddSubmitBtn', 'grayBtn'], false, (o)=>{
		
		o.type = 'button';
		o.style.width = 'max-content';
		o.style.margin = '5px 0px 5px 5px';
		o.style.float = 'right';
		o.value = paramWidget ? '수정' : '만들기';
		o.addEventListener('click', (e)=>{
			
			const wtitle = widgetSetting.querySelector('input[name=wtitle]').value;
			const wcategory = widgetSetting.querySelector('.wcategory').value;
			const wwidth = widgetSetting.querySelector('input[name=wwidth]').value;
			const wheight = widgetSetting.querySelector('input[name=wheight]').value;
			const wzindex = document.querySelector('#widgetArea').childNodes.length + 1 ;
			
			const previewWidget = widgetSetting.querySelector('.widget');
			
			const wtitlecolor = previewWidget.querySelector('.widgetHeader').style.backgroundColor;
			const wcontentcolor = previewWidget.style.backgroundColor;
			
			if(!wtitle || !wcategory || !wwidth || !wheight || !wzindex ){
				boxFun('누락된 정보가 있습니다. 확인해주세요.', false, null, false, 'fail', false, true).closeDisabledDelete(e.target);
				return;
			}
			
			const rulesUlArr = widgetRuleSetting.querySelectorAll('.widgetRuleList ul');
			
			let rules = [];
			
			rulesUlArr.forEach((ul,i)=>{
				if(i > 1) rules.push(ul.dataset);
			});
			
			const widgetAddBox = e.target.parentNode;
			
			
			if(paramWidget){
				
				
				paramWidget.info.wtitle = wtitle;
				paramWidget.info.wcategory = wcategory;
				paramWidget.info.wwidth = wwidth;
				paramWidget.info.wheight = wheight;
				paramWidget.info.wtitlecolor = wtitlecolor;
				paramWidget.info.wcontentcolor = wcontentcolor;
				paramWidget.info.rules = rules;
				
				paramWidget.update();
				
				motionOnOff(widgetAddBox, 0.8, false, { setting : 'offDefault' }, null, (o)=>{
					o.remove();
					boxFun('수정에 성공하였습니다.', false, null,false, null, false, true);
				});
				
			} else { 
			

				widget['info'] = {
						wtitle,
						wcategory,
						wwidth,
						wheight,
						wzindex,
						wtitlecolor,
						wcontentcolor,
						rules
				};


				motionOnOff(widgetAddBox, 0.8, false, { setting : 'offDefault' }, null, (o)=>{
					const widgetArea = document.querySelector('#widgetArea');

					widget.style.transform = '';

					widget.style.opacity = '0.5';

					widgetArea.appendChild(widget);

					widget.style.top = e.pageY - Math.floor(widget.offsetHeight/2) + widgetArea.scrollTop + 'px';
					widget.style.left = e.pageX - Math.floor(widget.offsetWidth/2) + widgetArea.scrollLeft + 'px';


					function mousemove(e){


						widget.style.top = e.pageY - Math.floor(widget.offsetHeight/2) + widgetArea.scrollTop + 'px';
						widget.style.left = e.pageX - Math.floor(widget.offsetWidth/2) + widgetArea.scrollLeft + 'px';

					}

					function mouseDownAndOut(e){


						widget.style.top = e.pageY - Math.floor(widget.offsetHeight/2) + widgetArea.scrollTop + 'px';
						widget.style.left = e.pageX - Math.floor(widget.offsetWidth/2) + widgetArea.scrollLeft + 'px';

						widgetArea.removeEventListener('mousemove', mousemove);
						widgetArea.removeEventListener('mousedown', mouseDownAndOut);

						widget['info'].wposition = widget.style.position;
						widget['info'].wtop = widget.style.top.split('px')[0];
						widget['info'].wleft = widget.style.left.split('px')[0];


						xhrLoad('post','widget/insert', widget['info'], (res)=>{

							widget.remove();

							const setting = JSON.parse(res);

							console.log(setting);
							
							const w = widgetSettingFun(setting);

							widgetArea.appendChild(w);
							
							w.mouseEventFun();
							w.scaleEventFun();
							w.contextMenuAddFun();
							w.cateFun();
							
							const { wno, dno, rules } = w.info;
							
							client.send('/pub/wadd', {}, JSON.stringify({ wno, dno, rules }));

						});

					}

					widgetArea.addEventListener('mousemove', mousemove);
					widgetArea.addEventListener('mousedown', mouseDownAndOut);

					o.remove();

				});
			
			}
			
		});
		
	});
	
	// close 버튼
	const widgetAddCloseBtn = addObject(null, 'input', ['widgetAddCloseBtn', 'grayBtn'], false, (o)=>{
		o.type = 'button';
		o.style.width = 'max-content';
		o.style.float = 'left';
		o.value = '닫기';
		o.addEventListener('click', (e)=>{
			
			const widgetAddBox = e.target.parentNode;
			
			motionOnOff(widgetAddBox, 0.8, false, { setting : 'offDefault' }, null, (o)=>{
				o.remove();
			});
			
		});
	});
	
	// prev 버튼
	const widgetAddPrevBtn = addObject(null, 'input', ['widgetAddNextBtn', 'grayBtn'], false, (o)=>{
		o.type = 'button';
		o.style.width = 'max-content';
		o.style.float = 'right';
		o.value = '이전';
		o.addEventListener('click', (e)=>{
			
			const widgetAddBox = e.target.parentNode;
			
			motionOnOff(widgetAddBox, 0.8, false, { onOff : 'off',
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
			
			boxFun(null, false, [widgetSetting, widgetAddCloseBtn, widgetAddNextBtn], true, 'widgetAddBox1', (o)=>{
				
			}, true);
			
		});
	});
	
	
	// next 버튼
	const widgetAddNextBtn = addObject(null, 'input', ['widgetAddNextBtn', 'grayBtn'], false, (o)=>{
		o.type = 'button';
		o.style.width = 'max-content';
		o.style.float = 'right';
		o.value = '다음';
		o.addEventListener('click', (e)=>{
			
			const widgetAddBox = e.target.parentNode;
			
			motionOnOff(widgetAddBox, 0.8, false, { onOff : 'off',
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
			
			boxFun(null, false, [widgetRuleSetting, widgetAddCloseBtn, widgetAddSubmitBtn, widgetAddPrevBtn], true, 'widgetAddBox2', (o)=>{
				
			}, true);
			
		});
	});
	
	
	// 1p
	const widgetAddBox1 = boxFun(null, false, [widgetSetting, widgetAddCloseBtn, widgetAddNextBtn], true, 'widgetAddBox1', (o)=>{
		const previewWidget = o.querySelector('.widget');
		previewWidget.cateFun();
	}, true);
	
}
