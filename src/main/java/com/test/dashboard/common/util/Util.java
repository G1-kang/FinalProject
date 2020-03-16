package com.test.dashboard.common.util;

import java.awt.image.BufferedImage;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Properties;
import java.util.Set;

import javax.imageio.ImageIO;
import javax.mail.MessagingException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMessage.RecipientType;
import javax.xml.bind.DatatypeConverter;

import org.apache.jasper.tagplugins.jstl.core.Url;
import org.json.simple.JSONObject;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import net.nurigo.java_sdk.Coolsms;
import net.nurigo.java_sdk.api.Message;
import net.nurigo.java_sdk.exceptions.CoolsmsException;

public class Util {

	public static String base64ToImgDecoder(String img, String src, String userId, String realSrc) {

		String[] tmpArray = img.split(",");
		String[] imgInfo = tmpArray[0].split(";");
		String[] extArray = imgInfo[0].split("/");

		String base64 = tmpArray[1];
		String ext = extArray[1];

		byte[] base64toBaty = DatatypeConverter.parseBase64Binary(base64);

		System.out.println(base64);
		System.out.println(ext);

		String filePath = src + "/resources/images/userimage/profile/" + userId + "_profileimage." + ext;

		File target = new File(filePath);

		if (!target.exists()) {
			BufferedImage bufImg = null;
			try {
				bufImg = ImageIO.read(new ByteArrayInputStream(base64toBaty));
				ImageIO.write(bufImg, ext, target);

			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
				return null;
			}
			return realSrc + "/resources/images/userimage/profile/" + userId + "_profileimage." + ext;

		} else {
			return null;
		}

	}

	public static int randomFun() {

		int num = (int) ((Math.random() * 43) + 48);
		
		if(num > 57 && num < 65) {
			num = randomFun();
		}
		
		return num;
	}

	public boolean mailSendFun(String email, String str, String subject) {

		JavaMailSenderImpl bean = new JavaMailSenderImpl();
		bean.setHost("smtp.gmail.com");
		bean.setPort(587);
		bean.setUsername("skgogo13@gmail.com");
		bean.setPassword("!atiati8426");
		bean.setDefaultEncoding("utf-8");
		
		Properties prop = new Properties();

		prop.setProperty("mail.transport.protocol", "smtp");
		prop.setProperty("mail.smtp.auth", "true");
		prop.setProperty("mail.smtp.starttls.enable", "true");
		prop.setProperty("mail.debug", "true");

		bean.setJavaMailProperties(prop);

		System.out.println(email);

		MimeMessage message = bean.createMimeMessage();

		try {
			message.setSubject(subject);
			message.setText(str, "utf-8", "html");
			message.addRecipient(RecipientType.TO, new InternetAddress(email));
			bean.send(message);
			return true;
		} catch (MessagingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return false;
		}

	}

	public String signUpEmail(String email) {

		String randomStr = "";

		for (int i = 0; i < 10; i++) {
			randomStr += (char) randomFun();
		}

		String context = "<div style=\"\r\n" + "    display: block;\r\n" + "    border: 1px solid #ccc;\r\n"
				+ "    border-radius: 10px;\r\n" + "    padding: 15px;\r\n" + "    width: max-content;\r\n"
				+ "    height: max-content;\r\n" + "\">\r\n" + "    <p style=\"\r\n" + "    font-size: 14pt;\r\n"
				+ "    font-weight: 600;\r\n" + "    letter-spacing: 0.5pt;\r\n" + "\">안녕하세요.</p>\r\n"
				+ "    <p>본 메일은 회원님의 가입에 필요한 인증에 관한 메일입니다.</p>\r\n"
				+ "    <p>아래 번호를 인증번호를 확인해주시고, 입력란에 기입해주시기 바랍니다.</p>\r\n" + "    <fieldset style=\"\r\n"
				+ "    display: block;\r\n" + "    border-top: 1px solid #eee;\r\n"
				+ "    border-bottom: 1px solid #eee;\r\n" + "    margin: 25px 0;\r\n"
				+ "\"><legend>인증 번호</legend>\r\n" + "        <p>" + randomStr + "</p>\r\n" + "    </fieldset>\r\n"
				+ "    <p>감사합니다.</p>\r\n" + "</div>";

		Util util = new Util();

		boolean res = util.mailSendFun(email, context, "메일 인증 메일 입니다.");

		if (res) {
			return randomStr;
		} else {
			return null;
		}

	}

	
	public String smsCheckFun(String phone, String context) {
		
		String randomStr = "";

		for (int i = 0; i < 10; i++) {
			randomStr += (char) randomFun();
		}
		
		String api_key = "NCSNB4JTJRJ8APFZ";
	    String api_secret = "THL2PIFYNGALXKNUFAFQZVDK7AHAVST8";
	    Message coolsms = new Message(api_key, api_secret);

	    // 4 params(to, from, type, text) are mandatory. must be filled
	    HashMap<String, String> params = new HashMap<String, String>();
	    params.put("to", phone);
	    params.put("from", "01095392777");
	    params.put("type", "SMS");
	    params.put("text", context + "[ 인증번호 : " + randomStr + " ]");
	    params.put("app_version", "test app 1.2"); // application name and version

	    try {
	      JSONObject obj = (JSONObject) coolsms.send(params);
	      System.out.println(obj.toString());
	    } catch (CoolsmsException e) {
	      System.out.println(e.getMessage());
	      System.out.println(e.getCode());
	    }
	    
	    return randomStr;
	}
	
	public static String restRequest(String _method, String _url, String _context_type, Map<String, String> params) {
		
		URL url = null;
		
		HttpURLConnection conn = null;
		
		StringBuilder res = null;
		
		try {
			url = new URL(_url);
			
			
			conn = (HttpURLConnection) url.openConnection();
			
			conn.setConnectTimeout(5000);
			conn.setReadTimeout(5000);
			
			Set<Entry<String, String>> paramsEntry = params.entrySet();
			Iterator<Entry<String, String>> il = paramsEntry.iterator();

			while(il.hasNext()) {
				
				Entry<String, String> item = il.next();
				
				String key = item.getKey();
				String value = item.getValue();
				
				conn.addRequestProperty(key, value);
				
			}
			
			if(_context_type != null) {
				conn.addRequestProperty("Content-Type",_context_type);
			}
			
			conn.setRequestMethod(_method);
			
			res = new StringBuilder();
			
			if(conn.getResponseCode() == HttpURLConnection.HTTP_OK) {
				
				BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream(),"utf-8"));
				
				String line = null;
				
				while((line = reader.readLine()) != null) {
					
					res.append(line).append("\n");
					
				}
				
				reader.close();
			}
			
		} catch (MalformedURLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} finally {
			
			conn.disconnect();
		}
		
		return res.toString();
	}
	
}