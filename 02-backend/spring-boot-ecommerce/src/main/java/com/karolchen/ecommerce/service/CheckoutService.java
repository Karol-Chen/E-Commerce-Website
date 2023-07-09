package com.karolchen.ecommerce.service;

import com.karolchen.ecommerce.dto.Purchase;
import com.karolchen.ecommerce.dto.PurchaseResponse;

public interface CheckoutService {
    PurchaseResponse placeOrder(Purchase purchase);
}
