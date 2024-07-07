import DashboardLayout from '#app/components/dashboard/layout/DashboardLayout.js'

export default function Layout({ children }: { children: React.ReactNode }) {
	return <DashboardLayout>{children}</DashboardLayout>
}
