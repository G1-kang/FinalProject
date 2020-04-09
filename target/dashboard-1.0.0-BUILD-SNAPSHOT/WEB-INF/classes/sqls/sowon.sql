-- 맴버
CREATE TABLE member
(
    mno            NUMBER            NOT NULL, 
    mid            VARCHAR2(500)     NOT NULL, 
    mnick          VARCHAR2(1000)    NOT NULL, 
    mname          VARCHAR2(100)     NOT NULL, 
    mpw            VARCHAR2(2000)    NOT NULL, 
    memail         VARCHAR2(3000)    NULL, 
    maddr          VARCHAR2(4000)    NULL, 
    mphone         VARCHAR2(100)     NULL, 
    mabout         CLOB              NULL, 
    mimgpath       VARCHAR2(2000)    NULL, 
    mgrade         VARCHAR2(100)     NOT NULL, 
    mcreatedate    DATE              NOT NULL, 
    mdel           VARCHAR2(5)       NOT NULL, 
    CONSTRAINT MEMBER_PK PRIMARY KEY (mno)
)
/

CREATE SEQUENCE member_SEQ
START WITH 1
INCREMENT BY 1;
/

CREATE OR REPLACE TRIGGER member_AI_TRG
BEFORE INSERT ON member 
REFERENCING NEW AS NEW FOR EACH ROW 
BEGIN 
    SELECT member_SEQ.NEXTVAL
    INTO :NEW.mno
    FROM DUAL;
END;
/

DROP TRIGGER member_AI_TRG;
/

--DROP SEQUENCE member_SEQ;
/

COMMENT ON TABLE member IS '회원 테이블'
/

COMMENT ON COLUMN member.mno IS '회원 정보'
/

COMMENT ON COLUMN member.mid IS '회원 아이디'
/

COMMENT ON COLUMN member.mnick IS '회원 닉네임'
/

COMMENT ON COLUMN member.mname IS '회원 이름'
/

COMMENT ON COLUMN member.mpw IS '회원 비밀번호'
/

COMMENT ON COLUMN member.memail IS '회원 이메일'
/

COMMENT ON COLUMN member.maddr IS '회원 주소'
/

COMMENT ON COLUMN member.mphone IS '회원 전화 번호'
/

COMMENT ON COLUMN member.mabout IS '회원 소개'
/

COMMENT ON COLUMN member.mimgpath IS '회원 사진 패스'
/

COMMENT ON COLUMN member.mgrade IS '회원 등급'
/

COMMENT ON COLUMN member.mcreatedate IS '회원 가입일'
/

COMMENT ON COLUMN member.mdel IS 'Check(Y,N)'
/


ALTER TABLE member
	ADD (mplatform varchar(50))
/

ALTER TABLE member
    ADD CONSTRAINT UC_mnick UNIQUE (mnick)
/

ALTER TABLE member
	ADD CONSTRAINT UC_mname_memail_mplatform UNIQUE (mname, memail, mplatform)
/

ALTER TABLE member
    ADD CONSTRAINT UC_mid UNIQUE (mid)
/

-- 대시보드
CREATE TABLE DashBoard
(
    dno            NUMBER            NOT NULL, 
    dtitle         VARCHAR2(3000)    NOT NULL, 
    mid            VARCHAR2(2000)    NOT NULL, 
    ddesc          CLOB              NULL, 
    dcreatedate    DATE              NOT NULL, 
    dmodifydate    DATE              NULL, 
    ddel           VARCHAR2(5)       NOT NULL, 
    CONSTRAINT DASHBOARD_PK PRIMARY KEY (dno)
)
/

CREATE SEQUENCE DashBoard_SEQ
START WITH 1
INCREMENT BY 1;
/

CREATE OR REPLACE TRIGGER DashBoard_AI_TRG
BEFORE INSERT ON DashBoard 
REFERENCING NEW AS NEW FOR EACH ROW 
BEGIN 
    SELECT DashBoard_SEQ.NEXTVAL
    INTO :NEW.dno
    FROM DUAL;
END;
/

DROP TRIGGER DashBoard_AI_TRG;
/

--DROP SEQUENCE DashBoard_SEQ;
/

COMMENT ON TABLE DashBoard IS '대시보드 테이블'
/

COMMENT ON COLUMN DashBoard.dno IS '대시보드 테이블 번호'
/

COMMENT ON COLUMN DashBoard.dtitle IS '대시보드 명칭'
/

COMMENT ON COLUMN DashBoard.mid IS '대시보드 소유주'
/

COMMENT ON COLUMN DashBoard.ddesc IS '대시보드 설명'
/

COMMENT ON COLUMN DashBoard.dcreatedate IS '대시보드 생성일'
/

COMMENT ON COLUMN DashBoard.dmodifydate IS '대시보드 수정일'
/

COMMENT ON COLUMN DashBoard.ddel IS '대시보드 삭제 유무'
/

ALTER TABLE DashBoard
    ADD CONSTRAINT FK_DashBoard_mid_member_mid FOREIGN KEY (mid)
        REFERENCES member (mid)
/

-- 위젯 테이블
CREATE TABLE widget
(
    wno              NUMBER            NOT NULL, 
    dno              NUMBER            NOT NULL, 
    wcategory        VARCHAR2(1000)    NOT NULL, 
    wtitle           VARCHAR2(2000)    NULL, 
    mid              VARCHAR2(2000)    NOT NULL, 
    wleft            number            NULL, 
    wtop             NUMBER            NULL, 
    wwidth           NUMBER            NULL, 
    wheight          NUMBER            NULL, 
    wzindex          NUMBER            NULL, 
    wcontentcolor    VARCHAR2(500)     NULL, 
    wtitlecolor      VARCHAR2(500)     NULL, 
    wposition        VARCHAR2(500)     NULL, 
    wcreatedate      date              NULL, 
    wdel             VARCHAR2(5)       NOT NULL, 
    CONSTRAINT WIDGET_PK PRIMARY KEY (wno)
)
/

CREATE SEQUENCE widget_SEQ
START WITH 1
INCREMENT BY 1;
/

CREATE OR REPLACE TRIGGER widget_AI_TRG
BEFORE INSERT ON widget 
REFERENCING NEW AS NEW FOR EACH ROW 
BEGIN 
    SELECT widget_SEQ.NEXTVAL
    INTO :NEW.wno
    FROM DUAL;
END;
/

DROP TRIGGER widget_AI_TRG;
/

--DROP SEQUENCE widget_SEQ;
/

COMMENT ON TABLE widget IS '위젯 설정 테이블'
/

COMMENT ON COLUMN widget.wno IS '위젯 설정 테이블 번호'
/

COMMENT ON COLUMN widget.dno IS '위젯이 속한 대시보드 테이블 번호'
/

COMMENT ON COLUMN widget.wcategory IS '위젯 내용 종류'
/

COMMENT ON COLUMN widget.wtitle IS '위젯 제목'
/

COMMENT ON COLUMN widget.mid IS '위젯 소유주'
/

COMMENT ON COLUMN widget.wleft IS '위젯 X축'
/

COMMENT ON COLUMN widget.wtop IS '위젯 Y축'
/

COMMENT ON COLUMN widget.wwidth IS '위젯 가로 길이'
/

COMMENT ON COLUMN widget.wheight IS '위젯 세로 길이'
/

COMMENT ON COLUMN widget.wzindex IS '위젯 Z축'
/

COMMENT ON COLUMN widget.wcontentcolor IS '위젯 내용 배경색'
/

COMMENT ON COLUMN widget.wtitlecolor IS '위젯 제목 배경색'
/

COMMENT ON COLUMN widget.wposition IS '위젯 포지션'
/

COMMENT ON COLUMN widget.wcreatedate IS '위젯 생성시기'
/

COMMENT ON COLUMN widget.wdel IS '위젯 삭제 유무'
/

ALTER TABLE widget
    ADD CONSTRAINT FK_widget_dno_DashBoard_dno FOREIGN KEY (dno)
        REFERENCES DashBoard (dno) on delete cascade
/

ALTER TABLE widget
    ADD CONSTRAINT FK_widget_mid_member_mid FOREIGN KEY (mid)
        REFERENCES member (mid) on delete cascade
/


--지도
--DROP TABLE WMAP;
--DROP SEQUENCE WMAP_SEQ;

CREATE TABLE WMAP(
	WMAPNO NUMBER NOT NULL,
	WNO NUMBER,
	WMAPKEYWORD VARCHAR2(1000),
	WMAPADDR VARCHAR2(4000),
	WMAPJIBUN VARCHAR2(4000),
	WMAPLAT VARCHAR2(2000),
	WMAPLNG VARCHAR2(2000),
	WMAPMEMO VARCHAR2(4000),
	CONSTRAINT PK_WMAP PRIMARY KEY(WMAPNO)
);

CREATE SEQUENCE WMAP_SEQ
START WITH 1
INCREMENT BY 1;

ALTER TABLE WMAP
    ADD CONSTRAINT FK_WMAP FOREIGN KEY (WNO)
        REFERENCES WIDGET(WNO);
        
        
--UPDATE WMAP SET WNO = 1 WHERE WMAPNO=1;      

--INSERT INTO WMAP VALUES(3,2,'라인프렌즈 플래그십스토어 강남점','서울 서초구 강남대로 437 1,2층', '서초동 1305-3', '37.5014593', '127.025335', ' ') ;

--SELECT * FROM WMAP;


--에디터
--DROP TABLE WEDITOR
--DROP SEQUENCE WEDITOR_SEQ

CREATE SEQUENCE WEDITOR_SEQ
START WITH 1
INCREMENT BY 1;

CREATE TABLE WEDITOR(
	WENO NUMBER NOT NULL,
	WNO NUMBER NOT NULL,
	WECONTENT CLOB,
	CONSTRAINT PK_WEDITOR PRIMARY KEY(WENO)
);

ALTER TABLE WEDITOR
	ADD CONSTRAINT FK_WEDITOR FOREIGN KEY(WNO)
		REFERENCES WIDGET(WNO)