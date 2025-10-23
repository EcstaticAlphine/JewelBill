// Wait for the document to be fully loaded
document.addEventListener('DOMContentLoaded', () => {

  // --- 1. GET ALL OUR HTML ELEMENTS ---
  const connectButton = document.getElementById('btn-connect');
  const printButton = document.getElementById('btn-print');
  const receiptText = document.getElementById('receipt-text');
  const statusLabel = document.getElementById('status-label');

  // --- 2. GLOBAL VARIABLES TO STORE BLUETOOTH INFO ---
  let bluetoothDevice = null;
  let printerCharacteristic = null;

  // --- 3. REGISTER THE SERVICE WORKER ---
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('Service Worker registered', reg))
      .catch(err => console.error('Service Worker NOT registered', err));
  }

  // --- 4. CONNECT TO BLUETOOTH PRINTER ---
  connectButton.addEventListener('click', () => {
    // Use the Web Bluetooth API to request a device
    navigator.bluetooth.requestDevice({
      // Filter for thermal printers.
      // This 'namePrefix' is common, but you may need to
      // change 'Bluetooth' to 'MPT' or 'MTP' or whatever
      // your specific printer is named.
      filters: [{ namePrefix: 'Bluetooth' }],
      // We need the 'generic_attribute' service to send data
      optionalServices: ['generic_attribute']
    })
      .then(device => {
        statusLabel.textContent = 'Connecting to ' + device.name + '...';
        bluetoothDevice = device;
        // Connect to the GATT server
        return device.gatt.connect();
      })
      .then(server => {
        // --- THIS IS THE TRICKY PART ---
        // We need to find the correct "service" and "characteristic"
        // to write data to. These are like an IP address and Port for Bluetooth.
        // 0x1800 is the "Generic Access" service.
        // 0x18F0 is the "Generic Attribute" service.
        // Many printers just use a custom "Serial Port" service.

        // Let's try to find a "Serial" or "Generic" service
        // This is a common UUID for serial port profile (SPP)
        const serviceUUID = '00001101-0000-1000-8000-00805f9b34fb';

        return server.getPrimaryService(serviceUUID);
      })
      .catch(e => {
        // Fallback: If the common Serial UUID fails, try to find one
        // This part is for discovery if the UUID above is wrong.
        console.log("Could not find common serial service. Trying to discover...");
        return bluetoothDevice.gatt.connect().then(server => server.getPrimaryServices());
      })
      .then(services => {
        // If 'services' is an array, it means our fallback discovery worked
        if (Array.isArray(services)) {
          console.log("Found services:", services);
          statusLabel.textContent = "Printer found, finding write characteristic...";
          // You might need to inspect this log to find the right service
          // For now, we'll just use the first one
          return services[0].getCharacteristics();
        }

        // Otherwise, 'services' is the single service we found earlier
        return services.getCharacteristics();
      })
      .then(characteristics => {
        console.log("Found characteristics:", characteristics);
        // Now we find the "write" characteristic
        printerCharacteristic = characteristics.find(c => c.properties.write);

        if (printerCharacteristic) {
          statusLabel.textContent = 'Connected to ' + bluetoothDevice.name;
          printButton.disabled = false; // Enable the print button
          connectButton.textContent = 'Connected';
        } else {
          statusLabel.textContent = 'Error: Could not find "write" characteristic.';
        }
      })
      .catch(error => {
        statusLabel.textContent = 'Connection Failed: ' + error.message.substring(0, 30) + '...';
        console.error('Connection failed!', error);
      });
  });

  // --- 5. SEND DATA TO PRINTER ---
  printButton.addEventListener('click', () => {
    if (!printerCharacteristic) {
      alert('Not connected to a printer.');
      return;
    }

    // Get the text from the text area
    const textToPrint = receiptText.value;
    if (!textToPrint) {
      alert('Please enter some text to print.');
      return;
    }

    // Convert the text to the bytes the printer understands
    // We use a TextEncoder for this.
    const encoder = new TextEncoder();
    const data = encoder.encode(textToPrint + '\n\n\n'); // Add some newlines

    statusLabel.textContent = 'Printing...';

    // Send the data to the printer
    printerCharacteristic.writeValue(data)
      .then(() => {
        statusLabel.textContent = 'Printing complete!';
        console.log('Print complete');
      })
      .catch(error => {
        statusLabel.textContent = 'Print Failed: ' + error.message;
        console.error('Print failed!', error);
      });
  });
});