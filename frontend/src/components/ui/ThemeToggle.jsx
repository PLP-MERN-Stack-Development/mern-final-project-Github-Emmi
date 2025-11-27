import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

const ThemeToggle = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-10 h-10 rounded-lg bg-white/10 ${className}`} />
    );
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className={`group relative w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 dark:bg-slate-800 dark:hover:bg-slate-700 border border-white/20 dark:border-slate-600 transition-all duration-300 flex items-center justify-center ${className}`}
      aria-label="Toggle theme"
    >
      {/* Sun Icon - visible in dark mode */}
      <Sun 
        className={`h-5 w-5 text-white transition-all duration-300 ${
          theme === 'dark' 
            ? 'opacity-100 rotate-0 scale-100' 
            : 'opacity-0 rotate-90 scale-0 absolute'
        }`}
      />
      
      {/* Moon Icon - visible in light mode */}
      <Moon 
        className={`h-5 w-5 text-gray-900 dark:text-white transition-all duration-300 ${
          theme === 'light' 
            ? 'opacity-100 rotate-0 scale-100' 
            : 'opacity-0 -rotate-90 scale-0 absolute'
        }`}
      />
    </button>
  );
};

export default ThemeToggle;
