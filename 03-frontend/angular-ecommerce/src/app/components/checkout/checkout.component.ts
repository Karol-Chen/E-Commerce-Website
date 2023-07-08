import { JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { KarolShopFormService } from 'src/app/services/karol-shop-form.service';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { KarolShopValidators } from 'src/app/validators/karol-shop-validators';

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
    private karolShopFormService: KarolShopFormService) { }

  ngOnInit(): void {
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
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
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

  onSubmit() {
    console.log("Handlig the submit button");

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
    }

    console.log(this.checkoutFormGroup.get('customer')?.value);
    console.log("The email address is " + this.checkoutFormGroup.get('customer')?.value.email);
    console.log("the shipping address country is " + this.checkoutFormGroup.get('shippingAddress')?.value.country.name);
    console.log("the billing address country is " + this.checkoutFormGroup.get('billingAddress')?.value.country.name);
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
