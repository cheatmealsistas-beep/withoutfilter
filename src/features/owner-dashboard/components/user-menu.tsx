'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { User, Settings, LogOut, CreditCard } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { logoutAction } from '@/features/auth/auth.actions';

interface UserMenuProps {
  user: {
    id: string;
    email?: string;
    avatar?: string;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const params = useParams();
  const locale = params.locale as string;

  const initials = user.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="px-3 py-2 border-t">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start h-auto py-2 px-3 hover:bg-primary/10"
          >
            <Avatar className="h-8 w-8 mr-3">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="text-left min-w-0 flex-1">
              <p className="text-sm truncate">{user.email}</p>
            </div>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-[220px]">
          <DropdownMenuItem asChild>
            <Link
              href={`/${locale}/my-account`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <User className="h-4 w-4" />
              <span>Mi cuenta</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href={`/${locale}/my-account`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <CreditCard className="h-4 w-4" />
              <span>Facturación</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <form action={logoutAction} className="w-full">
              <input type="hidden" name="locale" value={locale} />
              <button
                type="submit"
                className="flex items-center gap-2 w-full text-left text-destructive"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar sesión</span>
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
