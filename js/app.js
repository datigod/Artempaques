// Sistema de navegación y funcionalidad para Artempaques
class ArtempaquesApp {
    constructor() {
        this.currentScreen = 'login';
        this.currentQuote = null;
        this.currentQuoteData = null;
        this.quotes = [];
        this.orders = [];
        this.clients = [];
        this.products = [];
        this.orderCounter = 156;
        
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
        
        // Render orders list when showing orders screen
        if (screenId === 'orders-list-screen') {
            this.renderOrdersList();
        }
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
        const quoteNumber = `COT-${String(Math.floor(Math.random() * 1000) + 100).padStart(5, '0')}`;
        
        // Get total from sticky bar
        const totalElement = document.getElementById('total-sticky');
        const total = totalElement ? totalElement.textContent : '$0.00';
        
        // Get client name
        const clientName = clientInfo.querySelector('h3') ? clientInfo.querySelector('h3').textContent : 'Cliente';
        
        // Store current quote data
        this.currentQuoteData = {
            number: quoteNumber,
            client: clientName,
            total: total,
            date: new Date()
        };
        
        this.showToast('success', '¡Éxito!', `Cotización ${quoteNumber} guardada correctamente`);
        this.showScreen('quote-preview-screen');
    }

    handleOrderSubmit(e) {
        e.preventDefault();
        
        const deliveryDate = document.getElementById('delivery-date').value;
        const notes = document.getElementById('order-notes').value;
        const priority = document.getElementById('priority').value;
        
        if (!deliveryDate) {
            this.showToast('error', 'Error', 'Por favor seleccione una fecha de entrega');
            return;
        }

        // Generate order number
        this.orderCounter++;
        const orderNumber = `PED-${String(this.orderCounter).padStart(5, '0')}`;
        
        // Get current quote data or default values
        const client = this.currentQuoteData ? this.currentQuoteData.client : 'Cliente';
        const total = this.currentQuoteData ? this.currentQuoteData.total : '$0.00';
        
        // Format delivery date
        const dateObj = new Date(deliveryDate);
        const formattedDate = dateObj.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
        
        // Create new order
        const newOrder = {
            number: orderNumber,
            client: client,
            total: total,
            deliveryDate: formattedDate,
            status: 'open',
            notes: notes,
            priority: priority,
            createdAt: new Date()
        };
        
        // Add to orders array
        this.orders.unshift(newOrder);
        
        // Update orders list in DOM
        this.renderOrdersList();
        
        this.showToast('success', '¡Pedido creado!', `Pedido ${orderNumber} creado exitosamente`);
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
        // Generate PDF content
        this.generatePDF();
    }
    
    generatePDF() {
        const quoteData = this.currentQuoteData || {
            number: 'COT-00124',
            client: 'Industrias G\u00f3mez S.A.',
            total: '$285.00'
        };\n        
        // Create a simple HTML content for PDF
        const pdfContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset=\"UTF-8\">
    <title>Cotizaci\u00f3n ${quoteData.number}</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 3px solid #0D47A1; padding-bottom: 20px; }
        .company { color: #0D47A1; }
        .company h1 { margin: 0; font-size: 28px; }
        .quote-info { text-align: right; }
        .quote-info h2 { margin: 0; color: #0D47A1; font-size: 24px; }
        .client-section { margin: 30px 0; padding: 20px; background-color: #E3F2FD; border-radius: 8px; }
        .client-section h3 { margin-top: 0; color: #0D47A1; }
        table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #0D47A1; color: white; }
        .totals { margin-top: 30px; text-align: right; }
        .totals .row { display: flex; justify-content: flex-end; gap: 100px; padding: 8px 0; }
        .totals .total-row { font-size: 20px; font-weight: bold; border-top: 2px solid #0D47A1; padding-top: 15px; margin-top: 15px; background-color: #E3F2FD; padding: 15px; border-radius: 8px; }
        .conditions { margin-top: 40px; padding: 20px; background-color: #f5f5f5; border-radius: 8px; }
        .conditions h3 { color: #0D47A1; }
        .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
    </style>
</head>
<body>
    <div class=\"header\">
        <div class=\"company\">
            <h1>Artempaques S.A.</h1>
            <p>Calle 50 #25-123, Medell\u00edn</p>
            <p>NIT: 890.123.456-7</p>
            <p>Tel: (604) 444-5555</p>
        </div>
        <div class=\"quote-info\">
            <h2>Cotizaci\u00f3n</h2>
            <p><strong>${quoteData.number}</strong></p>
            <p>Fecha: ${new Date().toLocaleDateString('es-CO')}</p>
            <p>Validez: 30 d\u00edas</p>
        </div>
    </div>
    
    <div class=\"client-section\">
        <h3>Cliente</h3>
        <p><strong>${quoteData.client}</strong></p>
        <p>NIT: 890.123.456-7</p>
        <p>Contacto: Carlos Rodr\u00edguez</p>
        <p>Tel: (604) 234-5678</p>
    </div>
    
    <h3 style=\"color: #0D47A1;\">Detalles de la cotizaci\u00f3n</h3>
    <table>
        <thead>
            <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Descuento</th>
                <th>Impuesto</th>
                <th>Subtotal</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Bolsa pl\u00e1stica 30x40cm</td>
                <td>1,000</td>
                <td>$0.25</td>
                <td>5%</td>
                <td>19%</td>
                <td>$237.50</td>
            </tr>
        </tbody>
    </table>
    
    <div class=\"totals\">
        <div class=\"row\">
            <span>Subtotal:</span>
            <span>$250.00</span>
        </div>
        <div class=\"row\">
            <span>Descuentos:</span>
            <span style=\"color: #f44336;\">-$12.50</span>
        </div>
        <div class=\"row\">
            <span>Impuestos:</span>
            <span>$47.50</span>
        </div>
        <div class=\"row total-row\">
            <span>TOTAL:</span>
            <span>${quoteData.total}</span>
        </div>
    </div>
    
    <div class=\"conditions\">
        <h3>Condiciones comerciales</h3>
        <ul>
            <li>Forma de pago: 30 d\u00edas</li>
            <li>Tiempo de entrega: 15 d\u00edas h\u00e1biles</li>
            <li>Validez de la cotizaci\u00f3n: 30 d\u00edas</li>
            <li>Precios sujetos a disponibilidad de inventario</li>
        </ul>
    </div>
    
    <div class=\"footer\">
        <p>Artempaques S.A. - Soluciones en empaques pl\u00e1sticos</p>
        <p>www.artempaques.com | ventas@artempaques.com</p>
    </div>
</body>
</html>
        `;
        
        // Create blob and download
        const blob = new Blob([pdfContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Cotizacion_${quoteData.number}_${new Date().getTime()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('success', 'PDF generado', `Cotizaci\u00f3n ${quoteData.number} descargada como HTML (abrir en navegador para imprimir como PDF)`);\n    }

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

    renderOrdersList() {
        const ordersList = document.getElementById('orders-list');
        if (!ordersList) return;
        
        // Clear existing orders (keep only sample orders if no custom orders)
        if (this.orders.length === 0) return;
        
        // Generate HTML for all orders
        let ordersHTML = '';
        
        // Add custom orders first
        this.orders.forEach(order => {
            const badgeClass = this.getOrderBadgeClass(order.status);
            const badgeText = this.getOrderBadgeText(order.status);
            
            ordersHTML += `
                <div class="order-item">
                    <div class="order-info">
                        <div class="order-header-info">
                            <span class="order-number">${order.number}</span>
                            <span class="badge ${badgeClass}">${badgeText}</span>
                        </div>
                        <div class="order-details">
                            <span class="order-client">${order.client}</span>
                            <span class="order-date">Entrega: ${order.deliveryDate}</span>
                        </div>
                        <div class="order-total">
                            <span>${order.total}</span>
                        </div>
                    </div>
                    <div class="order-actions">
                        <button class="btn btn-sm btn-outline" onclick="viewOrder('${order.number}')">
                            <i class="fas fa-eye"></i>
                            Ver
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="trackOrder('${order.number}')">
                            <i class="fas fa-truck"></i>
                            Seguir
                        </button>
                    </div>
                </div>
            `;
        });
        
        // Add sample orders
        ordersHTML += `
            <div class="order-item">
                <div class="order-info">
                    <div class="order-header-info">
                        <span class="order-number">PED-00156</span>
                        <span class="badge badge-in-production">En producción</span>
                    </div>
                    <div class="order-details">
                        <span class="order-client">Industrias Gómez S.A.</span>
                        <span class="order-date">Entrega: 25 Nov 2025</span>
                    </div>
                    <div class="order-total">
                        <span>$285.00</span>
                    </div>
                </div>
                <div class="order-actions">
                    <button class="btn btn-sm btn-outline" onclick="viewOrder('PED-00156')">
                        <i class="fas fa-eye"></i>
                        Ver
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="trackOrder('PED-00156')">
                        <i class="fas fa-truck"></i>
                        Seguir
                    </button>
                </div>
            </div>
            
            <div class="order-item">
                <div class="order-info">
                    <div class="order-header-info">
                        <span class="order-number">PED-00155</span>
                        <span class="badge badge-dispatched">Despachado</span>
                    </div>
                    <div class="order-details">
                        <span class="order-client">Comercial López</span>
                        <span class="order-date">Entrega: 20 Nov 2025</span>
                    </div>
                    <div class="order-total">
                        <span>$1,450.00</span>
                    </div>
                </div>
                <div class="order-actions">
                    <button class="btn btn-sm btn-outline" onclick="viewOrder('PED-00155')">
                        <i class="fas fa-eye"></i>
                        Ver
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="trackOrder('PED-00155')">
                        <i class="fas fa-truck"></i>
                        Seguir
                    </button>
                </div>
            </div>
            
            <div class="order-item">
                <div class="order-info">
                    <div class="order-header-info">
                        <span class="order-number">PED-00154</span>
                        <span class="badge badge-open">Abierto</span>
                    </div>
                    <div class="order-details">
                        <span class="order-client">Empresas Martínez</span>
                        <span class="order-date">Entrega: 28 Nov 2025</span>
                    </div>
                    <div class="order-total">
                        <span>$890.00</span>
                    </div>
                </div>
                <div class="order-actions">
                    <button class="btn btn-sm btn-outline" onclick="viewOrder('PED-00154')">
                        <i class="fas fa-eye"></i>
                        Ver
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="trackOrder('PED-00154')">
                        <i class="fas fa-truck"></i>
                        Seguir
                    </button>
                </div>
            </div>
        `;
        
        ordersList.innerHTML = ordersHTML;
    }
    
    getOrderBadgeClass(status) {
        const badges = {
            'open': 'badge-open',
            'in-production': 'badge-in-production',
            'dispatched': 'badge-dispatched',
            'delivered': 'badge-approved'
        };
        return badges[status] || 'badge-open';
    }
    
    getOrderBadgeText(status) {
        const texts = {
            'open': 'Abierto',
            'in-production': 'En producción',
            'dispatched': 'Despachado',
            'delivered': 'Entregado'
        };
        return texts[status] || 'Abierto';
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
