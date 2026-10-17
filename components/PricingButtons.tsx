import Link from "next/link";
/** Compatibility for old page imports. This component can never start checkout. */
export default function PricingButton(_props: { plan?: string; label?: string }) {
  return <Link className="button rose" href="/quiz">Explore for free</Link>;
}
