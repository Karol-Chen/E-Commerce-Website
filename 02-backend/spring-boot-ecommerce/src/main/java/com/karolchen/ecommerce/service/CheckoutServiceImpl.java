package com.karolchen.ecommerce.service;

import com.karolchen.ecommerce.dao.CustomerRepository;
import com.karolchen.ecommerce.dto.Purchase;
import com.karolchen.ecommerce.dto.PurchaseResponse;
import com.karolchen.ecommerce.entity.Customer;
import com.karolchen.ecommerce.entity.Order;
import com.karolchen.ecommerce.entity.OrderItem;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;

@Service
public class CheckoutServiceImpl implements CheckoutService{

    private CustomerRepository customerRepository;

    public CheckoutServiceImpl(CustomerRepository customerRepository){
        this.customerRepository=customerRepository;
    }

    @Override
    @Transactional
    public PurchaseResponse placeOrder(Purchase purchase) {
        //retrive the order info from dto
        Order order=purchase.getOrder();

        //generate tracking number
        String orderTrackingNumber=generatedOrderTrackingNumber();
        order.setOrderTrackingNumber(orderTrackingNumber);

        //populate order with orderItems
        Set<OrderItem> orderItems = purchase.getOrderItems();
        orderItems.forEach(item->order.add(item));

        //populate order with billingAddress and shippingAddress
        order.setShippingAddress(purchase.getShippingAddress());
        order.setBillingAddress(purchase.getBillingAddress());

        //populate customer with order
        Customer customer=purchase.getCustomer();
        customer.add(order);

        //save to the database
        customerRepository.save(customer);

        //return a response
        return new PurchaseResponse(orderTrackingNumber);
    }

    private String generatedOrderTrackingNumber() {
        //generated a random UUID numer(UUID version-4)
        return UUID.randomUUID().toString();
    }
}
