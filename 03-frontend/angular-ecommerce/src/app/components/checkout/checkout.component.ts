import { JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { KarolShopFormService } from 'src/app/services/karol-shop-form.service';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { KarolShopValidators } from 'src/app/validators/karol-shop-validators';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  checkoutFormGroup!: FormGroup;
  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];
  states: State[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  constructor(private formBuilder: FormBuilder,
    private karolShopFormService: KarolShopFormService,
    private cartService: CartService,
    private checkoutService:CheckoutService,
    private router: Router) { }

  ngOnInit(): void {
    this.reviewCartDetails();

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          KarolShopValidators.notOnlyWhiteSpace]),
        lastName: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          KarolShopValidators.notOnlyWhiteSpace]),
        email: new FormControl('',
          [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group(
        {
          street: new FormControl('',
            [Validators.required,
            Validators.minLength(2),
            KarolShopValidators.notOnlyWhiteSpace]),
          city: new FormControl('',
            [Validators.required,
            Validators.minLength(2),
            KarolShopValidators.notOnlyWhiteSpace]),
          state: new FormControl('', [Validators.required]),
          country: new FormControl('', [Validators.required]),
          zipCode: new FormControl('',
            [Validators.required,
            Validators.minLength(2),
            KarolShopValidators.notOnlyWhiteSpace]),
        }),
      billingAddress: this.formBuilder.group(
        {
          street: new FormControl('',
            [Validators.required,
            Validators.minLength(2),
            KarolShopValidators.notOnlyWhiteSpace]),
          city: new FormControl('',
            [Validators.required,
            Validators.minLength(2),
            KarolShopValidators.notOnlyWhiteSpace]),
          state: new FormControl('', [Validators.required]),
          country: new FormControl('', [Validators.required]),
          zipCode: new FormControl('',
            [Validators.required,
            Validators.minLength(2),
            KarolShopValidators.notOnlyWhiteSpace]),
        }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('',[Validators.required]),
        nameOnCard: new FormControl('',[Validators.required,Validators.minLength(2),KarolShopValidators.notOnlyWhiteSpace]),
        cardNumber: new FormControl('',[Validators.required,KarolShopValidators.notOnlyWhiteSpace,Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('',[Validators.required,KarolShopValidators.notOnlyWhiteSpace,Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: ['']
      })
    });

    //populate credit card months
    const startMonth: number = new Date().getMonth() + 1;
    console.log("startMonth: " + startMonth);

    this.karolShopFormService.getCreditCardMonths(startMonth).subscribe(
      (data: number[]) => {
        console.log("Retrieved credit card months: " + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );
    //populate credit card years

    this.karolShopFormService.getCreditCardYears().subscribe(
      data => {
        console.log("retrieved credit card years: " + JSON.stringify(data));
        this.creditCardYears = data;
      }
    );

    //populate credit card months
    this.karolShopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log('retrieved credit card months: ' + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );

    //populate Countries
    this.karolShopFormService.getCountries().subscribe(
      data => {
        console.log("Retrieved countries: " + JSON.stringify(data));
        this.countries = data;
      }
    );
  }
  reviewCartDetails() {
    //subscribe to cartService.totalQuantity
    this.cartService.totalQuantity.subscribe(
      totalQuantity=>this.totalQuantity=totalQuantity
    );

    //subscribe to cartService.totalPrice
    this.cartService.totalPrice.subscribe(
      totalPrice=>this.totalPrice=totalPrice
    );
  }

  onSubmit() {
    console.log("Handlig the submit button");

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    console.log(this.checkoutFormGroup.get('customer')?.value);
    console.log("The email address is " + this.checkoutFormGroup.get('customer')?.value.email);
    console.log("the shipping address country is " + this.checkoutFormGroup.get('shippingAddress')?.value.country.name);
    console.log("the billing address country is " + this.checkoutFormGroup.get('billingAddress')?.value.country.name);

    //set up order;
    let order=new Order();
    order.totalPrice=this.totalPrice;
    order.totalQuantity=this.totalQuantity;

    //get cart items
    const cartItems=this.cartService.cartItems;

    //create orderItems from cartItems 
    let orderItems: OrderItem[]=cartItems.map(tempCartItem=>new OrderItem(tempCartItem));

    //set up purchase
    let purchase = new Purchase();

    //populate purchase - customer
    purchase.customer=this.checkoutFormGroup.controls['customer'].value;

    //populate purchase - shipping address
    purchase.shippingAddress=this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State=JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country=JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state=shippingState.name;
    purchase.shippingAddress.country=shippingCountry.name;

    //populate purchase - billing address
    purchase.billingAddress=this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State=JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country=JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state=billingState.name;
    purchase.billingAddress.country=billingCountry.name;

    //populate purchase - order and orderItems
    purchase.order=order;
    purchase.orderItems=orderItems;

    //call REST API via the CheckoutService
    this.checkoutService.placeOrder(purchase).subscribe(
      {
        next:response=>{
          alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);

          //reset cart
          this.resetCart();

        },
        error: err=>{
          alert(`There was an error: ${err.message}`);
        }
      }
    );

  }


  resetCart() {
    //reset cart data
    this.cartService.cartItems=[];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    //reset the form
    this.checkoutFormGroup.reset();

    //navigate back to the products page
    this.router.navigateByUrl('/products');
  }

  get firstName() { return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName'); }
  get email() { return this.checkoutFormGroup.get('customer.email'); }

  get shippingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street'); }
  get shippingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city'); }
  get shippingAddressCountry() { return this.checkoutFormGroup.get('shippingAddress.country'); }
  get shippingAddressState() { return this.checkoutFormGroup.get('shippingAddress.state'); }
  get shippingAddressZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode');}

  get billingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street'); }
  get billingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingAddressCountry() { return this.checkoutFormGroup.get('billingAddress.country'); }
  get billingAddressState() { return this.checkoutFormGroup.get('billingAddress.state'); }
  get billingAddressZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode'); }

  get creditCardType() { return this.checkoutFormGroup.get('creditCard.cardType');}
  get creditCardNameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard');}
  get creditCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber');}
  get creditCardSecurityCode() { return this.checkoutFormGroup.get('creditCard.securityCode');}

  copyShippingAddressToBillingAddress(event: any) {
    if (event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress'].setValue(this.checkoutFormGroup.controls['shippingAddress'].value);
      this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();

      this.billingAddressStates = [];
    }
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear);

    //if the current year equals the selected year, then start with the current month

    let startMonth: number;

    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }
  }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    if (formGroup === null) throw new Error('formGroup is null');

    const countryCode = formGroup.value.country.code;
    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName} country name: ${formGroup.value.country.name}`);

    this.karolShopFormService.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;
        } else {
          this.billingAddressStates = data;
        }

        //select first item by default
        formGroup.get('state')?.setValue(data[0]);
      }
    );

  }

}
