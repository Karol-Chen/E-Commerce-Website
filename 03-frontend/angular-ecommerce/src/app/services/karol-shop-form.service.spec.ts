import { TestBed } from '@angular/core/testing';

import { KarolShopFormService } from './karol-shop-form.service';

describe('KarolShopFormService', () => {
  let service: KarolShopFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KarolShopFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
