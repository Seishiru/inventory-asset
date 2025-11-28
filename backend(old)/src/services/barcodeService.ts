// backend/src/services/barcodeService.ts
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

export class BarcodeService {
    static async generateBarcode(serialNumber: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const pythonScript = path.join(process.cwd(), 'barcode_generator.py');
            
            exec(`python "${pythonScript}" "${serialNumber}"`, (error, stdout, stderr) => {
                if (error) {
                    reject(`Barcode generation failed: ${error}`);
                    return;
                }
                
                const filePath = stdout.trim();
                if (filePath === 'ERROR') {
                    reject('Barcode generation failed');
                } else {
                    resolve(filePath);
                }
            });
        });
    }

    // Add the missing deleteBarcode method
    static async deleteBarcode(barcodePath: string): Promise<void> {
        try {
            await fs.unlink(barcodePath);
        } catch (error) {
            console.warn('Failed to delete barcode file:', error);
            // Don't throw error for file deletion failures
        }
    }
}