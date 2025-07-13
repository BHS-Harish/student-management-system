"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { registerTeacher, loginTeacher, autoAuthenticate } from "@/services/service";
import { toast } from "sonner";


const Page = () => {

  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const result = await autoAuthenticate();
        if (result.success===true) {
          // Redirect or perform any action if authenticated
          router.push('/dashboard');
        }
      } catch (err) {
        // Not authenticated, stay on login/register
      }
    }
    checkAuth();
  }, []);

  const [showLogin, setShowLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regDepartment, setRegDepartment] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regError, setRegError] = useState("");

  // Validation helpers
  const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
  const validatePhone = (phone) => /^\d{10}$/.test(phone);

  // Login submit
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    if (!validateEmail(loginEmail)) {
      setLoginError("Please enter a valid email.");
      return;
    }
    if (!loginPassword || loginPassword.length < 6) {
      setLoginError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const result = await loginTeacher({ email: loginEmail, password: loginPassword });
    if (result.success === true) {
      toast.success("Login successful!");
      setLoading(false);
      setLoginEmail("");
      setLoginPassword("");
      // Redirect or perform any other action after successful login
      router.push('/dashboard'); // Redirect to dashboard or any other page
    } else {
      setLoginError(result.error || "Login failed.");
      toast.error(result.error || "Login failed.");
      setLoading(false);
    }
  };

  // Register submit
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError("");
    if (!regName.trim()) {
      setRegError("Name is required.");
      return;
    }
    if (!validateEmail(regEmail)) {
      setRegError("Please enter a valid email.");
      return;
    }
    if (!validatePhone(regPhone)) {
      setRegError("Phone must be 10 digits.");
      return;
    }
    if (!regDepartment.trim()) {
      setRegError("Department is required.");
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setRegError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const result = await registerTeacher({
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
      department: regDepartment
    })
    if (result.success === true) {
      toast.success("Teacher registered successfully!");
      setLoading(false);
      setRegName("");
      setRegEmail("");
      setRegPhone("");
      setRegDepartment("");
      setRegPassword("");
    }
    else {
      toast.error(result.error);
      setLoading(false);
    }

  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="mb-6 flex gap-4">
        <Button className={'cursor-pointer'} variant={showLogin ? "default" : "outline"} onClick={() => setShowLogin(true)}>
          Login
        </Button>
        <Button className={'cursor-pointer'} variant={!showLogin ? "default" : "outline"} onClick={() => setShowLogin(false)}>
          Register
        </Button>
      </div>

      {showLogin ? (
        <Card className="w-full max-w-sm mb-4">
          <CardHeader className="text-xl font-bold text-center">Teacher Login</CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <Input type="email" placeholder="Email" className="mb-2" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
              </div>
              <div className="mb-6">
                <Input type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
              </div>
              {loginError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">Login</Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-sm mb-4">
          <CardHeader className="text-xl font-bold text-center">Teacher Register</CardHeader>
          <CardContent>
            <form onSubmit={handleRegister}>
              <div className="mb-4">
                <Input type="text" placeholder="Name" className="mb-2" value={regName} onChange={e => setRegName(e.target.value)} />
              </div>
              <div className="mb-4">
                <Input type="email" placeholder="Email" className="mb-2" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
              </div>
              <div className="mb-4">
                <Input type="text" placeholder="Phone" className="mb-2" value={regPhone} onChange={e => setRegPhone(e.target.value)} />
              </div>
              <div className="mb-4">
                <Select value={regDepartment} onValueChange={setRegDepartment}>
                  <SelectTrigger className="w-full mb-2">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mb-6">
                <Input type="password" placeholder="Password" value={regPassword} onChange={e => setRegPassword(e.target.value)} />
              </div>
              {regError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{regError}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">{loading ? "Registering..." : "Register"}</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Page;
