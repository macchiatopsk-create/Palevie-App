"use client";
import { useState } from "react";
import Link from "next/link";

// BIPA / state biometric-law consent gate for the optional selfie scan.
// Illinois BIPA (and similar TX/WA laws) require, BEFORE collecting a face image:
//   1. written notice of WHAT is collected and WHY,
//   2. notice of the RETENTION and DELETION policy,
//   3. explicit written consent (an electronic signature/checkbox is sufficient
//      under Illinois SB2979).
// Using a third-party analyzer (e.g. Perfect Corp) does NOT remove this duty — their
// terms make the operator solely liable — so we implement it here.
//
// Renders nothing once consent is given; calls onConsent() so the parent unlocks the scan.
export default function BiometricConsent({ onConsent }: { onConsent: () => void }) {
  const [notice, setNotice] = useState(false);
  const [retention, setRetention] = useState(false);
  const bothChecked = notice && retention;

  return (
    <div className="biometric-consent">
      <div className="eyebrow">Before your photo scan</div>
      <h2>How your photo is used</h2>

      <div className="consent-facts">
        <div className="cf">
          <span className="cf-ic" aria-hidden="true">🔍</span>
          <div>
            <strong>What we analyze</strong>
            <p>Only visual color and surface qualities of your skin (tone, and — if enabled — a look-based read of oil/dryness) to suggest matching products. We do not identify you, and we do not build a face template or faceprint.</p>
          </div>
        </div>
        <div className="cf">
          <span className="cf-ic" aria-hidden="true">⏱️</span>
          <div>
            <strong>How long it&apos;s kept</strong>
            <p>Your photo is processed for a one-time analysis and is <strong>not stored by Palevie</strong>. If an external analysis provider is used, their system may hold the original image up to 1 hour and the result image up to 24 hours to compute your result, after which it is deleted. We keep only the non-identifying color scores.</p>
          </div>
        </div>
        <div className="cf">
          <span className="cf-ic" aria-hidden="true">🚫</span>
          <div>
            <strong>What we never do</strong>
            <p>No facial recognition, no identity matching, no selling or sharing of your image, no using it to train AI. This is a cosmetic shopping aid, not a medical or biometric identification.</p>
          </div>
        </div>
      </div>

      <label className="consent-check">
        <input type="checkbox" checked={notice} onChange={e => setNotice(e.target.checked)} />
        <span>I have read what is analyzed and why, and I agree to a one-time color analysis of my photo.</span>
      </label>
      <label className="consent-check">
        <input type="checkbox" checked={retention} onChange={e => setRetention(e.target.checked)} />
        <span>I understand the retention &amp; deletion policy above and consent to this use of my image under applicable biometric-privacy laws.</span>
      </label>

      <p className="consent-fineprint">
        Read our full <Link href="/privacy">Privacy Policy</Link>. You can use the free quiz instead — it never uses a photo.
      </p>

      <button className="button rose" disabled={!bothChecked} onClick={onConsent}>
        I consent — continue to photo
      </button>
    </div>
  );
}
