package com.javabite.repository;

import com.javabite.entity.MenuItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface MenuItemRepository extends MongoRepository<MenuItem, String> {

    List<MenuItem> findByCategoryAndAvailableTrue(MenuItem.Category category);

    List<MenuItem> findByAvailableTrue();

    List<MenuItem> findByNameContainingIgnoreCaseAndAvailableTrue(String name);

    Optional<MenuItem> findByName(String name);

    List<MenuItem> findByCategoryInAndAvailableTrue(List<MenuItem.Category> categories);

    List<MenuItem> findByPriceBetweenAndAvailableTrue(BigDecimal minPrice, BigDecimal maxPrice);

    long countByAvailableTrue();

    long countByCategoryAndAvailableTrue(MenuItem.Category category);

    List<MenuItem> findByAvailableTrueAndNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description);

    // Helper method
    default List<MenuItem> searchMenuItems(String query) {
        return findByAvailableTrueAndNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query);
    }
}