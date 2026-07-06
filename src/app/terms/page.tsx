import { AdminLayout } from "@/components/layout/admin-layout";

export default function TermsPage() {
  return (
    <AdminLayout title="Terms of Service">
      <div className="prose prose-invert max-w-3xl">
        <h1>Terms of Service</h1>
        <p className="text-muted-foreground">
          Last updated: January 11, 2026
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using PodCat services, you agree to be bound by these
          Terms of Service and all applicable laws and regulations.
        </p>

        <h2>2. Use of Services</h2>
        <p>
          You may use our services only for lawful purposes and in accordance
          with these Terms. You agree not to use our services in any way that
          violates any applicable law or regulation.
        </p>

        <h2>3. Account Registration</h2>
        <p>
          To access certain features of our services, you must register for an
          account. You agree to provide accurate, current, and complete
          information during the registration process.
        </p>

        <h2>4. Privacy</h2>
        <p>
          Your use of our services is also governed by our Privacy Policy.
          Please review our Privacy Policy to understand our practices.
        </p>

        <h2>5. Contact</h2>
        <p>
          If you have any questions about these Terms, please contact us at
          support@podcat.io
        </p>
      </div>
    </AdminLayout>
  );
}
