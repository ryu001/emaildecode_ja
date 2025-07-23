const fs = require('fs');
const Encoding = require('encoding-japanese');

/**
 * Decode quoted-printable encoded string
 * @param {string} str - The quoted-printable encoded string
 * @returns {string} - Decoded string
 */
function decodeQuotedPrintable(str) {
    // Remove soft line breaks (=\r\n or =\n)
    str = str.replace(/=\r?\n/g, '');

    // Decode =XX hex sequences
    str = str.replace(/=([0-9A-F]{2})/gi, (match, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
    });

    return str;
}

/**
 * Decode Japanese email content with ISO-2022-JP charset and quoted-printable encoding
 * @param {string} content - The encoded email content
 * @returns {string} - Decoded readable Japanese text
 */
function decodeJapaneseEmail(content) {
    try {
        // First, decode quoted-printable
        const quotedPrintableDecoded = decodeQuotedPrintable(content);

        // Convert string to array of bytes
        const byteArray = [];
        for (let i = 0; i < quotedPrintableDecoded.length; i++) {
            byteArray.push(quotedPrintableDecoded.charCodeAt(i));
        }

        // Convert from ISO-2022-JP to Unicode
        const unicodeArray = Encoding.convert(byteArray, {
            to: 'UNICODE',
            from: 'JIS',
            type: 'array'
        });

        // Convert Unicode array to string
        const decodedText = Encoding.codeToString(unicodeArray);

        return decodedText;
    } catch (error) {
        console.error('Error decoding email:', error);
        return content; // Return original content if decoding fails
    }
}

/**
 * Process email file and extract readable content
 * @param {string} filePath - Path to the email file
 * @returns {string} - Decoded content
 */
function processEmailFile(filePath) {
    try {
        const emailContent = fs.readFileSync(filePath, 'utf8');

        // Split email into headers and body
        const lines = emailContent.split('\n');
        let bodyStartIndex = 0;
        let inBody = false;
        let charset = 'ISO-2022-JP';
        let encoding = 'quoted-printable';
        console.log(lines);
        // Find where body starts and extract charset/encoding info
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (line.includes('Content-Type:') && line.includes('charset=')) {
                const charsetMatch = line.match(/charset=([^;\s]+)/i);
                if (charsetMatch) {
                    charset = charsetMatch[1];
                }
            }

            if (line.includes('Content-Transfer-Encoding:')) {
                const encodingMatch = line.match(/Content-Transfer-Encoding:\s*(.+)/i);
                if (encodingMatch) {
                    encoding = encodingMatch[1].trim();
                }
            }

            // Empty line indicates start of body
            if (line.trim() === '' && !inBody) {
                inBody = true;
                bodyStartIndex = i + 1;
                break;
            }
        }

        // Extract body content
        const bodyLines = lines.slice(bodyStartIndex);
        const bodyContent = bodyLines.join('\n');

        console.log('Detected charset:', charset);
        console.log('Detected encoding:', encoding);
        console.log('\n--- Original encoded content ---');
        console.log(bodyContent.substring(0, 200) + '...\n');

        // Decode the email content
        const decodedContent = decodeJapaneseEmail(bodyContent);

        console.log('--- Decoded Japanese content ---');
        console.log(decodedContent);

        // Write decoded content to file for easier viewing
        fs.writeFileSync('decoded_output.txt', decodedContent, 'utf8');
        console.log('\n--- Decoded content saved to: decoded_output.txt ---');

        return decodedContent;

    } catch (error) {
        console.error('Error processing email file:', error);
        return null;
    }
}

/**
 * Simple usage example
 */
function exampleUsage() {
    const sampleEncodedText = "=1B$B$3$s$K$A$O=1B(B";
    console.log('Example usage:');
    console.log('Encoded:', sampleEncodedText);
    console.log('Decoded:', decodeJapaneseEmail(sampleEncodedText));
}

// Export functions for use in other modules
module.exports = {
    decodeQuotedPrintable,
    decodeJapaneseEmail,
    processEmailFile,
    exampleUsage
};

// If this script is run directly, process the input.txt file
if (require.main === module) {
    console.log('Processing email file: input.txt');
    console.log('='.repeat(50));

    processEmailFile('input.txt');

    console.log('\n' + '='.repeat(50));
    exampleUsage();
}