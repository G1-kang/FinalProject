package com.test.dashboard.controller;


import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.test.dashboard.common.util.Util;
import com.test.dashboard.model.biz.MemberBiz;
import com.test.dashboard.model.dto.MemberDto;

@RestController
public class MainController {
	
	private Logger logger = LoggerFactory.getLogger(MainController.class);
	
	@Autowired
	private MemberBiz memberBiz;
	
	private String sort = "!@#ADFVDD";
	
	@ResponseBody
	@PostMapping("login")
	public boolean postLogin(@RequestBody MemberDto memberDto,  HttpSession session) {
		logger.info("[ INFO ] : MainController > postLogin [path : /login]");
		
		String[] tmp = memberDto.getMid().split("_");
		
		if(tmp.length > 1) {
			memberDto.setMpw(Util.sE(tmp[0], sort));
		}
		
		MemberDto user = memberBiz.selectByIdAndPw(memberDto.getMid(), memberDto.getMpw());
		
		if(user != null) {
			logger.info("[ INFO ] : MainController > postLogin [success]");
			
			user.setMpw(null);
			
			session.setAttribute("user", user);
			return true;
		} else {
			logger.info("[ INFO ] : MainController > postLogin [fail]");
			return false;
		}
		
	}
	
	@GetMapping("logout")
	public boolean getLogout(HttpSession session) {
	
		session.invalidate();
	
		return true;
	}
	@ResponseBody
	@PostMapping("signup")
	public MemberDto postSignUp(@RequestBody MemberDto memberDto, HttpSession session, HttpServletRequest req) {
		logger.info("[ INFO ] : MainController > postSignUp [path : /signup]");
		
		if(!memberDto.getMplatform().equals("home")) {
			String[] tmp = memberDto.getMid().split("_");
			memberDto.setMpw(Util.sE(tmp[0], sort));
		}
		
		if((memberDto.getMplatform().equals("home") || memberDto.getMplatform().equals("facebook"))) {
			if(memberDto.getMimgpath() != null && !memberDto.getMimgpath().equals("")) {
				String filePath = Util.base64ToImgDecoder(memberDto.getMimgpath(), req.getServletContext().getRealPath("/"), memberDto.getMid(),req.getServletContext().getContextPath());
				logger.info("[ INFO ] : filePath > " + filePath );
				memberDto.setMimgpath(filePath);
			}
		}
		
		if(memberDto.getMgrade() == null) {
			memberDto.setMgrade("user");
		}
		
		logger.info("[ INFO ] : SignUp Info > " + memberDto );
		
		
		int res = memberBiz.insert(memberDto);
		
		logger.info("[ INFO ] res : " + res);
		
		if(res > 0) {
			logger.info("[ INFO ] : MainController > postSignUp [success]" + memberDto);
			memberDto.setMpw(null);
			return memberDto;
		} else {
			logger.info("[ INFO ] : MainController > postSignUp [fail]");
			return null;
		}
		
	}
	
	@ResponseBody
	@PostMapping("mabout")
	public boolean postMyAbout(@RequestBody MemberDto memberDto, HttpSession session) {
		logger.info("[ INFO ] : MainController > postMyAbout [path : /mabout]");
		
		logger.info(""+memberDto);
		
		int res = memberBiz.maboutUpdate(memberDto);
		
		if(res > 0) {
			logger.info("[ INFO ] : MainController > postMyAbout [success]");
			
			if(session.getAttribute("user") != null) session.setAttribute("user", memberBiz.selectByMNo(memberDto.getMno()));
			
			return true;
		} else {
			logger.info("[ INFO ] : MainController > postMyAbout [fail]");
			return false;
		}
		
	}
	 
	
	@ResponseBody
	@GetMapping("idsearch")
	public boolean getIdSearch(MemberDto memberDto) {
		
		logger.info("[ INFO ] : MainController > postIdCheck [path : /idsearch]");
		logger.info("[ INFO ] : MainController > name > " + memberDto.getMname());
		logger.info("[ INFO ] : MainController > email > " + memberDto.getMemail());
		
		MemberDto user = memberBiz.idSearchByName(memberDto);
		
		logger.info(""+user);
		
		
		
		if(user != null) {
			
			class mailSender implements Runnable {

				@Override
				public void run() {
					// TODO Auto-generated method stub
					
					String context = "<div style=\"\r\n" + "    display: block;\r\n" + "    border: 1px solid #ccc;\r\n"
							+ "    border-radius: 10px;\r\n" + "    padding: 15px;\r\n" + "    width: max-content;\r\n"
							+ "    height: max-content;\r\n" + "\">\r\n" + "    <p style=\"\r\n" + "    font-size: 14pt;\r\n"
							+ "    font-weight: 600;\r\n" + "    letter-spacing: 0.5pt;\r\n" + "\">안녕하세요.</p>\r\n"
							+ "    <p>본 메일은 "+ memberDto.getMname() +"님이 가입하신 아이디 조회 메일입니다.</p>\r\n"
							+ "    <p>아래를 확인해주시기 바랍니다.</p>\r\n" + "    <fieldset style=\"\r\n"
							+ "    display: block;\r\n" + "    border-top: 1px solid #eee;\r\n"
							+ "    border-bottom: 1px solid #eee;\r\n" + "    margin: 25px 0;\r\n"
							+ "\"><legend>조회 아이디</legend>\r\n" + "        <p>" + user.getMid() + "</p>\r\n" + "    </fieldset>\r\n"
							+ "    <p>감사합니다.</p>\r\n" + "</div>";
					
					new Util().mailSendFun(memberDto.getMemail(), context, "안녕하세요. "+ memberDto.getMname() + "님이 조회하신 이이디 입니다.");
				
				}
				
			}
			
			Thread t = new Thread(new mailSender());
			t.start();
			
			return true;
		} else {
			return false;
		}
	}
	
	@ResponseBody
	@PostMapping("pwmodify")
		public boolean postPwModify(@RequestBody MemberDto memberDto) {
		
		logger.info("[ INFO ] : MainController > postPwModify [path : /pwmodify]");
		logger.info("[ INFO ] : MainController > id > " + memberDto.getMid());
		logger.info("[ INFO ] : MainController > email > " + memberDto.getMemail());
		logger.info("[ INFO ] : MainController > phone > " + memberDto.getMphone());
		
		MemberDto resDto = memberBiz.pwSearchCheck(memberDto);
		
		
		if(resDto == null || resDto.getMno() == 0) {
			
			logger.info("[ INFO ] : MainController > postPwModify [fail]");
			return false;
		}
		
		String randomPw = "";
		
		for(int i = 0 ; i < 12 ; i++) {
			randomPw += (char)Util.randomFun();
		}
		
		
		resDto = memberBiz.selectById(memberDto.getMid());
		resDto.setMpw(randomPw);
		
		
		int res = memberBiz.update(resDto);
		
		if(res > 0) {
			
			logger.info("[ INFO ] : MainController > postPwModify [success]");
			
			class mailSender implements Runnable {
				
				MemberDto resDto;
				
				public mailSender(MemberDto resDto) {
					// TODO Auto-generated constructor stub
					this.resDto = resDto;
				}
				
				@Override
				public void run() {
					// TODO Auto-generated method stub
					
					String context = "<div style=\"\r\n" + "    display: block;\r\n" + "    border: 1px solid #ccc;\r\n"
							+ "    border-radius: 10px;\r\n" + "    padding: 15px;\r\n" + "    width: max-content;\r\n"
							+ "    height: max-content;\r\n" + "\">\r\n" + "    <p style=\"\r\n" + "    font-size: 14pt;\r\n"
							+ "    font-weight: 600;\r\n" + "    letter-spacing: 0.5pt;\r\n" + "\">안녕하세요.</p>\r\n"
							+ "    <p>본 메일은 " + resDto.getMid() +"님이 비밀번호를 재설정한 메일입니다.</p>\r\n"
							+ "    <p>아래를 확인해주시고 추가적으로 비밀번호 수정해주시기 바랍니다.</p>\r\n" + "    <fieldset style=\"\r\n"
							+ "    display: block;\r\n" + "    border-top: 1px solid #eee;\r\n"
							+ "    border-bottom: 1px solid #eee;\r\n" + "    margin: 25px 0;\r\n"
							+ "\"><legend>재설정한 비밀번호</legend>\r\n" + "        <p>" + resDto.getMpw() + "</p>\r\n" + "    </fieldset>\r\n"
							+ "    <p>감사합니다.</p>\r\n" + "</div>";
					
					new Util().mailSendFun(resDto.getMemail(), context, "안녕하세요. "+ resDto.getMid() + "님의 재설정된 비밀번호입니다.");
				}
			}
			
			Thread t = new Thread(new mailSender(resDto));
			t.start();
			
			return true;
		} else {
			
			logger.info("[ INFO ] : MainController > postPwModify [fail]");
			
			return false;
		}
	}
	
}
