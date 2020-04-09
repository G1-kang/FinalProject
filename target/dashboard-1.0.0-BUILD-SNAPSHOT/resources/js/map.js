//const mapBody = document.querySelector('body');
//
//function start(){
//	const mapBtn = addObject(mapBody, 'button', 'mapWno', true,(o)=>{
//		o.innerHTML = '지도';
//		o.addEventListener('click', ()=>{
//			createTags();
//			o.remove();
//		});
//	});
//}
//
//start();

// view의 태그들을 생성
function createMap(widget){
	
	const widgetContent = widget.querySelector('.widgetContent');
	
	widgetContent.addEventListener('mouseover',(e)=>{
		widget.style.cursor = 'default';
	});
	
	const _map_wrap = addObject(widgetContent, 'div', 'map_wrap', true, (o)=>{
		o.innerHTML = `
		<div id="map"
			style="width: ${o.offsetWidth+'px'}; height: ${o.offsetHeight+'px'}; position: relative; overflow: hidden;"></div>

		<div id="menu_wrap" class="bg_white">
			<div class="option">
				<div id="searchBar">
						<input type="text" value="" id="keyword" size="15" placeholder="키워드를 입력해주세요">
						<span><input style="
    width: 11.5%;
    height: 11.5%;
    margin: 0.2%;
    padding: 2.5%;
    float: left;
						" type="button" class="grayBtn" value="">
						<img style="
    position: absolute;
    top: 0;
    right: 2%;
    width: 8%;
    margin: 1.5%;
						" src="https://img.icons8.com/office/50/000000/search.png"/></span>
				</div>
			</div>
			<hr>
			<ul id="placesList"></ul>
			<div id="pagination"></div>
			</div>`
	});
	
	
	const _map = widgetContent.querySelector('#map');
	const menu = widgetContent.querySelector('#menu_wrap');
	
	startMap(_map, menu, _map_wrap, widget);

}

//지도 생성
function startMap(_map,_menu, _map_wrap, widget){
	
	widget['map'] = {
			markers : [
				
			]
	};
	
	
	var mapContainer = _map, // 지도를 표시할 div
	
	mapOption = {
			center: new kakao.maps.LatLng(37.566826, 126.9786567), // 지도의 중심좌표
			level: 3 // 지도의 확대 레벨
	};  

//	지도를 생성합니다
	var map = new kakao.maps.Map(mapContainer, mapOption); 

	
	if(!widget.info.preview){
	
//		장소 검색 객체를 생성합니다
		var ps = new kakao.maps.services.Places();  

//		검색 결과 목록이나 마커를 클릭했을 때 장소명을 표출할 인포윈도우를 생성합니다
		var infowindow = new kakao.maps.InfoWindow({zIndex:1});

		
// 동기화 소켓 연결
		
		widget.websocket.makerClient = client.subscribe('/sub/wmarker/' + widget.info.wno,(res)=>{
			
			let markerArray;
			
			const markerInfo = JSON.parse(res.body);
			
			widget.map.markers.forEach(items=>{
				
				if(items[0].wmap.wmapno === markerInfo.wmapno){
					markerArray = items; 
				}
				
			});
			
			if(markerArray){
				
				markerArray[0].wmap = markerInfo;
				
				markerArray[2].onmouseover = function(){
					widget.map.displayInfowindow(markerArray[1], markerInfo, true);
				}
				
			} else {
				
				const markers = widget.map.makerCreateFun(markerInfo);
				
				widget.map.markers.push(markers);
				
			}
			
		});

		
		widget.websocket.makerDelClient = client.subscribe('/sub/wmarkerdel/' + widget.info.wno,(res)=>{
		
			let markerArray;
			
			const markerInfo = JSON.parse(res.body);
			
			widget.map.markers.forEach(items=>{
				
				if(items[0].wmap.wmapno === markerInfo.wmapno){
					markerArray = items; 
				}
				
			});
			
			if(markerArray){
			
				widget.map.removeMarker(markerArray[0], markerArray[1], markerArray[2]);
				
			}
			
		});
			
//		검색결과 목록 또는 마커를 클릭했을 때 호출되는 함수입니다
//		인포윈도우에 장소명을 표시합니다
		widget.map.displayInfowindow = function displayInfowindow(marker, item, modify) {
			
			const { wmapkeyword, wmapaddr, wmapjibun, wmapmemo, wmapno } = item;
			
//			var content = '<div class="markerMemo" data-wmapno="'+ wmapno +'"style="padding:5px;z-index:1;"><p>' + wmapkeyword + '</p><p>' + wmapaddr + '</p><p>' + wmapjibun + '</p><p>' + wmapmemo + '</p></div>';
			//console.log(marker);
			
			const content = addObject(null, 'div', 'markerMemo', false, (o)=>{
				
				o.dataset.wmapno = wmapno;
				o.style.padding = '5px';
				o.style.zIndex = 1;
				o.innerHTML = `
				<p class="wmapkeyword">${wmapkeyword}</p>
				<p class="wmapaddr">${wmapaddr}</p>
				<p class="wmapjibun">${wmapjibun}</p>
				<fieldset>
					<legend>메모</legend>
					<div class="wmapmemo">${brChange(wmapmemo,true)}</div>
				</fieldset>
				`
			});
			
			infowindow.setContent(content);
			
//			content.parentNode.style.position = 'relative';
			
			if(!modify) infowindow.open(map, marker);
		}

		// 검색결과 목록의 자식 Element를 제거하는 함수입니다
		function removeAllChildNods(el) {   
			while (el.hasChildNodes()) {
				el.removeChild (el.lastChild);
			}
		}
		
		
// 외부에서 사용할 함수
		
		widget.map.makerCreateFun = function markerCreateFun(item){
			
			const { wmapkeyword, wmapaddr, wmapjibun, wmapmemo, wmapno, wmaplat, wmaplng } = item;
			
			const markerPosition  = new kakao.maps.LatLng(wmaplat, wmaplng);
			
			const marker = addMarker(markerPosition);
			
			let divAjax = marker.pd.parentNode;
			
			let qsAjax = divAjax.querySelector('img');
			
			let chkAjax = addObject(divAjax, 'div', 'map_test', true, (o)=>{
				
				o.style.position = 'absolute';
				
				o.style.width = qsAjax.style.width;
				
				o.style.height = qsAjax.style.height;
				
				o.wmap = item;
				
			});


			clickMenu(chkAjax, marker, divAjax);
			
			chkAjax.onmouseover =  function () {
				
				widget.map.displayInfowindow(marker, item, false);
			};
			
			chkAjax.onmouseout =  function () {
				
				infowindow.close();
			
			};
			
			return [chkAjax, marker, divAjax];
			
		}
		
		widget.map.removeMarker = function removeMarker(fakeMarker,marker, markerDiv){

			fakeMarker.remove();
			markerDiv.remove();
			marker.setMap(null);

		}
		
		
		
//		키워드로 장소를 검색합니다
//		searchPlaces();

		openMarker();


//		키워드 검색을 요청하는 함수입니다
		function searchPlaces() {

			//console.log('enter search function');

			// var keyword = document.getElementById('keyword').value;
			var keyword = _menu.querySelector('#keyword').value;

			//console.log(keyword);

			if (!keyword.replace(/^\s+|\s+$/g, '')) {
				boxFun('키워드를 입력해주세요!', false, null, false, 'keywordNull', null, true);

				return true;
			}

			// 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
			ps.keywordSearch(keyword, placesSearchCB); 
		}

//		장소검색이 완료됐을 때 호출되는 콜백함수 입니다
		function placesSearchCB(data, status, pagination) {
			if (status === kakao.maps.services.Status.OK) {

				// 정상적으로 검색이 완료됐으면
				// 검색 목록과 마커를 표출합니다
				displayPlaces(data);

				// 페이지 번호를 표출합니다
				displayPagination(pagination);

			} else if (status === kakao.maps.services.Status.ZERO_RESULT) {

				boxFun('검색 결과가 존재하지 않습니다.', false, null, false, 'search', null, true);

			} else if (status === kakao.maps.services.Status.ERROR) {

				boxFun('검색 오류', false, null, false, 'error', null, true);

			}
		}

//		검색 결과 목록
		function displayPlaces(places) {

			var listEl = widget.querySelector('#placesList'),
			menuEl = widget.querySelector('#menu_wrap'),
			fragment = document.createDocumentFragment(), 
			bounds = new kakao.maps.LatLngBounds(), 
			listStr = '';

			// 검색 결과 목록에 추가된 항목들을 제거합니다
			removeAllChildNods(listEl);

			// 지도에 표시되고 있는 마커를 제거합니다
			// removeMarker();

			for (var i=0; i<places.length; i++) {

				// 마커를 생성하고 지도에 표시합니다

				var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x);        
				// marker = addMarker(placePosition, i),
				var itemEl = getListItem(i, places[i]); // 검색 결과 항목 Element를 생성합니다

				// 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
				// LatLngBounds 객체에 좌표를 추가합니다
				bounds.extend(placePosition);

				fragment.appendChild(itemEl);

			}

			// 검색결과 항목들을 검색결과 목록 Element에 추가합니다
			listEl.appendChild(fragment);
			menuEl.scrollTop = 0;

			// 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
			map.setBounds(bounds);
		}

//		검색결과 항목을 Element로 반환하는 함수입니다
		function getListItem(index, places) {


			var el = document.createElement('li'),
			itemStr = '<span class="markerbg marker_' + (index+1) + '"></span>' +
			'<div class="info">' +
			'<h5 class="name">' + places.place_name + '</h5>';

			if (places.road_address_name) {
				itemStr += '<span class="addr">' + places.road_address_name + '</span>' +
				'<span class="jibun gray">' +  places.address_name  + '</span>';
			} else {
				itemStr += '<span>' +  places.address_name  + '</span>'; 
			}

			itemStr += '  <span class="tel">' + places.phone  + '</span>' + '</div>';           

			el.innerHTML = itemStr;
			el.className = 'item';

			var placePosition = new kakao.maps.LatLng(places.y, places.x);
			// click시 마커 추가
			el.addEventListener('click',function(){

				let wmapkeyword = _menu.querySelectorAll('.name')[index].innerText;
				let wmapaddr = _menu.querySelectorAll('.addr')[index].innerText;
				let wmapjibun = _menu.querySelectorAll('.jibun')[index].innerText;
				let wmaplat = placePosition.getLat().toString();
				let wmaplng = placePosition.getLng().toString();  


				addMemo(wmapkeyword, wmapaddr, wmapjibun, wmaplat, wmaplng);

			});

			return el;

		}



		function addMemo(wmapkeyword, wmapaddr, wmapjibun, wmaplat, wmaplng){

			let textarea = addObject(null, 'textarea', 'memo', false);

			let btn = addObject(null, 'button', 'grayBtn', false, (o)=>{
				o.style.marginRight = '5px';
				
				o.innerHTML = '확인';
				
				o.addEventListener('click', (e)=>{
					
					const memopopup = e.target.parentNode;

					let wmapmemo = memopopup.querySelector('.memo').value;

					saveData(wmapkeyword, wmapaddr, wmapjibun, wmaplat, wmaplng, wmapmemo);
					
					motionOnOff(memopopup, 0.8, false, { setting : 'offDefault' }, null, (o)=>{
						o.remove();
					});

				});
			});

			boxFun('메모 추가', false, [textarea, btn], false, 'memopopup', null, true);
		}


		function addMarker(position){

			var marker = new kakao.maps.Marker({
				position: position
			});

			marker.setMap(map);

			return marker;
		}



//		검색결과 목록 하단에 페이지번호를 표시는 함수입니다
		function displayPagination(pagination) {

			var paginationEl = widget.querySelector('#pagination'),
			fragment = document.createDocumentFragment(),
			i; 

			// 기존에 추가된 페이지번호를 삭제합니다
			while (paginationEl.hasChildNodes()) {
				paginationEl.removeChild (paginationEl.lastChild);
			}

			for (i=1; i<=pagination.last; i++) {
				var el = document.createElement('a');
				el.href = "#";
				el.innerHTML = i;

				if (i===pagination.current) {
					el.className = 'on';
				} else {
					el.onclick = (function(i) {
						return function() {
							pagination.gotoPage(i);
						}
					})(i);
				}

				fragment.appendChild(el);
			}
			paginationEl.appendChild(fragment);
		}


//		오른쪽클릭시 창 생성
		function clickMenu(marker, realMarker, markerDiv){

			contextMenuFun(marker,{
				'delete' : {
					'삭제' : function(){

						let boxOpen = document.querySelector('.deletePopup');
						if(boxOpen) boxOpen.remove();

						let deleteBtn = addObject(null, 'button', 'grayBtn', false, (o)=>{
							o.style.marginRight = '5px';
							o.innerHTML = '삭제';
							o.addEventListener('click', (e)=>{
								$.ajax({
									url: 'delete',
									accept: 'application/json',
									method: 'post',
									contentType: 'application/json; charset=utf-8;',
									async: false,
									data: JSON.stringify({
										temp : marker.wmap.wmapno
									}),
									success: function(res){
										if(res){
											
											motionOnOff(e.target.parentNode, 0.8, true, { setting : 'offDefault' },null, (o)=>{
												o.remove();
											});
											
											client.send('/pub/wmarkerdel',{},JSON.stringify(marker.wmap));
											
											boxFun('삭제되었습니다!', false, null, false, 'deleteSuccess', null, true);

										} else {
											boxFun('삭제 실패', false, null, false, 'deleteFail', null, true);
										}
									},
									error: function(){
										boxFun('삭제 에러', false, false, false, 'deleteError', null, true);
									}
								});
							})
						});

						boxFun('삭제하시겠습니까?', false, [deleteBtn], false, 'deletePopup', null, true);
					}
				},
				'update' : {
					'메모 수정' : function(){

						let boxOpen = document.querySelector('.updatePopup');
						if(boxOpen) boxOpen.remove();

						let textarea = addObject(null, 'textarea', 'updateMemo', false, (o)=>{

							o.innerHTML = brChange(marker.wmap.wmapmemo);

						});

						let updateBtn = addObject(null, 'button', 'grayBtn', false, (o)=>{
							o.style.marginRight = '5px';
							o.innerHTML = '수정';
							o.addEventListener('click', (e)=>{

								let newMemo = document.querySelector('.updateMemo').value;

								var dd = {
										wmapmemo: newMemo,
										wmapno: marker.wmap.wmapno
								}

								$.ajax({
									url: 'update',
									method: 'post',
									async: false,
									data: dd,
									success: function(res){
										if(res) {
											
											
											motionOnOff(e.target.parentNode, 0.8, true, { setting : 'offDefault' },null, (o)=>{
												o.remove();
											});
											
											boxFun('수정 완료', false, null, false, 'updateSucc', (o, Nodes)=>{}, true);

											client.send('/pub/wmarker', {}, JSON.stringify(res));
											

										} else {
											boxFun('수정 실패', false, null, false, 'updateFail', null, true);
										}
									},

									error: function(){
										boxFun('수정 에러', false, null, false, 'updateError', null, true);
									}
								});

							});

						});
						boxFun('메모 수정', false, [textarea, updateBtn], false, 'updatePopup', null, true);
					}
				}		
			}
			)
		};

		
//		ajax function
		function saveData(wmapkeyword, wmapaddr, wmapjibun, wmaplat, wmaplng, wmapmemo){

			const d = {
					wno : widget.info.wno,
					wmapkeyword,
					wmapaddr,
					wmapjibun,
					wmaplat,
					wmaplng,
					wmapmemo
			};

			$.ajax({
				url: 'addLocation',
				accept : 'application/json',
				method: 'post',
				contentType : 'application/json; charset=utf-8;',
				async: false,
				data: JSON.stringify(d),
				success: function(res){

					if(res){
						
						client.send('/pub/wmarker', {}, JSON.stringify(res));

						boxFun('저장!', false, null, false, 'savedPopup', null, true);

					} else {
						
						boxFun('이미 저장된 장소입니다.', false, null, false, 'existsPopup', null, true);
						
					}
					
				},
				error: function(){
					
					boxFun('다시 선택해주세요!', false, null, false, 'saveError', null, true);
					
				}
			});	
		}


		function openMarker(){

			$.ajax({
				url: 'marker/'+widget.info.wno,
				accept: 'application/json',
				method: 'get',
				contentType: 'application/json; charset=utf-8;',
				async: false,
				success: function(data){

					data.forEach(function(item){
						
						const markers = widget.map.makerCreateFun(item);
						
						widget.map.markers.push(markers);
						
					});
				},
				error: function(){
					boxFun('마커 생성 실패', false, null, false, 'markerError', null, true);
				},
				complete: function(){
					_menu.querySelector('input[type=button].grayBtn').parentNode.addEventListener('click',function(){
						searchPlaces();
					});
				}
			});
		}
	}
}