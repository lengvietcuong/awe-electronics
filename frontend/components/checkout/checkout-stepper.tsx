import { cn } from "@/lib/utils";

const steps = [
  { label: "Contact" },
  { label: "Delivery" },
  { label: "Payment" },
  { label: "Review" },
];

export interface CheckoutStepperProps {
  currentStep?: number;
}

export function CheckoutStepper({ currentStep = 1 }: CheckoutStepperProps) {
  return (
    <ol className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground sm:gap-6">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;

        return (
          <li key={step.label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold",
                isCompleted && "border-primary bg-primary text-primary-foreground",
                isActive && !isCompleted && "border-primary text-primary",
                !isActive && !isCompleted && "border-border/70",
              )}
            >
              {stepNumber}
            </span>
            <span className={cn(isActive ? "text-foreground" : "")}>{step.label}</span>
            {index !== steps.length - 1 ? <span className="mx-1 text-border">/</span> : null}
          </li>
        );
      })}
    </ol>
  );
}
