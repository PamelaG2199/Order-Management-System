import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  errorMessage = '';

  constructor(private orderService: OrderService, private router: Router) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.errorMessage = '';
      },
      error: () => {
        this.errorMessage = 'Failed to load orders. Please ensure JSON Server is running on port 3000.';
      }
    });
  }

  editOrder(id: number): void {
    this.router.navigate(['/orders/edit', id]);
  }

  deleteOrder(order: Order): void {
    if (confirm(`Are you sure you want to delete order "${order.orderNumber}"?\nThis action cannot be undone.`)) {
      this.orderService.deleteOrder(order.id!).subscribe({
        next: () => this.loadOrders(),
        error: () => {
          this.errorMessage = 'Failed to delete the order. Please try again.';
        }
      });
    }
  }

  getStatusClass(status: string): { [key: string]: boolean } {
    return {
      'bg-warning text-dark': status === 'Pending',
      'bg-info text-dark':    status === 'Processing',
      'bg-primary':           status === 'Shipped',
      'bg-success':           status === 'Delivered',
      'bg-danger':            status === 'Cancelled'
    };
  }

  getTotalAmount(order: Order): number {
    return order.quantity * order.unitPrice;
  }
}
