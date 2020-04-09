
/*
//달력 함수들 
	var date = null; 
    var today = null;
    var year = null;
    var month = null;
    var firstDay = null;
    var lastDay = null;
    var $tdDay = null; //제이쿼리 변수 
  //  var $tdSche = null; //현재 사용 x
 
    $(document).ready(function() {
        drawCalendar();
        initDate();
        drawDays();
        $("#movePrevMonth").on("click", function(){movePrevMonth();});
        $("#moveNextMonth").on("click", function(){moveNextMonth();});
    });
    
    //calendar 그리기
    function drawCalendar(){
        var setTableHTML = "";
        setTableHTML+='<table class="calendar">';
        setTableHTML+='<tr><th>SUN</th><th>MON</th><th>TUE</th><th>WED</th><th>THU</th><th>FRI</th><th>SAT</th></tr>';
        for(var i=0;i<6;i++){
            setTableHTML+='<tr height="100">';
            for(var j=0;j<7;j++){
                setTableHTML+='<td style="text-overflow:ellipsis;overflow:hidden;white-space:nowrap">';
                setTableHTML+='    <div class="cal-day"></div>';
                setTableHTML+='    <div class="cal-schedule"></div>';
                setTableHTML+='</td>';
            }
            setTableHTML+='</tr>';
        }
        setTableHTML+='</table>';
        $("#cal_tab").html(setTableHTML);
    }
 
    //날짜 초기화
    function initDate(){
        $tdDay = $("td div.cal-day");
        //$tdSche = $("td div.cal-schedule"); //휴일 같은 일정 표시 현재 사용 x
        dayCount = 0;
        today = new Date();
        date = new Date();//today의 Date를 세어주는 역할
        year = today.getFullYear();
        month = today.getMonth()+1;
        firstDay = new Date(year,month-1,1);
        lastDay = new Date(year,month,0);
    }
    
    //calendar 날짜표시
    function drawDays(){
        $("#cal_top_year").text(year);
        $("#cal_top_month").text(month);
        for(var i=firstDay.getDay();i<firstDay.getDay()+lastDay.getDate();i++){
            $tdDay.eq(i).text(++dayCount);
 
        }
        for(var i=0;i<42;i+=7){
            $tdDay.eq(i).css("color","red");
        }
        for(var i=6;i<42;i+=7){
            $tdDay.eq(i).css("color","blue");
        }
        for(var i=1;i<=lastDay.getDate();i++){
            if(today.getFullYear() == date.getFullYear() && today.getMonth() == date.getMonth() && i == date.getDate()){
            	for(var j=0; j<=42; j++){
            		var todaypick = $tdDay.eq(j).html();
            		if(todaypick == i){
            			$tdDay.eq(j).css({'color' : '#3CB371','font-weight':'bold'});	
            		}
            	}
            		 
            	
            	 
            	
            }
        }//console.log(todaypick);
    }
 
    //calendar 월 이동
    function movePrevMonth(){
        month--;
        if(month<=0){
            month=12;
            year--;
        }
        if(month<10){
            month=String("0"+month);
        }
        getNewInfo();
        }
    
    function moveNextMonth(){
        month++;
        if(month>12){
            month=1;
            year++;
        }
        if(month<10){
            month=String("0"+month);
        }
        getNewInfo();
    }

    
    function getNewInfo(){
        for(var i=0;i<42;i++){
            $tdDay.eq(i).text("");
        }
        dayCount=0;
        firstDay = new Date(year,month-1,1);
        lastDay = new Date(year,month,0);
        drawDays();
    }
 */   
    //예시를 위한 
	function b() {
		const bic1  = addObject(null,'div','bic1');
		const box1 = boxFun(null,false,[bic1],false,'box1',null,true);
		const con1 = addObject(bic1,'div','con1',true,(o)=>{
			o.innerHTML=`
			<input type="hidden" value="b" name="mid" id="mid">
			<input type="hidden" value="1" name="wno" id="wno">
				<input type="hidden" value="202004" name="wbstartdate" id="wbstartdate">
				<input type="button" value="달력 wno=1, mid=b" onclick='wbcalboard();'>
			`;
			
			
			});
	}
	
	
	//캘린더 시작 
    //calendar 그리기
    function drawCalendar(){
        var setTableHTML = "";
        setTableHTML+='<table class="calendar">';
        setTableHTML+='<tr><th>SUN</th><th>MON</th><th>TUE</th><th>WED</th><th>THU</th><th>FRI</th><th>SAT</th></tr>';
        for(var i=0;i<6;i++){
            setTableHTML+='<tr height="100">';
            for(var j=0;j<7;j++){
                setTableHTML+='<td style="text-overflow:ellipsis;overflow:hidden;white-space:nowrap">';
                setTableHTML+='    <div class="cal-day"></div>';
                setTableHTML+='    <div class="cal-schedule"></div>';
                setTableHTML+='</td>';
            }
            setTableHTML+='</tr>';
        }
        setTableHTML+='</table>';
        $("#cal_tab").html(setTableHTML);
    }
 
    //날짜 초기화
    function initDate(){
        $tdDay = $("td div.cal-day");
        //$tdSche = $("td div.cal-schedule"); //휴일 같은 일정 표시 현재 사용 x
        dayCount = 0;
        today = new Date();
        date = new Date();//today의 Date를 세어주는 역할
        year = today.getFullYear();
        month = today.getMonth()+1;
        firstDay = new Date(year,month-1,1);
        lastDay = new Date(year,month,0);
    }
    
    //calendar 날짜표시
    function drawDays(){
        $("#cal_top_year").text(year);
        $("#cal_top_month").text(month);
        for(var i=firstDay.getDay();i<firstDay.getDay()+lastDay.getDate();i++){
            $tdDay.eq(i).text(++dayCount);
           
        }
        //일요일`
        for(var i=0;i<42;i+=7){
            $tdDay.eq(i).css("color","red");
        }
        //토요일 
        for(var i=6;i<42;i+=7){
            $tdDay.eq(i).css("color","blue");
        }
        //오늘 날짜 표시 
        for(var i=1;i<=lastDay.getDate();i++){
            if(today.getFullYear() == date.getFullYear() && today.getMonth() == date.getMonth() && i == date.getDate()){
            	for(var j=0; j<=42; j++){
            		var todaypick = $tdDay.eq(j).html();
            		if(todaypick == i){
            			//이녀석을 활용하면 해당하는 기간을 색칠 할 수 있음 ↓
            			//$tdDay.eq(j).css({'color' : '#3CB371','font-weight':'bold'});	
            			$('td').eq(j).css({'border':'1px solid red','color' : '#3CB371','font-weight':'bold'});
            		}
            	}
            }
            //해당 기간동안 업무 내용 색칠 하기 
         /*
            if(var z = 0){
            
            	

					
            	
            }
           */ 
            
        }//console.log(todaypick);
        
        
    }

 
    //calendar 월 이동
    function movePrevMonth(){
        month--;
        if(month<=0){
            month=12;
            year--;
        }
        if(month<10){
            month=String("0"+month);
        }
        getNewInfo();
        }
    
    function moveNextMonth(){
        month++;
        if(month>12){
            month=1;
            year++;
        }
        if(month<10){
            month=String("0"+month);
        }
        getNewInfo();
    }

    
    function getNewInfo(){
        for(var i=0;i<42;i++){
            $tdDay.eq(i).text("");
        }
        dayCount=0;
        firstDay = new Date(year,month-1,1);
        lastDay = new Date(year,month,0);
        drawDays();
    }
    
    

    
    
    //string -> substr
    function to_date(date){
    	//console.log(date);
    	var yyyymmdd= date;
    	var sYear = yyyymmdd.substr(0,4);
    	var sMm = yyyymmdd.substr(4,2);
    	var sDate = yyyymmdd.substr(6,2);
    	//return sYear+"년"+sMm+"월"+sDate+"일";
    }
    //캘린더 끝 
    
    
   //달력 박스 
 function wbcalboard() {
	 var mid = document.querySelector('#mid').value;
	 var wno = document.querySelector('#wno').value;
	 var wbstartdate = document.querySelector('#wbstartdate').value;
	 
	 console.log(wbstartdate+mid);

	    
	const wbcalboardbiv  = addObject(null,'div','wbcalboardbiv');
	const wbcalboardbox = boxFun(null,false,[wbcalboardbiv],false,'wbcalboardbox',null,true);
	const wbcalboardcon = addObject(wbcalboardbiv,'div','wbcalboardcon',true,(o)=>{
		o.innerHTML=`
		    <div class="cal_top">
        <a href="#" id="movePrevMonth"><span id="prevMonth" class="cal_tit">&lt;</span></a>
        <span id="cal_top_year"></span>
        <span id="cal_top_month"></span>
        <a href="#" id="moveNextMonth"><span id="nextMonth" class="cal_tit">&gt;</span></a>
			</div>
			<div id="cal_tab" class="cal">
			</div>
		
		`;
		var date = null; //오늘 날짜를 표시해주기 위해서 만든 것 
	    var today = null;//실질적으로 이스크립트에서 사용하는 것 
	    var year = null;
	    var month = null;
	    var firstDay = null;
	    var lastDay = null;
	    var $tdDay = null; //제이쿼리 변수 
	  //  var $tdSche = null; //현재 사용 x
	 
	    $(document).ready(function() {
	    	//달력버튼을 누르자마자 실행되어서 달력을 그려줌
	        drawCalendar();
	        initDate();
	        drawDays();
	        $("#movePrevMonth").on("click", function(){movePrevMonth();});
	        $("#moveNextMonth").on("click", function(){moveNextMonth();});
	        
	        
		    $.ajax({
		    	url:"wbdatesend",
		    	data:{
		    		"mid":mid,
		    		"wno":wno,
		    		"wbstartdate":wbstartdate
		    	},
		    	method:"post",
		    	success:function(data){
		    		alert("통신성공");
		    		//console.log(data);
		    		data.forEach(function(item, index){
		    			
		    			var wbtitle = item.wbtitle; 
		    			var wbstartdate = item.wbstartdate;
		    			var wbenddate = item.wbenddate;
		    			
		    			
		    			var sDate = wbstartdate.substr(6,2);
		    			console.log("받아온 날짜 ~ "+sDate + "배열의 인덱스 번호 "+index);	
		    			//!!! 시작날짜의 날짜와 달력의 날짜가 1개만 같게 나옴 ㅠㅠ 시작날짜의 중복되는 모든 값을 출력 해야함 

		    			 
		 		          for(var i=0;i<42;i++ ){
		 		           	var ex1 =  $(".cal-day").eq(i).html();
		 		        	
		 		        			if(ex1 == Number(sDate)){
		 		        			//console.log("여기는 for j "+arr[j]);
		 		        			$('.cal-schedule').eq(i).html(Number(sDate)+wbtitle);	
		 		           }
		 		        }
		    			 
		    		});


		    		
		    	},error:function(data){
		    		alert("통신실패");
		    	}
		    });//아작스 끝
	        
	        
	    });
	    

	    

		
	});
	
}