/**
 * http://usejsdoc.org/
 */


//
window.onload = ()=>{
	

	const div = document.querySelectorAll('div');
	
	div[0].addEventListener('keypress', function(e){
		
		if(e.keyCode === 13){
			document.execCommand('formatBlock', false, 'p');
		}
		
	});
	
	div[1].addEventListener('keypress', function(e){
		
		
	});
	const boldBtn = document.querySelector('.boldBtn');
	
	boldBtn.addEventListener('click', (e)=>{
		document.execCommand('bold');
		
	});
	/*
	 
====>	1. addObject	<===================================================================================
	
	일정 동작을 한 후 객체가 만들어진다거나 할때 상용하면 조금이나마 편함
	코드 길이가 길어지는 것을 방지하기 위함,
	단점으로는 코드가 들여쓰기가 깊어질 우려가 있음,
	이 함수 자체로는 응용 범위가 좁음
	
	리턴 값은 자기 자신 
	const object = addObject(부모 객체, 태그 네임, 클래스 네임/배열로 다중 클래스네임 가능 , 기본 위치, 콜백함수(만들어진 객체));
	
	>> 원래 문법
	const body = document.querySelector('body');
	const div = document.createElement('div');
	div.classList.add('textClass');
	div.innerHTML = '으악!';
	body.appendChild(div);
	
	
	
	>> addObject 치환
	const body = document.querySelector('body');
	addObject(body, 'div', 'textClass', true, (o)=>{
		o.innerHTML = `으악!`;
	});
	
	
	
	ex 1) 섹션 태그 만들기
	const body = document.querySelector('body');
	const object = addObject(body, 'section', 'testSection', true, null);

	 
	ex 2) 도큐먼트 내에 존재하는 오브젝트 만들기
	const object = addObject(null, 'div', 'beanDiv', false, null);
	-> 첫번째 인자가 null이거나 false면 디폴트 위치인 네번째 인자도 false이어야 한다.
	
	ex 3 ) 다중 클래스네임
	const object = addObject(null, 'div', [test1, test2, test3]);
	-> 만약 값이 들어간 인자 다음 오는 인자들이 전부 false 이나 null이면 생략 가능
	
	
====>	2. boxFun	<===================================================================================
	기본적인 DIV 태그의 박스 생성
	- 타이틀명
	- 본문
	- 닫기 버튼
	으로 구성
	
	-> 리턴 값으로 자기 자신
	const box = boxFun(박스 타이틀명, 백그라운드, 박스 내부에 추가할 오브젝트 배열, 
			    		기본으로 붙어있는 닫기버튼 삭제할지 유무, 클래스네임 설정, 콜백(박스 오브젝트, 박스가 포함하고 있는 자식 오브젝트, 박스 클래스명),
			    		기본적은 온오프 모션 설정 유무)
	
	-> 박스를 겹쳐서 만들기 위해서는 클래스네임을 필수로 지정해야 함
	-> 닫기 버튼 삭제 유무는 true가 삭제, false가 기본 버튼 생성
	
	
	ex 1) 기본적인 박스 만들기
	const box = boxFun('박스 테스트', true);
	
	
	ex 2 ) 박스 내부 꾸미기
	const inputText0 = addObject(null, 'input', 'testTextBar0', false, (o)=>{
		o.type = "text";
		o.value = "text0";
	});
	const inputText1 = addObject(null, 'input', 'testTextBar1', false, (o)=>{
		o.type = "text";
		o.value = "text1";
	});
	const inputText2 = addObject(null, 'input', 'testTextBar2', false, (o)=>{
		o.type = "text";
		o.value = "text2";
	});
	
	const box = boxFun('박스 테스트2', true, [ inputText0, inputText1, inputText2 ]);
	
	
	ex 3 ) 박스 여러개 만들기
	
	-- 기존
	const utilBox = document.createElement('div');
	utilBox.classList.add('utilBox');
	
	const backgroundDiv = document.createElement('div');
	backgroundDiv.classList.add('darkBg');
	
	const outputBox = document.createElement('div');
	outputBaox.classList.add('boxOpen');
	
	const innerBoxOpenBtn = document.createElement('button');
	innerBoxOpenBtn.value = '오픈';
	innerBoxOpenBtn. addEventListener('click', ()=>{
		
		const innerBox = document.createElement('div');
		innerBox.classList.add('boxOpen');
		innerBox.classList.add('innerBoxOpen');
		
		outputBox.appendChild(innerBox);
	
	});
	
	utilBox.appendChild(outputBox);
	utilBox.appendChild(backgroundDiv);
	 
	-> 닫기 버튼을 생략해도 이정도로 길어진다. 모션이나 기타 등등을 더 만들면 훨씬 길어진다.
	-> 이것을 아래 처럼 간단하게 표현 가능
	
	
	-- 치환
	const innerBoxOpenBtn = addObject(null, 'button', 'innerBoxOpen', false, (o)=>{
		o.value= '오픈';
		o.addEventListener('click', ()=>{
		
			boxFun('이너 박스', false, null, 'innerBox');
			
		});
	});
	
	const outputBox = boxFun('아웃풋 박스', true, [ innerBoxOpenBtn ]);
	
	 */
//	
//	const body = document.querySelector('body');
//	
//	// 인자 순서대로는 부모 객체, 태그 네임, 클래스네임, 디폴트 위치, 콜백(만든 객체 자신)
//	const section = addObject(body, 'section', 'section', true, (o)=>{ });
//	
//	// 첫번째 인자는 타이틀, 두번째 인자는 백그라운드
//	const inputText = addObject(null, 'input', 'mid', false, (o)=>{
//		o.type = 'text';
//	});
//	
//	const textarea = addObject(null, 'textarea', 'textarea', false, (o)=>{
//		o.style.display = 'block';
//		o.value = '테스트 중입니다.';
//		infoBar(o,'텍스트');
//	});
//	
//	const div = addObject(null, 'div', 'content', false, (o)=>{
//		
//		console.dir(o);
//		
//		o.innerHTML = `
//			<fieldset>
//				<legend>정보</legend>
//				${o.tagName}
//			</fieldset>
//		`;
//		
//		infoBar(o,'안녕');
//		
//	});
//	
//
//	
//	
//	const btn = addObject(null, 'button', 'grayBtn', false, (o)=>{
//		o.innerHTML = '박스에 박스 만들기';
//		o.addEventListener('click', ()=>{
//			
//			boxFun('박스에 박스', false, null, false, 'innerBox', null, true);
//			
//		});
//		
//	});
//	
//	boxFun('안녕하세요', true, [ inputText, textarea, div ,btn], true, 'testBox',(o, nodes, classname)=>{
//		
//	}, false);
//	
//	
//	//시계
//	const clock = addObject(null, 'div', 'clock',false,(o)=>{
//	
//		o.innerHTML = `
//			<iframe scrolling="no" frameborder="no" clocktype="html5" style="overflow:hidden;border:0;margin:0;padding:0;width:380px;height:80px;"src="https://www.clocklink.com/html5embed.php?clock=047&timezone=KoreaRepublicof_Seoul&color=purple&size=380&Title=&Message=&Target=&From=2020,1,1,0,0,0&Color=purple"></iframe>
//		`;
//	});
//	
//	boxFun('clock', true, [clock], true, 'testBox', (o,nodes,classname)=>{
//		
//	},false);
//	
//	
//	boxFun();
	
	new colorPickerFun();	
};