'use client';

import { useState } from 'react';
import {
  Sparkles,
  Zap,
  Heart,
  Star,
  Shield,
  Target,
  Rocket,
  Users,
  // Business & Commerce
  Briefcase,
  Building2,
  CreditCard,
  DollarSign,
  ShoppingCart,
  Store,
  Wallet,
  Receipt,
  // Communication
  Mail,
  MessageCircle,
  Phone,
  Send,
  Bell,
  Megaphone,
  // Creative & Design
  Palette,
  PenTool,
  Camera,
  Image,
  Layers,
  Wand2,
  Brush,
  // Education & Learning
  BookOpen,
  GraduationCap,
  Lightbulb,
  Brain,
  Award,
  Trophy,
  // Health & Wellness
  HeartPulse,
  Stethoscope,
  Dumbbell,
  Apple,
  Flower2,
  // Tech & Development
  Code,
  Cpu,
  Globe,
  Smartphone,
  Monitor,
  Settings,
  Terminal,
  Database,
  // Nature & Environment
  Leaf,
  Sun,
  Moon,
  Cloud,
  Mountain,
  TreeDeciduous,
  // Time & Calendar
  Clock,
  Calendar,
  Timer,
  History,
  // Misc Popular
  Check,
  CheckCircle2,
  Gift,
  Key,
  Lock,
  Map,
  MapPin,
  Compass,
  Home,
  Music,
  Video,
  Headphones,
  Coffee,
  Utensils,
  Plane,
  Car,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { cn } from '@/shared/lib/utils';

// Icon categories for better organization
const iconCategories = {
  popular: {
    label: 'Populares',
    icons: ['Star', 'Heart', 'Sparkles', 'Zap', 'Rocket', 'Target', 'Shield', 'Users'],
  },
  business: {
    label: 'Negocios',
    icons: ['Briefcase', 'Building2', 'CreditCard', 'DollarSign', 'ShoppingCart', 'Store', 'Wallet', 'Receipt'],
  },
  communication: {
    label: 'Comunicación',
    icons: ['Mail', 'MessageCircle', 'Phone', 'Send', 'Bell', 'Megaphone'],
  },
  creative: {
    label: 'Creativo',
    icons: ['Palette', 'PenTool', 'Camera', 'Image', 'Layers', 'Wand2', 'Brush'],
  },
  education: {
    label: 'Educación',
    icons: ['BookOpen', 'GraduationCap', 'Lightbulb', 'Brain', 'Award', 'Trophy'],
  },
  health: {
    label: 'Salud',
    icons: ['HeartPulse', 'Stethoscope', 'Dumbbell', 'Apple', 'Flower2'],
  },
  tech: {
    label: 'Tecnología',
    icons: ['Code', 'Cpu', 'Globe', 'Smartphone', 'Monitor', 'Settings', 'Terminal', 'Database'],
  },
  nature: {
    label: 'Naturaleza',
    icons: ['Leaf', 'Sun', 'Moon', 'Cloud', 'Mountain', 'TreeDeciduous'],
  },
  misc: {
    label: 'Otros',
    icons: ['Check', 'CheckCircle2', 'Gift', 'Key', 'Lock', 'Map', 'MapPin', 'Compass', 'Home', 'Clock', 'Calendar', 'Music', 'Video', 'Headphones', 'Coffee', 'Utensils', 'Plane', 'Car'],
  },
};

// Complete icon map
export const iconMap: Record<string, LucideIcon> = {
  // Popular
  Sparkles,
  Zap,
  Heart,
  Star,
  Shield,
  Target,
  Rocket,
  Users,
  // Business
  Briefcase,
  Building2,
  CreditCard,
  DollarSign,
  ShoppingCart,
  Store,
  Wallet,
  Receipt,
  // Communication
  Mail,
  MessageCircle,
  Phone,
  Send,
  Bell,
  Megaphone,
  // Creative
  Palette,
  PenTool,
  Camera,
  Image,
  Layers,
  Wand2,
  Brush,
  // Education
  BookOpen,
  GraduationCap,
  Lightbulb,
  Brain,
  Award,
  Trophy,
  // Health
  HeartPulse,
  Stethoscope,
  Dumbbell,
  Apple,
  Flower2,
  // Tech
  Code,
  Cpu,
  Globe,
  Smartphone,
  Monitor,
  Settings,
  Terminal,
  Database,
  // Nature
  Leaf,
  Sun,
  Moon,
  Cloud,
  Mountain,
  TreeDeciduous,
  // Misc
  Check,
  CheckCircle2,
  Gift,
  Key,
  Lock,
  Map,
  MapPin,
  Compass,
  Home,
  Clock,
  Calendar,
  Timer,
  History,
  Music,
  Video,
  Headphones,
  Coffee,
  Utensils,
  Plane,
  Car,
};

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  primaryColor?: string;
}

export function IconPicker({ value, onChange, primaryColor = '#6366f1' }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<keyof typeof iconCategories>('popular');

  const SelectedIcon = iconMap[value] || Star;

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 shrink-0"
          style={{ backgroundColor: primaryColor }}
        >
          <SelectedIcon className="h-6 w-6 text-white" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2 border-b">
          <div className="flex flex-wrap gap-1">
            {Object.entries(iconCategories).map(([key, { label }]) => (
              <Button
                key={key}
                variant={activeCategory === key ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setActiveCategory(key as keyof typeof iconCategories)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
        <div className="p-2 max-h-48 overflow-y-auto">
          <div className="grid grid-cols-6 gap-1">
            {iconCategories[activeCategory].icons.map((iconName) => {
              const Icon = iconMap[iconName];
              if (!Icon) return null;
              return (
                <Button
                  key={iconName}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-10 w-10',
                    value === iconName && 'bg-primary/10 ring-1 ring-primary'
                  )}
                  onClick={() => handleSelect(iconName)}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
