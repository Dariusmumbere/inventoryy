// DOM Elements
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const menuItems = document.querySelectorAll('.menu-item');
const tabContents = document.querySelectorAll('.tab-content');
const tabs = document.querySelectorAll('.tab');
const productModal = document.getElementById('productModal');
const categoryModal = document.getElementById('categoryModal');
const inventoryModal = document.getElementById('inventoryModal');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// Data Storage
let products = JSON.parse(localStorage.getItem('products')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || [];
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let adjustments = JSON.parse(localStorage.getItem('adjustments')) || [];
let sales = JSON.parse(localStorage.getItem('sales')) || [];
let purchases = JSON.parse(localStorage.getItem('purchases')) || [];
let activities = JSON.parse(localStorage.getItem('activities')) || [];

// Initialize with sample data if empty
function initializeSampleData() {
    if (categories.length === 0) {
        categories = [
            { id: 1, name: 'Electronics', description: 'Electronic devices and components' },
            { id: 2, name: 'Clothing', description: 'Apparel and accessories' },
            { id: 3, name: 'Groceries', description: 'Food and household items' },
            { id: 4, name: 'Furniture', description: 'Home and office furniture' }
        ];
        localStorage.setItem('categories', JSON.stringify(categories));
    }

    if (products.length === 0) {
        products = [
            { 
                id: 1, 
                name: 'Smartphone', 
                categoryId: 1, 
                description: 'Latest smartphone model', 
                purchasePrice: 500000, 
                sellingPrice: 700000, 
                stock: 15, 
                reorderLevel: 5, 
                unit: 'pcs', 
                barcode: '123456789', 
                createdAt: new Date().toISOString() 
            },
            { 
                id: 2, 
                name: 'Laptop', 
                categoryId: 1, 
                description: 'High-performance laptop', 
                purchasePrice: 1500000, 
                sellingPrice: 2000000, 
                stock: 8, 
                reorderLevel: 3, 
                unit: 'pcs', 
                barcode: '987654321', 
                createdAt: new Date().toISOString() 
            },
            { 
                id: 3, 
                name: 'T-Shirt', 
                categoryId: 2, 
                description: 'Cotton t-shirt', 
                purchasePrice: 15000, 
                sellingPrice: 25000, 
                stock: 50, 
                reorderLevel: 20, 
                unit: 'pcs', 
                barcode: '456123789', 
                createdAt: new Date().toISOString() 
            },
            { 
                id: 4, 
                name: 'Rice (5kg)', 
                categoryId: 3, 
                description: 'Premium quality rice', 
                purchasePrice: 20000, 
                sellingPrice: 28000, 
                stock: 30, 
                reorderLevel: 10, 
                unit: 'bag', 
                barcode: '789456123', 
                createdAt: new Date().toISOString() 
            }
        ];
        localStorage.setItem('products', JSON.stringify(products));
    }

    if (activities.length === 0) {
        activities = [
            { id: 1, date: new Date().toISOString(), activity: 'Product added', user: 'John Doe', details: 'Added new product: Smartphone' },
            { id: 2, date: new Date(Date.now() - 86400000).toISOString(), activity: 'Stock adjusted', user: 'John Doe', details: 'Adjusted stock for Laptop: +2 units' },
            { id: 3, date: new Date(Date.now() - 172800000).toISOString(), activity: 'Sale recorded', user: 'Jane Smith', details: 'Recorded sale #INV-001 for UGX 700,000' },
            { id: 4, date: new Date(Date.now() - 259200000).toISOString(), activity: 'Category added', user: 'John Doe', details: 'Added new category: Electronics' }
        ];
        localStorage.setItem('activities', JSON.stringify(activities));
    }
}

// Toggle sidebar on mobile
sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// Menu item click handler
menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const target = item.getAttribute('data-target');
        
        // Update active menu item
        menuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // Show corresponding tab content
        tabContents.forEach(content => content.classList.remove('active'));
        document.getElementById(target).classList.add('active');
        
        // Close sidebar on mobile after selection
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
        }
        
        // Load data for the selected tab
        loadTabData(target);
    });
});

// Tab click handler
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
        
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show corresponding tab content
        const parent = tab.closest('.tab-content');
        const siblingContents = parent.querySelectorAll('.tab-content');
        siblingContents.forEach(content => content.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        
        // Load data for the selected sub-tab
        loadTabData(tabId);
    });
});

// Modal close handlers
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
        productModal.classList.remove('active');
        categoryModal.classList.remove('active');
        inventoryModal.classList.remove('active');
    });
});

// Show toast notification
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.className = 'toast';
    toast.classList.add(type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'success');
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Load tab data
function loadTabData(tabId) {
    switch(tabId) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'products':
            loadProducts();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'inventory':
            loadInventory();
            break;
        case 'current':
            loadCurrentInventory();
            break;
        case 'adjustments':
            loadAdjustments();
            break;
        case 'reports':
            loadReports();
            break;
        case 'inventory-report':
            loadInventoryReport();
            break;
        case 'sales-report':
            loadSalesReport();
            break;
    }
}

// Dashboard data
function loadDashboardData() {
    // Calculate stats
    const totalProducts = products.length;
    const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= p.reorderLevel).length;
    const outOfStockItems = products.filter(p => p.stock === 0).length;
    const inventoryValue = products.reduce((sum, p) => sum + (p.stock * p.purchasePrice), 0);
    
    // Update DOM
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('lowStockItems').textContent = lowStockItems;
    document.getElementById('outOfStockItems').textContent = outOfStockItems;
    document.getElementById('inventoryValue').textContent = `UGX ${inventoryValue.toLocaleString()}`;
    
    // Load activities
    const activitiesTable = document.getElementById('activitiesTable');
    activitiesTable.innerHTML = activities.slice(0, 5).map(activity => `
        <tr>
            <td>${new Date(activity.date).toLocaleDateString()}</td>
            <td>${activity.activity}</td>
            <td>${activity.user}</td>
            <td>${activity.details}</td>
        </tr>
    `).join('');
    
    // Load low stock items
    const lowStockTable = document.getElementById('lowStockTable');
    const lowStockProducts = products.filter(p => p.stock <= p.reorderLevel).slice(0, 5);
    lowStockTable.innerHTML = lowStockProducts.map(product => {
        const category = categories.find(c => c.id === product.categoryId);
        return `
            <tr>
                <td>${product.name}</td>
                <td>${category ? category.name : 'N/A'}</td>
                <td>${product.stock} ${product.unit}</td>
                <td>
                    <button class="action-btn edit" data-id="${product.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Load recent sales (sample data)
    const recentSalesTable = document.getElementById('recentSalesTable');
    recentSalesTable.innerHTML = `
        <tr>
            <td>${new Date().toLocaleDateString()}</td>
            <td>INV-${Math.floor(Math.random() * 1000)}</td>
            <td>UGX ${(Math.random() * 1000000).toLocaleString()}</td>
            <td><span class="badge badge-success">Completed</span></td>
        </tr>
        <tr>
            <td>${new Date(Date.now() - 86400000).toLocaleDateString()}</td>
            <td>INV-${Math.floor(Math.random() * 1000)}</td>
            <td>UGX ${(Math.random() * 1000000).toLocaleString()}</td>
            <td><span class="badge badge-success">Completed</span></td>
        </tr>
        <tr>
            <td>${new Date(Date.now() - 172800000).toLocaleDateString()}</td>
            <td>INV-${Math.floor(Math.random() * 1000)}</td>
            <td>UGX ${(Math.random() * 1000000).toLocaleString()}</td>
            <td><span class="badge badge-success">Completed</span></td>
        </tr>
    `;
}

// Products management
function loadProducts() {
    const productsTable = document.getElementById('productsTable');
    productsTable.innerHTML = products.map(product => {
        const category = categories.find(c => c.id === product.categoryId);
        const status = product.stock === 0 ? 'Out of Stock' : 
                       product.stock <= product.reorderLevel ? 'Low Stock' : 'In Stock';
        const statusClass = product.stock === 0 ? 'badge-danger' : 
                          product.stock <= product.reorderLevel ? 'badge-warning' : 'badge-success';
        
        return `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${category ? category.name : 'N/A'}</td>
                <td>${product.sellingPrice.toLocaleString()}</td>
                <td>${product.stock} ${product.unit}</td>
                <td><span class="badge ${statusClass}">${status}</span></td>
                <td>
                    <button class="action-btn edit" data-id="${product.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" data-id="${product.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Categories management
function loadCategories() {
    const categoriesTable = document.getElementById('categoriesTable');
    categoriesTable.innerHTML = categories.map(category => {
        const productCount = products.filter(p => p.categoryId === category.id).length;
        
        return `
            <tr>
                <td>${category.id}</td>
                <td>${category.name}</td>
                <td>${category.description || 'N/A'}</td>
                <td>${productCount}</td>
                <td>
                    <button class="action-btn edit" data-id="${category.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" data-id="${category.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Inventory management
function loadInventory() {
    loadCurrentInventory();
}

function loadCurrentInventory() {
    const inventoryTable = document.getElementById('inventoryTable');
    inventoryTable.innerHTML = products.map(product => {
        const category = categories.find(c => c.id === product.categoryId);
        const status = product.stock === 0 ? 'Out of Stock' : 
                       product.stock <= product.reorderLevel ? 'Low Stock' : 'In Stock';
        const statusClass = product.stock === 0 ? 'badge-danger' : 
                          product.stock <= product.reorderLevel ? 'badge-warning' : 'badge-success';
        
        return `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${category ? category.name : 'N/A'}</td>
                <td>${product.stock} ${product.unit}</td>
                <td>${product.reorderLevel} ${product.unit}</td>
                <td><span class="badge ${statusClass}">${status}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm adjust-stock" data-id="${product.id}">
                        <i class="fas fa-edit"></i> Adjust
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function loadAdjustments() {
    const adjustmentsTable = document.getElementById('adjustmentsTable');
    adjustmentsTable.innerHTML = adjustments.map(adj => {
        const product = products.find(p => p.id === adj.productId);
        return `
            <tr>
                <td>${adj.id}</td>
                <td>${new Date(adj.date).toLocaleDateString()}</td>
                <td>${product ? product.name : 'N/A'}</td>
                <td>${adj.type === 'add' ? '+' : '-'}${adj.quantity}</td>
                <td>${adj.reason}</td>
                <td>${adj.user || 'System'}</td>
            </tr>
        `;
    }).join('');
}

// Reports
function loadReports() {
    loadInventoryReport();
}

function loadInventoryReport() {
    const inventoryReportTable = document.getElementById('inventoryReportTable');
    inventoryReportTable.innerHTML = products.map(product => {
        const category = categories.find(c => c.id === product.categoryId);
        const totalValue = product.stock * product.purchasePrice;
        const status = product.stock === 0 ? 'Out of Stock' : 
                       product.stock <= product.reorderLevel ? 'Low Stock' : 'In Stock';
        const statusClass = product.stock === 0 ? 'badge-danger' : 
                          product.stock <= product.reorderLevel ? 'badge-warning' : 'badge-success';
        
        return `
            <tr>
                <td>${product.name}</td>
                <td>${category ? category.name : 'N/A'}</td>
                <td>${product.stock} ${product.unit}</td>
                <td>${product.purchasePrice.toLocaleString()}</td>
                <td>${totalValue.toLocaleString()}</td>
                <td><span class="badge ${statusClass}">${status}</span></td>
            </tr>
        `;
    }).join('');
}

function loadSalesReport() {
    // Initialize chart
    const ctx = document.getElementById('salesChart').getContext('2d');
    if (window.salesChart) {
        window.salesChart.destroy();
    }
    
    // Sample sales data for chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesData = months.map(() => Math.floor(Math.random() * 10000000) + 5000000);
    
    window.salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Sales (UGX)',
                data: salesData,
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return 'UGX ' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'UGX ' + context.raw.toLocaleString();
                        }
                    }
                }
            }
        }
    });
    
    // Sample sales data for table
    const salesReportTable = document.getElementById('salesReportTable');
    salesReportTable.innerHTML = `
        <tr>
            <td>${new Date().toLocaleDateString()}</td>
            <td>INV-${Math.floor(Math.random() * 1000)}</td>
            <td>Customer ${Math.floor(Math.random() * 100)}</td>
            <td>${Math.floor(Math.random() * 10) + 1}</td>
            <td>${(Math.random() * 1000000 + 500000).toLocaleString()}</td>
            <td><span class="badge badge-success">Paid</span></td>
        </tr>
        <tr>
            <td>${new Date(Date.now() - 86400000).toLocaleDateString()}</td>
            <td>INV-${Math.floor(Math.random() * 1000)}</td>
            <td>Customer ${Math.floor(Math.random() * 100)}</td>
            <td>${Math.floor(Math.random() * 10) + 1}</td>
            <td>${(Math.random() * 1000000 + 500000).toLocaleString()}</td>
            <td><span class="badge badge-success">Paid</span></td>
        </tr>
        <tr>
            <td>${new Date(Date.now() - 172800000).toLocaleDateString()}</td>
            <td>INV-${Math.floor(Math.random() * 1000)}</td>
            <td>Customer ${Math.floor(Math.random() * 100)}</td>
            <td>${Math.floor(Math.random() * 10) + 1}</td>
            <td>${(Math.random() * 1000000 + 500000).toLocaleString()}</td>
            <td><span class="badge badge-warning">Pending</span></td>
        </tr>
        <tr>
            <td>${new Date(Date.now() - 259200000).toLocaleDateString()}</td>
            <td>INV-${Math.floor(Math.random() * 1000)}</td>
            <td>Customer ${Math.floor(Math.random() * 100)}</td>
            <td>${Math.floor(Math.random() * 10) + 1}</td>
            <td>${(Math.random() * 1000000 + 500000).toLocaleString()}</td>
            <td><span class="badge badge-success">Paid</span></td>
        </tr>
    `;
}

// Add Product
document.getElementById('addProductBtn').addEventListener('click', () => {
    // Populate category dropdown
    const categorySelect = document.getElementById('productCategory');
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    categories.forEach(category => {
        categorySelect.innerHTML += `<option value="${category.id}">${category.name}</option>`;
    });
    
    // Reset form
    document.getElementById('productForm').reset();
    productModal.classList.add('active');
});

// Save Product
document.getElementById('saveProduct').addEventListener('click', () => {
    const form = document.getElementById('productForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const newProduct = {
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
        name: document.getElementById('productName').value,
        categoryId: parseInt(document.getElementById('productCategory').value),
        description: document.getElementById('productDescription').value,
        purchasePrice: parseFloat(document.getElementById('productPurchasePrice').value),
        sellingPrice: parseFloat(document.getElementById('productSellingPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        reorderLevel: parseInt(document.getElementById('productReorderLevel').value),
        unit: document.getElementById('productUnit').value,
        barcode: document.getElementById('productBarcode').value,
        createdAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    
    // Add activity
    activities.unshift({
        id: activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1,
        date: new Date().toISOString(),
        activity: 'Product added',
        user: 'John Doe',
        details: `Added new product: ${newProduct.name}`
    });
    localStorage.setItem('activities', JSON.stringify(activities));
    
    productModal.classList.remove('active');
    showToast('Product added successfully');
    loadProducts();
    loadDashboardData();
});

// Add Category
document.getElementById('addCategoryBtn').addEventListener('click', () => {
    document.getElementById('categoryForm').reset();
    categoryModal.classList.add('active');
});

// Save Category
document.getElementById('saveCategory').addEventListener('click', () => {
    const form = document.getElementById('categoryForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const newCategory = {
        id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
        name: document.getElementById('categoryName').value,
        description: document.getElementById('categoryDescription').value
    };
    
    categories.push(newCategory);
    localStorage.setItem('categories', JSON.stringify(categories));
    
    // Add activity
    activities.unshift({
        id: activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1,
        date: new Date().toISOString(),
        activity: 'Category added',
        user: 'John Doe',
        details: `Added new category: ${newCategory.name}`
    });
    localStorage.setItem('activities', JSON.stringify(activities));
    
    categoryModal.classList.remove('active');
    showToast('Category added successfully');
    loadCategories();
});

// Add Inventory Adjustment
document.getElementById('addInventoryBtn').addEventListener('click', () => {
    // Populate product dropdown
    const productSelect = document.getElementById('adjustmentProduct');
    productSelect.innerHTML = '<option value="">Select Product</option>';
    products.forEach(product => {
        productSelect.innerHTML += `<option value="${product.id}">${product.name}</option>`;
    });
    
    // Reset form
    document.getElementById('inventoryForm').reset();
    inventoryModal.classList.add('active');
});

// Save Adjustment
document.getElementById('saveAdjustment').addEventListener('click', () => {
    const form = document.getElementById('inventoryForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const productId = parseInt(document.getElementById('adjustmentProduct').value);
    const type = document.getElementById('adjustmentType').value;
    const quantity = parseInt(document.getElementById('adjustmentQuantity').value);
    const reason = document.getElementById('adjustmentReason').value;
    
    // Find product
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex === -1) {
        showToast('Product not found', 'error');
        return;
    }
    
    // Update stock
    if (type === 'add') {
        products[productIndex].stock += quantity;
    } else {
        if (products[productIndex].stock < quantity) {
            showToast('Not enough stock to remove', 'error');
            return;
        }
        products[productIndex].stock -= quantity;
    }
    
    localStorage.setItem('products', JSON.stringify(products));
    
    // Record adjustment
    const newAdjustment = {
        id: adjustments.length > 0 ? Math.max(...adjustments.map(a => a.id)) + 1 : 1,
        date: new Date().toISOString(),
        productId,
        type,
        quantity,
        reason,
        user: 'John Doe'
    };
    
    adjustments.push(newAdjustment);
    localStorage.setItem('adjustments', JSON.stringify(adjustments));
    
    // Add activity
    const product = products[productIndex];
    activities.unshift({
        id: activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1,
        date: new Date().toISOString(),
        activity: 'Stock adjusted',
        user: 'John Doe',
        details: `Adjusted stock for ${product.name}: ${type === 'add' ? '+' : '-'}${quantity} units`
    });
    localStorage.setItem('activities', JSON.stringify(activities));
    
    inventoryModal.classList.remove('active');
    showToast('Stock adjusted successfully');
    loadInventory();
    loadDashboardData();
});

// Print functionality
document.getElementById('printDashboard').addEventListener('click', () => {
    window.print();
});

document.getElementById('printReport').addEventListener('click', () => {
    window.print();
});

// Search functionality
document.getElementById('productSearch').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#productsTable tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
});

document.getElementById('categorySearch').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#categoriesTable tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
});

document.getElementById('inventorySearch').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#inventoryTable tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
});

// Initialize the dashboard on load
document.addEventListener('DOMContentLoaded', () => {
    initializeSampleData();
    loadDashboardData();
    
    // Set up event delegation for dynamically added elements
    document.addEventListener('click', (e) => {
        if (e.target.closest('.adjust-stock')) {
            const productId = parseInt(e.target.closest('.adjust-stock').getAttribute('data-id'));
            
            // Populate product dropdown
            const productSelect = document.getElementById('adjustmentProduct');
            productSelect.innerHTML = '<option value="">Select Product</option>';
            products.forEach(product => {
                productSelect.innerHTML += `<option value="${product.id}" ${product.id === productId ? 'selected' : ''}>${product.name}</option>`;
            });
            
            // Reset form
            document.getElementById('inventoryForm').reset();
            inventoryModal.classList.add('active');
        }
        
        if (e.target.closest('.action-btn.delete')) {
            if (confirm('Are you sure you want to delete this item?')) {
                const id = parseInt(e.target.closest('.action-btn').getAttribute('data-id'));
                
                // Determine if it's a product or category
                if (e.target.closest('#productsTable')) {
                    products = products.filter(p => p.id !== id);
                    localStorage.setItem('products', JSON.stringify(products));
                    showToast('Product deleted successfully');
                    loadProducts();
                    loadDashboardData();
                } else if (e.target.closest('#categoriesTable')) {
                    // Check if category is in use
                    const productsUsingCategory = products.filter(p => p.categoryId === id);
                    if (productsUsingCategory.length > 0) {
                        showToast('Cannot delete category - it is being used by products', 'error');
                        return;
                    }
                    
                    categories = categories.filter(c => c.id !== id);
                    localStorage.setItem('categories', JSON.stringify(categories));
                    showToast('Category deleted successfully');
                    loadCategories();
                }
            }
        }
        
        if (e.target.closest('.action-btn.edit')) {
            const id = parseInt(e.target.closest('.action-btn').getAttribute('data-id'));
            
            // Determine if it's a product or category
            if (e.target.closest('#productsTable')) {
                const product = products.find(p => p.id === id);
                if (!product) return;
                
                // Populate category dropdown
                const categorySelect = document.getElementById('productCategory');
                categorySelect.innerHTML = '<option value="">Select Category</option>';
                categories.forEach(category => {
                    categorySelect.innerHTML += `<option value="${category.id}" ${category.id === product.categoryId ? 'selected' : ''}>${category.name}</option>`;
                });
                
                // Fill form
                document.getElementById('productName').value = product.name;
                document.getElementById('productDescription').value = product.description || '';
                document.getElementById('productPurchasePrice').value = product.purchasePrice;
                document.getElementById('productSellingPrice').value = product.sellingPrice;
                document.getElementById('productStock').value = product.stock;
                document.getElementById('productReorderLevel').value = product.reorderLevel;
                document.getElementById('productUnit').value = product.unit;
                document.getElementById('productBarcode').value = product.barcode || '';
                
                // TODO: Implement update functionality
                productModal.classList.add('active');
            } else if (e.target.closest('#categoriesTable')) {
                const category = categories.find(c => c.id === id);
                if (!category) return;
                
                // Fill form
                document.getElementById('categoryName').value = category.name;
                document.getElementById('categoryDescription').value = category.description || '';
                
                // TODO: Implement update functionality
                categoryModal.classList.add('active');
            }
        }
    });
});
