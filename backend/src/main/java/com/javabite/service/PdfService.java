package com.javabite.service;

import com.javabite.entity.Order;
import com.javabite.entity.OrderItem;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Slf4j
public class PdfService {

    public byte[] generateReceiptPdf(Order order) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Header
            Paragraph header = new Paragraph("JavaBite Coffee Shop")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(20)
                    .setBold();
            document.add(header);

            Paragraph subHeader = new Paragraph("Order Receipt")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(16)
                    .setMarginBottom(20);
            document.add(subHeader);

            // Order Details
            document.add(new Paragraph("Order Details:").setBold().setMarginBottom(10));

            Table detailsTable = new Table(2);
            detailsTable.setWidth(UnitValue.createPercentValue(100));

            detailsTable.addCell(createCell("Order Number:", true));
            detailsTable.addCell(createCell("#" + order.getId().toString(), false));

            detailsTable.addCell(createCell("Order Date:", true));
            detailsTable.addCell(createCell(
                    order.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), false));

            detailsTable.addCell(createCell("Customer:", true));
            detailsTable.addCell(createCell(order.getUser().getName(), false));

            detailsTable.addCell(createCell("Status:", true));
            detailsTable.addCell(createCell(order.getStatus().toString(), false));

            document.add(detailsTable);
            document.add(new Paragraph("\n"));

            // Order Items
            document.add(new Paragraph("Order Items:").setBold().setMarginBottom(10));

            Table itemsTable = new Table(4);
            itemsTable.setWidth(UnitValue.createPercentValue(100));

            // Table Header
            itemsTable.addHeaderCell(createCell("Item", true));
            itemsTable.addHeaderCell(createCell("Qty", true));
            itemsTable.addHeaderCell(createCell("Unit Price", true));
            itemsTable.addHeaderCell(createCell("Total", true));

            // Table Rows
            for (OrderItem item : order.getOrderItems()) {
                itemsTable.addCell(createCell(item.getMenuItem().getName(), false));
                itemsTable.addCell(createCell(String.valueOf(item.getQuantity()), false));
                itemsTable.addCell(createCell("₹" + item.getUnitPrice(), false));
                itemsTable.addCell(createCell(
                        "₹" + item.getUnitPrice().multiply(
                                java.math.BigDecimal.valueOf(item.getQuantity())), false));
            }

            // Total Row - Fixed column span issue
            itemsTable.addCell(createCell("", false, 3));
            itemsTable.addCell(createCell("₹" + order.getTotalAmount(), true));

            document.add(itemsTable);
            document.add(new Paragraph("\n"));

            // Special Instructions
            if (order.getSpecialInstructions() != null && !order.getSpecialInstructions().isEmpty()) {
                document.add(new Paragraph("Special Instructions:").setBold());
                document.add(new Paragraph(order.getSpecialInstructions())
                        .setItalic().setMarginBottom(10));
            }

            // Thank You Message
            Paragraph thankYou = new Paragraph("Thank you for your order at JavaBite!")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setItalic()
                    .setMarginTop(20);
            document.add(thankYou);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Error generating receipt PDF for order {}: {}", order.getId(), e.getMessage());
            throw new RuntimeException("Failed to generate receipt PDF");
        }
    }

    public byte[] generateInvoicePdf(Order order) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Invoice Header
            Paragraph header = new Paragraph("TAX INVOICE")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(18)
                    .setBold();
            document.add(header);

            Paragraph companyHeader = new Paragraph("JavaBite Coffee Shop")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(16)
                    .setMarginBottom(20);
            document.add(companyHeader);

            // Invoice Details in two columns
            float[] columnWidths = {1, 1};
            Table invoiceTable = new Table(columnWidths);
            invoiceTable.setWidth(UnitValue.createPercentValue(100));

            // Left Column - Company Info
            Cell leftCell = new Cell();
            leftCell.add(new Paragraph("JavaBite Coffee Shop").setBold());
            leftCell.add(new Paragraph("123 Coffee Street"));
            leftCell.add(new Paragraph("Bangalore, Karnataka 560001"));
            leftCell.add(new Paragraph("GSTIN: 29ABCDE1234F1Z2"));
            leftCell.add(new Paragraph("Phone: +91 9876543210"));
            invoiceTable.addCell(leftCell);

            // Right Column - Invoice Details
            Cell rightCell = new Cell();
            rightCell.add(new Paragraph("Invoice No: INV-" + order.getId()).setBold());
            rightCell.add(new Paragraph("Date: " +
                    order.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))));
            rightCell.add(new Paragraph("Time: " +
                    order.getCreatedAt().format(DateTimeFormatter.ofPattern("HH:mm"))));
            rightCell.add(new Paragraph("Order #: " + order.getId()));
            invoiceTable.addCell(rightCell);

            document.add(invoiceTable);
            document.add(new Paragraph("\n"));

            // Customer Details
            document.add(new Paragraph("Bill To:").setBold().setMarginBottom(5));
            Table customerTable = new Table(2);
            customerTable.setWidth(UnitValue.createPercentValue(100));

            customerTable.addCell(createCell("Name:", true));
            customerTable.addCell(createCell(order.getUser().getName(), false));

            customerTable.addCell(createCell("Email:", true));
            customerTable.addCell(createCell(order.getUser().getEmail(), false));

            if (order.getUser().getPhone() != null) {
                customerTable.addCell(createCell("Phone:", true));
                customerTable.addCell(createCell(order.getUser().getPhone(), false));
            }

            document.add(customerTable);
            document.add(new Paragraph("\n"));

            // Items Table with GST
            document.add(new Paragraph("Item Details:").setBold().setMarginBottom(10));

            Table itemsTable = new Table(6);
            itemsTable.setWidth(UnitValue.createPercentValue(100));

            // Table Header
            itemsTable.addHeaderCell(createCell("Sr No", true));
            itemsTable.addHeaderCell(createCell("Item Description", true));
            itemsTable.addHeaderCell(createCell("HSN/SAC", true));
            itemsTable.addHeaderCell(createCell("Qty", true));
            itemsTable.addHeaderCell(createCell("Unit Price", true));
            itemsTable.addHeaderCell(createCell("Amount", true));

            // Table Rows
            int srNo = 1;
            for (OrderItem item : order.getOrderItems()) {
                itemsTable.addCell(createCell(String.valueOf(srNo++), false));
                itemsTable.addCell(createCell(item.getMenuItem().getName(), false));
                itemsTable.addCell(createCell("999311", false)); // Sample HSN code for restaurant services
                itemsTable.addCell(createCell(String.valueOf(item.getQuantity()), false));
                itemsTable.addCell(createCell("₹" + item.getUnitPrice(), false));
                itemsTable.addCell(createCell(
                        "₹" + item.getUnitPrice().multiply(
                                java.math.BigDecimal.valueOf(item.getQuantity())), false));
            }

            document.add(itemsTable);
            document.add(new Paragraph("\n"));

            // Total Calculation
            float[] totalWidths = {3, 1, 1, 1};
            Table totalTable = new Table(totalWidths);
            totalTable.setWidth(UnitValue.createPercentValue(100));

            totalTable.addCell(createCell("", false));
            totalTable.addCell(createCell("Subtotal:", true));
            totalTable.addCell(createCell("", false));
            totalTable.addCell(createCell("₹" + order.getTotalAmount(), false));

            // Calculate GST (5% for restaurant services)
            java.math.BigDecimal gstRate = new java.math.BigDecimal("0.05");
            java.math.BigDecimal gstAmount = order.getTotalAmount().multiply(gstRate);
            java.math.BigDecimal totalWithGst = order.getTotalAmount().add(gstAmount);

            totalTable.addCell(createCell("", false));
            totalTable.addCell(createCell("GST (5%):", true));
            totalTable.addCell(createCell("", false));
            totalTable.addCell(createCell("₹" + gstAmount, false));

            totalTable.addCell(createCell("", false));
            totalTable.addCell(createCell("Total:", true).setBold());
            totalTable.addCell(createCell("", false));
            totalTable.addCell(createCell("₹" + totalWithGst, false).setBold());

            document.add(totalTable);
            document.add(new Paragraph("\n"));

            // Terms and Conditions
            document.add(new Paragraph("Terms & Conditions:").setBold().setMarginBottom(5));
            List<String> terms = java.util.List.of(
                    "1. This is a computer generated invoice",
                    "2. Goods once sold will not be taken back",
                    "3. All disputes subject to Bangalore jurisdiction",
                    "4. E. & O.E."
            );

            for (String term : terms) {
                document.add(new Paragraph(term).setMarginBottom(2));
            }

            document.add(new Paragraph("\n"));
            Paragraph signature = new Paragraph("Authorized Signatory")
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setMarginTop(20);
            document.add(signature);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Error generating invoice PDF for order {}: {}", order.getId(), e.getMessage());
            throw new RuntimeException("Failed to generate invoice PDF");
        }
    }

    private Cell createCell(String content, boolean isHeader) {
        return createCell(content, isHeader, 1);
    }

    private Cell createCell(String content, boolean isHeader, int colSpan) {
        Cell cell = new Cell(1, colSpan).add(new Paragraph(content));
        if (isHeader) {
            cell.setBold();
        }
        return cell;
    }
}