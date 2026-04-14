# Philroy — Setup Guide

## Before you go live, replace these placeholders:

### 1. Snipcart API Key
Search all HTML files for `YOUR_SNIPCART_PUBLIC_KEY` and replace with your key from snipcart.com

### 2. PayPal.Me Link
Search for `YOUR_PAYPAL_ME_LINK` and replace with your PayPal.Me username
Example: `https://paypal.me/philroyau`

### 3. Contact Form (Formspree)
- Go to formspree.io and create a free account
- Create a new form, get your form ID
- Replace `YOUR_FORM_ID` in contact.html
- Example: `https://formspree.io/f/xpzgkrwq`

### 4. Email Address
Replace `hello@philroy.com.au` with your actual business email

### 5. TikTok Handle
Replace `@philroy` in contact.html with your actual TikTok

### 6. Product Prices
Update prices in index.html, shop.html, and products.json once decided
Change all `$TBA` to real prices

### 7. Product Photos
Replace placeholder divs with:
`<img src="images/your-photo.jpg" alt="Product name">`
Recommended size: 1200 x 900px, JPG or WebP

## Cloudflare Pages Deploy

1. Push this folder to a GitHub repo
2. Log into Cloudflare Dashboard → Pages → Create a project
3. Connect your GitHub repo
4. Build settings: leave blank (static site)
5. Deploy
6. In Cloudflare DNS, add:
   - CNAME record: `@` → your Pages URL (e.g. `philroy.pages.dev`)
   - CNAME record: `www` → your Pages URL

## File Structure
```
philroy/
├── index.html       ← Home page
├── shop.html        ← Shop page
├── about.html       ← About page
├── contact.html     ← Contact page
├── products.json    ← Snipcart product validation
├── css/
│   └── style.css    ← All shared styles
├── js/
│   └── main.js      ← Animations + interactions
└── images/          ← Drop product photos here
```
