"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import { getCurrentUser, loginCustomer } from "@/lib/api/auth";
import { setAuthToken } from "@/lib/auth-client";
import { useAuth } from "@/lib/auth-context";
import { setAuthTokenCookie } from "@/lib/actions/auth";

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

	return "Unable to sign in. Please try again.";
}

export default function LoginPage() {
	const router = useRouter();
	const { updateAuthState, setProfile } = useAuth();
	const [email, setEmail] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
	const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
	const [isPending, startTransition] = React.useTransition();

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setStatusMessage(null);
		setErrorMessage(null);

		startTransition(async () => {
			try {
				const token = await loginCustomer({ email, password });
				// Persist the token for future authenticated requests
				// Store in localStorage for client-side access
				setAuthToken(token.access_token);
				// Store in cookie for server-side access
				await setAuthTokenCookie(token.access_token);
				// Fetch profile and store locally for role-aware UI
				const profile = await getCurrentUser();
				setProfile(profile);
				// Update auth state immediately to trigger header refresh
				updateAuthState();
				setStatusMessage("Signed in successfully. Redirecting...");
				setPassword("");
				
				// Redirect to home page
				setTimeout(() => {
					router.push("/");
				}, 500);
			} catch (error) {
				setErrorMessage(extractErrorMessage(error));
			}
		});
	};

	return (
		<div className="mx-auto flex w-full max-w-md flex-col gap-8">
			<div className="space-y-2 text-center">
				<span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
					<LogIn className="h-6 w-6" />
				</span>
				<h1 className="text-3xl font-semibold tracking-tight">Sign in to AWE</h1>
				<p className="text-sm text-muted-foreground">Access your saved carts, order history, and tailored recommendations.</p>
			</div>

			<Card className="border-border/80">
				<CardHeader>
					<CardTitle>Welcome back</CardTitle>
					<CardDescription>Enter your email address and password to continue.</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="space-y-5" onSubmit={handleSubmit}>
						<div className="space-y-2">
							<Label htmlFor="email">Email address</Label>
							<Input
								id="email"
								type="email"
								autoComplete="email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								required
								placeholder="you@example.com"
							/>
						</div>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="password">Password</Label>
								<Link href="/auth/forgot-password" className="text-xs font-medium text-primary hover:underline">
									Forgot password?
								</Link>
							</div>
							<PasswordInput
								id="password"
								autoComplete="current-password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								required
								placeholder="Enter your password"
							/>
						</div>
						<Button type="submit" className="w-full" disabled={isPending}>
							{isPending ? "Signing in…" : "Sign in"}
						</Button>
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
					<p>
						New to AWE? <Link href="/auth/register" className="font-medium text-primary hover:underline">Create an account</Link> to unlock faster checkout and warranty tracking.
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
