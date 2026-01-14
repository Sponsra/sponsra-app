"use client";

import { useSearchParams } from "next/navigation";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import Link from "next/link";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="flex flex-column align-items-center justify-content-center min-h-screen surface-ground p-4">
      <Card className="text-center shadow-4 p-4" style={{ maxWidth: "500px" }}>
        <div className="flex justify-content-center mb-4">
          <div
            className="flex align-items-center justify-content-center bg-green-100 border-circle"
            style={{ width: "80px", height: "80px" }}
          >
            <i className="pi pi-check text-green-500 text-4xl"></i>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2 text-900">
          Payment Successful!
        </h1>
        <p className="text-600 mb-4 line-height-3">
          Your ad slot has been reserved. The creator has been notified and will
          review your assets shortly.
        </p>

        <div className="surface-100 p-3 border-round mb-4 text-sm text-700">
          <span className="font-bold">Transaction ID:</span>
          <br />
          <span className="font-mono text-xs">
            {sessionId || "Processing..."}
          </span>
        </div>

        <Link href="/" style={{ textDecoration: "none" }}>
          <Button label="Return to Home" icon="pi pi-home" />
        </Link>
      </Card>
    </div>
  );
}
