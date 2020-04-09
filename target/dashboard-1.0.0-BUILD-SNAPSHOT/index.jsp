<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Insert title here</title>
</head>
<body>
	<c:if test="${empty user}">
		<jsp:forward page="login"></jsp:forward>
	</c:if>
	<c:if test="${not empty user}">
		<jsp:forward page="mypage"></jsp:forward>
	</c:if>
</body>
</html>