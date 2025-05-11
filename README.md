import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.io.*;
import java.util.ArrayList;

public class BookstoreSystem {
    // Original fields
    private JFrame frame;
    private JTextArea displayArea;
    private ArrayList<Book> inventory = new ArrayList<>();
    private double totalRevenue = 0;
    private final String DATA_FILE = "book_inventory.txt";
    
    // New fields for customer management
    private ArrayList<Customer> customers = new ArrayList<>();
    private final String CUSTOMER_FILE = "customer_records.txt";

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new BookstoreSystem().initialize());
    }

    private void initialize() {
        // Set modern look and feel (NEW)
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Load existing data
        loadInventory();
        loadCustomers(); // NEW

        // Create main frame
        frame = new JFrame("Tshenolo's Book Management System");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setSize(900, 700); // Slightly larger to accommodate new features
        frame.setLayout(new BorderLayout());

        // Create dashboard panel (NEW)
        JPanel dashboardPanel = new JPanel(new GridLayout(1, 3));
        dashboardPanel.add(createDashboardCard("Total Books", String.valueOf(inventory.size())));
        dashboardPanel.add(createDashboardCard("Total Customers", String.valueOf(customers.size())));
        dashboardPanel.add(createDashboardCard("Total Revenue", "P" + String.format("%.2f", totalRevenue)));
        frame.add(dashboardPanel, BorderLayout.NORTH);

        // Create menu bar
        JMenuBar menuBar = new JMenuBar();
        
        // Create menus
        JMenu fileMenu = new JMenu("File");
        JMenu inventoryMenu = new JMenu("Inventory");
        JMenu salesMenu = new JMenu("Sales");
        JMenu customerMenu = new JMenu("Customers"); // NEW
        
        // Create menu items
        JMenuItem exitItem = new JMenuItem("Exit");
        JMenuItem addBookItem = new JMenuItem("Add New Book");
        JMenuItem viewInventoryItem = new JMenuItem("View Inventory");
        JMenuItem searchBookItem = new JMenuItem("Search Books");
        JMenuItem processSaleItem = new JMenuItem("Process Sale");
        JMenuItem viewRevenueItem = new JMenuItem("View Total Revenue");
        JMenuItem salesReportItem = new JMenuItem("Generate Sales Report"); // NEW
        
        // NEW Customer menu items
        JMenuItem addCustomerItem = new JMenuItem("Add New Customer");
        JMenuItem viewCustomersItem = new JMenuItem("View Customers");
        
        // Add items to menus
        fileMenu.add(exitItem);
        inventoryMenu.add(addBookItem);
        inventoryMenu.add(viewInventoryItem);
        inventoryMenu.add(searchBookItem);
        salesMenu.add(processSaleItem);
        salesMenu.add(viewRevenueItem);
        salesMenu.add(salesReportItem); // NEW
        customerMenu.add(addCustomerItem); // NEW
        customerMenu.add(viewCustomersItem); // NEW
        
        // Add menus to menu bar
        menuBar.add(fileMenu);
        menuBar.add(inventoryMenu);
        menuBar.add(salesMenu);
        menuBar.add(customerMenu); // NEW
        
        frame.setJMenuBar(menuBar);

        // Create display area
        displayArea = new JTextArea();
        displayArea.setEditable(false);
        JScrollPane scrollPane = new JScrollPane(displayArea);
        frame.add(scrollPane, BorderLayout.CENTER);

        // Add status bar
        JLabel statusBar = new JLabel(" Ready");
        frame.add(statusBar, BorderLayout.SOUTH);

        // Add event handlers
        exitItem.addActionListener(e -> System.exit(0));
        addBookItem.addActionListener(e -> addNewBook());
        viewInventoryItem.addActionListener(e -> displayInventory());
        searchBookItem.addActionListener(e -> searchBooks());
        processSaleItem.addActionListener(e -> processSale());
        viewRevenueItem.addActionListener(e -> displayRevenue());
        salesReportItem.addActionListener(e -> generateSalesReport()); // NEW
        addCustomerItem.addActionListener(e -> addNewCustomer()); // NEW
        viewCustomersItem.addActionListener(e -> displayCustomers()); // NEW

        // Display the frame
        frame.setVisible(true);
    }

    // ========== ORIGINAL METHODS (some modified) ==========
    
    private void addNewBook() {
        JPanel panel = new JPanel(new GridLayout(7, 2));
        
        JTextField isbnField = new JTextField();
        JTextField titleField = new JTextField();
        JTextField authorField = new JTextField();
        JTextField genreField = new JTextField();
        JTextField priceField = new JTextField();
        JTextField quantityField = new JTextField();
        
        panel.add(new JLabel("ISBN:"));
        panel.add(isbnField);
        panel.add(new JLabel("Title:"));
        panel.add(titleField);
        panel.add(new JLabel("Author:"));
        panel.add(authorField);
        panel.add(new JLabel("Genre:"));
        panel.add(genreField);
        panel.add(new JLabel("Price:"));
        panel.add(priceField);
        panel.add(new JLabel("Quantity:"));
        panel.add(quantityField);
        
        int result = JOptionPane.showConfirmDialog(frame, panel, "Add New Book", 
                JOptionPane.OK_CANCEL_OPTION, JOptionPane.PLAIN_MESSAGE);
        
        if (result == JOptionPane.OK_OPTION) {
            try {
                String isbn = isbnField.getText();
                String title = titleField.getText();
                String author = authorField.getText();
                String genre = genreField.getText();
                double price = Double.parseDouble(priceField.getText());
                int quantity = Integer.parseInt(quantityField.getText());
                
                Book newBook = new Book(isbn, title, author, genre, price, quantity);
                inventory.add(newBook);
                saveInventory();
                
                displayArea.setText("Book added successfully:\n" + newBook);
                updateDashboard(); // NEW
            } catch (NumberFormatException ex) {
                JOptionPane.showMessageDialog(frame, "Invalid number for price or quantity", 
                        "Error", JOptionPane.ERROR_MESSAGE);
            }
        }
    }

    private void displayInventory() {
        if (inventory.isEmpty()) {
            displayArea.setText("Book is unavailable in stock.");
            return;
        }
        
        StringBuilder sb = new StringBuilder("Current Inventory:\n\n");
        for (Book book : inventory) {
            sb.append(book);
            if (book.getQuantity() < 5) {  // NEW: Low stock warning
                sb.append("\n[LOW STOCK WARNING!]");
            }
            sb.append("\n\n");
        }
        displayArea.setText(sb.toString());
    }

    private void searchBooks() {
        JPanel panel = new JPanel(new GridLayout(4, 2));
        
        JTextField searchField = new JTextField();
        JComboBox<String> searchType = new JComboBox<>(new String[]{"Title", "Author", "Genre", "ISBN"});
        
        panel.add(new JLabel("Search by:"));
        panel.add(searchType);
        panel.add(new JLabel("Search term:"));
        panel.add(searchField);
        
        int result = JOptionPane.showConfirmDialog(frame, panel, "Search Books", 
                JOptionPane.OK_CANCEL_OPTION, JOptionPane.PLAIN_MESSAGE);
        
        if (result == JOptionPane.OK_OPTION) {
            String term = searchField.getText().toLowerCase();
            String type = (String) searchType.getSelectedItem();
            
            StringBuilder sb = new StringBuilder("Search Results (" + type + ": " + term + "):\n\n");
            boolean found = false;
            
            for (Book book : inventory) {
                boolean match = false;
                switch (type) {
                    case "Title":
                        match = book.getTitle().toLowerCase().contains(term);
                        break;
                    case "Author":
                        match = book.getAuthor().toLowerCase().contains(term);
                        break;
                    case "Genre":
                        match = book.getGenre().toLowerCase().contains(term);
                        break;
                    case "ISBN":
                        match = book.getIsbn().toLowerCase().contains(term);
                        break;
                }
                
                if (match) {
                    sb.append(book).append("\n\n");
                    found = true;
                }
            }
            
            if (!found) {
                sb.append("The book searched is unavailble.");
            }
            
            displayArea.setText(sb.toString());
        }
    }

    private void processSale() {
        if (inventory.isEmpty()) {
            displayArea.setText("Inventory is empty. No books available for sale.");
            return;
        }
        
        if (customers.isEmpty()) { // NEW: Check for customers
            displayArea.setText("No customers registered. Please add customers first.");
            return;
        }
        
        // NEW: Customer selection
        String[] customerOptions = new String[customers.size()];
        for (int i = 0; i < customers.size(); i++) {
            customerOptions[i] = customers.get(i).getName() + " (" + customers.get(i).getCustomerId() + ")";
        }
        
        String selectedCustomer = (String) JOptionPane.showInputDialog(
            frame,
            "Select customer making purchase:",
            "Customer Selection",
            JOptionPane.PLAIN_MESSAGE,
            null,
            customerOptions,
            customerOptions[0]
        );
        
        if (selectedCustomer == null) return;
        
        // Display books for selection
        StringBuilder sb = new StringBuilder("Available Books:\n\n");
        for (int i = 0; i < inventory.size(); i++) {
            sb.append(i + 1).append(". ").append(inventory.get(i).getTitle())
              .append(" by ").append(inventory.get(i).getAuthor())
              .append(" (Qty: ").append(inventory.get(i).getQuantity()).append(")\n");
        }
        
        JPanel panel = new JPanel(new GridLayout(2, 2));
        JTextField bookIdField = new JTextField();
        JTextField quantityField = new JTextField();
        
        panel.add(new JLabel("Enter book number:"));
        panel.add(bookIdField);
        panel.add(new JLabel("Enter quantity:"));
        panel.add(quantityField);
        
        int result = JOptionPane.showConfirmDialog(frame, panel, sb.toString(), 
                JOptionPane.OK_CANCEL_OPTION, JOptionPane.PLAIN_MESSAGE);
        
        if (result == JOptionPane.OK_OPTION) {
            try {
                int bookIndex = Integer.parseInt(bookIdField.getText()) - 1;
                int quantity = Integer.parseInt(quantityField.getText());
                
                if (bookIndex < 0 || bookIndex >= inventory.size()) {
                    JOptionPane.showMessageDialog(frame, "Invalid book number", 
                            "Error", JOptionPane.ERROR_MESSAGE);
                    return;
                }
                
                Book book = inventory.get(bookIndex);
                if (quantity > book.getQuantity()) {
                    JOptionPane.showMessageDialog(frame, "Not enough stock available", 
                            "Error", JOptionPane.ERROR_MESSAGE);
                    return;
                }
                
                // Process sale
                double saleAmount = book.getPrice() * quantity;
                totalRevenue += saleAmount;
                book.setQuantity(book.getQuantity() - quantity);
                
                // NEW: Add to customer purchase history
                Customer customer = customers.get(getIndex(selectedCustomer, customerOptions));
                customer.addPurchase(
                    String.format("%s: %s x%d @ P%.2f (Total: P%.2f)",
                        new java.util.Date(),
                        book.getTitle(),
                        quantity,
                        book.getPrice(),
                        saleAmount
                    )
                );
                
                // Save changes
                saveInventory();
                saveCustomers(); // NEW
                updateDashboard(); // NEW
                
                // Display receipt
                displayArea.setText("Sale processed successfully for " + customer.getName() + "!\n\n" +
                        "Book: " + book.getTitle() + "\n" +
                        "Quantity sold: " + quantity + "\n" +
                        "Price per unit: P" + book.getPrice() + "\n" +
                        "Total sale amount: P" + saleAmount + "\n\n" +
                        "Thank you for your purchase!");
            } catch (NumberFormatException ex) {
                JOptionPane.showMessageDialog(frame, "Invalid number format", 
                        "Error", JOptionPane.ERROR_MESSAGE);
            }
        }
    }

    private void displayRevenue() {
        displayArea.setText("Total Revenue Generated: P" + String.format("%.2f", totalRevenue));
    }

    private void loadInventory() {
        try (BufferedReader reader = new BufferedReader(new FileReader(DATA_FILE))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",");
                if (parts.length == 6) {
                    String isbn = parts[0];
                    String title = parts[1];
                    String author = parts[2];
                    String genre = parts[3];
                    double price = Double.parseDouble(parts[4]);
                    int quantity = Integer.parseInt(parts[5]);
                    inventory.add(new Book(isbn, title, author, genre, price, quantity));
                }
            }
        } catch (IOException e) {
            // File doesn't exist yet, that's okay
        } catch (NumberFormatException e) {
            JOptionPane.showMessageDialog(frame, "Error reading inventory data", 
                    "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void saveInventory() {
        try (PrintWriter writer = new PrintWriter(new FileWriter(DATA_FILE))) {
            for (Book book : inventory) {
                writer.println(book.toFileString());
            }
        } catch (IOException e) {
            JOptionPane.showMessageDialog(frame, "Error saving inventory data", 
                    "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    // ========== NEW METHODS ==========
    
    private void addNewCustomer() {
        JPanel panel = new JPanel(new GridLayout(4, 2));
        
        JTextField idField = new JTextField();
        JTextField nameField = new JTextField();
        JTextField emailField = new JTextField();
        
        panel.add(new JLabel("Customer ID:"));
        panel.add(idField);
        panel.add(new JLabel("Name:"));
        panel.add(nameField);
        panel.add(new JLabel("Email:"));
        panel.add(emailField);
        
        int result = JOptionPane.showConfirmDialog(frame, panel, "Add New Customer", 
                JOptionPane.OK_CANCEL_OPTION, JOptionPane.PLAIN_MESSAGE);
        
        if (result == JOptionPane.OK_OPTION) {
            Customer newCustomer = new Customer(
                idField.getText(),
                nameField.getText(),
                emailField.getText()
            );
            customers.add(newCustomer);
            saveCustomers();
            displayArea.setText("Customer added successfully:\n" + newCustomer);
            updateDashboard(); // NEW
        }
    }

    private void displayCustomers() {
        if (customers.isEmpty()) {
            displayArea.setText("No customers registered.");
            return;
        }
        
        StringBuilder sb = new StringBuilder("Registered Customers:\n\n");
        for (Customer customer : customers) {
            sb.append(customer).append("\n\n");
        }
        displayArea.setText(sb.toString());
    }

    private void generateSalesReport() {
        StringBuilder report = new StringBuilder("=== SALES REPORT ===\n\n");
        report.append("Total Revenue: P").append(String.format("%.2f", totalRevenue)).append("\n\n");
        
        report.append("Customer Purchases:\n");
        for (Customer customer : customers) {
            report.append(customer.getName()).append(" (").append(customer.getCustomerId()).append("):\n");
            for (String purchase : customer.getPurchaseHistory()) {
                report.append(" - ").append(purchase).append("\n");
            }
            report.append("\n");
        }
        
        report.append("Current Inventory Status:\n");
        for (Book book : inventory) {
            report.append(book.getTitle()).append(": ").append(book.getQuantity()).append(" remaining\n");
        }
        
        displayArea.setText(report.toString());
        
        // Option to save report to file
        int choice = JOptionPane.showConfirmDialog(frame, 
            "Would you like to save this report to a file?", 
            "Save Report", 
            JOptionPane.YES_NO_OPTION);
        
        if (choice == JOptionPane.YES_OPTION) {
            try (PrintWriter writer = new PrintWriter(new FileWriter("sales_report_" + System.currentTimeMillis() + ".txt"))) {
                writer.println(report.toString());
                JOptionPane.showMessageDialog(frame, "Report saved successfully!");
            } catch (IOException e) {
                JOptionPane.showMessageDialog(frame, "Error saving report", 
                        "Error", JOptionPane.ERROR_MESSAGE);
            }
        }
    }

    private void loadCustomers() {
        try (BufferedReader reader = new BufferedReader(new FileReader(CUSTOMER_FILE))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",");
                if (parts.length == 3) {
                    customers.add(new Customer(parts[0], parts[1], parts[2]));
                }
            }
        } catch (IOException e) {
            // File doesn't exist yet, that's okay
        }
    }

    private void saveCustomers() {
        try (PrintWriter writer = new PrintWriter(new FileWriter(CUSTOMER_FILE))) {
            for (Customer customer : customers) {
                writer.println(customer.toFileString());
            }
        } catch (IOException e) {
            JOptionPane.showMessageDialog(frame, "Error saving customer data", 
                    "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    // NEW: Helper methods
    private JPanel createDashboardCard(String title, String value) {
        JPanel card = new JPanel(new BorderLayout());
        card.setBorder(BorderFactory.createLineBorder(Color.GRAY));
        
        JLabel titleLabel = new JLabel(title, SwingConstants.CENTER);
        titleLabel.setFont(new Font("Arial", Font.BOLD, 14));
        
        JLabel valueLabel = new JLabel(value, SwingConstants.CENTER);
        valueLabel.setFont(new Font("Arial", Font.PLAIN, 18));
        
        card.add(titleLabel, BorderLayout.NORTH);
        card.add(valueLabel, BorderLayout.CENTER);
        
        return card;
    }

    private void updateDashboard() {
        // Remove old dashboard
        frame.getContentPane().remove(0);
        
        // Create new dashboard with updated values
        JPanel dashboardPanel = new JPanel(new GridLayout(1, 3));
        dashboardPanel.add(createDashboardCard("Total Books", String.valueOf(inventory.size())));
        dashboardPanel.add(createDashboardCard("Total Customers", String.valueOf(customers.size())));
        dashboardPanel.add(createDashboardCard("Total Revenue", "P" + String.format("%.2f", totalRevenue)));
        
        // Add back to frame
        frame.add(dashboardPanel, BorderLayout.NORTH);
        frame.revalidate();
    }

    private int getIndex(String selected, String[] options) {
        for (int i = 0; i < options.length; i++) {
            if (options[i].equals(selected)) return i;
        }
        return -1;
    }

    // ========== NESTED CLASSES ==========
    
    private static class Book {
        private String isbn;
        private String title;
        private String author;
        private String genre;
        private double price;
        private int quantity;

        public Book(String isbn, String title, String author, String genre, double price, int quantity) {
            this.isbn = isbn;
            this.title = title;
            this.author = author;
            this.genre = genre;
            this.price = price;
            this.quantity = quantity;
        }

        public String getIsbn() { return isbn; }
        public String getTitle() { return title; }
        public String getAuthor() { return author; }
        public String getGenre() { return genre; }
        public double getPrice() { return price; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }

        @Override
        public String toString() {
            return String.format("Title: %s\nAuthor: %s\nISBN: %s\nGenre: %s\nPrice: P%.2f\nQuantity: %d",
                    title, author, isbn, genre, price, quantity);
        }

        public String toFileString() {
            return String.format("%s,%s,%s,%s,%.2f,%d", 
                    isbn, title, author, genre, price, quantity);
        }
    }

    private static class Customer {
        private String customerId;
        private String name;
        private String email;
        private ArrayList<String> purchaseHistory = new ArrayList<>();
        
        public Customer(String customerId, String name, String email) {
            this.customerId = customerId;
            this.name = name;
            this.email = email;
        }
        
        public void addPurchase(String purchase) {
            purchaseHistory.add(purchase);
        }
        
        public String getCustomerId() { return customerId; }
        public String getName() { return name; }
        public String getEmail() { return email; }
        public ArrayList<String> getPurchaseHistory() { return purchaseHistory; }
        
        @Override
        public String toString() {
            return String.format("Customer ID: %s\nName: %s\nEmail: %s\nPurchases: %d",
                    customerId, name, email, purchaseHistory.size());
        }
        
        public String toFileString() {
            return String.format("%s,%s,%s", customerId, name, email);
        }
    }
}

<!---
TshenoloNthubu/TshenoloNthubu is a ✨ special ✨ repository because its `README.md` (this file) appears on your GitHub profile.
You can click the Preview link to take a look at your changes.
--->
