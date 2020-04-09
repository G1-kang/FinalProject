//드래그앤 드롭 
function dragEnter(ev) {
		ev.preventDefault();
	}

/*
 * function drag(ev) { console.dir(ev.target); ev.target.id = 'drag';
 * ev.dataTransfer.setData("text", ev.target.id); }
 */
	
	// 드래그 했을때
	function drag(ev) {
		ev.currentTarget.id = 'drag';
		
		const classArr = ev.currentTarget.parentNode.parentNode.className.split(' ');
		
		// ondrag시 원하는 클래스에 복사붙여넣기를 할 수 있게 만드는 코드 , true값을 "copyCheck"에 담아서 전송해줌
		if(classArr[1]){
			ev.dataTransfer.setData("copyCheck", true);	
		}
		ev.dataTransfer.setData("text", ev.target.id);
		
		
	}
// target : 태그 오브젝트 에대애서 반영한다. id의 프로퍼티를 정의해주고 (가상의id를 만들어줌)
// dataTransfer : "text" 라는 오브젝트에 넣어서 drop 할때의 값에 적용해 준다
	
	
	// 복사 드래그앤 드롭
	function copydrop(ev) {
		
		ev.preventDefault();
		
		var data = ev.dataTransfer.getData("text");
		var dragObj = document.querySelector('#' + data);
		
		const wbtodono = dragObj.dataset.wbtodono;
		const span = dragObj.parentNode;
		const area = ev.currentTarget;
		
		let chk = true;
		area.childNodes.forEach(item=>{
			
			if(item.tagName === 'SPAN'){
				if(item.childNodes[0].dataset.wbtodono === wbtodono){
					chk = false;
					return;
				}
			}
		});
		
		if(chk){
			
			const copyCheck = ev.dataTransfer.getData("copyCheck");
			if(copyCheck){
				
				function searchAreaFun(searchArea){
					let chk = true;
					let moveTarget;
					
					searchArea.childNodes.forEach(item=>{
						if(item.tagName === 'SPAN'){
							if(item.childNodes[0].dataset.wbtodono === wbtodono){
								chk = false;
								moveTarget = item;
								return;
							}
						}
					});
					
					if(chk){
						var ccopy = span.cloneNode(true);
						area.appendChild(ccopy);
					} else {
						area.appendChild(moveTarget);
					}
				}
				
				const areaParent = area.parentNode;
				let searchArea;
				
				if(area.id === 'wtasklistDo'){
					
					searchArea = areaParent.querySelector('#wtasklistDone');
					
				} else if (area.id === 'wtasklistDone'){
					
					searchArea = areaParent.querySelector('#wtasklistDo');
				}
				
				searchAreaFun(searchArea);
				
			} else {
				
				area.appendChild(span);
				
			}
			
			let wbtodo;
			
			if(area.id === 'wtasklistDo') wbtodo = 'N';
			else if (area.id === 'wtasklistDone') wbtodo = 'Y';
			
			
			xhrLoad('post', 'wbstatechange', { wbtodono : dragObj.dataset.wbtodono, wbtodo }, (res)=>{});
			
		}
		
		dragObj.id = '';
	}

	
const summernoteConfig = {
		lang: 'ko-KR',
		placeholder: 'content',
        minHeight: 220,
        maxHeight: null,
        focus: true, 
		toolbar: [
		    // [groupName, [list of button]]
		    ['style', ['bold', 'italic', 'underline', 'clear']],
		    ['fontsize', ['fontsize']],
		    ['color', ['color']],
		    ['para', ['paragraph']],
		    ['height', ['height']],
		    ['insert', ['picture', 'link', 'video', 'table']]
		  ]
}

function planDelete(item, areas){
	
	const { wbtodono } = item;
	
	console.log(areas);
	
	areas.forEach(area=>{
		
		const inputs = area.querySelectorAll('input[type=text]');
		
		inputs.forEach(input=>{
			
			if(Number(input.dataset.wbtodono) === wbtodono){
				input.parentNode.remove();
				return;
			}
		});
		
	});
	
}

function planUpdate(item, area){

	const { wbtodono, wbtitle, wbstartdate, wbenddate } = item;
		
	const inputs = area.querySelectorAll('input[type=text]');
	
	inputs.forEach(input=>{
		if(Number(input.dataset.wbtodono) === wbtodono){
			if(wbtitle){
				console.log(input);
				input.value = wbtitle;
			} else if (wbstartdate && wbenddate && !input.classList.contains('wbinputMy')){
				infoBar(input, `${item.mnick} : ${item.wbstartdate.split(" ")[0]} ~ ${item.wbenddate.split(" ")[0]}`);
			}
			return;
		}
	});
	
	
}

function schedulItemLoad(item, area, all, write){
	
	let color, fontColor;
	let target;
	let img;
	
	dashboardInfo.dashmember.forEach(member=>{
		
		if(member.mid === item.mid){
			color = `box-shadow: 0 0 0 1000px ${member.dmcolor} inset, 0 0 4px #989898`;
			fontColor = `-webkit-text-fill-color :${fontColorCheck(member.dmcolor)}dd`;
			img = `<img src="${member.mimgpath}" onerror="this.src='https://img.icons8.com/ultraviolet/100/000000/user.png';"/>`
			return;
		}
		
	});
	
	
	
	if(!all){
		target = $(`<span style="position: relative;display: block;"><input class="wbinputMy" style="${color}; ${fontColor};" draggable="true" data-wbtodono="${item.wbtodono}"  type="text" value="${item.wbtitle}" readonly ondragstart="drag(event)"/>${img}</span>`);
	} else {
		target = $(`<span style="position: relative;display: block;"><input class="wbinput" style="${color}; ${fontColor};" data-wbtodono="${item.wbtodono}"  type="text" readonly value="${item.wbtitle}"/>${img}</span>`);
	}
	
	
	target.on('click',()=>{
		selectbtn($(target).find('input').data('wbtodono'));
	});
	
	console.log(area);
	
	if(!write){
		$(area).append(target);
	} else {
		const firstInput = area.querySelector('span');
		if(firstInput){
			$(firstInput).after(target);
		} else {
			$(area).append(target);
		}
	}
	
	const obj = $(target).get(0);
	if(all){
		infoBar(obj, `${item.mnick} : ${item.wbstartdate.split(" ")[0]} ~ ${item.wbenddate.split(" ")[0]}`);
	}
	
}


//글목록 게시판 
function wblist(widget) {
	
	const wno = widget.info.wno;
	
	if(!widget.info.preview){
		
		widget.websocket.wbDeleteClient = client.subscribe('/sub/wbdelete/'+wno,(res)=>{
			
			const item = JSON.parse(res.body);
			
			const areas = [];
			
			const wtasklistAll = widget.querySelector('#wtasklistAll');
			
			areas.push(wtasklistAll);
			
			if(userInfo.mnick === item.mnick){

				const wtasklistMy = widget.querySelector('#wtasklistMy');
				areas.push(wtasklistMy);

				const wtasklistDo = widget.querySelector('#wtasklistDo');
				areas.push(wtasklistDo);

				const wtasklistDone = widget.querySelector('#wtasklistDone');
				areas.push(wtasklistDone);

				const wbinnerBox = document.querySelector('.wbinnerBox');
				areas.push(wbinnerBox);

			}
			
			planDelete(item, areas);
			
		});
		
		widget.websocket.planClient = client.subscribe('/sub/wplan/'+wno,(res)=>{
			const item = JSON.parse(res.body);
			const wtasklistAll = widget.querySelector('#wtasklistAll');
			schedulItemLoad(item, wtasklistAll, true, true);
		});


		widget.websocket.wbTitleClient = client.subscribe('/sub/wbtitleup/'+wno,(res)=>{

			const item = JSON.parse(res.body);

			const wtasklistAll = widget.querySelector('#wtasklistAll');
			planUpdate(item, wtasklistAll);
			if(userInfo.mnick === item.mnick){

				const wtasklistMy = widget.querySelector('#wtasklistMy');
				planUpdate(item, wtasklistMy);

				const wtasklistDo = widget.querySelector('#wtasklistDo');
				planUpdate(item, wtasklistDo);

				const wtasklistDone = widget.querySelector('#wtasklistDone');
				planUpdate(item, wtasklistDone);

				const wbinnerBox = document.querySelector('.wbinnerBox');
				planUpdate(item, wbinnerBox);

			}
			
			if(wbinnerBox){
				console.dir(wbinnerBox);
				if(Number(wbinnerBox.wbtodono) === item.wbtodono){

					const wbtitle = wbinnerBox.querySelector('.wbtitle');
					console.log(wbtitle);
					wbtitle.innerHTML = item.wbtitle;
				}
			}
		});

		widget.websocket.wbDateClient = client.subscribe('/sub/wbdateup/'+wno,(res)=>{

			const item = JSON.parse(res.body);

			const wtasklistAll = widget.querySelector('#wtasklistAll');
			planUpdate(item, wtasklistAll);
			
			if(userInfo.mnick === item.mnick){
				
				const wtasklistMy = widget.querySelector('#wtasklistMy');
				planUpdate(item, wtasklistMy);

				const wtasklistDo = widget.querySelector('#wtasklistDo');
				planUpdate(item, wtasklistDo);

				const wtasklistDone = widget.querySelector('#wtasklistDone');
				planUpdate(item, wtasklistDone);

				const wbinnerBox = document.querySelector('.wbinnerBox');
				planUpdate(item, wbinnerBox);
				
			}
			
			const wbinnerBox = document.querySelector('.wbinnerBox');

			if(wbinnerBox){

				if(Number(wbinnerBox.wbtodono) === item.wbtodono){

					const wbstartdate = wbinnerBox.querySelector('span.wbstartdate');
					const wbenddate = wbinnerBox.querySelector('span.wbenddate');

					wbstartdate.innerHTML = item.wbstartdate.split(" ")[0];
					wbenddate.innerHTML = item.wbenddate.split(" ")[0];

				}
			}
		});

		widget.websocket.wbContentClient = client.subscribe('/sub/wbcontentup/'+wno,(res)=>{

			const wbinnerBox = document.querySelector('.wbinnerBox');

			if(wbinnerBox){
				const item = JSON.parse(res.body);
				const wbcontentDiv = wbinnerBox.querySelector('.wbcontentDiv');

				if(Number(wbinnerBox.wbtodono) === item.wbtodono){
					wbcontentDiv.innerHTML = item.wbcontent;
					wbcontentDiv.addEventListener('click',modifyEvent);
				}
			}

		});
	}
	const wboardcon = addObject(null, 'div', 'wboardcon',false,(o)=>{
		
		o.innerHTML = `
		<div class="wtasklist" id="wtasklistAll">
			<p class="cpwtasklist">프로그램 전체 일정</p>
	
		</div>
		<div class="wtasklist mytasklist" id="wtasklistMy" ondragover="dragEnter(event)">
			<p class="cpwtasklist">나의 일정
			</p><input class="wbtadd" type="button" value="+">
			
		</div>
		
		<div  class="wtasklist" id="wtasklistDo" ondrop="copydrop(event)"  ondragover="dragEnter(event)">
			<input type="hidden" name="wbtodo" value="N"/>
			<p>진행중 일정</p>
		</div>
		
		<div class="wtasklist" id="wtasklistDone" ondrop="copydrop(event)" ondragover="dragEnter(event)">
			<input type="hidden" name="wbtodo" value="Y"/>
			<p>완료 일정</p>
		</div>
		`;
		
		const wbtadd = o.querySelector('.wbtadd');
		
		
		
		$(o).on('click',(e)=>{
			widget.style.cursor = 'default';
		});
		
		if(!widget.info.preview){
		
			schedulInsert(wbtadd, widget);
			$(function() {

				//프로그램 전체 일정 
				$.ajax({
					url:'wbAllList',
					method:'post',
					data:{
						"wno":wno
					},
					success: function(data) {

						if(data){

							data.forEach(function(item){

								const wtasklistAll = widget.querySelector('#wtasklistAll');
								schedulItemLoad(item, wtasklistAll, true);

							});

						}

					},error: function(data) {
						alert("통신실패");
					}

				});

				//나의 일정 
				$.ajax({
					url:'wbMyList',
					method:'post',
					data:{
						"wno":wno
					},
					success:function(data){

						if(data){

							data.forEach(function(item){

								const wtasklistMy = widget.querySelector('#wtasklistMy');
								schedulItemLoad(item, wtasklistMy);

								if(item.wbtodo ==='Y'){

									const wtasklistDone = widget.querySelector('#wtasklistDone');
									schedulItemLoad(item, wtasklistDone);

								} else if(item.wbtodo === 'N'){

									const wtasklistDo = widget.querySelector('#wtasklistDo');
									schedulItemLoad(item, wtasklistDo);

								}

							});

						}
					},error:function(data){
						alert("통신실패");
						wbnewtask();
					}

				});

			});

		}
	
	});
	
	wboardcon.addEventListener('mouseover',(e)=>{
		widget.style.cursor = 'default';
	});

	widget.querySelector('.widgetContent').appendChild(wboardcon);
	
	
}

function schedulInsert(item, widget){
	
	console.log(item);
	
	const wno = widget.info.wno;
	const dno = widget.info.dno;
	
	$(item).on('click',function(){
		
		let wblistbox1 = document.querySelector('.wblistbox1');
		if(wblistbox1) wblistbox1.remove();
		
		const wblistdiv = addObject(null, 'div', 'wblistdiv');
		const wblistobj = addObject(wblistdiv, 'div', 'wblistobj',true,(o)=>{
		
			o.innerHTML=`
			<p><span>제목</span>
				<span class="sptag"><input type="text" id="wbtitle" name="wbtitle"  placeholder="제목"/></span></p>
			<p>
				<span>날짜</span>
				<span class="sptag">
					<input type="text" id="wbstartdate1" name="wbstartdate" >
					<input type="text" id="wbenddate1" name="wbenddate" >
				</span>
			</p>
			<textarea id="summernote" name="wbcontent"></textarea>
			`;
			
		    $(function() {
		    	//써머노트 호출 
		    	  $(o).find('#summernote').summernote(summernoteConfig);
		    	  
		    	  const calConfig = {
			    		    mode: 'range',
			    		    dateFormat: "Y-m-d",
			    		    onChange : function(selectedDates, dateStr, instance){
			    		    	
			    		    	var wbstartdate = $(o).find('#wbstartdate1');
				    			var wbenddate = $(o).find('#wbenddate1');
				    			
			    		    	if(selectedDates.length === 2){
			    		    		
			    		    		const dateArray = dateStr.split('to');
			    		    		
			    		    		const startDate = dateArray[0].trim();
			    		    		const endDate = dateArray[1].trim();
			    		    		
			    		    		wbstartdate.val(startDate);
			    		    		wbenddate.val(endDate);
			    		    		
			    		    	}
			    		    }
			    		};
		    	  
		    	  //플랫피커 호출 
		    	  let cal1 = $(o).find("#wbstartdate1").flatpickr(calConfig);
		    	  let cal2 = $(o).find("#wbenddate1").flatpickr(calConfig);
		    	  
		    	  
		    	});
			
		});
		
		
		const wbsend = addObject(null, 'input', 'grayBtn', false, (o)=>{
			
			o.type='button';
			o.style.marginRight = '5px';
			o.style.width = 'max-content';
			o.id='wbsend';
			o.value='글쓰기';
			o.name='wbsend';
			
			$(o).on('click',(e)=>{
				
				const wblistbox1 = e.target.parentNode;
				
				var wbtitle = $(wblistbox1).find('#wbtitle').val();
    			var wbstartdate = $(wblistbox1).find('#wbstartdate1').val();
    			var wbenddate = $(wblistbox1).find('#wbenddate1').val();
    			var wbcontent = $(wblistbox1).find('#summernote').val();
    			
    			let wbtodo;
    			
    			const nowDate = new Date();
    			const dateNum1 = hyphenDateFormat(wbstartdate);
    			const dateNum2 = hyphenDateFormat(wbenddate);
    			
    			if(dateNum1 <= nowDate && dateNum2 >= nowDate){
    				wbtodo = 'N';
    			} else if(dateNum1 > nowDate){
    				wbtodo = null;
    			} else if(dateNum2 < nowDate){
    				wbtodo = 'Y';
    			}
    			
    			if(!wbtitle || !wbstartdate || !wbenddate || !wbcontent){
    				boxFun('정보가 누락되었습니다.', false, false, false, 'fail', false, true);
    				return;
    			}
    			
    			$.ajax({
    				url:'summerwrite',
    				method:'post',
    				data:{
    					wno, wbtodo, dno,
    					"wbtitle":wbtitle,
    					"wbstartdate":wbstartdate,
    					"wbenddate":wbenddate,
    					"wbcontent":wbcontent
    				},
    				success: function(res) {
    					
    					if(res){
    						
    						client.send('/pub/wplan', {}, JSON.stringify(res));
    						
    						const wtasklistMy = widget.querySelector('#wtasklistMy');
    						schedulItemLoad(res, wtasklistMy, null, true);
    						
    						if(res.wbtodo ==='Y'){
    							
    							const wtasklistDone = widget.querySelector('#wtasklistDone');
    							schedulItemLoad(res, wtasklistDone, null, true);
    							
    						} else if(res.wbtodo === 'N'){
    							
    							const wtasklistDo = widget.querySelector('#wtasklistDo');
    							schedulItemLoad(res, wtasklistDo, null, true);
    							
    						}
    						
    						motionOnOff(o.parentNode, 0.8, false, { setting : 'offDefault' }, null, (o)=>{
    							o.remove();
    						});
    						
    					}else {
    						boxFun('저장에 실패하였습니다.');
    					}
    					
    				},error:function(res){
    					alert('통신실패');
    				}
    			});//아작스 끝 
			});
		});
		
		wblistbox1 = boxFun('일정 추가', false, [ wblistdiv, wbsend ],false,'wblistbox1',(o)=>{
			o.querySelector('.wblistdiv').style.textAlign = 'left';
		},true);
		
	});
}


function modifyEvent(e){
	
	e.preventDefault();
	e.stopPropagation();
	
	const wbcontentDiv = e.currentTarget;
	const wbinnerBox = wbcontentDiv.parentNode.parentNode;
	const wbtodono = wbinnerBox.wbtodono
	const wno = wbinnerBox.wno;
	const wbcontent = wbcontentDiv.parentNode.parentNode.wbcontent;
	
	wbcontentDiv.removeEventListener('click',modifyEvent);
	
	wbcontentDiv.innerHTML = `
		<textarea id="summernote" name="wbcontent"></textarea>
		<div style="text-align:center;">
			<input type="button" style="display:inline-block; width:49%;" class="grayBtn" value="본문 수정"/>
			<input type="button" style="display:inline-block; width:49%;" class="grayBtn" value="수정 취소"/>
		</div>
	`;
	
	const btns = wbcontentDiv.querySelectorAll('input[type=button]');
	
	
	btns[0].addEventListener('click', (e)=>{
		const wbcontent = $('#summernote').val();
		xhrLoad('post', 'conupdate', { wno, wbtodono, wbcontent }, (res)=>{
			
			const obj = JSON.parse(res);
			
			$('#summernote').summernote('destroy');
			
			wbcontentDiv.parentNode.parentNode.wbcontent = obj.wbcontent;
			client.send('/pub/wbcontentup',{},res);
		
		});
	});
	
	btns[1].addEventListener('click', (e)=>{
		
		e.preventDefault();
		e.stopPropagation();
		
		$('#summernote').summernote('destroy');
		wbcontentDiv.innerHTML = wbcontentDiv.parentNode.parentNode.wbcontent;
		wbcontentDiv.addEventListener('click',event);
		
	});
	
	$('#summernote').summernote(summernoteConfig);
	
	$('#summernote').summernote('code',wbcontent);
}

// 글 선택시 생성되는 박스
function selectbtn(selectno){
	
	console.log(selectno);
	
	let wbinnerBox = document.querySelector('.wbinnerBox');
	
	if(wbinnerBox) wbinnerBox.remove();
	
	writeContent = addObject(null, 'div', 'writeContent', false, (o)=>{
		
		$.ajax({
			url : `wSelectOne?wbtodono=${selectno}`,
			method : 'get',
			success : (data)=>{
				
				let modifyBtn = ``;
				if(data.mid === userInfo.mid){
					modifyBtn = `<span class="modifyBtn"><img src="https://img.icons8.com/small/16/000000/edit.png"/></span>`
				}
				
				o.innerHTML = `
					<p class="wbwriterP">
						<span class="colName">담당자</span>
						<span>${data.mnick}</span>
					</p>
					<p class="wbtitleP">
						<span class="colName">일정명</span>
						<span class="wbtitle">${data.wbtitle}</span>`+modifyBtn+`
					</p>
					<p class="wbdateP">
						<span class="colName">기간</span>
						<span class="wbstartdate">${data.wbstartdate}</span>
						<span> ~ </span>
						<span class="wbenddate">${data.wbenddate}</span>`+modifyBtn+`
					</p>
					<div class="wbcontentDiv">${data.wbcontent !== null? data.wbcontent : ''}</div>
					`;
				
				
				const modifyBtns = o.querySelectorAll('.modifyBtn');
				const wbcontentDiv = o.querySelector('.wbcontentDiv');
				o.parentNode.wno = data.wno;
				o.parentNode.wbtodono = selectno;
				o.parentNode.wbcontent = data.wbcontent;
				o.parentNode.mnick = data.mnick;
				
				if(modifyBtns.length !== 0){
					modifyBtns.forEach((btn,i)=>{
						infoBar(btn, '수정하기');
						if(i===0){
							btn.addEventListener('click', (e)=>{
								
								const target = e.currentTarget;
								const modifyTarget = target.previousSibling;
								const modifyTargetClass = modifyTarget.classList[0];
								
								const modifyInput = `
									<input type="text" style="
									width: 158px;
									vertical-align: middle;
									display: inline-block;
									margin: 0 !important;
									" class="grayBtn" name="${modifyTargetClass}" value="${modifyTarget.innerHTML}" placeholder="일정명"/>
									<input type="button" style="
									display: inline-block;
									width: max-content;
									height: 28px;
									margin: 0 !important;
									" class="grayBtn" value="적용"/>
								`;
								
								modifyTarget.innerHTML = modifyInput;
								modifyTarget.querySelector('input[type=button]').addEventListener('click',(e)=>{
									const wbtitle = modifyTarget.querySelector('input[type=text]').value;
									
									if(!wbtitle){
						    			boxFun('정보가 누락되었습니다.', false, false, false, 'fail', false, true);
						    			return;
									}
									
									xhrLoad('post','titleupdate', { wno : o.parentNode.wno, mnick : o.parentNode.mnick, wbtodono : selectno, wbtitle }, (res)=>{
			    		    			if(res){
			    		    				client.send('/pub/wbtitleup',{},res);
			    		    			}
			    		    		});
								});
								
							});
						} else if(i===1){
							 const calConfig = {
						    		    mode: 'range',
						    		    dateFormat: "Y-m-d",
						    		    onChange : function(selectedDates, dateStr, instance){
						    		    	
						    		    	const p = instance.input.parentNode;
						    		    	
						    		    	
						    		    	var wbstartdate = p.querySelector('.wbstartdate');
							    			var wbenddate = p.querySelector('.wbenddate');
							    			
							    			if(!wbstartdate || !wbenddate){
								    			boxFun('정보가 누락되었습니다.', false, false, false, 'fail', false, true);
								    			return;
											}
							    			
							    			
						    		    	if(selectedDates.length === 2){
						    		    		
						    		    		const dateArray = dateStr.split('to');
						    		    		
						    		    		const startDate = dateArray[0].trim();
						    		    		const endDate = dateArray[1].trim();
						    		    		
						    		    		xhrLoad('post','dateupdate', { wno : o.parentNode.wno, mnick : o.parentNode.mnick, wbtodono : selectno, wbstartdate : startDate, wbenddate : endDate }, (res)=>{
						    		    			
						    		    			if(res){
						    		    				client.send('/pub/wbdateup',{},res);
						    		    			}
						    		    		});
						    		    		
						    		    	}
						    		    }
						    		};
					    	  
					    	  //플랫피커 호출 
					    	  let cal1 = $(btn).flatpickr(calConfig);
						}
						
					});
						
					wbcontentDiv.addEventListener('click', modifyEvent);
					
				}
				
			}
			
		});
		
		
	});
	

	
		// 2번째,배경 투명 = false, 검정 = true/ true 4번째 취소버튼 없애기
	const box = boxFun('<span>일정</span><span><img src="https://img.icons8.com/wired/64/000000/delete-forever.png"/></span>', false, [ writeContent ],false,'wbinnerBox',(o)=>{
		const firstP = o.querySelector('p');
		firstP.querySelector('span').setAttribute('style','vertical-align: middle;');
		const deleteBtn = firstP.querySelector('img');
		deleteBtn.setAttribute('style',`
    height: 20px;
    padding: 2.5px;
    vertical-align: middle;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin: 0 8px;`);
		infoBar(firstP,'삭제하기');
		
		deleteBtn.addEventListener('click',(e)=>{
			
			const wbinnerbox = e.target.parentNode.parentNode.parentNode;
			
			const submit = addObject(null, 'input', 'grayBtn', false, (o)=>{
				o.type = 'button';
				o.value = '삭제';
				o.style.width = 'max-content';
				o.style.marginRight = '5px';
				o.addEventListener('click',(e)=>{
					
					xhrLoad('get', 'wbdelete', { wno : wbinnerbox.wno, mnick : wbinnerbox.mnick, wbtodono : wbinnerbox.wbtodono }, (res)=>{
						
						if(res){
							client.send('/pub/wbdelete', {}, res);
							motionOnOff(e.target.parentNode, 0.8, false, { setting : 'offDefault' }, null, o=>{
								o.remove();
							});
							motionOnOff(wbinnerbox, 0.8, false, { setting : 'offDefault' }, null, o=>{
								o.remove();
							});
							
						}
						
					});
					
				});
			});
			
			boxFun('해당 일정을 삭제하시겠습니다.', false, [submit], false, 'deleteCheck', false, true).closeDisabledDelete(e.target);
			
		});
		
	},true);
	
	
	
	

}


//달력 자르기 기능 
function confirmbtn(that){
	
	// 수정
	
	const wblistobj = that.parentNode.parentNode.parentNode;
	
	//날짜
	var a =  wblistobj.getElementById('rangeDate').value;
	var st = a.replace("to"," ");
	var tri = st.trim(); //공백제거 안먹힘 ~ 
	var arr = tri.split("-");
	var day = arr[2].substr(0,2);//2번쨰 배열에 일 까지 
	var day2 = arr[2].substr(4,5);//2번째 배열에 연도까지 
	
	var wbst = arr[0]+arr[1]+day;
	var wben = day2+arr[3]+arr[4];
	
	console.log("이젠 나오나 보자  "+wbst +"끝날짜 "+ wben);
	
	wblistobj.querySelector('#wbstartdate1').value= wbst;
	wblistobj.querySelector('#wbenddate1').value= wben;
	

}	

	
	