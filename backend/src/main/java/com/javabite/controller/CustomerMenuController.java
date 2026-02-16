package com.javabite.controller;

import com.javabite.entity.MenuItem;
import com.javabite.repository.MenuItemRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/customer")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class CustomerMenuController {

    private final MenuItemRepository menuItemRepository;

    public CustomerMenuController(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    /**
     * ✅ Get all available menu items for customers
     */
    @GetMapping("/menu")
    public List<MenuItem> getAvailableMenu() {
        return menuItemRepository.findByAvailableTrue();
    }

    /**
     * ✅ Get menu items by category for customers
     */
    @GetMapping("/menu/category/{category}")
    public List<MenuItem> getMenuByCategory(@PathVariable String category) {
        try {
            MenuItem.Category cat = MenuItem.Category.valueOf(category.toUpperCase());
            return menuItemRepository.findByCategoryAndAvailableTrue(cat);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid category: " + category);
        }
    }

    /**
     * ✅ Search menu items for customers    
     */
    @GetMapping("/menu/search")
    public List<MenuItem> searchMenu(@RequestParam String query) {
        return menuItemRepository.searchMenuItems(query);
    }
}