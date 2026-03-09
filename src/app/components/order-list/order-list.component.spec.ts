import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { OrderListComponent } from './order-list.component';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';

describe('OrderListComponent', () => {
  let component: OrderListComponent;
  let fixture: ComponentFixture<OrderListComponent>;
  let orderServiceSpy: jasmine.SpyObj<OrderService>;

  const mockOrders: Order[] = [
    {
      id: 1, orderNumber: 'ORD-1001', customerName: 'Alice Johnson',
      productName: 'Laptop', quantity: 2, unitPrice: 75000,
      status: 'Pending', orderDate: '2026-03-01'
    },
    {
      id: 2, orderNumber: 'ORD-1002', customerName: 'Bob Smith',
      productName: 'Wireless Mouse', quantity: 10, unitPrice: 1200,
      status: 'Shipped', orderDate: '2026-03-02'
    }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('OrderService', ['getOrders', 'deleteOrder']);
    spy.getOrders.and.returnValue(of(mockOrders));

    await TestBed.configureTestingModule({
      declarations: [OrderListComponent],
      imports: [RouterTestingModule, CommonModule],
      providers: [{ provide: OrderService, useValue: spy }]
    }).compileComponents();

    orderServiceSpy = TestBed.inject(OrderService) as jasmine.SpyObj<OrderService>;
    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load orders on init', () => {
    expect(orderServiceSpy.getOrders).toHaveBeenCalledTimes(1);
    expect(component.orders.length).toBe(2);
    expect(component.orders).toEqual(mockOrders);
  });

  it('should clear errorMessage on successful load', () => {
    component.errorMessage = 'old error';
    component.loadOrders();
    expect(component.errorMessage).toBe('');
  });

  it('should set errorMessage when getOrders fails', () => {
    orderServiceSpy.getOrders.and.returnValue(throwError(() => new Error('Network error')));
    component.loadOrders();
    expect(component.errorMessage).toBeTruthy();
    expect(component.errorMessage).toContain('Failed to load orders');
  });

  it('should navigate to edit route when editOrder is called', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    component.editOrder(1);
    expect(router.navigate).toHaveBeenCalledWith(['/orders/edit', 1]);
  });

  it('should call deleteOrder service method when confirm is true', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    orderServiceSpy.deleteOrder.and.returnValue(of(undefined));
    orderServiceSpy.getOrders.and.returnValue(of(mockOrders));

    component.deleteOrder(mockOrders[0]);

    expect(orderServiceSpy.deleteOrder).toHaveBeenCalledWith(1);
  });

  it('should NOT call deleteOrder service when confirm is cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.deleteOrder(mockOrders[0]);
    expect(orderServiceSpy.deleteOrder).not.toHaveBeenCalled();
  });

  it('should set errorMessage when deleteOrder service fails', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    orderServiceSpy.deleteOrder.and.returnValue(throwError(() => new Error('Delete error')));

    component.deleteOrder(mockOrders[0]);

    expect(component.errorMessage).toContain('Failed to delete');
  });

  it('getStatusClass() should return correct class for each status', () => {
    expect(component.getStatusClass('Pending')['bg-warning text-dark']).toBeTrue();
    expect(component.getStatusClass('Processing')['bg-info text-dark']).toBeTrue();
    expect(component.getStatusClass('Shipped')['bg-primary']).toBeTrue();
    expect(component.getStatusClass('Delivered')['bg-success']).toBeTrue();
    expect(component.getStatusClass('Cancelled')['bg-danger']).toBeTrue();
  });

  it('getTotalAmount() should return quantity * unitPrice', () => {
    expect(component.getTotalAmount(mockOrders[0])).toBe(150000);
    expect(component.getTotalAmount(mockOrders[1])).toBe(12000);
  });
});
