import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent implements OnInit {
  orderForm!: FormGroup;
  isEditMode = false;
  orderId: number | null = null;
  errorMessage = '';
  submitted = false;

  readonly statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.orderId = +id;
      this.loadOrder(this.orderId);
    }
  }

  private initForm(): void {
    this.orderForm = this.fb.group({
      orderNumber:  ['', [Validators.required, Validators.pattern(/^ORD-\d{4}$/)]],
      customerName: ['', [Validators.required, Validators.minLength(3)]],
      productName:  ['', [Validators.required, Validators.minLength(2)]],
      quantity:     [null, [Validators.required, Validators.min(1)]],
      unitPrice:    [null, [Validators.required, Validators.min(0.01)]],
      status:       ['Pending', Validators.required],
      orderDate:    ['', Validators.required]
    });
  }

  private loadOrder(id: number): void {
    this.orderService.getOrderById(id).subscribe({
      next: (order) => this.orderForm.patchValue(order),
      error: () => {
        this.errorMessage = 'Failed to load order details. Please try again.';
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.orderForm.invalid) {
      return;
    }

    const orderData: Order = this.orderForm.value;

    if (this.isEditMode && this.orderId !== null) {
      this.orderService.updateOrder(this.orderId, { ...orderData, id: this.orderId }).subscribe({
        next: () => this.router.navigate(['/orders']),
        error: () => {
          this.errorMessage = 'Failed to update the order. Please try again.';
        }
      });
    } else {
      this.orderService.createOrder(orderData).subscribe({
        next: () => this.router.navigate(['/orders']),
        error: () => {
          this.errorMessage = 'Failed to create the order. Please try again.';
        }
      });
    }
  }

  onCancel(): void {
    this.submitted = false;
    this.router.navigate(['/orders']);
  }

  /** Shorthand for template access to form controls */
  get f(): { [key: string]: AbstractControl } {
    return this.orderForm.controls;
  }
}
