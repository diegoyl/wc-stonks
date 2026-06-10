import { redirect } from 'next/navigation'

export default function PortfolioSlugRedirect({ params }: { params: Promise<{ slug: string }> }) {
  redirect('/main/portfolios')
}
