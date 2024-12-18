import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>("");
  const { forgotPassword, message } = useAuthStore(); 

  const { toast } = useToast();
  const onSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    if (!email.trim()) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    await forgotPassword(email);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      {/* Header Section */}
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          Enter your email to reset your password.
        </CardDescription>
      </CardHeader>

      {/* Content Section */}
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Email Input */}
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full">
            Reset Password
          </Button>
        </form>
      </CardContent>

      {/* Footer Section */}
      <CardFooter className="flex flex-col items-center space-y-2">
        {message && <p className="text-sm text-green-500">{message}</p>}
        <Button variant="link" className="px-0">
          Back to Login
        </Button>
      </CardFooter>
    </Card>
  );
}
