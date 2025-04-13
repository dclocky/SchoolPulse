import { useState } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Form schema
const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().optional(),
});

export default function Login() {
  const { login, user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // If user is already logged in, redirect to the appropriate dashboard
  if (user && !authLoading) {
    const route = user.role === 'admin' ? '/admin/dashboard' : '/teacher/dashboard';
    console.log(`User already logged in, redirecting to ${route}`);
    navigate(route);
    return null;
  }

  // Form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    console.log('Login form submitted with:', values.email);
    
    try {
      const success = await login(values.email, values.password);
      console.log('Login result:', success);
      
      if (success) {
        console.log('Login successful via form submit');
        // Don't need to navigate here, the AuthContext useEffect will handle it
      } else {
        console.log('Login failed in form submit handler');
      }
    } catch (error) {
      console.error("Login error in form submit:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <Card className="w-full max-w-md border-none shadow-none">
          <CardContent className="p-0">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
                EduSchedule
              </h1>
              <p className="text-gray-600 mt-2">
                Your school timetable management system
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your.email@school.edu"
                          {...field}
                          disabled={isLoading}
                          autoComplete="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          disabled={isLoading}
                          autoComplete="current-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember-me"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                        <label
                          htmlFor="remember-me"
                          className="text-sm text-gray-700"
                        >
                          Remember me
                        </label>
                      </div>
                    )}
                  />

                  <div className="text-sm">
                    <a
                      href="#"
                      className="font-medium text-primary hover:text-primary/80"
                    >
                      Forgot password?
                    </a>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
                
                {/* Credentials hint */}
                <div className="text-sm text-gray-500 mt-4 text-center">
                  <p>Demo Credentials:</p>
                  <p className="mt-1">Admin: admin@eduschool.com / admin123</p>
                  <p>Teacher: teacher@eduschool.com / teacher123</p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      
      {/* Right side - Hero section */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary/80 to-primary flex-col justify-center p-12 text-white">
        <div>
          <h2 className="text-3xl font-bold mb-4">Simplify School Management</h2>
          <p className="text-lg mb-6">
            Streamline your school's timetables, manage classes, track attendance, and handle teacher substitutions all in one place.
          </p>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Comprehensive timetable management</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Attendance tracking and reporting</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Teacher substitution management</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Class and homework organization</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Data import and export capabilities</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
