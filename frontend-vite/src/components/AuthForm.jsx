import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AuthForm = ({ handleSubmit, email, setEmail, password, setPassword, buttonText }) => {
  return (
    <form onSubmit={handleSubmit} className="grid gap-6 max-w-md w-full mx-auto rounded-lg p-6 shadow-sm">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john.doe@example.com" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="********" />
      </div>

      <Button type="submit" className="w-full">{buttonText}</Button>
    </form>
  );
};

export default AuthForm;