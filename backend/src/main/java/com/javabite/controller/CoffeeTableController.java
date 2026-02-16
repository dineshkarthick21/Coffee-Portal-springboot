package com.javabite.controller;

import com.javabite.entity.CoffeeTable;
import com.javabite.repository.CoffeeTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/tables")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class CoffeeTableController {

    private final CoffeeTableRepository tableRepository;

    // ✅ Create new table (Admin)
    @PostMapping("/add")
    public ResponseEntity<?> createTable(@RequestBody CoffeeTable table) {
        if (table.getTableNumber() == null || table.getTableNumber().isEmpty()) {
            return ResponseEntity.badRequest().body("Table number is required");
        }

        if (tableRepository.findByTableNumber(table.getTableNumber()) != null) {
            return ResponseEntity.badRequest().body("Table number already exists");
        }

        table.setStatus(CoffeeTable.TableStatus.AVAILABLE);
        CoffeeTable saved = tableRepository.save(table);
        return ResponseEntity.ok(saved);
    }

    // ✅ Get all tables
    @GetMapping
    public ResponseEntity<List<CoffeeTable>> getAllTables() {
        return ResponseEntity.ok(tableRepository.findAll());
    }

    // ✅ Get single table
    @GetMapping("/{id}")
    public ResponseEntity<?> getTable(@PathVariable String id) {
        return tableRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.badRequest().body("Table not found"));
    }

    // ✅ Update table
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateTable(
            @PathVariable String id,
            @RequestBody CoffeeTable updatedTable) {

        var optional = tableRepository.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.badRequest().body("Table not found");
        }

        CoffeeTable existing = optional.get();
        existing.setCapacity(updatedTable.getCapacity());
        existing.setLocation(updatedTable.getLocation());
        existing.setDescription(updatedTable.getDescription());
        existing.setStatus(updatedTable.getStatus());

        CoffeeTable saved = tableRepository.save(existing);
        return ResponseEntity.ok(saved);
    }



    // ✅ Delete table
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteTable(@PathVariable String id) {
        if (!tableRepository.existsById(id)) {
            return ResponseEntity.badRequest().body("Table not found");
        }
        tableRepository.deleteById(id);
        return ResponseEntity.ok("Table deleted successfully");
    }
}
