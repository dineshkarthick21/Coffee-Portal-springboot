package com.javabite.controller;

import com.javabite.entity.MenuItem;
import com.javabite.repository.MenuItemRepository;
import com.javabite.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.nio.file.*;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/menu")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class MenuController {

    @Autowired
    private FileService fileService;

    private final MenuItemRepository menuItemRepository;

    public MenuController(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    /**
     * ✅ Get all menu items
     */
    @GetMapping
    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }

    /**
     * ✅ Add new menu item (with image upload)
     */
    @PostMapping("/add")
    public ResponseEntity<?> addMenuItem(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") BigDecimal price,
            @RequestParam("category") String category,
            @RequestParam(value = "preparationTime", required = false, defaultValue = "5") Integer prepTime,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {

        try {
            String imageUrl = null;
            if (imageFile != null && !imageFile.isEmpty()) {
                String fileName = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();
                Path uploadPath = Paths.get("uploads/menu/");
                if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);
                Files.copy(imageFile.getInputStream(), uploadPath.resolve(fileName),
                        StandardCopyOption.REPLACE_EXISTING);
                imageUrl = "/uploads/menu/" + fileName;
            }

            MenuItem item = MenuItem.builder()
                    .name(name)
                    .description(description)
                    .price(price)
                    .category(MenuItem.Category.valueOf(category.toUpperCase()))
                    .available(true)
                    .preparationTime(prepTime)
                    .imageUrl(imageUrl)
                    .build();

            menuItemRepository.save(item);
            return ResponseEntity.ok("Menu item added successfully.");
        } catch (Exception e) {
            e.printStackTrace(); // ✅ add this line
            return ResponseEntity.badRequest().body("Error adding item: " + e.getMessage());
        }
    }

    /**
     * ✅ Edit existing menu item
     */
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateMenuItem(
            @PathVariable String id,
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam BigDecimal price,
            @RequestParam String category,
            @RequestParam Integer preparationTime,
            @RequestParam(required = false) MultipartFile image) {

        return menuItemRepository.findById(id).map(existing -> {
            existing.setName(name);
            existing.setDescription(description);
            existing.setPrice(price);
            existing.setCategory(category);
            existing.setPreparationTime(preparationTime);

            if (image != null && !image.isEmpty()) {
                String imagePath = fileService.saveImage(image, "uploads/menu/");
                existing.setImageUrl(imagePath);
            }

            return ResponseEntity.ok(menuItemRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteMenuItem(@PathVariable String id) {
        if (!menuItemRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        menuItemRepository.deleteById(id);
        return ResponseEntity.ok("Menu item deleted successfully");
    }
}

