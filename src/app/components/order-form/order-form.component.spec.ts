import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';

import { OrderFormComponent } from './order-form.component';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';

// ─── Helper: build a valid form payload ──────────────────────────────────────
const VALID_FORM_VALUE = {
  orderNumber:  'ORD-1001',
  customerName: 'Alice Johnson',
  productName:  'Laptop',
  quantity:     2,
  unitPrice:    75000,
  status:       'Pending',
  orderDate:    '2026-03-01'
};

const mockOrder: Order = { id: 1, ...VALID_FORM_VALUE };

// ─────────────────────────────────────────────────────────────────────────────
// ADD MODE (no id in route)
// ─────────────────────────────────────────────────────────────────────────────
describe('OrderFormComponent — Add Mode', () => {
  let component: OrderFormComponent;
  let fixture: ComponentFixture<OrderFormComponent>;
  let orderServiceSpy: jasmine.SpyObj<OrderService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('OrderService', ['getOrderById', 'createOrder', 'updateOrder']);

    await TestBed.configureTestingModule({
      declarations: [OrderFormComponent],
      imports: [ReactiveFormsModule, RouterTestingModule, CommonModule],
      providers: [
        { provide: OrderService, useValue: spy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({}) } }
        }
      ]
    }).compileComponents();

    orderServiceSpy = TestBed.inject(OrderService) as jasmine.SpyObj<OrderService>;
    fixture = TestBed.createComponent(OrderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be in add mode (isEditMode = false)', () => {
    expect(component.isEditMode).toBeFalse();
    expect(component.orderId).toBeNull();
  });

  it('should initialise the form with empty/default values', () => {
    expect(component.orderForm.get('orderNumber')?.value).toBe('');
    expect(component.orderForm.get('status')?.value).toBe('Pending');
  });

  it('should mark form invalid when all fields are empty', () => {
    component.orderForm.reset();
    expect(component.orderForm.invalid).toBeTrue();
  });

  it('should fail validation for orderNumber not matching ORD-NNNN pattern', () => {
    component.f['orderNumber'].setValue('INVALID');
    expect(component.f['orderNumber'].errors?.['pattern']).toBeTruthy();
  });

  it('should fail validation for customerName shorter than 3 characters', () => {
    component.f['customerName'].setValue('AB');
    expect(component.f['customerName'].errors?.['minlength']).toBeTruthy();
  });

  it('should fail validation for quantity less than 1', () => {
    component.f['quantity'].setValue(0);
    expect(component.f['quantity'].errors?.['min']).toBeTruthy();
  });

  it('should fail validation for unitPrice ≤ 0', () => {
    component.f['unitPrice'].setValue(0);
    expect(component.f['unitPrice'].errors?.['min']).toBeTruthy();
  });

  it('should NOT submit and should set submitted flag when form is invalid', () => {
    component.orderForm.reset();
    component.onSubmit();
    expect(orderServiceSpy.createOrder).not.toHaveBeenCalled();
    expect(component.submitted).toBeTrue();
  });

  it('should call createOrder on valid form submit', () => {
    orderServiceSpy.createOrder.and.returnValue(of(mockOrder));
    component.orderForm.setValue(VALID_FORM_VALUE);
    component.onSubmit();
    expect(orderServiceSpy.createOrder).toHaveBeenCalledWith(VALID_FORM_VALUE as Order);
  });

  it('should set errorMessage when createOrder fails', () => {
    orderServiceSpy.createOrder.and.returnValue(throwError(() => new Error('Server error')));
    component.orderForm.setValue(VALID_FORM_VALUE);
    component.onSubmit();
    expect(component.errorMessage).toContain('Failed to create');
  });

  it('onCancel() should navigate to /orders', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    component.onCancel();
    expect(router.navigate).toHaveBeenCalledWith(['/orders']);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// EDIT MODE (id = 1 in route)
// ─────────────────────────────────────────────────────────────────────────────
describe('OrderFormComponent — Edit Mode', () => {
  let component: OrderFormComponent;
  let fixture: ComponentFixture<OrderFormComponent>;
  let orderServiceSpy: jasmine.SpyObj<OrderService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('OrderService', ['getOrderById', 'createOrder', 'updateOrder']);
    spy.getOrderById.and.returnValue(of(mockOrder));

    await TestBed.configureTestingModule({
      declarations: [OrderFormComponent],
      imports: [ReactiveFormsModule, RouterTestingModule, CommonModule],
      providers: [
        { provide: OrderService, useValue: spy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } }
        }
      ]
    }).compileComponents();

    orderServiceSpy = TestBed.inject(OrderService) as jasmine.SpyObj<OrderService>;
    fixture = TestBed.createComponent(OrderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be in edit mode (isEditMode = true)', () => {
    expect(component.isEditMode).toBeTrue();
    expect(component.orderId).toBe(1);
  });

  it('should load order data into the form', () => {
    expect(orderServiceSpy.getOrderById).toHaveBeenCalledWith(1);
    expect(component.f['orderNumber'].value).toBe('ORD-1001');
    expect(component.f['customerName'].value).toBe('Alice Johnson');
  });

  it('should call updateOrder on valid form submit', () => {
    orderServiceSpy.updateOrder.and.returnValue(of(mockOrder));
    component.orderForm.setValue(VALID_FORM_VALUE);
    component.onSubmit();
    expect(orderServiceSpy.updateOrder).toHaveBeenCalledWith(1, { ...VALID_FORM_VALUE, id: 1 });
  });

  it('should set errorMessage when updateOrder fails', () => {
    orderServiceSpy.updateOrder.and.returnValue(throwError(() => new Error('Update failed')));
    component.orderForm.setValue(VALID_FORM_VALUE);
    component.onSubmit();
    expect(component.errorMessage).toContain('Failed to update');
  });

  it('should set errorMessage when getOrderById fails on reload', () => {
    orderServiceSpy.getOrderById.and.returnValue(throwError(() => new Error('Not found')));
    // Simulate a fresh load call with error
    component['loadOrder'](99);
    expect(component.errorMessage).toContain('Failed to load');
  });
});
