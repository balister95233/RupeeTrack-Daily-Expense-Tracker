import React from 'react';
import {
  ShoppingCart,
  Milk,
  Fuel,
  UtensilsCrossed,
  Coffee,
  Home,
  Zap,
  Wifi,
  Bus,
  BookOpen,
  HeartPulse,
  Shirt,
  Film,
  Plane,
  Sparkles,
  Landmark,
  Receipt,
  Tag,
  Gift,
  Car,
  Briefcase,
  Smartphone,
  GraduationCap,
  Baby,
  Stethoscope,
  Scissors,
  Wrench,
  Dumbbell,
  LucideIcon,
} from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
  ShoppingCart,
  Milk,
  Fuel,
  UtensilsCrossed,
  Coffee,
  Home,
  Zap,
  Wifi,
  Bus,
  BookOpen,
  HeartPulse,
  Shirt,
  Film,
  Plane,
  Sparkles,
  Landmark,
  Receipt,
  Tag,
  Gift,
  Car,
  Briefcase,
  Smartphone,
  GraduationCap,
  Baby,
  Stethoscope,
  Scissors,
  Wrench,
  Dumbbell,
};

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5 text-slate-700', size = 18 }) => {
  const IconComponent = ICON_MAP[name] || Tag;
  return <IconComponent className={className} size={size} />;
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);
