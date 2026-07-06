import { AdminLayout } from "@/components/layout";
import {
  AccountBalanceCard,
  AddCreditsSection,
  AutoPaySection,
  PaymentMethodsSection,
  CreditCodesSection,
  type PaymentMethod,
} from "@/components/billing";

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "1",
    type: "mastercard",
    last4: "8690",
    expiryMonth: 9,
    expiryYear: 2030,
    isPrimary: true,
  },
];

export default function BillingPage() {
  return (
    <AdminLayout title="Billing">
      <div className="space-y-6">
        <AccountBalanceCard
          balance={14.81}
          spendLimit={80}
          currentSpendRate={0.0}
        />
        <AddCreditsSection />
        <AutoPaySection />
        <PaymentMethodsSection methods={mockPaymentMethods} />
        <CreditCodesSection />
      </div>
    </AdminLayout>
  );
}
