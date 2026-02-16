package com.javabite.service;

import com.javabite.entity.CoffeeTable;
import com.javabite.entity.Order;
import com.javabite.entity.Booking;
import com.javabite.repository.CoffeeTableRepository;
import com.javabite.repository.OrderRepository;
import com.javabite.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WaiterService {

    private final OrderRepository orderRepository;
    private final CoffeeTableRepository coffeeTableRepository;
    private final BookingRepository bookingRepository;

    // ✅ Get orders that are ready to serve
    public List<Order> getReadyOrders() {
        return orderRepository.findByStatus(Order.OrderStatus.READY);
    }

    // ✅ Mark order as served, then mark booking completed and table available
    public Order serveOrder(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(Order.OrderStatus.SERVED);
        orderRepository.save(order);

        // Update table + booking if linked
        if (order.getBooking() != null) {
            Booking booking = order.getBooking();
            booking.setStatus(Booking.BookingStatus.COMPLETED);
            bookingRepository.save(booking);

            CoffeeTable table = booking.getTable();
            table.setStatus(CoffeeTable.TableStatus.AVAILABLE);
            coffeeTableRepository.save(table);
        }

        return order;
    }

    // ✅ View all tables (for Waiter)
    public List<CoffeeTable> getAllTables() {
        return coffeeTableRepository.findAll();
    }
}
