import { PricingTable } from '@clerk/nextjs'

export default function Page() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1rem', height: '100vh' }}>
      <PricingTable />
    </div>
  )
}