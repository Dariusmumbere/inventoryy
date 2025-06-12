// DOM Elements
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const menuItems = document.querySelectorAll('.menu-item');
const tabContents = document.querySelectorAll('.tab-content');
const tabs = document.querySelectorAll('.tab');
const productModal = document.getElementById('productModal');
const categoryModal = document.getElementById('categoryModal');
const inventoryModal = document.getElementById('inventoryModal');
const transferModal = document.getElementById('transferModal');
const supplierModal = document.getElementById('supplierModal');
const saleModal = document.getElementById('saleModal');
const purchaseModal = document.getElementById('purchaseModal');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// Data Storage
let products = JSON.parse(localStorage.getItem('products')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || [];
let suppliers = JSON.parse(localStorage.getItem('suppliers')) || [];
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let adjustments = JSON.parse(localStorage.getItem('adjustments')) || [];
let transfers = JSON.parse(localStorage.getItem('transfers')) || [];
let sales = JSON.parse(localStorage.getItem('sales')) || [];
let purchases = JSON.parse(localStorage.getItem('purchases')) || [];
let activities = JSON.parse(localStorage.getItem('activities')) || [];
let locations = JSON.parse(localStorage.getItem('locations')) || ['Main Warehouse', 'Store 1', 'Store 2'];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || { name: 'John Doe', role: 'Admin' };

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

    if (suppliers.length === 0) {
        suppliers = [
            { id: 1, name: 'Tech Suppliers Ltd', contact: '0712345678', email: 'info@techsuppliers.com', address: 'Kampala Road' },
            { id: 2, name: 'Fashion World', contact: '0723456789', email: 'sales@fashionworld.com', address: 'Garden City' },
            { id: 3, name: 'Food Distributors UG', contact: '0734567890', email: 'orders@fooddist.com', address: 'Industrial Area' }
        ];
        localStorage.setItem('suppliers', JSON.stringify(suppliers));
    }

    if (products.length === 0) {
        products = [
            { 
                id: 1, 
                name: 'Smartphone', 
                categoryId: 1, 
                supplierId: 1,
                description: 'Latest smartphone model', 
                purchasePrice: 500000, 
                sellingPrice: 700000, 
                stock: 15, 
                reorderLevel: 5, 
                unit: 'pcs', 
                barcode: '123456789', 
                location: 'Main Warehouse',
                createdAt: new Date().toISOString() 
            },
            { 
                id: 2, 
                name: 'Laptop', 
                categoryId: 1, 
                supplierId: 1,
                description: 'High-performance laptop', 
                purchasePrice: 1500000, 
                sellingPrice: 2000000, 
                stock: 8, 
                reorderLevel: 3, 
                unit: 'pcs', 
                barcode: '987654321', 
                location: 'Main Warehouse',
                createdAt: new Date().toISOString() 
            },
            { 
                id: 3, 
                name: 'T-Shirt', 
                categoryId: 2, 
                supplierId: 2,
                description: 'Cotton t-shirt', 
                purchasePrice: 15000, 
                sellingPrice: 25000, 
                stock: 50, 
                reorderLevel: 20, 
                unit: 'pcs', 
                barcode: '456123789', 
                location: 'Store 1',
                createdAt: new Date().toISOString() 
            },
            { 
                id: 4, 
                name: 'Rice (5kg)', 
                categoryId: 3, 
                supplierId: 3,
                description: 'Premium quality rice', 
                purchasePrice: 20000, 
                sellingPrice: 28000, 
                stock: 30, 
                reorderLevel: 10, 
                unit: 'bag', 
                barcode: '789456123', 
                location: 'Store 2',
                createdAt: new Date().toISOString() 
            }
        ];
        localStorage.setItem('products', JSON.stringify(products));
    }

    if (activities.length === 0) {
        activities = [
            { id: 1, date: new Date().toISOString(), activity: 'Product added', user: currentUser.name, details: 'Added new product: Smartphone' },
            { id: 2, date: new Date(Date.now() - 86400000).toISOString(), activity: 'Stock adjusted', user: currentUser.name, details: 'Adjusted stock for Laptop: +2 units' },
            { id: 3, date: new Date(Date.now() - 172800000).toISOString(), activity: 'Sale recorded', user: currentUser.name, details: 'Recorded sale #INV-001 for UGX 700,000' },
            { id: 4, date: new Date(Date.now() - 259200000).toISOString(), activity: 'Category added', user: currentUser.name, details: 'Added new category: Electronics' }
        ];
        localStorage.setItem('activities', JSON.stringify(activities));
    }

    if (sales.length === 0) {
        sales = [
            {
                id: 1,
                invoiceNo: 'INV-' + Math.floor(Math.random() * 1000),
                date: new Date().toISOString(),
                customer: 'Walk-in Customer',
                items: [
                    { productId: 1, quantity: 1, price: 700000, total: 700000 }
                ],
                subtotal: 700000,
                tax: 0,
                discount: 0,
                total: 700000,
                paymentMethod: 'Cash',
                status: 'Completed',
                user: currentUser.name
            }
        ];
        localStorage.setItem('sales', JSON.stringify(sales));
    }

    if (purchases.length === 0) {
        purchases = [
            {
                id: 1,
                reference: 'PUR-' + Math.floor(Math.random() * 1000),
                date: new Date().toISOString(),
                supplierId: 1,
                items: [
                    { productId: 1, quantity: 5, price: 500000, total: 2500000 }
                ],
                subtotal: 2500000,
                tax: 0,
                discount: 0,
                total: 2500000,
                paymentMethod: 'Bank Transfer',
                status: 'Completed',
                user: currentUser.name
            }
        ];
        localStorage.setItem('purchases', JSON.stringify(purchases));
    }
}

// Helper Functions
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.className = 'toast';
    toast.classList.add(type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'success');
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatCurrency(amount) {
    return 'UGX ' + amount.toLocaleString();
}

function getProductById(id) {
    return products.find(p => p.id === id);
}

function getCategoryById(id) {
    return categories.find(c => c.id === id);
}

function getSupplierById(id) {
    return suppliers.find(s => s.id === id);
}

function addActivity(activity, details) {
    const newActivity = {
        id: activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1,
        date: new Date().toISOString(),
        activity,
        user: currentUser.name,
        details
    };
    activities.unshift(newActivity);
    localStorage.setItem('activities', JSON.stringify(activities));
    return newActivity;
}

// Data Loading Functions
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
    document.getElementById('inventoryValue').textContent = formatCurrency(inventoryValue);
    
    // Load activities
    const activitiesTable = document.getElementById('activitiesTable');
    activitiesTable.innerHTML = activities.slice(0, 5).map(activity => `
        <tr>
            <td>${formatDate(activity.date)}</td>
            <td>${activity.activity}</td>
            <td>${activity.user}</td>
            <td>${activity.details}</td>
        </tr>
    `).join('');
    
    // Load low stock items
    const lowStockTable = document.getElementById('lowStockTable');
    const lowStockProducts = products.filter(p => p.stock <= p.reorderLevel).slice(0, 5);
    lowStockTable.innerHTML = lowStockProducts.map(product => {
        const category = getCategoryById(product.categoryId);
        return `
            <tr>
                <td>${product.name}</td>
                <td>${category ? category.name : 'N/A'}</td>
                <td>${product.stock} ${product.unit}</td>
                <td>
                    <button class="btn btn-secondary btn-sm adjust-stock" data-id="${product.id}">
                        <i class="fas fa-edit"></i> Adjust
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Load recent sales
    const recentSalesTable = document.getElementById('recentSalesTable');
    recentSalesTable.innerHTML = sales.slice(0, 5).map(sale => `
        <tr>
            <td>${formatDate(sale.date)}</td>
            <td>${sale.invoiceNo}</td>
            <td>${formatCurrency(sale.total)}</td>
            <td><span class="badge badge-success">${sale.status}</span></td>
        </tr>
    `).join('');
}

function loadProducts() {
    const productsTable = document.getElementById('productsTable');
    productsTable.innerHTML = products.map(product => {
        const category = getCategoryById(product.categoryId);
        const status = product.stock === 0 ? 'Out of Stock' : 
                       product.stock <= product.reorderLevel ? 'Low Stock' : 'In Stock';
        const statusClass = product.stock === 0 ? 'badge-danger' : 
                          product.stock <= product.reorderLevel ? 'badge-warning' : 'badge-success';
        
        return `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${category ? category.name : 'N/A'}</td>
                <td>${formatCurrency(product.sellingPrice)}</td>
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

function loadSuppliers() {
    const suppliersTable = document.getElementById('suppliersTable');
    suppliersTable.innerHTML = suppliers.map(supplier => {
        const productCount = products.filter(p => p.supplierId === supplier.id).length;
        
        return `
            <tr>
                <td>${supplier.id}</td>
                <td>${supplier.name}</td>
                <td>${supplier.contact}</td>
                <td>${supplier.email || 'N/A'}</td>
                <td>${productCount}</td>
                <td>
                    <button class="action-btn edit" data-id="${supplier.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" data-id="${supplier.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function loadInventory() {
    loadCurrentInventory();
}

function loadCurrentInventory() {
    const inventoryTable = document.getElementById('inventoryTable');
    inventoryTable.innerHTML = products.map(product => {
        const category = getCategoryById(product.categoryId);
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
                <td>${product.location}</td>
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
        const product = getProductById(adj.productId);
        return `
            <tr>
                <td>${adj.id}</td>
                <td>${formatDate(adj.date)}</td>
                <td>${product ? product.name : 'N/A'}</td>
                <td>${adj.type === 'add' ? '+' : '-'}${adj.quantity}</td>
                <td>${adj.reason}</td>
                <td>${adj.user || 'System'}</td>
            </tr>
        `;
    }).join('');
}

function loadTransfers() {
    const transfersTable = document.getElementById('transfersTable');
    transfersTable.innerHTML = transfers.map(transfer => {
        return `
            <tr>
                <td>${transfer.id}</td>
                <td>${formatDate(transfer.date)}</td>
                <td>${transfer.reference}</td>
                <td>${transfer.fromLocation}</td>
                <td>${transfer.toLocation}</td>
                <td><span class="badge badge-success">Completed</span></td>
                <td>
                    <button class="action-btn view" data-id="${transfer.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function loadSales() {
    const salesTable = document.getElementById('salesTable');
    salesTable.innerHTML = sales.map(sale => {
        return `
            <tr>
                <td>${formatDate(sale.date)}</td>
                <td>${sale.invoiceNo}</td>
                <td>${sale.customer}</td>
                <td>${formatCurrency(sale.total)}</td>
                <td><span class="badge badge-success">${sale.status}</span></td>
                <td>
                    <button class="action-btn view" data-id="${sale.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn print" data-id="${sale.id}">
                        <i class="fas fa-print"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function loadPurchases() {
    const purchasesTable = document.getElementById('purchasesTable');
    purchasesTable.innerHTML = purchases.map(purchase => {
        const supplier = getSupplierById(purchase.supplierId);
        return `
            <tr>
                <td>${formatDate(purchase.date)}</td>
                <td>${purchase.reference}</td>
                <td>${supplier ? supplier.name : 'N/A'}</td>
                <td>${formatCurrency(purchase.total)}</td>
                <td><span class="badge badge-success">${purchase.status}</span></td>
                <td>
                    <button class="action-btn view" data-id="${purchase.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function loadReports() {
    loadInventoryReport();
}

function loadInventoryReport() {
    const inventoryReportTable = document.getElementById('inventoryReportTable');
    inventoryReportTable.innerHTML = products.map(product => {
        const category = getCategoryById(product.categoryId);
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
                <td>${formatCurrency(product.purchasePrice)}</td>
                <td>${formatCurrency(totalValue)}</td>
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
                            return formatCurrency(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.raw);
                        }
                    }
                }
            }
        }
    });
    
    // Load sales data for table
    const salesReportTable = document.getElementById('salesReportTable');
    salesReportTable.innerHTML = sales.map(sale => {
        return `
            <tr>
                <td>${formatDate(sale.date)}</td>
                <td>${sale.invoiceNo}</td>
                <td>${sale.customer}</td>
                <td>${sale.items.length}</td>
                <td>${formatCurrency(sale.total)}</td>
                <td><span class="badge badge-success">${sale.status}</span></td>
            </tr>
        `;
    }).join('');
}

function loadPurchaseReport() {
    // Initialize chart
    const ctx = document.getElementById('purchasesChart').getContext('2d');
    if (window.purchasesChart) {
        window.purchasesChart.destroy();
    }
    
    // Sample purchase data for chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const purchaseData = months.map(() => Math.floor(Math.random() * 5000000) + 2000000);
    
    window.purchasesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'Purchases (UGX)',
                data: purchaseData,
                backgroundColor: 'rgba(245, 158, 11, 0.5)',
                borderColor: 'rgba(245, 158, 11, 1)',
                borderWidth: 1
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
                            return formatCurrency(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.raw);
                        }
                    }
                }
            }
        }
    });
    
    // Load purchase data for table
    const purchaseReportTable = document.getElementById('purchaseReportTable');
    purchaseReportTable.innerHTML = purchases.map(purchase => {
        const supplier = getSupplierById(purchase.supplierId);
        return `
            <tr>
                <td>${formatDate(purchase.date)}</td>
                <td>${purchase.reference}</td>
                <td>${supplier ? supplier.name : 'N/A'}</td>
                <td>${purchase.items.length}</td>
                <td>${formatCurrency(purchase.total)}</td>
                <td><span class="badge badge-success">${purchase.status}</span></td>
            </tr>
        `;
    }).join('');
}

function loadProfitLossReport() {
    // Initialize chart
    const ctx = document.getElementById('profitLossChart').getContext('2d');
    if (window.profitLossChart) {
        window.profitLossChart.destroy();
    }
    
    // Sample data for chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueData = months.map(() => Math.floor(Math.random() * 10000000) + 5000000);
    const costData = months.map(() => Math.floor(Math.random() * 7000000) + 3000000);
    const profitData = revenueData.map((rev, i) => rev - costData[i]);
    
    window.profitLossChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Revenue',
                    data: revenueData,
                    backgroundColor: 'rgba(16, 185, 129, 0.5)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Cost',
                    data: costData,
                    backgroundColor: 'rgba(239, 68, 68, 0.5)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Profit',
                    data: profitData,
                    backgroundColor: 'rgba(37, 99, 235, 0.5)',
                    borderColor: 'rgba(37, 99, 235, 1)',
                    borderWidth: 1,
                    type: 'line'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
                        }
                    }
                }
            }
        }
    });
    
    // Calculate totals
    const totalRevenue = revenueData.reduce((sum, val) => sum + val, 0);
    const totalCost = costData.reduce((sum, val) => sum + val, 0);
    const totalProfit = totalRevenue - totalCost;
    
    // Load data for table
    const profitLossTable = document.getElementById('profitLossTable');
    profitLossTable.innerHTML = months.map((month, i) => `
        <tr>
            <td>${month}</td>
            <td>${formatCurrency(revenueData[i])}</td>
            <td>${formatCurrency(costData[i])}</td>
            <td>${formatCurrency(revenueData[i] - costData[i])}</td>
            <td>${formatCurrency(Math.floor(Math.random() * 1000000) + 500000)}</td>
            <td>${formatCurrency((revenueData[i] - costData[i]) - (Math.floor(Math.random() * 1000000) + 500000)}</td>
        </tr>
    `).join('') + `
        <tr style="font-weight: bold;">
            <td>Total</td>
            <td>${formatCurrency(totalRevenue)}</td>
            <td>${formatCurrency(totalCost)}</td>
            <td>${formatCurrency(totalProfit)}</td>
            <td>${formatCurrency(totalCost * 0.2)}</td>
            <td>${formatCurrency(totalProfit - (totalCost * 0.2))}</td>
        </tr>
    `;
}

// Modal Functions
function openProductModal(product = null) {
    // Populate category dropdown
    const categorySelect = document.getElementById('productCategory');
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    categories.forEach(category => {
        categorySelect.innerHTML += `<option value="${category.id}">${category.name}</option>`;
    });
    
    // Populate supplier dropdown
    const supplierSelect = document.getElementById('productSupplier');
    supplierSelect.innerHTML = '<option value="">Select Supplier</option>';
    suppliers.forEach(supplier => {
        supplierSelect.innerHTML += `<option value="${supplier.id}">${supplier.name}</option>`;
    });
    
    // Populate location dropdown
    const locationSelect = document.getElementById('productLocation');
    locationSelect.innerHTML = '<option value="">Select Location</option>';
    locations.forEach(location => {
        locationSelect.innerHTML += `<option value="${location}">${location}</option>`;
    });
    
    if (product) {
        // Edit mode
        document.getElementById('productModalTitle').textContent = 'Edit Product';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.categoryId;
        document.getElementById('productSupplier').value = product.supplierId;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productPurchasePrice').value = product.purchasePrice;
        document.getElementById('productSellingPrice').value = product.sellingPrice;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productReorderLevel').value = product.reorderLevel;
        document.getElementById('productUnit').value = product.unit;
        document.getElementById('productBarcode').value = product.barcode || '';
        document.getElementById('productLocation').value = product.location || '';
        document.getElementById('saveProduct').textContent = 'Update Product';
    } else {
        // Add mode
        document.getElementById('productModalTitle').textContent = 'Add New Product';
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        document.getElementById('saveProduct').textContent = 'Save Product';
    }
    
    productModal.classList.add('active');
}

function openCategoryModal(category = null) {
    if (category) {
        // Edit mode
        document.getElementById('categoryModalTitle').textContent = 'Edit Category';
        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryDescription').value = category.description || '';
        document.getElementById('saveCategory').textContent = 'Update Category';
    } else {
        // Add mode
        document.getElementById('categoryModalTitle').textContent = 'Add New Category';
        document.getElementById('categoryForm').reset();
        document.getElementById('categoryId').value = '';
        document.getElementById('saveCategory').textContent = 'Save Category';
    }
    
    categoryModal.classList.add('active');
}

function openSupplierModal(supplier = null) {
    if (supplier) {
        // Edit mode
        document.getElementById('supplierModalTitle').textContent = 'Edit Supplier';
        document.getElementById('supplierId').value = supplier.id;
        document.getElementById('supplierName').value = supplier.name;
        document.getElementById('supplierContact').value = supplier.contact;
        document.getElementById('supplierEmail').value = supplier.email || '';
        document.getElementById('supplierAddress').value = supplier.address || '';
        document.getElementById('saveSupplier').textContent = 'Update Supplier';
    } else {
        // Add mode
        document.getElementById('supplierModalTitle').textContent = 'Add New Supplier';
        document.getElementById('supplierForm').reset();
        document.getElementById('supplierId').value = '';
        document.getElementById('saveSupplier').textContent = 'Save Supplier';
    }
    
    supplierModal.classList.add('active');
}

function openInventoryModal(productId = null) {
    // Populate product dropdown
    const productSelect = document.getElementById('adjustmentProduct');
    productSelect.innerHTML = '<option value="">Select Product</option>';
    products.forEach(product => {
        productSelect.innerHTML += `<option value="${product.id}">${product.name}</option>`;
    });
    
    if (productId) {
        productSelect.value = productId;
    }
    
    // Reset form
    document.getElementById('inventoryForm').reset();
    inventoryModal.classList.add('active');
}

function openTransferModal() {
    // Populate product dropdown
    const productSelect = document.getElementById('transferProduct');
    productSelect.innerHTML = '<option value="">Select Product</option>';
    products.forEach(product => {
        productSelect.innerHTML += `<option value="${product.id}">${product.name} (${product.location})</option>`;
    });
    
    // Populate from location dropdown
    const fromLocationSelect = document.getElementById('transferFrom');
    fromLocationSelect.innerHTML = '<option value="">Select Location</option>';
    locations.forEach(location => {
        fromLocationSelect.innerHTML += `<option value="${location}">${location}</option>`;
    });
    
    // Populate to location dropdown
    const toLocationSelect = document.getElementById('transferTo');
    toLocationSelect.innerHTML = '<option value="">Select Location</option>';
    locations.forEach(location => {
        toLocationSelect.innerHTML += `<option value="${location}">${location}</option>`;
    });
    
    // Reset form
    document.getElementById('transferForm').reset();
    transferModal.classList.add('active');
}

function openSaleModal() {
    // Populate product dropdown
    const productSelect = document.getElementById('saleProduct');
    productSelect.innerHTML = '<option value="">Select Product</option>';
    products.forEach(product => {
        productSelect.innerHTML += `<option value="${product.id}">${product.name} (${formatCurrency(product.sellingPrice)})</option>`;
    });
    
    // Reset form
    document.getElementById('saleForm').reset();
    document.getElementById('saleItems').innerHTML = '';
    document.getElementById('saleSubtotal').textContent = 'UGX 0';
    document.getElementById('saleTax').textContent = 'UGX 0';
    document.getElementById('saleDiscount').textContent = 'UGX 0';
    document.getElementById('saleTotal').textContent = 'UGX 0';
    
    saleModal.classList.add('active');
}

function openPurchaseModal() {
    // Populate product dropdown
    const productSelect = document.getElementById('purchaseProduct');
    productSelect.innerHTML = '<option value="">Select Product</option>';
    products.forEach(product => {
        productSelect.innerHTML += `<option value="${product.id}">${product.name} (${formatCurrency(product.purchasePrice)})</option>`;
    });
    
    // Populate supplier dropdown
    const supplierSelect = document.getElementById('purchaseSupplier');
    supplierSelect.innerHTML = '<option value="">Select Supplier</option>';
    suppliers.forEach(supplier => {
        supplierSelect.innerHTML += `<option value="${supplier.id}">${supplier.name}</option>`;
    });
    
    // Reset form
    document.getElementById('purchaseForm').reset();
    document.getElementById('purchaseItems').innerHTML = '';
    document.getElementById('purchaseSubtotal').textContent = 'UGX 0';
    document.getElementById('purchaseTax').textContent = 'UGX 0';
    document.getElementById('purchaseDiscount').textContent = 'UGX 0';
    document.getElementById('purchaseTotal').textContent = 'UGX 0';
    
    purchaseModal.classList.add('active');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Form Handlers
function handleProductFormSubmit(e) {
    e.preventDefault();
    
    const form = document.getElementById('productForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const productId = document.getElementById('productId').value;
    const productData = {
        name: document.getElementById('productName').value,
        categoryId: parseInt(document.getElementById('productCategory').value),
        supplierId: parseInt(document.getElementById('productSupplier').value),
        description: document.getElementById('productDescription').value,
        purchasePrice: parseFloat(document.getElementById('productPurchasePrice').value),
        sellingPrice: parseFloat(document.getElementById('productSellingPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        reorderLevel: parseInt(document.getElementById('productReorderLevel').value),
        unit: document.getElementById('productUnit').value,
        barcode: document.getElementById('productBarcode').value,
        location: document.getElementById('productLocation').value,
        createdAt: new Date().toISOString()
    };
    
    if (productId) {
        // Update existing product
        const index = products.findIndex(p => p.id === parseInt(productId));
        if (index !== -1) {
            productData.createdAt = products[index].createdAt;
            products[index] = { ...products[index], ...productData };
            addActivity('Product updated', `Updated product: ${productData.name}`);
            showToast('Product updated successfully');
        }
    } else {
        // Add new product
        const newProduct = {
            id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
            ...productData
        };
        products.push(newProduct);
        addActivity('Product added', `Added new product: ${newProduct.name}`);
        showToast('Product added successfully');
    }
    
    localStorage.setItem('products', JSON.stringify(products));
    closeAllModals();
    loadProducts();
    loadDashboardData();
    loadInventory();
}

function handleCategoryFormSubmit(e) {
    e.preventDefault();
    
    const form = document.getElementById('categoryForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const categoryId = document.getElementById('categoryId').value;
    const categoryData = {
        name: document.getElementById('categoryName').value,
        description: document.getElementById('categoryDescription').value
    };
    
    if (categoryId) {
        // Update existing category
        const index = categories.findIndex(c => c.id === parseInt(categoryId));
        if (index !== -1) {
            categories[index] = { ...categories[index], ...categoryData };
            addActivity('Category updated', `Updated category: ${categoryData.name}`);
            showToast('Category updated successfully');
        }
    } else {
        // Add new category
        const newCategory = {
            id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
            ...categoryData
        };
        categories.push(newCategory);
        addActivity('Category added', `Added new category: ${newCategory.name}`);
        showToast('Category added successfully');
    }
    
    localStorage.setItem('categories', JSON.stringify(categories));
    closeAllModals();
    loadCategories();
}

function handleSupplierFormSubmit(e) {
    e.preventDefault();
    
    const form = document.getElementById('supplierForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const supplierId = document.getElementById('supplierId').value;
    const supplierData = {
        name: document.getElementById('supplierName').value,
        contact: document.getElementById('supplierContact').value,
        email: document.getElementById('supplierEmail').value,
        address: document.getElementById('supplierAddress').value
    };
    
    if (supplierId) {
        // Update existing supplier
        const index = suppliers.findIndex(s => s.id === parseInt(supplierId));
        if (index !== -1) {
            suppliers[index] = { ...suppliers[index], ...supplierData };
            addActivity('Supplier updated', `Updated supplier: ${supplierData.name}`);
            showToast('Supplier updated successfully');
        }
    } else {
        // Add new supplier
        const newSupplier = {
            id: suppliers.length > 0 ? Math.max(...suppliers.map(s => s.id)) + 1 : 1,
            ...supplierData
        };
        suppliers.push(newSupplier);
        addActivity('Supplier added', `Added new supplier: ${newSupplier.name}`);
        showToast('Supplier added successfully');
    }
    
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
    closeAllModals();
    loadSuppliers();
}

function handleInventoryFormSubmit(e) {
    e.preventDefault();
    
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
        user: currentUser.name
    };
    
    adjustments.push(newAdjustment);
    localStorage.setItem('adjustments', JSON.stringify(adjustments));
    
    // Add activity
    const product = products[productIndex];
    addActivity('Stock adjusted', `Adjusted stock for ${product.name}: ${type === 'add' ? '+' : '-'}${quantity} units`);
    
    closeAllModals();
    showToast('Stock adjusted successfully');
    loadInventory();
    loadDashboardData();
}

function handleTransferFormSubmit(e) {
    e.preventDefault();
    
    const form = document.getElementById('transferForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const productId = parseInt(document.getElementById('transferProduct').value);
    const quantity = parseInt(document.getElementById('transferQuantity').value);
    const fromLocation = document.getElementById('transferFrom').value;
    const toLocation = document.getElementById('transferTo').value;
    const notes = document.getElementById('transferNotes').value;
    
    // Find product
    const productIndex = products.findIndex(p => p.id === productId && p.location === fromLocation);
    if (productIndex === -1) {
        showToast('Product not found at selected location', 'error');
        return;
    }
    
    // Check stock
    if (products[productIndex].stock < quantity) {
        showToast('Not enough stock to transfer', 'error');
        return;
    }
    
    // Update stock at from location
    products[productIndex].stock -= quantity;
    
    // Find or create product at to location
    const toProductIndex = products.findIndex(p => p.id === productId && p.location === toLocation);
    if (toProductIndex !== -1) {
        products[toProductIndex].stock += quantity;
    } else {
        const newProduct = { ...products[productIndex] };
        newProduct.stock = quantity;
        newProduct.location = toLocation;
        newProduct.id = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        products.push(newProduct);
    }
    
    localStorage.setItem('products', JSON.stringify(products));
    
    // Record transfer
    const newTransfer = {
        id: transfers.length > 0 ? Math.max(...transfers.map(t => t.id)) + 1 : 1,
        date: new Date().toISOString(),
        reference: 'TRF-' + Math.floor(Math.random() * 10000),
        productId,
        quantity,
        fromLocation,
        toLocation,
        notes,
        user: currentUser.name,
        status: 'Completed'
    };
    
    transfers.push(newTransfer);
    localStorage.setItem('transfers', JSON.stringify(transfers));
    
    // Add activity
    const product = products[productIndex];
    addActivity('Stock transferred', `Transferred ${quantity} units of ${product.name} from ${fromLocation} to ${toLocation}`);
    
    closeAllModals();
    showToast('Stock transferred successfully');
    loadInventory();
    loadDashboardData();
}

function handleSaleFormSubmit(e) {
    e.preventDefault();
    
    const form = document.getElementById('saleForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const customer = document.getElementById('saleCustomer').value || 'Walk-in Customer';
    const paymentMethod = document.getElementById('salePaymentMethod').value;
    const items = Array.from(document.querySelectorAll('#saleItems tr')).map(row => {
        return {
            productId: parseInt(row.getAttribute('data-id')),
            quantity: parseInt(row.querySelector('.item-quantity').textContent),
            price: parseFloat(row.querySelector('.item-price').textContent.replace(/[^0-9.]/g, '')),
            total: parseFloat(row.querySelector('.item-total').textContent.replace(/[^0-9.]/g, ''))
        };
    });
    
    if (items.length === 0) {
        showToast('Please add at least one item to the sale', 'error');
        return;
    }
    
    // Check stock availability
    for (const item of items) {
        const product = getProductById(item.productId);
        if (!product || product.stock < item.quantity) {
            showToast(`Not enough stock for ${product ? product.name : 'selected product'}`, 'error');
            return;
        }
    }
    
    // Update stock
    for (const item of items) {
        const productIndex = products.findIndex(p => p.id === item.productId);
        if (productIndex !== -1) {
            products[productIndex].stock -= item.quantity;
        }
    }
    
    localStorage.setItem('products', JSON.stringify(products));
    
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = 0; // Could be calculated based on tax rate
    const discount = 0; // Could be applied from form
    const total = subtotal + tax - discount;
    
    // Record sale
    const newSale = {
        id: sales.length > 0 ? Math.max(...sales.map(s => s.id)) + 1 : 1,
        invoiceNo: 'INV-' + Math.floor(Math.random() * 10000),
        date: new Date().toISOString(),
        customer,
        items,
        subtotal,
        tax,
        discount,
        total,
        paymentMethod,
        status: 'Completed',
        user: currentUser.name
    };
    
    sales.push(newSale);
    localStorage.setItem('sales', JSON.stringify(sales));
    
    // Add activity
    addActivity('Sale recorded', `Recorded sale ${newSale.invoiceNo} for ${formatCurrency(total)}`);
    
    closeAllModals();
    showToast('Sale recorded successfully');
    loadSales();
    loadDashboardData();
}

function handlePurchaseFormSubmit(e) {
    e.preventDefault();
    
    const form = document.getElementById('purchaseForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const supplierId = parseInt(document.getElementById('purchaseSupplier').value);
    const paymentMethod = document.getElementById('purchasePaymentMethod').value;
    const items = Array.from(document.querySelectorAll('#purchaseItems tr')).map(row => {
        return {
            productId: parseInt(row.getAttribute('data-id')),
            quantity: parseInt(row.querySelector('.item-quantity').textContent),
            price: parseFloat(row.querySelector('.item-price').textContent.replace(/[^0-9.]/g, '')),
            total: parseFloat(row.querySelector('.item-total').textContent.replace(/[^0-9.]/g, ''))
        };
    });
    
    if (items.length === 0) {
        showToast('Please add at least one item to the purchase', 'error');
        return;
    }
    
    // Update stock or add new products
    for (const item of items) {
        const productIndex = products.findIndex(p => p.id === item.productId);
        if (productIndex !== -1) {
            products[productIndex].stock += item.quantity;
        } else {
            // In a real app, we'd need more product details here
            showToast('Product not found', 'error');
            return;
        }
    }
    
    localStorage.setItem('products', JSON.stringify(products));
    
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = 0; // Could be calculated based on tax rate
    const discount = 0; // Could be applied from form
    const total = subtotal + tax - discount;
    
    // Record purchase
    const newPurchase = {
        id: purchases.length > 0 ? Math.max(...purchases.map(p => p.id)) + 1 : 1,
        reference: 'PUR-' + Math.floor(Math.random() * 10000),
        date: new Date().toISOString(),
        supplierId,
        items,
        subtotal,
        tax,
        discount,
        total,
        paymentMethod,
        status: 'Completed',
        user: currentUser.name
    };
    
    purchases.push(newPurchase);
    localStorage.setItem('purchases', JSON.stringify(purchases));
    
    // Add activity
    const supplier = getSupplierById(supplierId);
    addActivity('Purchase recorded', `Recorded purchase ${newPurchase.reference} from ${supplier ? supplier.name : 'supplier'} for ${formatCurrency(total)}`);
    
    closeAllModals();
    showToast('Purchase recorded successfully');
    loadPurchases();
    loadDashboardData();
}

// Event Listeners
function setupEventListeners() {
    // Sidebar toggle
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
    
    // Menu navigation
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
    
    // Tab navigation
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
    
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // Form submissions
    document.getElementById('productForm').addEventListener('submit', handleProductFormSubmit);
    document.getElementById('categoryForm').addEventListener('submit', handleCategoryFormSubmit);
    document.getElementById('supplierForm').addEventListener('submit', handleSupplierFormSubmit);
    document.getElementById('inventoryForm').addEventListener('submit', handleInventoryFormSubmit);
    document.getElementById('transferForm').addEventListener('submit', handleTransferFormSubmit);
    document.getElementById('saleForm').addEventListener('submit', handleSaleFormSubmit);
    document.getElementById('purchaseForm').addEventListener('submit', handlePurchaseFormSubmit);
    
    // Add buttons
    document.getElementById('addProductBtn').addEventListener('click', () => openProductModal());
    document.getElementById('addCategoryBtn').addEventListener('click', () => openCategoryModal());
    document.getElementById('addSupplierBtn').addEventListener('click', () => openSupplierModal());
    document.getElementById('addInventoryBtn').addEventListener('click', () => openInventoryModal());
    document.getElementById('addTransferBtn').addEventListener('click', () => openTransferModal());
    document.getElementById('addSaleBtn').addEventListener('click', () => openSaleModal());
    document.getElementById('addPurchaseBtn').addEventListener('click', () => openPurchaseModal());
    
    // Print buttons
    document.getElementById('printDashboard').addEventListener('click', () => window.print());
    document.getElementById('printReport').addEventListener('click', () => window.print());
    
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
    
    document.getElementById('supplierSearch').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#suppliersTable tr');
        
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
    
    // Sale item management
    document.getElementById('addSaleItem').addEventListener('click', () => {
        const productId = parseInt(document.getElementById('saleProduct').value);
        const quantity = parseInt(document.getElementById('saleQuantity').value) || 1;
        
        if (!productId) {
            showToast('Please select a product', 'error');
            return;
        }
        
        const product = getProductById(productId);
        if (!product) {
            showToast('Product not found', 'error');
            return;
        }
        
        if (quantity <= 0) {
            showToast('Quantity must be at least 1', 'error');
            return;
        }
        
        if (product.stock < quantity) {
            showToast(`Only ${product.stock} units available`, 'error');
            return;
        }
        
        const price = product.sellingPrice;
        const total = price * quantity;
        
        // Check if item already exists
        const existingItem = document.querySelector(`#saleItems tr[data-id="${productId}"]`);
        if (existingItem) {
            const existingQuantity = parseInt(existingItem.querySelector('.item-quantity').textContent);
            const newQuantity = existingQuantity + quantity;
            
            if (product.stock < newQuantity) {
                showToast(`Only ${product.stock} units available`, 'error');
                return;
            }
            
            existingItem.querySelector('.item-quantity').textContent = newQuantity;
            existingItem.querySelector('.item-total').textContent = formatCurrency(price * newQuantity);
        } else {
            // Add new item
            const itemRow = document.createElement('tr');
            itemRow.setAttribute('data-id', productId);
            itemRow.innerHTML = `
                <td>${product.name}</td>
                <td class="item-quantity">${quantity}</td>
                <td class="item-price">${formatCurrency(price)}</td>
                <td class="item-total">${formatCurrency(total)}</td>
                <td>
                    <button class="action-btn remove-item">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            document.getElementById('saleItems').appendChild(itemRow);
        }
        
        // Update totals
        updateSaleTotals();
        
        // Reset form
        document.getElementById('saleQuantity').value = '';
    });
    
    // Purchase item management
    document.getElementById('addPurchaseItem').addEventListener('click', () => {
        const productId = parseInt(document.getElementById('purchaseProduct').value);
        const quantity = parseInt(document.getElementById('purchaseQuantity').value) || 1;
        const price = parseFloat(document.getElementById('purchasePrice').value) || 0;
        
        if (!productId) {
            showToast('Please select a product', 'error');
            return;
        }
        
        if (quantity <= 0) {
            showToast('Quantity must be at least 1', 'error');
            return;
        }
        
        if (price <= 0) {
            showToast('Price must be greater than 0', 'error');
            return;
        }
        
        const product = getProductById(productId);
        if (!product) {
            showToast('Product not found', 'error');
            return;
        }
        
        const total = price * quantity;
        
        // Check if item already exists
        const existingItem = document.querySelector(`#purchaseItems tr[data-id="${productId}"]`);
        if (existingItem) {
            const existingQuantity = parseInt(existingItem.querySelector('.item-quantity').textContent);
            const newQuantity = existingQuantity + quantity;
            
            existingItem.querySelector('.item-quantity').textContent = newQuantity;
            existingItem.querySelector('.item-price').textContent = formatCurrency(price);
            existingItem.querySelector('.item-total').textContent = formatCurrency(price * newQuantity);
        } else {
            // Add new item
            const itemRow = document.createElement('tr');
            itemRow.setAttribute('data-id', productId);
            itemRow.innerHTML = `
                <td>${product.name}</td>
                <td class="item-quantity">${quantity}</td>
                <td class="item-price">${formatCurrency(price)}</td>
                <td class="item-total">${formatCurrency(total)}</td>
                <td>
                    <button class="action-btn remove-item">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            document.getElementById('purchaseItems').appendChild(itemRow);
        }
        
        // Update totals
        updatePurchaseTotals();
        
        // Reset form
        document.getElementById('purchaseQuantity').value = '';
        document.getElementById('purchasePrice').value = '';
    });
    
    // Event delegation for dynamic elements
    document.addEventListener('click', (e) => {
        // Adjust stock button
        if (e.target.closest('.adjust-stock')) {
            const productId = parseInt(e.target.closest('.adjust-stock').getAttribute('data-id'));
            openInventoryModal(productId);
        }
        
        // Delete buttons
        if (e.target.closest('.action-btn.delete')) {
            if (confirm('Are you sure you want to delete this item?')) {
                const id = parseInt(e.target.closest('.action-btn').getAttribute('data-id'));
                
                // Determine which table the button is in
                if (e.target.closest('#productsTable')) {
                    products = products.filter(p => p.id !== id);
                    localStorage.setItem('products', JSON.stringify(products));
                    addActivity('Product deleted', `Deleted product with ID: ${id}`);
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
                    addActivity('Category deleted', `Deleted category with ID: ${id}`);
                    showToast('Category deleted successfully');
                    loadCategories();
                } else if (e.target.closest('#suppliersTable')) {
                    // Check if supplier is in use
                    const productsUsingSupplier = products.filter(p => p.supplierId === id);
                    if (productsUsingSupplier.length > 0) {
                        showToast('Cannot delete supplier - it is being used by products', 'error');
                        return;
                    }
                    
                    suppliers = suppliers.filter(s => s.id !== id);
                    localStorage.setItem('suppliers', JSON.stringify(suppliers));
                    addActivity('Supplier deleted', `Deleted supplier with ID: ${id}`);
                    showToast('Supplier deleted successfully');
                    loadSuppliers();
                }
            }
        }
        
        // Edit buttons
        if (e.target.closest('.action-btn.edit')) {
            const id = parseInt(e.target.closest('.action-btn').getAttribute('data-id'));
            
            if (e.target.closest('#productsTable')) {
                const product = getProductById(id);
                if (product) openProductModal(product);
            } else if (e.target.closest('#categoriesTable')) {
                const category = getCategoryById(id);
                if (category) openCategoryModal(category);
            } else if (e.target.closest('#suppliersTable')) {
                const supplier = getSupplierById(id);
                if (supplier) openSupplierModal(supplier);
            }
        }
        
        // View buttons
        if (e.target.closest('.action-btn.view')) {
            const id = parseInt(e.target.closest('.action-btn').getAttribute('data-id'));
            
            if (e.target.closest('#transfersTable')) {
                const transfer = transfers.find(t => t.id === id);
                if (transfer) {
                    const product = getProductById(transfer.productId);
                    alert(`Transfer Details:\n\nReference: ${transfer.reference}\nProduct: ${product ? product.name : 'N/A'}\nQuantity: ${transfer.quantity}\nFrom: ${transfer.fromLocation}\nTo: ${transfer.toLocation}\nDate: ${formatDate(transfer.date)}`);
                }
            } else if (e.target.closest('#salesTable')) {
                const sale = sales.find(s => s.id === id);
                if (sale) {
                    let details = `Invoice: ${sale.invoiceNo}\nCustomer: ${sale.customer}\nDate: ${formatDate(sale.date)}\n\nItems:\n`;
                    sale.items.forEach(item => {
                        const product = getProductById(item.productId);
                        details += `- ${product ? product.name : 'N/A'} (${item.quantity} x ${formatCurrency(item.price)}) = ${formatCurrency(item.total)}\n`;
                    });
                    details += `\nSubtotal: ${formatCurrency(sale.subtotal)}\nTax: ${formatCurrency(sale.tax)}\nDiscount: ${formatCurrency(sale.discount)}\nTotal: ${formatCurrency(sale.total)}`;
                    alert(details);
                }
            } else if (e.target.closest('#purchasesTable')) {
                const purchase = purchases.find(p => p.id === id);
                if (purchase) {
                    const supplier = getSupplierById(purchase.supplierId);
                    let details = `Reference: ${purchase.reference}\nSupplier: ${supplier ? supplier.name : 'N/A'}\nDate: ${formatDate(purchase.date)}\n\nItems:\n`;
                    purchase.items.forEach(item => {
                        const product = getProductById(item.productId);
                        details += `- ${product ? product.name : 'N/A'} (${item.quantity} x ${formatCurrency(item.price)}) = ${formatCurrency(item.total)}\n`;
                    });
                    details += `\nSubtotal: ${formatCurrency(purchase.subtotal)}\nTax: ${formatCurrency(purchase.tax)}\nDiscount: ${formatCurrency(purchase.discount)}\nTotal: ${formatCurrency(purchase.total)}`;
                    alert(details);
                }
            }
        }
        
        // Print buttons
        if (e.target.closest('.action-btn.print')) {
            const id = parseInt(e.target.closest('.action-btn').getAttribute('data-id'));
            const sale = sales.find(s => s.id === id);
            if (sale) {
                // In a real app, this would open a print dialog with a formatted invoice
                alert(`Printing invoice ${sale.invoiceNo}`);
            }
        }
        
        // Remove item buttons (sale/purchase)
        if (e.target.closest('.remove-item')) {
            const row = e.target.closest('tr');
            row.parentNode.removeChild(row);
            
            if (e.target.closest('#saleItems')) {
                updateSaleTotals();
            } else if (e.target.closest('#purchaseItems')) {
                updatePurchaseTotals();
            }
        }
    });
}

// Helper functions for sales/purchases
function updateSaleTotals() {
    const items = Array.from(document.querySelectorAll('#saleItems tr')).map(row => {
        return parseFloat(row.querySelector('.item-total').textContent.replace(/[^0-9.]/g, ''));
    });
    
    const subtotal = items.reduce((sum, total) => sum + total, 0);
    const tax = 0; // Could be calculated
    const discount = 0; // Could be applied
    const total = subtotal + tax - discount;
    
    document.getElementById('saleSubtotal').textContent = formatCurrency(subtotal);
    document.getElementById('saleTax').textContent = formatCurrency(tax);
    document.getElementById('saleDiscount').textContent = formatCurrency(discount);
    document.getElementById('saleTotal').textContent = formatCurrency(total);
}

function updatePurchaseTotals() {
    const items = Array.from(document.querySelectorAll('#purchaseItems tr')).map(row => {
        return parseFloat(row.querySelector('.item-total').textContent.replace(/[^0-9.]/g, ''));
    });
    
    const subtotal = items.reduce((sum, total) => sum + total, 0);
    const tax = 0; // Could be calculated
    const discount = 0; // Could be applied
    const total = subtotal + tax - discount;
    
    document.getElementById('purchaseSubtotal').textContent = formatCurrency(subtotal);
    document.getElementById('purchaseTax').textContent = formatCurrency(tax);
    document.getElementById('purchaseDiscount').textContent = formatCurrency(discount);
    document.getElementById('purchaseTotal').textContent = formatCurrency(total);
}

// Tab data loader
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
        case 'suppliers':
            loadSuppliers();
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
        case 'transfers':
            loadTransfers();
            break;
        case 'sales':
            loadSales();
            break;
        case 'purchases':
            loadPurchases();
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
        case 'purchase-report':
            loadPurchaseReport();
            break;
        case 'profit-loss':
            loadProfitLossReport();
            break;
    }
}

// Initialize the application
function init() {
    initializeSampleData();
    setupEventListeners();
    loadDashboardData();
    
    // Set current user info
    document.querySelector('.user-info h4').textContent = currentUser.name;
    document.querySelector('.user-info p').textContent = currentUser.role;
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
