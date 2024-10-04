// Get the form element
const PaymentForm = document.getElementById('PaymentForm');

// Add event listener for form submission
PaymentForm.addEventListener("submit", PayWithPaystack, false);

// Payment function
function PayWithPaystack(e) {
    e.preventDefault();

    // Set up Paystack payment handler
    let handler = PaystackPop.setup({
        key: 'pk_live_9f62762d480d75250eae5c19c43d96b20b25c92d', // Replace with your public key
        email: document.getElementById('email-address').value,
        amount: (parseFloat(document.getElementById("amount").value) * 100), // Amount in kobo (e.g., 10000 kobo = 100 NGN)
        currency: 'NGN',
        ref: '' + Math.floor((Math.random() * 1000000000) + 1), // Unique reference for the transaction
        
        onClose: function() {
            alert('Transaction was not completed.');
        },
        
        callback: function(response) {
            // Handle the response from Paystack
            alert('Payment successful! Reference: ' + response.reference);
        }
    });

    // Open the Paystack payment interface
    handler.openIframe();
}
