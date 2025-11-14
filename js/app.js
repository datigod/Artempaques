// Sistema de navegación y funcionalidad para Artempaques
class ArtempaquesApp {
    constructor() {
        this.currentScreen = 'login';
        this.currentQuote = null;
        this.quotes = [];
        this.orders = [];
        this.clients = [];
        this.products = [];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSampleData();
        this.showScreen('login-screen');
    }

    bindEvents() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Quote form
        const quoteForm = document.getElementById('quote-form');
        if (quoteForm) {
            quoteForm.addEventListener('submit', (e) => this.handleQuoteSubmit(e));
        }

        // Order form
        const orderForm = document.getElementById('order-form');
        if (orderForm) {
            orderForm.addEventListener('submit', (e) => this.handleOrderSubmit(e));
        }

        // Search functionality
        const productSearch = document.getElementById('product-search');
        if (productSearch) {
            productSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchProduct();
                }
            });
        }

        // Client search
        const clientSearch = document.getElementById('client-search');
        if (clientSearch) {
            clientSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchClient();
                }
            });
        }

        // Calculate totals when inputs change
        document.addEventListener('input', (e) => {
            if (e.target.matches('#items-list input')) {
                this.calculateTotals();
            }
        });

        // Set today's date as default for delivery date
        const deliveryDate = document.getElementById('delivery-date');
        if (deliveryDate) {
            const today = new Date();
            const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
            deliveryDate.value = nextWeek.toISOString().split('T')[0];
        }
    }

    loadSampleData() {
        // Sample clients
        this.clients = [
            {
                id: 1,
                name: "Industrias Gómez S.A.",
                nit: "890.123.456-7",
                contact: "Carlos Rodríguez",
                phone: "(604) 234-5678",
                email: "carlos@industriasgomez.com"
            },
            {
                id: 2,
                name: "Comercial López",
                nit: "900.987.654-3",
                contact: "María López",
                phone: "(604) 876-5432",
                email: "maria@comerciallopez.com"
            },
            {
                id: 3,
                name: "Empresas Martínez",
                nit: "910.456.789-0",
                contact: "Juan Martínez",
                phone: "(604) 345-6789",
                email: "juan@empresasmartinez.com"
            }
        ];

        // Sample products
        this.products = [
            {
                id: 1,
                code: "BOL-3040",
                name: "Bolsa plástica 30x40cm",
                unit: "unidad",
                stock: 15250,
                lots: [
                    { code: "L2025-001", quantity: 8500 },
                    { code: "L2025-002", quantity: 6750 }
                ]
            },
            {
                id: 2,
                code: "PEL-500",
                name: "Película stretch 500mm",
                unit: "rollo",
                stock: 450,
                lots: [
                    { code: "L2025-003", quantity: 450 }
                ]
            },
            {
                id: 3,
                code: "CAJ-2020",
                name: "Caja cartón 20x20cm",
                unit: "unidad",
                stock: 8500,
                lots: [
                    { code: "L2025-004", quantity: 5000 },
                    { code: "L2025-005", quantity: 3500 }
                ]
            }
        ];
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        document.querySelectorAll('.screen-content').forEach(content => {
            content.classList.remove('active');
        });

        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            
            // If it's a screen content, also show main app
            if (screenId.includes('-screen') && screenId !== 'login-screen') {
                document.getElementById('main-app').classList.add('active');
                document.getElementById(screenId).classList.add('active');
            }
        }

        this.currentScreen = screenId;
        
        // Update page title
        this.updatePageTitle(screenId);
    }

    updatePageTitle(screenId) {
        const titles = {
            'dashboard-screen': 'Dashboard - Artempaques',
            'new-quote-screen': 'Nueva Cotización - Artempaques',
            'quote-preview-screen': 'Resumen de Cotización - Artempaques',
            'convert-order-screen': 'Convertir a Pedido - Artempaques',
            'availability-screen': 'Disponibilidad - Artempaques',
            'quotes-list-screen': 'Cotizaciones - Artempaques',
            'orders-list-screen': 'Pedidos - Artempaques',
            'clients-screen': 'Clientes - Artempaques'
        };

        document.title = titles[screenId] || 'Artempaques - Sistema de Cotizaciones';
    }

    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Simple validation (in real app, this would be an API call)
        if (email && password) {
            this.showToast('success', '¡Bienvenido!', 'Inicio de sesión exitoso');
            this.showScreen('dashboard-screen');
        } else {
            this.showToast('error', 'Error', 'Por favor complete todos los campos');
        }
    }

    handleQuoteSubmit(e) {
        e.preventDefault();
        
        // Validate form
        const clientInfo = document.getElementById('client-info');
        const itemsList = document.getElementById('items-list');
        
        if (!clientInfo.querySelector('h3')) {
            this.showToast('error', 'Error', 'Por favor seleccione un cliente');
            return;
        }
        
        if (itemsList.querySelectorAll('.table-row').length === 0) {
            this.showToast('error', 'Error', 'Por favor agregue al menos un ítem');
            return;
        }

        // Generate quote number
        const quoteNumber = `COT-${String(Math.floor(Math.random() * 1000) + 100).padStart(3, '0')}`;
        
        this.showToast('success', '¡Éxito!', 'Cotización guardada correctamente');
        this.showScreen('quote-preview-screen');
    }

    handleOrderSubmit(e) {
        e.preventDefault();
        
        const deliveryDate = document.getElementById('delivery-date').value;
        const notes = document.getElementById('order-notes').value;
        
        if (!deliveryDate) {
            this.showToast('error', 'Error', 'Por favor seleccione una fecha de entrega');
            return;
        }

        // Generate order number
        const orderNumber = `PED-${String(Math.floor(Math.random() * 1000) + 100).padStart(3, '0')}`;
        
        this.showToast('success', '¡Pedido creado!', 'Pedido ${orderNumber} creado exitosamente');
        this.showScreen('orders-list-screen');
    }

    addItem() {
        const itemsList = document.getElementById('items-list');
        const newRow = document.createElement('div');
        newRow.className = 'table-row';
        newRow.innerHTML = `
            <div class="col-product">
                <input type="text" placeholder="Producto" value="">
            </div>
            <div class="col-qty">
                <input type="number" placeholder="Cant" value="1" min="1">
            </div>
            <div class="col-price">
                <input type="number" placeholder="Precio" value="0.00" step="0.01" min="0">
            </div>
            <div class="col-discount">
                <input type="number" placeholder="Desc%" value="0" min="0" max="100">
            </div>
            <div class="col-tax">
                <input type="number" placeholder="Imp%" value="19" min="0" max="100">
            </div>
            <div class="col-subtotal">
                <span class="subtotal">$0.00</span>
            </div>
            <div class="col-actions">
                <button type="button" class="btn-icon btn-danger" onclick="removeItem(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        itemsList.appendChild(newRow);
        this.calculateTotals();
    }

    removeItem(button) {
        const row = button.closest('.table-row');
        row.remove();
        this.calculateTotals();
        this.showToast('info', 'Ítem eliminado', 'El ítem ha sido eliminado de la cotización');
    }

    calculateTotals() {
        let subtotal = 0;
        let totalDiscounts = 0;
        let totalTaxes = 0;

        const rows = document.querySelectorAll('#items-list .table-row');
        rows.forEach(row => {
            const quantity = parseFloat(row.querySelector('.col-qty input').value) || 0;
            const price = parseFloat(row.querySelector('.col-price input').value) || 0;
            const discount = parseFloat(row.querySelector('.col-discount input').value) || 0;
            const tax = parseFloat(row.querySelector('.col-tax input').value) || 0;

            const itemSubtotal = quantity * price;
            const itemDiscount = itemSubtotal * (discount / 100);
            const itemAfterDiscount = itemSubtotal - itemDiscount;
            const itemTax = itemAfterDiscount * (tax / 100);
            const itemTotal = itemAfterDiscount + itemTax;

            row.querySelector('.subtotal').textContent = `$${itemTotal.toFixed(2)}`;

            subtotal += itemSubtotal;
            totalDiscounts += itemDiscount;
            totalTaxes += itemTax;
        });

        const total = subtotal - totalDiscounts + totalTaxes;

        // Update sticky bar totals (Iteración 2)
        const subtotalSticky = document.getElementById('subtotal-sticky');
        const discountsSticky = document.getElementById('discounts-sticky');
        const taxesSticky = document.getElementById('taxes-sticky');
        const totalSticky = document.getElementById('total-sticky');

        if (subtotalSticky) subtotalSticky.textContent = `$${subtotal.toFixed(2)}`;
        if (discountsSticky) discountsSticky.textContent = `-$${totalDiscounts.toFixed(2)}`;
        if (taxesSticky) taxesSticky.textContent = `$${totalTaxes.toFixed(2)}`;
        if (totalSticky) totalSticky.textContent = `$${total.toFixed(2)}`;
    }

    searchClient() {
        const searchTerm = document.getElementById('client-search').value.toLowerCase();
        const clientInfo = document.getElementById('client-info');
        
        const client = this.clients.find(c => 
            c.name.toLowerCase().includes(searchTerm) || 
            c.nit.includes(searchTerm)
        );

        if (client) {
            clientInfo.innerHTML = `
                <div class="client-details">
                    <h3>${client.name}</h3>
                    <p>NIT: ${client.nit}</p>
                    <p>Contacto: ${client.contact}</p>
                    <p>Tel: ${client.phone}</p>
                </div>
            `;
        } else {
            clientInfo.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user"></i>
                    <h3>Cliente no encontrado</h3>
                    <p>Verifique el nombre o NIT ingresado</p>
                </div>
            `;
        }
    }

    searchProduct() {
        const searchTerm = document.getElementById('product-search').value.toLowerCase();
        const resultsContainer = document.getElementById('availability-results');
        const emptyState = document.getElementById('empty-state');
        
        const product = this.products.find(p => 
            p.name.toLowerCase().includes(searchTerm) || 
            p.code.toLowerCase().includes(searchTerm)
        );

        if (product) {
            resultsContainer.style.display = 'flex';
            emptyState.style.display = 'none';
            
            // Update product display (simplified for demo)
            this.showToast('success', 'Producto encontrado', `${product.name} - Stock: ${product.stock}`
            );
        } else {
            resultsContainer.style.display = 'none';
            emptyState.style.display = 'block';
        }
    }

    filterQuotes() {
        const statusFilter = document.getElementById('status-filter').value;
        const clientFilter = document.getElementById('client-filter').value.toLowerCase();
        const quotes = document.querySelectorAll('.quote-item');

        quotes.forEach(quote => {
            const status = quote.querySelector('.badge').textContent.toLowerCase();
            const client = quote.querySelector('.quote-client').textContent.toLowerCase();
            
            const statusMatch = !statusFilter || status.includes(statusFilter);
            const clientMatch = !clientFilter || client.includes(clientFilter);
            
            quote.style.display = (statusMatch && clientMatch) ? 'block' : 'none';
        });
    }

    filterOrders() {
        const statusFilter = document.getElementById('order-status-filter').value;
        const clientFilter = document.getElementById('order-client-filter').value.toLowerCase();
        const orders = document.querySelectorAll('order-item');

        orders.forEach(order => {
            const status = order.querySelector('.badge').textContent.toLowerCase();
            const client = order.querySelector('order-client').textContent.toLowerCase();
            
            const statusMatch = !statusFilter || status.includes(statusFilter);
            const clientMatch = !clientFilter || client.includes(clientFilter);
            
            order.style.display = (statusMatch && clientMatch) ? 'block' : 'none';
        });
    }

    // Navigation functions
    saveDraft() {
        this.showToast('success', 'Borrador guardado', 'La cotización se ha guardado como borrador');
    }

    previewQuote() {
        this.showScreen('quote-preview-screen');
    }

    editQuote() {
        this.showScreen('new-quote-screen');
    }

    sendPDF() {
        this.showToast('success', 'PDF enviado', 'El PDF ha sido enviado al cliente');
    }

    convertToOrder() {
        this.showScreen('convert-order-screen');
    }

    viewQuote(quoteNumber) {
        this.showToast('info', 'Ver cotización', `Abriendo cotización ${quoteNumber}`);
    }

    duplicateQuote(quoteNumber) {
        this.showToast('success', 'Duplicar', `Cotización ${quoteNumber} duplicada`);
    }

    convertQuoteToOrder(quoteNumber) {
        this.showToast('success', 'Convertir', `Convirtiendo cotización ${quoteNumber} a pedido`);
        this.showScreen('convert-order-screen');
    }

    viewOrder(orderNumber) {
        this.showToast('info', 'Ver pedido', `Abriendo pedido ${orderNumber}`);
    }

    trackOrder(orderNumber) {
        this.showToast('info', 'Seguimiento', `Ver seguimiento del pedido ${orderNumber}`);
    }

    editClient(clientId) {
        this.showToast('info', 'Editar cliente', `Editando cliente ${clientId}`);
    }

    searchClients() {
        const searchTerm = document.getElementById('client-search-input').value.toLowerCase();
        const clients = document.querySelectorAll('.client-item');
        
        clients.forEach(client => {
            const name = client.querySelector('h3').textContent.toLowerCase();
            const nit = client.querySelector('p').textContent.toLowerCase();
            
            const matches = name.includes(searchTerm) || nit.includes(searchTerm);
            client.style.display = matches ? 'block' : 'none';
        });
    }

    showNewClientForm() {
        this.showToast('info', 'Nuevo cliente', 'Formulario de nuevo cliente');
    }

    showUserMenu() {
        const dropdown = document.getElementById('user-dropdown');
        dropdown.classList.toggle('show');
    }

    logout() {
        this.showToast('info', 'Sesión cerrada', 'Ha cerrado sesión exitosamente');
        this.showScreen('login-screen');
        
        // Reset forms
        document.getElementById('login-form').reset();
    }

    showToast(type, title, message) {
        const toastContainer = document.getElementById('toast-container');
        const toastId = `toast-${Date.now()}`;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.id = toastId;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="toast-icon ${icons[type]}"></i>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.closest('.toast').remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            const toastElement = document.getElementById(toastId);
            if (toastElement) {
                toastElement.remove();
            }
        }, 5000);
    }
}

// Global functions for HTML onclick handlers
function showScreen(screenId) {
    if (window.app) {
        window.app.showScreen(screenId);
    }
}

function removeItem(button) {
    if (window.app) {
        window.app.removeItem(button);
    }
}

function addItem() {
    if (window.app) {
        window.app.addItem();
    }
}

function saveDraft() {
    if (window.app) {
        window.app.saveDraft();
    }
}

function previewQuote() {
    if (window.app) {
        window.app.previewQuote();
    }
}

function editQuote() {
    if (window.app) {
        window.app.editQuote();
    }
}

function sendPDF() {
    if (window.app) {
        window.app.sendPDF();
    }
}

function convertToOrder() {
    if (window.app) {
        window.app.convertToOrder();
    }
}

function viewQuote(quoteNumber) {
    if (window.app) {
        window.app.viewQuote(quoteNumber);
    }
}

function duplicateQuote(quoteNumber) {
    if (window.app) {
        window.app.duplicateQuote(quoteNumber);
    }
}

function convertQuoteToOrder(quoteNumber) {
    if (window.app) {
        window.app.convertQuoteToOrder(quoteNumber);
    }
}

function viewOrder(orderNumber) {
    if (window.app) {
        window.app.viewOrder(orderNumber);
    }
}

function trackOrder(orderNumber) {
    if (window.app) {
        window.app.trackOrder(orderNumber);
    }
}

function editClient(clientId) {
    if (window.app) {
        window.app.editClient(clientId);
    }
}

function searchProduct() {
    if (window.app) {
        window.app.searchProduct();
    }
}

function filterQuotes() {
    if (window.app) {
        window.app.filterQuotes();
    }
}

function filterOrders() {
    if (window.app) {
        window.app.filterOrders();
    }
}

function searchClients() {
    if (window.app) {
        window.app.searchClients();
    }
}

function showNewClientForm() {
    if (window.app) {
        window.app.showNewClientForm();
    }
}

function showUserMenu() {
    if (window.app) {
        window.app.showUserMenu();
    }
}

function logout() {
    if (window.app) {
        window.app.logout();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ArtempaquesApp();
});

// Toggle Lots Accordion (Iteración 2 - Disponibilidad)
function toggleLots(button) {
    const accordion = button.nextElementSibling;
    const isOpen = accordion.classList.contains('open');
    
    // Close all accordions
    document.querySelectorAll('.product-lots-accordion').forEach(acc => {
        acc.classList.remove('open');
    });
    
    document.querySelectorAll('.btn-accordion').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Toggle current accordion
    if (!isOpen) {
        accordion.classList.add('open');
        button.classList.add('active');
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    const userDropdown = document.getElementById('user-dropdown');
    const userMenuBtn = e.target.closest('.user-menu .btn-icon');
    
    if (!userMenuBtn && userDropdown && userDropdown.classList.contains('show')) {
        userDropdown.classList.remove('show');
    }
});
