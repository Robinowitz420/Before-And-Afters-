# Change Your Outfit Change The World

A magical clothing rental platform that transforms lives through intentional fashion experiences.

## ✨ The Vision

"Clothing isn't just a basic need - clothing has the power to transform how you experience life. Being playful with clothing is a tool for personal development. Experimenting with clothing is key to creating new opportunities."

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with magical custom themes
- **Database**: Prisma with SQLite (easily upgradeable to PostgreSQL)
- **UI Components**: Radix UI with custom magical styling
- **Payments**: Stripe integration ready for Glitcoin system

## 🌟 Core Features

### Membership Tiers
- **🪄 Eeeehs**: Easy Essentials & Everyday Enchantment (1 item, 10Ġ/month)
- **🪄 Oooohs**: Outfit Obsession & Oracle Opus (3 items, 20Ġ/month)
- **🪄 Aaaaahs**: Adornment Alchemy & Aesthetic Ascension (5 items, 40Ġ/month)
- **🪄 Mmmmms**: Magical Magnetic Manifestation & Myth-Maker Muse Mastery (10 items, 100Ġ/month)

### Glitcoin Currency System
- 1Ġ = $5 USD
- Simple pricing with built-in tax
- Magical sparkle economy integration

### Services
- **Joni's Closet Club**: Unlimited swap-outs with trust-based system
- **Check Meowt Isle**: Additional clothing access
- **Spritz n Glitz Bar**: Unlimited styling services
- **Before & Afters**: 24-hour flagship location
- **Dorothy the Dressup Bus**: Mobile fashion emergencies

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the database:**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed  # Populate with sample data
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)**

5. **(Optional) Scrape clothing images:**
   ```bash
   # Get an Unsplash API key from https://unsplash.com/developers
   # Add it to your .env file: UNSPLASH_ACCESS_KEY=your_key_here

   # Scrape 5 images for each category
   npm run scrape-images all 5

   # Or scrape specific categories
   npm run scrape-images dresses 10
   npm run scrape-images tops 8
   ```

## 🎯 What We've Built So Far

### ✅ **Completed Features:**

- **✨ Magical Landing Page** - Beautiful homepage showcasing membership tiers
- **👥 Membership Management System** - Full CRUD operations for memberships
- **💎 Glitcoin Currency System** - Display and transaction tracking
- **🗄️ Database Schema** - Complete data models for the entire platform
- **🎨 Magical Design System** - Sparkle effects, gradients, and enchanting UI

### 🔄 **Current Status:**
- **Membership System**: Fully functional with sample data
- **Database**: SQLite with seeded magical memberships and clothing items
- **UI/UX**: Magical theme with responsive design

### 📋 **Next Steps:**
- Inventory management for clothing items
- Reservation/booking system for rentals
- Glitcoin payment processing
- Before & Afters event management

## 📁 Project Structure

```
change-your-outfit/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts               # Sample data seeder
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/memberships/   # Membership API routes
│   │   ├── memberships/       # Membership management page
│   │   ├── globals.css        # Global styles with magical themes
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── ui/               # Reusable UI components
│   │   ├── MembershipCard.tsx # Membership tier display
│   │   └── GlitcoinDisplay.tsx # Glitcoin currency component
│   ├── lib/
│   │   ├── prisma.ts         # Database client
│   │   └── utils.ts          # Utility functions
│   └── types/
│       └── index.ts          # TypeScript type definitions
├── scripts/
│   ├── scrape-clothing-images.ts    # Image scraping tool
│   └── README.md                    # Tool documentation
└── package.json
```

## 🎨 Magical Design System

- **Colors**: Pink, purple, gold gradient themes
- **Animations**: Sparkle effects, glitter animations, magical button hovers
- **Typography**: Glitcoin text effects with animated gradients
- **Components**: Glass-morphism cards with backdrop blur

## 🔮 Database Models

- **Users**: Membership info, Glitcoin balance, trust levels
- **ClothingItems**: Inventory with categories, sizes, conditions
- **Rentals**: Active rentals with due dates and fees
- **Reservations**: Item reservations
- **GlitcoinTransactions**: Payment history
- **Events**: Before & Afters event management

## 🎯 Current Status

✅ **Completed:**
- Project setup with Next.js + TypeScript
- Magical design system and themes
- Database schema with Prisma
- Membership tier system
- Glitcoin currency display
- Landing page with magical styling

🔄 **In Progress:**
- Database schema implementation

📋 **Next Steps:**
- Membership management system
- Inventory management for clothing
- Glitcoin payment processing
- Before & Afters event system

## 🌈 The Magic

This platform isn't just about renting clothes—it's about transformation, community, and recognizing the sentient nature of fashion. Every piece of clothing carries stories, energy, and the potential for personal growth.

"Change Your Outfit Change The World" ✨
