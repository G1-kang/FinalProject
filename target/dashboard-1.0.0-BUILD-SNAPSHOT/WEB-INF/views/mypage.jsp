<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Insert title here</title>

<!--외부 라이브러리 -->
<script type="text/javascript" src="/dashboard/resources/js/websocket/sockjs.min.js"></script>
<script type="text/javascript" src="/dashboard/resources/js/websocket/stomp.min.js"></script>

<!-- 커스텀 유틸  -->
<link rel="stylesheet" href="./resources/css/defaultstyle.css" type="text/css"/>
<script type="text/javascript" src="/dashboard/resources/js/xhr.js"></script>
<script type="text/javascript" src="./resources/js/util.js"></script>


<!-- 페이지 js, css -->
<link rel="stylesheet" href="./resources/css/header.css?ver=1" type="text/css">
<link rel="stylesheet" href="./resources/css/mypage.css" type="text/css">
<script type="text/javascript" src="./resources/js/mypage.js"></script>

</head>
<body>

	<jsp:include page="header.jsp"></jsp:include>
	<script type="text/javascript" src="./resources/js/header.js?ver=1"></script>
	
	
	<section style="overflow: overlay;">
		<article id="content">
		</article>
	</section>
	
	<div>
	<div class="backgroundDiv"></div>
	<div class="backgroundImg img1"></div>
	<div class="backgroundImg img2"></div>
	<div class="backgroundImg img3"></div>
	<div class="backgroundImg img4"></div>
	<div class="backgroundImg img5"></div>
	<div class="backgroundImg img6"></div>
	<div class="backgroundImg img7"></div>
	<div class="backgroundImg img8"></div>
	<div class="backgroundImg img9"></div>
</div>
	
	<jsp:include page="footer.jsp"></jsp:include>
</body>
</html>