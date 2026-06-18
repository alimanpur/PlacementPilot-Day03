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
  name:     z.string().min(2, "Min 2 characters"),
  email:    z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
});

export default function Register() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(data) {
    try {
      console.log("[REGISTER REQUEST]", { name: data.name, email: data.email });
      const res = await api.post("/auth/register", data);
      console.log("[REGISTER RESPONSE] token:", res.data.token?.slice(0, 20) + "…");
      login(res.data.token, res.data.user);
      toast.success(`Welcome, ${res.data.user.name.split(" ")[0]}! 🎉 Your workspace is ready.`);
      navigate("/");
    } catch (err) {
      console.error("[REGISTER ERROR]", err.response?.data);
      toast.error(err.response?.data?.message || "Registration failed");
    }
  }

  return (
    <AuthLayout heading="Create account" sub="Demo data loads automatically — your dashboard will be ready instantly.">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Full name" placeholder="Alex Johnson" autoComplete="name" autoFocus error={errors.name?.message} {...register("name")} />
        <Input label="Email" type="email" placeholder="you@example.com" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <Input label="Password" type="password" placeholder="Min 6 characters" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
        <Button type="submit" disabled={isSubmitting} className="w-full justify-center mt-1">
          {isSubmitting ? "Creating account…" : "Create account →"}
        </Button>
      </form>

      <p className="text-center text-sm mt-5" style={{ color: "var(--color-muted)" }}>
        Already have an account?{" "}
        <Link to="/login" className="font-semibold underline" style={{ color: "var(--color-primary)" }}>
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
