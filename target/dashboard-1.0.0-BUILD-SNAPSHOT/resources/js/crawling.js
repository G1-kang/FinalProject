
function wcralingBox(widget){
	
	const widgetContent = widget.querySelector('.widgetContent');
	widgetContent.innerHTML = `
	<div class="wcrSearch">
		<input type="text" class="wcrKeyword" />
		<img src="./resources/images/crwl_2.png"/>
		<img src="./resources/images/crwl_1.png"/>
	</div>
	
	<div class="wcrContainer" data-keyword></div>
	`;
	
	widgetContent.addEventListener('mousemove',(e)=>{
		widget.style.cursor = 'default';
	});
	
	const wcrSearch = widgetContent.querySelector('.wcrSearch');
	
	const wcrKeyword = widgetContent.querySelector('.wcrKeyword');
	const refresh = wcrSearch.querySelector('img:nth-child(2)');
	
	refresh.addEventListener('click', (e)=>{
		client.send('/pub/wcrkeyword',{},JSON.stringify({ wno : widget.info.wno, keyword : wcrKeyword.value }));
	});
	
	const search = wcrSearch.querySelector('img:nth-child(3)');
	
	search.addEventListener('click', (e)=>{
		client.send('/pub/wcrkeyword',{},JSON.stringify({ wno : widget.info.wno, keyword : wcrKeyword.value }));
	});
	
	client.subscribe('/sub/wcrkeyword/'+widget.info.wno, (res)=>{
		const resObj = JSON.parse(res.body);
		console.log(resObj);
		wcrKeyword.value = resObj.keyword;
		crawling(widget, search);
	});
	
}

function crawling(widget, btn) {
	
	var container = widget.querySelector(".wcrContainer");


	// dataset에 기존 검색하던 키워드가 있는지 확인
	let searchkw = widget.querySelector(".wcrKeyword").value;

	if (!searchkw) {
		
		boxFun("검색어를 입력해주세요").closeDisabledDelete(btn);
		
	} else {
		
		// ajax시 기존 존재하던 row 삭제
		container.innerHTML = '';
		
		// 비동기 통신
		var xhr = new XMLHttpRequest();

		xhr.onreadystatechange = function() {
			
			if (xhr.readyState === 4) {
				
				if (xhr.status === 200) {

					console.log("status===============>통신 성공");

					var json = JSON.parse(xhr.responseText);

					for (var i = 0; i < json.length; i++) {
						
						const con = widget.querySelector('.wcrContainer');
						
						const div = addObject(con, 'div', 'crawlingItem', true, (o)=>{
														
								let logoSrc = '';
																	
									if (json[i]['wcrwlfrom'] === "twitter") {
										logoSrc = 'https://ssl.pstatic.net/sstatic/search/img3/ico_twitter2.gif';
										
									} else if (json[i]['wcrwlfrom'] === "naver"){
										logoSrc = 'https://developers.naver.com/inc/devcenter/images/naver_square_20x20.png';
										
									} else if (json[i]['wcrwlfrom']==="vlive"){
										logoSrc = 'https://ww.namu.la/s/3bdbedcac838797a44c9492ecf5e0f910624e34167813d63768ece5ef1bf444a02eacec88be90cda77716a27dcda79423185ae72a677b941c339bc42383fa155c14e6b8d976ee3f7b42dafcdc12229d7ecf635f0ff6f9527aedb1e8b757ce6b2';
									}
								
								o.innerHTML =`
										<div class="crawlingHeader"><img class="crawlingLogo" src="${logoSrc}"/>
										<span class ="wcrwlwriter">${json[i]['wcrwlwriter']}</span></div>
										<div class="crawlingItemCon">		
											<p class ="wcrwlcontent">${json[i]['wcrwlcontent']}</p>
											<p class="wcrwldate">${json[i]['wcrwldate']}<a href = "${json[i]['wcrwllink']}" target="_blank"><img src = 'https://ssl.pstatic.net/sstatic/search/pc/img/sp_sns.png' /></a></p>
										</div>`;
						});
					}

				}
			}
		};

		xhr.open("POST", "./crwl?keyword=" + searchkw, true);
		xhr.send(null);
	}

}
