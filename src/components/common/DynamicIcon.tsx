import React from 'react';
import {
  ShoppingBag,
  Globe,
  Layers,
  LayoutDashboard,
  Gauge,
  ShieldCheck,
  Zap,
  Code2,
  Briefcase,
  Clock,
  Lightbulb,
  PenTool,
  TrendingUp,
  FileCode2,
  Atom,
  Palette,
  Server,
  Database,
  HardDrive,
  Shield,
  Cloud,
  Github,
  Linkedin,
  Youtube,
  Twitter,
  MessageSquare,
  Rocket,
  Award,
  Star,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Sparkles,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingBag,
  Globe,
  Layers,
  LayoutDashboard,
  Gauge,
  ShieldCheck,
  Zap,
  Code2,
  Briefcase,
  Clock,
  Lightbulb,
  PenTool,
  TrendingUp,
  FileCode2,
  Atom,
  Palette,
  Server,
  Database,
  HardDrive,
  Shield,
  Cloud,
  Github,
  Linkedin,
  Youtube,
  Twitter,
  X: Twitter,
  Discord: MessageSquare,
  MessageSquare,
  Rocket,
  Award,
  Star,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Sparkles,
};

interface DynamicIconProps {
  name?: string;
  className?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({
  name = 'Code2',
  className = 'w-5 h-5',
}) => {
  const IconComp = ICON_MAP[name] || ICON_MAP[name.trim()] || Code2;
  return <IconComp className={className} />;
};
