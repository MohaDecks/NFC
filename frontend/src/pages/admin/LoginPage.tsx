import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAdmin } from "@/hooks/useAdmin";
import { useBranding } from "@/hooks/useBranding";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { friendlyError } from "@/lib/utils";

export function AdminLoginPage() {
  const { admin, loading, login } = useAdmin();
  const { brandName, tagline } = useBranding();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@bravio.local");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && admin) return <Navigate to="/admin" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      toast.error(friendlyError(err, "Could not sign in"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative hidden overflow-hidden bg-[#0b1020] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-10 top-20 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl animate-[sidebar-drift_16s_ease-in-out_infinite]" />
          <div className="absolute right-0 bottom-10 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl animate-[sidebar-drift_22s_ease-in-out_infinite]" />
        </div>
        <BrandLogo showText imgClassName="h-12 w-auto" />
        <div className="relative">
          <p className="text-sm uppercase tracking-[0.22em] text-white/45">Digital Presence Platform</p>
          <h1 className="mt-3 max-w-lg text-5xl font-semibold leading-tight tracking-tight">Create. Connect. Grow.</h1>
          <p className="mt-4 max-w-md text-white/60">
            {brandName} lets administrators create digital profiles, mini websites, NFC cards, and QR codes from one premium workspace.
          </p>
        </div>
        <p className="relative text-sm text-white/35">{tagline}</p>
      </div>
      <div className="flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(21,101,192,0.14),transparent_32%)] px-6 py-12">
        <form className="w-full max-w-sm space-y-4 rounded-3xl border bg-white p-6 shadow-sm" onSubmit={(e) => void onSubmit(e)}>
          <div className="lg:hidden">
            <BrandLogo showText compact imgClassName="h-10 w-auto" />
          </div>
          <h2 className="text-3xl font-semibold tracking-tight">Sign in</h2>
          <p className="text-sm text-muted-foreground">Use your administrator account.</p>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button className="w-full bg-[#1565C0] hover:bg-[#0D47A1]" disabled={busy}>
            {busy ? "Signing in..." : "Enter admin"}
          </Button>
        </form>
      </div>
    </div>
  );
}
