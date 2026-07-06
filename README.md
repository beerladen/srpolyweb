# 🐱 PodCat Admin Template

A modern, responsive admin dashboard template built with Next.js 16, Tailwind CSS 4, and shadcn/ui components.

## ✨ Features

- 🎨 **Modern UI** - Clean and professional design inspired by Runpod
- 📱 **Responsive** - Works on all screen sizes
- 🧩 **Component-based** - Reusable and maintainable components
- 🎯 **Type-safe** - Full TypeScript support
- 🌙 **Dark Mode Ready** - Built-in theme support
- 📊 **Charts** - Interactive charts with Recharts
- 🗂️ **Collapsible Sidebar** - Accordion-style navigation with collapse/expand
- 🔐 **Auth Pages** - Sign in, Sign up, Forgot password with testimonials

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Charts | [Recharts](https://recharts.org/) |
| Font | [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts) |

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout with font config
│   ├── page.tsx                  # Home dashboard page
│   ├── globals.css               # Global styles & CSS variables
│   │
│   ├── (auth)/                   # Auth pages (separate layout)
│   │   ├── layout.tsx            # Auth layout with testimonials
│   │   ├── signin/               # Sign in page
│   │   ├── signup/               # Sign up page
│   │   └── forgot-password/      # Forgot password page
│   │
│   ├── account/
│   │   ├── billing/              # Billing page
│   │   ├── settings/             # Settings page
│   │   ├── audit-logs/           # Audit logs page
│   │   ├── create-team/          # Create team page
│   │   ├── refer/                # Refer & earn page
│   │   └── remote-access/        # Remote access page
│   │
│   ├── hub/
│   │   ├── pod-templates/        # Pod templates page
│   │   ├── serverless-repos/     # Serverless repos page
│   │   └── public-endpoints/     # Public endpoints page
│   │
│   ├── manage/
│   │   ├── pods/                 # Pods management page
│   │   ├── serverless/           # Serverless management page
│   │   ├── storage/              # Storage management page
│   │   ├── fine-tuning/          # Fine tuning page
│   │   └── secrets/              # Secrets management page
│   │
│   ├── feedback/                 # Feedback page
│   ├── help/                     # Help & resources page
│   └── terms/                    # Terms of service page
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   │   ├── accordion.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   └── tooltip.tsx
│   │
│   ├── layout/                   # Layout components
│   │   ├── admin-layout.tsx      # Main admin layout wrapper
│   │   ├── header/               # Header components
│   │   │   ├── header.tsx
│   │   │   ├── user-menu.tsx
│   │   │   └── balance-display.tsx
│   │   └── sidebar/              # Sidebar components
│   │       ├── sidebar.tsx
│   │       ├── nav-item.tsx
│   │       ├── nav-section.tsx
│   │       ├── logo.tsx
│   │       └── sidebar-data.ts
│   │
│   ├── auth/                     # Auth components
│   │   ├── index.ts              # Barrel export
│   │   ├── auth-logo.tsx         # Logo for auth pages
│   │   ├── social-button.tsx     # Google/GitHub login buttons
│   │   ├── password-input.tsx    # Password input with show/hide
│   │   ├── divider.tsx           # "OR" divider
│   │   └── testimonial.tsx       # Testimonial carousel
│   │
│   ├── dashboard/                # Dashboard components
│   │   ├── usage-card.tsx
│   │   └── resources-card.tsx
│   │
│   ├── billing/                  # Billing components
│   │   ├── account-balance-card.tsx
│   │   ├── add-credits-section.tsx
│   │   ├── auto-pay-section.tsx
│   │   ├── payment-methods-section.tsx
│   │   └── credit-codes-section.tsx
│   │
│   ├── settings/                 # Settings components
│   │   ├── theme-switcher.tsx
│   │   ├── account-information-form.tsx
│   │   ├── connections-section.tsx
│   │   └── api-keys-section.tsx
│   │
│   └── hub/                      # Hub components
│       ├── hub-search-bar.tsx
│       ├── hub-tabs.tsx
│       ├── filter-tabs.tsx
│       ├── pod-template-card.tsx
│       └── pod-template-grid.tsx
│
└── lib/
    └── utils.ts                  # Utility functions (cn helper)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd next-awesome-admin-template
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📄 Pages

### Auth Pages (Public)
| Route | Description |
|-------|-------------|
| `/signin` | Sign in page with social login |
| `/signup` | Sign up page with social login |
| `/forgot-password` | Password reset page |

### Dashboard Pages (Protected)
| Route | Description |
|-------|-------------|
| `/` | Home dashboard with stats, usage chart, and resources |
| `/account/settings` | User settings, theme switcher, connections |
| `/account/billing` | Account balance, payment methods, credits |
| `/account/audit-logs` | View account activity logs |
| `/account/create-team` | Create a new team |
| `/account/refer` | Refer & earn credits |
| `/account/remote-access` | SSH keys and remote access |
| `/hub/pod-templates` | Browse and search pod templates |
| `/hub/serverless-repos` | Browse serverless functions |
| `/hub/public-endpoints` | Browse public API endpoints |
| `/manage/pods` | Manage GPU pods |
| `/manage/serverless` | Manage serverless deployments |
| `/manage/storage` | Manage network storage |
| `/manage/fine-tuning` | Fine-tune AI models |
| `/manage/secrets` | Manage secrets and environment variables |
| `/feedback` | Submit feedback |
| `/help` | Help & resources |
| `/terms` | Terms of service |

## 🎨 Customization

### Adding New Pages

1. Create a new folder in `src/app/`
2. Add a `page.tsx` file
3. Wrap content with `AdminLayout` component

```tsx
import { AdminLayout } from "@/components/layout/admin-layout";

export default function NewPage() {
  return (
    <AdminLayout title="Page Title">
      {/* Your content here */}
    </AdminLayout>
  );
}
```

### Adding New Sidebar Items

Edit `src/components/layout/sidebar/sidebar-data.ts`:

```ts
export const sidebarData: NavSection[] = [
  {
    title: "Section Name",
    items: [
      { title: "Item Name", href: "/path", icon: IconComponent },
    ],
  },
];
```

### Adding shadcn/ui Components

```bash
npx shadcn@latest add [component-name]
```

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start development server |
| `bun run build` | Build for production |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |

## 📝 License

MIT License - feel free to use this template for your projects!

## 🙏 Credits

- Design inspired by [Runpod](https://runpod.io/)
- UI Components by [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
- Testimonial images from [Unsplash](https://unsplash.com/)
