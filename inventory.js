// reports.js - Handles all reports functionality for StockMaster UG Inventory System

document.addEventListener('DOMContentLoaded', function() {
    // Initialize reports when the reports tab is loaded
    document.querySelector('.menu-item[data-target="reports"]').addEventListener('click', function() {
        initializeReports();
    });

    // Function to initialize all report functionality
    function initializeReports() {
        // Load the initial inventory report
        loadInventoryReport();

        // Set up event listeners for report tabs
        setupReportTabs();

        // Set up export buttons
        setupExportButtons();

        // Initialize charts
        initializeCharts();
    }

    // Set up report tabs
    function setupReportTabs() {
        const tabs = document.querySelectorAll('#reports .tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Show corresponding tab content
                const parent = this.closest('.tab-content');
                const siblingContents = parent.querySelectorAll('.tab-content');
                siblingContents.forEach(content => content.classList.remove('active'));
                document.getElementById(tabId).classList.add('active');
                
                // Load data for the selected report
                switch(tabId) {
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
            });
        });
    }

    // Set up export buttons
    function setupExportButtons() {
        document.querySelectorAll('#reports .btn-secondary').forEach(btn => {
            btn.addEventListener('click', function() {
                const reportType = this.closest('.tab-content').id;
                exportReport(reportType);
            });
        });
    }

    // Load inventory report
    function loadInventoryReport() {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        
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

    // Load sales report
    function loadSalesReport() {
        const sales = JSON.parse(localStorage.getItem('sales')) || [];
        const salesReportTable = document.getElementById('salesReportTable');
        
        // Generate sample data if empty
        if (sales.length === 0) {
            salesReportTable.innerHTML = generateSampleSalesData();
        } else {
            salesReportTable.innerHTML = sales.map(sale => {
                const itemsCount = sale.items.reduce((sum, item) => sum + item.quantity, 0);
                const totalAmount = sale.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
                
                return `
                    <tr>
                        <td>${new Date(sale.date).toLocaleDateString()}</td>
                        <td>${sale.invoiceNumber}</td>
                        <td>${sale.customer || 'Walk-in Customer'}</td>
                        <td>${itemsCount}</td>
                        <td>${totalAmount.toLocaleString()}</td>
                        <td><span class="badge badge-success">Paid</span></td>
                    </tr>
                `;
            }).join('');
        }
        
        // Initialize sales chart
        initializeSalesChart();
    }

    // Load purchase report
    function loadPurchaseReport() {
        const purchases = JSON.parse(localStorage.getItem('purchases')) || [];
        const suppliers = JSON.parse(localStorage.getItem('suppliers')) || [];
        const purchaseReportTable = document.getElementById('purchaseReportTable');
        
        // Generate sample data if empty
        if (purchases.length === 0) {
            purchaseReportTable.innerHTML = generateSamplePurchaseData();
        } else {
            purchaseReportTable.innerHTML = purchases.map(purchase => {
                const supplier = suppliers.find(s => s.id === purchase.supplierId);
                const itemsCount = purchase.items.reduce((sum, item) => sum + item.quantity, 0);
                const totalAmount = purchase.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
                
                return `
                    <tr>
                        <td>${new Date(purchase.date).toLocaleDateString()}</td>
                        <td>${purchase.referenceNumber}</td>
                        <td>${supplier ? supplier.name : 'N/A'}</td>
                        <td>${itemsCount}</td>
                        <td>${totalAmount.toLocaleString()}</td>
                        <td><span class="badge badge-success">Completed</span></td>
                    </tr>
                `;
            }).join('');
        }
        
        // Initialize purchases chart
        initializePurchasesChart();
    }

    // Load profit & loss report
    function loadProfitLossReport() {
        const profitLossTable = document.getElementById('profitLossTable');
        profitLossTable.innerHTML = generateProfitLossData();
        
        // Initialize profit & loss chart
        initializeProfitLossChart();
    }

    // Initialize charts
    function initializeCharts() {
        initializeSalesChart();
        initializePurchasesChart();
        initializeProfitLossChart();
    }

    // Initialize sales chart
    function initializeSalesChart() {
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
    }

    // Initialize purchases chart
    function initializePurchasesChart() {
        const ctx = document.getElementById('purchasesChart').getContext('2d');
        if (window.purchasesChart) {
            window.purchasesChart.destroy();
        }
        
        // Sample purchases data for chart
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const purchasesData = months.map(() => Math.floor(Math.random() * 8000000) + 3000000);
        
        window.purchasesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Purchases (UGX)',
                    data: purchasesData,
                    backgroundColor: 'rgba(245, 158, 11, 0.7)',
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
    }

    // Initialize profit & loss chart
    function initializeProfitLossChart() {
        const ctx = document.getElementById('profitLossChart').getContext('2d');
        if (window.profitLossChart) {
            window.profitLossChart.destroy();
        }
        
        // Sample profit & loss data for chart
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const revenueData = months.map(() => Math.floor(Math.random() * 10000000) + 5000000);
        const costData = months.map(() => Math.floor(Math.random() * 8000000) + 3000000);
        const profitData = revenueData.map((rev, i) => rev - costData[i]);
        
        window.profitLossChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Revenue',
                        data: revenueData,
                        backgroundColor: 'rgba(16, 185, 129, 0.7)',
                        borderColor: 'rgba(16, 185, 129, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Cost',
                        data: costData,
                        backgroundColor: 'rgba(239, 68, 68, 0.7)',
                        borderColor: 'rgba(239, 68, 68, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Profit',
                        data: profitData,
                        backgroundColor: 'rgba(37, 99, 235, 0.7)',
                        borderColor: 'rgba(37, 99, 235, 1)',
                        borderWidth: 1,
                        type: 'line',
                        tension: 0.4
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
                                return 'UGX ' + value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': UGX ' + context.raw.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    // Export report function
    function exportReport(reportType) {
        // Get the data based on report type
        let data = [];
        let fileName = '';
        let headers = [];
        
        switch(reportType) {
            case 'inventory-report':
                const products = JSON.parse(localStorage.getItem('products')) || [];
                const categories = JSON.parse(localStorage.getItem('categories')) || [];
                
                data = products.map(product => {
                    const category = categories.find(c => c.id === product.categoryId);
                    const totalValue = product.stock * product.purchasePrice;
                    const status = product.stock === 0 ? 'Out of Stock' : 
                                   product.stock <= product.reorderLevel ? 'Low Stock' : 'In Stock';
                    
                    return {
                        'Product Name': product.name,
                        'Category': category ? category.name : 'N/A',
                        'Current Stock': `${product.stock} ${product.unit}`,
                        'Unit Price (UGX)': product.purchasePrice,
                        'Total Value (UGX)': totalValue,
                        'Status': status
                    };
                });
                
                fileName = 'inventory_report';
                headers = ['Product Name', 'Category', 'Current Stock', 'Unit Price (UGX)', 'Total Value (UGX)', 'Status'];
                break;
                
            case 'sales-report':
                const sales = JSON.parse(localStorage.getItem('sales')) || [];
                
                if (sales.length === 0) {
                    // Use sample data if no sales exist
                    data = generateSampleSalesDataForExport();
                } else {
                    data = sales.map(sale => {
                        const itemsCount = sale.items.reduce((sum, item) => sum + item.quantity, 0);
                        const totalAmount = sale.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
                        
                        return {
                            'Date': new Date(sale.date).toLocaleDateString(),
                            'Invoice No.': sale.invoiceNumber,
                            'Customer': sale.customer || 'Walk-in Customer',
                            'Items': itemsCount,
                            'Total (UGX)': totalAmount,
                            'Status': 'Completed'
                        };
                    });
                }
                
                fileName = 'sales_report';
                headers = ['Date', 'Invoice No.', 'Customer', 'Items', 'Total (UGX)', 'Status'];
                break;
                
            case 'purchase-report':
                const purchases = JSON.parse(localStorage.getItem('purchases')) || [];
                const suppliers = JSON.parse(localStorage.getItem('suppliers')) || [];
                
                if (purchases.length === 0) {
                    // Use sample data if no purchases exist
                    data = generateSamplePurchaseDataForExport();
                } else {
                    data = purchases.map(purchase => {
                        const supplier = suppliers.find(s => s.id === purchase.supplierId);
                        const itemsCount = purchase.items.reduce((sum, item) => sum + item.quantity, 0);
                        const totalAmount = purchase.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
                        
                        return {
                            'Date': new Date(purchase.date).toLocaleDateString(),
                            'Reference': purchase.referenceNumber,
                            'Supplier': supplier ? supplier.name : 'N/A',
                            'Items': itemsCount,
                            'Total (UGX)': totalAmount,
                            'Status': 'Completed'
                        };
                    });
                }
                
                fileName = 'purchase_report';
                headers = ['Date', 'Reference', 'Supplier', 'Items', 'Total (UGX)', 'Status'];
                break;
                
            case 'profit-loss':
                data = generateProfitLossDataForExport();
                fileName = 'profit_loss_report';
                headers = ['Period', 'Revenue (UGX)', 'Cost of Goods Sold (UGX)', 'Gross Profit (UGX)', 'Expenses (UGX)', 'Net Profit (UGX)'];
                break;
        }
        
        // Show export options modal
        showExportOptionsModal(data, headers, fileName);
    }

    // Show export options modal
    function showExportOptionsModal(data, headers, fileName) {
        // Create modal HTML
        const modalHTML = `
            <div class="modal active" id="exportModal">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3 class="modal-title">Export Report</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label">Export Format</label>
                            <select class="form-control" id="exportFormat">
                                <option value="csv">CSV</option>
                                <option value="excel">Excel</option>
                                <option value="pdf">PDF</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">File Name</label>
                            <input type="text" class="form-control" id="exportFileName" value="${fileName}">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-danger modal-close">Cancel</button>
                        <button class="btn btn-success" id="exportData">Export</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to DOM
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        
        // Set up event listeners
        document.getElementById('exportData').addEventListener('click', function() {
            const format = document.getElementById('exportFormat').value;
            const fileName = document.getElementById('exportFileName').value;
            
            switch(format) {
                case 'csv':
                    exportToCSV(data, headers, fileName);
                    break;
                case 'excel':
                    exportToExcel(data, headers, fileName);
                    break;
                case 'pdf':
                    exportToPDF(data, headers, fileName);
                    break;
            }
            
            // Close modal
            document.querySelector('#exportModal .modal-close').click();
        });
        
        // Close modal handler
        document.querySelectorAll('#exportModal .modal-close').forEach(btn => {
            btn.addEventListener('click', function() {
                document.getElementById('exportModal').remove();
            });
        });
    }

    // Export to CSV
    function exportToCSV(data, headers, fileName) {
        // Create CSV content
        let csvContent = headers.join(',') + '\n';
        
        data.forEach(item => {
            const row = headers.map(header => {
                // Handle nested objects if needed
                const value = item[header];
                return typeof value === 'object' ? JSON.stringify(value) : value;
            });
            csvContent += row.join(',') + '\n';
        });
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${fileName}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Export to Excel
    function exportToExcel(data, headers, fileName) {
        // Create Excel workbook XML
        let xml = `
            <?xml version="1.0"?>
            <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
                xmlns:o="urn:schemas-microsoft-com:office:office"
                xmlns:x="urn:schemas-microsoft-com:office:excel"
                xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
                xmlns:html="http://www.w3.org/TR/REC-html40">
                <Worksheet ss:Name="${fileName}">
                    <Table>
                        <Row>
                            ${headers.map(header => `<Cell><Data ss:Type="String">${header}</Data></Cell>`).join('')}
                        </Row>
        `;
        
        // Add data rows
        data.forEach(item => {
            xml += '<Row>';
            headers.forEach(header => {
                const value = item[header];
                const type = typeof value === 'number' ? 'Number' : 'String';
                xml += `<Cell><Data ss:Type="${type}">${value}</Data></Cell>`;
            });
            xml += '</Row>';
        });
        
        xml += `
                    </Table>
                </Worksheet>
            </Workbook>
        `;
        
        // Create download link
        const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${fileName}.xls`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Export to PDF
    function exportToPDF(data, headers, fileName) {
        // For a real implementation, you would use a library like jsPDF or pdfmake
        // This is a simplified version that just opens a print dialog
        
        // Create a printable version of the data
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${fileName}</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    h1 { color: #2563eb; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background-color: #2563eb; color: white; text-align: left; padding: 8px; }
                    td { border: 1px solid #ddd; padding: 8px; }
                    tr:nth-child(even) { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <h1>${fileName.replace(/_/g, ' ').toUpperCase()}</h1>
                <table>
                    <thead>
                        <tr>
                            ${headers.map(header => `<th>${header}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Add data rows
        data.forEach(item => {
            html += '<tr>';
            headers.forEach(header => {
                html += `<td>${item[header]}</td>`;
            });
            html += '</tr>';
        });
        
        html += `
                    </tbody>
                </table>
                <p>Generated on ${new Date().toLocaleString()}</p>
            </body>
            </html>
        `;
        
        // Open print dialog
        const printWindow = window.open('', '_blank');
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    }

    // Helper functions to generate sample data
    function generateSampleSalesData() {
        return `
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

    function generateSamplePurchaseData() {
        return `
            <tr>
                <td>${new Date().toLocaleDateString()}</td>
                <td>PUR-${Math.floor(Math.random() * 1000)}</td>
                <td>Supplier ${Math.floor(Math.random() * 10)}</td>
                <td>${Math.floor(Math.random() * 10) + 1}</td>
                <td>${(Math.random() * 1000000 + 500000).toLocaleString()}</td>
                <td><span class="badge badge-success">Completed</span></td>
            </tr>
            <tr>
                <td>${new Date(Date.now() - 86400000).toLocaleDateString()}</td>
                <td>PUR-${Math.floor(Math.random() * 1000)}</td>
                <td>Supplier ${Math.floor(Math.random() * 10)}</td>
                <td>${Math.floor(Math.random() * 10) + 1}</td>
                <td>${(Math.random() * 1000000 + 500000).toLocaleString()}</td>
                <td><span class="badge badge-success">Completed</span></td>
            </tr>
            <tr>
                <td>${new Date(Date.now() - 172800000).toLocaleDateString()}</td>
                <td>PUR-${Math.floor(Math.random() * 1000)}</td>
                <td>Supplier ${Math.floor(Math.random() * 10)}</td>
                <td>${Math.floor(Math.random() * 10) + 1}</td>
                <td>${(Math.random() * 1000000 + 500000).toLocaleString()}</td>
                <td><span class="badge badge-warning">Pending</span></td>
            </tr>
        `;
    }

    function generateProfitLossData() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        return months.map((month, index) => {
            const revenue = Math.floor(Math.random() * 10000000) + 5000000;
            const cogs = Math.floor(revenue * (0.5 + Math.random() * 0.2));
            const grossProfit = revenue - cogs;
            const expenses = Math.floor(grossProfit * (0.2 + Math.random() * 0.1));
            const netProfit = grossProfit - expenses;
            
            return `
                <tr>
                    <td>${month} 2023</td>
                    <td>${revenue.toLocaleString()}</td>
                    <td>${cogs.toLocaleString()}</td>
                    <td>${grossProfit.toLocaleString()}</td>
                    <td>${expenses.toLocaleString()}</td>
                    <td>${netProfit.toLocaleString()}</td>
                </tr>
            `;
        }).join('');
    }

    function generateSampleSalesDataForExport() {
        return [
            {
                'Date': new Date().toLocaleDateString(),
                'Invoice No.': `INV-${Math.floor(Math.random() * 1000)}`,
                'Customer': `Customer ${Math.floor(Math.random() * 100)}`,
                'Items': Math.floor(Math.random() * 10) + 1,
                'Total (UGX)': Math.floor(Math.random() * 1000000) + 500000,
                'Status': 'Paid'
            },
            {
                'Date': new Date(Date.now() - 86400000).toLocaleDateString(),
                'Invoice No.': `INV-${Math.floor(Math.random() * 1000)}`,
                'Customer': `Customer ${Math.floor(Math.random() * 100)}`,
                'Items': Math.floor(Math.random() * 10) + 1,
                'Total (UGX)': Math.floor(Math.random() * 1000000) + 500000,
                'Status': 'Paid'
            },
            {
                'Date': new Date(Date.now() - 172800000).toLocaleDateString(),
                'Invoice No.': `INV-${Math.floor(Math.random() * 1000)}`,
                'Customer': `Customer ${Math.floor(Math.random() * 100)}`,
                'Items': Math.floor(Math.random() * 10) + 1,
                'Total (UGX)': Math.floor(Math.random() * 1000000) + 500000,
                'Status': 'Pending'
            }
        ];
    }

    function generateSamplePurchaseDataForExport() {
        return [
            {
                'Date': new Date().toLocaleDateString(),
                'Reference': `PUR-${Math.floor(Math.random() * 1000)}`,
                'Supplier': `Supplier ${Math.floor(Math.random() * 10)}`,
                'Items': Math.floor(Math.random() * 10) + 1,
                'Total (UGX)': Math.floor(Math.random() * 1000000) + 500000,
                'Status': 'Completed'
            },
            {
                'Date': new Date(Date.now() - 86400000).toLocaleDateString(),
                'Reference': `PUR-${Math.floor(Math.random() * 1000)}`,
                'Supplier': `Supplier ${Math.floor(Math.random() * 10)}`,
                'Items': Math.floor(Math.random() * 10) + 1,
                'Total (UGX)': Math.floor(Math.random() * 1000000) + 500000,
                'Status': 'Completed'
            },
            {
                'Date': new Date(Date.now() - 172800000).toLocaleDateString(),
                'Reference': `PUR-${Math.floor(Math.random() * 1000)}`,
                'Supplier': `Supplier ${Math.floor(Math.random() * 10)}`,
                'Items': Math.floor(Math.random() * 10) + 1,
                'Total (UGX)': Math.floor(Math.random() * 1000000) + 500000,
                'Status': 'Pending'
            }
        ];
    }

    function generateProfitLossDataForExport() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        return months.map(month => {
            const revenue = Math.floor(Math.random() * 10000000) + 5000000;
            const cogs = Math.floor(revenue * (0.5 + Math.random() * 0.2));
            const grossProfit = revenue - cogs;
            const expenses = Math.floor(grossProfit * (0.2 + Math.random() * 0.1));
            const netProfit = grossProfit - expenses;
            
            return {
                'Period': `${month} 2023`,
                'Revenue (UGX)': revenue,
                'Cost of Goods Sold (UGX)': cogs,
                'Gross Profit (UGX)': grossProfit,
                'Expenses (UGX)': expenses,
                'Net Profit (UGX)': netProfit
            };
        });
    }
});
