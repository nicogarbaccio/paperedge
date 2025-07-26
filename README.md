# PaperEdge

**Gain Your Edge Through Paper Trading**

PaperEdge is a comprehensive sports betting paper trading application that allows users to track and analyze hypothetical bets on sports handicappers, models, and strategies without risking real money.

## 🚀 Features

### Core Functionality
- **📓 Notebook Management**: Create and manage multiple betting strategy notebooks
- **📊 Bet Tracking**: Record, track, and analyze individual bets with detailed metrics
- **🧮 Built-in Calculator**: Automatic calculation of potential returns using American odds
- **📈 Analytics Dashboard**: Real-time performance metrics and visualizations
- **🔐 Secure Authentication**: User accounts with secure login/logout functionality
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices

### Key Features
- **Custom Columns**: Add unlimited custom categories to organize your bets
- **Bankroll Management**: Track starting and current bankroll for each strategy
- **Performance Metrics**: Win rate, ROI, profit/loss tracking
- **Real-time Updates**: Live updates using Supabase real-time subscriptions
- **Data Import/Export**: CSV import and export for external analysis
- **Row Level Security**: Secure data isolation between users

## 🎯 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Styling**: Tailwind CSS with custom "Terminal Green" dark theme
- **State Management**: Zustand
- **UI Components**: Custom components built with Radix UI primitives
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd paperedge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   The project includes a pre-configured Supabase instance, but you can create your own:
   
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Update with your Supabase credentials
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📊 Database Schema

The application uses the following database structure:

### Tables
- **`notebooks`**: Strategy containers with bankroll tracking
- **`bets`**: Individual bet records with odds and outcomes
- **`custom_columns`**: User-defined categorization fields
- **`bet_custom_data`**: Custom field values for each bet

### Key Features
- **Row Level Security (RLS)**: Users can only access their own data
- **Referential Integrity**: Proper foreign key relationships
- **Optimized Indexes**: Fast queries on frequently accessed data

## 🎨 Design System

PaperEdge uses a custom "Terminal Green" dark theme:

### Color Palette
- **Background**: Deep blacks for main surfaces
- **Profit**: Green (#10b981) for positive P&L
- **Loss**: Red (#ef4444) for negative P&L  
- **Pending**: Amber (#f59e0b) for pending bets
- **Push**: Gray (#6b7280) for neutral outcomes

### Typography
- High contrast white for important data
- Muted gray for secondary information
- Consistent spacing using Tailwind's scale

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Card, etc.)
│   └── layout/         # Layout components (Header, Sidebar)
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   └── ...            # Other pages
├── lib/                # Utility libraries
│   ├── supabase.ts     # Supabase client configuration
│   ├── betting.ts      # Betting calculation utilities
│   └── utils.ts        # General utilities
├── stores/             # Zustand state stores
└── main.tsx           # Application entry point
```

## 📈 Features in Development

- **Advanced Analytics**: Interactive charts and trend analysis
- **Bet Import/Export**: CSV import/export functionality
- **Custom Dashboard**: Personalized performance metrics
- **Mobile App**: React Native companion app
- **API Integration**: Real-time odds and results

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Supabase](https://supabase.com) for backend infrastructure
- UI components powered by [Radix UI](https://radix-ui.com)
- Icons from [Lucide React](https://lucide.dev)
- Styled with [Tailwind CSS](https://tailwindcss.com)

---

**PaperEdge** - Master your betting strategies without the risk. Start paper trading today! 🎯 