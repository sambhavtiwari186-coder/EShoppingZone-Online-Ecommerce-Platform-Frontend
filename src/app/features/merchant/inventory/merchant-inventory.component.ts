import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Product } from '../../../core/models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-merchant-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="inventory-container p-4">
      <div class="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 class="mb-1 luxury-font">Inventory management</h2>
          <p class="text-muted small">Add and manage products in your storefront.</p>
        </div>
        <button class="btn-gold" (click)="openAddModal()">
          <i class="bi bi-plus-lg me-2"></i>Add New Product
        </button>
      </div>

      <div class="glass-card p-4">
        <div class="table-responsive">
          <table class="table table-dark table-hover mb-0">
            <thead>
              <tr class="text-muted small text-uppercase">
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (prod of products; track prod.productId) {
                <tr>
                  <td>
                    <div class="d-flex align-items-center">
                      <img [src]="prod.image?.[0] || 'assets/placeholder.png'" class="product-thumb me-3" alt="">
                      <div>
                        <div class="fw-bold">{{ prod.productName }}</div>
                        <div class="small text-muted">{{ prod.productType }}</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="badge bg-secondary">{{ prod.category }}</span></td>
                  <td class="mono">₹{{ prod.price }}</td>
                  <td>
                    @if (prod.stockQuantity === 0) {
                      <span class="badge bg-danger">Out of Stock</span>
                    } @else {
                      <span [class]="prod.stockQuantity < 10 ? 'text-warning' : 'text-success'">
                        {{ prod.stockQuantity }}
                      </span>
                    }
                  </td>
                  <td>
                    <div class="btn-group">
                      <button class="btn btn-sm btn-outline-info" (click)="editProduct(prod)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" (click)="deleteProduct(prod.productId)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="text-center py-5 text-muted">
                    No products found in your inventory.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Modal (Simple Overlay) -->
      @if (showModal) {
        <div class="modal-overlay">
          <div class="glass-card modal-content p-4">
            <h4 class="mb-4">{{ isEditing ? 'Edit Product' : 'Add New Product' }}</h4>
            <form [formGroup]="productForm" (ngSubmit)="saveProduct()">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label small text-muted text-uppercase fw-bold">Product Name</label>
                  <input type="text" formControlName="productName" class="form-control-dark w-100">
                </div>
                <div class="col-md-6">
                  <label class="form-label small text-muted text-uppercase fw-bold">Product Type</label>
                  <input type="text" formControlName="productType" class="form-control-dark w-100">
                </div>
                <div class="col-md-6">
                  <label class="form-label small text-muted text-uppercase fw-bold">Category</label>
                  <select formControlName="category" class="form-control-dark w-100">
                    @for (cat of categories; track cat) {
                      <option [value]="cat">{{ cat }}</option>
                    }
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label small text-muted text-uppercase fw-bold">Price (₹)</label>
                  <input type="number" formControlName="price" class="form-control-dark w-100">
                </div>
                <div class="col-md-3">
                  <label class="form-label small text-muted text-uppercase fw-bold">Stock</label>
                  <input type="number" formControlName="stockQuantity" class="form-control-dark w-100">
                </div>
                <div class="col-12">
                  <label class="form-label small text-muted text-uppercase fw-bold">Description</label>
                  <textarea formControlName="description" class="form-control-dark w-100" rows="3"></textarea>
                </div>
                <div class="col-12">
                  <label class="form-label small text-muted text-uppercase fw-bold">Image URL</label>
                  <input type="text" formControlName="imageUrl" class="form-control-dark w-100" placeholder="https://...">
                </div>
              </div>
              
              <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" class="btn btn-outline-light" (click)="closeModal()">Cancel</button>
                <button type="submit" class="btn-gold" [disabled]="productForm.invalid">
                  {{ isEditing ? 'Update Product' : 'Add Product' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .inventory-container { color: #f8f9fa; }
    .product-thumb { width: 40px; height: 40px; object-fit: cover; border-radius: 4px; }
    .luxury-font { font-family: 'Playfair Display', serif; }
    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.8); backdrop-filter: blur(5px);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
    }
    .modal-content { width: 100%; max-width: 700px; }
    .badge { font-weight: 500; padding: 5px 10px; border-radius: 4px; }
  `]
})
export class MerchantInventoryComponent implements OnInit {
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  products: Product[] = [];
  showModal = false;
  isEditing = false;
  selectedProductId: number | null = null;
  categories = ['Electronics', 'Accessories', 'Footwear', 'Lifestyle', 'Fashion'];

  productForm = this.fb.group({
    productName: ['', Validators.required],
    productType: ['', Validators.required],
    category: ['Electronics', Validators.required],
    price: [0, [Validators.required, Validators.min(1)]],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    description: ['', Validators.required],
    imageUrl: ['', Validators.required]
  });

  ngOnInit() {
    this.loadInventory();
  }

  loadInventory() {
    const userProfile = this.authService.getCurrentUser();
    if (userProfile?.profileId) {
      this.productService.getByMerchant(userProfile.profileId).subscribe({
        next: (prods) => this.products = prods,
        error: () => Swal.fire('Error', 'Failed to load inventory', 'error')
      });
    }
  }

  openAddModal() {
    this.isEditing = false;
    this.selectedProductId = null;
    this.productForm.reset({ category: 'Electronics', price: 0, stockQuantity: 0 });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  editProduct(prod: Product) {
    this.isEditing = true;
    this.selectedProductId = prod.productId;
    this.productForm.patchValue({
      productName: prod.productName,
      productType: prod.productType,
      category: prod.category,
      price: prod.price,
      stockQuantity: prod.stockQuantity,
      description: prod.description,
      imageUrl: prod.image?.[0] || ''
    });
    this.showModal = true;
  }

  saveProduct() {
    if (this.productForm.invalid) return;

    const userProfile = this.authService.getCurrentUser();
    const productData: any = {
      ...this.productForm.value,
      merchantId: userProfile?.profileId,
      image: [this.productForm.value.imageUrl],
      rating: {},
      review: {},
      specification: {}
    };

    if (this.isEditing && this.selectedProductId) {
      productData.productId = this.selectedProductId;
      this.productService.updateProduct(productData).subscribe({
        next: () => {
          Swal.fire('Success', 'Product updated', 'success');
          this.loadInventory();
          this.closeModal();
        },
        error: () => Swal.fire('Error', 'Update failed', 'error')
      });
    } else {
      this.productService.addProduct(productData).subscribe({
        next: () => {
          Swal.fire('Success', 'Product added', 'success');
          this.loadInventory();
          this.closeModal();
        },
        error: () => Swal.fire('Error', 'Addition failed', 'error')
      });
    }
  }

  deleteProduct(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productService.deleteProduct(id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Product has been deleted.', 'success');
            this.loadInventory();
          },
          error: () => Swal.fire('Error', 'Deletetion failed', 'error')
        });
      }
    });
  }
}
