package com.javabite.controller;

import com.javabite.dto.BookingResponse;
import com.javabite.dto.OrderRequest;
import com.javabite.dto.OrderResponse;
import com.javabite.entity.*;
import com.javabite.repository.*;
import com.javabite.service.MenuItemService;
import com.javabite.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
@RequiredArgsConstructor
public class CustomerController {

    // Repositories
    private final BookingRepository bookingRepository;
    private final CoffeeTableRepository tableRepository;
    private final UserRepository userRepository;

    // Services
    private final MenuItemService menuItemService;
    private final OrderService orderService;

    /*---------------------------------------------
     ✅ BOOKING ENDPOINTS
     ---------------------------------------------*/

    /*---------------------------------------------
     ✅ GET AVAILABLE TABLES BY DATE + SLOT + GUESTS
     ---------------------------------------------*/
    @GetMapping("/tables/available")
    public ResponseEntity<?> getAvailableTables(
            @RequestParam LocalDate date,
            @RequestParam String slot,
            @RequestParam Integer guests
    ) {
        try {
            System.out.println("🔍 Finding tables for: date=" + date + ", slot=" + slot + ", guests=" + guests);

            List<CoffeeTable> candidates = tableRepository.findAvailableTablesByCapacity(guests);
            System.out.println("✅ Found " + candidates.size() + " candidate tables");

            List<String> bookedTableIds = bookingRepository.findConflictsByDateAndSlot(date, slot)
                    .stream()
                    .map(b -> b.getTable().getId())
                    .collect(Collectors.toList());

            System.out.println("📊 Booked table IDs: " + bookedTableIds);

            List<CoffeeTable> available = candidates.stream()
                    .filter(t -> !bookedTableIds.contains(t.getId()))
                    .collect(Collectors.toList());

            System.out.println("🎯 Final available tables: " + available.size());
            return ResponseEntity.ok(available);
        } catch (Exception e) {
            System.err.println("❌ Error in getAvailableTables: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /*---------------------------------------------
     ✅ GET USER ACTIVE BOOKING - UPDATED WITH DTO
     ---------------------------------------------*/
    @GetMapping("/booking/active/{userId}")
    public ResponseEntity<?> getActiveBooking(@PathVariable String userId) {
        try {
            System.out.println("🔍 Fetching active booking for user: " + userId);

            // Check if user exists
            if (!userRepository.existsById(userId)) {
                System.out.println("❌ User not found: " + userId);
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            System.out.println("✅ User exists, querying active bookings...");
            List<Booking> active = bookingRepository.findActiveBooking(userId);
            System.out.println("✅ Found " + active.size() + " active bookings");

            if (active.isEmpty()) {
                System.out.println("ℹ️ No active bookings found for user: " + userId);
                return ResponseEntity.ok(null);
            }

            // ✅ Convert to DTO to avoid lazy loading issues
            BookingResponse response = BookingResponse.fromEntity(active.get(0));
            System.out.println("✅ Returning booking response");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ ERROR in getActiveBooking: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /*---------------------------------------------
     ✅ CREATE BOOKING (ENHANCED VERSION) - UPDATED WITH DTO
     ---------------------------------------------*/
    @PostMapping("/book")
    public ResponseEntity<?> createBooking(@RequestBody Booking request) {
        try {
            System.out.println("📥 Creating booking request: " + request);

            // Validate user
            User user = userRepository.findById(request.getUser().getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            System.out.println("✅ User validated: " + user.getName());

            // Validate table
            CoffeeTable table = tableRepository.findById(request.getTable().getId())
                    .orElseThrow(() -> new RuntimeException("Table not found"));
            System.out.println("✅ Table validated: " + table.getTableNumber());

            // Check if table is available
            if (table.getStatus() != CoffeeTable.TableStatus.AVAILABLE) {
                System.out.println("❌ Table not available. Current status: " + table.getStatus());
                return ResponseEntity.badRequest().body(
                        Map.of("error", "Table not available right now")
                );
            }

            // Check if user has active bookings
            long active = bookingRepository.countActiveBookings(
                    user.getId(),
                    List.of(
                            Booking.BookingStatus.PENDING,
                            Booking.BookingStatus.CONFIRMED,
                            Booking.BookingStatus.IN_PROGRESS
                    )
            );

            if (active > 0) {
                System.out.println("❌ User already has active bookings: " + active);
                return ResponseEntity.badRequest().body(
                        Map.of("error", "You already have an active booking.")
                );
            }

            // Check for booking conflicts
            List<Booking> conflicts = bookingRepository.findConflicts(
                    table.getId(),
                    request.getBookingDate(),
                    request.getSlot()
            );

            if (!conflicts.isEmpty()) {
                System.out.println("❌ Booking conflicts found: " + conflicts.size());
                return ResponseEntity.badRequest().body(
                        Map.of("error", "Table already booked for this date and slot")
                );
            }

            // Build booking with all fields
            Booking booking = Booking.builder()
                    .user(user)
                    .table(table)
                    .bookingDate(request.getBookingDate())
                    .slot(request.getSlot())
                    .duration(request.getDuration())
                    .numberOfGuests(request.getNumberOfGuests())
                    .specialRequests(request.getSpecialRequests())
                    .status(Booking.BookingStatus.PENDING)
                    .build();

            System.out.println("💾 Saving booking to database...");
            Booking saved = bookingRepository.save(booking);

            // Update table status
            table.setStatus(CoffeeTable.TableStatus.RESERVED);
            tableRepository.save(table);
            System.out.println("✅ Table status updated to RESERVED");

            // ✅ Return DTO instead of entity
            BookingResponse response = BookingResponse.fromEntity(saved);
            System.out.println("✅ Booking created successfully: " + response.getId());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Error in createBooking: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /*---------------------------------------------
     ✅ GET ALL BOOKINGS FOR CUSTOMER - UPDATED WITH DTO
     ---------------------------------------------*/
    @GetMapping("/bookings/{userId}")
    public ResponseEntity<?> getBookings(@PathVariable String userId) {
        try {
            System.out.println("🔍 Getting all bookings for user: " + userId);

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Booking> bookings = bookingRepository.findByUser(user);
            System.out.println("✅ Found " + bookings.size() + " total bookings");

            // ✅ Convert to DTOs
            List<BookingResponse> responses = bookings.stream()
                    .map(BookingResponse::fromEntity)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            System.err.println("❌ Error in getBookings: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /*---------------------------------------------
     ✅ GET MY BOOKINGS (ALIAS FOR /bookings/{userId}) - UPDATED WITH DTO
     ---------------------------------------------*/
    @GetMapping("/my-bookings/{userId}")
    public ResponseEntity<?> getMyBookings(@PathVariable String userId) {
        try {
            System.out.println("🔍 Getting 'my bookings' for user: " + userId);

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Booking> bookings = bookingRepository.findByUser(user);

            // ✅ Convert to DTOs
            List<BookingResponse> responses = bookings.stream()
                    .map(BookingResponse::fromEntity)
                    .collect(Collectors.toList());

            System.out.println("✅ Returning " + responses.size() + " bookings");
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            System.err.println("❌ Error in getMyBookings: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /*---------------------------------------------
     ✅ CANCEL BOOKING - UPDATED WITH DTO
     ---------------------------------------------*/
    @PutMapping("/booking/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable String id) {
        try {
            System.out.println("🗑️ Cancelling booking: " + id);

            Booking booking = bookingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            System.out.println("✅ Booking found. Current status: " + booking.getStatus());

            // Only allow cancellation for pending/confirmed bookings
            if (booking.getStatus() != Booking.BookingStatus.PENDING &&
                    booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
                return ResponseEntity.badRequest().body(
                        Map.of("error", "Cannot cancel booking with status: " + booking.getStatus())
                );
            }

            booking.setStatus(Booking.BookingStatus.CANCELLED);
            bookingRepository.save(booking);
            System.out.println("✅ Booking status updated to CANCELLED");

            CoffeeTable table = booking.getTable();
            table.setStatus(CoffeeTable.TableStatus.AVAILABLE);
            tableRepository.save(table);
            System.out.println("✅ Table status updated to AVAILABLE");

            // ✅ Return DTO
            BookingResponse response = BookingResponse.fromEntity(booking);
            return ResponseEntity.ok(Map.of(
                    "message", "Booking cancelled successfully",
                    "booking", response
            ));
        } catch (Exception e) {
            System.err.println("❌ Error in cancelBooking: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /*---------------------------------------------
     ✅ GET BOOKING BY ID - NEW ENDPOINT
     ---------------------------------------------*/
    @GetMapping("/booking/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable String id) {
        try {
            System.out.println("🔍 Getting booking by ID: " + id);

            Booking booking = bookingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            // ✅ Convert to DTO
            BookingResponse response = BookingResponse.fromEntity(booking);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error in getBookingById: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /*---------------------------------------------
     ✅ UPDATE BOOKING - NEW ENDPOINT
     ---------------------------------------------*/
    @PutMapping("/booking/{id}")
    public ResponseEntity<?> updateBooking(@PathVariable String id, @RequestBody Booking updateRequest) {
        try {
            System.out.println("✏️ Updating booking: " + id);

            Booking booking = bookingRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            // Only allow updates for pending bookings
            if (booking.getStatus() != Booking.BookingStatus.PENDING) {
                return ResponseEntity.badRequest().body(
                        Map.of("error", "Cannot update booking with status: " + booking.getStatus())
                );
            }

            // Update allowed fields
            if (updateRequest.getNumberOfGuests() != null) {
                booking.setNumberOfGuests(updateRequest.getNumberOfGuests());
            }
            if (updateRequest.getSpecialRequests() != null) {
                booking.setSpecialRequests(updateRequest.getSpecialRequests());
            }
            if (updateRequest.getDuration() != null) {
                booking.setDuration(updateRequest.getDuration());
            }

            Booking updated = bookingRepository.save(booking);

            // ✅ Return DTO
            BookingResponse response = BookingResponse.fromEntity(updated);
            return ResponseEntity.ok(Map.of(
                    "message", "Booking updated successfully",
                    "booking", response
            ));
        } catch (Exception e) {
            System.err.println("❌ Error in updateBooking: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /*---------------------------------------------
     ✅ DEBUG ENDPOINT
     ---------------------------------------------*/
    @GetMapping("/debug/{userId}")
    public ResponseEntity<?> debugUserBookings(@PathVariable String userId) {
        try {
            System.out.println("🔍 DEBUG: Checking bookings for user: " + userId);

            // Check if user exists
            boolean userExists = userRepository.existsById(userId);
            System.out.println("✅ User exists: " + userExists);

            if (!userExists) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            // Test simple count
            long bookingCount = bookingRepository.countByUserId(userId);
            System.out.println("✅ Total bookings for user: " + bookingCount);

            // Test active booking query
            try {
                List<Booking> activeBookings = bookingRepository.findActiveBooking(userId);
                System.out.println("✅ Active bookings found: " + activeBookings.size());

                if (!activeBookings.isEmpty()) {
                    // Test DTO conversion
                    BookingResponse testDto = BookingResponse.fromEntity(activeBookings.get(0));
                    System.out.println("✅ DTO conversion successful: " + testDto.getId());
                }
            } catch (Exception e) {
                System.err.println("❌ Active booking query failed: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.badRequest().body(Map.of("error", "Active booking query failed: " + e.getMessage()));
            }

            return ResponseEntity.ok(Map.of(
                    "userExists", userExists,
                    "totalBookings", bookingCount,
                    "message", "Debug completed successfully"
            ));

        } catch (Exception e) {
            System.err.println("❌ DEBUG Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /*---------------------------------------------
     ✅ MENU & ORDERING ENDPOINTS
     ---------------------------------------------*/

    // ✅ Get available menu items for customers
    @GetMapping("/menu")
    public ResponseEntity<List<MenuItem>> getCustomerMenu() {
        try {
            List<MenuItem> menuItems = menuItemService.getAvailableMenuItems();
            return ResponseEntity.ok(menuItems);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ✅ Place new order
    @PostMapping("/order")
    public ResponseEntity<?> placeOrder(@RequestBody OrderRequest orderRequest) {
        try {
            OrderResponse orderResponse = orderService.createCustomerOrder(orderRequest);
            return ResponseEntity.ok(orderResponse);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error placing order: " + e.getMessage());
        }
    }

    // ✅ Get customer's order history
    @GetMapping("/orders/{userId}")
    public ResponseEntity<?> getCustomerOrders(@PathVariable String userId) {
        try {
            List<OrderResponse> orders = orderService.getOrdersByUser(userId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching orders: " + e.getMessage());
        }
    }

    // ✅ Get specific order details
    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getOrderDetails(@PathVariable String orderId) {
        try {
            OrderResponse order = orderService.getOrderById(orderId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching order: " + e.getMessage());
        }
    }

    // ✅ Cancel order (only if pending)
    @PutMapping("/order/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable String orderId) {
        try {
            OrderResponse cancelledOrder = orderService.cancelOrder(orderId);
            return ResponseEntity.ok(cancelledOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error cancelling order: " + e.getMessage());
        }
    }
    // Add these to your CustomerController

    // ✅ Get customer profile
    // Add these endpoints to your CustomerController

    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getCustomerProfile(@PathVariable String userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Return basic profile info
            Map<String, Object> profile = Map.of(
                    "name", user.getName(),
                    "email", user.getEmail(),
                    "phone", user.getPhone() != null ? user.getPhone() : ""
            );

            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching profile: " + e.getMessage());
        }
    }

    @PutMapping("/profile/{userId}")
    public ResponseEntity<?> updateCustomerProfile(@PathVariable String userId,
                                                   @RequestBody Map<String, String> profileData) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Update allowed fields
            if (profileData.containsKey("name") && profileData.get("name") != null) {
                user.setName(profileData.get("name").trim());
            }
            if (profileData.containsKey("phone") && profileData.get("phone") != null) {
                user.setPhone(profileData.get("phone").trim());
            }

            User updatedUser = userRepository.save(user);

            // Return updated profile
            Map<String, Object> profile = Map.of(
                    "name", updatedUser.getName(),
                    "email", updatedUser.getEmail(),
                    "phone", updatedUser.getPhone() != null ? updatedUser.getPhone() : ""
            );

            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error updating profile: " + e.getMessage());
        }
    }
}