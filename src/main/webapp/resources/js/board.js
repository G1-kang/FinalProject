/**
 * http://usejsdoc.org/
 */


let userInfo;
let dashboardInfo = {};
let addClient;
let client;


// 선택한 대시보드 조회
function selectDashBoardLoad(){
	
	
	// 대시보드 정보 객체
	dashboardInfo = {};	
	
	// 대시보드 조회 ( 특정 대시보드를 조회하고자 할때 첫번째 인자로 대시보드 번호 입력 )
	xhrLoad('get', 'board/select' + (arguments[0]? '/'+arguments[0] : '') , null, (res)=>{
		
		const jsonObj = JSON.parse(res);
		
		dashboardInfo.dashboard = jsonObj;
		
		const dashboard = document.querySelector('.dashboard');
		
		dashboard.dataset.dno = jsonObj.dno;
		
		const dashOpenItem = document.querySelectorAll('._dashItem');
		
		const selectDash = document.querySelector('.selectDash');
		
		// 열어 놓은 대시보드 작업 표시줄에서 선택한 대시보드 표시
		dashOpenItem.forEach(item=>{
			
			if(Number(item.dataset.dno) === jsonObj.dno){
				
				if(selectDash) selectDash.classList.remove('selectDash');
				
				item.classList.add('selectDash');
			}
			
		});
		
		// 조회한 대시보드의 권한 설정 조회
		xhrLoad('get', 'board/rules', null, (res)=>{
			
			dashboardInfo.dashgrade = JSON.parse(res);
			
			
			// 조회한 대시보드 맴버 설정 조회
			xhrLoad('get', 'board/members', null, (res)=>{
				
				dashboardInfo.dashmember = JSON.parse(res);
				
			},false);
			
		}, false);
		
		const widgetArea = dashboard.querySelector('#widgetArea');
		
		// 로그인한 유저가 해당 대시보드에서 가지는 맴버 설정
		dashboardInfo.dashmember.forEach(member=>{
			if(member.mid === userInfo.mid){
				userInfo.dashmember = member;
				return;
			}
		});
		
		// 로그인한 유저가 해당 대시보드에서 가지는 권한 설정
		dashboardInfo.dashgrade.forEach(grade=>{
			if(grade.dgno === userInfo.dashmember.dgno){
				userInfo.dashgrade = grade;
				return;
			}
		});
		
		
		// 위젯 로드
		widgetload();
		
		
		// widget이 추가되 었을 떄에 대한 동기화 구독 ( 대시보드 맴버 추가 및 위젯 추가 )
		addClient = client.subscribe('/sub/wadd/'+ dashboardInfo.dashboard.dno, (res)=>{
			
			const addInfo = JSON.parse(res.body);
			
			let widgetCheck = false;
			
			const widgets = document.querySelectorAll('.widget');
			
			// 위젯 존재여부 체크
			widgets.forEach(widget=>{
				
				if(widget.info.wno === addInfo.wno){
					widgetCheck = true;
				}
				
			});
			
			// 위젯이 존재하지 않을 시
			if(!widgetCheck){
				
				let ruleCheck = false;
				
				const widgetArea = document.querySelector('#widgetArea');
				
				// 위젯 추가 함수
				function addWidget(addInfo){
					
					// 새로 추가되어야 하는 위젯 정보 조회
					xhrLoad('get', 'widget/'+ addInfo.wno, null, (res)=>{
						
						const w = widgetSettingFun(JSON.parse(res));
						
						motionOnOff(w, 1, false, { onOff : 'on', opactiy : { num0 : 0, num1: 1 } }, {
							after : (o)=>{
								widgetArea.appendChild(o);
							}
						}, (o)=>{
							o.style.transitionDuration = '';
						});
						
						// 새로 조회해서 추가된 Widget에 대한 이벤트 연결
						w.mouseEventFun();
						w.scaleEventFun();
						w.contextMenuAddFun();
						w.cateFun();
						widgetGradeCheck(w);
					});
				}
				
				
				// 추가된 위젯 Rule에 개인 권한 설정에 자신의 아이디가 있는지 확인
				addInfo.rules.forEach(rule=>{

					if(rule.mid === userInfo.mid){
						ruleCheck = true;
						addWidget(addInfo);
						return;
					}

				});

				// 자신의 아이디 값이 없을 시, 그룹 권한에 자신의 권한이 속해 있는지 확인
				if(!ruleCheck){
					const dggrade = userInfo.dashgrade.dggrade;
					addInfo.rules.forEach(rule=>{
						if(rule.wrmax >= dggrade && rule.wrmin <= dggrade){
							addWidget(addInfo);
							return;
						}
					});
				}
			}
		});
		
		
	},false);
	
}

//현재 열어 놓은 대시보드 목록 조회 함수
function openDashBoardList(){
	
	// 현재 열어 놓은 대시보드 목록 조회
	xhrLoad('get', 'board/selectList', null, (res)=>{
		
		const jsonObj = JSON.parse(res);
		
		
		const _ul = document.querySelector('._ul');
		const nickName_li = document.querySelector('.nickName_li');
		
		const _dashLi = addObject(null, 'li', '_dashLi', false, (o)=>{
			
			_ul.insertBefore(o, nickName_li);
			
			const _dashUl = addObject(o, 'ul', '_dashUl', true, (o)=>{
				
				jsonObj.forEach(item => {
					
					// 작업 표시줄에서 대시보드 아이템 생성
					addObject(o, 'li', '_dashItem', true, (o)=>{
						
						o.dataset.dno = item.dno;
						o.style.float.left;
						o.innerHTML = `${item.dtitle}<a href="#" onclick = "return false;"><span class="dashboardCloseBtn">X</span></a>`;
						
						// 대시보드 닫기 버튼
						const dashboardCloseBtn = o.querySelector('.dashboardCloseBtn');
						
						
						// 버튼 이벤트 연결
						dashboardCloseBtn.addEventListener('click', (e)=>{
							
							e.preventDefault();
							e.stopPropagation();
							
							const dashItem = e.target.parentNode.parentNode;
							const dno = dashItem.dataset.dno;
							
							// 로그인한 세션에서 열어 놓은 대시보드 번호들 중에서 선택 대시보드 번호 삭제
							xhrLoad('get', 'board/dashboardClose', { dno }, (res)=>{
								
								const resNo = Number(res)
								
								if(resNo > 0){
									const dashboard = document.querySelector('.dashboard');
									
									if(dashboard.dataset.dno === dno){
										
										const widgets = document.querySelectorAll('.widget');
										
										// 위젯에 연결된 구독 연결 해제
										addClient.unsubscribe();
										widgetWebSocketClose(widgets);
										
										selectDashBoardLoad();
									}
									
									// 작업표시줄에서 해당 대시보드 삭제
									dashItem.remove();
									
									
								} else {
									
									// 만약 닫은 대시보드가 열려져 있는 대시보드 중 마지막이라면 마이페이지로 이동
									location.href = '/dashboard';
								}
								
							});
							
						});
						
						// 대시보드 선택 이벤트
						o.addEventListener('click', (e)=>{
							
							e.preventDefault();
							e.stopPropagation();
							
							const widgets = document.querySelectorAll('.widget');
							
							// 위젯에 연결된 구독 연결 해제
							addClient.unsubscribe();
							widgetWebSocketClose(widgets);
							
							// 선택한 대시보드 조회
							selectDashBoardLoad(e.target.dataset.dno);
							
						});
					});
					
				});
				
				
			});
			
		});
		
	});
}

window.onload = ()=>{
	
	// WebSocket 연결
	const sock = new SockJS('broker');
	
	// WebSocket 접근 클라이언트 객체 생성
	client = Stomp.over(sock);
	
	// 연결
	client.connect({},()=>{
	
		// 연결 성공 했을시 아래 CallBack 실행
		
		// 로그인 유저 조회
		userInfo = headerFun();

		
		const con = document.querySelector('#content');

		// 대시보드 생성
		const dashboard = addObject(con, 'div', 'dashboard', true, (o)=>{
			o.innerHTML = `
				<div style = "display:block; position:relative; top :0; left:0; width:100%; height:34px;"></div>
				<div id = "widgetArea"></div>
				`;
		});

		
		// 현재 유저가 열어 놓은 대시보드 작업표시줄 확인
		openDashBoardList();
		
		// 선택해서 화면에 보여줄 대시보드 조회
		selectDashBoardLoad();

		
		
		const widgetArea = document.querySelector('#widgetArea');


		// scroll bug fix
		widgetArea.addEventListener('scroll', function() {

			if(widgetArea.scrollHeight - widgetArea.clientHeight - Math.floor(widgetArea.scrollTop) <= 1){
				widgetArea.scrollTop = widgetArea.scrollTop-3;
			}

		});

		// 위젯 영역에서의 커스텀 메뉴
		contextMenuFun(widgetArea, {
			'new' : {
				'새 위젯 만들기' : ()=>{
					widgetAddAndModify();
				}
			},
			'myInfo' : {
				'로그아웃' : ()=>{logout();}
			}

		});
		
		
		// 대시보드 업데이트에 대한 동기화  구독 ( 대시보드 소유자 업데이트 했을 시 반응 )
		upDashClient = client.subscribe('/sub/upDash/'+userInfo.mno, (res)=>{
			
			const body = JSON.parse(res.body);
			
			// 작업 표시줄 대시보드에 업데이트 적용
			const _dashItems = document.querySelectorAll('li._dashItem');
			
			_dashItems.forEach(item=>{
				
				const dno = Number(item.dataset.dno);
				if(dno === body.dno){
				
					const tmp = item.innerHTML.split('<a');
					item.innerHTML = body.dtitle + '<a' + tmp[1];
					return;
				}
				
			});
			
			// 대시보드 업데이트에 대한 재 조회
			selectDashBoardLoad();
			
			
			// 대시보드 권한 테이블 변경에 대한 위젯 권한 변경 적용
			const widgets = document.querySelectorAll('.widget');
			
			dashboardInfo['dashmember'].forEach(member=>{
				
				const { dggrade, dgalias, dmcolor, mnick } = member;
				
				// 권한 변경 적용
				widgets.forEach(widget=>{
					
					widget.info.rules.forEach(rule=>{
						
						let chk = false;
						
						if(rule.mnick === mnick){
							
							if(rule.dggrade !== dgrrade){
								rule.dggrade = dgrrade;
								chk = true;
							}
							
							if(rule.dgalias !== dgalias){
								rule.dgalias !== dgalias;
								chk = true;
							}
							
							rule.dmcolor = dmcolor
						}
						
						if(chk){
							xhrLoad('post', 'widget/wrule/modify', rule, (res)=>{

								if(res) console.log('wrule 수정 성공');

							});
						}
						
					});
					
				});
				
			});
			
		});
		
		
		
		// 대시보드 삭제에 대한 동기화 구독 ( 소유자에 의한 대시보드 삭제 및 권한 회수 )
		delDashClient = client.subscribe('/sub/delDash/'+userInfo.mno, (res)=>{
			
			const body = JSON.parse(res.body);
			
			const _dashItems = document.querySelectorAll('li._dashItem');
			
			_dashItems.forEach((item,i)=>{
				
				if(Number(item.dataset.dno) === body.dno){
					
					
					// 로그인한 세션에 등록되어 있는 열려져 있는 대시보드 번호들 중에서 삭제되는 대시보드 번호 조회 하여,
					// 해당 번호 제외 및 열려 있는 번호가 삭제된 번호와 같은 경우 열어 놓은 대시보드들 중 첫번째 대시보드 자동 선택
					xhrLoad('get', 'board/dashboardClose', { dno : body.dno }, (res)=>{
						
						const resNo = Number(res)
						
						if(resNo > 0){
							
							const dashboard = document.querySelector('.dashboard');
							
							if(Number(dashboard.dataset.dno) === body.dno){
								
								const body = document.querySelector('body');
								
								// 권한 변경을 알리는 메시지 창
								const alertDiv = addObject(body, 'div', 'alertDiv', true, (o)=>{
									o.innerHTML = `<pre class="dashAlert">해당 대시보드에 삭제 혹은 권한 변경이 이루어졌습니다.</pre>`;
								});
								
								motionOnOff(alertDiv, 0.8, false, { setting : 'onDefault' });
								
								window.setTimeout(()=>{
									
									motionOnOff(alertDiv, 0.8, false, { setting : 'offDefault' }, null, (o)=>{
										
										o.remove();
										
										const widgets = document.querySelectorAll('.widget');
										
										// 웹 소켓 연결 해제
										addClient.unsubscribe();
										widgetWebSocketClose(widgets);
										
										selectDashBoardLoad();
										
									});
									
								},2000);
								
							}
							
							motionOnOff(item, 0.8, false, { setting : 'offDefault'}, null, (o)=>{
								o.remove();
							});
							
						} else {
							location.href = '/dashboard';
						}
						
					});
					
					return;
				}
			});
			
		});
		
	});
	
};