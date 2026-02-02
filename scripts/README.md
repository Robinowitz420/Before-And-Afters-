# Clothing Image Scraper

A tool to scrape high-quality clothing images from Unsplash for use as placeholder images in your clothing rental platform.

## Setup

1. **Get an Unsplash API Key:**
   - Go to [Unsplash Developers](https://unsplash.com/developers)
   - Create an account or log in
   - Create a new app
   - Copy your Access Key

2. **Create a `.env` file** in the project root:
   ```bash
   UNSPLASH_ACCESS_KEY=your_access_key_here
   ```

## Usage

### Scrape images for a specific category:
```bash
npm run scrape-images dresses 10
npm run scrape-images tops 5
npm run scrape-images shoes 8
```

### Scrape images for all categories:
```bash
npm run scrape-images all 5
```

### Available Categories:
- `tops` - T-shirts, blouses, sweaters, shirts
- `bottoms` - Jeans, pants, skirts, shorts
- `dresses` - Dresses, gowns, formal wear
- `outerwear` - Jackets, coats, blazers, hoodies
- `shoes` - Sneakers, heels, boots, sandals
- `accessories` - Hats, scarves, belts, sunglasses
- `jewelry` - Necklaces, earrings, bracelets
- `bags` - Handbags, backpacks, clutches
- `costumes` - Costumes, themed outfits
- `special-occasion` - Wedding dresses, tuxedos, formal wear

## Output

Images are saved to `public/images/clothing/[category]/` with the naming pattern:
- `category_unsplash_id.jpg`

For example:
- `public/images/clothing/dresses/dresses_abc123.jpg`
- `public/images/clothing/tops/tops_def456.jpg`

## Features

- ✅ High-quality images from Unsplash
- ✅ Automatic categorization
- ✅ Duplicate prevention (skips existing files)
- ✅ Image optimization (resized to 800x800, compressed)
- ✅ Respectful API usage with delays
- ✅ Error handling and recovery
- ✅ Progress logging

## API Limits

Unsplash allows 50 requests per hour for free accounts. The tool includes delays to stay within reasonable limits.

## Troubleshooting

**"UNSPLASH_ACCESS_KEY environment variable is required"**
- Make sure you created a `.env` file with your Unsplash API key

**"No images found for category"**
- Try different search terms or reduce the count
- Check your internet connection

**Permission errors**
- Make sure the script can write to the `public/images/clothing/` directory
