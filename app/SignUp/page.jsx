"use client";
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { GraduationCap, Mail, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import {useRouter } from "next/navigation";
 const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signup, loginWithGoogle } = useAuth();
  const Router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

  //   const success = signup(name, email, password);
  //   if (success) {
  //     toast.success('Account created successfully!');
  //     Router.push('/Dashboard');
  //   } else {
  //     toast.error('Email already exists');
  //   }
  };

  const handleGoogleSignup = () => {
    const success = loginWithGoogle();
    if (success) {
      toast.success('Welcome! Account created with Google');
      Router.push('/Dashboard');
    } else {
      toast.error('Google sign-up failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground transition-colors duration-200 p-4">
      <Card className="w-full max-w-md rounded-xl border border-border bg-card micro-shadow">
        <CardHeader className="space-y-3 text-center pb-6 border-b border-border">
          <div className="mx-auto bg-primary text-white p-3 rounded-lg w-fit">
            <GraduationCap className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-extrabold tracking-tight">Create Account</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Start calculating your CGPA today</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-semibold">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 border-border rounded-lg text-sm h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-border rounded-lg text-sm h-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-border rounded-lg text-sm h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 border-border rounded-lg text-sm h-10"
                />
              </div>
            </div>

            <Button type="submit" className="w-full btn-premium-primary text-sm h-10 rounded-lg mt-2">
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/Login" className="text-primary hover:underline font-bold">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;