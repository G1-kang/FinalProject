<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">


<title>Insert title here</title>


<script type="text/javascript" src="https://code.jquery.com/jquery-3.4.1.min.js"></script>


<!-- include libraries(jQuery, bootstrap) -->
<link href="http://netdna.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.css" rel="stylesheet">
<script src="http://netdna.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.js"></script> 

<!-- include summernote css/js-->
<link href="https://cdnjs.cloudflare.com/ajax/libs/summernote/0.8.11/summernote-bs4.css" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/summernote/0.8.11/summernote-bs4.js"></script>

<!-- 달력피커 -->
     <script src="https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.2.3/flatpickr.js"></script>
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.2.3/flatpickr.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.2.3/themes/dark.css">


<title>글쓰기</title>



    
    <script type="text/javascript">
    
    
    	  function goWrite(frm) {
    	    	var wbtitle = frm.wbtitle.value;
    	    	var mid = frm.mid.value;
    	    	var wbcontent = frm.wbcontent.value;


    			var wbstartdate = frm.wbstartdate.value;
    	    	var wbenddate = frm.wbenddate.value;
    	    	
    	    	console.log(wbstartdate +"과연"+wbenddate);
    	    	
    	    	if (wbtitle.trim() == ''){
    	    		alert("제목을 입력해주세요");
    	    		return false;
    	    	}
    	    	if (mid.trim() == ''){
    	    		alert("작성자를 입력해주세요");
    	    		return false;
    	    	}
    	    	if (wbcontent.trim() == ''){
    	    		alert("내용을 입력해주세요");
    	    		return false;
    	    	}
    	    	frm.submit();
    	    }
    	
    	
  

    $(document).ready(function() {
    	  $('#summernote').summernote({
     	    	placeholder: 'content',
    	        minHeight: 370,
    	        maxHeight: null,
    	        focus: true, 
    	  });
    	});
    
    
    function confirmbtn(){
    	
    	//날짜
    	var a =  document.getElementById('rangeDate').value;
    	var st = a.replace("to"," ");
    	var tri = st.replace(" ",""); 
    	var arr = tri.split("-");
    	var day = arr[2].substr(0,2);
		var day2 = arr[2].substr(4,4);
		
		var wbst = arr[0]+arr[1]+day;
		var wben = day2+arr[3]+arr[4];
		
		console.log(day);
		console.log(wbst);
		
		document.getElementById('wbstartdate').value= wbst;
		document.getElementById('wbenddate').value= wben;
		
		//console.log(wbstartdate +"dkfjldk"+wbenddate);
		
	
/* 		console.log(day + "와" + day2 );
		console.log(arr[0] + arr [1] +"오잉" + arr[2]+"아마" + arr[3]+"호히히"+arr[4] );	
		console.log(day +"그리고" + day2); */
    }
    
/*    안됨
$(function () {

    	$('#calclear').click({
    		var a = $('#rangDate').val();
    		var arr = a.split("-");
    		
    		
    		var day = arr[2].substr(0,2);
    		var day2 = arr[3].substr(5,2);
    		
    		console.log(day + "와" + day2 );
    		console.log(arr[0] + arr [1] + arr[2] + arr[3] );	
    	});

    });
 */
    </script>
    
    

  
 
    
    
<script type="text/javascript">

$(function () {
	
	$("#rangeDate").flatpickr({
	    mode: 'range',
	    dateFormat: "Y-m-d",
	});

	
	
/*
	reset버튼을 만들랗 했는데, wrap : true 기능을 이해못해서 사용 x 어차피 데이 선택 피커는 걍 다시 누르게 하는게 맞을듯.. 포기.. 
$('#calclear').click(function(){
		$('#calclear').empty();
			
	});
 */	

	
/* 	$('.a').flatpickr({
		wrap: true
	}); */
	
	/* $(".resetd").flatpickr({
	    wrap: true,
	    weekNumbers:false
	}); */

});



</script>


</head>
<body>
<h2 style="text-align: center;">글 작성</h2><br><br><br>


    
 
<div style="width: 60%; margin: auto;">
	<form method="post" action="summerwrite">
		<input type="text" name="mid" style="width: 20%;" placeholder="작성자"/><br>
		<input type="text" name="wbtitle" style="width: 40%;" placeholder="제목"/>
		<br><br> 
     <h2>Range Datetime</h2>
<input type="text" id="rangeDate" placeholder="날짜를 선택해 주세요" >
  <input id="calconf" type="button" value="확인" onclick="confirmbtn()">
<p>
<input type="text" id="wbstartdate" name="wbstartdate" >
<input type="text" id="wbenddate" name="wbenddate" >
</p>  
 
		<br/><br><br> 
	
		
		<textarea id="summernote" name="wbcontent"></textarea>
		<input id="wbsubBtn" type="button" value="글 작성" style="float: right;" onclick="goWrite(this.form)"/>
	</form>
</div>


</body>
</html>