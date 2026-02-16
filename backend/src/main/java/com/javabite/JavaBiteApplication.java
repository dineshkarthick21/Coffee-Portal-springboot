package com.javabite;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class JavaBiteApplication {

	public static void main(String[] args) {
		// Set system properties for MongoDB SSL
		System.setProperty("jdk.tls.client.protocols", "TLSv1.2,TLSv1.3");
		System.setProperty("https.protocols", "TLSv1.2,TLSv1.3");
		
		SpringApplication.run(JavaBiteApplication.class, args);
	}

}
