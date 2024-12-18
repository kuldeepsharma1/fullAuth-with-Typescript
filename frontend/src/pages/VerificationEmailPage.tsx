import { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";

export default function VerificationEmailPage() {
  const [value, setValue] = useState<string>(""); 
  const { verifyEmail, isLoading, error} = useAuthStore(); 
  const { toast } = useToast(); 

  const handleSubmit = async (): Promise<void> => {
    if (!value || value.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    await verifyEmail(value);

    if (!error && !isLoading) {
      toast({
        title: "Email Verified",
        description: "Your email has been verified successfully.",
      });
    } else if (error) {
      toast({
        title: "Verification Failed",
        description: error,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-2 flex flex-col w-full mx-auto justify-center">
      {/* OTP Input */}
      <InputOTP
        maxLength={6}
        value={value}
        onChange={(value) => setValue(value)}
      >
        <InputOTPGroup className="mx-auto">
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>

      {/* OTP Status Message */}
      <div className="text-center text-sm">
        {value === "" ? (
          <>Enter your verification email code.</>
        ) : (
          <>You entered: {value}</>
        )}
      </div>

      {/* Verify Email Button */}
      <Button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? "Verifying..." : "Verify Email Now"}
      </Button>
    </div>
  );
}
