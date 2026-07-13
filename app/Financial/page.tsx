import { TrendingUp, Clock } from "lucide-react";
import Header from "@/Components/Header";
import StatCard from "@/Components/Statcard";
import TransactionLedger from "@/Components/TransactionLedger";
import InvoiceAuditStream from "@/Components/InvoiceAuditStream";
import GenerateInvoiceForm from "@/Components/GenerateInvoiceForm";

export default function FinancialPage() {
  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      <Header />
      <main className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-8 py-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <StatCard
              icon={TrendingUp}
              iconBg="#DCFCE7"
              iconColor="#16A34A"
              label="Gross Settled Revenue"
              value="$2500.00"
            />
            <StatCard
              icon={Clock}
              iconBg="#FEF3C7"
              iconColor="#D97706"
              label="Pending Receivables"
              value="$0.00"
            />
          </div>
          <TransactionLedger />
          <InvoiceAuditStream />
        </div>
        <div>
          <GenerateInvoiceForm />
        </div>
      </main>
    </div>
  );
}