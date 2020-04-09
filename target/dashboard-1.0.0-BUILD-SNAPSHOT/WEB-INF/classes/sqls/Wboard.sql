--DROP TABLE wboard [DROP CONSTRAINTS] WBOARD_PK
--
--ALTER TABLE wboard DROP PRIMARY KEY WBOARD_PK
--
--DROP SEQUENCE wboard_seq

CREATE SEQUENCE wboard_seq

--시퀀스를 해당 위치에다가 넣어 두기 

CREATE TABLE wboard
(
	wbtodono NUMBER NOT NULL, --위젯보드 해야할일 전체 번호
	wno NUMBER NOT NULL, --위젯번호
	dno NUMBER NOT NULL, --고유넘버(모든사람이 공통으로 가짐),위젯이 속한 대시보드 테이블 번호 
	dgno NUMBER NOT NULL, --대시보드 맴버 권한 그룹 넘버 
	mid VARCHAR2(500) NOT NULL, -- 추가해야할 거 같음 ~ 실험 완성후 갖다 붙이기 
	wbtodo VARCHAR2(4), --Y : 한일 N : 해야 할 일 , 전체할일은 
	wbtitle VARCHAR2(1000), 
	wbcontent VARCHAR2(1000),
	wfno_list VARCHAR2(1000), --파일 테이블 번호 
	wbstartdate DATE NOT NULL,
	wbenddate DATE,
	wbcolor VARCHAR2(50), -- 하일 게시판 색상 
	CONSTRAINT WBOARD_PK PRIMARY KEY(wbtodono)
);


