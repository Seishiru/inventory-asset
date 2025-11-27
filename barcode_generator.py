# barcode_generator.py
import barcode
from barcode.writer import ImageWriter
import os
import sys

def generate_barcode(serial_number, output_dir="barcodes"):
    """Generate barcode from serial number"""
    try:
        # Create output directory if it doesn't exist
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        # Generate barcode (using Code128 format)
        code128 = barcode.get_barcode_class('code128')
        barcode_image = code128(serial_number, writer=ImageWriter())
        
        # Save barcode
        filename = f"{serial_number}_barcode"
        filepath = os.path.join(output_dir, filename)
        barcode_image.save(filepath)
        
        return f"{filepath}.png"
    except Exception as e:
        print(f"Error generating barcode: {e}")
        return None

if __name__ == "__main__":
    if len(sys.argv) > 1:
        serial = sys.argv[1]
        result = generate_barcode(serial)
        if result:
            print(result)  # Return file path to Node.js
        else:
            print("ERROR")