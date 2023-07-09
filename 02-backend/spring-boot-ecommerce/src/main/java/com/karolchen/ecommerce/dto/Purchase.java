package com.karolchen.ecommerce.dto;

import com.karolchen.ecommerce.entity.Address;
import com.karolchen.ecommerce.entity.Customer;
import com.karolchen.ecommerce.entity.Order;
import com.karolchen.ecommerce.entity.OrderItem;
import lombok.Data;

import java.util.Set;

@Data
public class Purchase {
    private Customer customer;
    private Address shippingAddress;
    private Address billingAddress;
    private Order order;
    private Set<OrderItem> orderItems;
}
