<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Insert title here</title>

<!--외부 라이브러리 -->
<script type="text/javascript" src="/dashboard/resources/js/jquery/jquery-3.4.1.min.js"></script>
<script type="text/javascript" src="/dashboard/resources/js/websocket/sockjs.min.js"></script>
<script type="text/javascript" src="/dashboard/resources/js/websocket/stomp.min.js"></script>
<!-- 달력피커 -->
<script src="/dashboard/resources/js/flatpickr.min.js"></script>
<link rel="stylesheet" href="/dashboard/resources/css/flatpickr.css">
<link rel="stylesheet" href="/dashboard/resources/css/dark.css">

<!-- 카카오 맵 -->
<script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=cfc755aece03a07263adb8e92484665e&libraries=services"></script>

<!-- 제이쿼리 드래그앤 드롭 -->
<script src="/dashboard/resources/js/jquery/jquery-ui.min.js"></script>

<!-- 써머노트 lite ver -->
<link href="/dashboard/resources/css/summernote-lite.min.css" rel="stylesheet">
<script src="/dashboard/resources/js/summernote/summernote-lite.min.js"></script>
<script src="/dashboard/resources/js/summernote/summernote-ko-KR.min.js"></script>


<!-- 커스텀 유틸  -->
<link rel="stylesheet" href="/dashboard/resources/css/defaultstyle.css" type="text/css"/>
<script type="text/javascript" src="/dashboard/resources/js/xhr.js"></script>
<script type="text/javascript" src="/dashboard/resources/js/util.js"></script>

<!-- editor -->
<script src="/dashboard/resources/js/ace_editor/ace.js"></script>
<script src="/dashboard/resources/js/ace_editor/mode-html.js"></script>
<script src="/dashboard/resources/js/ace_editor/theme-monokai.js"></script>

<!-- 페이지 js, css -->

<link rel="stylesheet" href="/dashboard/resources/css/header.css" type="text/css">
<link rel="stylesheet" href="/dashboard/resources/css/board.css" type="text/css">
<link rel="stylesheet" href="/dashboard/resources/css/crawling.css" type="text/css">
<link rel="stylesheet" href="/dashboard/resources/css/wmemoAndwchat.css" type="text/css">

<script type="text/javascript" src="/dashboard/resources/js/board.js"></script>

<script type="text/javascript" src="/dashboard/resources/js/crawling.js"></script>
<script type="text/javascript" src="/dashboard/resources/js/wmemo.js"></script>
<script type="text/javascript" src="/dashboard/resources/js/wchat.js"></script>

<link rel="stylesheet" href="./resources/css/wbcal.css" type="text/css" />
<link rel="stylesheet" href="./resources/css/wboard.css" type="text/css" />
<link rel="stylesheet" href="./resources/css/weditor.css" type="text/css">
<link rel="stylesheet" href="/dashboard/resources/css/map.css" type="text/css" />

<script type="text/javascript" src="./resources/js/wboard.js"></script>
<script type="text/javascript" src="./resources/js/wbcal.js"></script>

<script type="text/javascript" src="/dashboard/resources/js/widgetaddandmodify.js"></script>
<script type="text/javascript" src="/dashboard/resources/js/widgetload.js"></script>
<script type="text/javascript" src="/dashboard/resources/js/weditor.js" charset="utf-8"></script>

<script type="text/javascript" src="/dashboard/resources/js/map.js"></script>

</head>
<body>

	<jsp:include page="header.jsp"></jsp:include>
	<script type="text/javascript" src="/dashboard/resources/js/header.js"></script>
	
	<section>
		<article id="content">
		</article>
	</section>
			
</body>
</html>