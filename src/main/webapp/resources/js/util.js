/**
 * http://usejsdoc.org/
 */



// 검정색 백그라운드
const backgroundDiv = addObject(null,'div',null,false,(t)=>{
	t.setAttribute('id','bgBlack');
});

// 위젯 KaKao 지도, 위젯에 맞춰서 크기 조절
function resizeMap(widget) {
    var mapContainer = widget.querySelector('#map');
    const map_wrap = widget.querySelector('.map_wrap');
    mapContainer.style.width = map_wrap.offsetWidth + 'px';
    mapContainer.style.height = map_wrap.offsetHeight + 'px'; 
}


// YYYY-MM-DD 양식의 String 타입에서 - 제거 후 Date 타입으로 변경
function hyphenDateFormat(date){
	const dateArray = date.split('-');
	const dateType = new Date(`${dateArray[1]}/${dateArray[2]}/${dateArray[0]}`);
	return dateType
}


// 이미지 크게, 작게 보기 팝업창 생성 함수
// img : 조절할 이미지
function imageView(img){
	
	const viewImg = img.cloneNode(true);
	
	viewImg.addEventListener('mouseover',(e)=>{
		if(e.ctrlKey){
			viewImg.style.cursor = 'zoom-out';
		} else {
			viewImg.style.cursor = 'zoom-in';
		}
	});
	
	viewImg.addEventListener('mousemove',(e)=>{
		if(e.ctrlKey){
			viewImg.style.cursor = 'zoom-out';
		} else {
			viewImg.style.cursor = 'zoom-in';
		}
	});
	
	viewImg.addEventListener('click',(e)=>{
		
		const originW = viewImg.offsetWidth;
		const originH = viewImg.offsetHeight;
		
		if(e.ctrlKey){
			viewImg.style.width = originW * 0.8 + 'px';
			viewImg.style.height = originH * 0.8 + 'px';
		} else {
			viewImg.style.width = originW * 1.2 + 'px';
			viewImg.style.height = originH * 1.2 + 'px';
		}		
	});
	
	
	const viewImgDiv = addObject(null, 'div', 'viewImgDiv', false, (o)=>{
		o.appendChild(viewImg);
	});
	
	const viewBox = boxFun(null, false, [viewImgDiv], false, 'viewBox', null, true);
	
};


// 로그아웃 함수
function logout(){
	
	xhrLoad('get','logout', null, (res)=>{
		if(res === 'true'){
			location.reload();
		}
	});
		
}


// WYSIWYG 에디터에서 이벤트가 일어나기 전 커서위치 불러오기
function setCusor(target){
	target.focus();
	const c = target.querySelector('#editCusor');
	if(c){
		const range = document.createRange();
		range.selectNode(c);
		var selection = window.getSelection();
		selection.removeAllRanges();
    	selection.addRange(range);
    	range.deleteContents();
	}
}

//WYSIWYG 에디터에서 이벤트가 일어나기 전 커서위치 셋팅
function getCusor(target){
	target.focus();
	const tmpSpan = document.createElement('span');
	tmpSpan.id = 'editCusor';
	
	window.getSelection().getRangeAt(0).insertNode(tmpSpan);
	
	return tmpSpan;
}

// 입력이 없을시 3초마다 저장시키는 함수, 메모 위젯에 사용
function setSaveTime(widget){
	
	const wmContent = widget.querySelector('.wmContent');
	const wmMsg = widget.querySelector('span.wmMsg'); 
	
	// 만약 입력했을 시 wmContent 객체 내부에 saveTimeoutCheckId 값이 있다면,
	// 현재 작성 중임을 뜻하며, 해당 위젯을 구독하고 있는 구독자들에게 작성중임을 알림,
	// 또한 saveTimeoutCheckId에 저장된 Id 값으로 Timeout으로 등록된 이벤트 큐를 제거 시킨다.
	if(wmContent['saveTimeoutCheckId']) {
		
		client.send('/pub/wmemo', {}, JSON.stringify({
			wno : widget.info.wno,
			mid: userInfo.mid,
			status : 'writing'
		}));
		
		window.clearTimeout(wmContent['saveTimeoutCheckId']);
	}
	
	// Timeout으로 큐에 위젯의 메모 내용을 저장시키는 함수를 등록 시키고 리턴되는 Id 값을
	// wmContent 객체의 saveTimeoutCheckId 속성에 등록하여, 후에 다시 값을 입력했을 시,
	// 등록된 큐를 제거 되게끔 한다.
	wmContent['saveTimeoutCheckId'] = window.setTimeout(()=>{
		
		let wmno = 0;
		
		if(widget.info.wmemo){
			wmno = widget.info.wmemo.wmno;
		}
		
		xhrLoad('post','widget/wmemo', { wno : widget.info.wno, wmno, wmcontent : wmContent.innerHTML }, (res)=>{
			
			if(res){
				
				widget.info.wmemo = JSON.parse(res);
				
				wmMsg.innerHTML = '자동 저장되었습니다.';
				motionOnOff(wmMsg,1,false, { setting : 'onDefault'});
				window.setTimeout(()=>{
					motionOnOff(wmMsg, 1,false, { setting : 'offDefault'}, null, (o)=>{
						o.innerHTML = '';
					});
				},2000);
				
				// 해당 메모 위젯을 구독한 구독자들에게 작성이 완료되었음을 알리며,
				// 변경된 내용도 전달
				client.send('/pub/wmemo', {}, JSON.stringify({
					
					wmcontent : wmContent.innerHTML,
					wno : widget.info.wno,
					mid: userInfo.mid,
					status : 'complete'
						
				}));
			} else {
				boxFun('잘못된 접근입니다.');
			}
			
		});
		
	},3000);
}


// 이미지 크기 변경하는 박스 생성하는 함수
// 메모 위젯의 WYSIWYG 에디터에서 등록된 이미지를 클릭시 해당 함수 호출
// imageScaleBoxFun(타겟 이미지, 박스가 생성될 영역, 해당 박스가 종속된 위젯)
function imageScaleBoxFun(targetImage, area, widget){
	
	// 타겟 이미지를 클릭햇을 시 이벤트 연결
	targetImage.addEventListener('mousedown', (e)=>{
		
		
		const selectImgChk = document.querySelector('#selectImg');
		const oldMenu = document.querySelector('.imageScaleBox');
		
		if(oldMenu) oldMenu.remove();
		
		if(selectImgChk){
			selectImgChk.id = '';
			selectImgChk.style.border= '';
		}
		
		
		targetImage.id = 'selectImg';
		targetImage.style.border = '1px dashed #888';
		
		const menu = addObject(area, 'div', 'imageScaleBox', true, (o)=>{
			
			o.innerHTML = `
			<p>OriginWidgth : ${targetImage.naturalWidth}</p>
			<p>OriginHeight : ${targetImage.naturalHeight}</p>
			<p>가로 세로 비율 맞추기 : <input type="checkbox" valeu="wAndHchk"/></p>
			<p><input type="number" name="imgWidth" value = "${targetImage.offsetWidth}" placeholder="가로"/><input type="number" name="imgHeight" value = "${targetImage.offsetHeight}" placeholder="세로"/></p>
			<p style="text-align:center;"><input type="button" class="grayBtn" value = "닫기"/></p>
			`;
			

			const imgWidth = o.querySelector('input[name=imgWidth]');
			const imgHeight = o.querySelector('input[name=imgHeight]');
			
			const checkbox = o.querySelector('input[type=checkbox]');
			
			// 가로 버튼 이벤트
			imgWidth.addEventListener('change',()=>{
				
				const width = imgWidth.value;
				targetImage.style.width = width + 'px';
				
				let height;
				
				if(checkbox.checked){
					
					height = targetImage.naturalHeight * width/targetImage.naturalWidth;
					imgHeight.value = height;
					
				} else {
					height = imgHeight.value;
				}
				
				targetImage.style.height = height + 'px';
				
				// 이미지 크기가 변경되었을 때도 메모 저장 기능 발동
				setSaveTime(widget);
				
			});
			
			// 세로 버튼 이벤트
			imgHeight.addEventListener('change',()=>{
				const height = imgHeight.value;
				targetImage.style.height = height + 'px';
				
				let width;
				
				if(checkbox.checked){
					
					width = targetImage.naturalWidth * height/targetImage.naturalHeight;
					imgWidth.value = width;
					
				} else {
					width = imgWidth.value;
				}
				
				targetImage.style.width = width + 'px';
				
				// 이미지 크기가 변경되었을 때도 메모 저장 기능 발동
				setSaveTime(widget);
				
			});
			
			const closeBtn =  o.querySelector('input[type=button]');
			
			closeBtn.addEventListener('mousedown',()=>{
				targetImage.style.border = '';
				menu.remove();
			});
			
		});
		
		
		// 생성된 크기 조절 박스 위치 지정
		let top = e.offsetY + e.target.offsetTop + 5;
		let left = e.offsetX + e.target.offsetLeft + 5;
		
		if(area.offsetWidth < left + menu.offsetWidth ){
			left = left - menu.offsetWidth;
		}
		
		if(area.offsetHeight < top + menu.offsetHeigth ){
			top = top - menu.offsetHeight;
		}
		
		menu.style.top = top + 5 + 24 + 'px';
		menu.style.left = left + 5 + 'px';
		
	});
}


// 메모 위젯의 WYSIWYG 에디터에서 상단 메뉴들 클릭했을 나오는 하위 메뉴 생성 함수
// btnList(하위 메뉴가 생길 div,
//			상단 메뉴 버튼,
//			만들어질 메뉴 클래스 네임,
//			li 형태의 태그 String 형태의 묶음,
//			4번째 인자로 들어간 li들에게 연결해줄 이벤트 함수의 배열 
function btnList(pop, btn, className, liContent, lisFunArray){
	
	const chk = pop.querySelector('.btnList');
	const chkName = chk? chk.className.split(' ')[0] : null;
	
	// 다른 btnList가 열려 있으면 닫기
	if(chk) chk.remove();
	
	if(chkName === className) {
		return;
	}
	
	// 열리는 박스 위치 조절
	const openBoxLeft = btn.offsetLeft;
	
	const box = addObject(pop, 'ul', [className, 'btnList'], true, (o)=>{
		
		o.innerHTML = liContent;
		
		let top = btn.offsetTop + btn.offsetHeight;
		
		o.parentNode.style.top = top + 'px';;
		o.parentNode.style.left = openBoxLeft + 'px';
		
		
		const lis = o.querySelectorAll('li');
		
		// li 태그들에게 5번째 인자의 배열 순으로 이벤트 연결
		lis.forEach((li,i)=>{
			
			li.addEventListener('mousedown',(e)=>{
				
				lisFunArray[i]();
				li.parentNode.remove();
				
			});
			
		});
	});
	
}

// 배열 정렬
// 리턴 값으로 정렬된 새로운 배열 배출
function arrSort(arr){
	
	let chkNum = 0;
	const len = arr.length;
	
	let returnArr = [];
	
	for(let i = 0 ; i < len ; i++ ){
		returnArr.push(0);
	}
	
	arr.forEach(val=>{
		chkNum = 0;
		arr.forEach((checkVal)=>{
			if(Number(val) > Number(checkVal)){
				chkNum++;
			}
		});
		returnArr[chkNum] = val;
	});
	return returnArr;
}


// 위젯 이동 이벤트 (타겟이 되는 위젯, 위젯 어느부분을 클릭했을 시, 마우스가 움직일 영역)
function mouseEventFun(target, clickArea, mouseArea){
	
	let areaClone;
	let originX, originY;
	let mouseX, mouseY;
	
	const widgetHeader = clickArea.parentNode.parentNode.querySelector('.widgetHeader');

	
	// 마우스 누른 상태 + 움직임
	function mousemove(e){
		
		e.preventDefault();
		e.stopPropagation();
		
		target.style.top = originY - (mouseY - e.pageY) + 'px';
		target.style.left = originX - (mouseX - e.pageX) + 'px';
		
		target.info.wtop = target.style.top.split('px')[0];
		target.info.wleft = target.style.left.split('px')[0];
		
		const { wno, wtop, wleft } = target.info;
		
		client.send('/pub/wloc',{}, JSON.stringify({ wno, mid : userInfo.mid, wtop, wleft }));
	
		
	}
	
	
	// 마우스 누른 상태
	function mousedown(e){
		
		e.preventDefault();
		e.stopPropagation();
		
		originX = target.offsetLeft;
		originY = target.offsetTop;
		
		mouseX = e.pageX;
		mouseY = e.pageY;
		
		// 가상의 마우스 영역을 만들어서 모든 객체의 가장 위에 올림,
		// 가상의 마우스 영역에 마우스 이벤트를 연결
		if(areaClone){
			areaClone.remove();
		} else {
			areaClone = mouseArea.cloneNode();
			areaClone.classList.add('mousemoveArea');
		}
		
		
		if(!widgetHeader.style.boxShadow){
			const colorArray = widgetHeader.style.backgroundColor.split('(')[1].split(',');
		
			let R = Number(colorArray[0]);
			let G = Number(colorArray[1]);
			let B = Number(colorArray[2].substring(0, colorArray[2].indexOf(')')));
		
			R = R-30 < 0? 0 : R-30;
			G = G-30 < 0? 0 : G-30;
			B = B-30 < 0? 0 : B-30;
			
			widgetHeader.style.boxShadow = 'inset 0 0 5px 3px ' + `rgb(${R}, ${G}, ${B})`; 		
		}
		
		areaClone.style.opacity = 0;
		areaClone.style.zIndez = 20000;
		
		mouseArea.parentNode.appendChild(areaClone);
		
		areaClone.addEventListener('mousemove', mousemove);
		areaClone.addEventListener('mouseup', mouseOutAndUp);
		areaClone.addEventListener('mouseout', mouseOutAndUp);
		
	}
	
	function mouseOutAndUp(e){
		
		target.info.wtop = target.style.top.split('px')[0];
		target.info.wleft = target.style.left.split('px')[0];
		
		xhrLoad('post', 'widget/topleftupdate',target.info);
		
		widgetHeader.style.boxShadow = '';
		
		areaClone.remove();
		
		
	}
	
	clickArea.addEventListener('mousedown', mousedown);
	
}


// 위젯 크기 조절 이벤트 (타겟이 되는 위젯, 위젯 어느부분을 클릭했을 시, 마우스가 움직일 영역)
// 위젯 이동과 비슷한 구조
function scaleEventFun(target, settingArea, mouseArea){
	
	let areaClone;
	
	let width, height;
	let originX, originY;
	let mouseX, mouseY;
	
	let widgetContent = target.querySelector('.widgetContent');
	
	let state;
	
	
	function mousemoveDown(e){
		
		width = target.offsetWidth;
		height = target.offsetHeight;
		
		state = areaClone.style.cursor;
		
		if(state === 'ne-resize' || state === 'nw-resize' || state === 'n-resize'){
			console.log('dd');
			const oldTop = target.offsetTop;
			target.style.top = originY - (mouseY - e.pageY - mouseArea.scrollTop) + 'px';
			
			const newTop = target.offsetTop;
			
			target.style.height = height + (oldTop - newTop) + 'px';
			
			widgetContent.style.height = 100 - 35/(Number(target.style.height.split('px')[0])-10)*100 + '%';
		} else if (state === 'sw-resize' || state === 'se-resize' || state === 's-resize'){
			
			target.style.height = (e.pageY + mouseArea.scrollTop - 33 - originY) + 'px';
			widgetContent.style.height = 100 - 35/(Number(target.style.height.split('px')[0])-10)*100 + '%';
			
		}
		

		if(state === 'nw-resize' || state === 'sw-resize' || state === 'w-resize'){
			
			const oldLeft = target.offsetLeft;
			target.style.left = originX - (mouseX - e.pageX - mouseArea.scrollLeft) + 'px';
			
			const newLeft = target.offsetLeft;
			
			target.style.width = width + (oldLeft - newLeft) + 'px';
		} else if (state === 'ne-resize' || state === 'se-resize' || state === 'e-resize'){
			
			target.style.width = (e.pageX + mouseArea.scrollLeft - originX) + 'px';
			
		}
		
		target.info.wtop = target.style.top.split('px')[0];
		target.info.wleft = target.style.left.split('px')[0];
		target.info.wwidth = target.style.width.split('px')[0];
		target.info.wheight = target.style.height.split('px')[0];
		
		const { wno, wwidth, wheight, wtop, wleft } = target.info;
		
		if(target.info.wcategory === 'MAP'){
			resizeMap(target);
		}
		
		client.send('/pub/wscale',{}, JSON.stringify({ wno, mid : userInfo.mid,  wwidth, wheight, wtop, wleft }));
		
	}
	
	function mousemoveOver(e){
		
		e.preventDefault();
		e.stopPropagation();
		
		width = target.offsetWidth;
		height = target.offsetHeight;
	
		originX = target.offsetLeft;
		originY = target.offsetTop;
		
		mouseX = e.pageX + mouseArea.scrollLeft;
		mouseY = e.pageY + mouseArea.scrollTop;
		
		
		if(mouseX < originX+15 && mouseX > originX-15 && mouseY-33< originY + height +15 && mouseY-33 > originY + height -15){
			// 왼쪽 아래
			target.style.cursor = 'sw-resize';
		} else if(mouseX < originX+15 && mouseX > originX-15 && mouseY-33 < originY +15 && mouseY-33 > originY-15){
			// 왼쪽 위
			target.style.cursor = 'nw-resize';
		} else if(mouseX < originX + width +15 && mouseX > originX + width -15 && mouseY-33< originY + height +15 && mouseY-33 > originY + height -5){
			// 오른쪽 아래
			target.style.cursor = 'se-resize';
		} else if(mouseX < originX + width +15 && mouseX > originX + width -15 && mouseY-33 < originY +15 && mouseY-33 > originY-15){
			// 오른쪽 위
			target.style.cursor = 'ne-resize';
		} else if(mouseX < originX+5 && mouseX > originX-5){
			// 왼쪽
			target.style.cursor = 'w-resize';
		} else if (mouseX < originX + width +5 && mouseX > originX + width -5){
			// 오른쪽
			target.style.cursor = 'e-resize';
		} else if (mouseY-33 < originY +5 && mouseY-33 > originY-5){
			// 위
			target.style.cursor = 'n-resize';
		} else if (mouseY-33< originY + height +5 && mouseY-33 > originY + height -5){
			// 아래
			target.style.cursor = 's-resize';
		} else {
			target.style.cursor = 'default';
		}
		
	}
	
	function mouseOutAndUp(e){
		
		target.style.cursor = 'default';
		
		target.info.wwidth = target.style.width.split('px')[0];
		target.info.wheight = target.style.height.split('px')[0];
		
		xhrLoad('post', 'widget/widthHeightUpdate', target.info);
		
		areaClone.remove();
		
	}
	
	function mousedown(e){
		
		e.preventDefault();
		e.stopPropagation();
		
		width = target.offsetWidth;
		height = target.offsetHeight;
		
		originX = target.offsetLeft;
		originY = target.offsetTop;
		
		mouseX = e.pageX + mouseArea.scrollLeft;
		mouseY = e.pageY + mouseArea.scrollTop;
		
		if(areaClone){
			areaClone.remove();
		} else {
			areaClone = mouseArea.cloneNode();
			areaClone.classList.add('mousemoveArea');
		}
		
		if(mouseX < originX+15 && mouseX > originX-15 && mouseY-33< originY + height +15 && mouseY-33 > originY + height -15){
			// 왼쪽 아래
			areaClone.style.cursor = 'sw-resize';
		} else if(mouseX < originX+15 && mouseX > originX-15 && mouseY-33 < originY +15 && mouseY-33 > originY-15){
			// 왼쪽 위
			areaClone.style.cursor = 'nw-resize';
		} else if(mouseX < originX + width +15 && mouseX > originX + width -15 && mouseY-33< originY + height +15 && mouseY-33 > originY + height -15){
			// 오른쪽 아래
			areaClone.style.cursor = 'se-resize';
		} else if(mouseX < originX + width +15 && mouseX > originX + width -15 && mouseY-33 < originY +15 && mouseY-33 > originY-15){
			// 오른쪽 위
			areaClone.style.cursor = 'ne-resize';
		} else if(mouseX < originX+5 && mouseX > originX-5){
			// 왼쪽
			areaClone.style.cursor = 'w-resize';
		} else if (mouseX < originX + width +5 && mouseX > originX + width -5){
			// 오른쪽
			areaClone.style.cursor = 'e-resize';
		} else if (mouseY-33 < originY +5 && mouseY-33 > originY-5){
			// 위
			areaClone.style.cursor = 'n-resize';
		} else if (mouseY-33< originY + height +5 && mouseY-33 > originY + height -5){
			// 아래
			areaClone.style.cursor = 's-resize';
		} else {
			areaClone.style.cursor = 'default';
			return false;
		}
		
		areaClone.style.opacity = 0;
		areaClone.style.zIndez = 20000;
		
		mouseArea.parentNode.appendChild(areaClone);
		
		
		areaClone.addEventListener('mouseup', mouseOutAndUp);
		areaClone.addEventListener('mouseout', mouseOutAndUp);
		areaClone.addEventListener('mousemove', mousemoveDown);
		
	}
	
	settingArea.addEventListener('mousemove', mousemoveOver);
	settingArea.addEventListener('mousedown', mousedown);
}




// 위젯의 권한 설정 체크 함수
// 자신의 권한과 타겟이 되는 위젯의 권한을 비교해서,
// 쓰기를 방지해줌
// 해당 설정을 개발자 도구를 통해 우회해도
// Interceptor 쪽에서 권한을 한번더 체크하기 때문에
// 강제로 입력시 에러 발생함
function widgetGradeCheck(widget){
	
	const owner = widget.info.mid;
	const wcategory = widget.info.wcategory.toLowerCase();
	const rules = widget.info.rules;
	const dggrade = userInfo.dashgrade.dggrade;
	const targetId = userInfo.mid;
	
	let wrrwd;
	
	// 로그인한 대상이 위젯의 소유주가 아니라면
	if(owner !== targetId){
		
		let individualCheck = false;
		let groupCheck = false;
		
		// 개인 권한에 아이디가 있다면
		rules.forEach(rule=>{

			if(rule.mid === targetId){
				wrrwd = rule.wrrwd;
				individualCheck = true;
				return;
			}
			

		});
		
		// 개인 권한에 아이디 없다면 그룹 권한 체크
		if(!individualCheck){
			
			rules.forEach(rule=>{
				
				// 자신의 권한이 그룹 권한 내에 속하는게 있는지 확인
				if(rule.wrmin <= dggrade && rule.wrmax >= dggrade){
					wrrwd = rule.wrrwd;
					groupCheck = true;
					return;
				}

			});
		}

	}
	
	let targets = [];
	let classLists = [];
	
	// 어떤 객체를 막을지 설정
	if(wcategory === 'chat'){
		
		const wrContent = widget.querySelector('.wrContent');
		const wrSetting = widget.querySelector('.wrSetting');
		
		targets.push(wrContent.parentNode);
		targets.push(wrSetting);
		
	} else if (wcategory === 'memo'){
		
		targets.push(widget.querySelector('.wmContent'));
		targets.push(widget.querySelector('.wmSetting'));
		
	} else if (wcategory === 'sns'){
		
		targets.push(widget.querySelector('.wcrSearch'));
	
	} else if (wcategory === 'plan'){
		
		targets.push(widget.querySelector('.wbtadd'));
		
	} else if (wcategory === 'code'){
		targets.push(widget.querySelector('.editor'));
	}
	
	targets.forEach(t=>{
		classLists.push(t.classList);
	});
	
	if(wrrwd === 4) {
		
		classLists.forEach(c=>{
			c.add('eventDisabled');
		});
		
	} else {
		
		classLists.forEach(c=>{
			if(c.contains('eventDisabled')){
				c.remove('eventDisabled');
			}
		});
		
	}
	
}


// 위젯 업데이트 함수
// 인자로 들어온 위젯 객체 내부의 info 속성을 참조해서
// 위젯 형태를 바꿔준다.
function widgetUpdate(widget){
	
	widget.style.width = widget.info.wwidth +'px';
	widget.style.height = widget.info.wheight +'px';
	
	if(widget.info.wtop) widget.style.top = widget.info.wtop + 'px';
	if(widget.info.wleft) widget.style.left = widget.info.wleft + 'px';
	
	if(!widget.info.wtitlecolor){
		widget.info.wtitlecolor = 'rgb(65, 198, 241)';
	}
	
	if(!widget.info.wcontentcolor){
		widget.info.wcontentcolor = 'rgb(255, 255, 255)';
	}
	
	const wtitlefontcolor = fontColorCheck(widget.info.wtitlecolor);
	const wcontentfontcolor = fontColorCheck(widget.info.wcontentcolor);
	
	widget.querySelector('.widgetContent').style.color = wcontentfontcolor;
	widget.style.backgroundColor = widget.info.wcontentcolor;
	
	const widgetHeader = widget.querySelector('.widgetHeader');
	
	widgetHeader.style.color = wtitlefontcolor;
	widgetHeader.style.backgroundColor = widget.info.wtitlecolor;
	
	const wcategorySpan = widgetHeader.querySelector('span:nth-child(1)');
	
	wcategorySpan.innerHTML = widget.info.wcategory;
	
	const wtitleSpan = widgetHeader.querySelector('span:nth-child(2)');
	
	wtitleSpan.innerHTML = widget.info.wtitle;
	
}


// 위젯 객체 생성 함수
// widgetFun(셋팅 객체)
function widgetFun(setting){
	
	const widget = addObject(null, 'div', 'widget', false, (o)=>{
		
		o.style.width = setting['wwidth']+'px';
		o.style.height = setting['wheight']+'px';
		o.style.zIndex = setting['wzindex'];
		o.style.position = setting['wposition'];
		
		if(setting['wtop']) o.style.top = setting['wtop'] + 'px';
		if(setting['wleft']) o.style.left = setting['wleft'] + 'px';
		
		if(!setting['wtitlecolor']){
			setting['wtitlecolor'] = 'rgb(65, 198, 241)';
		}
		
		if(!setting['wcontentcolor']){
			setting['wcontentcolor'] = 'rgb(255, 255, 255)';
		}
		
		const wtitlefontcolor = fontColorCheck(setting['wtitlecolor']);
		const wcontentfontcolor = fontColorCheck(setting['wcontentcolor']);
		
		o.style.backgroundColor = setting['wcontentcolor'];
		
		o.innerHTML = `
			<div class="widgetHeader" style="color:${wtitlefontcolor};background-color:${setting['wtitlecolor']};">
				<p style="color: inherit;"><span>${setting['wcategory']}</span><span>${setting['wtitle']}</span></p>
			</div>
			<div class="widgetMoveArea">
				<div class="widgetHeaderArea"></div>
			</div>
			<div class="widgetContent" style="color:${wcontentfontcolor};">
			</div>
			<div class="widgetFooter">
			</div>
		`;
		
	});
	
	widget['info'] = setting;
	
	const widgetMoveArea = widget.querySelector('.widgetMoveArea');
	const widgetHeaderArea = widget.querySelector('.widgetHeaderArea');
	
	if(!setting.preview){
		
		// 웹 소켓 구독
		console.log('웹 소켓 구독');
		
		// 위젯 크기 조절 동기화 구독
		const scaleClient = client.subscribe('/sub/wscale/'+widget.info.wno, (res)=>{

			const scaleInfo = JSON.parse(res.body);

			if(scaleInfo.mid !== userInfo.mid){

				widget.info.wwidth = scaleInfo.wwidth;
				widget.info.wheight = scaleInfo.wheight;
				widget.style.width = scaleInfo.wwidth + 'px';
				widget.style.height = scaleInfo.wheight + 'px';

				widget.info.wtop = scaleInfo.wtop;
				widget.info.wleft = scaleInfo.wleft;
				widget.style.top = scaleInfo.wtop + 'px';
				widget.style.left = scaleInfo.wleft + 'px';
				
				if(widget.info.wcategory === 'MAP'){
					resizeMap(widget);
				}

			}
		},{});
		
		
		// 위젯 이동 동기화 구독
		const moveClient = client.subscribe('/sub/wloc/'+widget.info.wno, (res)=>{

			const scaleInfo = JSON.parse(res.body);

			if(scaleInfo.mid !== userInfo.mid){

				widget.info.wtop = scaleInfo.wtop;
				widget.info.wleft = scaleInfo.wleft;
				widget.style.top = scaleInfo.wtop + 'px';
				widget.style.left = scaleInfo.wleft + 'px';

			}
		},{});

		
		// 위젯 업데이트 동기화 구독
		const upClient = client.subscribe('/sub/wup/' + widget.info.wno, (res)=>{

			const upInfo = JSON.parse(res.body);
			const widgets = document.querySelectorAll('.widget');
			
			widgets.forEach((w,i)=>{

				if(w.info.wno === upInfo.wno){

					let individualCheck = false;
					let groupCheck = false;

					// 위젯이 수정된 개인 권한에서 자신의 권한 체크
					upInfo.rules.forEach(rule =>{

						if(rule.mid === userInfo.mid){
							individualCheck = true;
							return;
						}

					});
					
					// 위젯이 수정된 그룹 권한에서 자신의 권한 체크
					if(!individualCheck){
						const dggrade = userInfo.dashgrade.dggrade;
						upInfo.rules.forEach(rule =>{

							if(rule.wrmin <= dggrade && rule.wrmax >= dggrade){
								groupCheck = true;
								return;
							}

						});
					}

					
					// 만약 충족되는 권한이 없다면 영역 내에서 해당 위젯 삭제
					if(!individualCheck && !groupCheck){
						
						w.style.transitionDuration = '1s';
						motionOnOff(w, 0.8, false, { onOff : 'off' }, false, (o)=>{
							w.websocket.close();
							o.remove();
						});
					
					// 만약 충족 위젯이 있다면, 위젯 정보를 새로 적용
					} else {
						
						// info 속성 교체
						w.info = upInfo;
						w.style.transitionDuration = '1s';
						
						// 새로 교체된 info 속성을 토대로 위젯 형태 업데이트
						widgetUpdate(w);
						
						// info 속성과 매칭되는 대시보드 정보 끌고 오기
						widgetSettingFun(null, w);
						
						// 해당 위젯에서 자신의 권한 설정 적용
						widgetGradeCheck(w);
						
						w.style.transitionDuration = '';
						
						if(w.info.mid !== userInfo.mid){
							
							const widgetMoveArea = w.querySelector('.widgetMoveArea');
							
							const alarmP = addObject(null, 'p', null, false, (o)=>{
								o.innerHTML = '위젯 수정이 감지 되었습니다.';
								o.style.position = 'absolute';
								o.style.color = '#fff';
								o.style.width = 'max-content';
								o.style.top = '50%';
								o.style.left = '50%'
								o.style.transform = 'translateX(-50%) translateY(-50%)'
							});
							
							motionOnOff(widgetMoveArea, 1, false, { onOff : 'on' }, {
								after : (o)=>{
									console.log('afterCheck');
									o.style.transitionDuration = '0.8s';
									o.style.zIndex = 9;
									o.style.backgroundColor = '#00000080';
									o.appendChild(alarmP);
								}
							},(o)=>{
								o.style.zIndex = '';
								o.style.backgroundColor = '';
								o.style.transitionDuration = '0.8s';
								alarmP.remove();
							});
						}
					}

					return;
				}
			});


		},{});

		
		// 위젯 삭제 동기화 구독
		const delClient = client.subscribe('/sub/wdel/'+widget.info.wno , (res)=>{

			const delInfo = JSON.parse(res.body);
			const widgets = document.querySelectorAll('.widget');
			
			widgets.forEach((w,i)=>{

				if(w.info.wno === delInfo.wno){

					w.style.transitionDuration = '1s';
					motionOnOff(w, 0.8, false, { onOff : 'off' }, false, (o)=>{
						
						// 해당 위젯을 통해 연결되있던 동기화 구독들 모두 해제 ( 크기 조절, 이동, 기능에 따른 구독 등 )
						w.websocket.close();
						// 그리고 해당 위젯 삭제
						o.remove();
					});

					return;
				}
			});
		},{});

		// 위젯 객체 내부 속성으로 websocket이란 이름의 속성을 동적 할당
		// 값으로 해당 위젯이 생성되는 과정에서 구독시킨 구독정보 저장
		// close내장 함수를 생성해서 해당 함수를 실행 시키면 모든 구독이 해체되게끔 만듬
		widget['websocket'] = {
				upClient, delClient, moveClient, scaleClient,
				close : ()=>{
					const clientKeys = Object.keys(widget.websocket);
					for(k of clientKeys){
						if(k !== 'close'){
							widget.websocket[k].unsubscribe();
						}
					}
				}
		}
	}
	
	// 위젯 업데이트 내장 함수
	widget['update'] = ()=>{
		
		xhrLoad('post','widget/update', widget.info, (res)=>{
			
			if(res){
				
				const updateRes = JSON.parse(res);
				
				Object.assign(widget.info, updateRes);
				
				// 위젯을 수정한 자신을 포함한 해당 위젯을 보고 있는 모든 구독자에게 해당 수정 정보 전달
				client.send('/pub/wup', {}, JSON.stringify(widget.info));
				
				const { wno, dno, rules } = widget.info;
				
				// 해당 위젯이 속한 대시보드의 모든 구독자들에게 위젯 정보 전달
				// 해당 정보를 받은 사람들 중 권한이 맞지만 위젯 영역 내에 해당 정보가 가르키는 위젯이 없을시
				// 해당 정보를 사용해여 위젯을 생성한다.
				client.send('/pub/wadd', {}, JSON.stringify({ wno, dno, rules }));
				
			} else {
				boxFun('잘못된 접근입니다.');
			}
			
		});
		
	};
	
	// 이동 이벤트 연결 함수 ( 해당 함수를 호출 안하면 해당 위젯은 이동 불가능 )
	widget['mouseEventFun'] = ()=>{
		mouseEventFun(widget, widgetHeaderArea, widget.parentNode);
	};
	
	// 크기 조절 에빈트 연결 함수 ( 해당 함수를 호출 안하면 해당 위젯은 크기 조절 불가능 )
	widget['scaleEventFun'] = ()=>{
		scaleEventFun(widget, widgetMoveArea, widget.parentNode);
	};
	
	// 위젯 내부에서 커스텀 메뉴 호출 설정
	widget['contextMenuAddFun'] = ()=>{
		
		const menuSetting = {
				'new' : {
					'새 위젯 만들기' : ()=>{
						widgetAddAndModify();
					}
				},
				'widget' : {
					
					'위젯 위로 올리기' : ()=>{
						
						widgetZMove(widget, 'up', 'min');
						
					},
					'위젯 가장 위로 올리기' : ()=>{
						
						
						widgetZMove(widget, 'up', 'max');
					},
					
					'위젯 아래로 내리기' : ()=>{
						
						widgetZMove(widget, 'down', 'min');
						
					},
					'위젯 가장 아래로 내리기' : ()=>{
						
						widgetZMove(widget, 'down', 'max');
					}
				},
				'myInfo' : {
					'로그아웃' : ()=>{logout();}
				}
				
			};
		
		// 위젯 생성자가 자기 자신이라면 위젯 수정 및 삭제 버튼 생성
		if(userInfo.mid === widget.info.mid){
			
			menuSetting.widget['위젯 수정'] = ()=>{
				
				widgetAddAndModify(widget);
				
			};
			
			menuSetting.widget['위젯 삭제'] = (e)=>{
				
				const widgetDelRes = document.querySelector('.widgetDelRes');
				if(widgetDelRes) widgetDelRes.remove();
				
				const submitBtn = addObject(null, 'input', ['grayBtn', 'widgetDelSubmitBtn'], false, (o)=>{
					
					o.type = 'button';
					o.value = '삭제';
					o.style.width = 'max-content';
					o.style.marginRight = '5px';
					
					o.addEventListener('click', ()=>{
						
						xhrLoad('get', 'widget/updatewdel/'+widget.info.wno, null, (res)=>{
							if(res === 'true'){
								
								// 위젯이 삭제되었을 시 해당 위젯을 구독하고 있는 자신을 포함한 모든 구독자에게 해당 정보 전달
								client.send('/pub/wdel', {}, JSON.stringify({wno : widget.info.wno}));
								
								const widgetDelRes = document.querySelector('.widgetDelRes');
								motionOnOff(widgetDelRes, 0.8, false, { setting : 'offDefault' }, false, (o)=>{
									
									o.remove();
									
									boxFun('삭제에 성공하였습니다.', false, null,false, null, false, true);
								});
							}
						});
						
					});
				});
				
				
				boxFun('위젯을 정말 삭제하시겠습니까?', false, [submitBtn],false, 'widgetDelRes', false, true);
				
			};
			
		}
		
		contextMenuFun(widget, menuSetting);
	};
	
	
	// 해당 widget 객체 내부 info 객체가 가지고 있는
	// wcategory 속성 값에 따른 위젯 기능 연결 함수
	widget['cateFun'] = ()=>{
		
		const widgetContent = widget.querySelector('.widgetContent');
		widgetContent.innerHTML = '';
		const wcategory = widget.info.wcategory.toLowerCase();
		
		if(wcategory === 'memo'){
			wmemoBox(widget);
		} else if(wcategory === 'chat'){
			wchatBox(widget);
		} else if(wcategory === 'sns'){
			wcralingBox(widget);
		} else if(wcategory === 'plan'){
			wblist(widget);
		} else if(wcategory === 'code'){
			editorStart(widget);
		} else if(wcategory === 'map'){
			createMap(widget)
		}
		
		
	};
	
	
	// 위젯 크기에 따른 위젯 본문 가로 길이 퍼센트 설정
	let widgetContent = widget.querySelector('.widgetContent');
	widgetContent.style.height = 100 - 35/(Number(widget.style.height.split('px')[0])-10)*100 + '%';
	
	return widget;
}

// 위젯 z축 조절 함수
// widgetZMove(타겟 위젯, 위로 아래로, 가장 위로 갈지 아래로 갈지)
function widgetZMove(widget, upDown, maxMin){
	
	const area = widget.parentNode;
	const nodes = area.childNodes;
	const maxZIndex = nodes.length;
	const zindex = Number(widget.style.zIndex);
	
	if(upDown === 'up'){
		if(zindex < maxZIndex){
			nodes.forEach(node=>{
				if(Number(node.style.zIndex) === zindex + 1){
					console.log(node);
					node.style.zIndex = zindex;
					if(maxMin ==='min'){
						widget.style.zIndex = zindex + 1;
						return;
					}
					
				} else if(Number(node.style.zIndex) > zindex) {
					if(maxMin ==='max'){
						node.style.zIndex = Number(node.style.zIndex)-1;
					}
				}
				
			});
			
			if(maxMin === 'max'){
				widget.style.zIndex = maxZIndex;
			}
		}
		
	} else {
		if(zindex > 0){
			nodes.forEach(node=>{
				if(Number(node.style.zIndex) === zindex - 1){
					
					node.style.zIndex = zindex;
					if(maxMin ==='min'){
						widget.style.zIndex = zindex - 1;
						return;
					}
					
				} else if(Number(node.style.zIndex) < zindex) {
					if(maxMin ==='max'){
						node.style.zIndex = Number(node.style.zIndex)+1;
					}
				}
				
			});
			
			if(maxMin === 'max'){
				widget.style.zIndex = 1;
			}
		}
	}
}


// 컬러 픽커 버튼 생성
// (버튼이 위치할 부모 객체, 형제 객체, 콜백(color, btn))
// 형제 객체가 null 일 때 부모 객체 내부 가장 아래에 붙는다.
function colorPickerBtn(parentNode, beforeNode, submit){
	
	const btn = addObject(null, 'div', 'colorPickerBtn', false, (o)=>{
		o.addEventListener('click', (e)=>{
			
			e.preventDefault();
			e.stopPropagation();
			
			const colorObject = new colorPickerFun((color,btn)=>{
				submit(color,btn);
			},btn);
		});
	});
	
	if(beforeNode){
		parentNode.insertBefore(btn, beforeNode);
	} else {
		parentNode.appendChild(btn);
	}
	
	return btn;
}


// 컬러픽커 박스 함수(콜백(color, 박스를 호출 '시킨' 버튼), 박스를 호출 '시킨' 버튼)
// new 연산자를 이용해 객체 생성해서 호출해야 합니다!
// colorPickerBtn함수를 쓰는 것을 권장
function colorPickerFun(callback,btn){
	
	const oldColorPicker = document.querySelector('.colorBox');
	
	if(oldColorPicker){
		motionOnOff(oldColorPicker, 0.8, false, { setting : 'offDefault '},null, (o)=>{
			o.remove();
		});
	}
	
	this.colorValue = 'rgb(255,255,255)';
	
	const colorPicker = addObject(null, 'div', 'colorPicker', false, (o)=>{});
	
	const colorPointer = addObject(colorPicker, 'div', 'colorPointer', true, (o)=>{});
	
	const colerArea = addObject(colorPicker, 'div', 'colorArea', true, (o)=>{
		o.style.background = `-webkit-linear-gradient(top, hsl(0, 0%, 100%) 0%, hsla(0, 0%, 100%, 0) 50%,
			hsla(0, 0%, 0%, 0) 50%, hsl(0, 0%, 0%) 100%),
			-webkit-linear-gradient(left, hsl(0, 0%, 50%) 0%, hsla(0, 0%, 50%, 0) 100%)`;
		o.style.backgroundColor = 'hsl(0, 100%, 50%)';
		
		o.appendChild(colorPointer);
		
		function mousemove(e){
		
			colorPointer.style.top = e.offsetY + 'px';
			colorPointer.style.left = e.offsetX + 'px';
			
			const S = Math.round(e.offsetX/o.offsetHeight * 100);
			const L = Math.round(100-(e.offsetY/o.offsetWidth * 100));
			
			const colorView = document.querySelector('.colorView');
			const colorHue = document.querySelector('.colorHue');
			
			o.dataset.s = S;
			o.dataset.l = L;
			
			colorView.style.backgroundColor = `hsl(${colorHue.value},${S}%,${L}%)`;
			
		}
		
		function mouseup(e){
			
			const colorView = document.querySelector('.colorView');
			
			colorPickerFun['colorValue'] = colorView.style.backgroundColor;
			
			e.target.removeEventListener('mousemove', mousemove);
			
		}
		
		o.addEventListener('mousedown', (e)=>{
			
			colorPointer.style.top = e.offsetY + 'px';
			colorPointer.style.left = e.offsetX + 'px';
			
			const S = Math.round(e.offsetX/o.offsetHeight * 100);
			const L = Math.round(100-(e.offsetY/o.offsetWidth * 100));
			
			const colorView = document.querySelector('.colorView');
			const colorHue = document.querySelector('.colorHue');
			
			o.dataset.s = S;
			o.dataset.l = L;
			
			colorView.style.backgroundColor = `hsl(${colorHue.value},${S}%,${L}%)`;
			
			o.addEventListener('mousemove', mousemove);
			
			o.addEventListener('mouseup', mouseup);
			
		});
		
	});
	
	const colorView = addObject(colorPicker, 'div', 'colorView', true, (o)=>{});
	
	const colorHue = addObject(colorPicker, 'input', 'colorHue', true, (o)=>{
		
		o.type = 'range';
		o.max = '359';
		o.min = '0';
		o.value = '0';
		
		o.addEventListener('input', (e)=>{
			
			const colorArea = document.querySelector('.colorArea');
			const colorView = document.querySelector('.colorView');
			
			colerArea.style.backgroundColor = `hsl(${o.value}, 100%, 50%)`;
			
			const S = colorArea.dataset.s;
			const L = colorArea.dataset.l;
			
			colorView.style.backgroundColor = `hsl(${o.value}, ${S}%, ${L}%)`;
		});
	});
	
	const colorSubmit = addObject(null, 'input', ['colorSubmit', 'grayBtn'], false, (o)=>{
		
		o.type = 'button';
		o.value = '선택';
		o.style.float = 'left';
		o.style.width = 'max-content';
		o.addEventListener('click', ()=>{
			
			callback(colorPickerFun['colorValue'],btn);
			
			const box = o.parentNode;
			motionOnOff(box, 0.8, false, { setting : 'offDefault' },null, (o)=>{
				o.remove();
			});
		});
		
	});
	
	const colorClose = addObject(null, 'input', ['colorClose', 'grayBtn'], false, (o)=>{
		
		o.type = 'button';
		o.value = '닫기';
		o.style.float = 'right';
		o.style.width = 'max-content';
		
		o.addEventListener('click',()=>{
			
			const box = o.parentNode;
			
			motionOnOff(box, 0.8, false, { setting : 'offDefault' }, null, (o)=>{
				o.remove();
			});
		});
	});
	
	boxFun(null, false, [colorPicker,colorSubmit, colorClose], true, 'colorBox', null, true);

}

// rgb 색상에 맞춰서 글자 색을 화이트로 할지 블랙으로 할지 결정
function fontColorCheck(rgb){
	
	const colorArray = rgb.split('(')[1].split(',');
	
	const R = colorArray[0];
	const G = colorArray[1];
	const B = colorArray[2].substring(0, colorArray[2].indexOf(')'));
	
	let fontColor = '';
	
	if((R < 125 && G < 125) || (G < 125 && B < 125) || (R < 125 && B < 125)){
		fontColor = '#ffffff';
	} else {
		fontColor = '#3d3d3d';
	}
	
	return fontColor;
}


// 랜덤으로 RGB 컬러와 해당 컬러에 맞춰 폰트 화이트 / 블랙 설정 해주는 함수
// 리턴 값 배열
// [0] = 랜덤 RGB / [1] = 폰트 색상
function randomColor(){
	
	const R = Math.round((Math.random() * 255) + 0);
	const G = Math.round((Math.random() * 255) + 0);
	const B = Math.round((Math.random() * 255) + 0);
	
	const rgb = `rgb(${R}, ${G}, ${B})`;
	
	const fontColor = fontColorCheck(rgb);
	
	return [rgb, fontColor];
}


// <br> 태그 \n 문자로 대체
// 혹은 \n 문자를 <br> 태그로 대체
// (수정할 String 문자열,
//	true 일 경우 \n => <br>
//  false이거나 Null 일 경우 <br> => \n
// )
function brChange(val, chk){
	if(val){
		if(chk){
			let res = '';
			res = val.split('\n').join('<br>');
			return res;
		} else {
			let res = '';
			res = val.split('<br>').join('\r\n');
			res = res.split('<br/>').join('\r\n');
			return res;	
		}
	}
}


// login / mypage에서 뒤에 배경 움직이는 함수
function backgroundMotion(){
	
	const backgroundImg = document.querySelectorAll('.backgroundImg');
	
	let count = 0;
	
	backgroundImg[count].style.transitionDuration = '5s';
	backgroundImg[count].style.opacity = 1;
	backgroundImg[count].style.top = 0;
	backgroundImg[count].style.left = 0;
	backgroundImg[count].style.backgroundSize = '100%';
	backgroundImg[count].classList.add('openImg');
	
	count++;
	
	window.setInterval(()=>{
		
		if(count === backgroundImg.length-1){
			count = 0;
		}
		
		let oldTarget = document.querySelector('.openImg');
		
		motionOnOff(oldTarget, 5, false, {
			onOff : 'off',
			opacity : {
				num0 : 0
			},
			property : {
				mpp : 'position'
			}, block : 'off'
		}, {
			after : (o)=>{
				o.classList.remove('openImg');
				o.style.top = Math.floor((Math.random() * 6) - 3) + '%';
				o.style.left = Math.floor((Math.random() * 6) - 3) + '%';
				o.style.backgroundSize = Math.floor((Math.random() * 20) + 100) + "%";
			}
		});
		
		let target = backgroundImg[count];
		
		motionOnOff(target, 5, false, {
			onOff : 'on',
			opacity : {
				num0 : 0,
				num1 : 1
			},
			property : {
				mpp : 'position',
			}
		}, {
			after : (o)=>{
				o.style.top = Math.floor((Math.random() * 6) - 3) + '%';
				o.style.left = Math.floor((Math.random() * 6) - 3) + '%';
				o.style.backgroundSize = Math.floor((Math.random() * 20) + 120) + "%";
			},
			before : (o)=>{
				o.style.top = 0;
				o.style.left = 0;
				o.style.backgroundSize = "100%";
				o.classList.add('openImg')
			}
		});
		
		count++;
		
	}, 5000);
	

	
}


// 정규표현식 확인 함수
// o : 정규표현식을 확인할 텍스트 입력 객체 (input or textarea)
// str : 정규 표현식
// success : 입력 값이 정규표현식과 일치하는 텍스트 일 경우 콜백
// fail : 입력 값이 정규표현식과 일치하지 않는 텍스트 일 경우 콜백
function valueCheck(o, str, success, fail){
	
	let c;
	
	o.addEventListener('keyup',()=>{
		if(str.test(o.value)){
			success(o);
		} else {
			fail(o);
		}
	});
	
	o.addEventListener('blur',()=>{
		if(str.test(o.value)){
			success(o);
		} else {
			fail(o);
		}
	});
	
}


// 모션 넣어주는 함수
// obj : 움직일 도큐먼트 내의 객체
// time : 몇초동안 움직일 것인가
// bg : id가 bgBlack인 div 객체가 있을 경우 해당 객체도 같이 없어지게 하기 위한 옵션 ( 일반적으로 false )
// option : 움직임을 설정하는 객체
/*
 * setting : {
 * 		onDefault : 생성 기본 모션 ( 불투명도 0 > 1 / top : 현재값 -1% ) 
 *  	offDefault : 사라지는 기본 모션 ( 불투명도 1 > 0 / top : 현재값 +1% )
 * 		
 * }
 * opacity : { 
 * 		num0 : 초기값 ( onOff 속성값이 off 일 경우에는 num1은 생략되고 현재값을 기준으로 num0의 값이 최종값이 된다. )
 * 		num1 : 최종값
 * }
 * property : {
 * 		mpp : 객체 스타일에 position이 걸려있을 경우 position 아닐 경우 margin과 padding 둘중 하나를 선택해서 주입
 * 		x : 기본으로 mpp가 설정 안되어 있을 경우 margin-left으로 이동 position으로 설정되어 있을 경우 left
 * 		y : 기본으로 mpp가 설정 안되어 있을 경우 margin-top으로 이동 position으로 설정되어 있을 경우 top
 * }
 * block : off 일 경우 움직이는 모션 중에 내부 객체 클릭 되지 않도록 하기 ( !! true 일경우 해당 기능이 꺼집니다. 지정하지 마세요. )
 * onOff : {
 * 		on : 객체가 생기는 모션임을 명시
 * 		off : 객체가 사라지는 모션임을 명시
 * }
 * 
 */
// addMotion : 추가적인 모션 ( 해당 셋팅으로 위 option 생략 가능 )
/*
 * addMotion : {
 * 		after : function(targetObject) { 위 셋팅 값이 적용되기 전에 할 적용할 초기 css }
 * 		before : function(targetObject) { 위 셋팅 값이 마무리되고 적용할 최종 css  }
 * }
 */
// complete : 모든 모션이 마무리 되었을 떄 콜백 함수 ( 첫번째 인자로 모션이 걸린 object )
function motionOnOff(obj, time, bg, option, addMotion, complete){
	
	// addMotion 실행
	if(addMotion) if(addMotion['after']) addMotion['after'](obj);
	
	let op = option || {};
	
	
	// option setting
	if(op['setting'] === 'onDefault'){
		op = {
				onOff : 'on',
				opacity : {
					num0 : 0,
					num1 : 1
				},
				property : {
					mpp : 'position',
					y : -1
				}
		}
	} else if(op['setting'] === 'offDefault') {
		op = {
				onOff : 'off',
				opacity : {
					num0 : 0
				},
				property : {
					mpp : 'position',
					y : 1
				}
		}
	}
	
	
	// 불투명도 기본값 설정
	obj.style.opacity = (op['opacity'])? (op['opacity']['num0'] || '0' ) : '0';
	
	let x, y;
	let top, left;
	let marginLeft, marginTop;
	let tmp;
	let disabledDiv = document.querySelector('.disabledDiv');
	
	
	// mpp 값 설정
	const mpp = op['property']? (op['property']['mpp'] || 'position' ) : 'position';
	
	
	// block div 설정
	if(op['onOff'] === 'off' && !disabledDiv){
		if(!op['block']){
			disabledDiv = addObject(document.querySelector('body'), 'div', 'disabledDiv', true, (o)=>{
			
				o.style.position = 'fixed';
				o.style.width = obj.offsetWidth + 'px';
				o.style.height = obj.offsetHeight + 'px';
				o.style.top = obj.style.top;
				o.style.left = obj.style.left;
				o.style.backgroundColor = 'red';
				o.style.transform = obj.style.transform;
				o.style.opacity = 0;
				o.style.zIndex = 20000;
				o.addEventListener('click',(e)=>{
					e.preventDefault();
					e.stopPropagation();
				});
			
			});
		}
	}
	
	// 최초 값
	if(op['property']){
		
		x = op['property']['x'] || 0;
		y = op['property']['y'] || 0;
		
		if(mpp === 'position'){
			
			obj.style.top = Number(obj.style.top.substring(0,obj.style.top.indexOf('%'))) - ((y instanceof Object ? 0 : y) + (y.num0 || 0)) + '%';
			obj.style.left = Number(obj.style.left.substring(0,obj.style.left.indexOf('%'))) - ((x instanceof Object ? 0 : x) + (x.num0 || 0)) + '%';
			
		} else {
				
			tmp = (obj.style[mpp]? obj.style[mpp] : '0px 0px').split(' ');
			marginLeft = x !== 0 ? (Number(tmp[0].substring(0, tmp[0].indexOf('px'))) - ((x instanceof Object ? 0 : x) + (x.num0 || 0))) + 'px' : 'auto';
			marginTop = y !== 0 ? (Number(tmp[1].substring(0, tmp[1].indexOf('px'))) - ((y instanceof Object ? 0 : y) + (y.num0 || 0))) + 'px' : 'auto';
			obj.style[mpp] = marginTop + ' ' + marginLeft;
		}
		
	}
	
	
	// 최종 값
	if(!op['onOff'] || op['onOff']=== 'on'){
		window.setTimeout(()=>{
		
			obj.style.opacity = (op['opacity'])? (op['opacity']['num1'] || '1' ) : '1';
		
			if(addMotion) if(addMotion['before']) addMotion['before'](obj);
		
			if(op['property']){
			
				x = op['property']['x'] || 0;
				y = op['property']['y'] || 0;
			
			if(mpp === 'position'){
			
				obj.style.top = Number(obj.style.top.substring(0,obj.style.top.indexOf('%'))) + ((y instanceof Object ? 0 : y) + (y.num1 || 0)) + '%';
				obj.style.left = Number(obj.style.left.substring(0,obj.style.left.indexOf('%'))) + ((x instanceof Object ? 0 : x) + (x.num1 || 0)) + '%';
				
				
			} else {
				
				tmp = obj.style[mpp];
				marginLeft = x !== 0? (Number(tmp[0].substring(0, tmp[0].indexOf('px'))) + ((x instanceof Object ? 0 : x) + (x.num1 || 0))) + 'px' : 'auto';
				marginTop = y !== 0? (Number(tmp[1].substring(0, tmp[1].indexOf('px'))) + ((y instanceof Object ? 0 : y) + (y.num1 || 0))) + 'px' : 'auto';
				obj.style[mpp] = marginTop + ' ' + marginLeft;
				
			}
		}
			
		obj.style.transitionDuration = time + 's';
			
		},1);
	} else {
		obj.style.transitionDuration = time + 's';
	}
	
	
	// bg가 있을 경우
	if(bg){
		if(!op['onOff'] || op['onOff']=== 'on') motionOnOff(backgroundDiv, time, null, { onOff : 'on', opacity : { num0 : 0, num1 : 1 }}, null, complete);
		else motionOnOff(backgroundDiv, time, null, { onOff : 'off', opacity : { num0 : 0 }}, null, complete);
	}
	
	
	// 콜백 함수
	if(complete){
		
		window.setTimeout(()=>{
			complete(obj);
			
		}, time*1000);
	}
	
	
	if(disabledDiv){
		window.setTimeout(()=>{
			disabledDiv.remove();
		}, time*1000);
	}
}


// 오브젝트 중앙 정렬
function middlePositionFun(obj){
	
	obj.style.position = 'absolute';
	obj.style.top = '50%';
	obj.style.left = '50%';
	if(obj.style.transform){
		
		const transformArray = obj.style.transform.split(' ');
		const tmpArray = [];
		transformArray.forEach(style=>{
			if(!style.indexOf('translateX') > 0 && !style.indexOf('translateY') > 0 ){
				tmpArray.push(style);
			}
		});
		
		obj.style.transform = tmpArray.toString().replace(/,/g,' ') + 'translateX(-50%) translateY(-50%)';
		
	} else obj.style.transform = 'translateX(-50%) translateY(-50%)';

}

// 유틸 오브젝트 모두 삭제 함수
function utilBoxDelete(slide){
	
	const div = document.getElementById('utilDiv');
	
	const childNode = div.childNodes;
	
	if(slide){
		for(let n of childNode){
			motionOnOff(n, 1, null, {
				onOff : 'off',
				opacity :{ num0 : 0 },
				property : {
					mpp : 'margin',
					y : 10
				}
			}, null, (obj)=>{
				n.remove();
			});
		}
	} else {
		div.remove();
	}
}



// 툴팁 생성 함수
function infoBar(obj, text){
	
	// 툽팁 삭제 내장 함수
	// 혹시 남아 있는 infoBar 삭제
	infoBar['infoBoxRemove'] = ()=>{
		const infoBox = document.querySelector('.infoBox');
		if(infoBox) infoBox.remove();
	}
	
	// 툴팁 마우스 움직임 콜백 함수 1
	function tooltipMove(e){
		
		e.preventDefault();
		e.stopPropagation();
		
		const x = e.pageX+10;
		const y = e.pageY+10;
		const infoBox = document.querySelector('.infoBox');
		
		const body = document.querySelector('body');
		let utilBox = document.getElementById('utilDiv');
		
		if(!utilBox){
			utilBox = addObject(body,'div',null,true,(t)=>{
				t.setAttribute('id','utilDiv');
			});
		}
		
		if(!infoBox){
			
			const contentBox = addObject(utilBox,'div','infoBox',false,(t)=>{
					t.style.top = y + 'px';
					t.style.left = x + 'px';
					t.innerHTML = text;
				});
				
			const bg = document.getElementById('bgBlack');
			if(bg){
				utilBox.insertBefore(contentBox,bg);
			} else {
				utilBox.appendChild(contentBox);
			}
			
		} else {
			infoBox.innerHTML = text;
			infoBox.style.top = y + 'px';
			infoBox.style.left = x + 'px';
			infoBox.style.display = '';
		}
		
	}

	// 툴팁 마우스 움직임 콜백 함수 2
	function tooltipOut(e){
		
		e.preventDefault();
		e.stopPropagation();
		
		const infoBox = document.querySelector('.infoBox');
		if(infoBox) infoBox.remove();
		
	}
	
	function tooltipDisabled(){
		if(!text){
			const infoBox = document.querySelector('.infoBox');
			if(infoBox) infoBox.style.display = 'none';
		}
	}
	
	if(text){
		obj.addEventListener('mousemove',tooltipMove);
		obj.addEventListener('mouseout',tooltipOut);
	} else {
		obj.addEventListener('mousemove',tooltipDisabled);
		obj.addEventListener('mouseout',tooltipDisabled);
	}
	
}

// 박스 만들기 함수
// text : 박스 상단 붉은 글씨 ( 생략 가능 )
// bg : 배경 블랙을 만들지 설정
// addTagObject : 배열 형태로 들어가야 하며, 추가적으로 append 시킬 태그 객체가 배열값으로 들어간다.
// closeBtnDelete : 기본을로 설정되어 있는 박스 닫기 버튼을 지울지 설정
// boxSelector : 박스 객체의 클래스명 지정
// callback : 박스가 다 만들어 졋을 경우 실행할 함수 function(box, childNodes, className){ }
// autoMotion : 박스가 도큐먼트에 생길 때 모션을 준다.
//
//
// 내장 함수
// .closeDisabledDelete : (callObject){ 만약  기본 닫기 버튼이 존재하고 있을 시, callObject으로 해당 박스를 호출하는 객체를 지정하면, 해당 객체의 추가적인 이벤트 막는다.
//										(중복 호출 방지), 또한 닫기 버튼으로 박스를 닫을 시 자동으로 이벤트가 다시 활성화 된다. }
// .removeDisabledDelete : (callObject){ 만약 기본 닫기 버튼을 없앴고, 해당 박스를 호출하는 객체에 이벤트를 통해 박스를 생성한 후 객체 pointer-events or disabled을 걸어 주어 이벤트를 막았을 경우,
//										  박스에 커스텀한 닫기 버튼을 만들었을 경우, 해당 버튼에 이벤트를 걸어 박스가 살아질 때 해당 내장 함수를 호출하여 pointer-events or disabled 삭제 }
function boxFun(text,bg, addTagObject, closeBtnDelete, boxSelector, callback, autoMotion){

	const box = document.querySelector((boxSelector)? '.'+ boxSelector : '.boxOpen');
	
	if(!box){
		
		const contentBox = addObject(null, 'div', 'boxOpen', false, (t)=>{
			if(boxSelector) t.classList.add(boxSelector);
			t.innerHTML = ((text)? `<p>${text}</p>` : ``)+ ((closeBtnDelete)? `` : `<button class="___utilBoxCloseBtn grayBtn ${"_close_"+boxSelector}" id="utilBoxCloseBtn">닫기</button>`);
		});
		
		const body = document.querySelector('body');
		
		let utilBox = document.getElementById('utilDiv');
		
		if(!utilBox){
			utilBox = addObject(body,'div',null,true,(t)=>{
				t.setAttribute('id','utilDiv');
			});
		}
		
		utilBox.appendChild(contentBox);
		if(bg) utilBox.appendChild(backgroundDiv);
		
		const boxOpen = document.querySelector((boxSelector)? '.'+ boxSelector : '.boxOpen');
		const closeBtnAll = document.querySelectorAll('.___utilBoxCloseBtn');
		
		let closeBtn;
		
		if(boxSelector){
			for(let item of closeBtnAll){
				if(item.classList.contains("_close_"+boxSelector)){
					closeBtn = item;
				}
			}
		} else {
			closeBtn = closeBtnAll[0];
		}
		
		if(closeBtn){
			
			closeBtn.addEventListener('click',()=>{
				if(boxOpen) {
					if(autoMotion) {
						motionOnOff(boxOpen, 0.8, bg, { setting : 'offDefault' }, null, (o)=>{
							o.remove();
						});
					} else boxOpen.remove();
				}
			});
			
			
			// 내장 함수 1
			contentBox['closeDisabledDelete'] = (callObject)=>{
				
				if(callObject.tagName === 'A' || callObject.tagName === 'IMG'){
					if(callObject.getAttribute('style')) callObject.setAttribute('style', callObject.getAttribute('style') + 'pointer-events: none;');
					else callObject.setAttribute('style', 'pointer-events: none;');
				} else {
					callObject.setAttribute('disabled', 'true');
				}
				
				closeBtn.addEventListener('click', (e)=>{
					if(callObject.tagName === 'A' || callObject.tagName === 'IMG'){
						
						let styleArray = callObject.getAttribute('style').split(';');
						styleArray.splice(styleArray.length-2, 1);
						const styleStr = styleArray.toString().replace(/,/g, ';');
						callObject.setAttribute('style',styleStr );
						
					} else callObject.removeAttribute('disabled');
				});
			};
			
		}
		
		// 내장 함수 2
		contentBox['removeDisabledDelete'] = (callObject)=>{
			if(callObject.tagName === 'A' || callObject.tagName === 'IMG'){
				
				let styleArray = callObject.getAttribute('style').split(';');
				styleArray.splice(styleArray.length-2, 1);
				const styleStr = styleArray.toString().replace(/,/g, ';');
				callObject.setAttribute('style',styleStr);
				console.log(callObject.getAttribute('style'));
				
			} else callObject.removeAttribute('disabled');
		};
		
		if(addTagObject){
			for(let tag of addTagObject){
				if(closeBtn) boxOpen.insertBefore(tag, closeBtn);
				else boxOpen.appendChild(tag);
			}
		}
		
		if(autoMotion) {
			motionOnOff(boxOpen, 0.8, bg, { setting : 'onDefault' });
		}
		
		middlePositionFun(boxOpen);
		
		if(callback){
			
			callback(contentBox, contentBox.childNodes, boxSelector);
		}
		
		return contentBox;
		
	} else {
		return boxFun(text,bg, addTagObject, closeBtnDelete, "_"+boxSelector, callback, autoMotion);
	}
	
}

// 편하게 오브젝트 만들기 위한 함수
// parentNode : 부모가 되는 객체
// tagName : 객체의 태그 종류
// className : 지정 클래스명 단일 일 경우 String 값 여러개 일 경우 배열로 지정
// defaultLocation : 지정한 부모 객체 append 시킬지 설정 true/false ( parentNode와 한 셋트 )
// callback : 객체가 생성된 후 실행할 콜백함수 ( 첫번째 인자로 생성된 객체 )
function addObject(parentNode, tagName, className, defaultLocation, callback){
	
	const tag = document.createElement(tagName);
	if(className){
		if(className instanceof Array){
			for(let c of className){
				tag.classList.add(c);
			}
		} else {
			tag.classList.add(className);
		}
	}
	if(parentNode){
		parentNode.appendChild(tag);
	}
	if(callback){
		callback(tag);
	}
	return tag;
	
}


// 객체에 메뉴 등록 함수
function contextMenuFun(target, setting){
	
	target.addEventListener('contextmenu',(e)=>{
		
		e.preventDefault();
		e.stopPropagation();
		
		const oldMenu = document.querySelector('.customMenu');
		
		if(oldMenu) oldMenu.remove();
		
		const menu = addObject(document.querySelector('body'), 'div', 'customMenu', true);

		menu.style.top = e.clientY + 'px';
		menu.style.left = e.clientX + 'px';
			
		const ul = addObject(menu,'ul','menuUl', true);
		
		const valArray = Object.values(setting);
		
		valArray.forEach((value, i)=>{
			const keyArray = Object.keys(value);
			
			keyArray.forEach((k,keyIndex)=>{
				addObject(ul, 'li', 'menuLi', true, (l)=>{
					l.innerHTML = k;
					if(keyIndex === keyArray.length-1){
						if(i !== valArray.length - 1){
							l.style.borderBottom = '1px solid #ccc';
						}
					}
					l.addEventListener('mousedown',value[k]);
					l.addEventListener('mousedown',()=>{
						
						menu.remove();
						
					});
				});
			});
		});
		
		
	});
	const body = document.querySelector('body');
	
	body.addEventListener('mousedown',(e)=>{
		
//		e.preventDefault();
//		e.stopPropagation();
//		e.stopimmediatePropagation();
		
		const menu = document.querySelector('.customMenu');
		
		if(menu)
		menu.remove();
	
	});
	
}


// 인증 박스
function authBoxFun(minute, data, cate, className, callback){
	let authTimeMm = minute;
	let authTimeS = 0;
	let authString = data;
	const authTime = addObject(false, 'p', false, false, (o)=>{
		o.innerHTML = `인증번호 만료까지 ${String(authTimeMm).length === 1? '0' : ''}${authTimeMm}분 ${String(authTimeS).length === 1? '0' : ''}${authTimeS}초`;
		o.style.fontSize = '12px';
	});
	
	const auth = addObject(false, 'input', false, false, (o)=>{
		o.type = 'text';
	});
		
	const submitBtn = addObject(false, 'input', 'grayBtn', false, (o)=>{
		o.type = 'button';
		o.style.width = 'max-content';
		o.style.marginRight = '5px';
		o.value = '확인';
	});
	
	function timeCheck(){
		
		if(authTimeS === 0){
			authTimeS = 59;
			authTimeMm -=1;
		} else {
			authTimeS -=1;
		}
		
		authTime.innerHTML = `인증번호 만료까지 ${String(authTimeMm).length === 1? '0' : ''}${authTimeMm}분 ${String(authTimeS).length === 1? '0' : ''}${authTimeS}초`;
		
	}
	
	const timeInterval = window.setInterval(timeCheck,1000);
	
	window.setTimeout(()=>{
		clearInterval(timeInterval);
		authString = '';
	}, minute * 60000);
	
	boxFun('<span style="color:#3d3d3d;">'+ cate + '(으)로 인증 번호가 <br> 발송되었습니다.</span>',false, [authTime, auth, submitBtn], false, className,(o)=>{
		callback(o, auth, authTime, submitBtn);
	},true);
}