/**
 * http://usejsdoc.org/
 */



// 검정색 백그라운드
const backgroundDiv = addObject(null,'div',null,false,(t)=>{
	t.setAttribute('id','bgBlack');
});


function resizeMap(widget) {
    var mapContainer = widget.querySelector('#map');
    const map_wrap = widget.querySelector('.map_wrap');
    mapContainer.style.width = map_wrap.offsetWidth + 'px';
    mapContainer.style.height = map_wrap.offsetHeight + 'px'; 
}

function hyphenDateFormat(date){
	const dateArray = date.split('-');
	const dateType = new Date(`${dateArray[1]}/${dateArray[2]}/${dateArray[0]}`);
	return dateType
}

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

function logout(){
	
	xhrLoad('get','logout', null, (res)=>{
		if(res === 'true'){
			location.reload();
		}
	});
		
}


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

function getCusor(target){
	target.focus();
	const tmpSpan = document.createElement('span');
	tmpSpan.id = 'editCusor';
	
	window.getSelection().getRangeAt(0).insertNode(tmpSpan);
	
	return tmpSpan;
}

function setSaveTime(widget){
	
	const wmContent = widget.querySelector('.wmContent');
	const wmMsg = widget.querySelector('span.wmMsg'); 
	
	if(wmContent['saveTimeoutCheckId']) {
		
		client.send('/pub/wmemo', {}, JSON.stringify({
			wno : widget.info.wno,
			mid: userInfo.mid,
			status : 'writing'
		}));
		
		window.clearTimeout(wmContent['saveTimeoutCheckId']);
	}
	
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

function imageScaleBoxFun(targetImage, area, widget){
	
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
				
				setSaveTime(widget);
			});
			
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
				
				setSaveTime(widget);
				
			});
			
			const closeBtn =  o.querySelector('input[type=button]');
			
			closeBtn.addEventListener('mousedown',()=>{
				targetImage.style.border = '';
				menu.remove();
			});
			
		});
		
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


//버튼 리스트
function btnList(pop, btn, className, liContent, lisFunArray){
	
	const chk = pop.querySelector('.btnList');
	const chkName = chk? chk.className.split(' ')[0] : null;
	
	if(chk) chk.remove();
	
	if(chkName === className) {
		return;
	}
	
	const openBoxLeft = btn.offsetLeft;
	const box = addObject(pop, 'ul', [className, 'btnList'], true, (o)=>{
		
		o.innerHTML = liContent;
		
		let top = btn.offsetTop + btn.offsetHeight;
		
		o.parentNode.style.top = top + 'px';;
		o.parentNode.style.left = openBoxLeft + 'px';
		
		
		const lis = o.querySelectorAll('li');
			
		lis.forEach((li,i)=>{
			li.addEventListener('mousedown',(e)=>{
				lisFunArray[i]();
				li.parentNode.remove();
			});
		});
	});
	
}

// 배열 정렬
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
	console.log(returnArr);
	return returnArr;
}

function mouseEventFun(target, clickArea, mouseArea){
	
	let areaClone;
	let originX, originY;
	let mouseX, mouseY;
	
	const widgetHeader = clickArea.parentNode.parentNode.querySelector('.widgetHeader');

	
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
	
	function mousedown(e){
		
		e.preventDefault();
		e.stopPropagation();
		
		originX = target.offsetLeft;
		originY = target.offsetTop;
		
		mouseX = e.pageX;
		mouseY = e.pageY;
		
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

function widgetGradeCheck(widget){
	
	const owner = widget.info.mid;
	const wcategory = widget.info.wcategory.toLowerCase();
	const rules = widget.info.rules;
	const dggrade = userInfo.dashgrade.dggrade;
	const targetId = userInfo.mid;
	
	let wrrwd;
	
	if(owner !== targetId){
		
		let individualCheck = false;
		let groupCheck = false;
		
		rules.forEach(rule=>{

			if(rule.mid === targetId){
				wrrwd = rule.wrrwd;
				individualCheck = true;
				return;
			}
			

		});
		
		if(!individualCheck){
			rules.forEach(rule=>{

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
		// 웹 소켓 오픈
		console.log('웹 소켓 연결');
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

		const moveClient = client.subscribe('/sub/wloc/'+widget.info.wno, (res)=>{

			const scaleInfo = JSON.parse(res.body);

			if(scaleInfo.mid !== userInfo.mid){

				widget.info.wtop = scaleInfo.wtop;
				widget.info.wleft = scaleInfo.wleft;
				widget.style.top = scaleInfo.wtop + 'px';
				widget.style.left = scaleInfo.wleft + 'px';

			}
		},{});

		const upClient = client.subscribe('/sub/wup/' + widget.info.wno, (res)=>{

			const upInfo = JSON.parse(res.body);
			const widgets = document.querySelectorAll('.widget');
			
			widgets.forEach((w,i)=>{

				if(w.info.wno === upInfo.wno){

					let individualCheck = false;
					let groupCheck = false;

					upInfo.rules.forEach(rule =>{

						if(rule.mid === userInfo.mid){
							individualCheck = true;
							return;
						}

					});

					if(!individualCheck){
						const dggrade = userInfo.dashgrade.dggrade;
						upInfo.rules.forEach(rule =>{

							if(rule.wrmin <= dggrade && rule.wrmax >= dggrade){
								groupCheck = true;
								return;
							}

						});
					}

					if(!individualCheck && !groupCheck){
						w.style.transitionDuration = '1s';
						motionOnOff(w, 0.8, false, { onOff : 'off' }, false, (o)=>{
							w.websocket.close();
//							widgets.splice(i,1);
							o.remove();
						});
					} else {
						
						w.info = upInfo;
						w.style.transitionDuration = '1s';
						
						widgetUpdate(w);
						widgetSettingFun(null, w);
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

		const delClient = client.subscribe('/sub/wdel/'+widget.info.wno , (res)=>{

			const delInfo = JSON.parse(res.body);
			const widgets = document.querySelectorAll('.widget');
			
			widgets.forEach((w,i)=>{

				if(w.info.wno === delInfo.wno){

					w.style.transitionDuration = '1s';
					motionOnOff(w, 0.8, false, { onOff : 'off' }, false, (o)=>{
						w.websocket.close();
//						widgets.splice(i,1);
						o.remove();
					});

					return;
				}
			});
		},{});

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
	widget['update'] = ()=>{
		
		xhrLoad('post','widget/update', widget.info, (res)=>{
			
			if(res){
				
				const updateRes = JSON.parse(res);
				
				Object.assign(widget.info, updateRes);
				
				client.send('/pub/wup', {}, JSON.stringify(widget.info));
				
				const { wno, dno, rules } = widget.info;
				
				client.send('/pub/wadd', {}, JSON.stringify({ wno, dno, rules }));
				
			} else {
				boxFun('잘못된 접근입니다.');
			}
			
		});
		
	};
	
	widget['mouseEventFun'] = ()=>{
		mouseEventFun(widget, widgetHeaderArea, widget.parentNode);
	};
	
	widget['scaleEventFun'] = ()=>{
		scaleEventFun(widget, widgetMoveArea, widget.parentNode);
	};
	
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
					'내 정보 보기' : ()=>{},
					'로그아웃' : ()=>{logout();}
				}
				
			};
		
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
	
	let widgetContent = widget.querySelector('.widgetContent');
	widgetContent.style.height = 100 - 35/(Number(widget.style.height.split('px')[0])-10)*100 + '%';
	
	return widget;
}

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

function randomColor(){
	
	const R = Math.round((Math.random() * 255) + 0);
	const G = Math.round((Math.random() * 255) + 0);
	const B = Math.round((Math.random() * 255) + 0);
	
	const rgb = `rgb(${R}, ${G}, ${B})`;
	
	const fontColor = fontColorCheck(rgb);
	
	return [rgb, fontColor];
}

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

function motionOnOff(obj, time, bg, option, addMotion, complete){
	
	if(addMotion) if(addMotion['after']) addMotion['after'](obj);
	
	let op = option || {};
	
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
	
	obj.style.opacity = (op['opacity'])? (op['opacity']['num0'] || '0' ) : '0';
	
	let x, y;
	let top, left;
	let marginLeft, marginTop;
	let tmp;
	let disabledDiv = document.querySelector('.disabledDiv');
	
	const mpp = op['property']? (op['property']['mpp'] || 'position' ) : 'position';
	
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
	
	if(bg){
		if(!op['onOff'] || op['onOff']=== 'on') motionOnOff(backgroundDiv, time, null, { onOff : 'on', opacity : { num0 : 0, num1 : 1 }}, null, complete);
		else motionOnOff(backgroundDiv, time, null, { onOff : 'off', opacity : { num0 : 0 }}, null, complete);
	}
	
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
	/*
	const width = obj.offsetWidth;
	const height = obj.offsetHeight;
	
	obj.style.top = window.innerHeight/2 - height/2 - 30 + 'px';
	obj.style.left = window.innerWidth/2 - width/2 + 'px';
	
	if(Number(obj.style.top.substring(0,obj.style.top.indexOf('px'))) < 0){
		obj.style.top = '20px';
	}
	*/
	
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
		
		contentBox['removeDisabledDelete'] = (callObject)=>{
			console.log(callObject);
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

// 편하게 오브젝트 만들기
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
	if(defaultLocation){
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