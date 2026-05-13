import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { AuthService } from '../../../core/auth/auth.service';
// Custom shimmer skeleton via CSS

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  template: `
    <div class="container py-4">
      <div class="row">
        <!-- SIDEBAR FILTERS (Only for Customers) -->
        @if (!isMerchant) {
          <aside class="col-lg-3">
            <div class="glass-card p-4 sticky-top" style="top: 100px;">
              <h4 class="mb-4">Filters</h4>
              
              <div class="filter-group mb-4">
                <label class="small text-muted text-uppercase mb-2 d-block fw-bold ls-1">Search</label>
                <div class="position-relative">
                  <input type="text" class="form-control-dark w-100 ps-5" placeholder="Search..." [(ngModel)]="searchQuery" (input)="onSearch()">
                  <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                </div>
              </div>

              <div class="filter-group mb-4">
                <label class="small text-muted text-uppercase mb-2 d-block">Categories</label>
                @for (cat of categories; track cat) {
                  <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" [id]="cat" [checked]="selectedCategories.has(cat)" (change)="toggleCategory(cat, $event)">
                    <label class="form-check-label" [for]="cat">
                      {{ cat }}
                    </label>
                  </div>
                }
              </div>

              <div class="filter-group mb-4">
                  <label class="small text-muted text-uppercase mb-2 d-block">Max Price</label>
                  <input type="range" class="form-range" min="0" max="2000000" step="10000" [(ngModel)]="maxPriceFilter" (input)="onPriceChange()">
                  <div class="d-flex justify-content-between small text-muted mt-1">
                      <span>₹0</span>
                      <span>₹{{ maxPriceFilter | number }}</span>
                  </div>
              </div>

              <button class="btn-outline-gold w-100 btn-sm" (click)="resetFilters()">Reset Filters</button>
            </div>
          </aside>
        }

        <!-- PRODUCT GRID -->
        <main [class.col-12]="isMerchant" [class.col-lg-9]="!isMerchant">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <p class="text-muted mb-0">Showing {{ products.length }} products</p>
            
            @if (!isMerchant) {
              <div class="d-flex align-items-center">
                <span class="text-muted small me-2">Sort by:</span>
                <select class="form-select bg-transparent border-0 gold-accent fw-bold small" [(ngModel)]="selectedSort" (change)="onSortChange()">
                  <option>Newest First</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Most Helpful Reviews</option>
                </select>
              </div>
            }
          </div>

          @if (loading) {
            <div class="row g-4">
              @for (i of [1,2,3,4,5,6]; track i) {
                <div class="col-md-6 col-lg-4">
                  <div class="glass-card" style="height: 400px;">
                    <div class="skeleton" style="height: 220px; border-radius: 16px 16px 0 0;"></div>
                    <div class="p-3">
                        <div class="skeleton mb-2" style="height: 20px; width: 80%;"></div>
                        <div class="skeleton" style="height: 15px; width: 40%;"></div>
                    </div>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="row g-4">
              @for (product of products; track product.productId) {
                <div class="col-md-6" [class.col-lg-4]="!isMerchant" [class.col-lg-3]="isMerchant">
                  <app-product-card [product]="product" [isMerchant]="isMerchant"></app-product-card>
                </div>
              } @empty {
                <div class="col-12 text-center py-5">
                   <i class="bi bi-search display-1 text-muted opacity-25"></i>
                   <h3 class="mt-4">No products found</h3>
                   <p class="text-muted">Try adjusting your filters or search terms.</p>
                </div>
              }
            </div>
          }
        </main>
      </div>
    </div>
  `,
  styles: [`
    .gold-accent { color: var(--accent-gold); }
    .form-check-input:checked { background-color: var(--accent-gold); border-color: var(--accent-gold); }
    .form-range::-webkit-slider-thumb { background: var(--accent-gold); }
  `]
})
export class ProductListComponent implements OnInit {
  productService = inject(ProductService);
  authService = inject(AuthService);
  
  allProducts: Product[] = [];
  products: Product[] = [];
  categories = ['Electronics', 'Accessories', 'Footwear', 'Lifestyle', 'Fashion'];
  loading = true;
  isMerchant = false;
  
  searchQuery = '';
  selectedCategories: Set<string> = new Set();
  maxPriceFilter = 2000000;
  selectedSort = 'Newest First';

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    
    const currentUser = this.authService.getCurrentUser();
    this.isMerchant = currentUser?.role === 'MERCHANT';
    
    const request$ = this.isMerchant 
      ? this.productService.getByMerchant(currentUser.profileId)
      : this.productService.getAll();

    request$.subscribe({
      next: (data) => {
        this.allProducts = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        // Mocking for now if service fails
        setTimeout(() => {
          this.allProducts = [
            { productId: 1, productName: 'Luxury Gold Watch', price: 12500, category: 'Accessories', image: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30'], stockQuantity: 5 } as any,
            { productId: 2, productName: 'Premium Headphones', price: 15999, category: 'Electronics', image: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e'], stockQuantity: 15 } as any,
            { productId: 3, productName: 'Designer Sneakers', price: 8999, category: 'Footwear', image: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff'], stockQuantity: 8 } as any,
            { productId: 4, productName: 'Smart Bottle', price: 2500, category: 'Lifestyle', image: ['https://images.unsplash.com/photo-1602143307185-84e6743927d1'], stockQuantity: 20 } as any,
            { productId: 5, productName: 'Camera Lens Z4', price: 45000, category: 'Electronics', image: ['https://images.unsplash.com/photo-1617005081232-2653e8dd4604'], stockQuantity: 3 } as any,
            { productId: 6, productName: 'Leather Weekend Bag', price: 7500, category: 'Accessories', image: ['https://images.unsplash.com/photo-1547949003-9792a18a2601'], stockQuantity: 12 } as any,
          ];
          this.applyFilters();
          this.loading = false;
        }, 1500);
      }
    });
  }

  onSearch() {
    this.applyFilters();
  }

  toggleCategory(cat: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedCategories.add(cat);
    } else {
      this.selectedCategories.delete(cat);
    }
    this.applyFilters();
  }

  onPriceChange() {
    this.applyFilters();
  }

  onSortChange() {
    this.applyFilters();
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedCategories.clear();
    this.maxPriceFilter = 2000000;
    this.selectedSort = 'Newest First';
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.allProducts];

    // Search Filter
    if (this.searchQuery && this.searchQuery.trim().length > 0) {
      const q = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.productName.toLowerCase().includes(q) || 
        (p.description && p.description.toLowerCase().includes(q)) || 
        p.category.toLowerCase().includes(q)
      );
    }

    // Category Filter
    if (this.selectedCategories.size > 0) {
      filtered = filtered.filter(p => this.selectedCategories.has(p.category));
    }

    // Price Filter
    filtered = filtered.filter(p => p.price <= this.maxPriceFilter);

    // Sorting
    switch (this.selectedSort) {
      case 'Price: Low to High':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'Price: High to Low':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'Most Helpful Reviews':
        filtered.sort((a, b) => {
          const rateA = a.rating && a.rating['Rate'] ? parseFloat(a.rating['Rate'].toString()) : 0;
          const rateB = b.rating && b.rating['Rate'] ? parseFloat(b.rating['Rate'].toString()) : 0;
          return rateB - rateA; // Decreasing order of rating
        });
        break;
      case 'Newest First':
      default:
        filtered.sort((a, b) => b.productId - a.productId); // Assuming higher ID is newer
        break;
    }

    this.products = filtered;
  }
}
