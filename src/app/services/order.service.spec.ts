import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { OrderService } from './order.service';
import { Order } from '../models/order.model';
import { environment } from '../../environments/environment';

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/orders`;

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrderService]
    });
    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── GET /orders ──────────────────────────────────────────────────
  it('getOrders() should return all orders via GET', () => {
    service.getOrders().subscribe(orders => {
      expect(orders.length).toBe(2);
      expect(orders).toEqual(mockOrders);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockOrders);
  });

  // ── GET /orders/:id ──────────────────────────────────────────────
  it('getOrderById() should return a single order via GET', () => {
    service.getOrderById(1).subscribe(order => {
      expect(order).toEqual(mockOrders[0]);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockOrders[0]);
  });

  // ── POST /orders ─────────────────────────────────────────────────
  it('createOrder() should add an order via POST', () => {
    const newOrder: Order = {
      orderNumber: 'ORD-1003', customerName: 'Carol Williams',
      productName: 'USB-C Hub', quantity: 5, unitPrice: 2500,
      status: 'Pending', orderDate: '2026-03-03'
    };
    const savedOrder: Order = { ...newOrder, id: 3 };

    service.createOrder(newOrder).subscribe(order => {
      expect(order).toEqual(savedOrder);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newOrder);
    req.flush(savedOrder);
  });

  // ── PUT /orders/:id ──────────────────────────────────────────────
  it('updateOrder() should update an order via PUT', () => {
    const updatedOrder: Order = { ...mockOrders[0], status: 'Delivered' };

    service.updateOrder(1, updatedOrder).subscribe(order => {
      expect(order.status).toBe('Delivered');
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedOrder);
    req.flush(updatedOrder);
  });

  // ── DELETE /orders/:id ───────────────────────────────────────────
  it('deleteOrder() should remove an order via DELETE', () => {
    service.deleteOrder(1).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
