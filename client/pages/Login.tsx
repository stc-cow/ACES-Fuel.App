import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional().default(false),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "", remember: false },
  });

  useEffect(() => {
    const remembered = localStorage.getItem("remember.username");
    if (remembered) {
      setValue("username", remembered);
      setValue("remember", true);
    }
    if (localStorage.getItem("auth.loggedIn") === "true") {
      navigate("/");
    }
  }, [setValue, navigate]);

  const onSubmit = async (values: FormValues) => {
    if (values.remember) {
      localStorage.setItem("remember.username", values.username);
    } else {
      localStorage.removeItem("remember.username");
    }
    localStorage.setItem("auth.loggedIn", "true");
    navigate("/");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#0b1220] via-[#0b1220] to-[#121a2b]">
      <Decor />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
        <Card className="w-full max-w-md border-transparent bg-white/5 shadow-2xl backdrop-blur">
          <CardContent className="p-8">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-3 flex items-center justify-center">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Fbd65b3cd7a86452e803a3d7dc7a3d048%2Fc70031ceb54e448ab66bd6627db55078?format=webp&width=800"
                  alt="ACES"
                  className="h-8 w-auto"
                  loading="eager"
                  decoding="async"
                />
              </div>
              <h1 className="text-lg font-semibold text-white">
                Sign in to Super Admin
              </h1>
              <p className="mt-1 text-xs text-white/60">
                Enter your details to sign in to your account
              </p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Label htmlFor="username" className="text-white/80">
                  Username
                </Label>
                <Input
                  id="username"
                  placeholder="username"
                  autoComplete="username"
                  className="mt-2 bg-white/10 text-white placeholder:text-white/40"
                  {...register("username")}
                />
                {errors.username && (
                  <p className="mt-1 text-xs text-rose-400">
                    {errors.username.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="password" className="text-white/80">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="mt-2 bg-white/10 text-white placeholder:text-white/40"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-rose-400">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-white/70">
                  <Checkbox
                    className="border-white/30 data-[state=checked]:bg-primary"
                    {...register("remember")}
                  />
                  <span className="text-sm">Remember me</span>
                </label>
                <a className="text-sm text-sky-400 hover:underline" href="#">
                  Forgot password?
                </a>
              </div>
              <Button
                type="submit"
                className="w-full bg-sky-600 text-white hover:bg-sky-500"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in…" : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Decor() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-20"
      viewBox="0 0 1200 800"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="50%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#g)" strokeOpacity=".3">
        <path d="M0 700 L300 500 600 650 900 450 1200 600" />
        <path d="M0 500 L250 350 500 500 750 350 1000 500 1200 400" />
        <path d="M0 300 L300 200 600 300 900 200 1200 250" />
      </g>
    </svg>
  );
}
