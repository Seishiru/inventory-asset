import { useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Package, Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const LINE_GREEN = '#06C755';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignup: () => void;
}

export function LoginDialog({ open, onOpenChange, onSwitchToSignup }: LoginDialogProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    const success = await login(username, password);
    setLoading(false);

    if (success) {
      toast.success('Login successful!');
      onOpenChange(false);
      setUsername('');
      setPassword('');
    } else {
      toast.error('Invalid username or password');
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content 
          className="dark:bg-gray-900 dark:text-white dark:border-gray-700 bg-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-md"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <div className="flex flex-col gap-2 text-center sm:text-left">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: LINE_GREEN }}>
                <Package className="h-8 w-8 text-white" />
              </div>
            </div>
            <DialogPrimitive.Title className="text-center text-2xl">
              Welcome Back
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="dark:text-gray-300 text-center text-sm text-gray-600">
              Login to access the Asset Inventory
            </DialogPrimitive.Description>
          </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={loading}
              className="dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                className="dark:bg-gray-800 dark:border-gray-700 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="dark:text-gray-400 dark:hover:text-gray-200 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full text-white hover:opacity-90"
              style={{ backgroundColor: LINE_GREEN }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </div>

          <div className="dark:text-gray-300 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="hover:underline"
              style={{ color: LINE_GREEN }}
            >
              Sign up
            </button>
          </div>

          {/* Demo credentials */}
          <div className="dark:bg-gray-800 dark:border-gray-700 mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="dark:text-gray-300 text-xs text-gray-600 mb-2">Demo credentials:</p>
            <div className="text-xs space-y-1">
              <div>
                <strong>Admin:</strong> admin / admin123
              </div>
              <div>
                <strong>IT/OJT:</strong> ituser / it123
              </div>
            </div>
          </div>
        </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
