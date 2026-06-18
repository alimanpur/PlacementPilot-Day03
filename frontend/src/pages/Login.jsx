import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Button, Input } from "../components/ui/index.jsx";
import { AuthLayout } from "../components/AuthLayout.jsx";

const schema = z.object({
  email:    z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
});

export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(data) {
    try {
      console.log("[LOGIN REQUEST]", { email: data.email });
      const res = await api.post("/auth/login", data);
      console.log("[LOGIN RESPONSE] token:", res.data.token?.slice(0, 20) + "…");
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name.split(" ")[0]}!`);
      navigate("/");
    } catch (err) {
      console.error("[LOGIN ERROR]", err.response?.data);
      toast.error(err.response?.data?.message || "Login failed");
    }
  }

  return (
    <AuthLayout heading="Sign in" sub="Welcome back. Let's get to work.">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Email" type="email" placeholder="you@example.com" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <Input label="Password" type="password" placeholder="••••••••" autoComplete="current-password" error={errors.password?.message} {...register("password")} />
        <Button type="submit" disabled={isSubmitting} className="w-full justify-center mt-1">
          {isSubmitting ? "Signing in…" : "Sign in →"}
        </Button>
      </form>

      <div className="mt-4 p-3 rounded-xl" style={{ background: "#F5F3F0", border: "1px solid var(--color-border)" }}>
        <p className="text-[12px] mb-2" style={{ color: "var(--color-muted)" }}>Try the demo — pre-loaded with 68 DSA problems, 12 applications, and 35 interview questions:</p>
        <button
          type="button"
          onClick={() => { setValue("email", "demo@placementpilot.com"); setValue("password", "12345678"); }}
          className="text-[12px] font-semibold underline"
          style={{ color: "var(--color-primary)" }}
        >
          Fill demo credentials
        </button>
      </div>

      <p className="text-center text-sm mt-5" style={{ color: "var(--color-muted)" }}>
        No account?{" "}
        <Link to="/register" className="font-semibold underline" style={{ color: "var(--color-primary)" }}>
          Create one free
        </Link>
      </p>
    </AuthLayout>
  );
}
