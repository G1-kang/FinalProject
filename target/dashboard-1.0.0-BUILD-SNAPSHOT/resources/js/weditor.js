


function editorStart(widget){
	
	const widgetContent = widget.querySelector('.widgetContent');
	
	widgetContent.addEventListener('mouseover',(e)=>{
		widget.style.cursor = 'default';
	});
	
	const randomNum = Math.floor(Math.random() * (10000)) + 0;
	
	//코드 작성 div
	const container = addObject(widgetContent, 'div', 'container', true, (o)=>{
		o.innerHTML = `<div id="editor${randomNum}" class="editor"></div>
		<iframe id='iframe' frameBorder="1"></iframe>`
	});
	
	const runBtn = addObject(null, 'button', 'grayBtn', false, (o)=>{
		o.id = 'run';
		o.innerHTML = '코드 실행';
	});
	
	widgetContent.insertBefore(runBtn,container);
	
	editorSetup(widget, randomNum);

}


function editorUpdate(widget){
	
	var idoc = widget.querySelector('#iframe').contentWindow.document;
	
	idoc.open();
	idoc.write(widget.editor.getValue());
	idoc.close();

}

function editorSetup(widget, randomNum){
	
	const wno =  widget.info.wno;
	
	widget.editor = ace.edit(`editor${randomNum}`, {
		mode: "ace/mode/javascript",
		selectionStyle: "text"
	});
	
	
	let oldCode = `
<!DOCTYPE html>
<html>
<head>
</head>

<body>
</body>

</html>`;
	
	if(!widget.info.preview){
	
		xhrLoad('get', 'widget/wcode/'+wno, null, (res)=>{

			if(res){
				const wcode = JSON.parse(res);
				oldCode = wcode.wecontent;
			}

		}, false);


		widget.websocket.codeClient = client.subscribe('/sub/wcode/' + wno,(res)=>{

			const code = JSON.parse(res.body);

			if(code.mid !== userInfo.mid){

				if(code.status === 'complete'){

					const container = widget.querySelector('.container');

					container.removeAttribute('style');

					widget.editor.setValue(code.wecontent);

					const blockBox = container.querySelector('.blockBox');

					motionOnOff(blockBox, 0.8, false, { setting : 'offDefault' }, null, (o)=>{
						o.remove();
					});

				} else {
					const container = widget.querySelector('.container');

					let blockBox = container.querySelector('.blockBox');

					if(!blockBox){

						blockBox = addObject(null,'div','blockBox',false,(o)=>{

							o.setAttribute('style', `
									display: block;
									opacity : 0;
									position: absolute;
									transition-duration: 0.8s;
									z-index: 8;
									top : 0;
									left : 0;
									width: 100%;
									height: 100%;
							background-color: #00000080;`);
							const alarmP = addObject(o, 'p', null, true, (o)=>{
								o.innerHTML = '누군가 작성중입니다.';
								o.style.position = 'absolute';
								o.style.color = '#fff';
								o.style.width = 'max-content';
								o.style.top = '50%';
								o.style.left = '50%'
									o.style.transform = 'translateX(-50%) translateY(-50%)'
							});

						});

						container.appendChild(blockBox);

						motionOnOff(blockBox,0.8, false, { setting : 'onDefault' });

						container.setAttribute('style','pointer-events: none;');

					}
				}
			}

		});
	}
	widget.editor.setTheme("ace/theme/monokai");
	
	widget.editor.session.setMode("ace/mode/html");
	
	widget.editor.setValue(oldCode,1); 
	
	widget.querySelector('#run').addEventListener('click',(o)=>{
		editorUpdate(widget);
	});

	widget.editor.setOptions({
		fontSize: "9pt",
		showLineNumbers: true,
		showGutter: true,
		vScrollBarAlwaysVisible:true,
		enableBasicAutocompletion: true, 
		enableLiveAutocompletion: true
	});

	widget.editor.setShowPrintMargin(false);
	widget.editor.setBehavioursEnabled(false);
	widget.editor.focus();
	
	
	if(!widget.info.preview){
		const inputBar = widget.querySelector('textarea');

		inputBar.addEventListener('input',(e)=>{

			const wno =  widget.info.wno;
			const wecontent = widget.editor.getValue();

			if(inputBar['saveTimeoutCheckId']) {

				client.send('/pub/wcode', {}, JSON.stringify({
					wno,
					mid: userInfo.mid,
					status : 'writing'
				}));

				window.clearTimeout(inputBar['saveTimeoutCheckId']);
			}

			inputBar['saveTimeoutCheckId'] = window.setTimeout(()=>{

				xhrLoad('post','widget/wcode', { wno, wecontent }, (res)=>{

					if(res){

						boxFun('코드가 저장되었습니다.', false, false, false, 'codesave', false, true);

						client.send('/pub/wcode', {}, JSON.stringify({
							wecontent,
							wno,
							mid: userInfo.mid,
							status : 'complete'
						}));

					} else {
						boxFun('잘못된 접근입니다.');
					}

				});

			},3000);

		});
	}
  
}
