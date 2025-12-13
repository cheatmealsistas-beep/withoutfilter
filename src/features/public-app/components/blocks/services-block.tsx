'use client';

import {
  Sparkles,
  Zap,
  Heart,
  Star,
  Shield,
  Target,
  Rocket,
  Users,
  Briefcase,
  Building2,
  CreditCard,
  DollarSign,
  ShoppingCart,
  Store,
  Wallet,
  Receipt,
  Mail,
  MessageCircle,
  Phone,
  Send,
  Bell,
  Megaphone,
  Palette,
  PenTool,
  Camera,
  Image,
  Layers,
  Wand2,
  Brush,
  BookOpen,
  GraduationCap,
  Lightbulb,
  Brain,
  Award,
  Trophy,
  HeartPulse,
  Stethoscope,
  Dumbbell,
  Apple,
  Flower2,
  Code,
  Cpu,
  Globe,
  Smartphone,
  Monitor,
  Settings,
  Terminal,
  Database,
  Leaf,
  Sun,
  Moon,
  Cloud,
  Mountain,
  TreeDeciduous,
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
  type LucideIcon,
} from 'lucide-react';
import type { ServicesContent } from '@/shared/types/page-blocks';

interface ServicesBlockProps {
  content: ServicesContent;
  primaryColor: string;
}

const iconMap: Record<string, LucideIcon> = {
  Sparkles,
  Zap,
  Heart,
  Star,
  Shield,
  Target,
  Rocket,
  Users,
  Briefcase,
  Building2,
  CreditCard,
  DollarSign,
  ShoppingCart,
  Store,
  Wallet,
  Receipt,
  Mail,
  MessageCircle,
  Phone,
  Send,
  Bell,
  Megaphone,
  Palette,
  PenTool,
  Camera,
  Image,
  Layers,
  Wand2,
  Brush,
  BookOpen,
  GraduationCap,
  Lightbulb,
  Brain,
  Award,
  Trophy,
  HeartPulse,
  Stethoscope,
  Dumbbell,
  Apple,
  Flower2,
  Code,
  Cpu,
  Globe,
  Smartphone,
  Monitor,
  Settings,
  Terminal,
  Database,
  Leaf,
  Sun,
  Moon,
  Cloud,
  Mountain,
  TreeDeciduous,
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

export function ServicesBlock({ content, primaryColor }: ServicesBlockProps) {
  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Sparkles;
    return <IconComponent className="h-8 w-8" />;
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {(content.headline || content.subheadline) && (
          <div className="text-center mb-16">
            {content.headline && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{content.headline}</h2>
            )}
            {content.subheadline && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {content.subheadline}
              </p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {content.services.map((service) => (
            <div
              key={service.id}
              className="p-6 rounded-2xl border bg-card hover:shadow-lg transition-shadow"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {getIcon(service.icon)}
              </div>
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              {service.description && (
                <p className="text-muted-foreground">{service.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
