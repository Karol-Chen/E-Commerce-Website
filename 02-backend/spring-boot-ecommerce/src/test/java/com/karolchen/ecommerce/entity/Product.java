package com.karolchen.ecommerce.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.math.BigDecimal;

@Entity
@Table(name="product")
@Data
public class Product {
    private Long id;
    private String sku;
    private String name;
    private String description;
    private BigDecimal unitPirce;

    public void setId(Long id) {
        this.id = id;
    }

    @Id
    public Long getId() {
        return id;
    }
}
