package com.javabite.service;

import com.javabite.entity.Order;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import com.javabite.entity.Booking;

import java.io.ByteArrayInputStream;
import java.time.format.DateTimeFormatter;

@Slf4j  // 🔥 ADD THIS LINE

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Send welcome email to new customers after registration
     */
    /**
     * Send welcome email to new customers after registration
     */
    @Async
    public void sendWelcomeEmail(String toEmail, String userName) {
        // DEBUG: Find where this is being called from
        System.out.println("🚨 DEBUG: sendWelcomeEmail called!");
        System.out.println("📧 To: " + toEmail);
        System.out.println("👤 Name: " + userName);
        System.out.println("📞 Full call stack:");

        // Print the full call stack to see where this is called from
        Thread.dumpStack();

        System.out.println("⏸️  TEMPORARILY SKIPPING WELCOME EMAIL FOR TESTING");
        return; // TEMPORARILY SKIP ALL WELCOME EMAILS

    /*
    try {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(toEmail);
        helper.setSubject("Welcome to JavaBite! ☕");

        // HTML Welcome Email Content
        String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #8B4513, #A0522D); color: white; padding: 30px 20px; text-align: center; }
                    .content { padding: 30px; }
                    .welcome-section { background: #f8f5f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B4513; }
                    .features { margin: 25px 0; }
                    .feature-item { display: flex; align-items: center; margin: 12px 0; }
                    .feature-icon { font-size: 20px; margin-right: 12px; }
                    .cta-button { display: inline-block; background: #8B4513; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                    .footer { background: #2c3e50; color: #ecf0f1; padding: 20px; text-align: center; font-size: 12px; }
                    .social-links { margin: 15px 0; }
                    .social-links a { color: #8B4513; text-decoration: none; margin: 0 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0; font-size: 28px;">☕ JavaBite Coffee</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Coffee Journey Begins Here</p>
                    </div>

                    <div class="content">
                        <h2 style="color: #8B4513; margin-bottom: 10px;">Hello, %s! 👋</h2>
                        <p style="font-size: 16px; line-height: 1.6; color: #555;">
                            Thank you for choosing JavaBite! We're absolutely thrilled to welcome you to our community of coffee enthusiasts.
                        </p>

                        <div class="welcome-section">
                            <h3 style="color: #8B4513; margin-top: 0;">🎉 Your Account is Ready!</h3>
                            <p style="margin: 0; color: #666;">
                                Your JavaBite account has been successfully created and you're all set to start your coffee adventure.
                            </p>
                        </div>

                        <div class="features">
                            <h3 style="color: #8B4513;">Here's what you can do now:</h3>

                            <div class="feature-item">
                                <span class="feature-icon">☕</span>
                                <span><strong>Explore Our Menu</strong> - Discover our carefully crafted coffee selections</span>
                            </div>

                            <div class="feature-item">
                                <span class="feature-icon">🚀</span>
                                <span><strong>Quick Ordering</strong> - Order your favorites in just a few taps</span>
                            </div>

                            <div class="feature-item">
                                <span class="feature-icon">⭐</span>
                                <span><strong>Earn Rewards</strong> - Get points with every purchase</span>
                            </div>

                            <div class="feature-item">
                                <span class="feature-icon">📱</span>
                                <span><strong>Track Orders</strong> - Real-time updates on your coffee journey</span>
                            </div>
                        </div>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="%s" class="cta-button">Start Your Coffee Journey →</a>
                        </div>

                        <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center;">
                            <p style="margin: 0; color: #666; font-size: 14px;">
                                <strong>Need help?</strong> Our support team is always here to assist you at
                                <a href="mailto:support@javabite.com" style="color: #8B4513;">support@javabite.com</a>
                            </p>
                        </div>
                    </div>

                    <div class="footer">
                        <div class="social-links">
                            <a href="#">Facebook</a> •
                            <a href="#">Instagram</a> •
                            <a href="#">Twitter</a>
                        </div>
                        <p style="margin: 10px 0; opacity: 0.8;">
                            JavaBite Coffee Shop © 2024<br>
                            Crafting perfect coffee experiences, one cup at a time
                        </p>
                        <p style="margin: 5px 0; opacity: 0.6; font-size: 11px;">
                            This is an automated message. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName, frontendUrl);

        helper.setText(htmlContent, true);
        mailSender.send(message);

        System.out.println("✅ Welcome email sent successfully to: " + toEmail);

    } catch (MessagingException e) {
        System.err.println("❌ Failed to send welcome email to " + toEmail + ": " + e.getMessage());
        fallbackWelcomeEmail(toEmail, userName);
    } catch (Exception e) {
        System.err.println("❌ Unexpected error sending welcome email: " + e.getMessage());
        fallbackWelcomeEmail(toEmail, userName);
    }
    */
    }

    // Add these methods to your existing EmailService class

    /**
     * Send staff credentials to waiter and chef
     */
    /**
     * Send staff credentials to waiter and chef
     */
    // Add these methods to your existing EmailService class

    /**
     * Send order receipt with PDF attachment
     */
    // In your EmailService.java, replace these two methods:

    /**
     * Send order receipt with PDF attachment
     */
    @Async
    public boolean sendOrderReceipt(String toEmail, String customerName, Order order,
                                    byte[] pdfAttachment, String attachmentName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("✅ JavaBite - Order Receipt #" + order.getId());

            String htmlContent = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 25px 20px; text-align: center; }
                .content { padding: 30px; }
                .order-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .footer { background: #2c3e50; color: #ecf0f1; padding: 20px; text-align: center; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 24px;">✅ Order Receipt</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">JavaBite Coffee Shop</p>
                </div>
                
                <div class="content">
                    <h2 style="color: #28a745; margin-bottom: 10px;">Thank you, %s! 🎉</h2>
                    <p style="font-size: 16px; line-height: 1.6; color: #555;">
                        Your order receipt is attached. We appreciate your business!
                    </p>
                    
                    <div class="order-details">
                        <h3 style="color: #28a745; margin-top: 0;">📦 Order Summary</h3>
                        <p><strong>Order ID:</strong> #%s</p>
                        <p><strong>Amount:</strong> ₹%s</p>
                        <p><strong>Date:</strong> %s</p>
                        <p><strong>Status:</strong> <span style="color: #28a745;">%s</span></p>
                    </div>

                    <div style="background: #e7f3ff; padding: 15px; border-radius: 6px;">
                        <p style="margin: 0; color: #004085; font-size: 14px;">
                            📎 <strong>Receipt attached:</strong> %s<br>
                            💡 Keep this receipt for your records and any warranty claims.
                        </p>
                    </div>
                </div>
                
                <div class="footer">
                    <p style="margin: 10px 0; opacity: 0.8;">
                        Need help with your order? Contact us at 
                        <a href="mailto:support@javabite.com" style="color: #ecf0f1;">support@javabite.com</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """.formatted(
                    customerName,
                    order.getId().toString(),
                    order.getTotalAmount().toString(),
                    order.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                    order.getStatus().toString(),
                    attachmentName
            );

            helper.setText(htmlContent, true);

            // 🔥 FIX: Use ByteArrayResource instead of ByteArrayInputStream
            helper.addAttachment(attachmentName,
                    new org.springframework.core.io.ByteArrayResource(pdfAttachment),
                    "application/pdf");

            mailSender.send(message);
            log.info("✅ Order receipt email sent to: {}", toEmail);
            return true;

        } catch (Exception e) {
            log.error("❌ Failed to send order receipt email: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Send order invoice with PDF attachment
     */
    @Async
    public boolean sendOrderInvoice(String toEmail, String customerName, Order order,
                                    byte[] pdfAttachment, String attachmentName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("🧾 JavaBite - Tax Invoice #" + order.getId());

            String htmlContent = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #6610f2, #6f42c1); color: white; padding: 25px 20px; text-align: center; }
                .content { padding: 30px; }
                .invoice-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .footer { background: #2c3e50; color: #ecf0f1; padding: 20px; text-align: center; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 24px;">🧾 Tax Invoice</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">JavaBite Coffee Shop</p>
                </div>
                
                <div class="content">
                    <h2 style="color: #6610f2; margin-bottom: 10px;">Invoice for %s</h2>
                    <p style="font-size: 16px; line-height: 1.6; color: #555;">
                        Your tax invoice is attached. This is a valid GST invoice.
                    </p>
                    
                    <div class="invoice-details">
                        <h3 style="color: #6610f2; margin-top: 0;">💰 Invoice Details</h3>
                        <p><strong>Invoice No:</strong> INV-%s</p>
                        <p><strong>Order ID:</strong> #%s</p>
                        <p><strong>Total Amount:</strong> ₹%s</p>
                        <p><strong>Invoice Date:</strong> %s</p>
                        <p><strong>GSTIN:</strong> 29ABCDE1234F1Z2</p>
                    </div>

                    <div style="background: #e7f3ff; padding: 15px; border-radius: 6px;">
                        <p style="margin: 0; color: #004085; font-size: 14px;">
                            📎 <strong>Invoice attached:</strong> %s<br>
                            💼 This is a valid tax invoice for business and personal records.
                        </p>
                    </div>

                    <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 6px;">
                        <p style="margin: 0; color: #856404; font-size: 14px;">
                            ⚠️ <strong>Important:</strong> This invoice contains GST details and is valid for tax purposes.
                        </p>
                    </div>
                </div>
                
                <div class="footer">
                    <p style="margin: 10px 0; opacity: 0.8;">
                        JavaBite Coffee Shop • GSTIN: 29ABCDE1234F1Z2<br>
                        For invoice queries: <a href="mailto:accounts@javabite.com" style="color: #ecf0f1;">accounts@javabite.com</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """.formatted(
                    customerName,
                    order.getId().toString(),
                    order.getId().toString(),
                    order.getTotalAmount().toString(),
                    order.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                    attachmentName
            );

            helper.setText(htmlContent, true);

            // 🔥 FIX: Use ByteArrayResource instead of ByteArrayInputStream
            helper.addAttachment(attachmentName,
                    new org.springframework.core.io.ByteArrayResource(pdfAttachment),
                    "application/pdf");

            mailSender.send(message);
            log.info("✅ Order invoice email sent to: {}", toEmail);
            return true;

        } catch (Exception e) {
            log.error("❌ Failed to send order invoice email: {}", e.getMessage());
            return false;
        }
    }
    @Async
    public void sendStaffCredentials(String toEmail, String staffName, String role, String loginEmail, String password) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("🎉 Welcome to JavaBite Team - Your Staff Account");

            String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #8B4513, #A0522D); color: white; padding: 30px 20px; text-align: center; }
                    .content { padding: 30px; }
                    .credentials-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
                    .login-info { background: #e7f3ff; padding: 15px; border-radius: 6px; margin: 15px 0; }
                    .footer { background: #2c3e50; color: #ecf0f1; padding: 20px; text-align: center; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0; font-size: 28px;">👨‍💼 JavaBite Staff Account</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Welcome to Our Team!</p>
                    </div>
                    
                    <div class="content">
                        <h2 style="color: #8B4513; margin-bottom: 10px;">Hello, %s! 👋</h2>
                        <p style="font-size: 16px; line-height: 1.6; color: #555;">
                            Your staff account has been created successfully. Welcome to the JavaBite family!
                        </p>
                        
                        <div class="credentials-box">
                            <h3 style="color: #28a745; margin-top: 0;">🔐 Your Login Credentials</h3>
                            <p><strong>Role:</strong> <span style="color: #8B4513;">%s</span></p>
                            
                            <div class="login-info">
                                <h4 style="color: #0056b3; margin-top: 0;">📧 Login Email:</h4>
                                <p style="background: white; padding: 10px; border-radius: 4px; border: 1px solid #ddd; font-weight: bold; color: #8B4513;">
                                    %s
                                </p>
                                
                                <h4 style="color: #0056b3; margin-top: 15px;">🔑 Password:</h4>
                                <p style="background: white; padding: 10px; border-radius: 4px; border: 1px solid #ddd; font-weight: bold; color: #8B4513; font-size: 18px;">
                                    %s
                                </p>
                            </div>
                            
                            <p style="color: #dc3545; font-size: 14px; margin-top: 15px; padding: 10px; background: #ffe6e6; border-radius: 4px;">
                                ⚠️ <strong>Important:</strong> Please change your password after first login for security.
                            </p>
                        </div>

                        <div style="background: #e7f3ff; padding: 15px; border-radius: 6px; margin-top: 20px;">
                            <p style="margin: 0; color: #004085; font-size: 14px;">
                                <strong>📱 Next Steps:</strong><br>
                                1. Login to the staff portal using the credentials above<br>
                                2. Change your password immediately<br>
                                3. Familiarize yourself with the system<br>
                                4. Contact admin for any questions
                            </p>
                        </div>

                        <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 6px;">
                            <p style="margin: 0; color: #856404; font-size: 14px;">
                                <strong>🔒 Security Notice:</strong> Keep your login credentials secure and do not share them with anyone.
                            </p>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p style="margin: 10px 0; opacity: 0.8;">
                            JavaBite Coffee Shop © 2024<br>
                            Need help? Contact admin at <a href="mailto:admin@javabite.com" style="color: #ecf0f1;">admin@javabite.com</a>
                        </p>
                        <p style="margin: 5px 0; opacity: 0.6; font-size: 11px;">
                            This is an automated message. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(staffName, role, loginEmail, password);

            helper.setText(htmlContent, true);
            mailSender.send(message);

            System.out.println("✅ Staff credentials email sent to: " + toEmail);
            System.out.println("📧 Email: " + loginEmail);
            System.out.println("🔑 Password: " + password);

        } catch (MessagingException e) {
            System.err.println("❌ Failed to send staff credentials email: " + e.getMessage());
            fallbackStaffCredentials(toEmail, staffName, role, loginEmail, password);
        }
    }
    /**
     * Send booking confirmation email
     */
    @Async
    public void sendBookingConfirmation(String toEmail, String customerName, Booking booking) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("✅ JavaBite - Booking Confirmation");

            String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #8B4513, #A0522D); color: white; padding: 25px 20px; text-align: center; }
                    .content { padding: 30px; }
                    .booking-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .footer { background: #2c3e50; color: #ecf0f1; padding: 20px; text-align: center; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0; font-size: 24px;">✅ Booking Confirmed</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">JavaBite Coffee Shop</p>
                    </div>
                    
                    <div class="content">
                        <h2 style="color: #8B4513; margin-bottom: 10px;">Hello, %s! 👋</h2>
                        <p style="font-size: 16px; line-height: 1.6; color: #555;">
                            Your table booking has been confirmed. We look forward to serving you!
                        </p>
                        
                        <div class="booking-details">
                            <h3 style="color: #8B4513; margin-top: 0;">📅 Booking Details</h3>
                            <p><strong>Booking ID:</strong> #%s</p>
                            <p><strong>Date:</strong> %s</p>
                            <p><strong>Time Slot:</strong> %s</p>
                            <p><strong>Table:</strong> %s</p>
                            <p><strong>Guests:</strong> %d people</p>
                            <p><strong>Status:</strong> <span style="color: #28a745;">%s</span></p>
                        </div>

                        <div style="background: #e7f3ff; padding: 15px; border-radius: 6px;">
                            <p style="margin: 0; color: #004085; font-size: 14px;">
                                <strong>📍 Location:</strong> JavaBite Coffee Shop<br>
                                <strong>📞 Contact:</strong> +1 234 567 8900<br>
                                <strong>⏰ Please arrive 5 minutes before your booking time.</strong>
                            </p>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p style="margin: 10px 0; opacity: 0.8;">
                            Need to modify your booking? Contact us at <a href="mailto:support@javabite.com" style="color: #ecf0f1;">support@javabite.com</a>
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                    customerName,
                    booking.getId().toString(),
                    booking.getBookingDate().toString(),
                    booking.getSlot(),
                    booking.getTable().getTableNumber(),
                    booking.getTable().getCapacity(),
                    booking.getStatus().toString()
            );

            helper.setText(htmlContent, true);
            mailSender.send(message);

            System.out.println("✅ Booking confirmation email sent to: " + toEmail);

        } catch (MessagingException e) {
            System.err.println("❌ Failed to send booking confirmation: " + e.getMessage());
        }
    }

    /**
     * Send order status update email
     */
    @Async
    public void sendOrderStatusUpdate(String toEmail, String customerName, String orderId, String status, String items) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("📦 JavaBite - Order Status Update");

            String statusColor = getStatusColor(status);
            String statusIcon = getStatusIcon(status);

            String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #8B4513, #A0522D); color: white; padding: 25px 20px; text-align: center; }
                    .content { padding: 30px; }
                    .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; }
                    .footer { background: #2c3e50; color: #ecf0f1; padding: 20px; text-align: center; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0; font-size: 24px;">%s Order Update</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">JavaBite Coffee Shop</p>
                    </div>
                    
                    <div class="content">
                        <h2 style="color: #8B4513; margin-bottom: 10px;">Hello, %s!</h2>
                        <p style="font-size: 16px; line-height: 1.6; color: #555;">
                            Your order status has been updated:
                        </p>
                        
                        <div style="text-align: center; margin: 25px 0;">
                            <div class="status-badge" style="background-color: %s;">
                                %s %s
                            </div>
                        </div>

                        <div style="background: #f8f9fa; padding: 15px; border-radius: 6px;">
                            <p><strong>Order ID:</strong> #%s</p>
                            <p><strong>Items:</strong> %s</p>
                            <p><strong>Last Updated:</strong> %s</p>
                        </div>

                        <div style="margin-top: 20px; padding: 15px; background: #e7f3ff; border-radius: 6px;">
                            <p style="margin: 0; color: #004085; font-size: 14px;">
                                We're working hard to prepare your order. Thank you for your patience!
                            </p>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p style="margin: 10px 0; opacity: 0.8;">
                            Have questions about your order? Contact us at <a href="mailto:support@javabite.com" style="color: #ecf0f1;">support@javabite.com</a>
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                    statusIcon, customerName, statusColor, statusIcon, status,
                    orderId, items, java.time.LocalDateTime.now().toString()
            );

            helper.setText(htmlContent, true);
            mailSender.send(message);

            System.out.println("✅ Order status email sent to: " + toEmail);

        } catch (MessagingException e) {
            System.err.println("❌ Failed to send order status email: " + e.getMessage());
        }
    }

    /**
     * Send payment confirmation email
     */
    @Async
    public void sendPaymentConfirmation(String toEmail, String customerName, String orderId, double amount) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("💳 JavaBite - Payment Confirmation");

            String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 25px 20px; text-align: center; }
                    .content { padding: 30px; }
                    .payment-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .footer { background: #2c3e50; color: #ecf0f1; padding: 20px; text-align: center; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0; font-size: 24px;">✅ Payment Successful</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">JavaBite Coffee Shop</p>
                    </div>
                    
                    <div class="content">
                        <h2 style="color: #28a745; margin-bottom: 10px;">Thank you, %s! 🎉</h2>
                        <p style="font-size: 16px; line-height: 1.6; color: #555;">
                            Your payment has been processed successfully. Your order is being prepared!
                        </p>
                        
                        <div class="payment-details">
                            <h3 style="color: #28a745; margin-top: 0;">💰 Payment Details</h3>
                            <p><strong>Order ID:</strong> #%s</p>
                            <p><strong>Amount Paid:</strong> $%.2f</p>
                            <p><strong>Payment Date:</strong> %s</p>
                            <p><strong>Payment Status:</strong> <span style="color: #28a745;">Completed</span></p>
                        </div>

                        <div style="background: #d4edda; padding: 15px; border-radius: 6px;">
                            <p style="margin: 0; color: #155724; font-size: 14px;">
                                ✅ <strong>Payment confirmed!</strong> Your order is now being processed by our kitchen team.
                            </p>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p style="margin: 10px 0; opacity: 0.8;">
                            Receipt will be sent separately. For any queries, contact <a href="mailto:support@javabite.com" style="color: #ecf0f1;">support@javabite.com</a>
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(customerName, orderId, amount, java.time.LocalDateTime.now().toString());

            helper.setText(htmlContent, true);
            mailSender.send(message);

            System.out.println("✅ Payment confirmation email sent to: " + toEmail);

        } catch (MessagingException e) {
            System.err.println("❌ Failed to send payment confirmation: " + e.getMessage());
        }
    }

    // Helper methods for status icons and colors
    private String getStatusColor(String status) {
        return switch (status.toLowerCase()) {
            case "preparing" -> "#ffc107";
            case "ready" -> "#17a2b8";
            case "completed" -> "#28a745";
            case "cancelled" -> "#dc3545";
            default -> "#6c757d";
        };
    }

    private String getStatusIcon(String status) {
        return switch (status.toLowerCase()) {
            case "preparing" -> "👨‍🍳";
            case "ready" -> "✅";
            case "completed" -> "🎉";
            case "cancelled" -> "❌";
            default -> "📦";
        };
    }

    // Fallback method for staff credentials
    private void fallbackStaffCredentials(String toEmail, String staffName, String role, String email, String password) {
        System.out.println("\n" + "=".repeat(70));
        System.out.println("👨‍💼 STAFF CREDENTIALS (FALLBACK)");
        System.out.println("=".repeat(70));
        System.out.println("To: " + staffName + " <" + toEmail + ">");
        System.out.println("Role: " + role);
        System.out.println("Email: " + email);
        System.out.println("Password: " + password);
        System.out.println("=".repeat(70) + "\n");
    }

    /**
     * Send password reset email
     */
    @Async
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            String resetLink = frontendUrl + "/reset-password?token=" + resetToken;

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("JavaBite - Password Reset Request");

            // HTML Password Reset Email Content
            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
                        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #8B4513, #A0522D); color: white; padding: 25px 20px; text-align: center; }
                        .content { padding: 30px; }
                        .alert-section { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
                        .reset-button { display: inline-block; background: #8B4513; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                        .footer { background: #2c3e50; color: #ecf0f1; padding: 20px; text-align: center; font-size: 12px; }
                        .token-box { background: #f8f9fa; padding: 15px; border-radius: 6px; border: 1px solid #dee2e6; margin: 15px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1 style="margin: 0; font-size: 24px;">🔐 Password Reset</h1>
                            <p style="margin: 10px 0 0 0; opacity: 0.9;">JavaBite Coffee Shop</p>
                        </div>
                        
                        <div class="content">
                            <h2 style="color: #8B4513; margin-bottom: 10px;">Hello!</h2>
                            <p style="font-size: 16px; line-height: 1.6; color: #555;">
                                We received a request to reset your JavaBite account password.
                            </p>
                            
                            <div class="alert-section">
                                <h3 style="color: #856404; margin-top: 0;">⚠️ Important Security Notice</h3>
                                <p style="margin: 0; color: #856404;">
                                    If you didn't request this password reset, please ignore this email. Your account remains secure.
                                </p>
                            </div>

                            <p>To reset your password, click the button below:</p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="%s" class="reset-button">Reset Your Password →</a>
                            </div>

                            <p style="color: #666; font-size: 14px;">
                                Or copy and paste this link in your browser:
                            </p>
                            
                            <div class="token-box">
                                <code style="word-break: break-all; color: #8B4513; font-size: 13px;">
                                    %s
                                </code>
                            </div>

                            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-top: 20px;">
                                <p style="margin: 0; color: #666; font-size: 14px;">
                                    <strong>⚠️ This link will expire in 1 hour.</strong><br>
                                    For security reasons, please reset your password immediately.
                                </p>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p style="margin: 10px 0; opacity: 0.8;">
                                JavaBite Coffee Shop © 2024<br>
                                Need help? Contact us at <a href="mailto:support@javabite.com" style="color: #ecf0f1;">support@javabite.com</a>
                            </p>
                            <p style="margin: 5px 0; opacity: 0.6; font-size: 11px;">
                                This is an automated security message. Please do not reply to this email.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(resetLink, resetLink);

            helper.setText(htmlContent, true);
            mailSender.send(message);

            System.out.println("✅ Password reset email sent successfully to: " + toEmail);

        } catch (MessagingException e) {
            System.err.println("❌ Failed to send password reset email to " + toEmail + ": " + e.getMessage());
            fallbackPasswordResetEmail(toEmail, resetToken);
        } catch (Exception e) {
            System.err.println("❌ Unexpected error sending password reset email: " + e.getMessage());
            fallbackPasswordResetEmail(toEmail, resetToken);
        }
    }

    /**
     * Fallback method for welcome email (console output)
     */
    private void fallbackWelcomeEmail(String toEmail, String userName) {
        System.out.println("\n" + "=".repeat(60));
        System.out.println("📧 WELCOME EMAIL (FALLBACK - Email service unavailable)");
        System.out.println("=".repeat(60));
        System.out.println("👤 To: " + userName + " <" + toEmail + ">");
        System.out.println("🎉 Subject: Welcome to JavaBite! ☕");
        System.out.println("💌 Message: Your account has been successfully created!");
        System.out.println("🌐 Website: " + frontendUrl);
        System.out.println("=".repeat(60) + "\n");
    }

    /**
     * Fallback method for password reset email (console output)
     */
    private void fallbackPasswordResetEmail(String toEmail, String resetToken) {
        String resetLink = frontendUrl + "/reset-password?token=" + resetToken;

        System.out.println("\n" + "=".repeat(70));
        System.out.println("🔐 PASSWORD RESET EMAIL (FALLBACK - Email service unavailable)");
        System.out.println("=".repeat(70));
        System.out.println("📧 To: " + toEmail);
        System.out.println("🔗 Reset Link: " + resetLink);
        System.out.println("⏰ Token: " + resetToken);
        System.out.println("⚠️  Expires: 1 hour");
        System.out.println("=".repeat(70) + "\n");
    }

    /**
     * Utility method to check email service status
     */
    public void testEmailService() {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo("test@example.com");
            helper.setSubject("JavaBite Email Service Test");
            helper.setText("This is a test email from JavaBite email service.", true);

            mailSender.send(message);
            System.out.println("✅ Email service is working correctly");

        } catch (Exception e) {
            System.err.println("❌ Email service test failed: " + e.getMessage());
        }
    }
}