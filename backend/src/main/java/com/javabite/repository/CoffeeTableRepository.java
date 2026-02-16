package com.javabite.repository;

import com.javabite.entity.CoffeeTable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CoffeeTableRepository extends MongoRepository<CoffeeTable, String> {

    long countByStatus(String status);
    List<CoffeeTable> findByStatus(CoffeeTable.TableStatus status);
    List<CoffeeTable> findByCapacityGreaterThanEqual(Integer capacity);
    List<CoffeeTable> findByCapacityBetween(Integer minCapacity, Integer maxCapacity);
    CoffeeTable findByTableNumber(String tableNumber);
    List<CoffeeTable> findByLocationContainingIgnoreCase(String location);
    List<CoffeeTable> findByStatusIn(List<CoffeeTable.TableStatus> statuses);
    List<CoffeeTable> findByStatusOrderByTableNumberAsc(CoffeeTable.TableStatus status);
    List<CoffeeTable> findByStatusAndCapacityGreaterThanEqual(CoffeeTable.TableStatus status, Integer capacity);

    // Helper method
    default List<CoffeeTable> findAvailableTablesByCapacity(Integer capacity) {
        return findByStatusAndCapacityGreaterThanEqual(CoffeeTable.TableStatus.AVAILABLE, capacity);
    }
}