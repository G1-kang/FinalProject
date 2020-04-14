/**
 * http://usejsdoc.org/
 */

// 모든 위젯 배열
let widgets = []


// 모든 위젯에 연결되어 있는 구독 해제
function widgetWebSocketClose(widgets){
	widgets.forEach(widget=>{
		widget.websocket.close();
	});
}


// 위젯 셋팅 함수 ( 위젯 셋팅할 객체, 업데이트 할 시 )
// 좀 더 정확히는 위젯 객체의 권한 정보를 토대로
// 해당 대시보드의 권한 정보와 매칭 시켜서
// 사용하기 편하게 위젯 객체 info 속성의 rules 배열에 필요 정보 주입하는 함수
function widgetSettingFun(widgetSetting, updateTarget){
	
	let widget
	
	if(!updateTarget) widget = widgetFun(widgetSetting);
	else widget = updateTarget;
	
	
	const dashmember = dashboardInfo.dashmember;
	const dashgrade = dashboardInfo.dashgrade;
	
	widget['info'].rules.forEach(rule=>{
		
		if(rule.wrcategory === 'individual'){
			
			dashmember.forEach(member=>{
				if(member.mid === rule.mid){
					
					const {mnick, mimgpath, dmcolor, dggrade, dgalias} = member;
					
					rule.mnick = mnick;
					rule.mimgpath = mimgpath;
					rule.dmcolor = dmcolor;
					rule.dggrade = dggrade;
					rule.dgalias = dgalias;
				
				}
			});
			
		} else {
			
			dashgrade.forEach(grade=>{
				
				if(grade.dggrade === rule.wrmax) {
					rule.maxdgalias = grade.dgalias;
					rule.maxdgcolor = grade.dgcolor;
				}
				
				if(grade.dggrade === rule.wrmin){
					rule.mindgalias = grade.dgalias;
					rule.mindgcolor = grade.dgcolor;
				}
				
			});
		}
		
	});
	
	if(!updateTarget) {
		widgets.push(widget);
	}
	
	return widget;
}


// 대시보드에 종속되어 있는 모든 위젯 로드
function widgetload(){
	
	// 대시보드 초기화
	const widgetArea = document.querySelector('#widgetArea');
	
	let oldWidgets = widgetArea.querySelectorAll('.widget');
	
	oldWidgets.forEach(w=>{
		
		// 위젯이 에디터일 연결되어 있는 세션에서 해당 에디터 초기화
		if(w.info.wcategory === 'CODE'){
			w.editor.getSession().setUndoManager(new ace.UndoManager());
		}
		
		motionOnOff(w, 1, false, { onOff : 'off', opactiy : { num0 : 0 } }, null, (o)=>{
			o.remove();
		});
	});
	
	// 선택 대시보드에 종속된 위젯 로드
	xhrLoad('get','widget/list', null, (res)=>{
		
		const widgetSettings = JSON.parse(res);
		
		for(let widgetSetting of widgetSettings){
			
			const widget = widgetSettingFun(widgetSetting);
			
			motionOnOff(widget, 1, false, { onOff : 'on', opactiy : { num0 : 0, num1: 1 } }, {
				after : (o)=>{
					widgetArea.appendChild(o);
				}
			}, (o)=>{
				o.style.transitionDuration = '';
			});
			
			// 만들어진 위젯에 대한 이벤트 및 웹소켓 구독 연결
			widget.mouseEventFun();
			widget.scaleEventFun();
			widget.contextMenuAddFun();
			widget.cateFun();
			widgetGradeCheck(widget);
		}
	});
	
}