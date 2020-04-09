<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Insert title here</title>
<!-- 제이쿼리 -->
<script type="text/javascript" src="https://code.jquery.com/jquery-3.4.1.min.js"></script>

<!-- 위젯보드js -->
<script type="text/javascript" src="./resources/js/wboard.js"></script>
<link rel="stylesheet" href="./resources/css/wboard.css" type="text/css" />

<!-- 위젯달력js -->
<script type="text/javascript" src="./resources/js/wbcal.js"></script>
<link rel="stylesheet" href="./resources/css/wbcal.css" type="text/css" />

<!-- 커스텀 유틸  -->
<link rel="stylesheet" href="./resources/css/defaultstyle.css"type="text/css" />
<script type="text/javascript" src="./resources/js/util.js"></script>
<script type="text/javascript" src="./resources/js/xhr.js"></script>


<!-- 써머노트 lite ver -->
<link href="https://cdn.jsdelivr.net/npm/summernote@0.8.16/dist/summernote-lite.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/summernote@0.8.16/dist/summernote-lite.min.js"></script>


<!-- 달력피커 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.2.3/flatpickr.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.2.3/flatpickr.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.2.3/themes/dark.css">

<!-- 제이쿼리 드래그앤 드롭 -->
  <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
</head>
<body>



<input type="button" value="달력 wno=1, mid=b" onclick='b();'>
<input type="button" value="위젯  wno=1, mid=b" onclick='a();'>
	<div class="wboardcon">
		<h1>프로젝트 일정</h1>

		<div class="wtasklist">
			<p>프로그램 전체 일정
			<a href="#"><img src="./resources/images/plusbtn.png" width="15" height="15" align="right"></a>
			</p>

			<c:choose>
				<c:when test="${empty list }">
				지정된 업무가 없습니다
			</c:when>

				<c:otherwise>
					<c:forEach items="${list }" var="wlist">
						<input type="text" value="${wlist.wbtitle }" readonly draggable="false" >
					</c:forEach>
				</c:otherwise>
			</c:choose>



		</div>

		<div class="wtasklist mytasklist"  ondragover="dragEnter(event)">
			<p>나의 일정
			<a href="#"><img src="./resources/images/plusbtn.png" width="15" height="15" align="right"></a>
			</p>
			
			<c:choose>
				<c:when test="${empty list }">
				지정된 업무가 없습니다
			</c:when>

				<c:otherwise>
					<c:forEach items="${list }" var="wlist">
						<input type="text" value="${wlist.wbtitle }" 
						readonly draggable="true"  ondragstart="drag(event)"
						 onclick="selectbtn(${wlist.wbtodono})">
					</c:forEach>
				</c:otherwise>
			</c:choose>

		</div>


		<div class="wtasklist" ondrop="copydrop(event)"  ondragover="dragEnter(event)">
			<input type="hidden" name="wbtodo" value="N"/>
			<p>진행중 일정</p>
		</div>


		<div class="wtasklist" ondrop="nomaldrop(event)" ondragover="dragEnter(event)">
			<input type="hidden" name="wbtodo" value="Y"/>
			<p>완료 일정</p>

		</div>
		
		<input type="button" value="연습버튼" onclick="selectbtn();" >
		
	</div>


</body>
</html>