"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import { registerCustomer } from "@/lib/api/auth";

function extractErrorMessage(error: unknown) {
	if (error instanceof ApiError) {
		if (error.payload && typeof error.payload === "object" && "detail" in error.payload) {
			return String((error.payload as { detail?: unknown }).detail ?? error.statusText);
		}

		return error.statusText;
	}

	if (error instanceof Error) {
		return error.message;
	}

	return "We couldn\'t create your account. Please check your details and try again.";
}

export default function RegisterPage() {
	const router = useRouter();
	const [firstName, setFirstName] = React.useState("");
	const [lastName, setLastName] = React.useState("");
	const [email, setEmail] = React.useState("");
	const [phone, setPhone] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [confirmPassword, setConfirmPassword] = React.useState("");
	const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
	const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
	const [isPending, startTransition] = React.useTransition();

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setStatusMessage(null);
		setErrorMessage(null);

		if (password !== confirmPassword) {
			setErrorMessage("Passwords do not match. Please double-check and try again.");
			return;
		}

		startTransition(async () => {
			try {
				await registerCustomer({
					email,
					password,
					firstName,
					lastName,
					phone: phone.trim() ? phone.trim() : undefined,
				});

				setStatusMessage("Account created successfully. You can now sign in to access your dashboard and order history.");
				setFirstName("");
				setLastName("");
				setEmail("");
				setPhone("");
				setPassword("");
				setConfirmPassword("");

				// Provide a short delay before redirecting so the success message is visible.
				setTimeout(() => {
					router.push("/auth/login");
				}, 1600);
			} catch (error) {
				setErrorMessage(extractErrorMessage(error));
			}
		});
	};

	return (
		<div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
			<div className="space-y-2 text-center">
				<span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
					<UserPlus className="h-6 w-6" />
				</span>
				<h1 className="text-3xl font-semibold tracking-tight">Create your AWE account</h1>
				<p className="text-sm text-muted-foreground">Save delivery addresses, unlock warranty tracking, and manage orders in one place.</p>
			</div>

			<Card className="border-border/80">
				<CardHeader>
					<CardTitle>Let&apos;s get you set up</CardTitle>
					<CardDescription>Provide your contact details so we can tailor updates and support to you.</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
						<div className="space-y-2">
							<Label htmlFor="first-name">First name</Label>
							<Input
								id="first-name"
								value={firstName}
								onChange={(event) => setFirstName(event.target.value)}
								required
								autoComplete="given-name"
								placeholder="Taylor"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="last-name">Last name</Label>
							<Input
								id="last-name"
								value={lastName}
								onChange={(event) => setLastName(event.target.value)}
								required
								autoComplete="family-name"
								placeholder="Lee"
							/>
						</div>
						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="email">Email address</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								required
								autoComplete="email"
								placeholder="you@example.com"
							/>
						</div>
						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="phone">Contact number (optional)</Label>
							<Input
								id="phone"
								type="tel"
								value={phone}
								onChange={(event) => setPhone(event.target.value)}
								autoComplete="tel"
								placeholder="0412 345 678"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<PasswordInput
								id="password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								required
								minLength={8}
								autoComplete="new-password"
								placeholder="At least 8 characters"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirm-password">Confirm password</Label>
							<PasswordInput
								id="confirm-password"
								value={confirmPassword}
								onChange={(event) => setConfirmPassword(event.target.value)}
								required
								minLength={8}
								autoComplete="new-password"
								placeholder="Re-enter your password"
							/>
						</div>
						<div className="md:col-span-2">
							<Button type="submit" className="w-full" disabled={isPending}>
								{isPending ? "Creating account…" : "Create account"}
							</Button>
						</div>
					</form>

					{errorMessage ? (
						<div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive-foreground">
							{errorMessage}
						</div>
					) : null}
					{statusMessage ? (
						<div className="mt-4 rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-700">
							{statusMessage}
						</div>
					) : null}
				</CardContent>
				<CardFooter className="flex-col gap-3 text-sm text-muted-foreground">
					<p className="text-center md:text-left">
						Have an account already? <Link href="/auth/login" className="font-medium text-primary hover:underline">Sign in here</Link> to continue where you left off.
					</p>
					<p className="text-center md:text-left">
						By creating an account you agree to our privacy policy and terms of service. We’ll only use your details to support your orders.
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
