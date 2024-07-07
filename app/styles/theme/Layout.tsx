import DashboardLayout from '@/components/dashboard/layout/dashboard-layout.js'

export default function Layout({ children }: { children: React.ReactNode }) {
	return <DashboardLayout>{children}</DashboardLayout>
}
