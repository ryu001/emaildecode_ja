# Japanese Email Decoder

A Node.js utility to decode Japanese emails that use ISO-2022-JP character encoding and quoted-printable transfer encoding.

## Installation

```bash
npm install encoding-japanese
```

## Usage

### Simple Decoder Function

```javascript
const { decodeJapaneseEmail } = require('./simple-decoder');

// Decode encoded Japanese text
const encodedText = "=1B$B$3$s$K$A$O@$3&=1B(B";
const decodedText = decodeJapaneseEmail(encodedText);
console.log(decodedText); // Output: こんにちは世界
```

### Complete Email Processing

```javascript
const { processEmailFile } = require('./decoder-improved');

// Process an entire email file
const decodedContent = processEmailFile('input.txt');
```
## How it works

1. **Quoted-Printable Decoding**: Converts `=XX` hex sequences to characters
2. **ISO-2022-JP Decoding**: Handles Japanese character encoding with escape sequences like `=1B$B...=1B(B`
3. **Unicode Conversion**: Converts to readable UTF-8 Japanese text

## Files

- `decoder-improved.js` - Complete email processing with file I/O
- `input.txt` - Sample encoded email
- `decoded_output.txt` - Generated decoded output

## Testing

```bash
node decoder-improved.js
```