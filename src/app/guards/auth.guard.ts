import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * /auth/* dışındaki tüm sayfalar için: authReady olana kadar bekler (sayfa
 * yenilemede auth state henüz çözülmemiş olabilir), sonra hiç oturum yoksa
 * (misafir/anonim oturum da geçerli sayılır) /auth/login'e yönlendirir.
 */
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.authReady()) {
    await new Promise<void>(resolve => {
      const check = () => {
        if (auth.authReady()) resolve();
        else setTimeout(check, 50);
      };
      check();
    });
  }

  if (auth.user()) return true;
  return router.createUrlTree(['/auth/login']);
};
