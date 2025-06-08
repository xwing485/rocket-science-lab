import { useState } from 'react';
import { Rocket, BookOpen, Wrench, Play, Trophy, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const Navigation = ({ currentSection, onSectionChange }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Mission Control', icon: Rocket },
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'build', label: 'Build', icon: Wrench },
    { id: 'simulate', label: 'Launch', icon: Play },
    { id: 'progress', label: 'Progress', icon: Trophy },
  ];

  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Rocket className="h-8 w-8 text-primary mr-2" />
              <span className="text-xl font-bold text-foreground">Academy</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentSection === item.id ? "default" : "ghost"}
                  className={`flex items-center px-4 py-2 ${
                    currentSection === item.id ? 'bg-primary text-primary-foreground' : ''
                  }`}
                  onClick={() => onSectionChange(item.id)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentSection === item.id ? "default" : "ghost"}
                  className={`w-full justify-start flex items-center px-3 py-2 ${
                    currentSection === item.id ? 'bg-primary text-primary-foreground' : ''
                  }`}
                  onClick={() => {
                    onSectionChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
