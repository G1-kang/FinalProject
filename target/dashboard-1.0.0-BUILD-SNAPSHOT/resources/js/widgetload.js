/**
 * http://usejsdoc.org/
 */

let widgets = []

function widgetWebSocketClose(widgets){
	widgets.forEach(widget=>{
		widget.websocket.close();
	});
}

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
	
	console.dir(widget);
	
	return widget;
}

function widgetload(){
	
	// 대시보드 초기화
	const widgetArea = document.querySelector('#widgetArea');
	
	let oldWidgets = widgetArea.querySelectorAll('.widget');
	
	oldWidgets.forEach(w=>{
		
		if(w.info.wcategory === 'CODE'){
			console.log('dd')
			w.editor.getSession().setUndoManager(new ace.UndoManager());
		}
		
		motionOnOff(w, 1, false, { onOff : 'off', opactiy : { num0 : 0 } }, null, (o)=>{
			o.remove();
		});
	});
	
	// 로드
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
			
			widget.mouseEventFun();
			widget.scaleEventFun();
			widget.contextMenuAddFun();
			widget.cateFun();
			widgetGradeCheck(widget);
		}
	});
	
}